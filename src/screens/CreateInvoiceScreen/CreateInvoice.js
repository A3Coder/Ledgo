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
    StatusBar,
    Modal,
    Platform,
    Alert,
    TextInput,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

//Importing React Native Pacakages
import { Buffer } from 'buffer'; // Import the buffer polyfill
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs'; // Optional: For file handling


//Importing My Custom Packages
import { NativeModules } from 'react-native';
const { FileViewer } = NativeModules;

//Importing Asset or Images
import { NODATA } from '../../../assets/images/Images.js';

//Importing Components
import Header from '../../components/CustomHeaders/Header.js';

//Importing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck, faDownload, faEllipsis, faEye, faFile, faFilePdf, faIndianRupee, faLongArrowUp, faPhone, faPlus, faReceipt, faRupee, faRupeeSign, faSms, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faLongArrowDown } from '@fortawesome/free-solid-svg-icons/faLongArrowDown';
import { faReadme, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

//Importing React Native Components
import { Skeleton } from '@rneui/themed';

//Importing Context
import { ReusedContext } from '../../context/ReusedContext.js';

//Importing Utilities
import { backendURL } from '../../utils/backendApiURL.js';

const CreateInvoice = () => {
    //Contexts
    const { forCustomerTransactions, forCustomerDetails } = useContext(ReusedContext)

    //Constants
    const ITEMLAYOUTHEIGHT = 110
    const navigation = useNavigation()
    const route = useRoute()
    const handleCreateInvoice = route.params.func
    const rippleOptions = useMemo(() => {
        return ({
            foreground: true,
            borderless: false,
            color: '#ebebeb'
        })
    }, [])

    //States
    const [loading, setloading] = useState(false)
    const [INPUTITEMS, setINPUTITEMS] = useState([{ id: Date.now().toString(), description: "", amount: "" }])
    const [count, setcount] = useState(1)

    const [totalAmount, settotalAmount] = useState(0)

    //Refs
    const flatListRef = useRef(null)

    //States for Modal
    const [previewData, setpreviewData] = useState([])
    const [previewDataTotal, setpreviewDataTotal] = useState(0)
    const [previewModal, setpreviewModal] = useState(false)

    //Functions
    const handlePreviewModal = useCallback(() => {
        setpreviewModal(!previewModal)
    }, [previewModal])

    // Function to handle text change in a TextInput
    const handleInputChange = (text, id, identifier) => {
        if (identifier == 'amount') {
            var pattern = new RegExp(/\D/g)
            if (pattern.test(text)) {
                return
            } else if (text === '0') {
                return
            }
        }
        setINPUTITEMS((prevList) =>
            prevList.map((item) =>
                item.id === id ? { ...item, [identifier]: text } : item
            )
        );
    };

    const handleAddItem = () => {
        const newInput = { id: Date.now().toString(), description: "", amount: "" };
        setINPUTITEMS((prevList) => [...prevList, newInput]);
        setcount((prev) => prev + 1)
        calculateTotalAmount()
        // Scroll to the last item after a small delay to ensure rendering
        if (INPUTITEMS.length > 0) {
            flatListRef.current?.scrollToIndex({
                index: INPUTITEMS.length - 1,
                animated: true,
            });
        }
    }

    const deleteItem = (id) => {
        if (INPUTITEMS.length == 1) {
            return
        }
        setINPUTITEMS((prevList) => prevList.filter((item) => item.id !== id));
        setcount((prev) => prev - 1)
        calculateTotalAmount()
    }

    const calculateTotalAmount = () => {
        var totalAmount = 0
        setINPUTITEMS((prev) => {
            prev.forEach((obj) => {
                if (obj.amount != "") {
                    totalAmount = totalAmount + parseInt(obj.amount)
                }
            })

            settotalAmount(totalAmount)
            return [...prev]
        })
    }

    const handlePreview = () => {
        if (INPUTITEMS[0].description == "" || INPUTITEMS[0].amount == "") {
            ToastAndroid.show('Please Input some Items to Preview Invoice', ToastAndroid.SHORT)
            return
        }
        var formattedData = []
        var totalAmount = 0
        INPUTITEMS.forEach((obj, idx) => {
            totalAmount = obj.amount != "" ? totalAmount + parseInt(obj.amount) : totalAmount + 0
            var tempObj = {
                amount: obj.amount,
                description: obj.description,
            }
            formattedData.push(tempObj)
        })

        setpreviewData(formattedData)
        setpreviewDataTotal(totalAmount)
        handlePreviewModal()
    }

    const handleGenerate = async () => {
        try {
            if (INPUTITEMS[0].description == "" || INPUTITEMS[0].amount == "") {
                ToastAndroid.show('Please Input some Items to Generate Invoice', ToastAndroid.SHORT)
                return
            }
            //First Calculate Total Amount and Format Data
            setloading(true)
            var formattedData = []
            var totalAmount = 0

            INPUTITEMS.forEach((obj) => {
                totalAmount = obj.amount != "" ? totalAmount + parseInt(obj.amount) : totalAmount + 0
                var tempObj = {
                    amount: obj.amount,
                    notes: obj.description,
                }
                formattedData.push(tempObj)
            })

            //Customer Details
            var customerDetails = {
                name: forCustomerDetails.state.customerName,
                address: forCustomerDetails.state.address != null ? forCustomerDetails.state.address : ''
            }

            //Generate the PDF from Backend
            const response = await generatePDF({ transactions: formattedData, totalAmount: totalAmount, customerDetails: customerDetails })

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

            //Set the Num Input and PDF Path of the Previous Screen
            handleCreateInvoice(totalAmount, cachesPath)

            //Then Navigate Backwards to the Screen
            navigation.goBack()
        } catch (error) {
            console.log('PDF generation failed', error);
            ToastAndroid.show('PDF Generation Failed', ToastAndroid.SHORT)
        } finally {
            setloading(false)
        }
    }

    const generatePDF = async (data) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // Set timeout to 10 seconds

            const queryString = `items=${encodeURIComponent(JSON.stringify(data.transactions))}&totalAmount=${data.totalAmount}&customerDetails=${encodeURIComponent(JSON.stringify(data.customerDetails))}`;
            const url = `http://${backendURL}/invoices/generate?${queryString}`;

            // Step 1: Fetch the PDF from the server
            const response = await fetch(url, { signal: controller.signal });
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
    };

    //Rendering Items
    const InputItem = memo(({ data, lastIndex, idx }) => {
        const lastItem = idx === lastIndex ? true : false

        return (
            <View style={[lastItem && { marginBottom: 70 }, { position: 'relative' }, { padding: 5, borderWidth: 1, borderColor: '#07D589', borderRadius: 8, marginTop: 10, height: ITEMLAYOUTHEIGHT, justifyContent: 'space-between' }]}>
                <View style={{ padding: 7, height: 45, borderWidth: 1.5, borderColor: '#ebebeb', borderStyle: 'dashed', borderRadius: 5, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 8 }}>
                    <FontAwesomeIcon icon={faFile} size={15} color='black'></FontAwesomeIcon>
                    <TextInput style={{ flex: 1, height: '100%', padding: 0, fontFamily: 'MontSerrat Medium', fontSize: 15, color: 'black' }} keyboardType='default' placeholder='Enter Description' value={data.description} onChangeText={(e) => handleInputChange(e, data.id, 'description')}></TextInput>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <View style={{ flex: 1, padding: 7, height: 45, borderWidth: 1.5, borderColor: '#ebebeb', borderStyle: 'dashed', borderRadius: 5, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 8 }}>
                        <FontAwesomeIcon icon={faIndianRupee} size={15} color='black'></FontAwesomeIcon>
                        <TextInput style={{ flex: 1, height: '100%', padding: 0, fontFamily: 'MontSerrat Medium', fontSize: 15, color: 'black' }} keyboardType='numeric' placeholder='Enter Amount' maxLength={10} value={data.amount} onChangeText={(e) => handleInputChange(e, data.id, 'amount')} onBlur={() => calculateTotalAmount()}></TextInput>
                    </View>
                    <Pressable android_ripple={rippleOptions} onPress={() => deleteItem(data.id)} style={{ width: 50, padding: 7, height: 45, backgroundColor: 'red', borderRadius: 50, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                        <FontAwesomeIcon icon={faTrash} size={15} color='white'></FontAwesomeIcon>
                    </Pressable>
                </View>
                <View style={[{ position: 'absolute', zIndex: 10, top: -10, left: 10 }, { backgroundColor: '#07D589', width: 20, height: 20, borderRadius: 50, justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontFamily: 'Montserrat Regular', color: 'white', fontSize: 12 }}>{idx + 1}</Text>
                </View>
            </View>
        )
    })

    //Rendering Functions
    const renderItem = useCallback(({ item, index }) => {
        return (
            <InputItem data={item} lastIndex={INPUTITEMS.length - 1} idx={index}></InputItem>
        )
    }, [count])

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
                <Text style={{ fontFamily: "Montserrat Regular", fontSize: 15, color: 'black' }}>Add Items to Generate Invoice</Text>

                <FlatList
                    ref={flatListRef}
                    data={INPUTITEMS}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ gap: 8 }}
                    initialScrollIndex={INPUTITEMS.length > 0 ? INPUTITEMS.length - 1 : 0}
                    getItemLayout={(data, index) => ({
                        length: ITEMLAYOUTHEIGHT, // Replace ITEM_HEIGHT with the fixed height of your items
                        offset: ITEMLAYOUTHEIGHT * index,
                        index,
                    })}
                />

                {/* Add Invoice Button */}
                <Pressable android_ripple={rippleOptions} onPress={handleAddItem} style={styles.addCustomerButton}>
                    <View style={{ position: 'relative' }}>
                        <FontAwesomeIcon icon={faPlus} size={13} color='black'></FontAwesomeIcon>
                    </View>
                    <Text style={styles.buttonLabel}>Add Item</Text>
                </Pressable>
            </View>

            <View style={styles.buttonContainer}>
                <Text style={{ fontFamily: "Montserrat Bold", fontSize: 15, color: 'black' }}>Total:</Text>
                <Text style={{ fontFamily: "Montserrat Bold", fontSize: 15, color: 'green' }}>{'\u20B9'}{totalAmount}</Text>
            </View>

            <View style={styles.buttonContainer}>
                <Pressable android_ripple={rippleOptions} onPress={handlePreview} style={[styles.button1]}>
                    <FontAwesomeIcon icon={faEye} size={18} color='black'></FontAwesomeIcon>
                    <Text style={[styles.buttonText, { color: 'black' }]}>Preview</Text>
                </Pressable>
                <Pressable android_ripple={rippleOptions} onPress={handleGenerate} style={[styles.button2, { backgroundColor: '#07D589' }]}>
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
                                                            <Text style={{ fontFamily: 'Montserrat Regular', fontSize: 10, color: 'black', width: '40%', textAlign: 'left' }}>{item.description}</Text>
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
    mainContentContainer: { position: 'relative', flex: 1, backgroundColor: 'white', paddingHorizontal: 15, paddingTop: 15, paddingBottom: 1, rowGap: 8 },
    buttonContainer: { paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#ebebeb' },
    button1: { width: '48%', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 3, overflow: 'hidden', backgroundColor: 'white', borderWidth: 0.8, borderColor: 'black' },
    button2: { width: '48%', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 3, overflow: 'hidden' },
    buttonText: { fontFamily: 'Montserrat Bold', fontSize: 15, color: 'white' },
    addCustomerButton: { position: 'absolute', bottom: 10, right: 10, zIndex: 10, width: '45%', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, backgroundColor: 'white', borderWidth: 0.8, borderColor: 'black', elevation: 4 },
    buttonLabel: { fontFamily: 'Montserrat Bold', fontSize: 13, color: 'black' },
});

export default CreateInvoice