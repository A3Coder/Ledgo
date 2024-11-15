import React, { memo, useCallback, useContext, useMemo } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

//Importing Contexts
import { AppContext } from '../../context/AppContext';

//Importing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck, faUser } from '@fortawesome/free-solid-svg-icons';

//Imporiting Utils
import { firstLetters, getRandomHexColor, timeFormat, dateFormat } from '../../utils/ReusableFunctions';

const AccountListItem = React.memo(({ data, idx, lastIndex, animation }) => {
    //Contexts
    const { THEME } = useContext(AppContext)

    //Constants
    const navigation = useNavigation()

    const rippleOptions = useMemo(() => (
        {
            foreground: true,
            borderless: false,
            color: '#ebebeb'
        }
    ), [])

    const navigatorFunction = useCallback((screenName, options) => {
        navigation.navigate(screenName, options)
    }, [navigation])

    const dueOradvance = (amount) => {
        if (amount >= 0) {
            return 'Advance'
        } else {
            return 'Due'
        }
    }

    return (
        <Pressable android_ripple={rippleOptions} onPress={() => navigatorFunction('CustomerTransactions', { customerName: data.customerName, cId: data.cId, customerMobile: data.mobile })} style={[styles.container, { marginBottom: idx === lastIndex ? 60 : 0 }]}>
            <View style={[styles.logo, { backgroundColor: getRandomHexColor(firstLetters(data.customerName)), overflow: 'hidden' }]}>
                {
                    data.photo != null ? (
                        <Image src={data.photo} resizeMode='cover' style={{ width: '100%', height: '100%' }}></Image>
                    ) : (
                        <Text style={styles.logoText}>{firstLetters(data.customerName)}</Text>
                    )
                }
            </View>

            <View style={styles.contentContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[styles.row1Col1]}>{data.customerName}</Text>
                    <Text style={[styles.row1Col2, dueOradvance(data.totalAmount) === 'Due' ? { color: 'red' } : { color: 'green' }]}>{'\u20B9'}{dueOradvance(data.totalAmount) === 'Due' ? Math.abs(data.totalAmount) : data.totalAmount}/-</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {
                        data.addedOn != undefined ? (
                            <View style={styles.row2Col1}>
                                <FontAwesomeIcon icon={faUser} size={11} color='grey'></FontAwesomeIcon>
                                <Text style={styles.row2Col1Text}>Added {(new Date()).toLocaleDateString('en-GB') === data.addedOn ? "Today" : `on ${dateFormat(data.addedOn)}`}</Text>
                            </View>
                        ) : (
                            <View style={styles.row2Col1}>
                                <FontAwesomeIcon icon={faCheck} size={11} color='grey'></FontAwesomeIcon>
                                <Text style={styles.row2Col1Text}>{data.amount} {data.status} added {(new Date()).toLocaleDateString('en-GB') === data.date ? "Today" : `on ${dateFormat(data.date)}`}</Text>
                            </View>
                        )
                    }
                    <Text style={styles.row2Col2}>{dueOradvance(data.totalAmount)}</Text>
                </View>
            </View>
        </Pressable>
    )
})

const styles = StyleSheet.create({
    container: { borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 7 },
    logo: { width: 50, height: 50, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
    logoText: { fontSize: 20, fontFamily: 'Montserrat Bold', color: 'white' },
    contentContainer: { flex: 1, paddingBottom: 20, paddingTop: 10, borderBottomWidth: 1, borderColor: '#ebebeb' },
    row1Col1: { fontFamily: 'Montserrat Bold', fontSize: 16, color: 'black', width: '59%' },
    row1Col2: { fontFamily: 'Montserrat Bold', fontSize: 16, color: 'red', width: '39%', textAlign: 'right' },
    row2Col1: { flexDirection: 'row', gap: 5, justifyContent: 'flex-start', alignItems: 'center', width: '79%', },
    row2Col1Text: { fontFamily: 'Montserrat Regular', fontSize: 11, color: 'grey', textAlign: 'left', },
    row2Col2: { fontFamily: 'Montserrat Regular', fontSize: 11, color: 'grey', width: '19%', textAlign: 'right' },
})

export default AccountListItem