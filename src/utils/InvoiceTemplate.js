import { LOGO3 } from "../../assets/images/Images"
const INVOICEHTMLCONTENT = `
<html lang="en">

<head>
<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    max-width: 800px;
    font-family: monospace;
}

.topContainer {
    width: 100%;
    background-color: #252525;
    padding: 25px 30px 0px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.topContainer div.col1,
.topContainer div.col2 {
    width: 48%;
    height: 100%;
}

.topContainer div.col1 {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    line-height: 70px;
}

.topContainer div.col1 img {
    width: 60px;
}

.topContainer div.col1 h4 {
    font-size: 40px;
    color: white;
}

.topContainer div.col1 h2 {
    font-size: 30px;
    color: white;
}

.topContainer div.col2 {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
}

.topContainer div.col2 .content1 {
    margin-bottom: 20px;
}

.topContainer div.col2 .content1,
.topContainer div.col2 .content2 {
    width: 100%;
    height: 48%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    line-height: 20px
}

.topContainer div.col2 .content1 h3 {
    color: white;
    text-align: right;
    font-size: 20px;
}

.topContainer div.col2 .content1 p {
    color: white;
    text-align: right;
    font-size: 15px;
}

.topContainer div.col2 .content2 h3 {
    color: white;
    text-align: right;
    font-size: 15px;
}

.topContainer div.col2 .content2 p {
    color: white;
    text-align: right;
    font-size: 12px;
}

.middleContainer {
    width: 100%;
    padding: 20px 40px 20px 40px;
    border-bottom: 2px solid black;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.middleContainer div.col1,
.middleContainer div.col2 {
    width: 48%;
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 20px;
}

.middleContainer div.col1 h4 {
    width: 100%;
    color: black;
    font-weight: 700;
    font-size: 13px;
    text-align: left;
}

.middleContainer div.col1 p {
    width: 100%;
    color: black;
    font-weight: 300;
    font-size: 11px;
    text-align: left;
}

.middleContainer div.col2 h4 {
    width: 100%;
    color: black;
    font-weight: 700;
    font-size: 13px;
    text-align: right;
}

.middleContainer div.col2 h3 {
    width: 100%;
    color: black;
    font-weight: 700;
    font-size: 17px;
    text-align: right;
}

.middleContainer div.col2 p {
    width: 100%;
    color: black;
    font-weight: 300;
    font-size: 11px;
    text-align: right;
}

.tableContainer {
    width: 100%;
    padding: 10px 40px 10px 40px;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}

.tableContainer div.headings {
    width: 100%;
    padding: 10px 0px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid black;
}

.tableContainer div.headings h4 {
    width: 15%;
    color: black;
    font-size: 13px;
    font-weight: bolder;
    text-align: center;
}

.tableContainer div.headings h4.description {
    width: 45%;
    text-align: left;
}

.tableContainer div.headings h4.sl {
    width: 10%;
    text-align: left;
}

.tableContainer ul.tableContent {
    width: 100%;
    list-style: none;
}

.tableContainer ul.tableContent li {
    width: 100%;
    list-style: none;
    padding: 10px 0px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid black;
}

.tableContainer ul.tableContent p {
    width: 15%;
    color: black;
    font-size: 13px;
    font-weight: 300;
    text-align: center;
}

.tableContainer ul.tableContent p.description {
    width: 45%;
    text-align: left;
}

.tableContainer ul.tableContent p.sl {
    width: 10%;
    text-align: left;
}

div.totalContainer{
    width: 100%;
    height: 350px;
    padding: 20px 40px 20px 40px;

    display: flex;
    justify-content: space-between;
    align-items: center;
}

div.totalContainer div.col1,
div.totalContainer div.col2{
    width: 50%;
    height: 100%;
}

div.totalContainer div.col1{
    width: 100%;
    padding-right: 20px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
}

div.totalContainer div.col1 h4{
    width: 100%;
    font-size: 15px;
    font-weight: bolder;
    margin-bottom: 10px;
}

div.totalContainer div.col1 ol{
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
}

div.totalContainer div.col1 ol li{
    width: 100%;
    font-size: 12px;
    font-weight: 400;
    margin-bottom: 8px;
}

div.totalContainer div.col2{
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}

div.totalContainer div.col2 div.row1{
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    line-height: 22px;
}

div.totalContainer div.col2 div.row1 div{
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

div.totalContainer div.col2 div.row1 div p{
    width: 50%;
    text-align: left;
    font-size: 13px;
    color: black;
}
div.totalContainer div.col2 div.row1 div.total{
    margin-top: 10px;
    border-top: 2px solid black;
    border-bottom: 2px solid black;
    padding: 7px 0px;
}

div.totalContainer div.col2 div.row1 div.total p{
    width: 50%;
    text-align: left;
    font-weight: bolder;
    font-size: 13px;
    color: black;
}

div.totalContainer div.col2 div.row2{
    width: 100%;
    padding-block: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    line-height: 30px;
}

div.totalContainer div.col2 div.row2 p{
    width: 100%;
    text-align: center;
    font-size: 13px;
    color: black;
}

div.totalContainer div.col2 div.row2 h4{
    width: 100%;
    text-align: center;
    font-size: 15px;
    font-weight: bolder;
    color: black;
}

.bottomContainer {
    width: 100%;
    padding: 10px 40px 10px 40px;
    background-color: #252525;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.bottomContainer .col1{
    width: 70%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    line-height: 25px;
}

.bottomContainer .col1 h4{
    width: 100%;
    text-align: left;
    font-size: 18px;
    font-weight: bolder;
    color: white;
}

.bottomContainer .col1 h4.ourBanker{
    font-size: 15px;
    text-decoration: underline;
}

.bottomContainer .col1 p{
    width: 100%;
    text-align: left;
    font-size: 13px;
    font-weight: 300;
    color: white;
}
</style>
</head>

<body>
    <div class="topContainer" style="padding-inline: 30px; padding-top: 25px;">
        <div class="col1">
            <h4>INVOICE</h4>
            <!-- <h2>FINERA</h2> -->
            <img src=${"https://www.finera.net.in/static/media/FInEra_LOGO.da3f3d3bbe7b40d7ac51.png"}/>
        </div>
        <div class="col2">
            <div class="content1">
                <h3>RAZA and Associates</h3>
                <p>Address</p>
                <p>phone</p>
                <p>mobile</p>
            </div>
            <div class="content2">
                <p>Email</p>
                <p>Email 2</p>
                <h3>Our Pan</h3>
                <h3>Our GST</h3>
            </div>
        </div>
    </div>

    <!-- middleSection -->
    <div class="middleContainer">
        <div class="col1">
            <h4>Invoice Details</h4>
            <p>Invoice Number</p>
            <p>Invoice Date</p>
        </div>
        <div class="col2">
            <h4>Billed To:</h4>
            <h3>Customer Name</h3>
            <p>address</p>
        </div>
    </div>

    <!-- Table Section -->
    <div class="tableContainer">
        <div class="headings">
            <h4 class="sl">SL. NO.</h4>
            <h4 class="description">DESCRIPTION</h4>
            <h4 class="qty">QTY</h4>
            <h4 class="fee">FEE</h4>
            <h4 class="amoun">AMOUNT</h4>
        </div>
        <ul class="tableContent">
            <li>
                <p class="sl">1</p>
                <p class="description">ITR Filling Professional Fee of Assesment year 24-25</h4>
                <p class="qty">1</p>
                <p class="fee">1500</p>
                <p class="amoun">1500</p>
            </li>
            <li>
                <p class="sl">1</p>
                <p class="description">ITR Filling Professional Fee of Assesment year 24-25</h4>
                <p class="qty">1</p>
                <p class="fee">1500</p>
                <p class="amoun">1500</p>
            </li>
            <li>
                <p class="sl">1</p>
                <p class="description">ITR Filling Professional Fee of Assesment year 24-25</h4>
                <p class="qty">1</p>
                <p class="fee">1500</p>
                <p class="amoun">1500</p>
            </li>
        </ul>
    </div>

    <!-- Terms, Conditions and Total Section -->
    <div class="totalContainer">
        <div class="col1">
            <h4>TERMS & CONDITIONS</h4>
            <ol>
                <li>Correction / Queries in the Bill must be brought to our notice Within 2 Days from the day of
                    received of the the bill no. correction will be done thereafter.</li>
                <li>Please Issue T.D.S. Certificate to our redg. Office only</li>
                <li>All disputes are subject kolkata jurisdiction only</li>
                <li>Late payment are subject to Late fee charge @2% per month</li>
                <li>Payment Terms 3days from invoice date.</li>
            </ol>
        </div>
        <div class="col2">
            <div class="row1">
                <div>
                    <p>Subtotal</p>
                    <p>6400.00</p>
                </div>
                <div>
                    <p>Subtotal</p>
                    <p>6400.00</p>
                </div>
                <div>
                    <p>Subtotal</p>
                    <p>6400.00</p>
                </div>
                <div class="total">
                    <p>TOTAL</p>
                    <p>64000.00</p>
                </div>
            </div>
            <div class="row2">
                <p>E. &. O. E</p>
                <h4>For, RAZA & ASSOCIATES</h4>
                <div class="signatureContainer"></div>
                <p>Signature of Billing Executive</p>
            </div>
        </div>
    </div>

    <!-- Bottom Section -->
     <div class="bottomContainer">
        <div class="col1">
            <h4 class="ourBanker">OUR BANKER</h4>
            <h4>STATE BANK OF INDIA</h4>
            <p>Raza & Associates A/C : ajfkadfkdj</p>
            <p>IFSC CODE : SBIN0014517</p>
        </div>
     </div>
</body>
</html>
`

