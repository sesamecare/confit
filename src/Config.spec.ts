import { describe, expect, test } from 'vitest';

import { FakeConfigurationSchema, fakeConfigurationSchema } from '../__tests__/fakeConfig.fixtures';

import { Config } from './Config';

describe('Core configuration tests', () => {
  test('Should get a simple value', () => {
    const config = new Config<FakeConfigurationSchema>(fakeConfigurationSchema);
    expect(config.get('jump:howHigh')).toBe(10);
    expect(config.get('jump')).toEqual({
      howHigh: 10,
    });
  });
});
