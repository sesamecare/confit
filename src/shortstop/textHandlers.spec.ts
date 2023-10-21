import { describe, test, expect } from 'vitest';

import { base64Handler, bufferHandler, unsetHandler } from '.';

describe('textHandlers', () => {
  test('base64', () => {
    const handler = base64Handler();
    expect(handler('aGVsbG8gd29ybGQ=')).toBeInstanceOf(Buffer);
    expect(handler('aGVsbG8gd29ybGQ=')).toEqual(Buffer.from('hello world'));
    expect(handler('aGVsbG8gd29ybGQ=|utf8')).toBe('hello world');
  });

  test('base64url', () => {
    const handler = bufferHandler('base64url');
    expect(handler('aGVsbG8gd29ybGQ')).toBeInstanceOf(Buffer);
    expect(handler('aGVsbG8gd29ybGQ')).toEqual(Buffer.from('hello world'));
    expect(handler('aGVsbG8gd29ybGQ|utf8')).toBe('hello world');
  });

  test('unset', () => {
    const handler = unsetHandler();
    expect(handler()).toBeUndefined();
  });
});
