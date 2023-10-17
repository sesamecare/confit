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

export interface BaseConfitType {
  env: {
    env: string;
    test: boolean;
    development: boolean;
    staging: boolean;
    production: boolean;
  };
}

export type IntermediateConfigValue =
  | object
  | string
  | number
  | boolean
  | null
  | undefined
  | IntermediateConfigValue[];
