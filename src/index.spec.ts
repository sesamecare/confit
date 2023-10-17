import path from 'path';

import { afterAll, describe, expect, test } from 'vitest';

import { confit } from './index';

describe('confit', () => {
  const originalEnv = process.env.NODE_ENV;

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  test('should export expected elements', () => {
    expect(typeof confit).toBe('function');
  });

  test('api', async () => {
    const factory = confit();
    const config = await factory.create();
    expect(typeof config.get).toBe('function');
    expect(typeof config.set).toBe('function');
    expect(typeof config.use).toBe('function');
  });

  test('get', async () => {
    //setting process.env.env to development, should not change 'env:env'.
    //This should be ignored and 'env:env' should solely depend on process.env.NODE_ENV
    process.env.env = 'development';

    const config = await confit().create();
    expect(typeof config.get('env'), 'should return object for env').toBe('object');
    expect(typeof config.get('env:env'), 'should return string for env:env').toBe('string');
    expect(
      config.getUntypedValue('env:env:length'),
      'should return undefined for env:env:length',
    ).toBeUndefined();
    expect(typeof config.get('env:development'), 'should return boolean for env:development').toBe(
      'boolean',
    );
    expect(config.getUntypedValue('env:a'), 'should return undefined for env:a').toBeUndefined();
    expect(config.getUntypedValue('a'), 'should return undefined for a').toBeUndefined();
    expect(config.getUntypedValue('a:b'), 'should return undefined for a:b').toBeUndefined();
    expect(config.getUntypedValue('a:b:c'), 'should return undefined for a:b:c').toBeUndefined();
    expect(
      config.getUntypedValue(undefined as unknown as string),
      'should return undefined for undefined key',
    ).toBeUndefined();
    expect(
      config.getUntypedValue(null as unknown as string),
      'should return undefined for null key',
    ).toBeUndefined();
    expect(
      config.getUntypedValue(''),
      'should return undefined for empty string key',
    ).toBeUndefined();
    expect(
      config.getUntypedValue(false as unknown as string),
      'should return undefined for false key',
    ).toBeUndefined();
  });

  test('set', async () => {
    const config = await confit<{
      foo: string;
      new: { thing: string };
      my: { prop: number };
      thing: { isEnabled: boolean };
      another: { obj: { with: string } };
      arr: number[];
    }>().create();
    config.set('foo', 'bar');
    expect(config.get('foo'), 'bar');

    config.setUntyped('foo:bar', 'baz');
    expect(config.get('foo:bar')).toBeUndefined();

    config.set('new:thing', 'foo');
    expect(config.get('new:thing')).toBe('foo');

    config.set('my:prop', 10);
    expect(config.get('my:prop')).toBe(10);

    config.set('thing:isEnabled', true);
    expect(config.get('thing:isEnabled')).toBe(true);

    config.set('thing:isEnabled', false);
    expect(config.get('thing:isEnabled')).toBe(false);

    // Test non-primitives
    config.set('another:obj', { with: 'prop' });
    expect(config.get('another:obj').with).toBe('prop');
    expect(config.get('another:obj:with')).toBe('prop');

    // Try out arrays
    config.set('arr', [0, 1, 2]);
    const val = config.get('arr');
    expect(Array.isArray(val)).toBe(true);
    expect(val[0]).toBe(0);
    expect(val[1]).toBe(1);
    expect(val[2]).toBe(2);

    // Fail to mess with arrays like this
    config.setUntyped('arr:0', 'a');
    expect(config.get('arr')[0]).toBe(0);
  });

  test('use', async () => {
    const config = await confit<{
      foo: { bar: string };
      bar: string;
      arr: (number | string)[];
    }>().create();
    config.use({ foo: { bar: 'baz' } });

    expect(typeof config.get('foo')).toBe('object');
    expect(config.get('foo').bar).toBe('baz');
    expect(config.get('foo:bar')).toBe('baz');

    config.use({ arr: [0, 1, 2] });
    let val = config.get('arr');
    expect(Array.isArray(val)).toBe(true);
    expect(val[0]).toEqual(0);
    expect(val[1]).toEqual(1);
    expect(val[2]).toEqual(2);

    // Arrays are not merged
    config.use({ arr: ['a', 'b', 'c', 'd'] });
    val = config.get('arr');
    expect(Array.isArray(val)).toBe(true);
    expect(val[0]).toBe('a');
    expect(val[1]).toBe('b');
    expect(val[2]).toBe('c');
    expect(val[3]).toBe('d');
  });

  test('import protocol', async () => {
    const basedir = path.join(__dirname, '..', '__tests__', 'import');
    const config = await confit<{
      name: string;
      child: {
        name: string;
        grandchild: {
          name: string;
        };
        grandchildJson: {
          name: string;
        };
      };
    }>({ basedir }).create();
    expect(config.get('name')).toBe('parent');
    expect(config.get('child:name')).toBe('child');
    expect(config.get('child:grandchild:name')).toBe('grandchild');
    expect(config.get('child:grandchildJson:name')).toBe('grandchild');
  });

  test('missing file import', async () => {
    const basedir = path.join(__dirname, '..', '__tests__', 'import');
    await confit({ basedir })
      .addOverride('./missing.json')
      .create()
      .then(() => {
        expect.fail('Should not succeed');
      })
      .catch((error) => {
        expect(error.code).toBe('MODULE_NOT_FOUND');
      });
  });

  test('config protocol', async () => {
    const basedir = path.join(__dirname, '..', '__tests__', 'config');
    const config = await confit<{
      name: string;
      foo: string;
      bar: string;
      baz: string;
      imported: {
        foo: string;
      };
      path: { to: { nested: { value: string } } };
      value: string;
    }>({ basedir }).create();
    expect(config.get('name')).toBe('config');
    expect(config.get('foo')).toBe(config.get('imported:foo'));
    expect(config.get('bar')).toBe(config.get('foo'));
    expect(config.get('path:to:nested:value')).toEqual(config.get('value'));
    expect(config.get('baz')).toEqual(config.get('path:to:nested:value'));
  });

  test('default file import', async () => {
    const basedir = path.join(__dirname, '..', '__tests__', 'import');
    const config = await confit<{
      name: string;
      foo: string;
      child: {
        name: string;
        grandchild: {
          name: string;
        };
      };
    }>({ basedir })
      .addDefault('./default.json')
      .create();
    expect(config.get('name')).toBe('parent');
    expect(config.get('foo')).toBe('bar');
    expect(config.get('child:name')).toBe('child');
    expect(config.get('child:grandchild:name')).toBe('grandchild');
  });

  test('missing config value', async () => {
    const basedir = path.join(__dirname, '..', '__tests__', 'config');
    const config = await confit<{ foo: undefined }>({ basedir })
      .addOverride('./error.json')
      .create();
    expect(config.get('foo')).toBeUndefined();
  });

  test('merge', async () => {
    const basedir = path.join(__dirname, '..', '__tests__', 'defaults');
    const configA = await confit({ basedir }).create();
    const configB = await confit().create();
    expect(() => configA.merge(configB)).not.toThrow();
  });

  test('defaults', async () => {
    // This case should still load the default values
    // even though a 'test.json' file does not exist.
    process.env.NODE_ENV = 'test';

    const basedir = path.join(__dirname, '..', '__tests__', 'defaults');
    const config = await confit<{
      default: string;
      override: string;
    }>({ basedir }).create();

    // File-based overrides
    expect(config.get('default')).toBe('config');
    expect(config.get('override')).toBe('config');

    // Manual overrides
    config.set('override', 'runtime');
    expect(config.get('override')).toBe('runtime');

    config.use({ override: 'literal' });
    expect(config.get('override')).toBe('literal');
  });

  test('overrides', async () => {
    process.env.NODE_ENV = 'dev';

    const basedir = path.join(__dirname, '..', '__tests__', 'defaults');
    const config = await confit<{
      default: string;
      override: string;
    }>({ basedir }).create();
    // File-based overrides
    expect(config.get('default')).toBe('config');
    expect(config.get('override')).toBe('development');

    // Manual overrides
    config.set('override', 'runtime');
    expect(config.get('override')).toBe('runtime');

    config.use({ override: 'literal' });
    expect(config.get('override')).toBe('literal');
  });

  test('confit addOverride as json object', async () => {
    const basedir = path.join(__dirname, '..', '__tests__', 'config');
    const config = await confit<{ name: string; foo?: string; tic: { tac: string } }>({ basedir })
      .addOverride({
        tic: {
          tac: 'toe',
        },
        foo: 'bar',
      })
      .create();
    expect(config.get('tic:tac')).toBe('toe');
    expect(config.get('foo')).toBe('bar');
    expect(config.get('name')).toBe('config');
  });

  test('confit without files, using just json objects', async () => {
    const config = await confit<{
      foo: 'bar';
      tic: { tac: string };
      blue: boolean;
    }>()
      .addDefault({
        foo: 'bar',
        tic: {
          tac: 'toe',
        },
        blue: false,
      })
      .addOverride({ blue: true })
      .create();
    expect(config.get('foo')).toBe('bar');
    expect(config.get('tic:tac')).toBe('toe');
    expect(config.get('blue')).toBe(true);
  });

  test('protocols', async () => {
    process.env.NODE_ENV = 'dev';
    const basedir = path.join(__dirname, '..', '__tests__', 'defaults');
    const config = await confit<{
      misc: string;
      path: string;
    }>({
      basedir,
      protocols: {
        path: (value: string) => path.join(basedir, value),
      },
    }).create();
    expect(config.get('misc')).toBe(path.join(basedir, 'config.json'));
    expect(config.get('path')).toBe(path.join(basedir, 'development.json'));

    config.use({ path: __filename });
    expect(config.get('path')).toBe(__filename);
  });

  test('protocols (array)', async () => {
    process.env.NODE_ENV = 'dev';
    const basedir = path.join(__dirname, '..', '__tests__', 'defaults');
    const options = {
      basedir,
      protocols: {
        path: [(value: string) => path.join(basedir, value), (value: string) => value + '!'],
      },
    };

    const config = await confit<{
      misc: string;
      path: string;
    }>(options).create();
    expect(config.get('misc')).toBe(path.join(basedir, 'config.json!'));
    expect(config.get('path')).toBe(path.join(basedir, 'development.json!'));

    config.use({ path: __filename });
    expect(config.get('path')).toBe(__filename);
  });

  test('error', async () => {
    process.env.NODE_ENV = 'dev';
    const basedir = path.join(__dirname, '..', '__tests__', 'defaults');
    const options = {
      basedir,
      protocols: {
        path: () => {
          throw new Error('path');
        },
      },
    };
    await expect(confit(options).create()).rejects.toThrow();
  });

  test('malformed', async () => {
    const basedir = path.join(__dirname, '..', '__tests__', 'malformed');
    await expect(confit({ basedir }).create()).rejects.toThrow();
  });

  test('addOverride', async () => {
    process.env.NODE_ENV = 'test';
    const basedir = path.join(__dirname, '..', '__tests__', 'defaults');
    const config = await confit<{
      default: string;
      override: string;
    }>({ basedir })
      .addOverride('development.json')
      .addOverride(path.join(basedir, 'supplemental.json'))
      .create();

    expect(config.get('default')).toBe('config');
    expect(config.get('override')).toBe('supplemental');
  });

  test('addOverride error', () => {
    const basedir = path.join(__dirname, '..', '__tests__', 'defaults');
    expect(() => confit({ basedir }).addOverride('nonexistent.json').create()).rejects.toThrow();
    expect(() => confit({ basedir }).addOverride('malformed.json').create()).rejects.toThrow();
  });

  test('import: with merging objects in imported files', async () => {
    const basedir = path.join(__dirname, '..', '__tests__', 'import');
    const config = await confit({ basedir }).addDefault('override.json').create();

    expect(config.getUntypedValue('child:grandchild:secret')).toBe('santa');
    expect(config.getUntypedValue('child:grandchild:name')).toBe('grandchild');
    expect(config.getUntypedValue('child:grandchild:another')).toBe('claus');
  });

  test('precedence', async () => {
    const argv = process.argv;
    const env = process.env;
    process.argv = ['node', __filename, '--override=argv'];
    process.env = {
      NODE_ENV: 'development',
      override: 'env',
      misc: 'env',
    };

    const basedir = path.join(__dirname, '..', '__tests__', 'defaults');
    const factory = confit<{ override: string; misc: string }>({ basedir });
    const config = await factory.create();
    expect(config.get('override')).toBe('argv');
    expect(config.get('misc')).toBe('env');
    process.argv = argv;
    process.env = env;
  });

  test('env ignore', async () => {
    const env = (process.env = {
      NODE_ENV: 'development',
      fromlocal: 'config:local',
      local: 'motion',
      ignoreme: 'file:./path/to/mindyourbusiness',
    });
    const basedir = path.join(__dirname, '..', '__tests__', 'defaults');
    const config = await confit<{
      fromlocal: string;
      ignoreme?: string;
    }>({
      basedir,
      excludeEnvVariables: ['ignoreme'],
    }).create();
    expect(config.get('fromlocal')).toBe(env.local);
    expect(config.get('ignoreme')).toBeUndefined();
  });
});
