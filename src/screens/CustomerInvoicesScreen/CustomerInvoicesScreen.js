import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Pressable,
    FlatList,
    Image,
    ActivityIndicator,
    ToastAndroid,
    Animated,
} from 'react-native';
import { PermissionsAndroid } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

//Importing Packages
import RNFS from 'react-native-fs';

//Importing My Custom Packages
import { NativeModules } from 'react-native';
const { FileViewer } = NativeModules;

//Importing Asset or Images
import { NODATA } from '../../../assets/images/Images.js';

//Importing Components
import Header from '../../components/CustomHeaders/Header.js';

//Importing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faDownload, faPlus, } from '@fortawesome/free-solid-svg-icons';
import { faReadme } from '@fortawesome/free-brands-svg-icons';

//Importing React Native Components
import { Skeleton } from '@rneui/themed';

//Importing Context
import { ReusedContext } from '../../context/ReusedContext.js';

const CustomerInvoicesScreen = () => {
    //Constants
    const navigation = useNavigation();
    const rippleOptions = useMemo(() => {
        return ({
            foreground: true,
            borderless: false,
            color: '#ebebeb'
        })
    }, [])

    //Data
    const INVOICESDATAFROMDB = useMemo(() => {
        return [ //Only Due Amount
            {
                date: '16/11/2024',
                invoiceNumber: '01',
                fileName: 'invoice.pdf',
                downloaded: false,
                time: '12:50 PM',
            },
            {
                date: '16/11/2024',
                invoiceNumber: '01',
                fileName: 'Invoice_01.pdf',
                downloaded: false,
                time: '12:50 PM',
            },
            {
                date: '14/11/2024',
                invoiceNumber: '02',
                fileName: 'Invoice_02.pdf',
                downloaded: true,
                time: '12:50 PM',
            },
        ]
    }, []) //Should be dependent on Customer Invoices Context

    //States
    const [invoicesData, setinvoicesData] = useState([])

    //Functions
    const navigatorFunction = useCallback((screenName, options = '') => {
        if (screenName === 'CreateInvoiceFromTRN') {
            navigation.navigate(screenName, options)
            return
        }
        // navigation.navigate(screenName)
    }, [navigation])

    // const width = new Animated.Value(0)
    // const widthPercentage = width.interpolate({
    //     inputRange: [0, 1],
    //     outputRange: ['0%', '100%']
    // })

    // useEffect(() => {
    //     Animated.timing(width, {
    //         toValue: 1,
    //         duration: 1500,
    //         useNativeDriver: false
    //     }).start()
    // }, [])
    const openInvoiceFile = async (path) => {
        try {
            console.log(path)
            await FileViewer.openFile(path); //without permissions
        } catch (error) {
            console.log(error)
            ToastAndroid.show('Error in Opening File', ToastAndroid.SHORT)
        }
    }

    const downloadInvoiceFile = () => {
        //Download the File

        //Then Change the State
    }

    useEffect(() => {
        var formattedData = []
        INVOICESDATAFROMDB.forEach(async (obj) => {
            var tempOBJ = {
                date: obj.date,
                invoiceNumber: obj.invoiceNumber,
                fileName: obj.fileName,
                downloadedPath: await filePresentorNot(obj.fileName),
                time: obj.time,
            }

            formattedData.push(tempOBJ)
        })

        setinvoicesData(formattedData)
    }, [INVOICESDATAFROMDB])

    const filePresentorNot = async (fileName) => {
        //Directory where to Look
        await RNFS.mkdir(`${RNFS.ExternalDirectoryPath}/invoices`)
        const directoryPath = `${RNFS.ExternalDirectoryPath}/invoices`

        const files = await RNFS.readDir(directoryPath)

        const fileDetails = files.filter((obj) => {
            return obj.name == fileName
        })

        if (fileDetails.length == 0) {
            return null
        } else {
            return fileDetails[0].path
        }
    }

    //Rendering Item
    const Item = memo(({ data, lastIndex }) => {
        return (
            <Pressable android_ripple={rippleOptions} onPress={() => { data.downloadedPath ? openInvoiceFile(data.downloadedPath) : downloadInvoiceFile() }} style={[{ position: 'relative' }, { width: '100%', maxHeight: 120, backgroundColor: 'white', borderRadius: 5, borderWidth: 0.8, borderColor: '#ebebeb', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', overflow: 'hidden' }]}>
                <View style={{ flex: 1, height: '100%', padding: 8, justifyContent: 'space-between' }}>
                    <View style={[{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                        <Text style={{ paddingHorizontal: 20, paddingVertical: 3, borderRadius: 20, backgroundColor: 'grey', textAlign: 'center', color: 'white', fontFamily: 'Montserrat Medium', fontSize: 12 }}>{data.date}</Text>
                        <Text style={{ paddingHorizontal: 20, paddingVertical: 3, borderRadius: 20, backgroundColor: 'grey', textAlign: 'center', color: 'white', fontFamily: 'Montserrat Medium', fontSize: 12 }}>{data.invoiceNumber}</Text>
                    </View>
                    <Text style={{ width: '100%', textAlign: 'left', color: 'black', fontFamily: 'Montserrat Bold', fontSize: 18 }}>{data.fileName}</Text>
                    <Text style={{ width: '100%', textAlign: 'right', color: '#252525', fontFamily: 'Montserrat Regular', fontSize: 10 }}>Generated at {data.time}</Text>
                </View>
                <View style={{ width: 75, height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ebebeb' }}>
                    <FontAwesomeIcon icon={data.downloadedPath ? faReadme : faDownload} size={20} color='#07D589'></FontAwesomeIcon>
                </View>

                <View style={[{ position: 'absolute', zIndex: -1, left: 0 }, { width: '1%', height: '100%', backgroundColor: '#07D58926' }]}></View>
            </Pressable>
        )
    })

    const renderItem = useCallback(({ item, index }) => {
        return (
            <Item data={item} lastIndex={INVOICESDATAFROMDB.length - 1}></Item>
        )
    }, [invoicesData])

    return (
        <View style={{ height: Dimensions.get('window').height, backgroundColor: 'white' }}>
            <Header heading={'Customer Invoices'}></Header>

            {/* Main Content */}
            <View style={[styles.mainContentContainer]}>
                {/* All Invoices List */}
                <FlatList
                    data={invoicesData}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                />

                {/* Add Invoice Button */}
                <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('CreateInvoiceFromTRN')} style={styles.addCustomerButton}>
                    <View style={{ position: 'relative' }}>
                        <FontAwesomeIcon icon={faPlus} size={13} color='black'></FontAwesomeIcon>
                    </View>
                    <Text style={styles.buttonLabel}>Create Invoice</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    mainContentContainer: { position: 'relative', flex: 1, backgroundColor: 'white', paddingHorizontal: 15, paddingTop: 15, paddingBottom: 1 },
    addCustomerButton: { position: 'absolute', bottom: 10, right: 10, zIndex: 10, width: '50%', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, backgroundColor: '#07D589', elevation: 4 },
    buttonLabel: { fontFamily: 'Montserrat Bold', fontSize: 13, color: 'black' },
    bottomTabContainer: { backgroundColor: 'white', borderTopStartRadius: 20, borderTopEndRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    bottomTabIconContainer: { flex: 1, paddingHorizontal: 60, paddingVertical: 10, justifyContent: 'center', alignItems: 'center', rowGap: 3, },
    bottomTabIcon: { paddingHorizontal: 20, paddingVertical: 5, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    bottomTabLabel: { fontFamily: 'Montserrat Bold', fontSize: 14 },
});

export default CustomerInvoicesScreen