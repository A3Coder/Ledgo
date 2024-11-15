import React, { useCallback, useContext, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TextInput,
    Pressable,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

//Importing Components
import Header from '../../components/CustomHeaders/Header.js';

//Importing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMobile, faBuilding } from '@fortawesome/free-solid-svg-icons';

//Importing FireBase Functions
import { addCustomer } from '../../services/customerFunctions.js';

//Importing Contexts
import { ReusedContext } from '../../context/ReusedContext.js';

const AddCustomerManuallyScreen = () => {
    //Context
    const { forTrackingChanges, forProfile } = useContext(ReusedContext)

    //Constants
    const navigation = useNavigation()

    //States
    const [isFocused, setisFocused] = useState({
        customerName: false,
        mobile: false,
    })
    const [inputValue, setinputValue] = useState({
        customerName: '',
        mobile: ''
    })
    const [error, setError] = useState({
        customerName: true,
        mobile: true
    })
    const buttonDisabled = !error.customerName && !error.mobile
    const [progressLoader, setprogressLoader] = useState(false)

    //Functions
    const handleInputValues = (text, id) => {
        var temp = { ...inputValue, [id]: text }
        if (id === 'mobile') {
            var pattern = /\D/g
            if (pattern.test(text)) {
                return
            } else {
                temp = { ...inputValue, [id]: text }
                setinputValue(temp)
                handleValidation(text, id)
                return
            }
        }
        setinputValue(temp)
        handleValidation(text, id)
    }

    const handleValidation = (text, id) => {
        if (id === 'mobile') {
            var mobileStatus = text.length < 10 ? true : false
            setError((prev) => { return ({ ...prev, [id]: mobileStatus }) })
            return
        }

        if (text != '') {
            setError((prev) => { return ({ ...prev, [id]: false }) })
        } else {
            setError((prev) => { return ({ ...prev, [id]: true }) })
        }
    }

    const handleFocus = useCallback((_id) => {
        var temp = { ...isFocused }
        temp[_id] = true
        setisFocused(temp)
    }, [isFocused])

    const handleBlur = useCallback((_id) => {
        var temp = { ...isFocused }
        temp[_id] = false
        setisFocused(temp)
    }, [isFocused])

    const handleSubmit = async () => {
        setprogressLoader(true)
        var currentDate = new Date()
        var data = {
            pId: forProfile.state.pId, //Must be Dynamic
            mobile: parseInt(inputValue.mobile, 10),
            customerName: inputValue.customerName,
            photo: null,
            addedOn: currentDate.toLocaleDateString('en-GB')
        }

        const res = await addCustomer(data)

        if (res > 0) {
            setprogressLoader(false)
            Alert.alert('Customer Created')
            forTrackingChanges.func()
            navigation.replace('Main')
        } else {
            setprogressLoader(false)
            Alert.alert('Customer Already Present')
        }
    }

    return (
        <KeyboardAvoidingView behavior={'height'} style={{ height: Dimensions.get('window').height, backgroundColor: 'white', position: 'relative' }}>
            {
                progressLoader && (
                    <View style={{ position: 'absolute', top: 0, left: 0, zIndex: 12, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size={'large'} color={'#07D589'}></ActivityIndicator>
                    </View>
                )
            }
            <Header heading={'Add Customer by Yourself'}></Header>

            <View style={styles.mainContainer}>
                <View style={[styles.inputContainer, isFocused.customerName ? { borderColor: '#07D589' } : { borderColor: '#ebebeb' }]}>
                    <Text style={[styles.inputLabel, isFocused.customerName ? { color: '#07D589' } : { color: 'black' }]}>Enter Company Name:</Text>

                    <FontAwesomeIcon icon={faBuilding} size={20} color={'black'}></FontAwesomeIcon>
                    <TextInput autoFocus={true} onFocus={() => handleFocus('customerName')} onBlur={() => handleBlur('customerName')} value={inputValue.customerName} onChangeText={(e) => handleInputValues(e, 'customerName')} style={styles.input}></TextInput>
                </View>

                <View style={[styles.inputContainer, { marginTop: 30 }, isFocused.mobile ? { borderColor: '#07D589' } : { borderColor: '#ebebeb' }]}>
                    <Text style={[styles.inputLabel, isFocused.mobile ? { color: '#07D589' } : { color: 'black' }]}>Enter Mobile Number:</Text>

                    <FontAwesomeIcon icon={faMobile} size={20} color={'black'}></FontAwesomeIcon>
                    <TextInput onFocus={() => handleFocus('mobile')} onBlur={() => handleBlur('mobile')} keyboardType='numeric' value={inputValue.mobile} onChangeText={(e) => handleInputValues(e, 'mobile')} maxLength={10} style={styles.input}></TextInput>
                </View>

                <TouchableOpacity activeOpacity={0.45} onPress={() => navigation.navigate('AddCustomer')} style={styles.importPhonebookButton}>
                    <Text style={styles.importPhonebookText}>Import From Phonebook</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
                {
                    !buttonDisabled ? (<View style={[styles.button, { backgroundColor: '#ebebeb' }]}>
                        <Text style={styles.buttonText}>Confirm</Text>
                    </View>) : <Pressable android_ripple={{ foreground: true, borderless: false, color: '#ebebeb' }} onPress={handleSubmit} style={[styles.button, { backgroundColor: '#07D589' }]}>
                        <Text style={styles.buttonText}>Confirm</Text>
                    </Pressable>
                }
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    mainContainer: { paddingHorizontal: 15, paddingTop: 25, flex: 1 },
    buttonContainer: { paddingHorizontal: 15, paddingBottom: 15 },
    button: { paddingHorizontal: 20, paddingVertical: 15, borderRadius: 50, justifyContent: 'center', alignItems: 'center', elevation: 3 },
    buttonText: { fontFamily: 'Montserrat Bold', fontSize: 18, color: 'white' },
    inputContainer: {
        borderWidth: 2,
        borderRadius: 8,
        borderColor: '#ebebeb',
        paddingHorizontal: 8,
        paddingVertical: 5,
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center'
    },
    inputLabel: {
        position: 'absolute',
        zIndex: 1,
        top: -11,
        left: 8,
        paddingHorizontal: 5,
        backgroundColor: 'white',
        fontSize: 13,
        color: 'black',
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
    importPhonebookText: { fontFamily: 'Montserrat Bold', fontSize: 12, color: '#07D589', },
    importPhonebookButton: { width: '48%', marginTop: 20, paddingBottom: 3, borderBottomWidth: 1.5, borderBottomColor: '#07D589', justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end' },
});

export default AddCustomerManuallyScreen