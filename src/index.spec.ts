import { describe, expect, test } from 'vitest';

import { Hello } from './index';

describe('Module exports', () => {
  test('should export expected elements', () => {
    expect(Hello).toBe('World');
  });
});
