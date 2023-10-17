import { BaseConfitType } from '../src/types';

export interface FakeConfigurationSchema extends BaseConfitType {
  jump: {
    howHigh: number;
    over: {
      theMoon: boolean;
    };
  };
  optional?: {
    still?: string;
    notOptional: string;
  };
}

export const fakeConfigurationSchema: FakeConfigurationSchema = {
  jump: {
    howHigh: 10,
    over: {
      theMoon: false,
    },
  },
  optional: {
    notOptional: 'I am not optional',
  },
  env: {
    env: 'test',
    test: true,
    development: false,
    staging: false,
    production: false,
  },
};
