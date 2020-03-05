const fs = require('fs');
const pdf = require('pdf-parse');
const XLSX = require('xlsx');
const readline = require('readline');
let regexRef = '\\b2020\\d{5}\\b';
let regexProjNum = '\\b204\\d{4}\\b';
let regexNum = '\\b\\d{1,6}\\.\\d{2}\\b';
let regexpAll = regexRef + '|' + regexProjNum + '|' + regexNum;
let regexp = new RegExp(regexpAll, 'g')

let dataBuffer = fs.readFileSync('./data/invoice.pdf');

pdf(dataBuffer).then(function(data) {
    let matches = data.text.match(regexp);
    let lines = generateLines(matches);
    readUserInput().then(checkForOtherInvoices => {
        let workbook = generateWorkbook(lines, checkForOtherInvoices);
        writeWorkbook(workbook);
    });
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

function generateWorkbook (data, checkForOtherInvoices) {
    let workbook = XLSX.utils.book_new();
    let newData = [];
    let expenseLinesWorkbook;
    let expenseLines;

    let otherFerryInvoices = false;
    if (checkForOtherInvoices) {
        expenseLinesWorkbook = XLSX.readFile('./data/Expense lines TT DFDS.xlsx', {
            type: 'string'
        });
        expenseLines = XLSX.utils.sheet_to_json(expenseLinesWorkbook.Sheets['Sheet1']);
    };

    data.forEach(l => {
        if (checkForOtherInvoices) {
            otherFerryInvoices = findInExpenseLinesWorkbook(expenseLines, l.projNum);
        };

        let newLine = {
            'Article Code': '304',
            'Article Name': 'Ferry',
            'Quantity': 1,
            'Product Unit': 'Pcs',
            'Unit Price': l.summedAmount,
            'Shipment ID': '',
            'NET SUM': '',
            'Gross Sum': '',
            'Project ID': l.projNum,
            'Shipping Order ID': '',
            'Other ferry invoices?': otherFerryInvoices
        };
        newData.push(newLine);
    });
    let worksheet = XLSX.utils.json_to_sheet(newData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    return workbook;
}

function writeWorkbook (workbook) {
    XLSX.writeFile(workbook, './data/output.xlsx');
}

function readUserInput () {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let userInput = false;

    return new Promise((resolve, reject) => {
        rl.question('Would you like to check if projects have another ferry and you have a relevant excel file in the data directory? Answer only with "yes" or "no". ', (answer) => {
            if (answer === 'yes') {
                userInput = true;
            }
            console.log(`Thanks for saying: ${answer}`);
            resolve(userInput);
            rl.close();
        });
    });
}

function findInExpenseLinesWorkbook (expenseLines, projectNr) {
    let found = false;
    expenseLines.findIndex(l => {
        if (l['Project ID'].toString() === projectNr) {
            found = true;
        }
    });
    return found;
}