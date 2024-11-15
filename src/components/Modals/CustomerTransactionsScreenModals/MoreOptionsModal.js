import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Pressable,
    Modal,
    StatusBar,
    PermissionsAndroid,
    Linking,
    Alert,
    ToastAndroid,
    Image
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

//Importing External Packages
import ViewShot from "react-native-view-shot";
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
const WHATSAPP_PACKAGE_NAME = 'com.whatsapp';
const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${WHATSAPP_PACKAGE_NAME}`;

//Importing Custom Modules
import { NativeModules } from 'react-native';
const { SmsModule, MakeCallModule, OpenSettingsModule, AlertDialogModule } = NativeModules;

//Importing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarDay, faPhone, faReceipt, faSms } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

//Importing Contexts
import { ReusedContext } from '../../../context/ReusedContext';

//Importing Utilities
import { dateFormat } from '../../../utils/ReusableFunctions';

//Importing Image Assets
import { LOGO } from '../../../../assets/images/Images';

const MoreOptionsModal = ({ states, func, extraData }) => {
    //Contexts
    const { forCustomerDetails, forProfile } = useContext(ReusedContext)

    //Constants
    const navigation = useNavigation()
    const rippleOptions = useMemo(() => {
        return ({
            foreground: true,
            borderless: false,
            color: '#ebebeb'
        })
    }, [])
    const phoneNumber = extraData.mobile

    //Refs
    const viewShotRef = useRef(null)

    //States
    const [viewShotURI, setviewShotURI] = useState('')

    //Functions
    const handleReportPress = () => {
        //Disable Modal before navigating
        func()
        navigation.navigate('CustomerStatement', { customerId: forCustomerDetails.state.cId, customerName: forCustomerDetails.state.customerName })
    }
    const handleCallPress = () => {
        const number = String(phoneNumber).length > 10 ? String(phoneNumber).substring(2) : String(phoneNumber)
        MakeCallModule.makeCall(String(number))
            .then(success => {
                console.log('Call Success:', success);
            })
            .catch(error => {
                ToastAndroid.show('Permission is Required to make calls', ToastAndroid.SHORT)
                console.log('Call Error:', error);

                AlertDialogModule.showDialog(
                    'Permission Required',
                    'Phone Permission is Required to make calls, you can go to settings and allow phone permission for Finera Ledger App',
                    'Settings',
                    'Cancel',
                    (positiveResponse) => {
                        console.log('Positive Response: ', positiveResponse)
                        OpenSettingsModule.openAppSettings()
                    },
                    (negativeResponse) => {
                        console.log('Negative Response: ', negativeResponse)
                    }
                );
            });
    }

    const handleSMSPress = () => {
        const number = String(phoneNumber).length > 10 ? String(phoneNumber).substring(2) : String(phoneNumber)
        const bodySMS = `${forProfile.state.companyName}: Your balance of ${Math.abs(extraData.data.balance)} is ${extraData.data.balance < 0 ? 'Due' : 'Advance'}${'\n'}${'\t'}${'\t'} -- Ledgo - Khata App`
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
        //Now i need to first generate a image template
        viewShotRef.current.capture().then(async (uri) => {
            //Then save it in my app cache
            const imageUri = uri; // Replace with your image URL
            setviewShotURI(uri)
            if (extraData.data.balance < 0) {
                var caption = `Your balance of Rs. ${Math.abs(extraData.data.balance)} is due.`
            } else {
                var caption = `Your balance of Rs. ${Math.abs(extraData.data.balance)} is advance.`
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
        }, 3000)
    }, [viewShotURI]))

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

            <View style={{ height: Dimensions.get('window').height, backgroundColor: 'rgba(0, 0, 0, 0.150)', position: 'relative' }}>
                <Pressable onPress={func} style={{ flex: 1 }} />

                {/* ViewShot for Sending Image in Whatsapp */}
                <ViewShot ref={viewShotRef} options={{ fileName: "txnsc", format: "jpg", quality: 0.5 }} style={{ position: 'absolute', zIndex: 12, justifyContent: 'center', alignItems: 'center', width: '100%', backgroundColor: 'white', top: '-70%' }}>
                    <View style={{ paddingBottom: 20, paddingTop: 20, borderBottomWidth: 2, borderBottomColor: '#ebebeb', width: '100%', height: 80, justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={LOGO} resizeMode='contain' style={{ width: '100%', height: '100%' }}></Image>
                    </View>
                    <View style={{ paddingVertical: 20, width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#07D589' }}>
                        <View style={{ width: '80%', paddingVertical: 10, backgroundColor: 'white', borderRadius: 25, justifyContent: 'center', alignItems: 'center', gap: 5 }}>
                            <Text style={{ fontFamily: 'Montserrat Bold', color: 'black', fontSize: 15 }}>{extraData.data.balance < 0 ? 'Payment Due' : 'Payment Advance'}</Text>
                            <Text style={[{ fontFamily: 'Montserrat Bold', fontSize: 42 }, extraData.data.balance < 0 ? { color: 'red' } : { color: 'green' }]}>{'\u20B9'}{Math.abs(extraData.data.balance)}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 5, borderRadius: 10, borderWidth: 2, borderColor: '#ebebeb', gap: 8 }}>
                                <FontAwesomeIcon icon={faCalendarDay} size={12} color='grey'></FontAwesomeIcon>
                                <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 12 }}>{dateFormat(new Date().toLocaleDateString('en-GB'))}</Text>
                            </View>
                        </View>
                    </View>
                </ViewShot>

                <View style={{ backgroundColor: 'white', borderTopStartRadius: 20, borderTopEndRadius: 20, paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'flex-start', rowGap: 20 }}>
                    <Pressable android_ripple={rippleOptions} onPress={handleReportPress} style={{ paddingHorizontal: 20, paddingVertical: 10, justifyContent: 'center', alignItems: 'center', gap: 5, }}>
                        <View style={{ height: 50, width: 50, borderRadius: 100, backgroundColor: '#075898', justifyContent: 'center', alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faReceipt} size={18} color='white'></FontAwesomeIcon>
                        </View>
                        <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 11, color: 'black' }}>Report</Text>
                    </Pressable>
                    <Pressable android_ripple={rippleOptions} onPress={handleCallPress} style={{ paddingHorizontal: 20, paddingVertical: 10, justifyContent: 'center', alignItems: 'center', gap: 5, }}>
                        <View style={{ height: 50, width: 50, borderRadius: 100, backgroundColor: '#07D589', justifyContent: 'center', alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faPhone} size={18} color='white'></FontAwesomeIcon>
                        </View>
                        <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 11, color: 'black' }}>Call</Text>
                    </Pressable>
                    <Pressable android_ripple={rippleOptions} onPress={handleSMSPress} style={{ paddingHorizontal: 20, paddingVertical: 10, justifyContent: 'center', alignItems: 'center', gap: 5, }}>
                        <View style={{ height: 50, width: 50, borderRadius: 100, backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faSms} size={18} color='white'></FontAwesomeIcon>
                        </View>
                        <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 11, color: 'black' }}>SMS</Text>
                    </Pressable>
                    <Pressable android_ripple={rippleOptions} onPress={handleShareImageWithCaption} style={{ paddingHorizontal: 20, paddingVertical: 10, justifyContent: 'center', alignItems: 'center', gap: 5, }}>
                        <View style={{ height: 50, width: 50, borderRadius: 100, backgroundColor: 'green', justifyContent: 'center', alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faWhatsapp} size={18} color='white'></FontAwesomeIcon>
                        </View>
                        <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 11, color: 'black' }}>Whatsapp</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}

export default MoreOptionsModal