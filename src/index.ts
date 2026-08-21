import type { BaseConfitSchema, ConfitOptions } from './types.js';
import { Factory } from './Factory.js';
import type { Config } from './Config.js';

export function confit<ConfigurationType extends BaseConfitSchema>(options?: ConfitOptions) {
  return new Factory<ConfigurationType>(options || {});
}

export type Confit<ConfigSchema extends BaseConfitSchema> = Config<ConfigSchema>;

export * from './Factory.js';
export * from './types.js';
export * from './shortstop/index.js';
