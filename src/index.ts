import type { BaseConfitType, ConfitOptions } from './types';
import { Factory } from './Factory';
import type { Config } from './Config';

export function confit<ConfigurationType extends object>(options?: ConfitOptions) {
  return new Factory<ConfigurationType>(options || {});
}

export type Confit<ConfigSchema extends BaseConfitType> = Config<ConfigSchema>;

export * from './Factory';
export * from './types';
