import minimist from 'minimist';

import { environmentPatterns } from './common';

export function convenience() {
  // NextJS philosophy is don't use non-standard NODE_ENV values, and this seems
  // reasonable. APP_ENV includes staging, which is not a NODE_ENV value.
  // So we will try to pick the best one we can find
  let nodeEnv = process.env.APP_ENV || process.env.NODE_ENV || 'development';
  const env: Record<string, string | boolean> = {};

  // Normalize env and set convenience values.
  for (const current of Object.keys(environmentPatterns)) {
    const match = environmentPatterns[current].test(nodeEnv);
    nodeEnv = match ? current : nodeEnv;
    env[current] = match;
  }

  // Set (or re-set) env:{nodeEnv} value in case
  // NODE_ENV was not one of our predetermined env
  // keys (so `config.get('env:blah')` will be true).
  env[nodeEnv] = true;
  env.env = nodeEnv;
  return { env };
}

export function environmentVariables(ignore: string[]) {
  const result: Record<string, string | undefined> = {};

  // process.env is not a normal object, so we
  // need to map values.
  for (const env of Object.keys(process.env)) {
    // env:env is decided by process.env.APP_ENV or process.env.NODE_ENV.
    // Not allowing process.env.env to override the env:env value.
    if (ignore.indexOf(env) < 0) {
      result[env] = process.env[env];
    }
  }

  return result;
}

export function argv() {
  const result: Record<string, unknown> = {};
  const args = minimist(process.argv.slice(2));

  for (const key of Object.keys(args)) {
    if (key === '_') {
      // Since the '_' args are standalone,
      // just set keys with null values.
      for (const prop of args._) {
        result[prop] = null;
      }
    } else {
      result[key] = args[key];
    }
  }

  return result;
}
