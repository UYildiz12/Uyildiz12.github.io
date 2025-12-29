const fs = require('fs');
const pdfParse = require('pdf-parse');

console.log(typeof pdfParse);
console.log(pdfParse);

const pdfFiles = [
  'HRI_Embodiement_Anonymized .pdf',
  'HRI_Transparency_Anonymized_Final .pdf'
];

pdfFiles.forEach(file => {
  const dataBuffer = fs.readFileSync(file);
  pdfParse(dataBuffer).then(function(data) {
    const textFile = file.replace('.pdf', '.txt');
    fs.writeFileSync(textFile, data.text);
    console.log(`Converted ${file} to ${textFile}`);
  }).catch(err => {
    console.error(`Error converting ${file}:`, err);
  });
});