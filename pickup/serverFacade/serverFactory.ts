import TestServerFacade from './testServerFacade';

declare global {
  var testArguments: { useMocks?: boolean } | undefined;
}

export const getServerFacade = () => {
    const isMockEnv = process.env.EXPO_PUBLIC_API_MODE === 'mock';
  
    const isTestingArgs = global.testArguments?.useMocks === true;

    if (isMockEnv || isTestingArgs) {
       return new TestServerFacade();
    }

    throw new Error('No server facade implementation for the current mode.');
};