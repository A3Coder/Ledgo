import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Pressable,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert, Linking, Platform
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

//Importing External Packages
import ViewShot from "react-native-view-shot";
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
const WHATSAPP_PACKAGE_NAME = 'com.whatsapp';
const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${WHATSAPP_PACKAGE_NAME}`;

//Importing Components
import Header from '../../components/CustomHeaders/Header.js';

//Importing Modals
import PhotoPickerModal from '../../components/Modals/PhotoPickerModal.js';
import EditInfoModal from '../../components/Modals/CustomerProfileScreenModals/EditInfoModal.js';

//Importing Font Awesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarDay, faCalendarDays, faCameraRetro, faMessage, faNoteSticky, faPencil, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

//Importing Custom Modules
import { NativeModules } from 'react-native';
const { SmsModule } = NativeModules;

//Importing Utilities
import { dateFormat } from '../../utils/ReusableFunctions.js';

//Importing Contexts
import { ReusedContext } from '../../context/ReusedContext.js';

//Importing Dummy Image
import { LOGO } from '../../../assets/images/Images.js';

const TransactionDetailScreen = () => {
    //Context
    const { forCustomerDetails, forProfile } = useContext(ReusedContext)

    //Constants
    const navigation = useNavigation()
    const route = useRoute()
    //for Checking Path
    const path = route.params.path != undefined ? route.params.path : null
    var TRANSACTIONDETAILS = route.params
    const rippleOptions = useMemo(() => {
        return ({
            foreground: true,
            borderless: false,
            color: '#ebebeb'
        })
    })

    //Refs
    const viewShotRef = useRef(null)

    //States
    const [selectedPhoto, setselectedPhoto] = useState(TRANSACTIONDETAILS.photo != null ? TRANSACTIONDETAILS.photo : null)

    const [photoModal, setphotoModal] = useState(false)
    const [editInfoModal, setEditInfoModal] = useState(false);

    const [viewShotURI, setviewShotURI] = useState('')

    const [proptoSend, setproptoSend] = useState({
        heading: '',
        data: ''
    })

    //Transactions Edited State
    const [transactionState, settransactionState] = useState({
        state: TRANSACTIONDETAILS.state,
        editedDate: TRANSACTIONDETAILS.editedDate,
        editedTime: TRANSACTIONDETAILS.editedTime,
        previousAmount: TRANSACTIONDETAILS.previousAmount
    })
    //Function for Editing Transaction State
    const handleEditedStateChange = (data) => {
        const prevData = { ...transactionState }
        prevData.state = "edited"
        prevData.editedDate = data.editedDate
        prevData.editedTime = data.editedTime
        prevData.previousAmount = data.previousAmount

        settransactionState(prevData)
    }

    //From DATABASE
    const [inputInfo, setinputInfo] = useState({
        notes: TRANSACTIONDETAILS.notes,
        amount: TRANSACTIONDETAILS.amount
    })

    //Functions
    const navigatorFunction = useCallback((screenName, options = '') => {
        if (screenName == "ImageViewer") {
            navigation.navigate(screenName, { ...options, docId: TRANSACTIONDETAILS.docId, indexes: TRANSACTIONDETAILS.indexes })
            return
        }
    }, [navigation])

    const handlePhotoModal = useCallback(() => {
        if (path != null && path == "AccountStatement") {
            return
        }
        var temp = {
            indexes: TRANSACTIONDETAILS.indexes, //For Query Purpose
        }
        setproptoSend(temp)
        setphotoModal(!photoModal)
    }, [photoModal])

    const handleEditInfo = useCallback((heading, data) => {
        if (path != null && path == "AccountStatement") {
            return
        }
        var temp = {
            heading: heading,
            data: data,
            indexes: TRANSACTIONDETAILS.indexes, //For Query Purpose
        }
        setproptoSend(temp)
        setEditInfoModal(!editInfoModal)
    }, [editInfoModal])

    const handleSMSPress = () => {
        const number = String(forCustomerDetails.state.mobile).length > 10 ? String(forCustomerDetails.state.mobile).substring(2) : String(forCustomerDetails.state.mobile)
        var bodySMS
        if (TRANSACTIONDETAILS.status == 'due') {
            bodySMS = `${forProfile.state.companyName} has given you a credit of Rs. ${Math.abs(inputInfo.amount)}.${'\n'}Notes: ${inputInfo.notes}${'\n'}Balance: Rs. ${Math.abs(TRANSACTIONDETAILS.balance)} ${TRANSACTIONDETAILS.balance < 0 ? 'Due' : 'Advance'}.`
        } else {
            bodySMS = `Thank You for your payment of Rs. ${Math.abs(inputInfo.amount)} to Finera.${'\n'}Balance: Rs. ${Math.abs(TRANSACTIONDETAILS.balance)} ${TRANSACTIONDETAILS.balance < 0 ? 'Due' : 'Advance'}.`
        }
        SmsModule.sendSms(`+91${String(number)}`, bodySMS, (error, success) => {
            if (error) {
                console.log('Error:', error);
            } else {
                console.log('Success:', success);
            }
        });
    }

    // Function to check if WhatsApp is installed
    const checkWhatsAppInstalled = async () => {
        const url = `whatsapp://send`
        try {
            const isWhatsAppAvailable = await Linking.canOpenURL(url);
            return isWhatsAppAvailable;
        } catch (error) {
            console.log('Error checking WhatsApp installation:', error);
            return false;
        }
    };

    // Function to open WhatsApp with text or image + caption
    const shareToWhatsApp = async ({ text, imageUri, caption }) => {
        const isInstalled = await checkWhatsAppInstalled();

        if (!isInstalled) {
            Alert.alert(
                'WhatsApp not installed',
                'WhatsApp is not installed on your device. Redirecting to Play Store...',
                [
                    {
                        text: 'OK',
                        onPress: () => Linking.openURL(PLAY_STORE_URL),
                    },
                ]
            );
            return;
        }

        try {
            let shareOptions = {
                title: 'Share via WhatsApp',
                social: Share.Social.WHATSAPP,
                failOnCancel: false,
                whatsAppNumber: `91${String(forCustomerDetails.state.mobile).length > 10 ? String(forCustomerDetails.state.mobile).substring(2) : String(forCustomerDetails.state.mobile)}`,  // country code + phone number
            };

            // If image is provided, add image with caption
            if (imageUri) {
                shareOptions = {
                    ...shareOptions,
                    url: imageUri,
                    message: caption || '',
                };
            } else {
                // If it's just text, share text
                shareOptions = {
                    ...shareOptions,
                    message: text,
                };
            }

            // Open WhatsApp with the provided data
            await Share.shareSingle(shareOptions);

            return 'filesent'
        } catch (error) {
            console.log('Error sharing to WhatsApp:', error);
            Alert.alert('Error', 'Failed to share to WhatsApp.');
        }
    };

    const handleShareImageWithCaption = () => {
        //Photo should be from File, Example => file:///data/user/0/com.fineraledger/cache/rn_image_picker_lib_temp_62c33485-9e6f-487e-a564-892f5d46c419.jpg
        // console.log(TRANSACTIONDETAILS.photo)
        // const imageUri = TRANSACTIONDETAILS.photo; // Replace with your image URL
        // const caption = 'This is the caption for the image!';
        // shareToWhatsApp({ imageUri, caption });

        //Now i need to first generate a image template
        viewShotRef.current.capture().then(async (uri) => {
            //Then save it in my app cache
            const imageUri = uri; // Replace with your image URL
            setviewShotURI(uri)
            console.log(imageUri)
            if (TRANSACTIONDETAILS.status == 'due') {
                var caption = `${forProfile.state.companyName} has recorded your due of Rs. ${TRANSACTIONDETAILS.amount} of ${dateFormat(TRANSACTIONDETAILS.billedDate)}`
            } else {
                var caption = `${forProfile.state.companyName} has received your payment of Rs. ${TRANSACTIONDETAILS.amount} on ${dateFormat(TRANSACTIONDETAILS.addedDate)}`
            }
            //Then send it using this method and using that app cache file path
            await shareToWhatsApp({ imageUri, caption });
            //Then after sending the image i must delete it. -- otherwise storage will become full
        });
    };

    useFocusEffect(useCallback(() => {
        const deleteFromCache = async () => {
            if (viewShotURI != "") {
                // Get the cache directory path
                const cacheDir = RNFS.CachesDirectoryPath;
                const fileName = viewShotURI.split('/')[8]
                // Construct the full file path
                const filePath = `${cacheDir}/${fileName}`;
                // Check if the file exists
                const fileExists = await RNFS.exists(filePath);
                if (fileExists) {
                    // Delete the file
                    await RNFS.unlink(filePath);
                    console.log('Success', 'File deleted from cache.');
                } else {
                    console.log('Error', 'File does not exist.');
                }
            }
        }

        setTimeout(() => {
            deleteFromCache()
        }, 2000)
    }, [viewShotURI]))

    return (
        <View style={{ height: Dimensions.get('window').height, backgroundColor: 'white', position: 'relative' }}>
            <Header heading={forCustomerDetails.state.customerName} extraDetails={'transactionDetails'}></Header>

            {/* ViewShot for Sending Image in Whatsapp */}
            <ViewShot ref={viewShotRef} options={{ fileName: "txnsc", format: "jpg", quality: 0.5 }} style={{ position: 'absolute', zIndex: 12, justifyContent: 'center', alignItems: 'center', width: '100%', backgroundColor: 'white', top: '-50%' }}>
                <View style={{ paddingBottom: 20, paddingTop: 20, borderBottomWidth: 2, borderBottomColor: '#ebebeb', width: '100%', height: 80, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={LOGO} resizeMode='contain' style={{ width: '100%', height: '100%' }}></Image>
                </View>
                <View style={{ paddingVertical: 20, width: '100%', justifyContent: 'center', alignItems: 'center', gap: 15 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                        <FontAwesomeIcon icon={faUser} size={12} color='grey'></FontAwesomeIcon>
                        <Text style={{ fontFamily: 'Montserrat Regular', color: 'black' }}>{forCustomerDetails.state.mobile}</Text>
                    </View>
                    <Text style={{ fontFamily: 'Montserrat Medium', color: 'black', fontSize: 15 }}>{TRANSACTIONDETAILS.status === 'due' ? 'CREDIT' : 'PAYMENT'} AMOUNT</Text>
                    <Text style={[{ fontFamily: 'Montserrat Bold', fontSize: 42 }, TRANSACTIONDETAILS.status == 'due' ? { color: 'red' } : { color: 'green' }]}>{'\u20B9'}{TRANSACTIONDETAILS.amount}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 5, borderRadius: 10, borderWidth: 2, borderColor: '#ebebeb', gap: 8 }}>
                        <FontAwesomeIcon icon={faCalendarDay} size={12} color='grey'></FontAwesomeIcon>
                        <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 12 }}>{TRANSACTIONDETAILS.status == 'due' ? dateFormat(TRANSACTIONDETAILS.billedDate) : dateFormat(TRANSACTIONDETAILS.addedDate)}</Text>
                    </View>
                    <Text style={{ fontFamily: 'Montserrat Regular', fontSize: 13, color: 'black' }}>{TRANSACTIONDETAILS.notes}</Text>
                </View>
                {/* <View style={{ paddingVertical: 10, width: '100%', justifyContent: 'center', alignItems: 'flex-end', }}>
                    <Image source={LOGO} resizeMode='contain' style={{ width: '40%', height: 25 }}></Image>
                </View> */}
            </ViewShot>

            {
                path != null && path == "AccountStatement" && (
                    <View style={{ width: '100%', backgroundColor: 'red', paddingHorizontal: 8, paddingVertical: 5, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'Montserrat Bold', textAlign: 'center', fontSize: 8, color: 'white' }}>Details cannot be edited from Account Statements, Edit it from Customer Transactions Screen</Text>
                    </View>
                )
            }

            <ScrollView contentContainerStyle={{ gap: 10 }} showsVerticalScrollIndicator={false} style={{ backgroundColor: '#ebebeb', flex: 1 }}>
                <View style={styles.topAmountContainer}>
                    <View style={styles.topTextContainer}>
                        <Text style={[styles.text1, TRANSACTIONDETAILS.status === 'due' ? { color: 'red' } : { color: 'green' }]}>{'\u20B9'}</Text>
                        <Text style={[styles.text2, TRANSACTIONDETAILS.status === 'due' ? { color: 'red' } : { color: 'green' }]}>{inputInfo.amount}</Text>

                        <TouchableOpacity activeOpacity={0.5} onPress={() => { handleEditInfo('Amount', inputInfo.amount) }} style={styles.amountEditButton}>
                            <FontAwesomeIcon icon={faPencil} size={15} color='#07D589'></FontAwesomeIcon>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.middleSection}>
                    <Text style={styles.middleSectionHeading}>Bills</Text>

                    {
                        selectedPhoto == null ? (<Pressable android_ripple={rippleOptions} onPress={handlePhotoModal} style={styles.addImagesButton}>
                            <FontAwesomeIcon icon={faCameraRetro} size={20} color='#07D589'></FontAwesomeIcon>
                            <Text style={styles.buttonLabel}>Add Images</Text>
                        </Pressable>) : (<Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('ImageViewer', { imageUri: selectedPhoto, state: setselectedPhoto })} style={[styles.addImagesButton, { overflow: 'hidden', borderWidth: 0, borderColor: 'transparent' }]}>
                            <Image src={selectedPhoto} resizeMode='cover' style={{ width: '100%', height: '100%' }}></Image>
                        </Pressable>)
                    }
                </View>

                <View style={styles.middleSection}>
                    <Text style={styles.middleSectionHeading}>NOTES</Text>

                    <Pressable android_ripple={rippleOptions} onPress={() => { handleEditInfo('Notes', inputInfo.notes) }} style={styles.notesContainer}>
                        <FontAwesomeIcon icon={faNoteSticky} size={20} color='black'></FontAwesomeIcon>
                        <Text style={styles.notesText}>{inputInfo.notes}</Text>
                    </Pressable>
                </View>

                <View style={{ backgroundColor: 'white', paddingHorizontal: 20 }}>
                    <View style={styles.bottomListContainer}>
                        <FontAwesomeIcon icon={faMessage} size={20} color='black'></FontAwesomeIcon>
                        <Text style={styles.listText}>{TRANSACTIONDETAILS.smsDelivered ? 'Message Delivered' : 'Message Not Delivered'}</Text>
                    </View>
                    <View style={styles.bottomListContainer}>
                        <FontAwesomeIcon icon={faCalendarDays} size={20} color='black'></FontAwesomeIcon>
                        <Text style={styles.listText}>Transaction added on {dateFormat(TRANSACTIONDETAILS.addedDate)} at {'\n'}{TRANSACTIONDETAILS.addedTime}</Text>
                    </View>
                    <View style={styles.bottomListContainer}>
                        <FontAwesomeIcon icon={faCalendarDay} size={20} color='black'></FontAwesomeIcon>
                        <Text style={styles.listText}>Billed on {dateFormat(TRANSACTIONDETAILS.billedDate)}</Text>
                    </View>
                    {
                        transactionState.state == 'edited' && (
                            <>
                                <View style={styles.bottomListContainer}>
                                    <FontAwesomeIcon icon={faPencil} size={20} color='black'></FontAwesomeIcon>
                                    <Text style={styles.listText}>Edited on {dateFormat(transactionState.editedDate)} at {'\n'}{transactionState.editedTime}</Text>
                                </View>
                                <View style={styles.bottomListContainer}>
                                    <FontAwesomeIcon icon={faPencil} size={20} color='black'></FontAwesomeIcon>
                                    <Text style={styles.listText}>Edited from {'\u20B9'}{transactionState.previousAmount} to {'\u20B9'}{inputInfo.amount}</Text>
                                </View>
                            </>
                        )
                    }
                </View>

                <View style={{ backgroundColor: 'white', paddingHorizontal: 20, marginBottom: 10 }}>
                    <Pressable android_ripple={rippleOptions} style={styles.bottomListContainer}>
                        <FontAwesomeIcon icon={faTrash} size={20} color='red'></FontAwesomeIcon>
                        <Text style={[styles.listText, { color: 'red' }]}>Delete Transaction</Text>
                    </Pressable>
                </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <Pressable android_ripple={rippleOptions} onPress={handleSMSPress} style={[styles.button1]}>
                    <FontAwesomeIcon icon={faMessage} size={18} color='black'></FontAwesomeIcon>
                    <Text style={[styles.buttonText, { color: 'black' }]}>SMS</Text>
                </Pressable>
                <Pressable android_ripple={rippleOptions} onPress={handleShareImageWithCaption} style={[styles.button2, { backgroundColor: '#07D589' }]}>
                    <FontAwesomeIcon icon={faWhatsapp} size={18} color='white'></FontAwesomeIcon>
                    <Text style={styles.buttonText}>Whatsapp</Text>
                </Pressable>
            </View>

            {/* Modals */}
            <PhotoPickerModal states={{ modalVisible: photoModal, setModalVisible: setphotoModal }} func={handlePhotoModal} dataState={setselectedPhoto} extraData={proptoSend} docId={TRANSACTIONDETAILS.docId} modalFor={'Transaction Details'}></PhotoPickerModal>
            <EditInfoModal states={{ modalVisible: editInfoModal, setModalVisible: setEditInfoModal }} func={handleEditInfo} extraData={proptoSend} extraSetStates={setinputInfo} extraFunc={handleEditedStateChange} docId={TRANSACTIONDETAILS.docId} modalFor={'Transaction Details'}></EditInfoModal>
        </View>
    )
}

