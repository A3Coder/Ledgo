export const DUMMYDATA = [
    {
        cId: 'C01',
        pId: 'P01',
        mobile: '9330852282',
        customerName: 'Mota Bhaiya',
        photo: null,
        address: null,
        smsAlert: true,
        //Other Informations
        transactions: [
            {
                tId: 'T01',
                cId: 'C01',
                amount: 200,
                status: 'due',
                photo: '',
                notes: 'Testing C01 T01 Notes 1',
                smsDelivered: false,
                addedDate: '05/09/2024',
                addedTiming: '12:00 PM',
                deletedDate: null,
                deletedTime: null,
                editedDate: null,
                editedTime: null,
                previousAmount: 0,
                billedDate: '05/09/2024',
                state: 'active'
            },
            {
                tId: 'T02',
                cId: 'C01',
                amount: 400,
                status: 'due',
                photo: '',
                notes: 'Testing C01 T02 Notes 2',
                smsDelivered: false,
                addedDate: '07/09/2024',
                addedTiming: '12:00 PM',
                deletedDate: null,
                deletedTime: null,
                editedDate: null,
                editedTime: null,
                previousAmount: 0,
                billedDate: '06/09/2024',
                state: 'active'
            },
        ]
    },
]

export const formattedData = (data = []) => {
    var formattedData = []

    data.forEach((obj1) => {
        var temp = { customerName: obj1.customerName, cId: obj1.cId, mobile: obj1.mobile, photo: obj1.photo, }
        var totalAmount = 0
        if (obj1.transactions.length == 0) { //If there are no Transactions
            temp = { ...temp, addedOn: obj1.addedOn, date: obj1.addedOn }
        } else {
            obj1.transactions.forEach((obj2, idx) => {
                if (obj2.status === 'due') {
                    totalAmount = totalAmount - obj2.amount
                } else {
                    totalAmount = totalAmount + parseInt(obj2.amount)
                }
                temp = { ...temp, tId: obj2.tId, date: obj2.addedDate, amount: obj2.amount, status: obj2.status }
            })
        }
        temp = { ...temp, totalAmount: totalAmount }
        formattedData.push(temp)
    })

    return formattedData
}

export const totalNumberofAccount = (data = []) => {

    return data.length
}

export const calculateTotalAmount = (data = []) => {
    var totalAmount = 0

    if (data.length > 0) {
        data.forEach((obj) => {
            obj.transactions.forEach((obj2) => {
                if (obj2.status === 'due') {
                    totalAmount = totalAmount - obj2.amount
                } else {
                    totalAmount = totalAmount + parseInt(obj2.amount)
                }
            })
        })
    }

    return totalAmount
}

export const sortByLatest = (data = []) => {
    var tempData = data
    if (tempData.length > 0) {
        tempData.sort((obj1, obj2) => {
            var day1 = obj1.date.split('/')[0]
            var day2 = obj2.date.split('/')[0]

            var month1 = obj1.date.split('/')[1]
            var month2 = obj2.date.split('/')[1]

            var year1 = obj1.date.split('/')[2]
            var year2 = obj2.date.split('/')[2]

            var date1 = new Date(`${year1}-${month1 + 1}-${day1}`)
            var date2 = new Date(`${year2}-${month2 + 1}-${day2}`)

            // if (obj1.tId == undefined || obj2.tId == undefined) {
            //     if (date1 < date2) {
            //         return 1
            //     } else if (date1 > date2) {
            //         return -1
            //     } else {
            //         if (obj1.cId < obj2.cId) {
            //             return 1
            //         } else if (obj1.cId > obj2.cId) {
            //             return -1
            //         } else {
            //             return 0
            //         }
            //     }
            // }

            if (obj1.tId < obj2.tId) {
                return 1
            } else if (obj1.tId > obj2.tId) {
                return -1
            } else {
                if (obj1.cId < obj2.cId) {
                    return 1
                } else if (obj1.cId > obj2.cId) {
                    return -1
                } else {
                    return 0
                }
            }
        })
    }

    return tempData
}
