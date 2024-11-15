import React, { useMemo, useState, memo, useEffect, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Pressable,
    Modal,
    StatusBar,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';

//Imporing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faCheck, faMobile, faHome, faNoteSticky, faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';

//Importing Utilities
import { timeFormat } from '../../../utils/ReusableFunctions';

//Importing Contexts
import { ReusedContext } from '../../../context/ReusedContext';

//Import FireStore Functions
import { updateCustomerbydocId } from '../../../services/customerFunctions';
import { updateTransactionbyDocId } from '../../../services/transactionFunctions';

const EditInfoModal = ({ states, func, extraData, extraSetStates, extraFunc, docId, modalFor }) => {
    //Contexts
    const { forCustomerDetails, forCustomerTransactions, forTrackingChanges } = useContext(ReusedContext)

    //States
    const [loader, setloader] = useState(false)
    const [inputValue, setinputValue] = useState(null)
    const [error, seterror] = useState(false)

    useEffect(() => {
        setinputValue(extraData.data)
        handleValidation(extraData.data)
    }, [extraData])

    //Functions
    const handleInputChange = (text) => {
        if (extraData.heading === 'Amount') {
            const pattern = new RegExp(/\D/g)
            if (pattern.test(text) || String(text).charAt(0) === '0') {
                return
            }
            setinputValue(text)
            handleValidation(text)
        } else {
            setinputValue(text)
            handleValidation(text)
        }
    }

    const handleValidation = (text) => {
        var tempError
        if (extraData.heading === 'Mobile Number') {
            const numericInput = text.replace(/\D/g, '');
            setinputValue(numericInput)
            tempError = text.length < 10 ? true : false
            seterror(tempError)
        } else if (extraData.heading === 'Amount') {
            const numericInput = String(text);
            setinputValue(numericInput)
            tempError = text === '' || String(text) === String(extraData.data) ? true : false
            seterror(tempError)
        } else if (extraData.heading === 'Customer Name') {
            tempError = text === '' ? true : false
            seterror(tempError)
        } else if (extraData.heading === 'Notes') {
            tempError = text === '' || String(text) === String(extraData.data) ? true : false
            seterror(tempError)
        }
    }

    const handleGetIcon = () => {
        if (extraData.heading === 'Mobile  Number') {
            return faMobile
        } else if (extraData.heading === 'Address') {
            return faHome
        } else if (extraData.heading === 'Notes') {
            return faNoteSticky
        } else if (extraData.heading === 'Amount') {
            return faIndianRupeeSign
        } else {
            return faUser
        }
    }

    const handleSubmit = async (id) => {
        //Submit the Data to the Backend to Store it in DB
        //and also change the state
        setloader(true)
        var fieldToUpdate = id.split(' ')[0].toLowerCase()
        if (id === 'Customer Name') {
            const splittedStr = id.split(' ')
            fieldToUpdate = splittedStr[0].toLowerCase() + splittedStr[1]
        }
        extraSetStates((prev) => { return ({ ...prev, [fieldToUpdate]: inputValue }) })

        if (modalFor === 'Transaction Details') {
            var tempData = forCustomerTransactions.state
            tempData[extraData.indexes.dateIndex].transactions[extraData.indexes.transactionIndex][fieldToUpdate] = inputValue
            forCustomerTransactions.setState(tempData)
            try {
                //Formatted Data - This Format Should not Change as Backend is dependent on it
                var data = {
                    [fieldToUpdate]: fieldToUpdate == 'amount' ? parseInt(inputValue) : inputValue // fieldtoUpdate should be - photo, customerName, mobile, address, smsAlert
                }
                if (fieldToUpdate == 'amount') {
                    var date = new Date()
                    data.editedDate = date.toLocaleDateString('en-GB')
                    data.editedTime = timeFormat(date)
                    data.previousAmount = extraData.data
                    extraFunc(data)
                    //Also Update the Customer Transaction State
                    tempData[extraData.indexes.dateIndex].transactions[extraData.indexes.transactionIndex].state = "edited" //this should not change
                    tempData[extraData.indexes.dateIndex].transactions[extraData.indexes.transactionIndex].editedDate = data.editedDate
                    tempData[extraData.indexes.dateIndex].transactions[extraData.indexes.transactionIndex].editedTime = data.editedTime
                    tempData[extraData.indexes.dateIndex].transactions[extraData.indexes.transactionIndex].previousAmount = data.previousAmount
                    forCustomerTransactions.setState(tempData)
                    forTrackingChanges.func()
                }
                var res = await updateTransactionbyDocId(docId, data)
                if (res === 0) {
                    console.log('Error in Updating')
                    return
                }
                console.log('Data Updated')
                setloader(false)
                func()
            } catch (error) {
                Alert.alert(error)
                setloader(false)
            }
        } else if (modalFor === 'Customer Profile') {
            forCustomerDetails.setState((prev) => { return ({ ...prev, [fieldToUpdate]: inputValue }) })
            try {
                //Formatted Data - This Format Should not Change as Backend is dependent on it
                var data = {
                    [fieldToUpdate]: inputValue // fieldtoUpdate should be - photo, customerName, mobile, address, smsAlert
                }
                var res = await updateCustomerbydocId(docId, data)
                if (res === 0) {
                    console.log('Error in Updating')
                    return
                }
                console.log('Data Updated')
                if (fieldToUpdate == 'customerName' || id == 'Customer Name') {
                    forTrackingChanges.func()
                }
                setloader(false)
                func()
            } catch (error) {
                Alert.alert(error)
                setloader(false)
            }
        }
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={states.modalVisible}
            onRequestClose={() => {
                func()
            }}>
            <StatusBar
                backgroundColor={'rgba(0, 0, 0, 0.150)'}
            />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} enabled={true} style={{ height: Dimensions.get('window').height, backgroundColor: 'rgba(0, 0, 0, 0.150)', position: 'relative' }}>
                {
                    loader && (
                        <View style={{ position: 'absolute', top: 0, left: 0, zIndex: 12, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size={'large'} color={'#07D589'}></ActivityIndicator>
                        </View>
                    )
                }
                <Pressable onPress={func} style={{ flex: 1 }} />

                <View style={{ backgroundColor: 'white', borderTopStartRadius: 20, borderTopEndRadius: 20, paddingBottom: 25 }}>
                    <View style={{ paddingHorizontal: 15, paddingVertical: 20, borderBottomWidth: 0.8, borderBottomColor: '#ebebeb' }}>
                        <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 16, color: 'black' }}>Edit {extraData.heading}</Text>
                    </View>

                    <View style={{ paddingHorizontal: 15, paddingVertical: 20, }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
                            <View style={[styles.inputContainer]}>
                                <Text style={styles.inputLabel}>Enter {extraData.heading}:</Text>

                                <FontAwesomeIcon icon={handleGetIcon()} size={20} color={'black'}></FontAwesomeIcon>
                                {
                                    extraData.heading === 'Mobile Number' || extraData.heading === "Amount" ? (<TextInput style={styles.input} autoFocus={true} maxLength={10} keyboardType={'numeric'} value={inputValue} onChangeText={(e) => handleInputChange(e)}></TextInput>) : <TextInput style={styles.input} autoFocus={true} keyboardType={'default'} value={inputValue} onChangeText={(e) => handleInputChange(e)}></TextInput>
                                }
                            </View>

                            {
                                error || loader ? (<View style={{ width: 45, height: 45, borderRadius: 50, backgroundColor: '#ebebeb', justifyContent: 'center', alignItems: 'center' }}>
                                    <FontAwesomeIcon icon={faCheck} size={20} color='white'></FontAwesomeIcon>
                                </View>) : (<Pressable android_ripple={{ foreground: true, borderless: false, color: '#ebebeb' }} onPress={() => handleSubmit(extraData.heading)} style={{ width: 45, height: 45, borderRadius: 50, backgroundColor: '#07D589', justifyContent: 'center', alignItems: 'center' }}>
                                    <FontAwesomeIcon icon={faCheck} size={20} color='white'></FontAwesomeIcon>
                                </Pressable>)
                            }
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        borderWidth: 2,
        borderRadius: 8,
        borderColor: '#07D589',
        paddingHorizontal: 8,
        paddingVertical: 5,
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    inputLabel: {
        position: 'absolute',
        zIndex: 1,
        top: -11,
        left: 8,
        paddingHorizontal: 5,
        backgroundColor: 'white',
        fontSize: 13,
        color: '#07D589',
        fontFamily: 'Montserrat SemiBold',
    },
    input: {
        height: 40,
        paddingHorizontal: 8,
        paddingVertical: 0,
        fontFamily: 'Montserrat Regular',
        fontSize: 18,
        color: 'black',
        flex: 1
    },
})

export default memo(EditInfoModal)