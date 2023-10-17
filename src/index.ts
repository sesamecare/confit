import { ConfitOptions } from './types';
import { Factory } from './Factory';

export function confit<ConfigurationType extends object>(options?: ConfitOptions) {
  return new Factory<ConfigurationType>(options || {});
}

export * from './Factory';
export * from './types';
