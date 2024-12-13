//Importing Styles
import { STYLE } from "./InvoiceTemplateCONSTANTS"

const generateTemplateForInvoiceFromTransactions = (data) => {
    const total = data.totalAmount
    const transactions = data.transactions.map((obj, index) => {
        return `
            <li>
                <p class="sl">${index + 1}</p>
                <p class="description">${obj.notes}</h4>
                <p class="qty">1</p>
                <p class="fee">${obj.amount}</p>
                <p class="amount">${obj.amount}</p>
            </li>
`
    }).join('')

    const INVOICEHTMLCONTENT = `
<html lang="en">
<head>
${STYLE}
</head>
<body>
    <div class="topContainer" style="padding-inline: 30px; padding-top: 25px;">
        <div class="col1">
            <h4>INVOICE</h4>
           <!--  <img src=${""}/> -->
            <h2>FINERA</h2>
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
            ${transactions}
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
                    <p>${total}.00</p>
                </div>
                <div>
                    <p>SGST</p>
                    <p>0.00</p>
                </div>
                <div>
                    <p>CGST</p>
                    <p>0.00</p>
                </div>
                <div class="total">
                    <p>TOTAL</p>
                    <p>${total}.00</p>
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

    return INVOICEHTMLCONTENT
}

export {
    generateTemplateForInvoiceFromTransactions
}