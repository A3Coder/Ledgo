import { View, Text } from 'react-native'
import React from 'react'

//Importing Navigation Components
import { createNativeStackNavigator } from '@react-navigation/native-stack'
//Shared Element Navigation
import { createSharedElementStackNavigator } from 'react-navigation-shared-element'
const Stack = createSharedElementStackNavigator()

//Importing Screens
import SplashScreen from '../screens/SplashScreen/SplashScreen'
import LoginScreen from '../screens/LoginScreen/LoginScreen'

const AuthNavigator = () => {
  return (
    <Stack.Navigator initialRouteName='Splash' screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  )
}

export default AuthNavigator