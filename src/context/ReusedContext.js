import React, { createContext, useEffect, useState } from "react";

//Importing My Custom Packages
import { NativeModules } from 'react-native';
const { NetworkModule } = NativeModules;

//Context API
export const ReusedContext = createContext()

const ReusedContextProvider = ({ children }) => {
    //Frequently Used States
    const [trackChanges, settrackChanges] = useState(0)
    const [profile, setprofile] = useState({})
    const [totalAccount, settotalAccount] = useState(0)
    const [totalAmount, settotalAmount] = useState(0)

    const [networkConnected, setnetworkConnected] = useState(null)

    //State for Switch Account Modal
    const [allProfiles, setallProfiles] = useState([])

    //Customer States for Main Screen
    const [MAINSCREENDATA, setMAINSCREENDATA] = useState([])

    //Customer Transactions Data States
    const [TRANSACTIONSFROMDB, setTRANSACTIONSFROMDB] = useState([])

    //Customer Details
    const [customerDetails, setcustomerDetails] = useState({})


    //Frequently Used Functions
    const handleChanges = () => {
        settrackChanges((prev) => prev + 1)
    }

    const checkConnected = async () => {
        try {
            const connected = await NetworkModule.isConnected()
            if (connected) {
                setnetworkConnected(true)
                return
            }

            setnetworkConnected(false)
        } catch (error) {
            console.log(error)
        }
    }

    const forTrackingChanges = {
        state: trackChanges,
        func: handleChanges
    }

    const forNetwork = {
        state: networkConnected,
        func: checkConnected
    }

    const forAllProfiles = {
        state: allProfiles,
        setState: setallProfiles
    }

    const forProfile = {
        state: profile,
        setState: setprofile
    }

    const reusedCalculations = {
        totalAmount: totalAmount,
        settotalAmount: settotalAmount,
        totalAccount: totalAccount,
        settotalAccount: settotalAccount
    }

    const forMainScreenCustomers = {
        state: MAINSCREENDATA,
        setState: setMAINSCREENDATA
    }

    const forCustomerTransactions = {
        state: TRANSACTIONSFROMDB,
        setState: setTRANSACTIONSFROMDB
    }

    const forCustomerDetails = {
        state: customerDetails,
        setState: setcustomerDetails
    }

    return (
        <ReusedContext.Provider value={{ forTrackingChanges, forNetwork, forAllProfiles, forProfile, reusedCalculations, forMainScreenCustomers, forCustomerTransactions, forCustomerDetails }}>
            {children}
        </ReusedContext.Provider>
    )
}

export default ReusedContextProvider