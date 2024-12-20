const STYLE = `
<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    max-width: 820px;
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
`

export {
    STYLE
}