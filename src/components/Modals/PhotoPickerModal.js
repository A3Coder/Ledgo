import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Modal,
    StatusBar,
    Pressable,
    Alert,
    ActivityIndicator
} from 'react-native';

//Importing Packages
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

//Importing Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCameraRetro, faImages } from '@fortawesome/free-solid-svg-icons';

//Importing Contexts
import { ReusedContext } from '../../context/ReusedContext';

//Importing FireBase Functions
import { updateCustomerbydocId } from '../../services/customerFunctions';
import { updateTransactionbyDocId } from '../../services/transactionFunctions';
import { uploadPhoto } from '../../services/cloudStorageFunctions';

const PhotoPickerModal = ({ states, func, dataState, extraData, docId, modalFor }) => {
    //Contexts
    const { forCustomerDetails, forCustomerTransactions, forTrackingChanges } = useContext(ReusedContext)

    const rippleOptions = useMemo(() => {
        return ({
            foreground: true,
            borderless: false,
            color: '#ebebeb'
        })
    }, [])

    const [loading, setloading] = useState(false)

    //Functions
    const handleImagefromGallery = () => {
        launchImageLibrary({ mediaType: 'photo', }, async (res) => {
            if (!res.didCancel) {
                if (dataState) {
                    dataState(res.assets[0].uri)
                    //Call API and Save the Data in DB
                    if (modalFor === 'Customer Profile') {
                        setloading(true)
                        var uploadedPhotoURL = ''
                        var response = await uploadPhoto('customerProfileImages', forCustomerDetails.state.cId, 'CProfilePhoto', res.assets[0].uri)

                        if (response == '') {
                            setloading(false)
                            Alert.alert('Server Problem, Photo Not Updated')
                            return
                        }

                        uploadedPhotoURL = response != '' ? response : ''
                        forCustomerDetails.setState((prev) => { return { ...prev, ['photo']: uploadedPhotoURL != '' ? uploadedPhotoURL : res.assets[0].uri } })
                        try {
                            //Formatted Data - This Format Should not Change as Backend is dependent on it
                            var data = {
                                photo: uploadedPhotoURL != '' ? uploadedPhotoURL : res.assets[0].uri // fieldtoUpdate should be - photo, customerName, mobile, address, smsAlert
                            }
                            var response = await updateCustomerbydocId(docId, data)
                            if (response === 0) {
                                Alert.alert('Data Not Updated')
                                setloading(false)
                                return
                            }
                            forTrackingChanges.func()
                        } catch (error) {
                            Alert.alert(error)
                        } finally {
                            setloading(false)
                        }
                    }
                    if (modalFor === 'Transaction Details') {
                        setloading(true)
                        var uploadedPhotoURL = ''
                        var response = await uploadPhoto('transactionsImages', forCustomerTransactions.state[extraData.indexes.dateIndex].transactions[extraData.indexes.transactionIndex].tId, 'TBillPhoto', res.assets[0].uri)

                        if (response == '') {
                            setloading(false)
                            Alert.alert('Server Problem, Photo Not Updated')
                            return
                        }

                        uploadedPhotoURL = response != '' ? response : ''
                        var tempData = forCustomerTransactions.state
                        tempData[extraData.indexes.dateIndex].transactions[extraData.indexes.transactionIndex]['photo'] = uploadedPhotoURL != '' ? uploadedPhotoURL : res.assets[0].uri
                        forCustomerTransactions.setState(tempData)
                        try {
                            //Formatted Data - This Format Should not Change as Backend is dependent on it
                            var data = {
                                photo: uploadedPhotoURL != '' ? uploadedPhotoURL : res.assets[0].uri // fieldtoUpdate should be - photo, customerName, mobile, address, smsAlert
                            }
                            var response = await updateTransactionbyDocId(docId, data)
                            if (response == 0) {
                                console.log('Error in Updating')
                                setloading(false)
                                return
                            }
                            console.log('Data Updated')
                        } catch (error) {
                            Alert.alert(error)
                        } finally {
                            setloading(false)
                        }
                    }
                }
                func()
            } else {
                console.log(res.errorMessage)
            }
        })
    }

    const handleImagefromCamera = () => {
        launchCamera({ mediaType: 'photo', cameraType: 'back' }, async (res) => {
            if (!res.didCancel) {
                if (dataState) {
                    dataState(res.assets[0].uri)
                    //Call API and Save the Data in DB
                    if (modalFor === 'Customer Profile') {
                        setloading(true)
                        var uploadedPhotoURL = ''
                        var response = await uploadPhoto('customerProfileImages', forCustomerDetails.state.cId, 'CProfilePhoto', res.assets[0].uri)

                        if (response == '') {
                            setloading(false)
                            Alert.alert('Server Problem, Photo Not Uploaded')
                            return
                        }

                        uploadedPhotoURL = response != '' ? response : ''
                        forCustomerDetails.setState((prev) => { return { ...prev, ['photo']: uploadedPhotoURL != '' ? uploadedPhotoURL : res.assets[0].uri } })
                        try {
                            //Formatted Data - This Format Should not Change as Backend is dependent on it
                            var data = {
                                photo: uploadedPhotoURL != '' ? uploadedPhotoURL : res.assets[0].uri // fieldtoUpdate should be - photo, customerName, mobile, address, smsAlert
                            }
                            var response = await updateCustomerbydocId(docId, data)
                            if (response === 0) {
                                setloading(false)
                                Alert.alert('Server Error, Data not Updated')
                                return
                            }
                            forTrackingChanges.func()
                        } catch (error) {
                            Alert.alert(error)
                        } finally {
                            setloading(false)
                        }
                    }
                    if (modalFor === 'Transaction Details') {
                        setloading(true)
                        var uploadedPhotoURL = ''
                        var response = await uploadPhoto('transactionsImages', forCustomerTransactions.state[extraData.indexes.dateIndex].transactions[extraData.indexes.transactionIndex].tId, 'TBillPhoto', res.assets[0].uri)

                        if (response == '') {
                            setloading(false)
                            Alert.alert('Server Problem, Photo Not Uploaded')
                            return
                        }

                        uploadedPhotoURL = response != '' ? response : ''
                        var tempData = forCustomerTransactions.state
                        tempData[extraData.indexes.dateIndex].transactions[extraData.indexes.transactionIndex]['photo'] = uploadedPhotoURL != '' ? uploadedPhotoURL : res.assets[0].uri
                        forCustomerTransactions.setState(tempData)
                        try {
                            //Formatted Data - This Format Should not Change as Backend is dependent on it
                            var data = {
                                photo: uploadedPhotoURL != '' ? uploadedPhotoURL : res.assets[0].uri // fieldtoUpdate should be - photo, customerName, mobile, address, smsAlert
                            }
                            var response = await updateTransactionbyDocId(docId, data)
                            if (response == 0) {
                                setloading(false)
                                Alert.alert('Server Error, Data not Updated')
                                return
                            }
                        } catch (error) {
                            Alert.alert(error)
                        } finally {
                            setloading(false)
                        }
                    }
                }
                func()
            } else {
                console.log(res.errorMessage)
            }
        })
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

            <View style={{ height: Dimensions.get('window').height, backgroundColor: 'rgba(0, 0, 0, 0.150)', position: 'relative' }}>
                {
                    loading && (
                        <View style={{ position: 'absolute', zIndex: 10, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)', gap: 8 }}>
                            <ActivityIndicator size={'large'} color={'#07D589'}></ActivityIndicator>
                            <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 18, color: 'white' }}>Uploading Photo...</Text>
                        </View>
                    )
                }
                <Pressable style={{ flex: 1 }} onPress={func} />

                <View style={{ paddingHorizontal: 15, paddingVertical: 30, borderTopStartRadius: 20, borderTopEndRadius: 20, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 15 }}>
                    <Pressable android_ripple={rippleOptions} onPress={handleImagefromCamera} style={{ justifyContent: 'center', alignItems: 'center', gap: 5, flexGrow: 1 }}>
                        <View style={{ width: 60, height: 60, borderRadius: 100, backgroundColor: '#07D589', justifyContent: 'center', alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faCameraRetro} size={25} color='white'></FontAwesomeIcon>
                        </View>

                        <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 16, color: 'black' }}>Camera</Text>
                    </Pressable>
                    <Pressable android_ripple={rippleOptions} onPress={handleImagefromGallery} style={{ justifyContent: 'center', alignItems: 'center', gap: 5, flexGrow: 1 }}>
                        <View style={{ width: 60, height: 60, borderRadius: 100, backgroundColor: '#07D589', justifyContent: 'center', alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faImages} size={25} color='white'></FontAwesomeIcon>
                        </View>

                        <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 16, color: 'black' }}>Gallery</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}

export default PhotoPickerModal