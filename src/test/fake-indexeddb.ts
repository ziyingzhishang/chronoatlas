type StoredDatabase = {
  version: number;
  stores: Map<string, Map<IDBValidKey, unknown>>;
  writeTail: Promise<void>;
};

class FakeRequest<T> {
  result!: T;
  error: DOMException | null = null;
  onsuccess: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  succeed(result: T) {
    this.result = result;
    this.onsuccess?.(new Event('success'));
  }

  fail(error: DOMException) {
    this.error = error;
    this.onerror?.(new Event('error'));
  }
}

class FakeTransaction {
  error: DOMException | null = null;
  oncomplete: ((event: Event) => void) | null = null;
  onabort: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  private pending = 0;
  private settled = false;
  private completionScheduled = false;
  private readonly ready: Promise<void>;
  private readonly releaseWrite?: () => void;

  constructor(private readonly data: StoredDatabase, private readonly storeName: string, mode: IDBTransactionMode = 'readonly') {
    if (mode === 'readwrite') {
      this.ready = data.writeTail;
      let releaseWrite!: () => void;
      const lock = new Promise<void>((resolve) => { releaseWrite = resolve; });
      data.writeTail = data.writeTail.then(() => lock);
      this.releaseWrite = releaseWrite;
    } else {
      this.ready = Promise.resolve();
    }
  }

  objectStore(name: string) {
    if (name !== this.storeName || !this.data.stores.has(name)) throw new DOMException('Object store not found', 'NotFoundError');
    const records = this.data.stores.get(name)!;
    const run = <T>(operation: () => T) => {
      const request = new FakeRequest<T>();
      this.pending += 1;
      queueMicrotask(async () => {
        await this.ready;
        if (this.settled) return;
        try {
          request.succeed(operation());
        } catch (error) {
          const failure = error instanceof DOMException ? error : new DOMException(String(error), 'UnknownError');
          request.fail(failure);
          this.error = failure;
          this.onerror?.(new Event('error'));
        } finally {
          this.pending -= 1;
          this.maybeComplete();
        }
      });
      return request;
    };
    return {
      get: (key: IDBValidKey) => run(() => structuredClone(records.get(key))),
      getAll: () => run(() => [...records.values()].map((value) => structuredClone(value))),
      put: (value: unknown, key: IDBValidKey) => run(() => {
        records.set(key, structuredClone(value));
        return key;
      }),
      delete: (key: IDBValidKey) => run(() => { records.delete(key); return undefined; }),
    };
  }

  abort() {
    if (this.settled) return;
    this.settled = true;
    this.error = new DOMException('Transaction aborted', 'AbortError');
    this.releaseWrite?.();
    queueMicrotask(() => this.onabort?.(new Event('abort')));
  }

  private maybeComplete() {
    if (this.pending !== 0 || this.settled || this.error || this.completionScheduled) return;
    this.completionScheduled = true;
    setTimeout(() => {
      this.completionScheduled = false;
      if (this.pending !== 0 || this.settled || this.error) return;
      this.settled = true;
      this.releaseWrite?.();
      this.oncomplete?.(new Event('complete'));
    }, 0);
  }
}

class FakeDatabase {
  constructor(readonly name: string, readonly version: number, private readonly data: StoredDatabase) {}

  get objectStoreNames() {
    const names = [...this.data.stores.keys()];
    return Object.assign(names, { contains: (name: string) => names.includes(name) });
  }

  createObjectStore(name: string) {
    if (this.data.stores.has(name)) throw new DOMException('Object store exists', 'ConstraintError');
    this.data.stores.set(name, new Map());
    return {};
  }

  transaction(storeName: string, mode: IDBTransactionMode = 'readonly') {
    return new FakeTransaction(this.data, storeName, mode);
  }

  close() {}
}

class FakeOpenRequest extends FakeRequest<IDBDatabase> {
  onupgradeneeded: ((event: IDBVersionChangeEvent) => void) | null = null;
  transaction: IDBTransaction | null = null;
}

export class FakeIndexedDbFactory {
  private readonly databases = new Map<string, StoredDatabase>();

  open(name: string, version?: number) {
    const request = new FakeOpenRequest();
    queueMicrotask(() => {
      const current = this.databases.get(name);
      const requestedVersion = version ?? current?.version ?? 1;
      if (current && requestedVersion < current.version) {
        request.fail(new DOMException('Requested version is older than the existing database', 'VersionError'));
        return;
      }
      const upgrading = !current || requestedVersion > current.version;
      const data = current ?? { version: requestedVersion, stores: new Map(), writeTail: Promise.resolve() };
      const oldVersion = current?.version ?? 0;
      data.version = requestedVersion;
      this.databases.set(name, data);
      const database = new FakeDatabase(name, requestedVersion, data);
      request.result = database as unknown as IDBDatabase;
      if (upgrading) {
        const transaction = new FakeTransaction(data, 'state');
        request.transaction = transaction as unknown as IDBTransaction;
        const event = new Event('upgradeneeded') as IDBVersionChangeEvent;
        Object.defineProperties(event, {
          oldVersion: { value: oldVersion },
          newVersion: { value: requestedVersion },
        });
        request.onupgradeneeded?.(event);
      }
      request.succeed(database as unknown as IDBDatabase);
    });
    return request as unknown as IDBOpenDBRequest;
  }

  deleteDatabase(name: string) {
    const request = new FakeRequest<undefined>();
    queueMicrotask(() => {
      this.databases.delete(name);
      request.succeed(undefined);
    });
    return request as unknown as IDBOpenDBRequest;
  }

  asFactory() {
    return this as unknown as IDBFactory;
  }
}
