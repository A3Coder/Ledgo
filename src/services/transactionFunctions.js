//Firestore
import firestore from '@react-native-firebase/firestore';
const customersCollection = firestore().collection('customers')
const transactionsCollection = firestore().collection('transactions')

const addNewTransaction = async (data) => {
    var newTransaction = {
        // tId: data.tId,
        cId: data.cId,
        amount: data.amount,
        status: data.status,
        photo: data.photo,
        notes: data.notes,
        smsDelivered: data.smsDelivered,
        addedDate: data.addedDate,
        addedTime: data.addedTime,
        deletedDate: null,
        deletedTime: null,
        editedDate: null,
        editedTime: null,
        previousAmount: 0,
        billedDate: data.billedDate,
        state: 'active'
    }

    //Get Only last Transactions
    var transactionResponse = await transactionsCollection.orderBy('tId', 'asc').limitToLast(1).get()

    if (transactionResponse.empty) { //If No Transactions
        const transactionAddResponse = await transactionsCollection.add({
            ...newTransaction,
            tId: 'T01',
        });

        // console.log('Added Transaction with ID: ', transactionAddResponse.id);
        return transactionAddResponse.id
    } else { //If there are Transactions
        const transactionData = transactionResponse.docs
        var lastTransactionId = (transactionData[0].data()).tId
        var newTransactionId = String(parseInt(lastTransactionId.substring(1)) + 1).length < 2 ? "T" + String(parseInt(lastTransactionId.substring(1)) + 1).padStart(2, 0) : "T" + String(parseInt(lastTransactionId.substring(1)) + 1)

        const transactionAddResponse = await transactionsCollection.add({
            ...newTransaction,
            tId: newTransactionId,
        });

        // console.log('Added Transaction with ID: ', transactionAddResponse.id);
        return transactionAddResponse.id
    }
}

const getTransactionbyDocId = async (docId) => {
    try {
        const transactionResponse = await transactionsCollection.doc(docId).get()

        if (!transactionResponse.exists) {
            return null
        }

        const transactionDetails = transactionResponse.data()

        return transactionDetails
    } catch (error) {
        console.log(error)
    }
}

const updateTransactionbyDocId = async (docId, data) => {
    try {
        //Data that needs to be updated
        const { amount, photo, notes } = data

        var newData = { ...data }
        if (amount != undefined) {
            //Update Something Extra
            newData.editedDate = data.editedDate
            newData.editedTime = data.editedTime
            newData.state = 'edited'
            newData.previousAmount = data.previousAmount //Must be Integer
        }
        const updatedResponse = await transactionsCollection.doc(docId).update({ ...newData }) //Whatever Things that are present in data update it

        return updatedResponse
    } catch (error) {
        console.log(error)
        return 0
    }
}

export {
    addNewTransaction,
    getTransactionbyDocId,
    updateTransactionbyDocId
}