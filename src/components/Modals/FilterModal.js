import React, { memo, useCallback, useMemo, useState } from 'react';
import {
    Text,
    View,
    Dimensions,
    Pressable,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TouchableHighlight,
    StatusBar
} from 'react-native';

//Importing FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

//Importing Components
import RadioButton from '../RadioButton/RadioButton';

const FilterModal = ({ states, func, data, badge }) => {
    //Dummy DATA from LOCAL STORAGE
    const DATAFROMDB = useMemo(() => {
        return ({
            filterMethod: 'Latest'
        })
    })

    const SORTBYFILTERS = useMemo(() => {
        return (['Latest', 'Last Payment', 'Due Amount', 'Name'])
    })

    const [checkedFilter, setcheckedFilter] = useState(SORTBYFILTERS.indexOf(DATAFROMDB.filterMethod)) //State should be fetched from DATABASE or Local Storage

    //Rendering Functions
    const SortFilters = memo(({ data, idx, handleOnPress }) => {
        return (
            <TouchableHighlight onPress={() => handleOnPress(idx)} activeOpacity={0.7} underlayColor={'#ebebeb'}>
                <View style={{ padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Montserrat Regular', fontSize: 15, color: 'black' }}>{data}</Text>
                    <RadioButton
                        status={checkedFilter != null ? checkedFilter == idx ? 'checked' : 'unchecked' : 'unchecked'}
                        color={'#07D589'}
                        unCheckedColor={'transparent'}
                    ></RadioButton>
                </View>
            </TouchableHighlight>
        )
    })

    const handleSortByFilter = useCallback((idx) => {
        setcheckedFilter(idx)
    }, [checkedFilter])

    const clearFilters = () => {
        //Fetch from Data
        //First Check whether filter is applied or not
        if (badge.state) { //that means filter is applied
            setcheckedFilter(SORTBYFILTERS.indexOf(DATAFROMDB.filterMethod))
            applySortFilter(0)
            badge.setState(false)
        } else {
            setcheckedFilter(SORTBYFILTERS.indexOf(DATAFROMDB.filterMethod))
        }
    }

    const handleCloseButton = () => {
        if (badge.state) {
            func()
        } else {
            setcheckedFilter(SORTBYFILTERS.indexOf(DATAFROMDB.filterMethod))
            func()
        }
    }

    const applySortFilter = useCallback((methodIdx) => {
        //Applying Sort Filters
        // Below Method will be used for Sorting Filters from CheckList
        switch (methodIdx) {
            case 0:
                sortByLatest()
                badge.setState(false)
                break
            case 1:
                sortByLastPayment()
                badge.setState(true)
                break
            case 2:
                sortByDueAmount()
                badge.setState(true)
                break
            case 3:
                sortByName()
                badge.setState(true)
                break
            default:
                break
        }
    }, [checkedFilter])

    const sortByLatest = () => {
        var tempData = [...data.mainData]
        if (tempData.length > 0) {
            tempData.sort((obj1, obj2) => {
                var day1 = obj1.date.split('/')[0]
                var day2 = obj2.date.split('/')[0]

                var month1 = obj1.date.split('/')[1]
                var month2 = obj2.date.split('/')[1]

                var year1 = obj1.date.split('/')[2]
                var year2 = obj2.date.split('/')[2]

                var date1 = new Date(`${year1}-${month1 + 1}-${day1}`)
                var date2 = new Date(`${year2}-${month2 + 1}-${day2}`)


                if (date1 < date2) {
                    return 1
                } else if (date1 > date2) {
                    return -1
                } else {
                    if (obj1.cId < obj2.cId) {
                        return 1
                    } else if (obj1.cId > obj2.cId) {
                        return -1
                    } else {
                        return 0
                    }
                }
            })

            data.setData(tempData)
        }
    }

    const sortByLastPayment = () => {
        var tempData = [...data.mainData]

        //Keep all the Payment in same place
        var paymentData = []
        var dueData = []
        tempData.forEach((obj) => {
            if (obj.status === 'payment') {
                paymentData.push(obj)
            } else {
                dueData.push(obj)
            }
        })
        tempData = [...paymentData, ...dueData]

        // Now sort the Data
        tempData.sort((obj1, obj2) => {
            if (obj1.status === 'payment' && obj2.status === 'payment') {
                var day1 = obj1.date.split('/')[0]
                var day2 = obj2.date.split('/')[0]

                var month1 = obj1.date.split('/')[1]
                var month2 = obj2.date.split('/')[1]

                var year1 = obj1.date.split('/')[2]
                var year2 = obj2.date.split('/')[2]

                var date1 = new Date(`${year1}-${month1 + 1}-${day1}`)
                var date2 = new Date(`${year2}-${month2 + 1}-${day2}`)


                if (date1 < date2) {
                    return 1
                } else if (date1 > date2) {
                    return -1
                } else {
                    return 0
                }
            } else {
                return 1
            }
        })

        data.setData(tempData)
    }

    const sortByDueAmount = () => {
        var tempData = [...data.mainData]
        tempData.sort((obj1, obj2) => {
            if (obj1.totalAmount < obj2.totalAmount) {
                return -1
            } else if (obj1.totalAmount > obj2.totalAmount) {
                return 1
            } else {
                return 0
            }
        })

        data.setData(tempData)
    }

    const sortByName = () => {
        var tempData = [...data.mainData]
        tempData.sort((obj1, obj2) => {
            if (obj1.customerName.toLowerCase() < obj2.customerName.toLowerCase()) {
                return -1
            } else if (obj1.customerName.toLowerCase() > obj2.customerName.toLowerCase()) {
                return 1
            } else {
                return 0
            }
        })

        data.setData(tempData)
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={states.modalVisible}
            onRequestClose={() => {
                clearFilters()
                func()
            }}>
            <StatusBar
                backgroundColor={'rgba(0, 0, 0, 0.150)'}
            />

            <View style={{ height: Dimensions.get('window').height, backgroundColor: 'rgba(0, 0, 0, 0.150)' }}>
                <Pressable onPress={() => { func() }} style={{ flex: 1 }} />
                <View style={styles.mainContainer}>
                    <View style={styles.topHeader}>
                        <Text style={styles.topHeaderText}>Filter</Text>
                        <TouchableOpacity onPress={() => { handleCloseButton() }}>
                            <FontAwesomeIcon icon={faXmark} size={20} color='black'></FontAwesomeIcon>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.mainContent}>
                        <ScrollView style={styles.mainContentCol1}>
                            <TouchableOpacity activeOpacity={0.5} style={[styles.col1Buttons, { borderLeftWidth: 5, borderLeftColor: '#07D589', backgroundColor: 'white', paddingLeft: 13 }]}>
                                <Text style={[styles.col1ButtonLabel, { color: '#07D589' }]}>Sort By</Text>
                            </TouchableOpacity>
                        </ScrollView>
                        <ScrollView style={styles.mainContentCol2}>
                            {
                                SORTBYFILTERS.map((value, idx) => (
                                    <SortFilters key={idx} data={value} idx={idx} handleOnPress={handleSortByFilter}></SortFilters>
                                ))
                            }
                        </ScrollView>
                    </View>

                    <View style={styles.footerContainer}>
                        <TouchableOpacity onPress={() => { clearFilters(); func() }} activeOpacity={0.7} style={[{ backgroundColor: '#ebebeb', borderWidth: 1, borderColor: '#07D589' }, styles.footerContainerButtons]}>
                            <Text style={styles.clearButtonText}>Clear</Text>
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.7} onPress={() => { applySortFilter(checkedFilter); func() }} style={[{ backgroundColor: '#07D589', borderWidth: 1, borderColor: '#07D589' }, styles.footerContainerButtons]}>
                            <Text style={styles.applyButtonText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    mainContainer: { backgroundColor: 'white', height: '60%', borderTopStartRadius: 25, borderTopEndRadius: 25 },
    topHeader: { paddingHorizontal: 25, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#ebebeb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    topHeaderText: { fontFamily: 'Montserrat Medium', fontSize: 20, color: 'black' },
    mainContent: { flex: 1, flexDirection: 'row', },
    mainContentCol1: { backgroundColor: '#ebebeb', width: '38%', height: '100%', },
    mainContentCol2: { backgroundColor: 'white', width: '62%', height: '100%', },
    col1Buttons: { paddingLeft: 18 },
    col1ButtonLabel: { paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: 'grey', fontFamily: 'Montserrat Bold', fontSize: 13, color: 'black' },
    footerContainer: { padding: 20, borderTopWidth: 1, borderTopColor: '#ebebeb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerContainerButtons: { width: '48%', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 5, elevation: 3 },
    clearButtonText: { fontFamily: 'Montserrat Bold', fontSize: 15, color: 'black' },
    applyButtonText: { fontFamily: 'Montserrat Bold', fontSize: 15, color: 'white' }
})

export default FilterModal