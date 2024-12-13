import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
    StatusBar,
    Modal,
    Platform,
    Alert,
} from 'react-native';
import { PermissionsAndroid } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

//Importing React Native Pacakages
import { Buffer } from 'buffer'; // Import the buffer polyfill
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs'; // Optional: For file handling

//Importing My Custom Packages
import { NativeModules } from 'react-native';
const { FileViewer, DownloadManagerModule } = NativeModules;

//Importing Asset or Images
import { NODATA } from '../../../assets/images/Images.js';

//Importing Components
import Header from '../../components/CustomHeaders/Header.js';

//Importing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck, faEye, faFilePdf, faLongArrowUp, } from '@fortawesome/free-solid-svg-icons';
//Importing React Native Components
import { Skeleton } from '@rneui/themed';

//Data Formatting Functions
import { formatDataforInvoice } from '../../data/CreateCustomerInvoiceData/formatDataforInvoice.js';

//Importing Context
import { ReusedContext } from '../../context/ReusedContext.js';

//Importing Utils
import { backendURL } from '../../utils/backendApiURL.js';

const CreateInvoiceFromTransactions = () => {
    //Contexts
    const { forCustomerTransactions, forCustomerDetails } = useContext(ReusedContext)

    //Constants
    const navigation = useNavigation()
    const rippleOptions = useMemo(() => {
        return ({
            foreground: true,
            borderless: false,
            color: '#ebebeb'
        })
    }, [])

    //Data
    const DATA = useMemo(() => {
        return (
            formatDataforInvoice(forCustomerTransactions.state) //Only Due Amounts
        )
    }, [forCustomerTransactions.state])

    //States
    const [loading, setloading] = useState(false)
    const [selectedItemIndex, setselectedItemIndex] = useState([])
    const totalSelected = selectedItemIndex.length

    //States for Modal
    const [previewData, setpreviewData] = useState([])
    const [previewDataTotal, setpreviewDataTotal] = useState(0)
    const [previewModal, setpreviewModal] = useState(false)

    //Functions
    const handleSelectItem = useCallback((idx) => {
        setselectedItemIndex((prevSelected) => {
            // If the index is already selected, remove it; otherwise, add it
            if (prevSelected.includes(idx)) {
                return prevSelected.filter(item => item !== idx);
            } else {
                return [...prevSelected, idx];
            }
        });
    }, []);

    const clearSelectedItems = () => {
        setselectedItemIndex([])
    }

    const handlePreviewModal = useCallback(() => {
        setpreviewModal(!previewModal)
    }, [previewModal])

    const handlePreview = () => {
        var selectedDatas = []
        var totalAmount = 0
        selectedItemIndex.forEach((idx) => {
            totalAmount = totalAmount + DATA[idx].amount
            selectedDatas.push(DATA[idx])
        })

        setpreviewData(selectedDatas)
        setpreviewDataTotal(totalAmount)
        handlePreviewModal()
    }

    const handleGeneratePDF = async () => {
        try {
            if (selectedItemIndex.length == 0) {
                ToastAndroid.show('No Data Selected', ToastAndroid.SHORT)
                return
            }
            //First Format the Data
            setloading(true)
            var selectedDatas = []
            var totalAmount = 0
            selectedItemIndex.forEach((idx) => {
                totalAmount = totalAmount + DATA[idx].amount
                selectedDatas.push(DATA[idx])
            })

            //Customer Details
            var customerDetails = {
                name: forCustomerDetails.state.customerName,
                address: forCustomerDetails.state.address != null ? forCustomerDetails.state.address : ''
            }

            //Generate the PDF from Backend
            const response = await generatePDF({ transactions: selectedDatas, totalAmount: totalAmount, customerDetails: customerDetails })

            if (response == null) {
                throw new Error('Failed to Generate PDF');
            }

            // Step 3: Convert the Blob to an array buffer (for binary data)
            const arrayBuffer = response
            // Convert ArrayBuffer to a Buffer (Node.js compatible)
            const buffer = Buffer.from(new Uint8Array(arrayBuffer));

            // Step 4: Get the path to save the file
            await RNFS.mkdir(`${RNFS.ExternalDirectoryPath}/invoices`)
            const cachesPath = `${RNFS.ExternalDirectoryPath}/invoices/invoice.pdf`;

            // Step 5: Write the binary data (Buffer) to the file
            await RNFS.writeFile(cachesPath, buffer.toString('base64'), 'base64');

            // Step 6: Toast the user about successful download
            ToastAndroid.show('Invoice Generated Successfully', ToastAndroid.SHORT)

            //Save the Invoice to the Cloud Storage

            //Then to the Database

            //Then Navigate Backwards to the Screen
        } catch (error) {
            console.log('PDF generation failed', error);
            ToastAndroid.show('PDF Generation Failed', ToastAndroid.SHORT)
        } finally {
            setloading(false)
        }
    };

    const generatePDF = async (data) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // Set timeout to 10 seconds

            const queryString = `items=${encodeURIComponent(JSON.stringify(data.transactions))}&totalAmount=${data.totalAmount}&customerDetails=${encodeURIComponent(JSON.stringify(data.customerDetails))}`;
            const url = `http://${backendURL}/invoices/generate?${queryString}`;

            // Step 1: Fetch the PDF from the server
            const response = await fetch(url, { signal: controller.signal });

            // //Download Using Download Manager
            // const filePath = `ledgo-invoices` // storage/emulated/0/Download/ledgo-invoices
            // const downloadId = await DownloadManagerModule.downloadFile(url, 'invoice.pdf', filePath);
            // console.log(`Download started with ID: ${downloadId}`);

            clearTimeout(timeoutId); // Clear the timeout if fetch completes in time

            if (!response.ok) {
                throw new Error('Failed to download PDF');
            }

            // Step 2: Convert the response to a Blob
            const blob = await response.blob();

            // Convert blob to ArrayBuffer using FileReader
            const arrayBuffer = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsArrayBuffer(blob);
            });

            // Use the ArrayBuffer for saving to a database or other operations
            console.log("ArrayBuffer length:", arrayBuffer.byteLength);

            return arrayBuffer;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request timed out');
                Alert.alert('Error', 'Request timed out');
            } else {
                console.log('Error downloading PDF:', error);
                Alert.alert('Error', 'Failed to download PDF');
            }
        }
    }

    //Rendering Item
    const Item = memo(({ data, lastIndex, idx }) => {
        const selected = selectedItemIndex.includes(idx)
        const number = selected ? selectedItemIndex.indexOf(idx) + 1 : null

        return (
            <Pressable android_ripple={rippleOptions} onPress={() => handleSelectItem(idx)} style={[selected ? { backgroundColor: '#07D58926', } : { backgroundColor: 'white', borderWidth: 1 }, { position: 'relative', width: '100%', padding: 5, justifyContent: 'center', alignItems: 'flex-start', gap: 3, borderColor: '#ebebeb', borderRadius: 8, overflow: 'hidden' }]}>
                <View style={{ justifyContent: 'center', alignItems: 'flex-start' }}>
                    <Text style={{ paddingHorizontal: 20, paddingVertical: 3, borderRadius: 20, backgroundColor: 'grey', color: 'white', fontFamily: 'Montserrat Medium', fontSize: 11 }}>{data.date}</Text>
                </View>
                <View style={[{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 5 }]}>
                    <FontAwesomeIcon icon={faLongArrowUp} size={18} color={data.status === 'payment' ? 'green' : 'red'}></FontAwesomeIcon>
                    <Text style={[{ fontFamily: 'Montserrat Bold', fontSize: 18, flex: 1 }, data.status === 'payment' ? { color: 'green' } : { color: 'red' }]}>{'\u20B9'}{data.amount}</Text>
                </View>

                <View style={[{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 5 }, { alignSelf: 'flex-end' }]}>
                    <Text style={{ fontFamily: 'Montserrat Regular', fontSize: 12, color: 'grey', }}>{data.timing}</Text>
                    <FontAwesomeIcon icon={faCheck} size={12} color='grey'></FontAwesomeIcon>
                </View>
                <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 12, color: 'grey' }}>{data.notes}</Text>

                {
                    number != null && (<View style={[{ position: 'absolute', top: 8, right: 8, zIndex: 10 }, { width: 20, height: 20, backgroundColor: '#07D589', justifyContent: 'center', alignItems: 'center', borderRadius: 50 }]}>
                        <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 10, color: 'white' }}>{number}</Text>
                    </View>)
                }
            </Pressable>
        )
    })

    const renderItem = useCallback(({ item, index }) => {
        return (
            <Item data={item} lastIndex={DATA.length - 1} idx={index}></Item>
        )
    }, [DATA, selectedItemIndex])

    return (
        <View style={{ height: Dimensions.get('window').height, backgroundColor: 'white', position: 'relative' }}>
            <Header heading={'Create Invoice'}></Header>

            {
                loading && (
                    <View style={[{ position: 'absolute', top: 0, left: 0, zIndex: 10 }, { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.2)' }]}>
                        <ActivityIndicator size={'large'} color={'#07D589'}></ActivityIndicator>
                        <Text style={{ fontFamily: 'Montserrat Bold', color: 'white', fontSize: 18 }}>Generating PDF...</Text>
                    </View>
                )
            }

            {/* Main Content */}
            <View style={[styles.mainContentContainer]}>
                {
                    DATA.length != 0 && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            {
                                totalSelected != 0 && (
                                    <Pressable android_ripple={rippleOptions} onPress={clearSelectedItems} style={{ paddingHorizontal: 15, paddingVertical: 5, borderRadius: 6, backgroundColor: 'red', overflow: 'hidden' }}>
                                        <Text style={{ color: 'white', fontSize: 12, fontFamily: 'Montserrat Medium' }}>Clear</Text>
                                    </Pressable>
                                )
                            }
                            <Text style={{ color: 'black', flex: 1, fontSize: 15, fontFamily: 'Montserrat Medium', textAlign: 'right' }}>Selected: {totalSelected} / {DATA.length}</Text>
                        </View>
                    )
                }

                {
                    DATA.length != 0 ? (
                        <FlatList
                            data={DATA}
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ gap: 8 }}
                        />
                    ) : (
                        <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', rowGap: 20, overflow: 'hidden' }}>
                            <Image source={NODATA} resizeMode='cover' style={{ width: '100%', height: 175 }}></Image>
                            <Text style={{ width: '100%', fontFamily: 'Montserrat Bold', fontSize: 12, textAlign: 'center', color: '#07D589' }}>No Dues are Found for this Customer</Text>
                        </View>
                    )
                }
            </View>

            <View style={styles.buttonContainer}>
                <Pressable android_ripple={rippleOptions} onPress={handlePreview} style={[styles.button1]}>
                    <FontAwesomeIcon icon={faEye} size={18} color='black'></FontAwesomeIcon>
                    <Text style={[styles.buttonText, { color: 'black' }]}>Preview</Text>
                </Pressable>
                <Pressable android_ripple={rippleOptions} onPress={handleGeneratePDF} style={[styles.button2, { backgroundColor: '#07D589' }]}>
                    <FontAwesomeIcon icon={faFilePdf} size={18} color='white'></FontAwesomeIcon>
                    <Text style={styles.buttonText}>Generate</Text>
                </Pressable>
            </View>

            {/* Modals */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={previewModal}
                onRequestClose={() => {
                    handlePreviewModal()
                }}>
                <StatusBar
                    backgroundColor={'rgba(0, 0, 0, 0.150)'}
                />

                <View style={{ height: Dimensions.get('window').height, backgroundColor: 'rgba(0, 0, 0, 0.150)' }}>
                    <Pressable style={{ flex: 1 }} onPress={handlePreviewModal} />
                    <View style={{ width: '100%', backgroundColor: 'white', borderTopRightRadius: 20, borderTopLeftRadius: 20 }}>
                        <View style={{ padding: 15, justifyContent: 'flex-start', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 5, borderBottomWidth: 1, borderColor: '#ebebeb' }}>
                                <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 10, color: 'black', width: '40%', textAlign: 'left' }}>Description</Text>
                                <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 10, color: 'black', flex: 1, textAlign: 'center' }}>QTY</Text>
                                <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 10, color: 'black', flex: 1, textAlign: 'center' }}>Rate</Text>
                                <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 10, color: 'black', flex: 1, textAlign: 'center' }}>Amount</Text>
                            </View>
                            <View style={{ paddingBottom: 5, borderBottomWidth: 1, borderColor: '#ebebeb', width: '100%', height: 225 }}>
                                {
                                    previewData.length == 0 ? (
                                        <Text style={{ fontFamily: 'Montserrat Regular', fontSize: 15, color: 'black', width: '100%', textAlign: 'center' }}>No Data Selected to Preview</Text>
                                    ) : (
                                        <FlatList
                                            data={previewData}
                                            renderItem={
                                                ({ item, index }) => {
                                                    return (
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                                                            <Text style={{ fontFamily: 'Montserrat Regular', fontSize: 10, color: 'black', width: '40%', textAlign: 'left' }}>{item.notes}</Text>
                                                            <Text style={{ fontFamily: 'Montserrat Regular', fontSize: 10, color: 'black', flex: 1, textAlign: 'center' }}>1</Text>
                                                            <Text style={{ fontFamily: 'Montserrat Regular', fontSize: 10, color: 'black', flex: 1, textAlign: 'center' }}>{item.amount}</Text>
                                                            <Text style={{ fontFamily: 'Montserrat Regular', fontSize: 10, color: 'black', flex: 1, textAlign: 'center' }}>{item.amount}</Text>
                                                        </View>
                                                    )
                                                }}
                                            showsVerticalScrollIndicator={true}
                                            contentContainerStyle={{ gap: 10 }}
                                        />
                                    )
                                }
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingTop: 5, }}>
                                <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 10, color: 'black', textAlign: 'left' }}>TOTAL</Text>
                                <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 10, color: 'black', textAlign: 'center', width: 70 }}>Rs. {previewDataTotal}</Text>
                            </View>
                        </View>
                    </View>
                </View >
            </Modal >
        </View >
    )
}

const styles = StyleSheet.create({
    mainContentContainer: { position: 'relative', flex: 1, backgroundColor: 'white', paddingHorizontal: 15, paddingTop: 15, paddingBottom: 1 },
    buttonContainer: { paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    button1: { width: '48%', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 3, overflow: 'hidden', backgroundColor: 'white', borderWidth: 0.8, borderColor: 'black' },
    button2: { width: '48%', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 3, overflow: 'hidden' },
    buttonText: { fontFamily: 'Montserrat Bold', fontSize: 15, color: 'white' },
});

export default CreateInvoiceFromTransactions