const INVOICEHTMLCONTENT2 = `
<html>

<head>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            max-width: 750px;
            font-family: monospace;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        .topContainer {
            background-color: #252525;
            color: white;
            padding: 25px 30px;
        }

        .topContainer h4,
        .topContainer h2 {
            margin: 0;
        }
            
        .topContainer h4,
        .topContainer h2, .topContainer h3, .topContainer p {
            color: white
        }

        .middleContainer {
            width: 100%;
            padding: 20px 40px;
            border-bottom: 2px solid black;
        }

        .tableContainer {
            width: 100%;
            padding: 10px 40px;
        }

        .tableContainer table th,
        .tableContainer table td {
            border-bottom: 1px solid black;
            text-align: left;
            padding: 8px;
        }

        .tableContainer table th {
            font-weight: bold;
            font-size: 13px;
        }

        .tableContainer table td {
            font-size: 13px;
        }

        .totalContainer {
            width: 100%;
            padding: 20px 40px;
        }

        .terms {
            font-size: 12px;
            margin-bottom: 20px;
        }

        .terms li {
            margin-bottom: 5px;
        }

        .bottomContainer {
            background-color: #252525;
            color: white;
            padding: 10px 40px;
            font-size: 13px;
        }
        .bottomContainer h4, .bottomContainer p{
            color: white
        }
    </style>
</head>

<body>
    <!-- Top Section -->
    <div class="topContainer">
        <table>
            <tr>
                <td>
                    <h4>INVOICE</h4>
                    <h2>FINERA</h2>
                </td>
                <td align="right">
                    <h3>RAZA and Associates</h3>
                    <p>Address</p>
                    <p>Phone</p>
                    <p>Mobile</p>
                    <div style="margin-top: 10px;">
                        <p>Email</p>
                        <h3>Our Pan</h3>
                        <h3>Our GST</h3>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Middle Section -->
    <div class="middleContainer">
        <table>
            <tr>
                <td>
                    <h4>Invoice Details</h4>
                    <p>Invoice Number</p>
                    <p>Invoice Date</p>
                </td>
                <td align="right">
                    <h4>Billed To:</h4>
                    <h3>Customer Name</h3>
                    <p>Address</p>
                </td>
            </tr>
        </table>
    </div>

    <!-- Table Section -->
    <div class="tableContainer">
        <table>
            <thead>
                <tr>
                    <th>SL. NO.</th>
                    <th>DESCRIPTION</th>
                    <th>QTY</th>
                    <th>FEE</th>
                    <th>AMOUNT</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>ITR Filing Professional Fee of Assessment Year 24-25</td>
                    <td>1</td>
                    <td>1500</td>
                    <td>1500</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Another Service</td>
                    <td>2</td>
                    <td>2000</td>
                    <td>4000</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Total Section -->
    <div class="totalContainer">
        <table>
            <tr>
                <td class="terms" valign="top">
                    <h4>TERMS & CONDITIONS</h4>
                    <ol>
                        <li>Correction/queries in the bill must be brought to our notice within 2 days.</li>
                        <li>Please issue T.D.S. Certificate to our registered office only.</li>
                        <li>All disputes are subject to Kolkata jurisdiction.</li>
                        <li>Late payments are subject to a late fee of 2% per month.</li>
                        <li>Payment terms: 3 days from invoice date.</li>
                    </ol>
                </td>
                <td valign="top" align="right">
                    <p>Subtotal: 6400.00</p>
                    <p>Tax: 500.00</p>
                    <p>Total: <strong>6900.00</strong></p>
                    <div style="margin-top: 10px; width: 100%; text-align: center; line-height: 20px;">
                        <p>E. &. O. E</p>
                        <h4>For, RAZA & ASSOCIATES</h4>
                        <div class="signatureContainer"></div>
                        <p>Signature of Billing Executive</p>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Bottom Section -->
    <div class="bottomContainer">
        <table>
            <tr>
                <td>
                    <!-- <h4>RAZA and Associates</h4>
                    <p>Thank you for your business!</p> -->
                    <h4 class="ourBanker">OUR BANKER</h4>
                    <h4>STATE BANK OF INDIA</h4>
                    <p>Raza & Associates A/C : ajfkadfkdj</p>
                    <p>IFSC CODE : SBIN0014517</p>
                </td>
            </tr>
        </table>
    </div>
</body>

</html>
`

const generateHTMLContent = (data) => {
    const transactions = data.map((obj, index) => {
        return `
                        <tr>
                    <td>${index + 1}</td>
                    <td>${obj.notes}</td>
                    <td>1</td>
                    <td>${obj.amount}</td>
                    <td>${obj.amount}</td>
                </tr>`
    })

    return INVOICEHTMLCONTENT
}

export {
    INVOICEHTMLCONTENT,
    INVOICEHTMLCONTENT2,
    generateHTMLContent
}