// contexts/SocketContext.ts
import { createContext, useContext } from 'react';
import { WebSocketFacade } from '../websocket/websocket';

export const SocketContext = createContext<WebSocketFacade | null>(null);

export function useSocket() {
  const facade = useContext(SocketContext);
  if (!facade) throw new Error('WebSocketFacade not provided');
  return facade;
}
