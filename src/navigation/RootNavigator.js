import { View, Text } from 'react-native'
import React, { useContext, useEffect } from 'react'

//Importing Context
import { AppContext } from '../context/AppContext'

//Importing Navigation Components
// import { NavigationContainer } from '@react-navigation/native'
import { NavigationContainer } from '@react-navigation/native'
import AppNavigator from './AppNavigator'
import AuthNavigator from './AuthNavigator'

const RootNavigator = () => {
    const { isLoggedIn, activeProfile } = useContext(AppContext)

    useEffect(() => {
        isLoggedIn()
    }, [])

    return (
        <NavigationContainer>
            {
                activeProfile != null ? (<AppNavigator />) : (<AuthNavigator />)
            }
        </NavigationContainer>
    )
}

export default RootNavigator