export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const source = bytes.buffer instanceof ArrayBuffer
    ? bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
    : new Uint8Array(bytes).buffer;
  const digest = await globalThis.crypto.subtle.digest('SHA-256', source);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function verifySha256(bytes: Uint8Array, expected: string): Promise<void> {
  const actual = await sha256Hex(bytes);
  if (actual !== expected.toLowerCase()) {
    throw new Error(`SHA-256 mismatch: expected ${expected}, got ${actual}`);
  }
}
