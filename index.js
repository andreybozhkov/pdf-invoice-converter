const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('./data/invoice.pdf');
 
pdf(dataBuffer).then(function(data) {
    // PDF text
    console.log(data.text);
});