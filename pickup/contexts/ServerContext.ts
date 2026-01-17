// server/ServerContext.ts
import { createContext, useContext } from 'react';
import ServerFacade from '../serverFacade/serverFacade';

export const ServerContext = createContext<ServerFacade | null>(null);

export function useServer() {
  const facade = useContext(ServerContext);
  if (!facade) throw new Error('ServerFacade not provided');
  return facade;
}
