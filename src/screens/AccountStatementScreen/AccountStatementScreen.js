import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
    Pressable,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

//Importing Components
import Header from '../../components/CustomHeaders/Header.js';

//Importing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendar, faSortDown, faWallet, faUpLong, faDownLong, faDownload } from '@fortawesome/free-solid-svg-icons';

//Importing Data Format Functions
import { formatData } from '../../data/AccountStatementData/Functions.js';

//Importing FireBase Functions
import { getAllCustomersbyPid } from '../../services/customerFunctions.js';

//Importing Contexts
import { ReusedContext } from '../../context/ReusedContext.js';

//Importing utilities
import { dateFormat } from '../../utils/ReusableFunctions.js';

const AccountStatementScreen = () => {
    //Contexts
    const { forCustomerDetails, forProfile } = useContext(ReusedContext)

    //Constants
    const navigation = useNavigation()
    const route = useRoute()

    const pId = forProfile.state.pId

    //States
    const [STATEMENTS, setSTATEMENTS] = useState([])
    const [data, setdata] = useState([])

    const [loader, setloader] = useState(false)

    const [startDate, setstartDate] = useState(new Date('1993-11-23'))
    const [endDate, setendDate] = useState(new Date())

    //Functions
    const navigatorFunction = useCallback((screenName, options = '') => {
        if (screenName === 'DataRange') {
            navigation.navigate(screenName, { sD: setstartDate, eD: setendDate })
            return
        }
        if (screenName === 'TransactionDetail') {
            forCustomerDetails.setState((prev) => { return { ...prev, ...options.customerDetails } })
            navigation.navigate(screenName, { ...options, path: 'AccountStatement' })
            return
        }
        navigation.navigate(screenName)
    }, [navigation])

    const filterDatabyDate = useCallback(() => {
        var tempData = STATEMENTS.filter((obj) => {
            var splittedDate = obj.date.split('/')
            var day1 = splittedDate[0]
            var month1 = splittedDate[1]
            var year1 = splittedDate[2]

            var date1 = new Date(`${year1}-${month1}-${day1}`)

            if (date1.getTime() >= startDate.getTime() && date1.getTime() <= endDate.getTime()) {
                return obj
            }
        })

        setdata(tempData)
    }, [startDate, endDate, STATEMENTS])

    const countTotal = useCallback((calculateFor) => {
        var totalPayment = 0
        var totalDue = 0

        data.forEach((obj) => {
            if (obj.transactionType === 'payment') {
                totalPayment = totalPayment + 1
            } else {
                totalDue = totalDue + 1
            }
        })

        if (calculateFor === 'payment') {
            return totalPayment
        } else if (calculateFor === 'due') {
            return totalDue
        } else {
            return null
        }
    }, [data])

    const calculateDueorPayment = useCallback((calculateFor) => {
        var totalPayment = 0
        var totalDue = 0

        data.forEach((obj) => {
            if (obj.transactionType === 'payment') {
                totalPayment = totalPayment + obj.amount
            } else {
                totalDue = totalDue + obj.amount
            }
        })

        if (calculateFor === 'payment') {
            return totalPayment
        } else if (calculateFor === 'due') {
            return totalDue
        } else if (calculateFor === 'net balance') {
            return totalPayment - totalDue
        } else {
            return null
        }
    }, [data])

    useEffect(() => {
        filterDatabyDate()
    }, [startDate, endDate, STATEMENTS])

    useEffect(() => {
        async function fetchData() {
            setloader(true)
            const res = await getAllCustomersbyPid(pId)
            if (res.length === 0) {
                console.log('No Customers Found')
                setloader(false)
                return
            } else {
                setSTATEMENTS(formatData(res))
                setdata(formatData(res))
                setloader(false)
            }
        }

        fetchData()
    }, [])

    //Component Rendering Function
    const Item = React.memo(({ data, idx, lastIndex }) => {
        const rippleOptions = useMemo(() => {
            return ({
                foreground: true,
                borderless: false,
                color: '#ebebeb'
            })
        }, [])

        return (
            <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('TransactionDetail', { ...data })} style={[styles.itemContainer, data.transactionType === 'payment' ? { alignSelf: 'flex-start' } : { alignSelf: 'flex-end' }]}>
                <Text style={styles.itemCompanyName}>{data.customerDetails.customerName}</Text>
                <View style={styles.itemBottomRow}>
                    <Text style={[styles.itemAmount, data.transactionType === 'payment' ? { color: 'green' } : { color: 'red' }]}>{'\u20B9'}{data.amount}</Text>
                    <Text style={styles.itemDateTime}>{dateFormat(data.date)}{'\n'}{data.time}</Text>
                </View>
            </Pressable>
        )
    })

    const renderItem = useCallback(({ item, idx }) => {
        return (
            <Item data={item} idx={idx} lastIndex={data.length - 1}></Item>
        )
    }, [data])

    return (
        <View style={{ height: Dimensions.get('window').height, backgroundColor: 'white', position: 'relative' }}>
            <Header heading={'Account Statement'}></Header>

            <View style={{ flex: 1, padding: 10 }}>

                <View style={styles.topContentContainer}>
                    <Pressable android_ripple={{ foreground: true, borderless: false, color: '#ebebeb' }} onPress={() => navigatorFunction('DataRange')} style={styles.dateSelectorContainer}>
                        <FontAwesomeIcon icon={faCalendar} size={13} color='black'></FontAwesomeIcon>
                        <Text style={styles.dateRangeText}>{dateFormat(startDate.toLocaleDateString('en-GB'))} - {dateFormat(endDate.toLocaleDateString('en-GB'))}</Text>
                        <FontAwesomeIcon icon={faSortDown} size={13} color='black'></FontAwesomeIcon>
                    </Pressable>

                    <View style={{ width: '100%' }}>
                        <View style={styles.topRow}>
                            <View style={styles.topContentIcons}>
                                <FontAwesomeIcon icon={faWallet} size={17} color='grey'></FontAwesomeIcon>
                            </View>
                            <View>
                                <Text style={styles.topContentText1}>Net Balance</Text>
                                <Text style={[styles.topContentText2, calculateDueorPayment('net balance') < 0 ? { color: 'red' } : { color: 'green' }]}>{'\u20B9'}{Math.abs(calculateDueorPayment('net balance'))}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <View style={styles.bottomRow}>
                            <View style={styles.topContentIcons}>
                                <FontAwesomeIcon icon={faDownLong} size={17} color='green'></FontAwesomeIcon>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.topContentText1}>{countTotal('payment')} Payment</Text>
                                <Text style={[styles.topContentText2, { color: 'green' }]}>{'\u20B9'}{calculateDueorPayment('payment')}</Text>
                            </View>
                        </View>

                        <View style={styles.bottomRow}>
                            <View style={styles.topContentIcons}>
                                <FontAwesomeIcon icon={faUpLong} size={17} color='red'></FontAwesomeIcon>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.topContentText1}>{countTotal('due')} Credit</Text>
                                <Text style={styles.topContentText2}>{'\u20B9'}{calculateDueorPayment('due')}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Main Transactions List */}
                {
                    loader ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size={'large'} color={'#07D589'}></ActivityIndicator>
                        </View>
                    ) : (
                        <FlatList
                            data={data}
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
                        />
                    )
                }
            </View>

            <View style={styles.buttonContainer}>
                <Pressable android_ripple={{ foreground: true, borderless: false, color: '#ebebeb' }} style={[styles.button, { backgroundColor: '#07D589' }]}>
                    <FontAwesomeIcon icon={faDownload} size={15} color='white'></FontAwesomeIcon>
                    <Text style={styles.buttonText}>Download</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create(
    {
        topContentContainer: { position: 'relative', marginTop: 18, marginBottom: 10, paddingHorizontal: 10, paddingVertical: 10, paddingTop: 25, borderWidth: 1, borderColor: '#ebebeb', borderRadius: 15, justifyContent: 'center', alignItems: 'center', rowGap: 20 },
        dateSelectorContainer: { position: 'absolute', top: -15, width: '80%', paddingVertical: 5, backgroundColor: 'white', borderRadius: 25, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, elevation: 4, zIndex: 5, overflow: 'hidden' },
        dateRangeText: { fontFamily: 'Montserrat Medium', fontSize: 13, color: 'black' },
        topRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 5 },
        topContentIcons: { width: 50, height: 50, borderRadius: 100, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ebebeb', backgroundColor: 'white' },
        topContentText1: { fontFamily: 'Montserrat Medium', fontSize: 12, color: 'black' },
        topContentText2: { fontFamily: 'Montserrat Bold', fontSize: 20, color: 'red' },
        bottomRow: { width: '48%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 5, },
        itemContainer: { marginBottom: 5, width: '60%', paddingHorizontal: 8, paddingVertical: 5, backgroundColor: 'white', borderWidth: 1, borderColor: '#ebebeb', borderRadius: 7, gap: 3, overflow: 'hidden' },
        itemCompanyName: { fontFamily: 'Montserrat Bold', fontSize: 12, color: 'black' },
        itemBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
        itemAmount: { fontFamily: 'Montserrat Bold', fontSize: 20, flex: 1 },
        itemDateTime: { fontFamily: 'Montserrat Bold', fontSize: 9, color: 'grey', width: '45%', textAlign: 'right' },
        buttonContainer: { paddingHorizontal: 15, paddingBottom: 15 },
        button: { paddingHorizontal: 20, paddingVertical: 15, borderRadius: 50, flexDirection: 'row', gap: 15, justifyContent: 'center', alignItems: 'center', elevation: 3 },
        buttonText: { fontFamily: 'Montserrat Bold', fontSize: 18, color: 'white' },
    });

export default AccountStatementScreen