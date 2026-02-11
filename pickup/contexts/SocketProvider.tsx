import React, { useEffect, useState, ReactNode } from 'react';
import { WebSocketFacade } from '../websocket/websocket';
import { getWebSocketFacade } from '../websocket/websocketFactory';
import { useAuth } from './AuthContext';
import { useServer } from './ServerContext';
import { SocketContext } from './SocketContext';

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocketFacade | null>(null);
  const { token, user } = useAuth();
  const serverFacade = useServer();

  useEffect(() => {
    // Initialize the socket facade
    const socketFacade = getWebSocketFacade(serverFacade, token || undefined);
    setSocket(socketFacade);

    // Auto-connect when we have a token
    if (token && user) {
      console.log('[SocketProvider] Connecting socket with token');
      socketFacade.connect(token);
    }

    // Cleanup on unmount
    return () => {
      console.log('[SocketProvider] Cleaning up socket');
      socketFacade.disconnect();
    };
  }, [token, user, serverFacade]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
