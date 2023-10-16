import { ConfitOptions } from './types';
import { Factory } from './Factory';

export function confit(options: ConfitOptions) {
  return new Factory(options);
}

export * from './Factory';
export * from './types';
