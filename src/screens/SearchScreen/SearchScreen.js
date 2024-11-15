import React, { memo, useCallback, useContext, useMemo, useState, useEffect, useRef } from 'react';
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
    Alert,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

//Importing External Packages
import Contacts from 'react-native-contacts';

//Importing Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faXmark, faBookOpen } from '@fortawesome/free-solid-svg-icons';

//Importing Utils
import { firstLetters, getRandomHexColor } from '../../utils/ReusableFunctions';

//Importing Contexts
import { ReusedContext } from '../../context/ReusedContext';

//Importing FireBase Functions
import { addCustomer } from '../../services/customerFunctions';

const SearchScreen = () => {
    //Contexts
    const { forTrackingChanges, forProfile, forMainScreenCustomers } = useContext(ReusedContext)

    //Constants
    const navigation = useNavigation()

    //Refs
    const searchInputRef = useRef(null)

    //States
    const [contactsLoading, setcontactsLoading] = useState(false)
    const [progressLoader, setprogressLoader] = useState(false)

    const [DATA, setDATA] = useState(forMainScreenCustomers.state)
    const [datafromDB, setdatafromDB] = useState(DATA)

    const [permissionsGranted, setpermissionsGranted] = useState(false) //Fetched from PERMISSIONS

    //States for Input
    const [searchInput, setsearchInput] = useState('')
    const handleSearchInput = (text) => {
        if (text == '') {
            setsearchInput('')
            setdatafromDB([...DATA])
            return
        }
        setsearchInput(text)
        searchContacts(text)
    }

    //Functions
    const navigatorFunction = useCallback((screenName, options) => {
        navigation.navigate(screenName, options)
    }, [navigation])

    const searchContacts = (text) => {
        const pattern = new RegExp(text, "gi");
        const tempData = DATA
        const newData = tempData.filter((obj) => {
            if (pattern.test(obj.customerName) || pattern.test(obj.mobile)) {
                return obj
            }
        })

        setdatafromDB([...newData])
    }

    const handleCustomerPress = async (customerDetail) => {
        try {
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
        } catch (error) {
            console.log(error)
        }
    }

    const handlePermissionsandContacts = () => {
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS).then(value => {
            if (value === 'granted') {
                setpermissionsGranted(true)
                setcontactsLoading(true)
                Contacts.getAll().then((con) => {
                    //Data Formatting
                    var tempData = []
                    con.forEach((obj) => {
                        if (obj.phoneNumbers.length > 0) {
                            var tempObj = {}
                            tempObj.fromContacts = true
                            tempObj.customerName = `${obj.givenName} ${obj.middleName != undefined ? obj.middleName : ""} ${obj.familyName != undefined ? obj.familyName : ""}`
                            tempObj.mobile = obj.phoneNumbers[0] != undefined ? obj.phoneNumbers[0].number.split(' ').join("") : ''
                            tempObj.photo = obj.hasThumbnail ? obj.thumbnailPath : ''

                            tempData.push(tempObj)
                        }
                    })

                    tempData.sort((obj1, obj2) => {
                        if (obj1.customerName < obj2.customerName) {
                            return -1
                        } else if (obj1.customerName > obj2.customerName) {
                            return 1
                        } else {
                            return 0
                        }
                    })

                    setDATA((prev) => { return [...prev, ...tempData] })
                    setdatafromDB((prev) => { return [...prev, ...tempData] })
                    setcontactsLoading(false)
                    if (searchInputRef.current != null) {
                        // console.log(searchInputRef.current.autoFocus = true)
                        searchInputRef.current.focus()
                    }
                });
            } else {
                ToastAndroid.show('You can allow contacts permission via Settings', ToastAndroid.SHORT)
            }
        }).catch(err => console.log(err))
    }

    useEffect(() => {
        handlePermissionsandContacts()
    }, []);

    //Rendering Item Components
    const Item = memo(({ data, idx }) => {
        const rippleOptions = {
            foreground: true,
            borderless: false
        }

        if (!data.fromContacts) {
            return (
                <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('CustomerTransactions', { customerName: data.customerName, cId: data.cId, customerMobile: data.mobile })} style={styles.listContainer}>
                    <View style={[styles.logo, { backgroundColor: getRandomHexColor(firstLetters(data.customerName)), overflow: 'hidden' }]}>
                        {/* <Text style={styles.logoText}>{firstLetters(data.customerName)}</Text> */}
                        {
                            data.photo != null ? (
                                <Image src={data.photo} resizeMode='cover' style={{ width: '100%', height: '100%' }}></Image>
                            ) : (
                                <Text style={styles.logoText}>{firstLetters(data.customerName)}</Text>
                            )
                        }
                    </View>

                    <View style={styles.contentContainer}>
                        <Text style={styles.customerName}>{data.customerName}</Text>
                        <Text style={styles.description}>Balance <Text style={[{ fontFamily: 'Montserrat Medium' }, data.totalAmount >= 0 ? { color: 'green' } : { color: 'red' }]}>{'\u20B9'}{Math.abs(data.totalAmount)}/-</Text> {data.totalAmount >= 0 ? 'Payment' : 'Due'}</Text>
                    </View>
                </Pressable>
            )
        } else {
            return (
                <Pressable android_ripple={rippleOptions} onPress={() => handleCustomerPress({ mobile: data.mobile, customerName: data.customerName, photo: data.photo })} style={styles.listContainer}>
                    <View style={[styles.logo, data.photo == "" && { backgroundColor: getRandomHexColor(data.customerName) }, { overflow: 'hidden' }]}>
                        {
                            data.photo != "" ? (<Image src={data.photo} resizeMode='cover' style={{ width: '100%', height: '100%' }}></Image>) : (<Text style={styles.logoText}>{firstLetters(data.customerName)}</Text>)
                        }
                    </View>

                    <View style={styles.contentContainer}>
                        <Text style={styles.customerName}>{data.customerName}</Text>
                        <Text style={styles.description}>{data.mobile}</Text>
                    </View>
                </Pressable>
            )
        }
    })

    //Rendering Functions
    const renderItem = useCallback(({ item, index }) => {
        return (
            <Item data={item} idx={index} />
        )
    }, [datafromDB])

    return (
        <View style={{ height: Dimensions.get('window').height, backgroundColor: 'white', position: 'relative' }}>
            {
                progressLoader && (
                    <View style={{ position: 'absolute', top: 0, left: 0, zIndex: 12, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size={'large'} color={'#07D589'}></ActivityIndicator>
                    </View>
                )
            }

            {
                contactsLoading && (
                    <View style={{ position: 'absolute', top: 0, left: 0, zIndex: 12, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
                        <ActivityIndicator size={'large'} color={'#07D589'}></ActivityIndicator>
                        <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 15, textAlign: 'center', color: '#07D589' }}>Loading Contacts...</Text>
                    </View>
                )
            }

            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <FontAwesomeIcon icon={faArrowLeft} size={18} color='black'></FontAwesomeIcon>
                </TouchableOpacity>
                <TextInput ref={searchInputRef} placeholder={'Search Customer'} value={searchInput} onChangeText={(e) => handleSearchInput(e)} style={styles.searchInput} />
                {
                    searchInput != "" && (
                        <TouchableOpacity style={styles.backButton} onPress={() => handleSearchInput('')}>
                            <FontAwesomeIcon icon={faXmark} size={18} color='black'></FontAwesomeIcon>
                        </TouchableOpacity>
                    )
                }
            </View>

            {/* Multiple Contacts from LOCAL Storage */}
            <FlatList
                data={datafromDB}
                renderItem={renderItem}
                refreshing={true}
                showsVerticalScrollIndicator={false}
                initialNumToRender={6}
                // windowSize={5}
                // maxToRenderPerBatch={10}
                style={{ flex: 1 }}
            />

            {
                permissionsGranted == false && (
                    <View style={styles.contactHeadingContainer}>
                        <Text style={styles.contactHeading}>Contacts</Text>
                    </View>
                )
            }

            {/* Multiple Contacts from Contacts List */}
            {
                permissionsGranted == false && (<Pressable style={styles.permissionSectionContainer}>
                    <View style={styles.icon}>
                        <FontAwesomeIcon icon={faBookOpen} size={60} color='#07D589'></FontAwesomeIcon>
                    </View>
                    <Text style={styles.p1}>Import Phone Contacts</Text>
                    <Text style={styles.p2}>Add new customers directly from phonebook</Text>
                </Pressable>)
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
        paddingHorizontal: 22,
        paddingVertical: 15,
        backgroundColor: 'white',
        elevation: 4,
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
    searchInput: { flex: 1, paddingHorizontal: 10, paddingVertical: 5, fontFamily: 'Montserrat Regular', fontSize: 15, color: 'black' },
    listContainer: { paddingHorizontal: 15, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 7 },
    logo: { width: 50, height: 50, backgroundColor: '#07D589', borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
    logoText: { fontSize: 20, fontFamily: 'Montserrat Bold', color: 'white' },
    contentContainer: { flex: 1, paddingBottom: 20, paddingTop: 10, borderBottomWidth: 1, borderColor: '#ebebeb', gap: 3 },
    customerName: { fontFamily: 'Montserrat Bold', fontSize: 16, color: 'black', width: '100%' },
    description: { fontFamily: 'Montserrat Regular', fontSize: 14, color: 'grey', width: '100%', textAlign: 'left' },
    contactHeadingContainer: { backgroundColor: '#ebebeb', paddingHorizontal: 15, paddingVertical: 15 },
    contactHeading: { fontFamily: 'Montserrat Medium', fontSize: 14, color: 'black' },
    permissionSectionContainer: { flex: 1, paddingVertical: 10, rowGap: 5, justifyContent: 'center', alignItems: 'center' },
    icon: { width: 120, height: 125, borderRadius: 100, borderWidth: 1, borderColor: '#07D589', justifyContent: 'center', alignItems: 'center' },
    p1: { fontFamily: 'Montserrat Bold', fontSize: 20, color: 'black', width: '100%', textAlign: 'center' },
    p2: { fontFamily: 'Montserrat Medium', fontSize: 15, color: 'grey', width: '100%', textAlign: 'center' }
})

export default SearchScreen