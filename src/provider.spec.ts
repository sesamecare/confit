import { describe, afterAll, test, expect } from 'vitest';

import * as provider from './provider';

describe('env', () => {
  const originalEnv = process.env;

  afterAll(() => {
    process.env = originalEnv;
  });

  test('env variables', () => {
    process.env = {
      foo: 'bar',
      env: 'development',
    };

    const val = provider.environmentVariables(['env']);
    expect(val.foo).toBe('bar');
    //env() provider ignores process.env.env
    expect(val.env).toBeUndefined();
  });
});

describe('argv', () => {
  const originalArgv = process.argv;

  afterAll(() => {
    process.argv = originalArgv;
  });

  test('arguments', () => {
    process.argv = ['node', __filename, '-a', 'b', '-c', 'd', '--e=f', 'g', 'h'];

    const val = provider.argv();
    expect(typeof val).toBe('object');
    expect(val.a).toBe('b');
    expect(val.c).toBe('d');
    expect(val.e).toBe('f');
    expect(val.g).toBeNull();
    expect(val.h).toBeNull();
  });
});

describe('convenience', () => {
  const originalEnv = process.env.NODE_ENV;

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  test('dev', () => {
    process.env.NODE_ENV = 'dev';

    const val = provider.convenience();
    expect(val.env.env).toBe('development');
    expect(val.env.development).toBe(true);
    expect(val.env.test).toBe(false);
    expect(val.env.staging).toBe(false);
    expect(val.env.production).toBe(false);
  });

  test('test', () => {
    process.env.NODE_ENV = 'test';

    const val = provider.convenience();
    expect(val.env.env).toBe('test');
    expect(val.env.development).toBe(false);
    expect(val.env.test).toBe(true);
    expect(val.env.staging).toBe(false);
    expect(val.env.production).toBe(false);
  });

  test('stage', () => {
    process.env.NODE_ENV = 'stage';

    const val = provider.convenience();
    expect(val.env.env).toBe('staging');
    expect(val.env.development).toBe(false);
    expect(val.env.test).toBe(false);
    expect(val.env.staging).toBe(true);
    expect(val.env.production).toBe(false);
  });

  test('prod', () => {
    process.env.NODE_ENV = 'prod';

    const val = provider.convenience();
    expect(val.env.env).toBe('production');
    expect(val.env.development).toBe(false);
    expect(val.env.test).toBe(false);
    expect(val.env.staging).toBe(false);
    expect(val.env.production).toBe(true);
  });

  test('none', () => {
    process.env.NODE_ENV = 'none';

    const val = provider.convenience();
    expect(val.env.env).toBe('none');
    expect(val.env.development).toBe(false);
    expect(val.env.test).toBe(false);
    expect(val.env.staging).toBe(false);
    expect(val.env.production).toBe(false);
    expect(val.env.none).toBe(true);
  });

  test('not set', () => {
    process.env.NODE_ENV = '';

    const val = provider.convenience();
    expect(val.env.env).toBe('development');
    expect(val.env.development).toBe(true);
    expect(val.env.test).toBe(false);
    expect(val.env.staging).toBe(false);
    expect(val.env.production).toBe(false);
  });
});
