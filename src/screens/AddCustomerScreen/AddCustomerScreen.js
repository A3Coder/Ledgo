import React, { useCallback, useMemo, useState, memo, useEffect, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TextInput,
    TouchableOpacity,
    Pressable,
    FlatList,
    Image,
    PermissionsAndroid,
    ToastAndroid,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

//Importing External Packages
import Contacts from 'react-native-contacts';

//Importing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faBookOpen, faMagnifyingGlass, faXmark, faUser } from '@fortawesome/free-solid-svg-icons';

//Importing Utils
import { firstLetters, getRandomHexColor } from '../../utils/ReusableFunctions';

//Importing CRUD Functions
import { addCustomer } from '../../services/customerFunctions';

//Importing Context
import { ReusedContext } from '../../context/ReusedContext';

const AddCustomerScreen = () => {
    //Context
    const { forTrackingChanges, forProfile } = useContext(ReusedContext)

    const navigation = useNavigation();
    const route = useRoute()

    //CONSTANTS
    const rippleOptions = useMemo(() => {
        return ({
            foreground: true,
            borderless: false,
            color: '#ebebeb'
        })
    }, [])

    //States
    const [loading, setloading] = useState(true)
    const [progressLoader, setprogressLoader] = useState(false)

    const [searchActive, setsearchActive] = useState(false)
    const [searchInput, setsearchInput] = useState('')

    const [PHONECONTACTSFROMDB, setPHONECONTACTSFROMDB] = useState(null)
    const [phoneContacts, setphoneContacts] = useState(null)
    const [permissionsGranted, setpermissionsGranted] = useState(false) //Fetched from PERMISSIONS

    //Functions
    const navigatorFunction = useCallback((screenName) => {
        navigation.navigate(screenName)
    }, [navigation])

    const handleSearchDisplay = useCallback(() => {
        setsearchInput('')
        handleDataFilter('')
        setsearchActive(!searchActive)
        // console.log(PHONECONTACTSFROMDB)
        // setphoneContacts(PHONECONTACTSFROMDB)
    }, [searchActive])

    const handleSearchInput = (text) => {
        setsearchInput(text)
        handleDataFilter(text)
    }

    const handleDataFilter = (text) => {
        var tempData = PHONECONTACTSFROMDB
        var pattern = new RegExp(text)

        if (tempData == null) {
            return
        }

        tempData = tempData.filter((obj, idx) => {
            if (pattern.test(obj.name) || pattern.test(obj.mobile)) {
                return obj
            }
        })
        setphoneContacts(tempData)
    }

    const handlePermissionsandContacts = () => {
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS).then(value => {
            if (value === 'granted') {
                setpermissionsGranted(true)
                Contacts.getAll().then((con) => {
                    //Data Formatting
                    var formattedData = []
                    con.forEach((obj) => {
                        if (obj.phoneNumbers.length > 0) {
                            var tempObj = {}
                            tempObj.displayName = obj.displayName
                            tempObj.name = `${obj.givenName} ${obj.middleName != undefined ? obj.middleName : ""} ${obj.familyName != undefined ? obj.familyName : ""}`
                            tempObj.mobile = obj.phoneNumbers[0] != undefined ? obj.phoneNumbers[0].number.split(' ').join("") : ''
                            tempObj.photo = obj.hasThumbnail ? obj.thumbnailPath : ''

                            formattedData.push(tempObj)
                        }
                    })

                    formattedData.sort((obj1, obj2) => {
                        if (obj1.name < obj2.name) {
                            return -1
                        } else if (obj1.name > obj2.name) {
                            return 1
                        } else {
                            return 0
                        }
                    })

                    setPHONECONTACTSFROMDB(formattedData)
                    setphoneContacts(formattedData)
                    setloading(false)
                });
            } else {
                ToastAndroid.show('You can allow contacts permission via Settings', ToastAndroid.SHORT)
            }
        }).catch(err => console.log(err))
    }

    const handleCustomerPress = async (customerDetail) => {
        setprogressLoader(true)
        var currentDate = new Date()
        var data = {
            pId: forProfile.state.pId, //Must be Dynamic
            mobile: parseInt(customerDetail.mobile, 10),
            customerName: customerDetail.customerName,
            photo: customerDetail.photo != "" ? customerDetail.photo : null,
            addedOn: currentDate.toLocaleDateString('en-GB')
        }

        const res = await addCustomer(data)

        if (res > 0) {
            setprogressLoader(false)
            Alert.alert('Customer Created')
            forTrackingChanges.func()
            navigation.goBack()
        } else {
            setprogressLoader(false)
            Alert.alert('Customer Already Present')
        }
    }

    useEffect(() => {
        handlePermissionsandContacts()
    }, []);

    //Rendering Item Functions
    const Item = memo(({ data, idx, lastIndex }) => {
        const rippleOptions = {
            foreground: true,
            borderless: false
        }

        return (
            <Pressable android_ripple={rippleOptions} onPress={() => handleCustomerPress({ mobile: data.mobile, customerName: data.name, photo: data.photo })} style={[styles.listContainer, { marginBottom: idx === lastIndex ? 80 : 0 }]}>
                <View style={[styles.logo, data.photo != "" ? { backgroundColor: 'transparent' } : { backgroundColor: getRandomHexColor(firstLetters(data.name)) }, { overflow: 'hidden' }]}>
                    {
                        data.photo != "" ? (<Image src={data.photo} resizeMode='cover' style={{ width: '100%', height: '100%' }}></Image>) : (<Text style={styles.logoText}>{firstLetters(data.name)}</Text>)
                    }
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.customerName}>{data.name}</Text>
                    <Text style={styles.description}>{data.mobile}</Text>
                </View>
            </Pressable>
        )
    })

    const renderItem = useCallback(({ item, index }) => {
        return (
            <Item data={item} idx={index} lastIndex={phoneContacts.length - 1} />
        )
    }, [phoneContacts])

    return (
        <View style={{ height: Dimensions.get('window').height, backgroundColor: 'white', position: 'relative' }}>
            {
                progressLoader && (
                    <View style={{ position: 'absolute', top: 0, left: 0, zIndex: 12, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size={'large'} color={'#07D589'}></ActivityIndicator>
                    </View>
                )
            }
            <View style={styles.container}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <FontAwesomeIcon icon={faArrowLeft} size={18} color='black'></FontAwesomeIcon>
                </TouchableOpacity>
                {
                    !searchActive ? (<Text style={styles.heading}>Add Customer</Text>) : (<TextInput autoFocus={true} placeholder={'Search Customer'} value={searchInput} onChangeText={(e) => handleSearchInput(e)} style={styles.searchInput} />)
                }
                <TouchableOpacity onPress={handleSearchDisplay} style={styles.backButton}>
                    {
                        !searchActive ? (<FontAwesomeIcon icon={faMagnifyingGlass} size={18} color='black'></FontAwesomeIcon>) : (<FontAwesomeIcon icon={faXmark} size={18} color='black'></FontAwesomeIcon>)
                    }
                </TouchableOpacity>
            </View>

            <View style={styles.contactHeadingContainer}>
                <Text style={styles.contactHeading}>Phonebook Contacts</Text>
            </View>

            {
                permissionsGranted ? loading ? (<View style={styles.permissionSectionContainer}>
                    <ActivityIndicator size="large" color="#07D589" />
                </View>) : (
                    < FlatList
                        data={phoneContacts}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        style={{ flex: 1 }}
                    />
                ) : (
                    <Pressable style={styles.permissionSectionContainer} onPress={handlePermissionsandContacts}>
                        <View style={styles.icon}>
                            <FontAwesomeIcon icon={faBookOpen} size={60} color='#07D589'></FontAwesomeIcon>
                        </View>
                        <Text style={styles.p1}>Import Phone Contacts</Text>
                        <Text style={styles.p2}>Add new customers directly from phonebook</Text>
                    </Pressable>
                )
            }

            {/* Add Customer Button */}
            <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('AddCustomerManually')} style={styles.addCustomerButton}>
                <View style={{ position: 'relative' }}>
                    <Text style={styles.buttonPlusIcon}>+</Text>
                    <FontAwesomeIcon icon={faUser} size={13} color='white'></FontAwesomeIcon>
                </View>
                <Text style={styles.buttonLabel}>Add Manually</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        zIndex: 10,
        paddingHorizontal: 18,
        paddingVertical: 15,
        backgroundColor: 'white',
        elevation: 5,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 15
    },
    backButton: {
        padding: 5,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    heading: {
        flex: 1,
        fontFamily: 'Montserrat Medium',
        fontSize: 18,
        color: 'black',
    },
    searchInput: { flex: 1, paddingHorizontal: 5, paddingVertical: 0, fontFamily: 'Montserrat Regular', fontSize: 15, color: 'black' },
    listContainer: { paddingHorizontal: 15, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 7 },
    logo: { width: 50, height: 50, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
    logoText: { fontSize: 20, fontFamily: 'Montserrat Bold', color: 'white' },
    contentContainer: { flex: 1, paddingBottom: 20, paddingTop: 10, borderBottomWidth: 1, borderColor: '#ebebeb', gap: 3 },
    customerName: { fontFamily: 'Montserrat Bold', fontSize: 16, color: 'black', width: '100%' },
    description: { fontFamily: 'Montserrat Regular', fontSize: 14, color: 'grey', width: '100%', textAlign: 'left' },
    contactHeadingContainer: { backgroundColor: '#ebebeb', paddingHorizontal: 15, paddingVertical: 10 },
    contactHeading: { fontFamily: 'Montserrat Medium', fontSize: 14, color: 'black' },
    permissionSectionContainer: { flex: 1, paddingVertical: 10, rowGap: 10, justifyContent: 'center', alignItems: 'center' },
    icon: { width: 120, height: 125, borderRadius: 100, borderWidth: 1, borderColor: '#07D589', justifyContent: 'center', alignItems: 'center' },
    p1: { fontFamily: 'Montserrat Bold', fontSize: 20, color: 'black', width: '100%', textAlign: 'center' },
    p2: { fontFamily: 'Montserrat Medium', fontSize: 15, color: 'grey', width: '100%', textAlign: 'center' },
    addCustomerButton: { position: 'absolute', bottom: 20, right: '22%', zIndex: 10, width: '55%', paddingHorizontal: 30, paddingVertical: 20, borderRadius: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, backgroundColor: '#07D589', elevation: 4 },
    buttonPlusIcon: { position: 'absolute', top: -7, left: -7, fontFamily: 'Montserrat Bold', fontSize: 15, color: 'white' },
    buttonLabel: { fontFamily: 'Montserrat Bold', fontSize: 13, color: 'white' },
})

export default memo(AddCustomerScreen)