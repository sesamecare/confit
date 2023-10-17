export function envHandler() {
  const filters: {
    [key: string]: (value?: string) => number | boolean;
  } = {
    '|d': (value?: string) => {
      return parseInt(value || '', 10);
    },
    '|b': (value?: string) => {
      return value !== '' && value !== 'false' && value !== '0' && value !== undefined;
    },
    '|!b': (value?: string) => {
      return value === '' || value === 'false' || value === '0' || value === undefined;
    },
  };

  return function envHandler(value: string): string | number | boolean | undefined {
    let result: string | number | boolean | undefined = process.env[value];

    Object.entries(filters).some(([key, fn]) => {
      if (value.endsWith(key)) {
        const sliced = value.slice(0, -key.length);
        result = fn(process.env[sliced]);
        return true;
      }
      return false;
    });

    return result;
  };
}
