export type ShortstopHandler<Input = unknown, Output = unknown> = (
  value: Input,
  filename?: string,
) => Output | Promise<Output>;

export interface ConfitOptions {
  defaults?: string;
  basedir?: string;
  protocols?: Record<
    string,
    ShortstopHandler | ShortstopHandler[] | ShortstopHandler<string> | ShortstopHandler<string>[]
  >;
  excludeEnvVariables?: string[];
}

export interface BaseConfitSchema {
  env: {
    env: string;
    test: boolean;
    development: boolean;
    staging: boolean;
    production: boolean;
  };
}
