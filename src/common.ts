import fs from 'fs/promises';
import url from 'url';
import Path from 'path';

import caller from 'caller';
import commentJson from 'comment-json';

import { IntermediateConfigValue } from '.';

export const environmentPatterns: Record<string, RegExp> = {
  development: /^dev/i,
  test: /^test/i,
  staging: /^stag/i,
  production: /^prod/i,
};

export function isAbsolutePath(path?: string) {
  if (typeof path === 'string') {
    const normalized = Path.normalize(path);
    return normalized === Path.resolve(normalized);
  }
  return false;
}

export function isObject(o: unknown) {
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
  let callingFilePath = caller();
  let file = path;

  /**
   * When this module is required from esm, then caller()
   * returns a path that's prefixed by `file:`.
   * We need to remove it to avoid breakage.
   */
  if (callingFilePath.startsWith('file:')) {
    callingFilePath = url.fileURLToPath(callingFilePath);
  }

  // on some occasions file is passed in with file prefix
  if (file.startsWith('file:')) {
    file = url.fileURLToPath(file);
  }

  let root = Path.resolve(callingFilePath);
  root = Path.dirname(root);

  let abs = Path.resolve(root, file);
  abs = require.resolve(abs);

  const content = await fs.readFile(abs, 'utf-8');
  return commentJson.parse(content) as IntermediateConfigValue;
}
