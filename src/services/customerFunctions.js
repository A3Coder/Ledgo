//Firestore
import firestore from '@react-native-firebase/firestore';
const customersCollection = firestore().collection('customers')
const transactionsCollection = firestore().collection('transactions')

const getAllCustomers = async () => {
    var customers = []
    var customerResponse = await customersCollection.get()
    if (customerResponse.empty) {
        console.log('No Customers Found')
        return customers
    }

    for (const customerDoc of customerResponse.docs) {
        const customerData = customerDoc.data();

        const transactionsSnapshot = await transactionsCollection
            .where('cId', '==', customerData.cId)
            .get();

        const transactions = transactionsSnapshot.docs.map(transactionDoc => {
            return { ...transactionDoc.data(), docId: transactionDoc.ref.id }
        });

        customers.push({
            ...customerData,
            transactions: transactions,
            docId: customerDoc.ref.id
        });
    }

    return customers
}

const getAllCustomersbyPid = async (pId) => {
    try {
        var customers = []
        var customerResponse = await customersCollection.where('pId', '==', pId).get()
        if (customerResponse.empty) {
            return customers
        }

        for (const customerDoc of customerResponse.docs) {
            const customerData = customerDoc.data();

            const transactionsSnapshot = await transactionsCollection
                .where('cId', '==', customerData.cId)
                .orderBy('tId', 'asc')
                .get();

            const transactions = transactionsSnapshot.empty ? [] : transactionsSnapshot.docs.map(transactionDoc => {
                return { ...transactionDoc.data(), docId: transactionDoc.ref.id }
            });

            customers.push({
                ...customerData,
                transactions: transactions,
                docId: customerDoc.ref.id
            });
        }

        return customers
    } catch (error) {
        console.log(error)
    }
}

// const getCustomerbyCid = async (cId) => {
//     try {
//         const customerResponse = await customersCollection.where('cId', '==', cId).get()
//         const transactionResponse = await transactionsCollection.where('cId', '==', cId).orderBy('billedDate', 'asc').get()

//         if (!customerResponse.empty) {
//             var customerData = customerResponse.docs[0].data()
//             var transactionData
//             if (transactionResponse.empty) {
//                 transactionData = []
//                 customerData = { ...customerData, docId: customerResponse.docs[0].ref.id, transactions: transactionData }

//                 return customerData
//             }

//             transactionData = transactionResponse.docs.map((doc) => { return { ...doc.data(), docId: doc.ref.id } })
//             customerData = { ...customerData, docId: customerResponse.docs[0].ref.id, transactions: transactionData }

//             return customerData
//         }

//         return null
//     } catch (error) {
//         console.log(error)
//     }
// }

const getCustomerbyCid = async (cId, options = {}) => {
    const { signal } = options;  // Get the abort signal from options

    try {
        // Before making the request, check if the signal has been aborted
        if (signal && signal.aborted) {
            throw new Error('Fetch aborted');
        }

        // Fetch customer data
        const customerResponse = await customersCollection.where('cId', '==', cId).get();

        // After the first query, check again if the signal was aborted
        if (signal && signal.aborted) {
            throw new Error('Fetch aborted');
        }

        // Fetch transaction data
        const transactionResponse = await transactionsCollection
            .where('cId', '==', cId)
            .orderBy('billedDate', 'asc')
            .get();

        // After the second query, check again if the signal was aborted
        if (signal && signal.aborted) {
            throw new Error('Fetch aborted');
        }

        if (!customerResponse.empty) {
            var customerData = customerResponse.docs[0].data();
            var transactionData;

            if (transactionResponse.empty) {
                transactionData = [];
                customerData = { ...customerData, docId: customerResponse.docs[0].ref.id, transactions: transactionData };
                return customerData;
            }

            transactionData = transactionResponse.docs.map((doc) => {
                return { ...doc.data(), docId: doc.ref.id };
            });
            customerData = { ...customerData, docId: customerResponse.docs[0].ref.id, transactions: transactionData };

            return customerData;
        }

        return null;
    } catch (error) {
        if (error.message === 'Fetch aborted') {
            console.log('Request aborted');
        } else {
            console.log(error);  // Log other errors
        }
        throw error;  // Re-throw the error to handle it outside the function
    }
};


const addCustomer = async (data) => {
    var pId = data.pId
    var newCustomerData = {
        mobile: data.mobile, //Mobile
        customerName: data.customerName, // Customer Name
        photo: data.photo != null ? data.photo : null, //Photo
        address: "",
        smsAlert: false,
        addedOn: data.addedOn //Extra Data
    }

    //Find all the Customers of a Profile
    var customersResponse = await customersCollection.where('pId', '==', pId).orderBy('cId', 'asc').get()

    //If There are no Customers for that Profile
    if (customersResponse.empty) {
        const customerAddResponse = await customersCollection.add({
            ...newCustomerData,
            cId: pId + "-" + "C01",
            pId: pId
        });

    } else {
        //If There are Customers, check whether this new Customer already exists or not
        const isCustomerPresent = await customersCollection.where("mobile", "in", [data.mobile, parseInt(`91${data.mobile}`)]).get()
        if (!isCustomerPresent.empty) {
            return 0
        }
        //If There are Customers, find the Latest one Id
        var customerData = customersResponse.docs
        var lastCustomerId = (customerData[customerData.length - 1].data()).cId
        var newCustomerId = String(parseInt(lastCustomerId.split('-')[1].substring(1)) + 1).length < 2 ? lastCustomerId.split('-')[0] + "-" + "C" + String(parseInt(lastCustomerId.split('-')[1].substring(1)) + 1).padStart(2, 0) : lastCustomerId.split('-')[0] + "-" + "C" + String(parseInt(lastCustomerId.split('-')[1].substring(1)) + 1)

        const customerAddResponse = await customersCollection.add({
            ...newCustomerData,
            cId: newCustomerId,
            pId: pId
        });
    }

    return 1
}

const updateCustomerbydocId = async (docId, data) => {
    try {
        //Data that needs to be updated
        const { photo, customerName, mobile, address, smsAlert } = data

        const updatedResponse = await customersCollection.doc(docId).update({ ...data }) //Whatever Things that are present in data update it

        return updatedResponse
    } catch (error) {
        console.log(error)
        return 0
    }
}

const deleteCustomerbydocId = async (docId, allTransactions = false, cId = '') => {
    const res = await customersCollection.doc(docId).delete();

    if (allTransactions) {
        const transactionResponse = await transactionsCollection.where("cId", '==', cId).get()

        if (transactionResponse.empty) {
            console.log('No Transactions found for This customer')
            return 1
        }

        const transactionData = transactionResponse.docs

        transactionData.forEach((doc) => {
            doc.ref.delete()
        })

    }

    return 1
}

const deleteAllCustomersbyPid = async (pId) => {
    const res = await customersCollection.where("pId", '==', pId).get()
    if (res.empty) {
        return 0
    }

    const allCustomers = res.docs

    allCustomers.forEach((doc) => {
        doc.ref.delete()
    })

    console.log('All Customers Deleted')
    return 1
}

export {
    getAllCustomers,
    getAllCustomersbyPid,
    getCustomerbyCid,
    addCustomer,
    updateCustomerbydocId,
    deleteCustomerbydocId,
    deleteAllCustomersbyPid
}