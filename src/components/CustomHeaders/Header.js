import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

//Importing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faPhone, faReceipt } from '@fortawesome/free-solid-svg-icons';

//Importing Custom Modules
import { NativeModules } from 'react-native';
const { DialerModule } = NativeModules;

//Importing React Native Components
import { Skeleton } from '@rneui/themed';

//Importing Utils
import { firstLetters } from '../../utils/ReusableFunctions';

//Importing Contexts
import { ReusedContext } from '../../context/ReusedContext';

const Header = ({ heading, extraDetails = '', currentBalance, extraData }) => {
  //Context
  const { forCustomerDetails } = useContext(ReusedContext)

  //Constants
  const navigation = useNavigation()
  const route = useRoute()
  const customerName = route.params != undefined ? route.params.customerName : null
  const customerId = route.params != undefined ? route.params.cId : null

  const [loader, setloader] = useState(true)

  const navigatorFunction = useCallback((screenName, options = '') => {
    if (screenName === 'goBack') {
      navigation.goBack()
      return
    }

    if (screenName === 'CustomerStatement') {
      navigation.navigate(screenName, options)
      return
    }

    if (screenName === 'CustomerProfile') {
      navigation.navigate(screenName, options)
      return
    }

    navigation.navigate(screenName)
  }, [navigation])

  const CallButtonPress = () => {
    var phoneNumber = String(forCustomerDetails.state.mobile).length > 10 ? "+" + String(forCustomerDetails.state.mobile) : String(forCustomerDetails.state.mobile)
    DialerModule.makeCall(phoneNumber, (res) => {
      console.log(res)
    })
  }

  useEffect(() => {
    if (heading != undefined) {
      setloader(false)
    }
  }, [heading])

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.6} onPress={() => navigatorFunction('goBack')} style={styles.backButton}>
        <FontAwesomeIcon icon={faArrowLeft} size={18} color='black'></FontAwesomeIcon>
      </TouchableOpacity>
      {
        extraDetails === 'transactionDetails' && (
          <View style={{ width: 40, height: 40, borderRadius: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#07D589', overflow: 'hidden' }}>
            {
              forCustomerDetails.state.photo != null ? (
                <Image src={forCustomerDetails.state.photo} resizeMode='cover' style={{ width: '100%', height: '100%' }}></Image>
              ) : (
                <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 15, color: 'white', }}>{firstLetters(heading)}</Text>
              )
            }
          </View>
        )
      }
      {/* <Text style={styles.heading}>{heading}</Text> */}
      {
        extraDetails === 'customerStatement' ? (
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 16, color: 'black' }}>{heading}</Text>
            <Text style={{ color: 'grey', fontSize: 12, fontFamily: 'Montserrat Medium' }}>Current Balance: <Text style={currentBalance < 0 ? { color: 'red' } : { color: 'green' }}>{'\u20B9'}{Math.abs(currentBalance)}</Text></Text>
          </View>
        ) : extraDetails === 'customerTransactions' ?
          loader ? (
            <View style={{ flex: 1, gap: 5 }}>
              <Skeleton width={"65%"} height={16} style={{ backgroundColor: '#ebebeb' }} />
              <Skeleton width={"40%"} height={12} style={{ backgroundColor: '#ebebeb' }} />
            </View>
          ) : (
            <TouchableOpacity activeOpacity={0.5} onPress={() => navigatorFunction('CustomerProfile', extraData)} style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 16, color: 'black' }}>{heading}</Text>
              <Text style={{ color: 'green', fontSize: 12, fontFamily: 'Montserrat Medium' }}>View Profile</Text>
            </TouchableOpacity>
          ) : (<Text style={styles.heading}>{heading}</Text>)
      }

      {
        extraDetails === 'customerTransactions' && (loader ? (
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
            <View activeOpacity={0.5} onPress={() => navigatorFunction('CustomerStatement', { customerId: customerId, customerName: customerName })}>
              <Skeleton width={25} height={25} circle style={{ backgroundColor: '#ebebeb' }} />
            </View>
            <View activeOpacity={0.5}>
              <Skeleton width={25} height={25} circle style={{ backgroundColor: '#ebebeb' }} />
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
            <TouchableOpacity activeOpacity={0.5} onPress={() => navigatorFunction('CustomerStatement', { customerId: customerId, customerName: customerName })}>
              <FontAwesomeIcon icon={faReceipt} size={20} color='black'></FontAwesomeIcon>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.5} onPress={CallButtonPress}>
              <FontAwesomeIcon icon={faPhone} size={20} color='black'></FontAwesomeIcon>
            </TouchableOpacity>
          </View>
        ))
      }
    </View >
  )
}

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
    paddingHorizontal: 18,
    paddingVertical: 15,
    backgroundColor: 'white',
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10
  },
  backButton: {
    padding: 5,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  heading: {
    fontFamily: 'Montserrat Medium',
    fontSize: 18,
    color: 'black',
    flex: 1
  }
})

export default Header