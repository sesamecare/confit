import path from 'path';

import { ConfitOptions, ShortstopHandler } from './types';
import { Config } from './Config';
import { isAbsolutePath, loadJsonc, merge } from './common';
import { argv, convenience, environmentVariables } from './provider';
import { resolveImport } from './handlers';

export class Factory<ConfigurationType extends object> {
  private basedir: string;
  private protocols: Record<string, ShortstopHandler<unknown>>;
  private promise: Promise<ConfigurationType>;

  constructor(options: ConfitOptions) {
    this.protocols = options.protocols || {};
    this.basedir = options.basedir;
    this.promise = Promise.resolve({})
      .then((store) => merge(convenience(), store))
      .then(Factory.conditional((store) => {
        const jsonPath = path.join(this.basedir, options.defaults || 'config.json');
        return loadJsonc(jsonPath)
          .then((json) => resolveImport(json as ConfigurationType, this.basedir))
          .then((data) => merge(data, store));
      }))
      .then(Factory.conditional((store) => {
        const jsonPath = path.join(this.basedir, `${store.env.env}.json`);
        return loadJsonc(jsonPath)
          .then((json) => resolveImport(json as ConfigurationType, this.basedir))
          .then((data) => merge(data, store))
      }))
      .then((store) => merge(environmentVariables(options.excludeEnvVariables || []), store))
      .then((store) => merge(argv(), store));
  }

  private async resolveFile(pathOrConfig: string | ConfigurationType): Promise<ConfigurationType> {
    if (typeof pathOrConfig === 'string') {
      const file = isAbsolutePath(pathOrConfig) ? pathOrConfig : path.join(this.basedir, pathOrConfig);
      return loadJsonc(file) as ConfigurationType;
    }
    return path as ConfigurationType;
  }

  private add(fileOrDirOrConfig: string | ConfigurationType, fn: (store: ConfigurationType, update: ConfigurationType) => ConfigurationType) {
    const dataPromise = this.resolveFile(fileOrDirOrConfig).then((data) => resolveImport(data, this.basedir));
    this.promise = Promise.all([this.promise, dataPromise]).then(([store, data]) => fn(store, data));
  }

  addDefault(dir: string | ConfigurationType) {
    this.add(dir, (store, data) => merge(store, data));
    return this;
  }

  addOverride(dir: string) {
    this.add(dir, (store, data) => merge(data, store));
    return this;
  }

  async create() {
    const finalStore = await this.promise;
    return new Config<ConfigurationType>(finalStore);
  }

  static conditional<ConfigurationType extends object, R>(fn: (store: ConfigurationType) => R) {
    return (store: ConfigurationType) => {
      try {
        return fn(store);
      } catch (error) {
        const err = error as { code?: string };
        if (err.code && err.code === 'MODULE_NOT_FOUND') {
          // debug(`WARNING: ${err.message}`);
          return store;
        }
        throw err;
      }
    }
  }
}
