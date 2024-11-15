export const formatDataforCustomerStatements = (data = []) => {
    if (data.length == 0) {
        return
    }
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    //Find Customer ID in Main DATA
    var formattedData = []

    data.transactions.forEach((obj) => {
        tempObj = {}
        var month = MONTHS[parseInt(obj.billedDate.split('/')[1]) - 1]
        tempObj.billedDate = obj.billedDate
        tempObj.date = obj.billedDate.split('/')[0]
        tempObj.month = month
        tempObj.amount = obj.amount
        tempObj.status = obj.status
        tempObj.timing = obj.addedTime
        tempObj.tId = obj.tId

        formattedData.push(tempObj)
    })

    formattedData.sort((item1, item2) => {
        if (item1.billedDate < item2.billedDate) {
            return 1
        } else if (item1.billedDate > item2.billedDate) {
            return -1
        } else if (item1.billedDate == item2.billedDate) {
            if (item1.tId < item2.tId) {
                return 1
            } else if (item1.tId > item2.tId) {
                return -1
            } else {
                return 0
            }
        }
    })

    return formattedData
}
