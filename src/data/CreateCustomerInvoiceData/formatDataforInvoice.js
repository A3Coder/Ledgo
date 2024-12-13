const formatDataforInvoice = (data) => {
    var tempData = []

    for (i = data.length - 1; i > -1; i--) {
        data[i].transactions.forEach((obj2) => {
            if (obj2.status == 'due') {
                var tempObj = {
                    date: data[i].date,
                    amount: obj2.amount,
                    notes: obj2.notes,
                    timing: obj2.timing
                }

                tempData.push(tempObj)
            }
        })
    }

    return tempData
}

export {
    formatDataforInvoice
}