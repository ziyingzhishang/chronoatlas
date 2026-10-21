export interface NavigationHistory<T> {
  push(value: T): void;
  back(): T | undefined;
  peek(): T | undefined;
  canBack(): boolean;
  clear(): void;
}

export function createNavigationHistory<T>(limit = 20): NavigationHistory<T> {
  const entries: T[] = [];
  const maxEntries = Math.max(1, Math.floor(limit));

  return {
    push(value) {
      if (Object.is(entries.at(-1), value)) return;
      entries.push(value);
      if (entries.length > maxEntries) entries.shift();
    },
    back() {
      return entries.pop();
    },
    peek() {
      return entries.at(-1);
    },
    canBack() {
      return entries.length > 0;
    },
    clear() {
      entries.length = 0;
    },
  };
}
