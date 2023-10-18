import type { BaseConfitSchema, ConfitOptions } from './types';
import { Factory } from './Factory';
import type { Config } from './Config';

export function confit<ConfigurationType extends BaseConfitSchema>(options?: ConfitOptions) {
  return new Factory<ConfigurationType>(options || {});
}

export type Confit<ConfigSchema extends BaseConfitSchema> = Config<ConfigSchema>;

export * from './Factory';
export * from './types';
export * from './shortstop';
