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
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

//Importing Asset or Images
import { NODATA } from '../../../assets/images/Images.js';

//Importing Components
import Header from '../../components/CustomHeaders/Header.js';

//Modals
import MoreOptionsModal from '../../components/Modals/CustomerTransactionsScreenModals/MoreOptionsModal.js';

//Importing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck, faEllipsis, faLongArrowUp, faPhone, faReceipt, faSms } from '@fortawesome/free-solid-svg-icons';
import { faLongArrowDown } from '@fortawesome/free-solid-svg-icons/faLongArrowDown';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

//Importing React Native Components
import { Skeleton } from '@rneui/themed';

//Dummy Data and Related Functions
import { formattedData } from '../../data/CustomerTransactionsData/FORMATTEDDATA.js';

//Import Firestore Functions
import { getCustomerbyCid } from '../../services/customerFunctions.js';

//Importing Context
import { ReusedContext } from '../../context/ReusedContext.js';

const CustomerTransactionsScreen = () => {
    //Context
    const { forCustomerTransactions, forCustomerDetails } = useContext(ReusedContext)

    //Constants
    const navigation = useNavigation()
    const route = useRoute()
    const customerName = route.params.customerName
    const cId = route.params.cId
    const customerMobile = route.params.customerMobile

    const rippleOptions = useMemo(() => {
        return ({
            foreground: true,
            borderless: false,
            color: '#ebebeb'
        })
    }, [])

    //States
    const [transactions, settransactions] = useState([])

    const [loader, setloader] = useState(true)

    const [moreOptionsModal, setMoreOptionsModal] = useState(false);
    const [totalAmount, settotalAmount] = useState(0)

    //Functions
    const moreOptions = useCallback(() => {
        setMoreOptionsModal(!moreOptionsModal)
    }, [moreOptionsModal])

    const navigatorFunction = useCallback((screenName, options = '') => {
        if (screenName === 'GivenReceived') {
            navigation.navigate(screenName, options)
            return
        }
        if (screenName === 'TransactionDetail') {
            navigation.navigate(screenName, options)
        }
    }, [navigation])

    const calculateTotal = useCallback(() => {
        var formattedData = []
        var tempData = []
        var totalAmount = 0
        forCustomerTransactions.state.forEach((obj) => {
            tempData = []
            obj.transactions.forEach((object) => {
                if (object.status === 'due') {
                    totalAmount = totalAmount - object.amount
                } else {
                    totalAmount = parseInt(totalAmount) + parseInt(object.amount)
                }
                var temp2 = { ...object, totalAmount: totalAmount }
                tempData.push(temp2)
            })
            var temp1 = { ...obj, transactions: tempData }
            formattedData.push(temp1)
        })

        //Now set the New Formatted Data
        settransactions(formattedData)
        settotalAmount(totalAmount)
    }, [forCustomerTransactions.state, transactions])

    const dueOradvance = (amount) => {
        if (amount <= 0) {
            return `${Math.abs(amount)} Due`
        } else {
            return `${Math.abs(amount)} Advance`
        }
    }

    useFocusEffect(
        useCallback(() => {
            if (forCustomerTransactions.state.length != 0) {
                calculateTotal()
            }
        }, [forCustomerTransactions.state])
    )

    useEffect(() => {
        async function fetchData() {
            const controller = new AbortController();  // Create an instance of AbortController
            const signal = controller.signal;          // Get the abort signal
            // Timeout promise to abort after a certain time (e.g., 5 seconds)
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    controller.abort();  // Abort the fetch request when timeout occurs
                    reject(new Error('Timeout'));
                }, 5000);  // Timeout set to 5 seconds
            });

            // Wrap the getCustomerbyCid in a function that supports aborting
            const fetchCustomerData = async () => {
                return await getCustomerbyCid(cId, { signal });
            };

            try {
                setloader(true);
                // Race between the fetch call and the timeout
                const res = await Promise.race([fetchCustomerData(), timeoutPromise]);

                if (res === null) {
                    setloader(false);
                    return;
                } else {
                    var customerDetail = { ...res };
                    delete customerDetail.transactions;

                    forCustomerDetails.setState((prev) => {
                        return { ...prev, ...customerDetail };
                    });
                    forCustomerTransactions.setState(formattedData(res));
                    settransactions(formattedData(res));
                    setloader(false);
                }
            } catch (error) {
                if (error.message === 'Timeout') {
                    ToastAndroid.show('Connection Time Out, Check your Network Connection', ToastAndroid.LONG)
                } else if (error.name === 'AbortError') {
                    // console.log('Fetch was aborted due to timeout');
                    ToastAndroid.show('Connection Time Out, Check your Network Connection', ToastAndroid.LONG)
                } else {
                    console.log(error);
                }
            } finally {
                setloader(false)
            }
        }

        fetchData()
    }, [])

    //Rendering Components Function
    const Items = memo(({ data, idx, lastIndex }) => {
        return (
            <>
                <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                    <Text style={{ paddingHorizontal: 25, paddingVertical: 5, borderRadius: 20, backgroundColor: 'grey', color: 'white', fontFamily: 'Montserrat Medium', fontSize: 13 }}>{data.date}</Text>
                </View>

                {
                    data.transactions.map((item, idx) => (
                        <View key={idx} style={{ rowGap: 5, marginBottom: 15 }}>
                            <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('TransactionDetail', { ...item, balance: totalAmount })} style={[{ width: '60%', padding: 10, justifyContent: 'center', alignItems: 'flex-start', gap: 3, borderWidth: 1, borderColor: '#ebebeb', borderRadius: 8, backgroundColor: 'white', overflow: 'hidden' }, item.status === 'payment' ? { alignSelf: 'flex-start' } : { alignSelf: 'flex-end' }]}>
                                <View style={[{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 5 }]}>
                                    <FontAwesomeIcon icon={faLongArrowUp} size={18} color={item.status === 'payment' ? 'green' : 'red'}></FontAwesomeIcon>
                                    <Text style={[{ fontFamily: 'Montserrat Bold', fontSize: 18, flex: 1 }, item.status === 'payment' ? { color: 'green' } : { color: 'red' }]}>{'\u20B9'}{item.amount}</Text>
                                </View>

                                <View style={[{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 5 }, { alignSelf: 'flex-end' }]}>
                                    <Text style={{ fontFamily: 'Montserrat Regular', fontSize: 12, color: 'grey', }}>{item.timing}</Text>
                                    <FontAwesomeIcon icon={faCheck} size={12} color='grey'></FontAwesomeIcon>
                                </View>

                                <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 12, color: 'grey' }}>{item.notes}</Text>
                                {
                                    item.photo != null && (
                                        <View style={{ width: '100%', height: 100, backgroundColor: '#ebebeb', justifyContent: 'center', alignItems: 'center', borderRadius: 5, overflow: 'hidden', }}>
                                            <Image src={item.photo} resizeMode='cover' style={{ width: '100%', height: '100%' }}></Image>
                                        </View>
                                    )
                                }

                                {
                                    item.state == "edited" && (<Text style={{ fontFamily: 'Montserrat Medium', fontSize: 10, color: 'grey', textAlign: 'right', width: '100%' }}>Amount edited on {item.editedDate}{'\n'}at {item.editedTime}</Text>)
                                }
                            </Pressable>
                            <Text style={[{ fontFamily: 'Montserrat Medium', fontSize: 12, color: 'grey', width: '100%' }, item.status === 'payment' ? { textAlign: 'left' } : { textAlign: 'right' }]}>{'\u20B9'}{dueOradvance(item.totalAmount != undefined ? item.totalAmount : 0)}</Text>
                        </View>
                    ))
                }
            </>
        )
    })

    //Rendering Function
    const renderItem = useCallback(({ item, idx }) => {
        return (
            <Items data={item} idx={idx} lastIndex={transactions.length - 1}></Items>
        )
    }, [transactions])

    return (
        <View style={{ height: Dimensions.get('window').height, backgroundColor: 'white' }}>
            <Header heading={forCustomerDetails.state.customerName} extraDetails={'customerTransactions'}></Header>

            {/* All Transactions List according to Date */}
            <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 15, paddingVertical: 10 }}>
                {
                    loader ? (
                        <>
                            <Skeleton width={'50%'} height={23} style={{ marginVertical: 10, alignSelf: 'center', borderRadius: 20, backgroundColor: '#ebebeb' }} />
                            <Skeleton width={'55%'} height={75} style={{ marginVertical: 10, alignSelf: 'flex-end', borderRadius: 5, backgroundColor: '#ebebeb' }} />
                            <Skeleton width={'25%'} height={12} style={{ alignSelf: 'flex-end', borderRadius: 20, backgroundColor: '#ebebeb' }} />
                            <Skeleton width={'55%'} height={75} style={{ marginVertical: 10, alignSelf: 'flex-start', borderRadius: 5, backgroundColor: '#ebebeb' }} />
                            <Skeleton width={'25%'} height={12} style={{ alignSelf: 'flex-start', borderRadius: 20, backgroundColor: '#ebebeb' }} />
                            <Skeleton width={'55%'} height={75} style={{ marginVertical: 10, alignSelf: 'flex-end', borderRadius: 5, backgroundColor: '#ebebeb' }} />
                            <Skeleton width={'25%'} height={12} style={{ alignSelf: 'flex-end', borderRadius: 20, backgroundColor: '#ebebeb' }} />
                            <Skeleton width={'50%'} height={23} style={{ marginVertical: 10, alignSelf: 'center', borderRadius: 20, backgroundColor: '#ebebeb' }} />
                            <Skeleton width={'55%'} height={75} style={{ marginVertical: 10, alignSelf: 'flex-start', borderRadius: 5, backgroundColor: '#ebebeb' }} />
                        </>
                    ) : transactions.length == 0 ? (
                        <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', rowGap: 20, overflow: 'hidden' }}>
                            <Image source={NODATA} resizeMode='cover' style={{ width: '100%', height: 175 }}></Image>
                            <Text style={{ width: '100%', fontFamily: 'Montserrat Bold', fontSize: 12, textAlign: 'center', color: '#07D589' }}>No Dues or Payments are Found for this Customer</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={transactions}
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
                            initialScrollIndex={transactions.length >= 1 ? transactions.length - 1 : 0}
                            getItemLayout={(data, index) => (
                                { length: 600, offset: 300 * index, index }
                            )}
                        />
                    )
                }
            </View>

            {/* Bottom Tab */}
            <View style={{ borderTopStartRadius: 25, borderTopEndRadius: 25, overflow: 'hidden' }}>
                <Pressable android_ripple={rippleOptions} onPress={moreOptions} style={{ paddingHorizontal: 15, paddingVertical: 10, backgroundColor: 'grey', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 15 }}>
                        <FontAwesomeIcon icon={faReceipt} size={14} color='white'></FontAwesomeIcon>
                        <FontAwesomeIcon icon={faSms} size={14} color='white'></FontAwesomeIcon>
                        <FontAwesomeIcon icon={faPhone} size={14} color='white'></FontAwesomeIcon>
                        <FontAwesomeIcon icon={faWhatsapp} size={14} color='white'></FontAwesomeIcon>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
                        <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 14, color: 'white' }}>More</Text>
                        <FontAwesomeIcon icon={faEllipsis} size={14} color='white'></FontAwesomeIcon>
                    </View>
                </Pressable>

                <View style={{ backgroundColor: '#ebebeb' }}>
                    <View style={{ paddingHorizontal: 15, paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'white' }}>
                        <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 12, color: 'grey' }}>Balance {totalAmount > 0 ? 'Advance' : 'Due'}</Text>
                        <Text style={[{ fontFamily: 'Montserrat Bold', fontSize: 15, }, totalAmount > 0 ? { color: 'green' } : { color: 'red' }]}>{'\u20B9'}{Math.abs(totalAmount)}  {'>'}</Text>
                    </View>

                    <View style={{ paddingHorizontal: 15, paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('GivenReceived', { screen: 'Received', customerId: cId, balance: totalAmount })} style={{ width: '48%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, backgroundColor: 'white', borderRadius: 30, paddingVertical: 12 }}>
                            <FontAwesomeIcon icon={faLongArrowDown} size={14} color='green'></FontAwesomeIcon>
                            <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 14, color: 'green', }}>Received</Text>
                        </Pressable>

                        <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('GivenReceived', { screen: 'Given', customerId: cId, balance: totalAmount })} style={{ width: '48%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, backgroundColor: 'white', borderRadius: 30, paddingVertical: 12 }}>
                            <FontAwesomeIcon icon={faLongArrowUp} size={14} color='red'></FontAwesomeIcon>
                            <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 14, color: 'red', }}>Given</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Modals */}
            <MoreOptionsModal states={{ modalVisible: moreOptionsModal, setModalVisible: setMoreOptionsModal }} func={moreOptions} extraData={{ mobile: customerMobile, data: { balance: totalAmount } }} />
        </View>
    )
}

export default CustomerTransactionsScreen