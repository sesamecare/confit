import { merge } from './common.js';
import type { BaseConfitSchema } from './types.js';

export class Config<ConfigurationSchema extends BaseConfitSchema> {
  // The empty object is the neutral initial value until providers are merged in.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  constructor(private store: ConfigurationSchema = {} as ConfigurationSchema) {}

  get(): ConfigurationSchema {
    return this.store;
  }

  use(config: Partial<ConfigurationSchema>) {
    return merge(config, this.store);
  }

  merge(config: Config<ConfigurationSchema>) {
    return this.use(config.store);
  }

  toJSON() {
    return JSON.stringify(this.store);
  }
}
