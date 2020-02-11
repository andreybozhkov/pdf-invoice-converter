const fs = require('fs');
const pdf = require('pdf-parse');
//let regexp = /(2020\d{5})|(204\d{4})|(\b\d{1,6}\.\d{2}\b)/g;
let regexRef = '\\b2020\\d{5}\\b';
let regexProjNum = '\\b204\\d{4}\\b';
let regexCostType = '\\b[A-Z]{3}\\b';
let regexNum = '\\b\\d{1,6}\\.\\d{2}\\b';
let regexpAll = regexRef + '|' + regexProjNum + '|' + regexCostType + '|' + regexNum;
let regexp = new RegExp(regexpAll, 'g')

let dataBuffer = fs.readFileSync('./data/3_invoice.pdf');

pdf(dataBuffer).then(function(data) {
    let matches = data.text.match(regexp);
    fs.writeFile('./data/matches.txt', matches, (err) => {
        if (err) throw err;
        console.log('Match file written.');
    });
});