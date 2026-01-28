import TestServerFacade from './testServerFacade';

export const getServerFacade = () => {
  if (process.env.EXPO_PUBLIC_API_MODE === 'mock') {
    return new TestServerFacade();
  }

  if (global.testArguments?.useMocks) {
    return new TestServerFacade();
  }

  throw new Error('No server facade implementation for the current mode.');
};