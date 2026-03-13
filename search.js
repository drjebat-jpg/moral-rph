import https from 'https';
import PDFParser from 'pdf2json';

const url = 'https://www.kabinet.gov.my/storage/2025/10/SS-KPM-Bil.-3-2025-Kalendar-Akademik-2026-1.pdf';

https.get(url, (res) => {
  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    const pdfParser = new PDFParser(this, 1);
    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
    pdfParser.on("pdfParser_dataReady", pdfData => {
        console.log(pdfParser.getRawTextContent());
    });
    pdfParser.parseBuffer(buffer);
  });
}).on('error', (e) => {
  console.error(e);
});
