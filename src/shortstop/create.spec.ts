import { describe, expect, test } from 'vitest';

import { createShortstopHandlers } from './create';

describe('shortstop handling', () => {
  test('should perform basic functions', () => {
    const shortstop = createShortstopHandlers();
    shortstop.use('inc', (value: number) => {
      return Number(value) + 1;
    });
    expect(shortstop.resolve('inc:1', '')).resolves.toBe(2);
    expect(
      shortstop.resolve(
        {
          key: 'inc:10',
        },
        '',
      ),
    ).resolves.toEqual({
      key: 11,
    });

    shortstop.use('add', (value: string) => {
      return new Promise((accept) => {
        const [v1, v2] = value.split(':').map((v) => Number(v));
        setImmediate(() => accept(v1 + v2));
      });
    });

    expect(
      shortstop.resolve(
        {
          values: ['inc:1', 'add:1:2'],
          sum: 'add:50:150',
        },
        '',
      ),
    ).resolves.toEqual({
      values: [2, 3],
      sum: 200,
    });
  });
});
