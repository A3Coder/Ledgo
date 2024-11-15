import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  useColorScheme,
} from 'react-native';

//Importing Navigation Logic Components
import RootNavigator from './src/navigation/RootNavigator.js';

//Importing Context
import AppContextProvider from './src/context/AppContext.js';

import TestingDataAppeareance from './src/screens/TestingAnimationScreen/TestingDataAppeareance.js';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? 'black' : 'white',
    flex: 1
  };

  return (
    <AppContextProvider>
      <SafeAreaView style={backgroundStyle}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
          animated={true}
          hidden={false}
        />
        <RootNavigator />
      </SafeAreaView>
    </AppContextProvider>
  );
}

export default App;
