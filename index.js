const fs = require('fs');
const pdf = require('pdf-parse');
let regexRef = '\\b2020\\d{5}\\b';
let regexProjNum = '\\b204\\d{4}\\b';
let regexNum = '\\b\\d{1,6}\\.\\d{2}\\b';
let regexpAll = regexRef + '|' + regexProjNum + '|' + regexNum;
let regexp = new RegExp(regexpAll, 'g')

let dataBuffer = fs.readFileSync('./data/invoice.pdf');

pdf(dataBuffer).then(function(data) {
    let matches = data.text.match(regexp);
    let lines = generateLines(matches);
    console.log(sumLines(lines));
});

function singleLine (projNum, ref) {
    this.summedAmount = 0;
    this.projNum = projNum;
    this.supplierRef = ref;
    this.addAmount = (amount) => {
        this.summedAmount += amount;
    };
}

function generateLines (arrayOfMatches) {
    let lines = [];
    for (let i = 0; i < arrayOfMatches.length - 1; i++) {
        if (new RegExp(regexNum).test(arrayOfMatches[i])) {
            let amount = Number(arrayOfMatches[i]);

            if (lines.length === 0) {
                // add first line to the array
                lines.push(addNewLine(amount, i, arrayOfMatches));
            } else {
                if (new RegExp(regexRef).test(arrayOfMatches[i - 1])) {
                    // push new line to the array without project reference
                    lines.push(addNewLine(amount, i, arrayOfMatches));
                } else if (new RegExp(regexProjNum).test(arrayOfMatches[i - 1])) {
                    if (new RegExp(regexRef).test(arrayOfMatches[i - 2])) {
                        // push new line to the array with project reference
                        lines.push(addNewLine(amount, i, arrayOfMatches));
                    } else if (new RegExp(regexNum).test(arrayOfMatches[i - 2])) {
                        // add current amount to last item in lines array
                        lines[lines.length - 1].addAmount(amount);
                    }
                } else if (new RegExp(regexNum).test(arrayOfMatches[i - 1])) {
                    // add current amount to last item in lines array
                    lines[lines.length - 1].addAmount(amount);
                }
            }
        }
    }
    return lines;
}

function addNewLine (amount, index, array) {
    // add a new line
    let projectNum = '';
    if (new RegExp(regexProjNum).test(array[index - 1])) {
        projectNum = array[index - 1];
    }
    let ref = '';
    if (new RegExp(regexRef).test(array[index - 2])) {
        ref = array[index - 2];
    } else if (new RegExp(regexRef).test(array[index - 1])) {
        ref = array[index - 1];
    }
    let newLine = new singleLine(projectNum, ref);

    // add the amount to the new line
    newLine.addAmount(amount);

    return newLine;
}

function sumLines (linesArray) {
    let sum = 0;
    linesArray.forEach(l => {
        sum += l.summedAmount;
    });
    return sum;
}