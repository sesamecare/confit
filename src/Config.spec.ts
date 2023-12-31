import { describe, expect, test } from 'vitest';

import { FakeConfigurationSchema, fakeConfigurationSchema } from '../__tests__/fakeConfig.fixtures';

import { Config } from './Config';

describe('Core configuration tests', () => {
  test('Should get a simple value', () => {
    const config = new Config<FakeConfigurationSchema>(
      JSON.parse(JSON.stringify(fakeConfigurationSchema)),
    );
    expect(config.get().jump.howHigh).toBe(10);
    expect(config.get().jump).toEqual(fakeConfigurationSchema.jump);
    expect(config.get().jump.over).toEqual(fakeConfigurationSchema.jump.over);
    expect(config.get().optional?.notOptional).toBe('I am not optional');
  });

  test('Should get a simple value', () => {
    const config = new Config<FakeConfigurationSchema>(
      JSON.parse(JSON.stringify(fakeConfigurationSchema)),
    );
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
