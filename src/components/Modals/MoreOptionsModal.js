import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Text,
    View,
    Dimensions,
    Pressable,
    Modal,
    StyleSheet,
    StatusBar,
    Animated,
    useAnimatedValue,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

//Importing FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAddressBook, faUser, faGear } from '@fortawesome/free-solid-svg-icons';

const MoreOptionsModal = ({ states, func }) => {
    const navigation = useNavigation();

    //Constants
    const rippleOptions = {
        foreground: true,
        borderless: false,
        color: '#ebebeb'
    }

    //Functions
    const navigatorFunction = (screenName) => {
        // Hide the modal before navigating
        // states.setModalVisible(false);
        func()
        // Navigate to another screen
        navigation.navigate(screenName);
    }

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
                <View style={[styles.mainContainer]}>
                    <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('ProfileAccount')} style={styles.iconButtonContainer}>
                        <View style={styles.icon}>
                            <FontAwesomeIcon icon={faAddressBook} size={20} color='black'></FontAwesomeIcon>
                        </View>
                        <Text style={styles.iconLabel}>Account</Text>
                    </Pressable>
                    <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('AccountProfile')} style={styles.iconButtonContainer}>
                        <View style={styles.icon}>
                            <FontAwesomeIcon icon={faUser} size={20} color='black'></FontAwesomeIcon>
                        </View>
                        <Text style={styles.iconLabel}>Profile</Text>
                    </Pressable>
                    <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('Settings')} style={styles.iconButtonContainer}>
                        <View style={styles.icon}>
                            <FontAwesomeIcon icon={faGear} size={20} color='black'></FontAwesomeIcon>
                        </View>
                        <Text style={styles.iconLabel}>Settings</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    mainContainer: { backgroundColor: 'white', borderTopStartRadius: 25, borderTopEndRadius: 25, paddingHorizontal: 5, paddingVertical: 5, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start' },
    iconButtonContainer: { paddingHorizontal: 25, paddingVertical: 15, justifyContent: 'center', alignItems: 'center', gap: 8 },
    icon: { width: 50, height: 50, borderRadius: 100, backgroundColor: '#ebebeb', justifyContent: 'center', alignItems: 'center' },
    iconLabel: { fontFamily: 'Montserrat Medium', fontSize: 15, color: 'black' }
})

export default MoreOptionsModal