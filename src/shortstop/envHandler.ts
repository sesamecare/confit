export function envHandler() {
  const filters: {
    [key: string]: (value?: string) => number | boolean | string | undefined;
  } = {
    // Return the variable if it exists and is non-empty
    '|u': (value?: string) => {
      return value === '' ? undefined : value;
    },
    // Return the variable as a number if it exists, or undefined
    '|ud': (value?: string) => {
      return value === '' || value === undefined ? undefined : parseInt(value, 10);
    },
    // Return the value as a decimal
    '|d': (value?: string) => {
      return parseInt(value || '', 10);
    },
    // Return the value as a boolean - empty, false, 0 and undefined will be false
    '|b': (value?: string) => {
      return value !== '' && value !== 'false' && value !== '0' && value !== undefined;
    },
    // Return the value as a boolean but inverted so that empty/undefined/0/false are true
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
