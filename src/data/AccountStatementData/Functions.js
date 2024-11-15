export const formatData = (data = []) => {
    if (data.length == 0) {
        return
    }
    var formattedData = []
    data.forEach((obj1) => {
        var tempObj = {}
        obj1.transactions.forEach((obj2) => {
            tempObj = { ...obj2 }
            tempObj.date = obj2.billedDate,
                tempObj.tId = obj2.tId,
                tempObj.cId = obj2.cId,
                tempObj.amount = obj2.amount,
                tempObj.time = obj2.addedTime,
                tempObj.transactionType = obj2.status,
                tempObj.customerDetails = { ...obj1 }

            formattedData.push(tempObj)
        })
    })

    //Now sort the data based on date in Descending Order
    formattedData.sort((obj1, obj2) => {
        var day1 = obj1.date.split('/')[0]
        var day2 = obj2.date.split('/')[0]

        var month1 = obj1.date.split('/')[1]
        var month2 = obj2.date.split('/')[1]

        var year1 = obj1.date.split('/')[2]
        var year2 = obj2.date.split('/')[2]

        var date1 = new Date(`${year1}-${month1 + 1}-${day1}`)
        var date2 = new Date(`${year2}-${month2 + 1}-${day2}`)


        if (date1 < date2) {
            return 1
        } else if (date1 > date2) {
            return -1
        } else {
            if (obj1.tId < obj2.tId) {
                return 1
            } else if (obj1.tId > obj2.tId) {
                return -1
            } else {
                return 0
            }
        }
    })

    return formattedData
}
