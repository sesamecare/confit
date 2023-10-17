import { createShortstopHandlers } from './shortstop';
import { path } from './shortstop/path';
import { ConfitOptions, IntermediateConfigValue } from './types';
import { loadJsonc } from './common';

export async function resolveConfig(
  inputData: IntermediateConfigValue,
) {
  const shorty = createShortstopHandlers();

  let data: unknown = inputData;
  let usedHandler = false;

  shorty.use('config', (key: string) => {
    usedHandler = true;

    const keys = key.split('.');
    let result: unknown = data;

    while (result && keys.length) {
      const prop = keys.shift() as string;
      if (!Object.hasOwnProperty.call(result, prop)) {
        return undefined;
      }
      result = (result as Record<string, unknown>)[prop];
    }

    return keys.length ? null : result;
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
  const pathHandler = path(basedir);

  shorty.use('import', async (file: string) => {
    const resolved = pathHandler(file);
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
