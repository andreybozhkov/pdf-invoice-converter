const fs = require('fs');
const pdf = require('pdf-parse');
//let regexp = /(2020\d{5})(.*)(\b\d{1,6}\.\d{2}\b)\n/g;
let regexp = /2020\d{5}/g;

let dataBuffer = fs.readFileSync('./data/invoice.pdf');

// default render callback
function render_page(pageData) {
    //check documents https://mozilla.github.io/pdf.js/
    let render_options = {
        //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
        normalizeWhitespace: false,
        //do not attempt to combine same line TextItem's. The default value is `false`.
        disableCombineTextItems: false
    }
 
    return pageData.getTextContent(render_options)
    .then(function(textContent) {
        let lastY, text = '';
        for (let item of textContent.items) {
            if (lastY == item.transform[5] || !lastY){
                text += item.str;
            }  
            else{
                text += '\n' + item.str;
            }    
            lastY = item.transform[5];
        }
        return text;
    });
}
 
let options = {
    pagerender: render_page
}

pdf(dataBuffer, options).then(function(data) {
    // PDF text
    //console.log(data.text);
    //console.log(data.text.toString());
    //let stringified = data.text.toString();
    //console.log(stringified);
    //console.log(data.text);
    let matches = [...data.text.matchAll(regexp)];
    //console.log(matches);
    //console.log(matches);
    //let matches = getMatches(data.text.toString(), regExp);
    //console.log(matches);
    for (let m of matches) {
        console.log(m[0]);
    }
});