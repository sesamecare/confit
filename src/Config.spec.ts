import { describe, expect, test } from 'vitest';

import type { FakeConfigurationSchema } from '../__tests__/fakeConfig.fixtures.js';
import { fakeConfigurationSchema } from '../__tests__/fakeConfig.fixtures.js';

import { Config } from './Config.js';

describe('Core configuration tests', () => {
  test('Should get a simple value', () => {
    const config = new Config<FakeConfigurationSchema>(structuredClone(fakeConfigurationSchema));
    expect(config.get().jump.howHigh).toBe(10);
    expect(config.get().jump).toEqual(fakeConfigurationSchema.jump);
    expect(config.get().jump.over).toEqual(fakeConfigurationSchema.jump.over);
    expect(config.get().optional?.notOptional).toBe('I am not optional');
  });

  test('Should get a simple value', () => {
    const config = new Config<FakeConfigurationSchema>(structuredClone(fakeConfigurationSchema));
    expect(config.get().jump.over.theMoon).toBe(false);
    config.get().jump.over = { theMoon: true };
    expect(config.get().jump.over.theMoon).toBe(true);

    config.get().jump.howHigh = 20;
    expect(config.get().jump.howHigh).toBe(20);
    expect(config.get().jump).toEqual({
      howHigh: 20,
      over: {
        theMoon: true,
      },
    });
  });
});
