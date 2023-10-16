export type ShortstopHandler<T> = (value: string) => T | Promise<T>;

export interface ConfitOptions {
  defaults: string;
  basedir: string;
  protocols: Record<string, ShortstopHandler<unknown>>;
}

export type ConfitDeepKeys<T> = {
  [P in keyof T]: P extends string
    ? T[P] extends object
      ? `${P}:${ConfitDeepKeys<T[P]>}` | P
      : P
    : never;
}[keyof T];

export type ConfitPathValue<T, P extends string> = P extends ConfitDeepKeys<T>
  ? P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? Rest extends string
        ? ConfitPathValue<T[K], Rest>
        : never
      : never
    : P extends keyof T
    ? T[P]
    : never
  : never;