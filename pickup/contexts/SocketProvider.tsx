import * as React from 'react';
import { useEffect, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getWebSocketFacade } from '../websocket/websocketFactory';
import { useAuth } from './AuthContext';
import { useServer } from './ServerContext';
import { SocketContext } from './SocketContext';

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { token, user } = useAuth();
  const serverFacade = useServer();

  // Stabilize the facade instance - it doesn't need to change when token/user change
  const socket = React.useMemo(() => {
    return getWebSocketFacade(serverFacade, token || undefined);
  }, [serverFacade, token]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        if (token && user) {
          console.log('[SocketProvider] Connecting socket');
          socket.connect(token);
        }
      } else {
        // Disconnect immediately on 'inactive' or 'background'
        console.log(`[SocketProvider] Disconnecting socket (appState: ${nextAppState})`);
        socket.disconnect();
      }
    };

    // Initial check
    handleAppStateChange(AppState.currentState);

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      console.log('[SocketProvider] Cleanup: removing listeners and disconnecting');
      subscription.remove();
      socket.disconnect();
    };
  }, [socket, token, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
