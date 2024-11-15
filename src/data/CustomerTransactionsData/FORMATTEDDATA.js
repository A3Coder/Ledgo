export const formattedData = (data) => {
    const organizedData = []

    //First set up the Inside OBJ
    data.transactions.forEach((obj) => {
        var getIdx = organizedData.findIndex((obj2) => { return obj2.date === obj.billedDate })
        if (organizedData.length != 0 && getIdx >= 0) {
            organizedData[getIdx].transactions = []
        } else {
            var tempObj = {}
            tempObj.date = obj.billedDate
            tempObj.transactions = []
            organizedData.push(tempObj)
        }
    })

    // first sort the data based on TId - in order to based on Timing
    data.transactions.sort((t1, t2) => {
        if (t1.tId.toLowerCase() < t2.tId.toLowerCase()) {
            return -1
        } else if (t1.tId.toLowerCase() > t2.tId.toLowerCase()) {
            return 1
        } else {
            return 1
        }
    })

    //Set up the Data
    var totalAmount = 0
    var txnIndex = -1
    var prevDateIdx = 0
    data.transactions.forEach((obj) => {
        var getIdx = organizedData.findIndex((obj2) => { return obj2.date === obj.billedDate })
        if(getIdx != prevDateIdx){
            txnIndex = 0
            prevDateIdx = getIdx
        } else {
            txnIndex = txnIndex + 1
        }
        var tempObj = {
            tId: obj.tId,
            cId: obj.cId,
            amount: obj.amount,
            status: obj.status,
            timing: obj.addedTime,
            notes: obj.notes != undefined ? obj.notes : '',
            customerName: data.customerName,
            ...obj,

            //For Query Purpose
            indexes: {
                dateIndex: getIdx,
                transactionIndex: txnIndex
            }
        }
        if (obj.status === 'due') {
            totalAmount = totalAmount - obj.amount
        } else {
            totalAmount = parseInt(totalAmount) + parseInt(obj.amount)
        }
        tempObj = { ...tempObj, totalAmount: totalAmount }
        organizedData[getIdx].transactions.push(tempObj)
    })

    return organizedData
}