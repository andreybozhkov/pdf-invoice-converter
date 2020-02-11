const fs = require('fs');
const pdf = require('pdf-parse');
//let regexp = /(2020\d{5})|(204\d{4})|(\b\d{1,6}\.\d{2}\b)/g;
let regexp = /2020\d{5}|20\d{5}|\b[A-Z]{3}\b|\b\d{1,6}\.\d{2}\b/g;

let dataBuffer = fs.readFileSync('./data/3_invoice.pdf');

let matches = [];
pdf(dataBuffer).then(function(data) {
    matches = [...data.text.matchAll(regexp)];
    fs.writeFile('./data/matches.txt', matches, (err) => {
        if (err) throw err;
        console.log('Match file written.');
    });
});