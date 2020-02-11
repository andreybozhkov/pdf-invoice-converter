const fs = require('fs');
const pdf = require('pdf-parse');
let regexRef = '\\b2020\\d{5}\\b';
let regexProjNum = '\\b204\\d{4}\\b';
//let regexCostType = '\\b[A-Z]{3}\\b';
let regexNum = '\\b\\d{1,6}\\.\\d{2}\\b';
let regexpAll = regexRef + '|' + regexProjNum + '|' + regexNum;
let regexp = new RegExp(regexpAll, 'g')

let dataBuffer = fs.readFileSync('./data/10_v2invoice.pdf');

pdf(dataBuffer).then(function(data) {
    let matches = data.text.match(regexp);
    fs.writeFile('./data/matches.txt', matches, (err) => {
        if (err) throw err;
        console.log('Match file written.');
    });
    
    let lines = [];

    for (let i = 0; i < matches.length; i++) {
        if (new RegExp(regexNum).test(matches[i])) {
            let amount = Number(matches[i]);
            let projectNum = '';
            if (new RegExp(regexProjNum).test(matches[i - 1])) {
                projectNum = matches[i - 1];
            }
            let ref = '';
            if (new RegExp(regexRef).test(matches[i - 2])) {
                ref = matches[i - 2];
            }
            let newLine = new singleLine(projectNum, ref);
            newLine.addAmount(amount);
            console.log(newLine);
        }
    }
});

function singleLine(projNum, ref) {
    this.summedAmount = 0;
    this.projNum = projNum;
    this.supplierRef = ref;
    this.addAmount = (amount) => {
        this.summedAmount += amount;
    };
}