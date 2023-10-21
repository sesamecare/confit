import { createShortstopHandlers } from './shortstop';
import { pathHandler } from './shortstop/fileHandlers';
import { ConfitOptions } from './types';
import { loadJsonc } from './common';

type IntermediateConfigValue = ReturnType<typeof JSON.parse>;

const filters = {
  // Return the variable if it exists and is non-empty
  '|u': (value?: unknown) => {
    return value === '' ? undefined : value;
  },
  // Return the variable as a number if it exists, or undefined
  '|ud': (value?: unknown) => {
    return value === '' || value === undefined || value === null
      ? undefined
      : parseInt(value.toString(), 10);
  },
  // Return the value as a decimal
  '|d': (value?: unknown) => {
    return parseInt(value?.toString() || '', 10);
  },
  // Return the value as a boolean - empty, false, 0 and undefined will be false
  '|b': (value?: unknown) => {
    return (
      value !== '' && value !== 'false' && value !== '0' && value !== undefined && value !== null
    );
  },
  // Return the value as a boolean but inverted so that empty/undefined/0/false are true
  '|!b': (value?: unknown) => {
    return (
      value === '' || value === 'false' || value === '0' || value === undefined || value === null
    );
  },
  '|': (value?: unknown) => value,
};

export async function resolveConfig(inputData: IntermediateConfigValue) {
  const shorty = createShortstopHandlers();

  let data: unknown = inputData;
  let usedHandler = false;

  shorty.use('config', (key: string) => {
    usedHandler = true;

    let finalKey = key;
    let transform: (value: unknown) => unknown = filters['|'];

    Object.entries(filters).some(([filter, fn]) => {
      if (key.endsWith(filter)) {
        transform = fn;
        finalKey = key.slice(0, -filter.length);
      }
    });

    const keys = finalKey.split('.');
    let result: unknown = data;

    while (result && keys.length) {
      const prop = keys.shift() as string;
      if (!Object.hasOwnProperty.call(result, prop)) {
        return undefined;
      }
      result = (result as Record<string, unknown>)[prop];
    }

    if (keys.length) {
      return null;
    }
    return transform(result);
  });

  do {
    usedHandler = false;
    data = await shorty.resolve(data);
  } while (usedHandler);
  return data as IntermediateConfigValue;
}

export async function resolveImport(
  data: IntermediateConfigValue,
  basedir: string,
): Promise<IntermediateConfigValue> {
  const shorty = createShortstopHandlers();
  const resolver = pathHandler(basedir);

  shorty.use('import', async (file: string) => {
    const resolved = resolver(file);
    const json = await loadJsonc(resolved);
    return shorty.resolve(json);
  });

  return shorty.resolve(data) as Promise<IntermediateConfigValue>;
}

export async function resolveCustom(
  data: IntermediateConfigValue,
  protocols: ConfitOptions['protocols'] = {},
) {
  const shorty = createShortstopHandlers();

  for (const protocol of Object.keys(protocols)) {
    const impls = protocols[protocol];
    if (Array.isArray(impls)) {
      impls.forEach((impl) => shorty.use(protocol, impl));
    } else {
      shorty.use(protocol, impls);
    }
  }

  return shorty.resolve(data) as Promise<IntermediateConfigValue>;
}
