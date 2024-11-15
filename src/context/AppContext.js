import React, { createContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

//Async Storage
import AsyncStorage from "@react-native-async-storage/async-storage";

//Context API
export const AppContext = createContext()

//Importing FireBase Funstions
import { getProfilebyMobileNumber, createProfile } from "../services/profileFunctions";

const AppContextProvider = ({ children }) => {
    //Constants
    const isDarkMode = useColorScheme() === 'dark';

    //States
    const [activeProfile, setactiveProfile] = useState(null) //Default Index of Active Profile

    const THEME = {
        mainScreen: {
            backgroundColor: isDarkMode ? '#252525' : 'white',
            textColor: isDarkMode ? 'white' : 'black'
        }
    };

    //Functions
    const handleActiveProfile = async (idx) => {
        var response = await AsyncStorage.getItem('activeProfile');
        if (response) {
            await AsyncStorage.setItem('activeProfile', JSON.stringify(idx))
            setactiveProfile(idx)
        } else {
            await AsyncStorage.setItem('activeProfile', JSON.stringify(idx))
        }
    }

    const login = async (data) => {
        try {
            //Create Profile CRUD operation should be performed Here
            var res = await getProfilebyMobileNumber(parseInt(data.mobile))

            if (res.length === 0) {
                //Then Create a Profile with the Same Data
                var formattedData = {
                    companyName: data.companyName,
                    mobile: data.mobile,
                }

                const createProfileResponse = await createProfile(formattedData)

                //If Profile Creation Limit Reached
                if (createProfileResponse == 0) {
                    return 0
                }
                //And then set the activeProfile in async Storage
                if (activeProfile != null) {
                    const response = await AsyncStorage.getItem('activeProfile')
                    setactiveProfile(parseInt(JSON.parse(response)))
                    return 1
                }

                await AsyncStorage.setItem('activeProfile', JSON.stringify(0))
                setactiveProfile(0)
                return 1
            }

            //If res.length != 0, then Login
            if (activeProfile != null) {
                const response = await AsyncStorage.getItem('activeProfile')
                setactiveProfile(parseInt(JSON.parse(response)))
                return 1
            }

            await AsyncStorage.setItem('activeProfile', JSON.stringify(0))
            setactiveProfile(0)
            return 1
        } catch (error) {
            console.log(error)
        }
    }

    const logout = () => {
        AsyncStorage.removeItem('activeProfile')
        setactiveProfile(null)
    }

    const isLoggedIn = async () => {
        var activeProfileResponse = await AsyncStorage.getItem('activeProfile')
        if (activeProfileResponse) {
            var activeProfile = JSON.parse(activeProfileResponse);
            setactiveProfile(parseInt(activeProfile))
        } else {
            setactiveProfile(null)
        }
    }

    return (
        <AppContext.Provider value={{ THEME, login, logout, isLoggedIn, activeProfile, handleActiveProfile }}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextProvider