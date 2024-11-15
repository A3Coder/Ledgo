import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Dimensions,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    BackHandler,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

//Importing React Native Components
import { Skeleton } from '@rneui/themed';

//Importing Components
import Header from '../../components/CustomHeaders/Header';

//Importing Modals
import PhotoPickerModal from '../../components/Modals/PhotoPickerModal';

//Importing Utils
import { validationFunction } from '../../utils/ReusableFunctions';

//Importing Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faIdBadge, faUser, faCamera, faMobileScreen, faAt, faAddressCard, faSignature, faLock } from '@fortawesome/free-solid-svg-icons';

//Importing FireBase Functions
import { getProfileDetails, updateProfileDetails } from '../../services/profileFunctions';
import { uploadPhoto } from '../../services/cloudStorageFunctions';

//Importing Contexts
import { AppContext } from '../../context/AppContext';
import { ReusedContext } from '../../context/ReusedContext';

const AccountProfileScreen = () => {
    //Contexts
    const { activeProfile } = useContext(AppContext)
    const { forProfile, forAllProfiles } = useContext(ReusedContext)

    const navigation = useNavigation()

    //States
    const [skeletonLoader, setskeletonLoader] = useState(false)
    const [photoModal, setphotoModal] = useState(false)
    const [selectedPhoto, setselectedPhoto] = useState(null)

    const [profileData, setprofileData] = useState({})
    const DATAFROMDB = profileData

    const [loading, setloading] = useState(false)
    const [error, seterror] = useState({
        email: false,
    })

    const [changesRecord, setchangesRecord] = useState({
        photo: false,
        email: false,
        about: false,
        personalName: false
    })

    //Functions
    const handlePhotoModal = useCallback(() => {
        setphotoModal(!photoModal)
    }, [photoModal])


    const handleInputs = (text, id) => {
        var temp = { ...profileData }
        switch (id) {
            case 'email':
                temp = { ...profileData, ['email']: text }
                setprofileData(temp)
                //Match with the DATABASE record
                if (text === DATAFROMDB.email) {
                    setchangesRecord({ ...changesRecord, ['email']: false })
                } else {
                    setchangesRecord({ ...changesRecord, ['email']: true })
                }
                var tempError = { ...error }
                if (text != "") {
                    var status = validationFunction('email', text)
                    if (!status) {
                        tempError = { ...error, ['email']: true }
                        seterror(tempError)
                    } else {
                        tempError = { ...error, ['email']: false }
                        seterror(tempError)
                    }
                } else {
                    tempError = { ...error, ['email']: false }
                    seterror(tempError)
                }
                break

            case 'about':
                temp = { ...profileData, ['about']: text }
                setprofileData(temp)
                if (text === DATAFROMDB.about) {
                    setchangesRecord({ ...changesRecord, ['about']: false })
                } else {
                    setchangesRecord({ ...changesRecord, ['about']: true })
                }
                break

            case 'personalName':
                temp = { ...profileData, ['personalName']: text }
                setprofileData(temp)
                if (text === DATAFROMDB.personalName) {
                    setchangesRecord({ ...changesRecord, ['personalName']: false })
                } else {
                    setchangesRecord({ ...changesRecord, ['personalName']: true })
                }
                break
            default:
                return
        }
    }

    // Special BackHandler
    useEffect(() => {
        const backAction = () => {
            if (!loading) {
                Alert.alert('Save', 'Do you want to Save Changes?', [
                    {
                        text: 'CANCEL',
                        onPress: () => navigation.goBack(),
                        style: 'cancel',
                    },
                    {
                        text: 'YES',
                        //Changes should be saved to Database and Local Storage and then Back
                        onPress: async () => {
                            setloading(true)
                            //First upload the photo to Cloud storage if there is a photo
                            var uploadedPhotoURL = ''
                            if (selectedPhoto != null && selectedPhoto != profileData.photo) {
                                //Upload the Photo to Cloud Storage
                                var response = await uploadPhoto('userProfileImages', profileData.pId, 'ProfilePhoto', selectedPhoto)

                                if (response == '') {
                                    setloading(false)
                                    Alert.alert('Server Problem, Photo Not Updated')
                                    return
                                }

                                uploadedPhotoURL = response
                            }
                            var data = {
                                documentId: profileData.documentId,
                                photo: selectedPhoto != null ? uploadedPhotoURL != '' ? uploadedPhotoURL : selectedPhoto : null,
                                email: profileData.email,
                                about: profileData.about,
                                personalName: profileData.personalName
                            }
                            const res = await updateProfileDetails(data)

                            if (res > 0) {
                                console.log('Data Updated')
                                forProfile.setState((prev) => { return { ...prev, ['photo']: selectedPhoto != null ? uploadedPhotoURL != '' ? uploadedPhotoURL : selectedPhoto : null } })
                                forAllProfiles.setState((prev) => {
                                    var tempData = prev
                                    tempData[activeProfile]['photo'] = selectedPhoto != null ? uploadedPhotoURL != '' ? uploadedPhotoURL : selectedPhoto : null

                                    return [...tempData]
                                })
                                setloading(false)
                                navigation.goBack()
                                return
                            } else {
                                Alert.alert('Data Not Updated')
                                setloading(false)
                                return
                            }
                        }
                    },
                ]);
            } else {
                //Cancel Updation
                navigation.goBack()
                setloading(false)
                return
            }
            return true;
        };

        var status = false
        Object.keys(changesRecord).forEach((item) => {
            if (changesRecord[item] === true) {
                status = true
                return
            }
        })

        if (status) {
            const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                backAction,
            );

            return () => backHandler.remove();
        }

    }, [changesRecord]);

    useEffect(() => {
        if (selectedPhoto != null && selectedPhoto != profileData.photo) {
            setchangesRecord({ ...changesRecord, ['photo']: true })
        }
    }, [selectedPhoto])

    useEffect(() => {
        const fetchData = async () => {
            setskeletonLoader(true)
            const res = await getProfileDetails(activeProfile)

            var tempObj = {
                ...res
            }

            setprofileData(tempObj)
            setselectedPhoto(res.photo != null && res.photo != "" ? res.photo : null)
            setskeletonLoader(false)
        }

        fetchData()
    }, [])

    return (
        <KeyboardAvoidingView behavior={'height'} style={{ height: Dimensions.get('window').height, backgroundColor: 'white', position: 'relative' }}>
            <Header heading={'Profile'}></Header>
            {
                loading && (
                    <View style={{ position: 'absolute', zIndex: 12, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.20)', gap: 8 }}>
                        <ActivityIndicator size={'large'} color={'#07D589'}></ActivityIndicator>
                        <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 18, color: 'white' }}>Saving...</Text>
                    </View>
                )
            }

            <View style={styles.scrollViewContainer}>
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                    {/* Image Profile */}
                    <View style={styles.profilePhotoContainer}>
                        {
                            skeletonLoader ? (
                                <Skeleton width={125} height={125} style={{ borderRadius: 100, backgroundColor: '#ebebeb' }} />
                            ) : (
                                <TouchableOpacity activeOpacity={0.8} onPress={handlePhotoModal} style={styles.profilePhoto}>
                                    {
                                        selectedPhoto == null ? (<FontAwesomeIcon icon={faUser} size={75} color='white'></FontAwesomeIcon>) : (<Image src={selectedPhoto} resizeMode='cover' style={{ width: '100%', height: '100%', borderRadius: 100 }}></Image>)
                                    }

                                    <View style={styles.cameraIconContainer}>
                                        <FontAwesomeIcon icon={faCamera} size={15} color='white'></FontAwesomeIcon>
                                    </View>
                                </TouchableOpacity>
                            )
                        }
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={{ paddingTop: 8 }}>
                            <FontAwesomeIcon icon={faIdBadge} size={28} color='#07D589'></FontAwesomeIcon>
                        </View>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>Business Name</Text>
                            {
                                skeletonLoader ? (<Skeleton height={22} width={'90%'} />) : (<TextInput style={styles.input} value={profileData.companyName} editable={false}></TextInput>)
                            }
                        </View>
                        <View style={{ position: 'absolute', right: 0, top: '30%', justifyContent: "center", alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faLock} size={20} color='#ebebeb'></FontAwesomeIcon>
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={{ paddingTop: 8 }}>
                            <FontAwesomeIcon icon={faMobileScreen} size={28} color='#07D589'></FontAwesomeIcon>
                        </View>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>Mobile Number</Text>
                            {
                                skeletonLoader ? (<Skeleton height={22} width={'90%'} />) : (<TextInput style={styles.input} value={String(profileData.mobile)} editable={false}></TextInput>)
                            }
                        </View>
                        <View style={{ position: 'absolute', right: 0, top: '30%', justifyContent: "center", alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faLock} size={20} color='#ebebeb'></FontAwesomeIcon>
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={{ paddingTop: 8 }}>
                            <FontAwesomeIcon icon={faAt} size={28} color='#07D589'></FontAwesomeIcon>
                        </View>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>Email</Text>
                            {
                                skeletonLoader ? (<Skeleton height={22} width={'90%'} />) : (<TextInput style={styles.input} value={profileData.email} onChangeText={(e) => handleInputs(e, 'email')}></TextInput>)
                            }
                            {
                                error.email && (<Text style={{ ...styles.label, color: 'red', textAlign: 'center' }}>Enter Valid Email</Text>)
                            }
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={{ paddingTop: 8 }}>
                            <FontAwesomeIcon icon={faAddressCard} size={28} color='#07D589'></FontAwesomeIcon>
                        </View>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>About</Text>
                            {
                                skeletonLoader ? (<Skeleton height={22} width={'90%'} />) : (<TextInput style={[styles.input,]} multiline value={profileData.about} onChangeText={(e) => handleInputs(e, 'about')}></TextInput>)
                            }
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={{ paddingTop: 8 }}>
                            <FontAwesomeIcon icon={faSignature} size={28} color='#07D589'></FontAwesomeIcon>
                        </View>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>Personal Name</Text>
                            {
                                skeletonLoader ? (<Skeleton height={22} width={'90%'} />) : (<TextInput style={styles.input} value={profileData.personalName} onChangeText={(e) => handleInputs(e, 'personalName')}></TextInput>)
                            }
                        </View>
                    </View>
                </ScrollView>
            </View >

            {/* Modals */}
            < PhotoPickerModal states={{ modalVisible: photoModal, setModalVisible: setphotoModal }} func={handlePhotoModal} dataState={setselectedPhoto} ></PhotoPickerModal >
        </KeyboardAvoidingView >
    )
}

const styles = StyleSheet.create({
    scrollViewContainer: { flex: 1, paddingHorizontal: 15, },
    profilePhotoContainer: { marginBottom: 40, paddingVertical: 10, justifyContent: 'center', alignItems: 'center' },
    profilePhoto: { width: 125, height: 125, borderRadius: 100, backgroundColor: '#ebebeb', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 3, },
    cameraIconContainer: { position: 'absolute', right: -5, bottom: 10, zIndex: 4, width: 40, height: 40, borderRadius: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#07D589' },
    inputContainer: { position: 'relative', marginBottom: 10, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 15 },
    labelContainer: { flex: 1, gap: 2, paddingBottom: 15, borderBottomWidth: 1, borderColor: '#ebebeb' },
    label: { fontFamily: 'Montserrat Regular', fontSize: 14, color: 'black' },
    input: { paddingVertical: 2, fontSize: 16, fontFamily: 'Montserrat Bold', color: 'black' },
})

export default AccountProfileScreen