import TestWebsocket from './testWebsocket';
import ServerFacade from '../serverFacade/serverFacade';

declare global {
  var testArguments: { useMocks?: boolean } | undefined;
}

export const getWebSocketFacade = (serverFacade?: ServerFacade) => {
    const isMockEnv = process.env.EXPO_PUBLIC_API_MODE === 'mock';
  
    const isTestingArgs = global.testArguments?.useMocks === true;

    if (isMockEnv || isTestingArgs) {
        if (!serverFacade) {
            throw new Error('ServerFacade instance is required for TestWebSocket');
        }
       return new TestWebsocket('test://websocket', serverFacade);
    }

    throw new Error('No server facade implementation for the current mode.');
};