const styles = StyleSheet.create({
    topAmountContainer: { backgroundColor: 'white', width: '100%', height: 175, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, padding: 20 },
    topTextContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2, flex: 1, position: 'relative' },
    text1: { fontFamily: 'Montserrat Medium', fontSize: 20, color: 'red' },
    text2: { fontFamily: 'Montserrat Bold', fontSize: 50, color: 'red', },
    amountEditButton: { width: 30, height: 30, backgroundColor: '#07D58926', borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
    middleSection: { backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 10, gap: 10 },
    middleSectionHeading: { fontFamily: 'Montserrat Bold', fontSize: 15, color: '#07D589' },
    addImagesButton: { paddingHorizontal: 5, width: 75, height: 90, borderRadius: 10, borderWidth: 1, borderColor: '#07D589', backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', gap: 5, overflow: 'hidden' },
    buttonLabel: { fontFamily: 'Montserrat Medium', fontSize: 12, color: '#07D589', textAlign: 'center', width: '100%' },
    notesContainer: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 15 },
    notesText: { fontFamily: 'Montserrat Medium', fontSize: 14, color: 'black', textAlign: 'left', flex: 1, },
    bottomListContainer: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 15, paddingVertical: 12, borderBottomWidth: 0.8, borderBottomColor: '#ebebeb' },
    listText: { fontFamily: 'Montserrat Medium', fontSize: 14, color: 'black', textAlign: 'left', flex: 1 },
    buttonContainer: { paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    button1: { width: '48%', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, elevation: 3, overflow: 'hidden', backgroundColor: 'white', borderWidth: 0.8, borderColor: 'black' },
    button2: { width: '48%', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, elevation: 3, overflow: 'hidden' },
    buttonText: { fontFamily: 'Montserrat Bold', fontSize: 15, color: 'white' },
});

export default TransactionDetailScreen