import { ConfitOptions } from './types';

export async function resolveConfig<ConfigurationType extends object>(data: ConfigurationType) {
  return data as ConfigurationType;
}

export async function resolveImport<ConfigurationType extends object>(
  data: ConfigurationType,
  basedir: string,
): Promise<ConfigurationType> {
  return { data, basedir } as ConfigurationType;
}

export async function resolveCustom<ConfigurationType extends object>(
  data: ConfigurationType,
  protocols: ConfitOptions['protocols'],
) {
  if (protocols) {
    return data as ConfigurationType;
  }
  return data as ConfigurationType;
}
