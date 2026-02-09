// server/ServerContext.ts
import { createContext, useContext } from 'react';
import { WebSocketFacade } from '../websocket/websocket';

export const WebsocketContext = createContext<WebSocketFacade | null>(null);

export function useWebsocket() {
  const facade = useContext(WebsocketContext);
  if (!facade) throw new Error('WebSocketFacade not provided');
  return facade;
}
