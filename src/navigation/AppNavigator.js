import { View, Text } from 'react-native'
import React from 'react'

//Importing Navigation Components
import { createNativeStackNavigator } from '@react-navigation/native-stack'
//Shared Element Navigation
import { createSharedElementStackNavigator } from 'react-navigation-shared-element'
// const Stack = createNativeStackNavigator()
const Stack = createNativeStackNavigator()

//Importing Screens
import SplashScreen from '../screens/SplashScreen/SplashScreen'
import LoginScreen from '../screens/LoginScreen/LoginScreen'
import MainScreen from '../screens/MainScreen/MainScreen'
import AccountProfileScreen from '../screens/AccountProfileScreen/AccountProfileScreen'
import SearchScreen from '../screens/SearchScreen/SearchScreen'
import ProfileAccountScreen from '../screens/ProfileAccountScreen/ProfileAccountScreen'
import SettingsScreen from '../screens/SettingsScreen/SettingsScreen'
import AccountStatementScreen from '../screens/AccountStatementScreen/AccountStatementScreen'
import DataRangeScreen from '../screens/DataRangeScreen/DataRangeScreen'
import CustomerTransactionsScreen from '../screens/CustomerTransactionsScreen/CustomerTransactionsScreen'
import CustomerProfileScreen from '../screens/CustomerProfileScreen/CustomerProfileScreen'
import CustomerStatementScreen from '../screens/CustomerStatementScreen/CustomerStatementScreen'
import TransactionDetailScreen from '../screens/TransactionDetailScreen/TransactionDetailScreen'
import AddCustomerScreen from '../screens/AddCustomerScreen/AddCustomerScreen'
import AddCustomerManuallyScreen from './../screens/AddCustomerScreen/AddCustomerManuallyScreen';
import GivenReceivedScreen from '../screens/GivenReceivedScreen/GivenReceivedScreen'
import ImageViewerScreen from '../screens/ImageViewerScreen/ImageViewerScreen'

//Importing Context
import ReusedContextProvider from '../context/ReusedContext'

const AppNavigator = () => {
    return (
        <ReusedContextProvider>
            <Stack.Navigator initialRouteName='Splash' screenOptions={{ headerShown: false, animation: 'slide_from_right', }}>
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Main" component={MainScreen} />
                <Stack.Screen name="AccountProfile" component={AccountProfileScreen} />
                <Stack.Screen name="Search" component={SearchScreen} />
                <Stack.Screen name="ProfileAccount" component={ProfileAccountScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="AccountStatements" component={AccountStatementScreen} />
                <Stack.Screen name="DataRange" component={DataRangeScreen} />
                <Stack.Screen name="CustomerTransactions" component={CustomerTransactionsScreen} />
                <Stack.Screen name="CustomerProfile" component={CustomerProfileScreen} />
                <Stack.Screen name="CustomerStatement" component={CustomerStatementScreen} />
                <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
                <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
                <Stack.Screen name="AddCustomerManually" component={AddCustomerManuallyScreen} />
                <Stack.Screen name="GivenReceived" component={GivenReceivedScreen} options={{ animation: 'fade' }} />
                <Stack.Screen name="ImageViewer" component={ImageViewerScreen} />
            </Stack.Navigator>
        </ReusedContextProvider>
    )
}

export default AppNavigator