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

  /**
   * Get a value from the configuration store. Keys should be separated with
   * colons. For example to get the value of c on object b on object a of the root
   * store, use a:b:c.
   *
   * Note that unless you validate your schema with typia or similar, it is
   * possible, nay likely, that the return type of this function will be a lie.
   * In the end we are dealing with JSON, and we are not doing runtime type checking.
   * (But you can) The most relevant part of this is that this version
   * (as opposed to getOrThrow) will return undefined if the key is not found.
   */
  get<P extends ConfitDeepKeys<ConfigurationSchema>>(
    path: P,
  ): ConfitPathValue<ConfigurationSchema, P> {
    return this.getValue(path, false);
  }

  /**
   * Get a value from the configuration store. Keys should be separated with
   * colons. For example to get the value of c on object b on object a of the root
   * store, use a:b:c.
   *
   * Note that unless you validate your schema with typia or similar, it is
   * possible, nay likely, that the return type of this function will be a lie.
   * In the end we are dealing with JSON, and we are not doing runtime type checking.
   * (But you can) The most relevant part of this is that this version
   * (as opposed to get) will throw an exception if the key is not found.
   */
  getOrThrow<P extends ConfitDeepKeys<ConfigurationSchema>>(path: P) {
    return this.getValue(path, true);
  }

  /**
   * Set a value in the configuration store. Keys should be separated with
   * colons. For example to set the value of c on object b on object a of the root
   * store, use a:b:c. If parts of the key do not exist, they will be initialized
   * to an empty object. Also note that the changes are not written back to the
   * filesystem, as we would have no idea where to write them.
   */
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
