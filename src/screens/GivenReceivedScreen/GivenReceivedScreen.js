import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Dimensions,
    Pressable,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    ToastAndroid
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

//Importing Packages
import DateTimePicker from '@react-native-community/datetimepicker';
import RNFS from 'react-native-fs';

//Importing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAngleDown, faCamera, faCheck, faDeleteLeft, faFilePdf, faNoteSticky, faTrash } from '@fortawesome/free-solid-svg-icons';

//Importing Utilities
import { timeFormat } from '../../utils/ReusableFunctions';

//Importing Modals
import PhotoPickerModal from '../../components/Modals/PhotoPickerModal';

//Importing Components
import Header from '../../components/CustomHeaders/Header';

//Importing Firebase Functions
import { addNewTransaction, getTransactionbyDocId, updateTransactionbyDocId } from '../../services/transactionFunctions';
import { uploadPhoto } from '../../services/cloudStorageFunctions';

//Importing Contexts
import { ReusedContext } from '../../context/ReusedContext';

//Importing My Custom Native Modules
import { NativeModules } from 'react-native';
const { SendDirectSmsModule, AlertDialogModule, OpenSettingsModule, FileViewer } = NativeModules;

const GivenReceivedScreen = () => {
    //Contexts
    const { forCustomerTransactions, forTrackingChanges, forCustomerDetails, forProfile } = useContext(ReusedContext)

    //Constants
    const navigation = useNavigation()
    const route = useRoute()
    const customerId = route.params.customerId
    const status = route.params.screen === 'Given' ? 'due' : 'payment'


    const calcButtonArray = useMemo(() => {
        return (
            Array.from({ length: 10 }, (_, i) => {
                // if (i === 9) {
                //     return '.'
                // }
                if (i === 9) {
                    return 0
                }
                return i + 1
            })
        )
    });
    const rippleOptions = useMemo(() => {
        return ({
            foreground: true,
            borderless: false,
            color: '#ebebeb'
        })
    }, [])

    //States
    const [loader, setloader] = useState(false)
    const [error, setError] = useState(true)
    const [photoModal, setphotoModal] = useState(false)

    const [numInput, setnumInput] = useState('0')
    const [selectedPhoto, setselectedPhoto] = useState(null)
    const [notesInput, setnotesInput] = useState('')

    //States for Generated Invoice
    const [generatedInvoice, setgeneratedInvoice] = useState(null)

    //Functions
    const navigatorFunction = useCallback((screenName, options = '') => {
        navigation.navigate(screenName, options)
    }, [navigation])

    const handlePhotoModal = useCallback(() => {
        setphotoModal(!photoModal)
    }, [photoModal])

    const handleCustomKeyboardInput = useCallback((value) => {
        if (value === '.') {
            if (!numInput.includes('.')) {
                setnumInput((prev) => prev + value)
                return
            } else {
                return
            }
        }
        if (numInput === '0') {
            if (value === '') {
                setnumInput('0')
                return
            }
            setnumInput(value)
        } else {
            if (value === '') {
                if (numInput.length == 1) {
                    setnumInput('0')
                    return
                }
                var numValue = numInput.substring(0, numInput.length - 1)
                setnumInput(numValue)
                return
            }
            setnumInput((prev) => prev + value)
        }
    }, [numInput])

    const handleNotesInput = (text) => {
        setnotesInput(text)
        handleValidation(text)
    }

    const handleValidation = (text) => {
        if (text === '') {
            setError(true)
        } else {
            setError(false)
        }
    }

    const formattedData = (date) => {
        const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
        const month = date.getUTCMonth()

        return `${MONTHS[month]} ${date.getUTCDate()}, ${date.getFullYear()}`
    }

    //Function for Opening Generated Invoice PDF
    const handlePDFView = () => {
        if (generatedInvoice != null && String(generatedInvoice).includes('.pdf')) {
            FileViewer.openFile(generatedInvoice)
        }
    }

    // Function for Setting numInput State from Another Screen
    const handleCreateInvoice = (amount, filePath) => {
        setnumInput(String(amount))
        setgeneratedInvoice(filePath)
    }

    const handleDeleteInvoice = async () => {
        try {
            //Delete the File from Cache Storage
            const path = generatedInvoice
            await RNFS.unlink(path) //To Delete the File

            setgeneratedInvoice(null)
        } catch (error) {
            console.log(error)
        }
    }

    //Date Picker Functions and States
    const [date, setDate] = useState(new Date()); //Billed Date
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setShow(false);
        setDate(currentDate);
    };

    const showMode = () => {
        setShow(true);
        setMode('date');
    };

    const handleSubmit = async () => {
        try {
            setloader(true)
            //upload the photo to Cloud storage if there is a photo
            var uploadedPhotoURL = ''
            if (selectedPhoto != null) {
                //Upload the Photo to Cloud Storage
                var newPhotoId = selectedPhoto.split('/')[8]
                var response = await uploadPhoto('transactionsImages', newPhotoId, 'TBillPhoto', selectedPhoto)

                if (response == '') {
                    setloading(false)
                    Alert.alert('Server Problem, Photo Not Updated')
                    return
                }

                uploadedPhotoURL = response
            }
            var data = {
                cId: customerId,
                amount: parseInt(numInput, 10),
                status: status,
                photo: selectedPhoto != null ? uploadedPhotoURL != '' ? uploadedPhotoURL : selectedPhoto : null,
                notes: notesInput,
                smsDelivered: false,
                addedDate: (new Date()).toLocaleDateString('en-GB'),
                addedTime: timeFormat(new Date()),
                billedDate: date.toLocaleDateString('en-GB'),
            }

            const res = await addNewTransaction(data)

            if (forCustomerDetails.state.smsAlert == true) {
                var totalAmount
                var mobileNumber = `${String(forCustomerDetails.state.mobile).substring(2)}`
                if (route.params.screen == "Given") {
                    totalAmount = (parseInt(route.params.balance) - data.amount)
                } else {
                    totalAmount = (parseInt(route.params.balance) + data.amount)
                }

                const bodySMS =
                    `${route.params.screen == "Given" ? 'Credit' : 'Payment'} of Rs. ${data.amount}
Notes - ${notesInput}
Addedby ${forProfile.state.companyName}
Balance Rs. ${route.params.screen == "Given" ? Math.abs(totalAmount) : Math.abs(totalAmount)} ${totalAmount > 0 ? 'Advance' : 'Due'}

--Ledgo - Khata App`

                await SendDirectSmsModule.sendSms(mobileNumber, bodySMS)
                    .then(async (result) => {
                        data = { ...data, smsDelivered: true }
                        await updateTransactionbyDocId(res, { smsDelivered: true })
                        ToastAndroid.show('Sms sent Successfully to the Customer', ToastAndroid.SHORT)
                    })
                    .catch((error) => {
                        if (error == "Error: SMS permission denied") {
                            ToastAndroid.show('Permission Denied', ToastAndroid.SHORT)
                            AlertDialogModule.showDialog(
                                "Enable SMS Permission",
                                "Finera Ledger needs SMS Persmission to directly send SMS Alerts to the Customers",
                                "Settings",
                                "Cancel",
                                (positiveResponse) => {
                                    OpenSettingsModule.openAppSettings()
                                },
                                (negativeResponse) => {
                                    console.log(negativeResponse)
                                }
                            )
                        }
                        ToastAndroid.show('SMS Not Sent', ToastAndroid.SHORT)
                    });
            }

            if (res) {
                const transactionDetailRes = await getTransactionbyDocId(res)

                if (transactionDetailRes != null) {
                    const prevData = forCustomerTransactions.state
                    const tempData = {
                        date: date.toLocaleDateString('en-GB'),
                        transactions: [
                            {
                                ...transactionDetailRes,
                                docId: res,
                                timing: transactionDetailRes.addedTime,
                                indexes: {
                                    dateIndex: (prevData.length - 1) + 1,
                                    transactionIndex: 0
                                }
                            }
                        ]
                    }

                    prevData.push(tempData)
                    forCustomerTransactions.setState(prevData)
                }

                setloader(false)
                forTrackingChanges.func()
                navigation.goBack()
                return
            }

            setloader(false)
            Alert.alert('Transaction not Added')
        } catch (error) {
            Alert.alert(error)
        }
    }

    return (
        <View style={{ height: Dimensions.get('window').height, backgroundColor: 'white', position: 'relative' }}>
            {/* Overlay for Loader Animation */}
            {
                loader && (
                    <View style={{ position: 'absolute', top: 0, left: 0, zIndex: 12, width: '100%', height: "100%", backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size={'large'} color={'#07D589'}></ActivityIndicator>
                    </View>
                )
            }

            <Header heading={route.params.screen}></Header>

            <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20, justifyContent: 'flex-start', alignItems: 'center', }}>
                <View style={{ marginTop: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2, paddingHorizontal: 10, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#ebebeb' }}>
                    <Text style={[{ fontFamily: 'Montserrat Medium', fontSize: 20, }, route.params.screen === 'Given' ? { color: 'red' } : { color: 'green' }]}>{'\u20B9'}</Text>
                    <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 40, color: 'black' }}>{numInput}</Text>
                </View>

                {/* Date Button */}
                {
                    numInput != '0' && (
                        <Pressable android_ripple={rippleOptions} onPress={showMode} style={{ position: 'relative', marginVertical: 15, justifyContent: 'center', alignItems: 'center', gap: 2, padding: 15, borderWidth: 1, borderColor: '#ebebeb', borderRadius: 7, }}>
                            <Text style={{ position: 'absolute', top: -10, left: 5, fontFamily: 'Montserrat Bold', fontSize: 12, color: 'grey', backgroundColor: 'white', paddingHorizontal: 5 }}>Date</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                                <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 12, color: 'black' }}>{formattedData(date)}</Text>
                                <FontAwesomeIcon icon={faAngleDown} size={12} color='black'></FontAwesomeIcon>
                            </View>
                        </Pressable>
                    )
                }

                {show && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode={mode}
                        is24Hour={true}
                        onChange={onChange}
                        maximumDate={new Date()}
                    />
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
                    {
                        selectedPhoto === null ? (<Pressable android_ripple={rippleOptions} onPress={handlePhotoModal} style={{ width: 80, padding: 8, borderWidth: 1, borderColor: '#07D589', borderRadius: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', gap: 10, overflow: 'hidden' }}>
                            <FontAwesomeIcon icon={faCamera} size={20} color='#07D589'></FontAwesomeIcon>
                            <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 12, color: '#07D589', textAlign: 'center' }}>Add Images</Text>
                        </Pressable>) : (<Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('ImageViewer', { imageUri: selectedPhoto, state: setselectedPhoto })} style={{ width: 80, height: 80, borderRadius: 5, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                            <Image src={selectedPhoto} resizeMode='cover' style={{ width: '100%', height: '100%' }}></Image>
                        </Pressable>)
                    }

                    {/* Images will be here */}
                    {/* <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('ImageViewer')} style={{ width: 80, height: 80, borderRadius: 5, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                        <Image source={BATMAN} resizeMode='cover' style={{ width: '100%', height: '100%' }}></Image>
                    </Pressable> */}
                    {
                        route.params.screen === 'Given' && (generatedInvoice != null ? (<Pressable android_ripple={rippleOptions} onPress={handlePDFView} style={{ position: "relative", width: 80, height: 80, padding: 8, borderWidth: 1, borderColor: '#07D589', borderRadius: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#07D589', gap: 10, }}>
                            <FontAwesomeIcon icon={faFilePdf} size={35} color='white'></FontAwesomeIcon>
                            <TouchableOpacity activeOpacity={0.8} onPress={() => handleDeleteInvoice()} style={[{ position: 'absolute', top: -10, right: -10, zIndex: 10 }, { width: 30, height: 30, backgroundColor: 'white', borderColor: '#07D589', borderWidth: 0.8, borderRadius: 50, justifyContent: 'center', alignItems: 'center' }]}>
                                <FontAwesomeIcon icon={faTrash} size={15} color='#07D589'></FontAwesomeIcon>
                            </TouchableOpacity>
                        </Pressable>) : (
                            <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('CreateInvoice', { func: handleCreateInvoice })} style={{ width: 80, padding: 8, borderWidth: 1, borderColor: '#07D589', borderRadius: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', gap: 10, overflow: 'hidden' }}>
                                <FontAwesomeIcon icon={faFilePdf} size={20} color='#07D589'></FontAwesomeIcon>
                                <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 12, color: '#07D589', textAlign: 'center' }}>Create Invoice</Text>
                            </Pressable>
                        ))
                    }
                </View>
            </View>

            {
                numInput != '0' && (<View style={{ padding: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, backgroundColor: 'white' }}>
                    <View style={[styles.inputContainer]}>
                        <Text style={styles.inputLabel}>Add Description:</Text>

                        <FontAwesomeIcon icon={faNoteSticky} size={20} color={'black'}></FontAwesomeIcon>
                        <TextInput style={styles.input} value={notesInput} onChangeText={(e) => handleNotesInput(e)}></TextInput>
                    </View>

                    {
                        error ? (<View style={{ backgroundColor: "#ebebeb", height: 40, width: 40, borderRadius: 100, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                            <FontAwesomeIcon icon={faCheck} size={15} color='white'></FontAwesomeIcon>
                        </View>) : (<Pressable android_ripple={rippleOptions} onPress={handleSubmit} style={{ backgroundColor: "#07D589", height: 40, width: 40, borderRadius: 100, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                            <FontAwesomeIcon icon={faCheck} size={15} color='white'></FontAwesomeIcon>
                        </Pressable>)
                    }
                </View>)
            }

            {/* Custom Num Keyboard */}
            <View style={{ backgroundColor: 'white', padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', rowGap: 8, flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: "#ebebeb" }}>
                {
                    calcButtonArray.map((num, idx) =>
                    (
                        <TouchableOpacity key={idx} onPress={() => handleCustomKeyboardInput(String(num))} style={[num == 0 ? { width: '66%' } : { width: "32%", }, { paddingVertical: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: '#ebebeb' }]}>
                            <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 22, color: 'black' }}>{num}</Text>
                        </TouchableOpacity>
                    )
                    )
                }
                <TouchableOpacity onPress={() => handleCustomKeyboardInput('')} style={[{ width: "32%", paddingVertical: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 10, alignSelf: 'stretch' }, route.params.screen === 'Given' ? { backgroundColor: '#fab1c4' } : { backgroundColor: '#07D58926' }]}>
                    <FontAwesomeIcon icon={faDeleteLeft} size={23} color='black'></FontAwesomeIcon>
                </TouchableOpacity>
            </View>

            <PhotoPickerModal states={{ modalVisible: photoModal, setModalVisible: setphotoModal }} func={handlePhotoModal} dataState={setselectedPhoto}></PhotoPickerModal>
        </View>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        borderWidth: 2,
        borderRadius: 8,
        borderColor: '#ebebeb',
        paddingHorizontal: 8,
        paddingVertical: 5,
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
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
});

export default GivenReceivedScreen