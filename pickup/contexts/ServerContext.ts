// server/ServerContext.ts
import { createContext, useContext } from 'react';
import ServerFacadeRouter from '../server-facade/ServerFacadeRouter';

export const ServerContext = createContext<ServerFacadeRouter | null>(null);

export function useServer() {
  const facade = useContext(ServerContext);
  if (!facade) throw new Error('ServerFacade not provided');
  return facade;
}
