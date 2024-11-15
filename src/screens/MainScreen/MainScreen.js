import React, { useCallback, useState, useMemo, memo, useEffect, useContext, useRef } from 'react';
import {
    Text,
    View,
    Image,
    Dimensions,
    Pressable,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert,
    BackHandler,
    Animated,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

//Importing My Custom Packages
import { NativeModules } from 'react-native';
const { OpenSettingsModule, AlertDialogModule } = NativeModules;

//Importing Assets or Images
import { NODATA } from '../../../assets/images/Images.js';

//Importing FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faFilter, faMagnifyingGlass, faBook, faAngleUp, faPlus } from '@fortawesome/free-solid-svg-icons';

//Importing React Native Components
import { Skeleton } from '@rneui/themed';

//Importing Components
import AccountListItem from '../../components/AccountListItem/AccountListItem.js';
import SwitchAccountModal from '../../components/Modals/SwitchAccountModal.js';
import FilterModal from '../../components/Modals/FilterModal.js';
import MoreOptionsModal from '../../components/Modals/MoreOptionsModal.js';

//Importing DummyData
import { totalNumberofAccount, calculateTotalAmount, sortByLatest, formattedData } from './../../data/MainScreenDummyData/DUMMYDATA.js';

//Importing from AsynStorage
import { getAllProfiles } from '../../services/profileFunctions.js';
import { getAllCustomersbyPid } from '../../services/customerFunctions.js';

//Importing Context
import { ReusedContext } from '../../context/ReusedContext.js';
import { AppContext } from '../../context/AppContext.js';

const MainScreen = () => {
    //Context
    const { forTrackingChanges, forNetwork, forProfile, forAllProfiles, reusedCalculations, forMainScreenCustomers, forCustomerDetails } = useContext(ReusedContext)
    const { activeProfile, THEME } = useContext(AppContext)

    //Constants
    const navigation = useNavigation();

    //States
    const [saModal, setSAModal] = useState(false);
    const [filterModal, setfilterModal] = useState(false)
    const [moModal, setmoModal] = useState(false)

    const [skeletonLoader, setskeletonLoader] = useState(true)
    const [loader, setloader] = useState(true)
    const [filterApplied, setfilterApplied] = useState(false)

    //Functions
    const switchAccount = useCallback(() => {
        setSAModal(!saModal)
    }, [saModal])

    const filterModalDisplay = useCallback(() => {
        setfilterModal(!filterModal)
    }, [filterModal])

    const moModalDisplay = useCallback(() => {
        setmoModal(!moModal)
    }, [moModal])

    const navigatorFunction = useCallback((screenName, options = '') => {
        if (screenName === 'AccountStatements') {
            navigation.navigate(screenName, options)
            return
        }
        navigation.navigate(screenName)
    }, [navigation])

    //Constants
    const rippleOptions = useMemo(() => {
        return ({
            foreground: true,
            borderless: false,
            color: '#ebebeb'
        })
    }, [])

    const [data, setData] = useState([])

    const renderItem = useCallback(({ item, index }) => {
        return (
            <AccountListItem data={item} idx={index} lastIndex={data.length - 1} />
        )
    }, [data])

    //Hooks
    // Reset modal visibility when coming back to the screen
    useFocusEffect(
        useCallback(() => {
            // When screen is focused, ensure the modal is hidden
            setmoModal(false);
            setSAModal(false);
            forCustomerDetails.setState({})
        }, [])
    );

    //By Default
    useEffect(() => {
        const fetchData = async () => {
            setskeletonLoader(true)
            const res = await getAllProfiles()

            if (res.length != 0) {
                var profiles = res
                forAllProfiles.setState(profiles)
                forProfile.setState((prev) => { return { ...prev, ...profiles[activeProfile] } })
                setskeletonLoader(false)
            }
        }

        if (forNetwork.state != null && forNetwork.state == true) {
            console.log(forNetwork.state)
            fetchData()
        } else if (forNetwork.state != null && forNetwork.state == false) {
            AlertDialogModule.showDialog(
                'Not Connected to Internet',
                'Finera Ledger App requires you to connect to an Internet Connection',
                'Exit App',
                '',
                (positiveResponse) => {
                    console.log('Positive Response: ', positiveResponse)
                    BackHandler.exitApp()
                },
                (negativeResponse) => {
                    console.log('Negative Response: ', negativeResponse)
                    BackHandler.exitApp()
                }
            );
        }
    }, [activeProfile, forNetwork.state])

    useEffect(() => {
        async function fetchData() {
            try {
                setloader(true)
                const res = await getAllCustomersbyPid(forProfile.state.pId)
                if (res.length === 0) {
                    forMainScreenCustomers.setState([])
                    setData([])
                    reusedCalculations.settotalAccount(0)
                    reusedCalculations.settotalAmount(0)
                    setloader(false)
                    return
                }
                var data = formattedData(res)
                forMainScreenCustomers.setState(data)
                setData(sortByLatest(data))
                reusedCalculations.settotalAccount(totalNumberofAccount(data))
                reusedCalculations.settotalAmount(calculateTotalAmount(res))
                setloader(false)
            } catch (error) {
                console.log(error)
                setloader(false)
            }
        }
        if (forProfile.state.pId != undefined) {
            fetchData()
        }
    }, [forProfile.state, forTrackingChanges.state])

    useEffect(() => {
        forNetwork.func()
    }, [])

    return (
        <View style={{ height: Dimensions.get('window').height, backgroundColor: "#ebebeb", position: 'relative' }}>
            <View style={styles.topContainer}>
                {
                    skeletonLoader ? (
                        <View style={{ width: '55%' }}>
                            <View style={styles.switchAccountContainer}>
                                <>
                                    <Skeleton width={50} height={50} animation='pulse' style={{ backgroundColor: '#ebebeb', borderRadius: 100 }}>
                                    </Skeleton>
                                    <Skeleton width={'60%'} height={30} animation='pulse' style={{ backgroundColor: '#ebebeb', borderRadius: 5 }}>
                                    </Skeleton>
                                </>
                            </View>
                        </View>
                    ) : (
                        <Pressable android_ripple={{ ...rippleOptions }} onPress={switchAccount} style={{ width: '55%' }}>
                            <View style={[styles.switchAccountContainer]}>
                                <>
                                    <View style={styles.profileIcon}>
                                        {
                                            forProfile.state.photo != undefined && forProfile.state.photo != null ? (
                                                <Image src={forProfile.state.photo} resizeMode='cover' style={{ width: '100%', height: '100%' }}></Image>
                                            ) : (
                                                <Text style={styles.iconText}>A</Text>
                                            )
                                        }
                                    </View>
                                    <View>
                                        <Text style={[styles.companyName,]}>{forProfile.state.companyName}</Text>
                                        <Text style={[styles.companyNumber,]}>{forProfile.state.mobile}</Text>
                                    </View>
                                </>
                            </View>
                        </Pressable>
                    )
                }

                <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('AccountProfile')}>
                    <View style={[styles.rightProfileIcon]}>
                        <FontAwesomeIcon icon={faUser} size={25} color='white'></FontAwesomeIcon>
                    </View>
                </Pressable>
            </View>

            {/* Main Content */}
            <View style={[styles.mainContentContainer]}>
                <View style={styles.mainContentTopButtonsContainer}>
                    <View style={styles.customer}>
                        <View style={styles.customerInsideView}>
                            <Text style={styles.customerText}>Customers</Text>
                        </View>
                    </View>

                    <Pressable android_ripple={rippleOptions} onPress={filterModalDisplay} style={[styles.topButtonsExtraIcons, { position: 'relative', overflow: 'visible' }]}>
                        <FontAwesomeIcon icon={faFilter} size={15} color='black'></FontAwesomeIcon>
                        {
                            filterApplied && (<View style={{ position: 'absolute', top: 2, right: 2, zIndex: 5, width: 10, height: 10, borderRadius: 100, backgroundColor: 'red' }}></View>)
                        }
                    </Pressable>

                    <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('Search')} style={styles.topButtonsExtraIcons}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} size={15} color='black'></FontAwesomeIcon>
                    </Pressable>
                </View>

                <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('AccountStatements', { pId: forProfile.state.pId })} style={styles.netBalanceContainer}>
                    <View style={styles.netBalanceRows}>
                        <Text style={[styles.netBalanceTopRowCols, { color: 'black' }]}>Net Balance</Text>
                        <Text style={[styles.netBalanceTopRowCols, reusedCalculations.totalAmount < 0 ? { color: 'red' } : { color: 'green' }]}>{'\u20B9'}{Math.abs(reusedCalculations.totalAmount)} {'>'}</Text>
                    </View>

                    <View style={styles.netBalanceRows}>
                        <View style={styles.bottomRowCol}>
                            <FontAwesomeIcon icon={faUser} size={11} color='grey'></FontAwesomeIcon>
                            <Text style={styles.bottomRowColText}>{reusedCalculations.totalAccount} Customers</Text>
                        </View>
                        <Text style={styles.bottomRowColText}>{reusedCalculations.totalAmount < 0 ? 'You Get' : 'You Pay'}</Text>
                    </View>
                </Pressable>

                {/* All Accounts List */}
                {
                    loader ? (
                        <>
                            <Skeleton width={'100%'} height={70} style={{ borderRadius: 7, backgroundColor: '#ebebeb', marginBottom: 15, marginTop: 15 }}>
                            </Skeleton>
                            <Skeleton width={'100%'} height={70} style={{ borderRadius: 7, backgroundColor: '#ebebeb', marginBottom: 15 }}>
                            </Skeleton>
                            <Skeleton width={'100%'} height={70} style={{ borderRadius: 7, backgroundColor: '#ebebeb', marginBottom: 15 }}>
                            </Skeleton>
                            <Skeleton width={'100%'} height={70} style={{ borderRadius: 7, backgroundColor: '#ebebeb', marginBottom: 15 }}>
                            </Skeleton>
                        </>
                    ) : data.length == 0 ? (
                        <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', rowGap: 20, overflow: 'hidden' }}>
                            <Image source={NODATA} resizeMode='cover' style={{ width: '100%', height: 175 }}></Image>
                            <Text style={{ width: '100%', fontFamily: 'Montserrat Bold', fontSize: 12, textAlign: 'center', color: '#07D589' }}>No Customers in this Profile, Add a Customer</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={data}
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
                            initialNumToRender={7}
                        // maxToRenderPerBatch={10}
                        />
                    )
                }

                {/* Add Customer Button */}
                <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('AddCustomer')} style={styles.addCustomerButton}>
                    <View style={{ position: 'relative' }}>
                        <Text style={styles.buttonPlusIcon}>+</Text>
                        <FontAwesomeIcon icon={faUser} size={13} color='black'></FontAwesomeIcon>
                    </View>
                    <Text style={styles.buttonLabel}>Add Customer</Text>
                </Pressable>
            </View>

            {/* Bottom Tab */}
            <View style={[styles.bottomTabContainer]}>
                <Pressable android_ripple={rippleOptions} style={styles.bottomTabIconContainer}>
                    <View style={[{ backgroundColor: '#07D589' }, styles.bottomTabIcon]}>
                        <FontAwesomeIcon icon={faBook} color="white" size={15}></FontAwesomeIcon>
                    </View>
                    <Text style={[{ color: '#07D589' }, styles.bottomTabLabel]}>Ledger</Text>
                </Pressable>

                <Pressable android_ripple={rippleOptions} onPress={moModalDisplay} style={styles.bottomTabIconContainer}>
                    <View style={[styles.bottomTabIcon]}>
                        <FontAwesomeIcon icon={faAngleUp} color={"#252525"} size={15}></FontAwesomeIcon>
                    </View>
                    <Text style={[{ color: "#252525" }, styles.bottomTabLabel]}>More</Text>
                </Pressable>
            </View>

            {/* Modals */}
            <SwitchAccountModal states={{ modalVisible: saModal }} func={switchAccount} data={{ mainData: forProfile.state, setData: forProfile.setState }} />
            <FilterModal states={{ modalVisible: filterModal }} func={filterModalDisplay} data={{ mainData: data, setData: setData }} badge={{ state: filterApplied, setState: setfilterApplied }} />
            <MoreOptionsModal states={{ modalVisible: moModal }} func={moModalDisplay} />
        </View>
    )
}

