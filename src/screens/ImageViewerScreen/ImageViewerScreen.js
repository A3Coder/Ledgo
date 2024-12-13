import React, { useContext, useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Dimensions,
    Pressable,
    Modal,
    StatusBar,
    TouchableOpacity,
    Image,
    ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

//Importing Shared Element
import { SharedElement } from 'react-navigation-shared-element';

//Importing Packages
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';

//Importing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faTrash } from '@fortawesome/free-solid-svg-icons';

//Importing Images
import { BATMAN } from '../../../assets/images/Images';

//Importing FireStore Functions
import { updateTransactionbyDocId } from '../../services/transactionFunctions';

//Importing Contexts
import { ReusedContext } from '../../context/ReusedContext';

const ImageViewerScreen = () => {
    //Contexts
    const { forCustomerDetails, forCustomerTransactions } = useContext(ReusedContext)

    //Constants
    const navigation = useNavigation()
    const route = useRoute()
    const image = route.params != '' && route.params != undefined ? route.params.imageUri : null

    const docId = route.params.docId
    const indexes = route.params.indexes

    //States
    const [loading, setloading] = useState(false)

    //Functions
    const handleDelete = async () => {
        //Delete from State as well as from DB
        //First Delete it from main DB and Then Main State
        setloading(true)
        try {
            //Formatted Data - This Format Should not Change as Backend is dependent on it
            var data = {
                photo: null // Delete Photo by setting it to null
            }
            var response = await updateTransactionbyDocId(docId, data)
            if (response == 0) {
                console.log('Error in Updating')
                return
            }
            console.log('Data Updated')
        } catch (error) {
            Alert.alert(error)
        }
        var tempData = forCustomerTransactions.state
        tempData[indexes.dateIndex].transactions[indexes.transactionIndex]['photo'] = null //Deleting photo by setting it to null
        forCustomerTransactions.setState(tempData)
        if (route.params != '' && route.params.state) {
            route.params.state(null)
            setloading(false)
            navigation.goBack()
        }
    }

    return (
        <View style={{ height: Dimensions.get('window').height, backgroundColor: '#262626', position: 'relative' }}>
            {
                loading && (
                    <View style={{ position: 'absolute', zIndex: 12, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)', gap: 12 }}>
                        <ActivityIndicator size={'large'} color={'#07D589'}></ActivityIndicator>
                        <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 18, color: 'white' }}>Deleting Photo...</Text>
                    </View>
                )
            }
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 20 }}>
                <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.goBack()} style={{ height: 40, width: 40, borderRadius: 100, backgroundColor: 'grey', justifyContent: 'center', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faArrowLeft} size={15} color='white'></FontAwesomeIcon>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.6} onPress={handleDelete} style={{ height: 40, width: 40, borderRadius: 100, backgroundColor: 'grey', justifyContent: 'center', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faTrash} size={15} color='white'></FontAwesomeIcon>
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
                <ReactNativeZoomableView
                    minZoom={1}
                    maxZoom={3}
                >
                    {
                        image != null ? (<Image src={image} resizeMode='contain' style={{ width: '100%', height: '100%' }}></Image>) : (<Image source={BATMAN} resizeMode='contain' style={{ width: '100%', height: '100%' }}></Image>)
                    }
                </ReactNativeZoomableView>
            </View>
        </View>
    )
}

export default ImageViewerScreen