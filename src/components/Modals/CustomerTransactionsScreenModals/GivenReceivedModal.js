import React, { useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Dimensions,
    Pressable,
    Modal,
    StatusBar,
    TouchableOpacity,
    Image
} from 'react-native';

//Importing FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAngleDown, faCamera, faCheck, faDeleteLeft, faNoteSticky, faPhone, faReceipt, faSms } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

//Importing Images
import { BATMAN } from '../../../../assets/images/Images';

//Importing Components
import Header from '../../CustomHeaders/Header';
import { useNavigation } from '@react-navigation/native';

const GivenReceivedModal = ({ states, func }) => {
    //Constants
    const navigation = useNavigation()
    const calcButtonArray = Array.from({ length: 9 }, (_, i) => i + 1);

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={states.modalVisible}
            onRequestClose={() => {
                func()
            }}>
            <StatusBar
                backgroundColor={'white'}
            />

            <View behavior={'height'} style={{ height: Dimensions.get('window').height, backgroundColor: 'white' }}>
                <Header heading={'Customer Name'}></Header>

                <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20, justifyContent: 'flex-start', alignItems: 'center', }}>
                    <View style={{ marginTop: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2, paddingHorizontal: 10, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#ebebeb' }}>
                        <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 20, color: 'red' }}>{'\u20B9'}</Text>
                        <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 40, color: 'black' }}>0</Text>
                    </View>

                    {/* Date Button */}
                    <Pressable style={{ position: 'relative', marginVertical: 15, justifyContent: 'center', alignItems: 'center', gap: 2, padding: 15, borderWidth: 1, borderColor: '#ebebeb', borderRadius: 7 }}>
                        <Text style={{ position: 'absolute', top: -10, left: 5, fontFamily: 'Montserrat Bold', fontSize: 12, color: 'grey', backgroundColor: 'white', paddingHorizontal: 5 }}>Date</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                            <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 12, color: 'black' }}>Sept 18, 2024</Text>
                            <FontAwesomeIcon icon={faAngleDown} size={12} color='black'></FontAwesomeIcon>
                        </View>
                    </Pressable>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
                        <Pressable style={{ width: 80, padding: 8, borderWidth: 1, borderColor: '#07D589', borderRadius: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', gap: 10 }}>
                            <FontAwesomeIcon icon={faCamera} size={20} color='#07D589'></FontAwesomeIcon>
                            <Text style={{ fontFamily: 'Montserrat Medium', fontSize: 12, color: '#07D589', textAlign: 'center' }}>Add Images</Text>
                        </Pressable>

                        {/* Images will be here */}
                        <Pressable style={{ width: 80, height: 80, borderRadius: 5, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                            <Image source={BATMAN} resizeMode='cover' style={{ width: '100%', height: '100%' }}></Image>
                        </Pressable>

                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={true}
                            onRequestClose={() => {
                            }}>
                            <StatusBar
                                backgroundColor={'black'}
                            />

                            <View style={{ height: Dimensions.get('window').height, backgroundColor: 'black' }}>
                                {/* <Pressable onPress={func} style={{ flex: 1 }} /> */}
                            </View>
                        </Modal>
                    </View>
                </View>

                <View style={{ padding: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, backgroundColor: 'white' }}>
                    <View style={[styles.inputContainer]}>
                        <Text style={styles.inputLabel}>Add Notes: {'(Optional)'}</Text>

                        <FontAwesomeIcon icon={faNoteSticky} size={20} color={'black'}></FontAwesomeIcon>
                        <TextInput style={styles.input}></TextInput>
                    </View>

                    <Pressable style={{ backgroundColor: "#07D589", height: 40, width: 40, borderRadius: 100, justifyContent: 'center', alignItems: 'center' }}>
                        <FontAwesomeIcon icon={faCheck} size={15} color='white'></FontAwesomeIcon>
                    </Pressable>
                </View>

                {/* Custom Num Keyboard */}
                <View style={{ backgroundColor: 'white', padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', rowGap: 8, flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: "#ebebeb" }}>
                    {
                        calcButtonArray.map((num, idx) =>
                        (
                            <TouchableOpacity key={idx} style={{ width: "32%", paddingVertical: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: '#ebebeb' }}>
                                <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 22, color: 'black' }}>{num}</Text>
                            </TouchableOpacity>
                        )
                        )
                    }
                    <TouchableOpacity style={{ width: "32%", paddingVertical: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: '#ebebeb' }}>
                        <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 22, color: 'black' }}>.</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width: "32%", paddingVertical: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: '#ebebeb' }}>
                        <Text style={{ fontFamily: 'Montserrat Bold', fontSize: 22, color: 'black' }}>0</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width: "32%", paddingVertical: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: '#fab1c4', alignSelf: 'stretch' }}>
                        <FontAwesomeIcon icon={faDeleteLeft} size={23} color='black'></FontAwesomeIcon>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        borderWidth: 2,
        borderRadius: 8,
        borderColor: '#ebebeb',
        paddingHorizontal: 8,
        paddingVertical: 5,
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    inputLabel: {
        position: 'absolute',
        zIndex: 1,
        top: -11,
        left: 8,
        paddingHorizontal: 5,
        backgroundColor: 'white',
        fontSize: 13,
        color: 'black',
        fontFamily: 'Montserrat SemiBold',
    },
    input: {
        height: 40,
        paddingHorizontal: 8,
        paddingVertical: 0,
        fontFamily: 'Montserrat Regular',
        fontSize: 18,
        flex: 1
    },
});

export default GivenReceivedModal