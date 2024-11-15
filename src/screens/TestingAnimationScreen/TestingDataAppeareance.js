import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Animated, Easing, StyleSheet } from 'react-native';

import { getAllCustomersbyPid } from '../../services/customerFunctions';

const TestingDataAppeareance = () => {
    const [data, setData] = useState([]);
    const animatedValues = useRef([]).current;

    // Fetch data (mock API call for this example)
    useEffect(() => {
        const fetchData = async () => {
            // Simulate an API call
            try {
                const res = await getAllCustomersbyPid('P01')
                if (res.length === 0) {
                    console.log('No Customers Found in Profile')
                    setloader(false)
                    return
                }
                setData(res);
                initializeAnimationValues(res.length);
            } catch (error) {
                console.log(error)
            }
        };

        fetchData();
    }, []);

    // Initialize animated values for each item
    const initializeAnimationValues = (itemCount) => {
        animatedValues.length = itemCount;
        for (let i = 0; i < itemCount; i++) {
            if (!animatedValues[i]) {
                animatedValues[i] = new Animated.Value(0); // Ensure each index has an Animated.Value
            }
        }
    };

    const renderItem = ({ item, index }) => {
        // Check if animated value exists for this index
        if (!animatedValues[index]) {
            return null;
        }

        const scale = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });

        const opacity = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });

        return (
            <Animated.View style={[styles.itemContainer, { opacity, transform: [{ scale: scale }] }]}>
                <Text style={styles.itemText}>{item.customerName}</Text>
            </Animated.View>
        );
    };

    return (
        <FlatList
            data={data}
            // keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            extraData={data}
        />
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        marginVertical: 10,
        padding: 20,
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        alignItems: 'center',
    },
    itemText: {
        fontSize: 18,
    },
});

export default TestingDataAppeareance;