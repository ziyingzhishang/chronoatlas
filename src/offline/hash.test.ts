import { describe, expect, it } from 'vitest';
import { sha256Hex, verifySha256 } from './hash';

describe('offline package hashing', () => {
  it('computes the standard SHA-256 digest with Web Crypto', async () => {
    const bytes = new TextEncoder().encode('abc');

    await expect(sha256Hex(bytes)).resolves.toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('rejects content whose digest does not match the release manifest', async () => {
    const bytes = new TextEncoder().encode('tampered');

    await expect(verifySha256(bytes, '0'.repeat(64))).rejects.toThrow(/sha-?256/i);
  });
});
