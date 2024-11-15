import React, { useCallback, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Pressable,
    TouchableHighlight
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

//Importing Components
import Header from '../../components/CustomHeaders/Header.js';

//Importing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faReceipt, faUser, faDownload } from '@fortawesome/free-solid-svg-icons';

//Importing Contexts
import { ReusedContext } from '../../context/ReusedContext.js';

const ProfileAccountScreen = () => {
    //Contexts
    const { forProfile, reusedCalculations } = useContext(ReusedContext)

    //Contants
    const navigation = useNavigation()

    const rippleOptions = {
        foregroud: true,
        borderless: false,
        color: '#ebebeb'
    }

    //Functions
    const navigatorFunction = useCallback((screenName, options) => {
        navigation.navigate(screenName, options)
    }, [navigation])

    return (
        <View style={{ height: Dimensions.get('window').height, backgroundColor: 'white' }}>
            <Header heading={forProfile.state.companyName}></Header>

            <View style={styles.mainContentContainer}>

                <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('AccountStatements', { pId: forProfile.state.pId })} style={styles.netBalanceButton}>
                    <View style={styles.topRow}>
                        <FontAwesomeIcon icon={faReceipt} size={20} color='#07D589'></FontAwesomeIcon>
                        <Text style={styles.topRowCol1}>Net Balance</Text>
                        <Text style={styles.topRowCol2}>{'>'}</Text>
                    </View>

                    <View style={styles.remainingRows}>
                        <Text style={[styles.middleRowCols, { color: 'black' }]}>Customer Khata</Text>
                        <Text style={[styles.middleRowCols, reusedCalculations.totalAmount < 0 ? { color: 'red' } : { color: 'green' }]}>{'\u20B9'}{Math.abs(reusedCalculations.totalAmount)}</Text>
                    </View>

                    <View style={styles.remainingRows}>
                        <View style={styles.bottomRowCol}>
                            <FontAwesomeIcon icon={faUser} size={12} color='grey'></FontAwesomeIcon>
                            <Text style={styles.bottomRowColText}>{reusedCalculations.totalAccount} Customers</Text>
                        </View>
                        <Text style={styles.bottomRowColText}>{reusedCalculations.totalAmount < 0 ? 'You Get' : 'You Pay'}</Text>
                    </View>
                </Pressable>

                <Pressable android_ripple={rippleOptions} style={styles.netBalanceButton}>
                    <View style={styles.topRow}>
                        <FontAwesomeIcon icon={faDownload} size={20} color='#07D589'></FontAwesomeIcon>
                        <Text style={styles.topRowCol1}>Download Backup</Text>
                        <Text style={styles.topRowCol2}>{'>'}</Text>
                    </View>
                </Pressable>

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    mainContentContainer: { flex: 1, paddingHorizontal: 10, gap: 10, paddingVertical: 15 },
    netBalanceButton: { padding: 15, borderWidth: 0.8, borderColor: '#ebebeb', borderRadius: 8, backgroundColor: 'white', gap: 10, overflow: 'hidden' },
    topRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    topRowCol1: { flex: 1, textAlign: 'left', fontFamily: 'Montserrat Medium', fontSize: 15, color: 'grey' },
    topRowCol2: { fontFamily: 'Montserrat Medium', fontSize: 15, color: 'grey' },
    remainingRows: { flexDirection: 'row', justifyContent: 'space-between' },
    middleRowCols: { fontFamily: 'Montserrat Bold', fontSize: 18 },
    bottomRowCol: { flexDirection: 'row', gap: 7, justifyContent: 'center', alignItems: 'center' },
    bottomRowColText: { fontFamily: 'Montserrat Regular', fontSize: 12, color: 'grey' },
});

export default ProfileAccountScreen