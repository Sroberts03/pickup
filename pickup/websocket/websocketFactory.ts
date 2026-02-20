import ServerFacadeRouter from '@/server-facade/ServerFacadeRouter';
import TestWebsocket from './testWebsocket';
import { createSocketClient } from './websocket';

declare global {
  var testArguments: { useMocks?: boolean } | undefined;
}

export const getWebSocketFacade = (serverFacadeRouter: ServerFacadeRouter, token?: string) => {
    const isMockEnv = process.env.EXPO_PUBLIC_API_MODE === 'mock';
  
    const isTestingArgs = global.testArguments?.useMocks === true;

    if (isMockEnv || isTestingArgs) {
        if (!serverFacadeRouter) {
            throw new Error('ServerFacadeRouter instance is required for TestWebSocket');
        }
       return new TestWebsocket(serverFacadeRouter);
    }

    // Production mode - use real Socket.io client
    const serverUrl = process.env.EXPO_PUBLIC_WEBSOCKET_URL || 'http://localhost:3000';
    return createSocketClient(serverUrl);
};