const styles = StyleSheet.create({
    topContainer: { paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    switchAccountContainer: { borderRadius: 50, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 8, overflow: 'hidden' },
    profileIcon: { width: 50, height: 50, borderRadius: 50, backgroundColor: '#07D589', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    iconText: { fontSize: 22, fontFamily: 'Montserrat Bold', color: 'white' },
    companyName: { fontSize: 13, fontFamily: 'Montserrat Medium', color: 'black' },
    companyNumber: { fontSize: 10, fontFamily: 'Montserrat Regular', color: 'black' },
    rightProfileIcon: { width: 50, height: 50, borderRadius: 50, borderWidth: 3, borderColor: 'white', backgroundColor: '#07D589', justifyContent: 'center', alignItems: 'center', gap: 8 },
    mainContentContainer: { position: 'relative', flex: 1, backgroundColor: 'white', borderTopStartRadius: 20, borderTopEndRadius: 20, paddingHorizontal: 15, paddingTop: 15, paddingBottom: 1 },
    mainContentTopButtonsContainer: { marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    customer: { padding: 5, width: '60%', height: 40, backgroundColor: '#ebebeb', borderRadius: 30 },
    customerInsideView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: 30 },
    customerText: { fontSize: 15, fontFamily: 'Montserrat Bold', color: 'black' },
    topButtonsExtraIcons: { width: 40, height: 40, backgroundColor: '#ebebeb', borderRadius: 50, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    netBalanceContainer: { marginBottom: 5, padding: 15, borderRadius: 8, backgroundColor: '#ebebeb', rowGap: 5 },
    netBalanceRows: { flexDirection: 'row', justifyContent: 'space-between' },
    netBalanceTopRowCols: { fontFamily: 'Montserrat Bold', fontSize: 16 },
    bottomRowCol: { flexDirection: 'row', gap: 7, justifyContent: 'center', alignItems: 'center' },
    bottomRowColText: { fontFamily: 'Montserrat Regular', fontSize: 11, color: 'grey' },
    addCustomerButton: { position: 'absolute', bottom: 10, right: 10, zIndex: 10, width: '50%', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, backgroundColor: '#07D589', elevation: 4 },
    buttonPlusIcon: { position: 'absolute', top: -7, left: -7, fontFamily: 'Montserrat Bold', fontSize: 15, color: 'black' },
    buttonLabel: { fontFamily: 'Montserrat Bold', fontSize: 13, color: 'black' },
    bottomTabContainer: { backgroundColor: 'white', borderTopStartRadius: 20, borderTopEndRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    bottomTabIconContainer: { flex: 1, paddingHorizontal: 60, paddingVertical: 10, justifyContent: 'center', alignItems: 'center', rowGap: 3, },
    bottomTabIcon: { paddingHorizontal: 20, paddingVertical: 5, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    bottomTabLabel: { fontFamily: 'Montserrat Bold', fontSize: 14 },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
});

export default memo(MainScreen)