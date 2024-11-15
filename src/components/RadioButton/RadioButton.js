import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const RadioButton = ({ status, color, unCheckedColor }) => {
    return (
        <View style={[styles.outerCircle, { borderColor: `${status === 'checked' ? color : 'black'}` }, { backgroundColor: 'white' }]}>
            {
                status == 'checked' && (
                    <View style={[styles.innerCirle, { backgroundColor: color }]}>
                    </View>
                )
            }
        </View>
    )
}

const styles = StyleSheet.create({
    outerCircle: { width: 15, height: 15, borderRadius: 100, justifyContent: 'center', alignItems: 'center', borderWidth: 0.6, },
    innerCirle: { width: 10, height: 10, borderRadius: 100 }
})

export default RadioButton