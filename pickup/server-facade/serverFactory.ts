import ServerFacadeRouter from './ServerFacadeRouter';
import { MockDataStore } from './test-facade/MockDataStore';
import TestAuthFacade from './test-facade/TestAuthFacade';
import TestUserFacade from './test-facade/TestUserFacade';
import TestGameFacade from './test-facade/TestGameFacade';
import TestGroupFacade from './test-facade/TestGroupFacade';
import TestLocationFacade from './test-facade/TestLocationFacade';

declare global {
  var testArguments: { useMocks?: boolean } | undefined;
}

export const getServerFacade = () => {
    const isMockEnv = process.env.EXPO_PUBLIC_API_MODE === 'mock';
  
    const isTestingArgs = global.testArguments?.useMocks === true;

    if (isMockEnv || isTestingArgs) {
       // Create shared data store
       const dataStore = new MockDataStore();
       
       // Create individual test facades
       const authFacade = new TestAuthFacade(dataStore);
       const userFacade = new TestUserFacade(dataStore);
       const gameFacade = new TestGameFacade(dataStore);
       const groupFacade = new TestGroupFacade(dataStore);
       const locationFacade = new TestLocationFacade(dataStore);
       
       // Return the router that composes all facades
       return new ServerFacadeRouter(
           authFacade,
           userFacade,
           gameFacade,
           groupFacade,
           locationFacade
       );
    }

    throw new Error('No server facade implementation for the current mode.');
};