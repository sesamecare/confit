export type ConfitDeepKeys<T> = {
  [P in keyof T]: P extends string
    ? T[P] extends object
      ? `${P}:${ConfitDeepKeys<T[P]>}` | P
      : P
    : never;
}[keyof T];

export type ConfitPathValue<T, P extends string> = P extends `${infer K}:${infer Rest}`
  ? K extends keyof T
    ? ConfitPathValue<T[K], Rest>
    : never
  : P extends keyof T
  ? T[P]
  : never;

export class Config<ConfigurationSchema extends object> {
  constructor(private store: ConfigurationSchema = {} as ConfigurationSchema) {}

  private getValue<P extends ConfitDeepKeys<ConfigurationSchema>>(
    path: P,
    throwMissing: boolean,
  ): ConfitPathValue<ConfigurationSchema, P> {
    if (typeof path === 'string' && path) {
      const pathParts = path.split(':');
      let current: unknown = this.store;
      while (current && pathParts.length) {
        if (current.constructor !== Object) {
          // Do not allow traversal into complex types,
          // such as Buffer, Date, etc. So, this type
          // of key will fail: 'foo:mystring:length'
          if (throwMissing) {
            throw new Error(`Expected value not found at "${path}"`);
          }
          return undefined as ConfitPathValue<ConfigurationSchema, P>;
        }
        current = (current as Record<string, unknown>)[pathParts.shift() as string];
      }
      return current as ConfitPathValue<ConfigurationSchema, P>;
    }
    if (throwMissing) {
      throw new Error(`Expected value not found at "${path}"`);
    }
    return undefined as ConfitPathValue<ConfigurationSchema, P>;
  }

  get<P extends ConfitDeepKeys<ConfigurationSchema>>(
    path: P,
  ): ConfitPathValue<ConfigurationSchema, P> {
    return this.getValue(path, false);
  }

  getOrThrow<P extends ConfitDeepKeys<ConfigurationSchema>>(path: P) {
    return this.getValue(path, true);
  }

  set<P extends ConfitDeepKeys<ConfigurationSchema>>(
    path: P,
    value: ConfitPathValue<ConfigurationSchema, P>,
  ): void {
    if (typeof path === 'string' && path) {
      const pathParts = path.split(':');
      let current: object = this.store as object;
      while (pathParts.length - 1) {
        const prop = pathParts.shift() as string;
        if (!Object.prototype.hasOwnProperty.call(current, prop)) {
          (current as Record<string, object>)[prop] = {};
        }

        current = (current as Record<string, object>)[prop];
        if (current?.constructor !== Object) {
          // Do not allow traversal into complex types,
          // such as Buffer, Date, etc. So, this type
          // of key will fail: 'foo:mystring:length'
          return;
        }
      }
      (current as Record<string, typeof value>)[pathParts.shift() as string] = value;
    }

    return;
  }
}
