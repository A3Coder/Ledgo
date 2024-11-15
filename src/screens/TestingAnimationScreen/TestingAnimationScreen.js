import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, FlatList, Animated, Text, StyleSheet, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window'); // Get screen height for translation

const TestingAnimationScreen = () => {
    const [data, setData] = useState([
        { id: '1', name: 'Apple' },
        { id: '2', name: 'Banana' },
        { id: '3', name: 'Cherry' },
        { id: '4', name: 'Date' },
        { id: '5', name: 'Elderberry' },
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState(data);

    const animatedValues = useRef(data.map(() => ({
        opacity: new Animated.Value(1),
        translateY: new Animated.Value(0),
        scale: new Animated.Value(1),
    }))).current;

    useEffect(() => {
        // Filter the data based on search term
        const newData = data.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        setFilteredData(newData);

        data.forEach((item, index) => {
            const match = item.name.toLowerCase().includes(searchTerm.toLowerCase());

            // Animate unmatched items to scale down, move off-screen, and fade out
            Animated.timing(animatedValues[index].opacity, {
                toValue: match ? 1 : 0, // Opacity to 0 if not matching
                duration: 300,
                useNativeDriver: true,
            }).start();

            Animated.timing(animatedValues[index].translateY, {
                toValue: match ? 0 : SCREEN_HEIGHT, // Move off-screen vertically
                duration: 300,
                useNativeDriver: true,
            }).start();

            Animated.timing(animatedValues[index].scale, {
                toValue: match ? 1 : 0.5, // Scale down if not matching
                duration: 300,
                useNativeDriver: true,
            }).start();
        });
    }, [searchTerm, data, animatedValues]);

    const renderItem = ({ item, index }) => {
        const originalIndex = data.findIndex(d => d.id === item.id);

        return (
            <Animated.View
                style={[
                    styles.item,
                    {
                        opacity: animatedValues[originalIndex].opacity, // Fade-out animation
                        transform: [
                            { translateY: animatedValues[originalIndex].translateY }, // Move upwards animation
                            { scale: animatedValues[originalIndex].scale }, // Scale down animation
                        ],
                    },
                ]}
            >
                <Text style={styles.itemText}>{item.name}</Text>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search..."
                onChangeText={(text) => setSearchTerm(text)}
                value={searchTerm}
            />
            <FlatList
                data={filteredData} // Use the filtered data to re-render
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                extraData={searchTerm} // Re-render on search changes
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    searchBar: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    item: {
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        backgroundColor: '#f9c2ff',
        borderRadius: 10,
    },
    itemText: {
        fontSize: 18,
    },
});

export default TestingAnimationScreen;


// import React, { useState, useRef, useEffect } from 'react';
// import { View, TextInput, FlatList, Animated, Text, StyleSheet } from 'react-native';

// const TestingAnimationScreen = () => {
//     const [data, setData] = useState([
//         { id: '1', name: 'Apple' },
//         { id: '2', name: 'Banana' },
//         { id: '3', name: 'Cherry' },
//         { id: '4', name: 'Date' },
//         { id: '5', name: 'Elderberry' },
//     ]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const animatedValues = useRef(data.map(() => new Animated.Value(1))).current;

//     useEffect(() => {
//         data.forEach((item, index) => {
//             const match = item.name.toLowerCase().includes(searchTerm.toLowerCase());
//             Animated.timing(animatedValues[index], {
//                 toValue: match ? 1 : 0, // Scale down to 0 if it doesn't match
//                 duration: 300,
//                 useNativeDriver: true,
//             }).start();
//         });
//     }, [searchTerm, data, animatedValues]);

//     const renderItem = ({ item, index }) => {
//         return (
//             <Animated.View
//                 style={[
//                     styles.item,
//                     {
//                         transform: [{ scale: animatedValues[index] }], // Scale animation
//                         opacity: animatedValues[index], // Fade-out animation
//                     },
//                 ]}
//             >
//                 <Text style={styles.itemText}>{item.name}</Text>
//             </Animated.View>
//         );
//     };

//     return (
//         <View style={styles.container}>
//             <TextInput
//                 style={styles.searchBar}
//                 placeholder="Search..."
//                 onChangeText={(text) => setSearchTerm(text)}
//                 value={searchTerm}
//             />
//             <FlatList
//                 data={data}
//                 keyExtractor={(item) => item.id}
//                 renderItem={renderItem}
//             />
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         paddingTop: 50,
//     },
//     searchBar: {
//         height: 40,
//         borderColor: 'gray',
//         borderWidth: 1,
//         marginBottom: 10,
//         paddingHorizontal: 10,
//     },
//     item: {
//         padding: 20,
//         marginVertical: 8,
//         marginHorizontal: 16,
//         backgroundColor: '#f9c2ff',
//         borderRadius: 10,
//     },
//     itemText: {
//         fontSize: 18,
//     },
// });

// export default TestingAnimationScreen;