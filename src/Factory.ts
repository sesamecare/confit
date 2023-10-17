import path from 'path';

import caller from 'caller';

import { BaseConfitType, ConfitOptions, IntermediateConfigValue } from './types';
import { Config } from './Config';
import { isAbsolutePath, loadJsonc, merge } from './common';
import { argv, convenience, environmentVariables } from './provider';
import { resolveConfig, resolveCustom, resolveImport } from './handlers';

export class Factory<ConfigurationType extends BaseConfitType> {
  private basedir: string;
  private protocols: ConfitOptions['protocols'];
  private promise: Promise<ConfigurationType>;

  constructor(options: ConfitOptions) {
    const excludedEnvVariables = [...(options.excludeEnvVariables || []), 'env'];
    this.protocols = options.protocols || {};
    this.basedir = options.basedir || path.dirname(caller());
    this.promise = Promise.resolve({})
      .then((store) => merge(convenience(), store))
      .then(
        Factory.conditional((store) => {
          const jsonPath = path.join(this.basedir, options.defaults || 'config.json');
          return loadJsonc(jsonPath)
            .then((json) => resolveImport(json, this.basedir))
            .then((data) => merge(data, store));
        }),
      )
      .then(
        Factory.conditional((store) => {
          const jsonPath = path.join(this.basedir, `${store.env.env}.json`);
          return loadJsonc(jsonPath)
            .then((json) => resolveImport(json as IntermediateConfigValue, this.basedir))
            .then((data) => merge(data, store));
        }),
      )
      .then((store) => merge(environmentVariables(excludedEnvVariables), store))
      .then((store) => merge(argv(), store));
  }

  private async resolveFile(pathOrConfig: string | Partial<ConfigurationType>): Promise<ConfigurationType> {
    if (typeof pathOrConfig === 'string') {
      const file = isAbsolutePath(pathOrConfig)
        ? pathOrConfig
        : path.join(this.basedir, pathOrConfig);
      return loadJsonc(file) as Promise<ConfigurationType>;
    }
    return pathOrConfig as unknown as ConfigurationType;
  }

  private add(
    fileOrDirOrConfig: string | Partial<ConfigurationType>,
    fn: (store: ConfigurationType, update: ConfigurationType) => ConfigurationType,
  ) {
    const dataPromise = this.resolveFile(fileOrDirOrConfig).then((data) =>
      resolveImport(data, this.basedir),
    );
    this.promise = Promise.all([this.promise, dataPromise]).then(([store, data]) =>
      fn(store, data as ConfigurationType),
    );
  }

  addDefault(pathOrConfig: string | Partial<ConfigurationType>) {
    this.add(pathOrConfig, (store, data) => merge(store, data));
    return this;
  }

  addOverride(pathOrConfig: string | Partial<ConfigurationType>) {
    this.add(pathOrConfig, (store, data) => merge(data, store));
    return this;
  }

  async create() {
    const finalStore = await this.promise
      .then((store) => resolveImport(store, this.basedir))
      .then((store) => resolveCustom(store, this.protocols))
      .then((store) => resolveConfig(store));
    return new Config<ConfigurationType>(finalStore as ConfigurationType);
  }

  static conditional<ConfigurationType extends BaseConfitType, R>(
    fn: (store: ConfigurationType) => R,
  ) {
    return async (store: ConfigurationType) => {
      try {
        const result = await fn(store);
        return result;
      } catch (error) {
        const err = error as { code?: string };
        if (err.code && err.code === 'MODULE_NOT_FOUND') {
          // debug(`WARNING: ${err.message}`);
          return store;
        }
        throw err;
      }
    };
  }
}
