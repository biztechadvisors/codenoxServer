import PDFDocument from 'pdfkit';
// import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

(async () => {
  // Read HTML content from Handlebars file.
  const htmlContent = fs.readFileSync(path.join(__dirname, 'invoiceToCustomer.hbs'), 'utf8');

  // Compile the Handlebars template with the data.
  const template = handlebars.compile(htmlContent);
  const data = {};
  const html = template(data);

  // Create a new PDF document.
  const doc = new PDFDocument();

  // Pipe the PDF into a writable stream.
  doc.pipe(fs.createWriteStream('invoice.pdf'));

  // Add the HTML content to the PDF.
  doc.text(html, {
    align: 'left',
  });

  // Finalize the PDF and end the stream.
  doc.end();

  console.log('PDF Generated successfully!');
})();

// (async () => {
//   // Launch a new browser session.
//   const browser = await puppeteer.launch();

//   // Open a new page.
//   const page = await browser.newPage();

//   // Read HTML content from Handlebars file.
//   const htmlContent = fs.readFileSync(path.join(__dirname, 'invoiceToCustomer.hbs'), 'utf8');

//   // Compile the Handlebars template with the data.
//   const template = handlebars.compile(htmlContent);
//   const data = {
//     // Your data object goes here.
//     customerName: 'John Doe',
//     orderNumber: '12345',
//     items: [
//       { name: 'Product 1', price: '$10.00' },
//       { name: 'Product 2', price: '$20.00' },
//     ],
//     total: '$30.00',
//   };
//   const html = template(data);

//   // Set the HTML content of the page.
//   await page.setContent(html, {
//     waitUntil: 'networkidle0',
//   });

//   // Convert the page to PDF.
//   await page.pdf({
//     path: 'invoice.pdf',
//     format: 'A4',
//     printBackground: true,
//   });

//   // Close the browser session.
//   await browser.close();

//   console.log('PDF Generated successfully!');
// })();
