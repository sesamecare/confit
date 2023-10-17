import Path from 'path';

import caller from 'caller';

export function path(basedir?: string) {
  const basedirOrDefault = basedir || Path.dirname(caller());
  return (value: string) => {
    if (Path.resolve(value) === value) {
      // Absolute path already, so just return it.
      return value;
    }
    const components = value.split('/');
    components.unshift(basedirOrDefault);
    return Path.resolve(...components);
  };
}
