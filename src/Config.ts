import { merge } from './common';

import { BaseConfitSchema } from '.';

export class Config<ConfigurationSchema extends BaseConfitSchema> {
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
