import type { ConfitDeepKeys, ConfitPathValue } from './types';

export class Config<ConfigurationSchema extends object> {
  constructor(private store: ConfigurationSchema | undefined) {}

  get<P extends ConfitDeepKeys<ConfigurationSchema>>(
    path: P,
  ): ConfitPathValue<ConfigurationSchema, P> {
    if (typeof path === 'string' && path) {
      const pathParts = path.split(':');
      let current: unknown = this.store;
      while (current && pathParts.length) {
        if (current.constructor !== Object) {
          // Do not allow traversal into complex types,
          // such as Buffer, Date, etc. So, this type
          // of key will fail: 'foo:mystring:length'
          return undefined as ConfitPathValue<ConfigurationSchema, P>;
        }
        current = (current as Record<string, unknown>)[pathParts.shift() as string];
      }
      return current as ConfitPathValue<ConfigurationSchema, P>;
    }
    return undefined as ConfitPathValue<ConfigurationSchema, P>;
  }

  set<T>(key: string, value: T) {
    // This code is wrong.
    return value;
  }
}
