import ServerFacadeRouter from './ServerFacadeRouter';
import { MockDataStore } from './test-facade/MockDataStore';
import TestAuthFacade from './test-facade/TestAuthFacade';
import TestUserFacade from './test-facade/TestUserFacade';
import TestGameFacade from './test-facade/TestGameFacade';
import TestGroupFacade from './test-facade/TestGroupFacade';
import TestLocationFacade from './test-facade/TestLocationFacade';
import ProdAuthFacade from './prod-facade/ProdAuthFacade';
import ProdUserFacade from './prod-facade/ProdUserFacade';
import ProdGameFacade from './prod-facade/ProdGameFacade';
import ProdGroupFacade from './prod-facade/ProdGroupFacade';
import ProdLocationFacade from './prod-facade/ProdLocationFacade';
import { Platform } from 'react-native';

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

    else {
        let baseUrl: string;
        if (Platform.OS === 'android') {
            baseUrl = process.env.EXPO_PUBLIC_API_ANDROID_BASE_URL || 'http://10.0.2.2:3000/api';
        } else {
            baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
        }   
        const authFacade = new ProdAuthFacade(baseUrl);
        const userFacade = new ProdUserFacade(baseUrl);
        const gameFacade = new ProdGameFacade(baseUrl);
        const groupFacade = new ProdGroupFacade(baseUrl);
        const locationFacade = new ProdLocationFacade(baseUrl);
        
        return new ServerFacadeRouter(
            authFacade,
            userFacade,
            gameFacade,
            groupFacade,
            locationFacade
        );
    }
};