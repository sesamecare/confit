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
});

/*
    t.test('protocols', function (t) {
        var basedir, options;

        process.env.NODE_ENV = 'dev';
        basedir = path.join(__dirname, 'fixtures', 'defaults');
        options = {
            basedir: basedir,
            protocols: {
                path: function (value) {
                    return path.join(basedir, value);
                }
            }
        };

        confit(options).create(function (err, config) {
            t.error(err);
            // Ensure handler was run correctly on default file
            t.equal(config.get('misc'), path.join(basedir, 'config.json'));
            t.equal(config.get('path'), path.join(basedir, 'development.json'));

            config.use({ path: __filename });
            t.equal(config.get('path'), __filename);
            t.end();
        });
    });


    t.test('protocols (array)', function (t) {
        var basedir, options;

        process.env.NODE_ENV = 'dev';
        basedir = path.join(__dirname, 'fixtures', 'defaults');
        options = {
            basedir: basedir,
            protocols: {
                path: [
                    function (value) {
                        return path.join(basedir, value);
                    },
                    function (value) {
                        return value + '!';
                    }
                ]
            }
        };

        confit(options).create(function (err, config) {
            t.error(err);
            // Ensure handler was run correctly on default file
            t.equal(config.get('misc'), path.join(basedir, 'config.json!'));
            t.equal(config.get('path'), path.join(basedir, 'development.json!'));

            config.use({ path: __filename });
            t.equal(config.get('path'), __filename);
            t.end();
        });
    });


    t.test('error', function (t) {
        var basedir, options;

        process.env.NODE_ENV = 'dev';
        basedir = path.join(__dirname, 'fixtures', 'defaults');
        options = {
            basedir: basedir,
            protocols: {
                path: function (value) {
                    throw new Error('path');
                }
            }
        };

        confit(options).create(function (err, config) {
            t.ok(err);
            t.notOk(config);
            t.end();
        });
    });


    t.test('malformed', function (t) {
        var basedir = path.join(__dirname, 'fixtures', 'malformed');
        confit(basedir).create(function (err, config) {
            t.ok(err);
            t.notOk(config);
            t.end();
        });
    });


    t.test('addOverride', function (t) {
        var basedir, factory;

        process.env.NODE_ENV = 'test';
        basedir = path.join(__dirname, 'fixtures', 'defaults');

        factory = confit(basedir);
        factory.addOverride('development.json');
        factory.addOverride(path.join(basedir, 'supplemental.json'));
        factory.create(function (err, config) {
            t.error(err);
            t.ok(config);
            t.equal(config.get('default'), 'config');
            t.equal(config.get('override'), 'supplemental');
            t.end();
        });
    });


    t.test('addOverride error', function (t) {
        var basedir;


        t.throws(function () {
            confit(path.join(__dirname, 'fixtures', 'defaults'))
                .addOverride('nonexistent.json');
        });

        t.throws(function () {
            confit(path.join(__dirname, 'fixtures', 'defaults'))
                .addOverride('malformed.json');
        });

        t.end();
    });

    t.test('import: with merging objects in imported files', function(t) {

        var basedir = path.join(__dirname, 'fixtures', 'import');
        var factory = confit(basedir);
        factory.addDefault('override.json');

        factory.create(function(err, config) {
            t.error(err);
            t.ok(config);
            t.equal(config.get('child:grandchild:secret'), 'santa');
            t.equal(config.get('child:grandchild:name'), 'grandchild');
            t.equal(config.get('child:grandchild:another'), 'claus');
            t.end();
        });
    });

    t.test('precedence', function (t) {
        var factory;
        var argv = process.argv;
        var env = process.env;

        process.argv = [ 'node', __filename, '--override=argv'];
        process.env = {
            NODE_ENV: 'development',
            override: 'env',
            misc: 'env'
        };

        factory = confit(path.join(__dirname, 'fixtures', 'defaults'));
        factory.create(function (err, config) {
            t.error(err);
            t.ok(config);
            t.equal(config.get('override'), 'argv');
            t.equal(config.get('misc'), 'env');
            process.argv = argv;
            process.env = env;
            t.end();
        });
    });
    t.test('env ignore', function (t) {
        var basedir, options;

        var env = process.env = {
            NODE_ENV: 'development',
            fromlocal: 'config:local',
            local: 'motion',
            ignoreme: 'file:./path/to/mindyourbusiness'
        };
        basedir = path.join(__dirname, 'fixtures', 'defaults');
        options = {
            basedir: basedir,
            envignore: ['ignoreme']
        };

        confit(options).create(function (err, config) {
            t.error(err);
            // Ensure env is read except for the desired ignored property
            t.equal(config.get('fromlocal'), env.local);
            t.equal(config.get('ignoreme'), undefined);
            t.end();
        });
    });

    t.end();
});*/
