import fs from 'fs/promises';
import Path from 'path';

import { glob, type GlobOptions } from 'glob';
import yaml from 'js-yaml';
import caller from 'caller';

interface LoadOptions {
  /** string to be used as a file path in error/warning messages. */
  filename?: string | undefined;
  /** compatibility with JSON.parse behaviour. */
  json?: boolean | undefined;
}

(function expandModulePaths() {
  // If this module is deployed outside the app's node_modules, it wouldn't be
  // able to resolve other modules deployed under app while evaluating this shortstops.
  // Adding app's node_modules folder to the paths will help handle this case.
  const paths = module.paths || [];
  const appNodeModules = Path.resolve(process.cwd(), 'node_modules');
  if (paths.indexOf(appNodeModules) < 0) {
    // Assuming Module._nodeModulePaths creates a new module.paths object for each module.
    paths.push(appNodeModules);
  }
})();

/**
 * Return an absolute path for the given value.
 */
export function pathHandler(basedir?: string) {
  const basedirOrDefault = basedir || Path.dirname(caller());
  return function pathHandler(value: string) {
    if (Path.resolve(value) === value) {
      // Absolute path already, so just return it.
      return value;
    }
    const components = value.split('/');
    components.unshift(basedirOrDefault);
    return Path.resolve(...components);
  };
}

type ReadOptions = Parameters<typeof fs.readFile>[1];

function toReadOptionsObject(options?: ReadOptions) {
  if (!options) {
    return undefined;
  }
  if (typeof options === 'string') {
    return { encoding: options };
  }
  if (typeof options === 'object') {
    return options;
  }
  throw new Error('Unsupported fileHandler options - must be string or object');
}

/**
 * Return the contents of a file.
 */
export function fileHandler(basedir?: string | ReadOptions, options?: ReadOptions) {
  const basedirValue = typeof basedir === 'string' ? basedir : undefined;
  const baseOptions = {
    encoding: null,
    flag: 'r',
    ...toReadOptionsObject(typeof basedir === 'object' ? basedir : options),
  };

  const pathhandler = pathHandler(basedirValue);
  return async function fileHandler(value: string) {
    const finalOptions = { ...baseOptions };
    let filename = value;
    // Find the options value with a pipe character and a spec at the end
    const match = filename.match(/(.*)\|(base64|hex|utf8|ucs2|utf16le|ascii)$/);
    if (match) {
      filename = match[1];
      finalOptions.encoding = match[2] as BufferEncoding;
    }
    return fs.readFile(pathhandler(filename), finalOptions);
  };
}

/**
 * Call require() on a module and return the loaded module
 */
export function requireHandler(basedir?: string): ReturnType<typeof require> {
  const resolvePath = pathHandler(basedir);
  return function requireHandler(value: string) {
    let module = value;
    // @see http://nodejs.org/api/modules.html#modules_file_modules
    if (value.startsWith('/') || value.startsWith('./') || value.startsWith('../')) {
      // NOTE: Technically, paths with a leading '/' don't need to be resolved, but
      // leaving for consistency.
      module = resolvePath(module);
    }

    return require(module);
  };
}

/**
 * Load a YAML file and return the parsed content.
 */
export function yamlHandler(basedir?: string, options: LoadOptions = {}) {
  const resolver = pathHandler(basedir);

  return async function yamlParser(value: string) {
    const filename = resolver(value);

    const content = await fs.readFile(filename, 'utf8');
    return yaml.load(content, { ...options, filename }) as ReturnType<typeof JSON.parse>;
  };
}

export function execHandler(basedir?: string) {
  const resolver = requireHandler(basedir);

  return function execHandler(value: string) {
    const tuple = value.split('#');
    const module = resolver(tuple[0]);
    const method = module[tuple[1]] || module;

    if (typeof method !== 'function') {
      throw new Error(`exec: unable to find method ${tuple[1] || 'default'} on module ${tuple[0]}`);
    }

    return method();
  };
}

export function globHandler(optionsOrCwd?: GlobOptions | string) {
  const options = typeof optionsOrCwd === 'string' ? { cwd: optionsOrCwd } : optionsOrCwd || {};
  options.cwd = options.cwd || Path.dirname(caller());

  const resolvePath = pathHandler(options.cwd.toString());

  return async function globHandler(value: string) {
    const matches = await glob(value, options);
    return matches.map((relativePath) => resolvePath(relativePath.toString()));
  };
}
