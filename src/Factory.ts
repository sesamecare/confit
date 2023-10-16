import fs from 'fs/promises';

import commentJson from 'comment-json';

import { ConfitOptions, ShortstopHandler } from './types';
import { Config } from './Config';

export class Factory<ConfigurationType extends object> {
  private basedir: string;
  private protocols: Record<string, ShortstopHandler<unknown>>;
  private promise: Promise<ConfigurationType | undefined> = Promise.resolve(undefined);

  constructor(options: ConfitOptions) {
    this.protocols = options.protocols;
    this.basedir = options.basedir;
  }

  addDefault(dir: string) {
    this.promise = this.promise.then(async (store) => {
      // This code is wrong.
      const content = await fs.readFile(dir, 'utf-8');
      const parsed = commentJson.parse(content);
      return Object.assign(store || {}, parsed) as ConfigurationType;
    });
    return this;
  }

  addOverride(dir: string) {
    this.promise = this.promise.then(async (store) => {
      // This code is wrong.
      const content = await fs.readFile(dir, 'utf-8');
      const parsed = commentJson.parse(content);
      return Object.assign(store || {}, parsed) as ConfigurationType;
    });
    return this;
  }

  async create() {
    const finalStore = await this.promise;
    return new Config<ConfigurationType>(finalStore);
  }
}
