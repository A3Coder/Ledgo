import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
    Pressable,
    ScrollView,
    Switch,
    Image,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

//Importing Components
import Header from '../../components/CustomHeaders/Header.js';

//Importing Custom Modules
import { NativeModules } from 'react-native';
const { SmsModule, DialerModule, MakeCallModule, OpenSettingsModule, AlertDialogModule } = NativeModules;

//Importing Modals
import EditInfoModal from '../../components/Modals/CustomerProfileScreenModals/EditInfoModal.js';
import PhotoPickerModal from '../../components/Modals/PhotoPickerModal.js';

//Imporing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faCamera, faMobile, faHome, faSms, faTrash, faLock } from '@fortawesome/free-solid-svg-icons';

//Contexts
import { ReusedContext } from '../../context/ReusedContext.js';

//Importing FireStore Functions
import { updateCustomerbydocId, deleteCustomerbydocId } from '../../services/customerFunctions.js';

const CustomerProfileScreen = () => {
    //Contexts
    const { forCustomerDetails, forTrackingChanges } = useContext(ReusedContext)

    //Constants
    const navigation = useNavigation()
    const rippleOptions = useMemo(() => {
        return ({
            foreground: true,
            borderless: false,
            color: '#ebebeb'
        })
    }, [])

    //Data from DB
    const DATAFROMDB = forCustomerDetails.state
    const docId = DATAFROMDB.docId

    //States
    const [loading, setloading] = useState(false)
    const [selectedPhoto, setselectedPhoto] = useState(DATAFROMDB.photo != null ? DATAFROMDB.photo : null) //Fetch from DB
    const [editInfoModal, setEditInfoModal] = useState(false);
    const [proptoSend, setproptoSend] = useState({
        heading: '',
        data: ''
    })
    const [photoModal, setphotoModal] = useState(false)
    const [smsAlerts, setsmsAlerts] = useState(DATAFROMDB.smsAlert)
    const [inputInfo, setinputInfo] = useState({
        customerName: DATAFROMDB.customerName,
        mobile: String(DATAFROMDB.mobile).length > 10 ? String(DATAFROMDB.mobile).substring(2) : String(DATAFROMDB.mobile),
        address: DATAFROMDB.address
    })

    //Functions
    const handleEditInfo = useCallback((heading, data) => {
        var temp = {
            heading: heading,
            data: data
        }
        setproptoSend(temp)
        setEditInfoModal(!editInfoModal)
    }, [editInfoModal])

    const handlePhotoModal = useCallback(() => {
        setphotoModal(!photoModal)
    }, [photoModal])

    const handleSmsAlert = async (e) => {
        setsmsAlerts(e)
        forCustomerDetails.setState((prev) => { return { ...prev, smsAlert: e } })
        // Call API to set changes on DB
        try {
            //Formatted Data - This Format Should not Change as Backend is dependent on it
            var data = {
                smsAlert: e // fieldtoUpdate should be - photo, customerName, mobile, address, smsAlert
            }

            var res = await updateCustomerbydocId(docId, data)

            if (res === 0) {
                console.log('Error in Updating')
                return
            }

            console.log('Data Updated')
        } catch (error) {
            Alert.alert(error)
        }
    }

    const handleDeleteCustomer = () => {
        AlertDialogModule.showDialog(
            'Confirmation',
            'Are you Sure you want to Delete this Customer?',
            'Yes',
            'No',
            async (positiveResponse) => {
                setloading(true)
                console.log('Positive Response: ', positiveResponse)
                const res = await deleteCustomerbydocId(docId, true, forCustomerDetails.state.cId)

                if (res == 0) {
                    console.log('Not Deleted')
                    setloading(false)
                    return
                }

                console.log('Customer Deleted')
                forTrackingChanges.func()
                setloading(false)
                Alert.alert('Customer Deleted')
                navigation.navigate('Main')
            },
            (negativeResponse) => {
                console.log('Negative Response: ', negativeResponse)
            }
        );
    }

    return (
        <View style={{ height: Dimensions.get('window').height, backgroundColor: 'white', position: 'relative' }}>
            {
                loading && (
                    <View style={{ position: 'absolute', top: 0, left: 0, zIndex: 12, width: '100%', height: "100%", backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size={'large'} color={'#07D589'}></ActivityIndicator>
                    </View>
                )
            }

            <Header heading={'Profile'}></Header>

            <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
                <View style={styles.profilePhotoContainer}>
                    <TouchableOpacity activeOpacity={0.8} onPress={handlePhotoModal} style={styles.profilePhoto}>
                        {
                            selectedPhoto == null ? (<FontAwesomeIcon icon={faUser} size={75} color='white'></FontAwesomeIcon>) : (<Image src={selectedPhoto} resizeMode='cover' style={{ width: '100%', height: '100%', borderRadius: 100 }}></Image>)
                        }

                        <View style={styles.cameraIconContainer}>
                            <FontAwesomeIcon icon={faCamera} size={15} color='white'></FontAwesomeIcon>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ paddingHorizontal: 15, borderBottomWidth: 2, borderBottomColor: '#ebebeb' }}>
                    <Pressable android_ripple={rippleOptions} onPress={() => handleEditInfo('Customer Name', inputInfo.customerName)} style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 10, marginBottom: 10, paddingVertical: 10 }}>
                        <FontAwesomeIcon icon={faUser} size={16} color='#07D589'></FontAwesomeIcon>
                        <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 16, color: 'black', flex: 1 }}>{inputInfo.customerName}</Text>
                    </Pressable>

                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 18, color: 'black', flex: 1, marginBottom: 5 }}>CONTACT INFO</Text>

                        <View style={{ marginLeft: 10, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 10, }}>
                            <FontAwesomeIcon icon={faMobile} size={20} color='#07D589'></FontAwesomeIcon>
                            <Text style={{ paddingVertical: 15, fontFamily: 'Montserrat Medium', fontSize: 16, color: 'black', flex: 1, borderBottomWidth: 1, borderBottomColor: '#ebebeb' }}>{inputInfo.mobile}</Text>
                            <View style={{ position: 'absolute', right: 0, top: '30%', justifyContent: "center", alignItems: 'center' }}>
                                <FontAwesomeIcon icon={faLock} size={20} color='#ebebeb'></FontAwesomeIcon>
                            </View>
                        </View>

                        <Pressable android_ripple={rippleOptions} onPress={() => handleEditInfo('Address', inputInfo.address)} style={{ marginLeft: 10, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 10, }}>
                            <FontAwesomeIcon icon={faHome} size={20} color='#07D589'></FontAwesomeIcon>
                            <Text style={{ paddingVertical: 15, fontFamily: 'Montserrat Medium', fontSize: 16, color: 'black', flex: 1, borderBottomWidth: 1, borderBottomColor: '#ebebeb' }}>{inputInfo.address}</Text>
                        </Pressable>
                    </View>

                    <View>
                        <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 18, color: 'black', flex: 1, marginBottom: 5 }}>COMMUNICATIONS</Text>

                        <Pressable android_ripple={rippleOptions} style={{ marginLeft: 10, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 10, }}>
                            <FontAwesomeIcon icon={faSms} size={20} color='#07D589'></FontAwesomeIcon>
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#ebebeb' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 16, color: 'black' }}>SMS Alerts</Text>
                                    <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 12, color: 'grey' }}>SMS will be automatically sent to your customer with amount and balance after every credit or payment.</Text>
                                </View>
                                <Switch value={smsAlerts} onValueChange={(e) => handleSmsAlert(e)} thumbColor={'#07D589'} trackColor={{ false: '#ebebeb', true: '#07D58926' }}></Switch>
                            </View>
                        </Pressable>

                    </View>

                    <Pressable android_ripple={rippleOptions} onPress={handleDeleteCustomer} style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-start', alignItems: 'center', paddingVertical: 20 }}>
                        <FontAwesomeIcon icon={faTrash} size={16} color='red'></FontAwesomeIcon>
                        <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 16, color: 'red', flex: 1, marginBottom: 5 }}>Delete Customer</Text>
                    </Pressable>
                </View>

            </ScrollView>

            {/* Modals */}
            <EditInfoModal states={{ modalVisible: editInfoModal, setModalVisible: setEditInfoModal }} func={handleEditInfo} extraData={proptoSend} extraSetStates={setinputInfo} docId={docId} modalFor={'Customer Profile'}></EditInfoModal>
            <PhotoPickerModal states={{ modalVisible: photoModal, setModalVisible: setphotoModal }} func={handlePhotoModal} dataState={setselectedPhoto} docId={docId} modalFor={'Customer Profile'}></PhotoPickerModal>
        </View>
    )
}

const styles = StyleSheet.create({
    scrollViewContainer: { flex: 1, paddingHorizontal: 15, },
    profilePhotoContainer: { marginBottom: 20, paddingVertical: 30, justifyContent: 'center', alignItems: 'center', },
    profilePhoto: { width: 125, height: 125, borderRadius: 100, backgroundColor: '#ebebeb', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 3, },
    cameraIconContainer: { position: 'absolute', right: -5, bottom: 10, zIndex: 4, width: 40, height: 40, borderRadius: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#07D589' },
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

export default CustomerProfileScreen