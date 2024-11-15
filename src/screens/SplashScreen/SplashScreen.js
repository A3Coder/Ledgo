import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Dimensions,
    Image,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

//Importing Context
import { AppContext } from '../../context/AppContext.js';

//Importing Images
import { SPLASHPNG } from '../../../assets/images/Images.js'

const SplashScreen = () => {
    //Constants
    const navigation = useNavigation();

    //Contexts Data
    const { profiles, activeProfile } = useContext(AppContext)

    var screenName = activeProfile != null ? 'Main' : 'Login'

    useEffect(() => {
        const timer = setTimeout(() => {
            // Using replace to remove Splash Screen from stack
            navigation.replace(screenName);
        }, 2000); // 2 seconds delay

        return () => clearTimeout(timer); // Clear the timer if the component unmounts
    }, [navigation]);

    return (
        <>
            <View style={{ height: Dimensions.get('window').height, backgroundColor: 'white' }}>
                <Image source={SPLASHPNG} resizeMode='cover' style={{ width: '100%', height: '100%' }} />
            </View>
        </>
    )
}

export default SplashScreen