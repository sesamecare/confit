export interface FakeConfigurationSchema {
  jump: {
    howHigh: number;
    over: {
      theMoon: boolean;
    };
  };
}

export const fakeConfigurationSchema: FakeConfigurationSchema = {
  jump: {
    howHigh: 10,
    over: {
      theMoon: false,
    },
  },
};
