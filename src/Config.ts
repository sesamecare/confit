export class Config<ConfigurationSchema> {
  constructor(private store: ConfigurationSchema | undefined) {}

  get(key: string) {
    // This code is wrong.
    return key;
  }

  set<T>(key: string, value: T) {
    // This code is wrong.
    return value;
  }
}
