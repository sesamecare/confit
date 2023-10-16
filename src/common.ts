import fs from 'fs/promises';
import Path from 'path';

import commentJson from 'comment-json';

export const environmentPatterns: Record<string, RegExp> = {
  development: /^dev/i,
  test: /^test/i,
  staging: /^stag/i,
  production: /^prod/i,
};

export function isAbsolutePath(path: string) {
  if (typeof path === 'string') {
    const normalized = Path.normalize(path);
    return normalized === Path.resolve(normalized);
  }
  return false;
}

function isObject(o: unknown) {
  return o !== null && typeof o === 'object' && !Array.isArray(o);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function merge(src: any, dest: any) {
  // NOTE: Do not merge arrays and only merge objects into objects. Do not merge special objects created from custom Classes.
  if (
    !Array.isArray(src) &&
    isObject(src) &&
    isObject(dest) &&
    Object.getPrototypeOf(src) === Object.prototype
  ) {
    for (const prop of Object.getOwnPropertyNames(src)) {
      const descriptor = Object.getOwnPropertyDescriptor(src, prop);
      if (descriptor) {
        descriptor.value = merge(descriptor.value, dest[prop]);
        Object.defineProperty(dest, prop, descriptor);
      }
    }
    return dest;
  }

  return src;
}

export async function loadJsonc(path: string) {
  const content = await fs.readFile(path, 'utf-8');
  return commentJson.parse(content);
}
