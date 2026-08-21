import Path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import {
  fileHandler,
  globHandler,
  pathHandler,
  requireHandler,
  yamlHandler,
} from './fileHandlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);

describe('file related shortstop handlers', () => {
  test('path shortstop handler', () => {
    expect(typeof pathHandler).toBe('function');
    expect(pathHandler.length).toBe(1);

    const handler = pathHandler();
    // Default dirname
    expect(typeof handler).toBe('function');
    expect(handler.length).toBe(1);

    // Absolute path
    expect(handler(__filename)).toBe(__filename);

    // Relative Path
    expect(handler(Path.basename(__filename))).toBe(__filename);

    const specHandler = pathHandler(__dirname);
    expect(typeof specHandler).toBe('function');
    expect(specHandler.length).toBe(1);

    // Absolute path
    expect(specHandler(__filename)).toBe(__filename);

    // Relative Path
    expect(specHandler(Path.basename(__filename))).toBe(__filename);
  });

  test('yaml shortstop handler', async () => {
    const handler = yamlHandler(Path.join(__dirname, '..', '..', '__tests__', 'yaml'));

    expect(() => handler('good.yaml')).not.toThrow();
    await expect(handler('bad.yaml')).rejects.toThrow();
    await expect(handler('good.yaml')).resolves.toMatchInlineSnapshot(`
      {
        "root": {
          "key": "value",
        },
      }
    `);
  });

  test('glob shortstop handler', async () => {
    const basedir = Path.join(__dirname, '..', '..', '__tests__', 'yaml');
    const handler = globHandler(basedir);
    expect(typeof handler).toBe('function');
    expect(handler.length).toBe(1);

    let matches = await handler('**/*.js');
    expect(matches?.length).toBe(0);
    matches = await handler('**/*.yaml');
    expect(matches?.length).toBe(2);
    matches = await handler('bad*');
    expect(matches?.length).toBe(1);
    expect(matches[0]).toBe(Path.join(basedir, 'bad.yaml'));
  });

  test('file shortstop handler', async () => {
    const basedir = Path.join(__dirname, '..', '..', '__tests__', 'yaml');
    const handler = fileHandler(basedir);
    expect(await handler('good.yaml')).toBeInstanceOf(Buffer);
    expect(await handler('good.yaml|utf8')).toBeTypeOf('string');
  });

  test('require shortstop handler', () => {
    const handler = requireHandler(__dirname);

    expect(handler('../../package.json')).toMatchObject({ name: '@sesamecare-oss/confit' });
  });
});
