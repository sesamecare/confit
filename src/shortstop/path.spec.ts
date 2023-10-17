import Path from 'path';

import { expect, test } from 'vitest';

import { path } from './path';

test('path shortstop handler', () => {
  expect(typeof path).toBe('function');
  expect(path.length).toBe(1);

  const handler = path();
  // Default dirname
  expect(typeof handler).toBe('function');
  expect(handler.length).toBe(1);

  // Absolute path
  expect(handler(__filename)).toBe(__filename);

  // Relative Path
  expect(handler(Path.basename(__filename))).toBe(__filename);

  const specHandler = path(__dirname);
  expect(typeof specHandler).toBe('function');
  expect(specHandler.length).toBe(1);

  // Absolute path
  expect(specHandler(__filename)).toBe(__filename);

  // Relative Path
  expect(specHandler(Path.basename(__filename))).toBe(__filename);
});
