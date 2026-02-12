import TestWebsocket from './testWebsocket';
import ServerFacade from '../server-facade/serverFacade';
import { createSocketClient } from './websocket';

declare global {
  var testArguments: { useMocks?: boolean } | undefined;
}

export const getWebSocketFacade = (serverFacade?: ServerFacade, token?: string) => {
    const isMockEnv = process.env.EXPO_PUBLIC_API_MODE === 'mock';
  
    const isTestingArgs = global.testArguments?.useMocks === true;

    if (isMockEnv || isTestingArgs) {
        if (!serverFacade) {
            throw new Error('ServerFacade instance is required for TestWebSocket');
        }
       return new TestWebsocket(serverFacade);
    }

    // Production mode - use real Socket.io client
    const serverUrl = process.env.EXPO_PUBLIC_WEBSOCKET_URL || 'http://localhost:3000';
    return createSocketClient(serverUrl);
};