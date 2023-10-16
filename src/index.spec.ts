import { describe, expect, test } from 'vitest';

import { confit } from './index';

describe('Module exports', () => {
  test('should export expected elements', () => {
    expect(typeof confit).toBe('function');
  });
});
