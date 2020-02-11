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

            if (lines.length > 0) {
                if (new RegExp(regexRef).test(matches[i - 1]) === false) {
                    if (new RegExp(regexNum).test(matches[i - 1])) {
                        // add current amount to last item in lines array
                        lines[lines.length - 1].addAmount(amount);
                    } else if (new RegExp(regexProjNum).test(matches[i - 1])) {
                        // push new line to the array with project reference
                        lines.push(addNewLine(amount, i, matches));
                    }
                } else {
                    // push new line to the array without project reference
                    lines.push(addNewLine(amount, i, matches));
                }
            } else {
                // add first line to the array
                lines.push(addNewLine(amount, i, matches));
            }
        }
    }

    console.log(lines);
});

function singleLine(projNum, ref) {
    this.summedAmount = 0;
    this.projNum = projNum;
    this.supplierRef = ref;
    this.addAmount = (amount) => {
        this.summedAmount += amount;
    };
}

function addNewLine(amount, index, array) {
    // add a new line
    let projectNum = '';
    if (new RegExp(regexProjNum).test(array[index - 1])) {
        projectNum = array[index - 1];
    }
    let ref = '';
    if (new RegExp(regexRef).test(array[index - 2])) {
        ref = array[index - 2];
    }
    let newLine = new singleLine(projectNum, ref);

    // add the amount to the new line
    newLine.addAmount(amount);

    return newLine;
}