import React, { useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableHighlight
} from 'react-native';

//Importing Components
import Header from '../../components/CustomHeaders/Header.js';

//Importing Font Awesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCloudArrowUp, faPowerOff } from '@fortawesome/free-solid-svg-icons';

//Importing Contexts
import { AppContext } from '../../context/AppContext.js';

const SettingsScreen = () => {
    //Contexts
    const { logout } = useContext(AppContext)

    //Functions
    const handleLogout = () => {
        logout()
    }

    return (
        <View style={{ height: Dimensions.get('window').height, backgroundColor: '#ebebeb' }}>
            <Header heading={'Settings'}></Header>

            <View style={{ paddingHorizontal: 10, paddingVertical: 15 }}>
                <View style={styles.mainContentContainer}>

                    <TouchableHighlight activeOpacity={0.5} underlayColor={'#ebebeb'}>
                        <View style={[styles.mainContentButtons, { borderBottomWidth: 1, borderBottomColor: '#ebebeb' }]}>
                            <FontAwesomeIcon icon={faCloudArrowUp} size={30} color='black'></FontAwesomeIcon>
                            <Text style={styles.buttonText}>Backup</Text>
                        </View>
                    </TouchableHighlight>

                    <TouchableHighlight activeOpacity={0.5} onPress={handleLogout} underlayColor={'#ebebeb'}>
                        <View style={styles.mainContentButtons}>
                            <FontAwesomeIcon icon={faPowerOff} size={30} color='red'></FontAwesomeIcon>
                            <Text style={{ ...styles.buttonText, color: 'red' }}>Sign Out</Text>
                        </View>
                    </TouchableHighlight>

                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    mainContentContainer: { backgroundColor: 'white', borderRadius: 8, overflow: 'hidden' },
    mainContentButtons: { paddingHorizontal: 20, paddingVertical: 25, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 30 },
    buttonText: { fontFamily: 'Montserrat Medium', fontSize: 18, color: 'black' },
})

export default SettingsScreen