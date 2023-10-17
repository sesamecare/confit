import { afterAll, beforeEach, describe, expect, test } from 'vitest';

import { envHandler } from './envHandler';

describe('env', () => {
  const originalEnv = process.env;
  let handler: ReturnType<typeof envHandler>;

  beforeEach(() => {
    process.env = { ...process.env, SAMPLE: '8000' };
    handler = envHandler();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('should validate handler is a function with length 1', () => {
    expect(typeof handler).toBe('function');
    expect(handler.length).toBe(1);
  });

  test('should validate raw env values', () => {
    expect(handler('SAMPLE')).toBe(process.env.SAMPLE);
  });

  test('should validate env values as numbers', () => {
    expect(handler('SAMPLE|d')).toBe(8000);
  });

  test('should validate NaN env values', () => {
    process.env.SAMPLE = '';
    expect(isNaN(handler('SAMPLE|d') as number)).toBe(true);

    process.env.SAMPLE = 'hello';
    expect(isNaN(handler('SAMPLE|d') as number)).toBe(true);
  });

  test('should validate boolean env values', () => {
    process.env.SAMPLE = '8000';
    expect(handler('SAMPLE|b')).toBe(true);

    process.env.SAMPLE = 'true';
    expect(handler('SAMPLE|b')).toBe(true);

    process.env.SAMPLE = 'false';
    expect(handler('SAMPLE|b')).toBe(false);

    process.env.SAMPLE = '0';
    expect(handler('SAMPLE|b')).toBe(false);

    delete process.env.SAMPLE;
    expect(handler('SAMPLE|b')).toBe(false);
  });

  test('should validate boolean inverse env values', () => {
    process.env.SAMPLE = '8000';
    expect(handler('SAMPLE|!b')).toBe(false);

    process.env.SAMPLE = 'true';
    expect(handler('SAMPLE|!b')).toBe(false);

    process.env.SAMPLE = 'false';
    expect(handler('SAMPLE|!b')).toBe(true);

    process.env.SAMPLE = '0';
    expect(handler('SAMPLE|!b')).toBe(true);

    delete process.env.SAMPLE;
    expect(handler('SAMPLE|!b')).toBe(true);
  });
});
