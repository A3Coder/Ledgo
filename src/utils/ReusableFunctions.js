//Get First Letters of Names
const firstLetters = (name) => {
    const words = name.split(" ")[0]
    return String(words).substring(0, 1).toUpperCase()
}

//Random Colors
function getRandomHexColor(firstLetter = "A") {
    const alphabetColors = [
        "#A569BD", // A - Amethyst
        "#5DADE2", // B - Light Blue
        "#48C9B0", // C - Turquoise
        "#F4D03F", // D - Golden Yellow
        "#F5B041", // E - Orange
        "#DC7633", // F - Burnt Orange
        "#58D68D", // G - Light Green
        "#AF7AC5", // H - Lavender
        "#85C1E9", // I - Sky Blue
        "#F1948A", // J - Light Coral
        "#7FB3D5", // K - Steel Blue
        "#F7DC6F", // L - Light Gold
        "#F8C471", // M - Peach
        "#82E0AA", // N - Mint Green
        "#D98880", // O - Light Salmon
        "#F0B27A", // P - Sandy Brown
        "#BB8FCE", // Q - Soft Purple
        "#85C1B9", // R - Soft Teal
        "#F7C6A0", // S - Pale Peach
        "#AED6F1", // T - Light Blue
        "#73C6B6", // U - Aqua
        "#D2B4DE", // V - Pale Violet
        "#F5CBA7", // W - Wheat
        "#7DCEA0", // X - Light Green
        "#F9E79F", // Y - Light Yellow
        "#C39BD3"  // Z - Soft Lavender
    ];

    // let randomColor;

    // do {
    //     // Generate a random color
    //     randomColor = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    // } while (randomColor === '000000' || randomColor === 'ffffff');

    return `${alphabetColors[(firstLetter.toUpperCase().charCodeAt(0)) - 65]}`;
}

//Validation Function
function validationFunction(id, text) {
    switch (id) {
        case 'email':
            const emailRegex = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
            return emailRegex.test(text)
        case 'mobileNumber':
            if (text.length < 10) {
                return false
            } else {
                return true
            }
        default:
            return false
    }
}


//Formating Time in 12 Hour Format
function timeFormat(date) { //only date constructors should be passed as an argument
    var hours = date.getHours()
    var minutes = date.getMinutes()

    minutes = String(minutes).length == 1 ? String(minutes).padStart(2, 0) : String(minutes)

    if (hours >= 12) {
        if (hours == 12) {
            return `${12}:${minutes} PM`
        }
        return `${hours - 12}:${minutes} PM`
    } else if (hours < 12) {
        if (hours == 0) {
            return `12:${minutes} AM`
        } else {
            return `${hours}:${minutes} AM`
        }
    }
}

//Formating Date in [`nth Date` `Short Month Name`, `Full Year`] format
function dateFormat(date) { // only dd/mm/yyyy date should be passed as an argument
    const MONTHLABELS = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]

    const day = date.split('/')[0]
    const month = MONTHLABELS[parseInt(date.split('/')[1]) - 1]
    const year = date.split('/')[2]

    return `${day} ${month}, ${year}`
}

export {
    firstLetters,
    getRandomHexColor,
    validationFunction,
    timeFormat,
    dateFormat
}