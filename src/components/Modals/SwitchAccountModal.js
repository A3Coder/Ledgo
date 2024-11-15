import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    Text,
    View,
    Image,
    Dimensions,
    Pressable,
    Modal,
    StyleSheet,
    FlatList,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

//Importing FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

//Importing from AsynStorage
import { getAllProfiles } from '../../services/profileFunctions';

//Importing Contexts
import { AppContext, } from '../../context/AppContext';
import { ReusedContext } from '../../context/ReusedContext';

//Importing Utils
import { firstLetters } from '../../utils/ReusableFunctions';

const SwitchAccountModal = ({ states, func, data }) => {
    //Contexts
    const { activeProfile, handleActiveProfile } = useContext(AppContext)
    const { forAllProfiles } = useContext(ReusedContext)

    //Variables
    const navigation = useNavigation()
    const rippleOptions = useMemo(() => (
        {
            foreground: true,
            borderless: false,
            color: '#ebebeb'
        }
    ), [])

    //States
    const [loading, setloading] = useState(false)
    const [activatedProfile, setActivatedProfile] = useState([]) //Should be fetched from DB or Local Storage

    //Functions
    const handleChangeActiveProfile = async (item, idx) => {
        setloading(true)
        await handleActiveProfile(idx)
        setloading(false)
        setTimeout(() => {
            func();  // Delayed call to ensure state updates
        }, 500);  // Adjust the delay as needed
        //Handle Further Local Storage Database Tasks
    }

    const navigatorFunction = (screenName) => {
        // Hide the modal before navigating
        func()
        // Navigate to another screen
        navigation.navigate(screenName);
    }

    useEffect(() => {
        if (forAllProfiles.state.length != 0) {
            setActivatedProfile(forAllProfiles.state[activeProfile].mobile)
        }
    }, [activeProfile, forAllProfiles])

    //Rendering Functions
    const Item = useCallback(({ data, idx }) => {
        if (activatedProfile === data.mobile) {
            return (
                <View style={[{ backgroundColor: '#ebebeb' }, styles.itemContainer]}>
                    <View style={styles.itemContainerIcon}>
                        {
                            data.photo != "" && data.photo != null ? (
                                <Image src={data.photo} resizeMode='cover' style={{ width: '100%', height: '100%' }}></Image>
                            ) : (
                                <Text style={styles.iconText}>{firstLetters(data.companyName)}</Text>
                            )
                        }
                    </View>
                    <View>
                        <Text style={styles.companyName}>{data.companyName}</Text>
                        <Text style={styles.mobileNumber}>{data.mobile}</Text>
                    </View>
                </View>
            )
        } else {
            return (
                <Pressable android_ripple={rippleOptions} onPress={() => { handleChangeActiveProfile(data, idx) }} style={[styles.itemContainer]}>
                    <View style={styles.itemContainerIcon}>
                        {
                            data.photo != "" && data.photo != null ? (
                                <Image src={data.photo} resizeMode='cover' style={{ width: '100%', height: '100%' }}></Image>
                            ) : (
                                <Text style={styles.iconText}>{firstLetters(data.companyName)}</Text>
                            )
                        }
                    </View>
                    <View>
                        <Text style={styles.companyName}>{data.companyName}</Text>
                        <Text style={styles.mobileNumber}>{data.mobile}</Text>
                    </View>
                </Pressable >
            )
        }
    }, [forAllProfiles.state, activatedProfile])

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={states.modalVisible}
            onRequestClose={() => {
                func()
            }}>
            <StatusBar
                backgroundColor={'rgba(0, 0, 0, 0.150)'}
            />
            <View style={{ height: Dimensions.get('window').height, backgroundColor: 'rgba(0, 0, 0, 0.150)' }}>
                <Pressable onPress={func} style={{ flex: 1 }} />
                <View style={[styles.mainContainer, { position: 'relative' }]}>
                    {
                        loading && (
                            <View style={{ position: 'absolute', top: 0, left: 0, zIndex: 12, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.20)', justifyContent: 'center', alignItems: 'center', borderTopStartRadius: 25, borderTopEndRadius: 25 }}>
                                <ActivityIndicator size={'large'} color={'#07D589'}></ActivityIndicator>
                            </View>
                        )
                    }
                    <View style={styles.topMainContent}>
                        <FlatList
                            data={forAllProfiles.state}
                            renderItem={({ item, index }) => <Item data={item} idx={index} />}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                    <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('Login')} style={styles.bottomButtonContainer}>
                        <FontAwesomeIcon icon={faPlus} size={20} color='black'></FontAwesomeIcon>
                        <Text style={styles.buttonText}>Create New Profile</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    mainContainer: { backgroundColor: 'white', borderTopStartRadius: 25, borderTopEndRadius: 25 },
    topMainContent: { paddingHorizontal: 20, paddingVertical: 15, },
    itemContainer: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 8, overflow: 'hidden' },
    itemContainerIcon: { width: 50, height: 50, borderRadius: 50, backgroundColor: '#07D589', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    iconText: { fontSize: 22, fontFamily: 'Montserrat Bold', color: 'white' },
    companyName: { fontSize: 15, fontFamily: 'Montserrat Medium', color: 'black' },
    mobileNumber: { fontSize: 12, fontFamily: 'Montserrat Regular', color: 'black' },
    bottomButtonContainer: { paddingHorizontal: 35, paddingVertical: 30, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 10, borderTopWidth: 1, borderColor: '#ebebeb' },
    buttonText: { fontFamily: 'Montserrat Medium', fontSize: 18, color: 'black', flex: 1, }
})

export default React.memo(SwitchAccountModal)