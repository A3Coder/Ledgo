import React, { useContext, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Dimensions,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    ToastAndroid,
    Alert,
    ActivityIndicator
} from 'react-native';

//Importing Contexts
import { AppContext } from '../../context/AppContext.js';

//Importing Assets
import { LOGO2, PROFILE, LOGO3 } from '../../../assets/images/Images.js';

//Importing Font Awesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMobile, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
    //Contexts
    const { login } = useContext(AppContext)

    //Constants
    const navigation = useNavigation()

    //States
    const [loading, setloading] = useState(false)
    const [inputValues, setinputValues] = useState({
        mobile: '',
        companyName: ''
    })
    const [error, seterror] = useState({
        mobile: true,
        companyName: true
    })

    //Functions
    const handleInputs = (id, text) => {
        var temp = inputValues

        if (id === 'mobile') {
            var pattern = new RegExp(/\D/g)
            if (pattern.test(text)) {
                return
            } else if (text === '0') {
                return
            }
        }
        temp = { ...temp, [id]: text }
        setinputValues(temp)
        handleValidation(id, text)
    }

    const handleNextButton = async () => {
        //Handle Next or Submit Here
        setloading(true)
        var data = {
            companyName: inputValues.companyName,
            mobile: String(inputValues.mobile)
        }

        const res = await login(data)

        if (res === 0) {
            setloading(false)
            ToastAndroid.show('Profile Creation Maximum Limit Reached, Kindly use registered profile to Login', ToastAndroid.LONG)
            return
        }

        setloading(false)
        ToastAndroid.show('Profile Created and Logged In', ToastAndroid.SHORT)
        setTimeout(() => {
            navigation.replace('Main');
        }, 750); // delay by 1 second or adjust as needed
    }

    const handleValidation = (id, text) => {
        if (id === 'companyName') {
            var tempError = text === '' ? true : false
            seterror((prev) => { return ({ ...prev, [id]: tempError }) })
        } else {
            var tempError = text.length < 10 ? true : false
            seterror((prev) => { return ({ ...prev, [id]: tempError }) })
        }
    }

    return (
        <KeyboardAvoidingView behavior={'height'} style={[styles.mainContainer, { position: 'relative' }]}>
            {/* {
                loading && (
                    <View style={[{ position: 'absolute', zIndex: 10, width: Dimensions.get('window').width, height: Dimensions.get('window').height, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' }]}>
                        <ActivityIndicator size={'large'} color={'#07D589'}></ActivityIndicator>
                    </View>
                )
            } */}
            <View style={styles.header}>
                <Image source={LOGO3} resizeMode='contain' style={{ width: 50, height: 50 }}></Image>
                <Text style={styles.headerText}>LEDGO</Text>
            </View>


            <View style={styles.imageContainer}>
                <Image source={PROFILE} resizeMode='contain' style={{ flex: 1 }}></Image>
            </View>

            <View>
                <Text style={styles.heading}>Create Your Profile</Text>

                <View style={[styles.inputContainer, { marginTop: 50 }]}>
                    <Text style={styles.inputLabel}>Enter Mobile Number:</Text>

                    <FontAwesomeIcon icon={faMobile} size={20} color={'#07D589'}></FontAwesomeIcon>
                    <TextInput style={styles.input} value={inputValues.mobile} onChangeText={(e) => handleInputs('mobile', e)} keyboardType='numeric' maxLength={10}></TextInput>
                </View>

                <View style={[styles.inputContainer, { marginTop: 25 }]}>
                    <Text style={styles.inputLabel}>Enter Company Name:</Text>

                    <FontAwesomeIcon icon={faBuilding} size={20} color={'#07D589'}></FontAwesomeIcon>
                    <TextInput style={styles.input} value={inputValues.companyName} onChangeText={(e) => handleInputs('companyName', e)}></TextInput>
                </View>

                <View>
                    {
                        error.mobile || error.companyName ? (
                            <View style={[styles.button, { backgroundColor: '#ebebeb' }]}>
                                <Text style={styles.buttonText}>Next</Text>
                            </View>
                        ) : loading ? (
                            <View style={[styles.button, { backgroundColor: '#ebebeb' }]}>
                                <ActivityIndicator size={'small'} color={'white'}></ActivityIndicator>
                            </View>
                        ) : (
                            <TouchableOpacity activeOpacity={0.7} onPress={handleNextButton} style={styles.button}>
                                <Text style={styles.buttonText}>Next</Text>
                            </TouchableOpacity>
                        )
                    }
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        height: Dimensions.get('window').height,
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 20,
        justifyContent: 'space-between'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerText: {
        fontSize: 20,
        color: '#07D589',
        fontFamily: 'Montserrat Bold'
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 150
    },
    heading: {
        fontSize: 25,
        color: '#262626',
        fontFamily: 'Montserrat Bold'
    },
    inputContainer: {
        width: '100%',
        borderWidth: 2,
        borderRadius: 8,
        borderColor: '#07D589',
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
    button: {
        marginTop: 20,
        alignSelf: 'flex-end',
        width: '35%',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: "#07D589",
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15
    },
    buttonText: {
        fontSize: 15,
        color: 'white',
        fontFamily: 'Montserrat SemiBold',
        textAlign: 'center'
    }
});

export default LoginScreen