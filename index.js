import { registerRootComponent } from 'expo';

import App from './app/App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
// and ensures the app loads correctly whether run in Expo Go or a native build.
registerRootComponent(App);
