export interface FakeConfigurationSchema {
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
};
