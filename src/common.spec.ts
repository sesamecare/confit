import { describe, expect, test } from 'vitest';

import * as common from './common';

describe('isAbsolute', () => {
  test('should validate absolute paths', () => {
    expect(common.isAbsolutePath(__dirname)).toBe(true);
    expect(common.isAbsolutePath(__filename)).toBe(true);
  });

  test('should invalidate relative paths and other types', () => {
    expect(common.isAbsolutePath('./foo.js')).toBe(false);
    expect(common.isAbsolutePath('foo.js')).toBe(false);
    expect(common.isAbsolutePath()).toBe(false);
    expect(common.isAbsolutePath(0 as unknown as string)).toBe(false);
    expect(common.isAbsolutePath(1 as unknown as string)).toBe(false);
    expect(common.isAbsolutePath(true as unknown as string)).toBe(false);
    expect(common.isAbsolutePath(false as unknown as string)).toBe(false);
    expect(common.isAbsolutePath({} as unknown as string)).toBe(false);
  });
});

describe('merge', () => {
  test('should merge objects', () => {
    const src = { a: 'a' };
    const dest = {};

    common.merge(src, dest);
    expect(src).not.toBe(dest);
    expect(src).toEqual(dest);
  });

  test('should overwrite properties in dest', () => {
    const src = { a: 'a' };
    const dest = { a: 'b' };

    common.merge(src, dest);
    expect(src).not.toBe(dest);
    expect(src).toEqual(dest);
  });

  test('should merge without overwriting unmatched keys', () => {
    const src = { a: 'a' } as { a: string; b?: string };
    const dest = { a: 'b', b: 'b' };

    common.merge(src, dest);
    expect(src).not.toBe(dest);
    expect(src).not.toEqual(dest);
    expect(src.a).toBe(dest.a);
    expect(src.b).toBeUndefined();
    expect(dest.b).toBe('b');
  });

  test('should merge nested objects', () => {
    const src = { a: { b: 0, c: [0, 1, 2] } };
    const dest = { a: { b: 1, c: ['a', 'b', 'c', 'd'], d: true } };

    common.merge(src, dest);
    expect(src).not.toBe(dest);
    expect(src).not.toEqual(dest);
    expect(src.a).not.toBe(dest.a);
    expect(src.a.b).toBe(dest.a.b);
    expect(src.a.c).toBe(dest.a.c);
    expect(dest.a.d).toBe(true);
  });
});

describe('merge with existing props', () => {
  test('should merge with existing properties', () => {
    const src = {
      a: {
        foo: false,
      },
    };
    const dest = { a: '[Object object]' };

    expect(() => {
      common.merge(src, dest);
      expect(src.a).toEqual(dest.a);
    }).not.toThrow();
  });
});

describe('merge special objects', () => {
  class TestClass {
    bar?: boolean;
  }

  test('should merge special objects', () => {
    const src = {
      a: {
        foo: false,
      },
      b: new TestClass(),
    };
    src.b['bar'] = true;

    const dest: { b?: TestClass; a?: { foo: boolean } } = {};
    expect(() => {
      common.merge(src, dest);
    }).not.toThrow();

    expect(src).not.toBe(dest);
    expect(src.a).toBe(dest?.a);
    expect(src.b).toBe(dest?.b);
    expect(src.b.bar).toBe(dest?.b?.bar);

    dest.b = new TestClass();
    expect(() => {
      common.merge(src, dest);
    }).not.toThrow();
    expect(src.b).toBe(dest.b);
    expect(src.b.bar).toBe(dest.b.bar);
  });
});
