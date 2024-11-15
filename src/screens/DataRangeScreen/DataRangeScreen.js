import React, { useCallback, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
    Pressable,
    TouchableHighlight,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import DatePicker from 'react-native-date-picker';

//Importing Components
import Header from '../../components/CustomHeaders/Header.js';

//Importing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarDays, faCheck } from '@fortawesome/free-solid-svg-icons';

const DataRangeScreen = () => {
    //Constants
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

    const navigation = useNavigation()
    const route = useRoute()

    //States
    const [active, setActive] = useState('START') //Start or End
    const [filtersActive, setfiltersActive] = useState(4) // 0 1 2 3 4
    const [error, seterror] = useState(false)
    const [startDate, setstartDate] = useState(new Date('1993-11-23')) //Default Date if filter set to overall
    const [endDate, setendDate] = useState(new Date()) //Date can be fetched from Backend, if filter set to overall

    //Functions
    const handleActive = useCallback((idx = null, filters = false) => {
        if (idx != null && filters) {
            setfiltersActive(idx)
            return
        }
        var tempStatus = active
        if (tempStatus === 'START') {
            setActive('END')
        } else {
            setActive('START')
        }
    }, [active, filtersActive])

    const handleConfirm = () => {
        if (route.params != undefined) {
            route.params.sD(startDate)
            route.params.eD(endDate)

            navigation.goBack()
        } else {
            return
        }
    }

    //Functions for handling Date
    const handleDateChange = (id, date) => {
        if (id === 'START') {
            setstartDate(date)
            setfiltersActive(-1)
        } else {
            setendDate(date)
            setfiltersActive(-1)
        }
    }

    //Function for applying Date Filters
    const filterSwitch = useCallback((idx) => {
        switch (idx) {
            case 0:
                //Handle This Month Filter
                thisMonth()
                seterror(false)
                break
            case 1:
                //Handle Last 30 Days Filter
                last30Days()
                seterror(false)
                break
            case 2:
                //Handle Last Month Filter
                lastMonth()
                seterror(false)
                break
            case 3:
                //Handle Last 3 Months Filter
                last3Months()
                seterror(false)
                break
            case 4:
                //Handle All Time Filter
                allTime()
                seterror(false)
                break
            default:
                return
        }
    }, [filtersActive])

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

    function compareDates(date1, date2) {
        // Split the strings into parts: [dd, mm, yyyy]
        let [day1, month1, year1] = date1.split('/');
        let [day2, month2, year2] = date2.split('/');

        // Create date objects (Note: months are 0-indexed in JS)
        let d1 = new Date(year1, month1 - 1, day1).getTime();
        let d2 = new Date(year2, month2 - 1, day2).getTime();

        // Compare the two dates
        if (d1 > d2) {
            return "Start Date > End Date";
        } else if (d1 < d2) {
            return "Start Date < End Date"
        } else if (d2 > d1) {
            return "End Date > Start Date"
        } else if (d2 < d1) {
            return "End Date < Start Date"
        }
        return "No Error"
    }

    return (
        <View style={{ height: Dimensions.get('window').height, backgroundColor: 'white' }}>
            <Header heading={'Data Range'}></Header>

            <View style={styles.mainContentContainer}>
                <View style={styles.dateRangeContainer}>
                    <TouchableOpacity activeOpacity={0.5} onPress={handleActive} style={[styles.dateRangeButtons, active === 'START' ? [{ backgroundColor: '#07D589' }, compareDates(startDate.toLocaleDateString('en-GB'), endDate.toLocaleDateString('en-GB')) === "Start Date > End Date" && { backgroundColor: 'red' }] : [{ backgroundColor: '#ebebeb' }, compareDates(startDate.toLocaleDateString('en-GB'), endDate.toLocaleDateString('en-GB')) === "Start Date > End Date" && { backgroundColor: 'red' }]]}>
                        <FontAwesomeIcon icon={faCalendarDays} size={16} color='black'></FontAwesomeIcon>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label1}>Start</Text>
                            <Text style={styles.label2}>{startDate.toLocaleDateString('en-GB')}</Text>
                        </View>
                    </TouchableOpacity>

                    <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 20, color: 'grey' }}>-</Text>

                    <TouchableOpacity activeOpacity={0.5} onPress={handleActive} style={[styles.dateRangeButtons, active === 'END' ? [{ backgroundColor: '#07D589' }, compareDates(startDate.toLocaleDateString('en-GB'), endDate.toLocaleDateString('en-GB')) === "Start Date > End Date" && { backgroundColor: 'red' }] : [{ backgroundColor: '#ebebeb' }, compareDates(startDate.toLocaleDateString('en-GB'), endDate.toLocaleDateString('en-GB')) === "Start Date > End Date" && { backgroundColor: 'red' }]]}>
                        <FontAwesomeIcon icon={faCalendarDays} size={16} color='black'></FontAwesomeIcon>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label1}>End</Text>
                            <Text style={styles.label2}>{endDate.toLocaleDateString('en-GB')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.dateTimeContainer}>
                    {
                        active === 'START' ? (<DatePicker date={startDate} onDateChange={(date) => { handleDateChange('START', date); }} dividerColor='#07D589' mode='date' style={{ zIndex: 4 }} />) : (<DatePicker date={endDate} onDateChange={(date) => { handleDateChange('END', date); }} dividerColor='#07D589' mode='date' style={{ zIndex: 4 }} />)
                    }

                    {/* <DatePicker date={date} onDateChange={setDate} dividerColor='#07D589' mode='date' style={{ zIndex: 4 }} /> */}

                    {
                        active === 'START' ? (<View style={styles.leftTriangle}></View>) : (<View style={styles.rightTriangle}></View>)
                    }

                </View>

                <View style={styles.filterContainer}>
                    {
                        ['This Month', 'Last 30 Days', 'Last Month', 'Last 3 Months', 'All Time'].map((item, idx) => (
                            <Pressable android_ripple={{ foreground: true, borderless: false, color: '#ebebeb' }} onPress={() => { handleActive(idx, true); filterSwitch(idx) }} key={idx} style={[styles.filterButton, filtersActive === idx ? { backgroundColor: '#07D58926', } : { backgroundColor: 'white', }]}>
                                <Text style={styles.filterButtonText}>{item}</Text>
                            </Pressable>
                        ))
                    }
                </View>
            </View>

            <View style={styles.buttonContainer}>
                {
                    compareDates(startDate.toLocaleDateString('en-GB'), endDate.toLocaleDateString('en-GB')) === "Start Date > End Date" || compareDates(startDate.toLocaleDateString('en-GB'), endDate.toLocaleDateString('en-GB')) === "End Date < Start Date" ? (
                        <View style={[styles.button, { backgroundColor: '#ebebeb' }]}>
                            <FontAwesomeIcon icon={faCheck} size={18} color='white'></FontAwesomeIcon>
                            <Text style={styles.buttonText}>Confirm</Text>
                        </View>
                    ) : (
                        <Pressable android_ripple={{ foreground: true, borderless: false, color: '#ebebeb' }} onPress={handleConfirm} style={[styles.button, { backgroundColor: '#07D589' }]}>
                            <FontAwesomeIcon icon={faCheck} size={18} color='white'></FontAwesomeIcon>
                            <Text style={styles.buttonText}>Confirm</Text>
                        </Pressable>
                    )
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    mainContentContainer: { paddingHorizontal: 10, paddingVertical: 10, flex: 1, backgroundColor: 'white' },
    dateRangeContainer: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 5, },
    dateRangeButtons: { width: '47%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 15, padding: 8, borderRadius: 8 },
    label1: { fontFamily: 'Montserrat Medium', fontSize: 12, color: 'black' },
    label2: { fontFamily: 'Montserrat Bold', fontSize: 15, color: 'black', },
    dateTimeContainer: { position: 'relative', marginTop: 20, paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#07D58926', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    leftTriangle: { position: 'absolute', top: -13, left: 65, borderLeftWidth: 13, borderRightWidth: 13, borderBottomWidth: 13, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#07D58926' },
    rightTriangle: { position: 'absolute', top: -13, right: 65, borderLeftWidth: 13, borderRightWidth: 13, borderBottomWidth: 13, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#07D58926' },
    filterContainer: { marginTop: 10, flexDirection: 'row', justifyContent: 'flex-start', gap: 5, flexWrap: 'wrap' },
    filterButton: { paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, borderWidth: 1, borderColor: '#ebebeb', overflow: 'hidden' },
    filterButtonText: { fontFamily: 'Montserrat Medium', fontSize: 11 },
    buttonContainer: { paddingHorizontal: 15, paddingBottom: 15 },
    button: { paddingHorizontal: 20, paddingVertical: 15, borderRadius: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 3 },
    buttonText: { fontFamily: 'Montserrat Bold', fontSize: 18, color: 'white' },
});

export default DataRangeScreen