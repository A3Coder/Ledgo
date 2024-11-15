import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Pressable,
    FlatList,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

//Importing Components
import Header from '../../components/CustomHeaders/Header.js';

//Importing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLongArrowDown, faLongArrowUp, faDownload, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

//Importing Dummy Data and Formatting Functions
import { formatDataforCustomerStatements } from '../../data/CustomerStatementData/Functions.js';

//Import FireStore Functions
import { getCustomerbyCid } from '../../services/customerFunctions.js';

const CustomerStatementScreen = () => {
    //Constants
    const navigation = useNavigation()
    const route = useRoute()

    const customerName = route.params.customerName
    const customerId = route.params.customerId

    const rippleOptions = useMemo(() => {
        return ({
            foreground: true,
            borderless: false,
            color: '#ebebeb'
        })
    }, [])
    const year = new Date().getUTCFullYear()
    const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const MONTHS = [
        {
            mon: 'Jan',
            end: 31
        },
        {
            mon: 'Feb',
            end: isLeapYear(year) ? 29 : 28
        },
        {
            mon: 'Mar',
            end: 31
        },
        {
            mon: 'Apr',
            end: 30
        },
        {
            mon: 'May',
            end: 31
        },
        {
            mon: 'June',
            end: 30
        },
        {
            mon: 'July',
            end: 31
        },
        {
            mon: 'Aug',
            end: 31
        },
        {
            mon: 'Sept',
            end: 30
        },
        {
            mon: 'Oct',
            end: 31
        },
        {
            mon: 'Nov',
            end: 30
        },
        {
            mon: 'Dec',
            end: 31
        },

    ]

    // const STATEMENTSFROMDB = useMemo(() => {
    //     return (formatDataforCustomerStatements(customerId))
    // }, [])

    //States
    const [STATEMENTSFROMDB, setSTATEMENTSFROMDB] = useState([])
    const [statements, setstatements] = useState([])

    const [loader, setloader] = useState(false)

    const [active, setactive] = useState(0) //0 2 3 4 5
    const [startDate, setstartDate] = useState(new Date())
    const [endDate, setendDate] = useState(new Date())

    //Functions
    const handleActiveFilters = (idx) => {
        if (idx === 1) {
            setactive(idx)
            navigation.navigate('DataRange', { sD: setstartDate, eD: setendDate })
            return
        } else {
            setactive(idx)
            filterSwitch(idx)
        }
    }

    const filterSwitch = useCallback((idx) => {
        switch (idx) {
            case 2:
                //Handle This Month Filter
                thisMonth()
                break
            case 3:
                //Handle Last 30 Days Filter
                last30Days()
                break
            case 4:
                //Handle Last Month Filter
                lastMonth()
                break
            case 5:
                //Handle Last 3 Months Filter
                last3Months()
                break
            case 0:
                //Handle All Time Filter
                allTime()
                break
            default:
                return
        }
    }, [active])

    const thisMonth = () => {
        const date = new Date()
        const monthIndex = date.getUTCMonth()

        setstartDate(new Date(`${year}-${monthIndex + 1}-${1}`))
        setendDate(new Date(`${year}-${monthIndex + 1}-${MONTHS[monthIndex].end}`))
    }

    const last30Days = () => {
        const date = new Date()
        const currentDate = date.getUTCDate()
        const monthIndex = date.getUTCMonth()

        setstartDate(new Date(`${year}-${(monthIndex - 1) + 1}-${currentDate + 1}`))
        setendDate(new Date(`${year}-${monthIndex + 1}-${currentDate}`))
    }

    const lastMonth = () => {
        const date = new Date()
        const monthIndex = date.getUTCMonth()

        if (monthIndex === 0) {
            setstartDate(new Date(`${year - 1}-${11 + 1}-${1}`))
            setendDate(new Date(`${year - 1}-${11 + 1}-${MONTHS[11].end}`))
            return
        }

        setstartDate(new Date(`${year}-${(monthIndex - 1) + 1}-${1}`))
        setendDate(new Date(`${year}-${(monthIndex - 1) + 1}-${MONTHS[(monthIndex - 1)].end}`))
    }

    const last3Months = () => {
        const date = new Date()
        const monthIndex = date.getUTCMonth()

        if (monthIndex < 3) {
            setstartDate(new Date(`${year - 1}-${monthIndex + 9}-${1}`))
            setendDate(new Date(`${monthIndex === 2 || monthIndex === 1 ? year : year - 1}-${(monthIndex === 2 || monthIndex === 1 ? monthIndex - 1 : 11) + 1}-${MONTHS[monthIndex === 2 || monthIndex === 1 ? monthIndex - 1 : 11].end}`))
            return
        }

        setstartDate(new Date(`${year}-${(monthIndex - 3) + 1}-${1}`))
        setendDate(new Date(`${year}-${(monthIndex - 1) + 1}-${MONTHS[(monthIndex - 1)].end}`))
    }

    const allTime = () => {
        const date = new Date()
        const monthIndex = date.getUTCMonth()
        const currentDate = date.getUTCDate()

        //Get Start and End Dates from DataBase
        setstartDate(new Date(`${1993}-${(10) + 1}-${23}`))
        setendDate(new Date(`${year}-${(monthIndex) + 1}-${currentDate}`))
    }

    const dateFormat = (sD, eD) => {
        var date1 = sD.getUTCDate()
        var date2 = eD.getUTCDate()

        var month1 = sD.getUTCMonth()
        var month2 = eD.getUTCMonth()

        var year1 = sD.getFullYear()
        var year2 = eD.getFullYear()

        return `${date1} ${MONTHS[month1].mon}, ${year1} - ${date2} ${MONTHS[month2].mon}, ${year2}`
    }
    const DATARANGE = dateFormat(startDate, endDate)

    const filterData = (sD, eD) => {
        var month1 = MONTHS[sD.getUTCMonth()].mon
        var month2 = MONTHS[eD.getUTCMonth()].mon

        var monthData = STATEMENTSFROMDB.filter((obj, idx) => {
            if (obj.month === month1 || obj.month === month2) {
                return obj
            }
        })

        setstatements(monthData)
    }

    const totalPaymentorDue = useCallback((calculateFor) => {
        var totalPayment = 0
        var totalDue = 0
        var totalBalance = 0
        statements.forEach((obj) => {
            if (obj.status === 'payment') {
                totalPayment = totalPayment + 1
                totalBalance = totalBalance + obj.amount
            } else if (obj.status === 'due') {
                totalDue = totalDue + 1
                totalBalance = totalBalance - obj.amount
            }
        })

        if (calculateFor === 'payment') {
            return totalPayment
        } else if (calculateFor === 'due') {
            return totalDue
        } else if (calculateFor === 'balance') {
            return totalBalance
        }
        else {
            return null
        }

    }, [statements])

    useEffect(() => {
        filterSwitch(active)
    }, [])

    useEffect(() => {
        filterData(startDate, endDate)
    }, [startDate, endDate])

    useEffect(() => {
        async function fetchData() {
            setloader(true)
            const res = await getCustomerbyCid(customerId)
            if (res === null) {
                console.log('Customer Not Found')
                setloader(false)
                return
            } else {
                setSTATEMENTSFROMDB(formatDataforCustomerStatements(res))
                setstatements(formatDataforCustomerStatements(res))
                setloader(false)
            }
        }

        fetchData()
    }, [])

    //Rendering Items Funtion
    const Items = memo(({ data, idx, lastIndex }) => {
        return (
            <View style={styles.listItemContainer}>
                <View style={{ width: '33%', }}>
                    <View style={styles.listItemCol1}>
                        <Text style={styles.listItemCol1Date}>{data.date}</Text>
                        <Text style={styles.listItemCol1Month}>{data.month}</Text>
                    </View>
                </View>
                <View style={[{ justifyContent: 'center', }, styles.listItemCol2andCol3]}>
                    {data.status === 'payment' && (<FontAwesomeIcon icon={faLongArrowUp} size={12} color='green'></FontAwesomeIcon>)}
                    <Text style={[{ color: 'green', textAlign: 'center' }, styles.tableHeaderAmountText]}>{data.status === 'payment' ? data.amount : ''}</Text>
                </View>
                <View style={[{ justifyContent: 'flex-end', }, styles.listItemCol2andCol3]}>
                    {data.status === 'due' && (<FontAwesomeIcon icon={faLongArrowDown} size={12} color='red'></FontAwesomeIcon>)}
                    <Text style={[{ color: 'red', textAlign: 'right', }, styles.tableHeaderAmountText]}>{data.status === 'due' ? data.amount : ''}</Text>
                </View>
            </View>
        )
    })

    //Rendering Function
    const renderItem = useCallback(({ item, idx }) => {
        return (
            <Items data={item} idx={idx} lastIndex={statements.length - 1}></Items>
        )
    }, [statements])

    return (
        <View style={{ height: Dimensions.get('window').height, backgroundColor: 'white' }}>
            <Header heading={customerName} extraDetails={'customerStatement'} currentBalance={totalPaymentorDue('balance')}></Header>

            <View style={{ height: 70 }}>
                <ScrollView removeClippedSubviews={true} showsHorizontalScrollIndicator={false} horizontal={true} contentContainerStyle={styles.scrollContainer}>
                    {
                        ['Overall', 'Data Range', 'This Month', 'Last 30 Days', 'Last Month', 'Last 3 Months'].map((item, idx) => (
                            <Pressable android_ripple={rippleOptions} onPress={() => handleActiveFilters(idx)} key={idx} style={[styles.filterButton, idx === 5 && { marginRight: 15 }, idx === active && { backgroundColor: '#07D58926' }]}>
                                <Text style={styles.filterButtonText}>{item}</Text>
                                {
                                    idx === 1 && (<FontAwesomeIcon icon={faArrowRight} size={11} color='black'></FontAwesomeIcon>)
                                }
                            </Pressable>
                        ))
                    }
                </ScrollView>
            </View>

            <View style={{ flex: 1 }}>
                <View style={styles.balanceContainer}>
                    <Text style={[styles.balanceContainerText1, totalPaymentorDue('balance') > 0 ? { color: 'green' } : { color: 'red' }]}>{'\u20B9'}{Math.abs(totalPaymentorDue('balance'))}</Text>
                    <Text style={styles.balanceContainerText2}>Balance  |  <Text style={{ fontFamily: 'Montserrat Bold' }}>{DATARANGE}</Text></Text>
                </View>

                <View style={styles.tableHeaderContainer}>
                    <Text style={[{ width: '33%', }, styles.tableHeaderHeading]}>Date</Text>
                    <View style={{ width: '33%', }}>
                        <Text style={[{ textAlign: 'center' }, styles.tableHeaderStatusText]}>Payment {`(${totalPaymentorDue('payment')})`}</Text>
                        <Text style={[{ color: 'green', textAlign: 'center' }, styles.tableHeaderAmountText]}>Amount</Text>
                    </View>
                    <View style={{ width: '33%', }}>
                        <Text style={[{ textAlign: 'right' }, styles.tableHeaderStatusText]}>Credit {`(${totalPaymentorDue('due')})`}</Text>
                        <Text style={[{ color: 'red', textAlign: 'right' }, styles.tableHeaderAmountText]}>Amount</Text>
                    </View>
                </View>

                {/* Customer Statement List */}
                <View style={{ paddingHorizontal: 20, flex: 1, }}>
                    {
                        loader ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size={'large'} color={'#07D589'}></ActivityIndicator>
                            </View>
                        ) : (
                            <FlatList
                                data={statements}
                                renderItem={renderItem}
                                showsVerticalScrollIndicator={false}
                            />
                        )
                    }
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <Pressable android_ripple={rippleOptions} style={[styles.button1]}>
                    <FontAwesomeIcon icon={faDownload} size={18} color='black'></FontAwesomeIcon>
                    <Text style={[styles.buttonText, { color: 'black' }]}>Download</Text>
                </Pressable>
                <Pressable android_ripple={rippleOptions} style={[styles.button2, { backgroundColor: '#07D589' }]}>
                    <FontAwesomeIcon icon={faWhatsapp} size={18} color='white'></FontAwesomeIcon>
                    <Text style={styles.buttonText}>Share</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    scrollContainer: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 5, paddingLeft: 20, },
    balanceContainer: { paddingVertical: 30, justifyContent: 'center', alignItems: 'center', gap: 5 },
    balanceContainerText1: { fontFamily: 'Montserrat Bold', fontSize: 35, color: 'red' },
    balanceContainerText2: { fontFamily: 'Montserrat Medium', fontSize: 12, color: 'black' },
    tableHeaderContainer: { backgroundColor: '#ebebeb', paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    tableHeaderHeading: { fontFamily: 'Montserrat Bold', fontSize: 12, color: 'black', textAlign: 'left' },
    tableHeaderAmountText: { fontFamily: 'Montserrat Medium', fontSize: 9, },
    tableHeaderStatusText: { fontFamily: 'Montserrat Bold', fontSize: 12, color: 'black', },
    listItemContainer: { paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ebebeb' },
    listItemCol2andCol3: { width: '33%', flexDirection: 'row', alignItems: 'center', gap: 5, },
    listItemCol1: { width: 50, padding: 5, borderWidth: 0.8, borderRadius: 3, borderColor: '#ebebeb', backgroundColor: '#ebebeb', justifyContent: 'center', alignItems: 'center' },
    listItemCol1Date: { fontFamily: 'Montserrat Bold', color: 'black', fontSize: 15, },
    listItemCol1Month: { fontFamily: 'Montserrat Medium', color: 'black', fontSize: 12, },
    filterButton: { paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, backgroundColor: 'white', borderWidth: 1, borderColor: '#ebebeb', overflow: 'hidden', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 },
    filterButtonText: { fontFamily: 'Montserrat Medium', fontSize: 11, color: 'black' },
    buttonContainer: { paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    button1: { width: '48%', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, elevation: 3, overflow: 'hidden', backgroundColor: 'white', borderWidth: 0.8, borderColor: 'black' },
    button2: { width: '48%', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, elevation: 3, overflow: 'hidden' },
    buttonText: { fontFamily: 'Montserrat Bold', fontSize: 15, color: 'white' },
});

export default CustomerStatementScreen