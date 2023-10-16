export type ShortstopHandler<T> = (value: string) => T | Promise<T>;

export interface ConfitOptions {
  defaults: string;
  basedir: string;
  protocols: Record<string, ShortstopHandler<unknown>>;
}
