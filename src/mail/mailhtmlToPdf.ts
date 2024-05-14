// import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

(async () => {
  // Launch a new browser session.
  // const browser = await puppeteer.launch();

  // Open a new page.
  // const page = await browser.newPage();

  // Read HTML content from Handlebars file.
  const htmlContent = fs.readFileSync(path.join(__dirname, 'invoiceToCustomer.hbs'), 'utf8');

  // Compile the Handlebars template with the data.
  const template = handlebars.compile(htmlContent);
  const data = {}; // Your data object goes here.
  const html = template(data);

  // Set the HTML content of the page.
  // await page.setContent(html, {
  //   waitUntil: 'networkidle0',
  // });

  // Convert the page to PDF.
  // await page.pdf({
  //   path: 'invoice.pdf',
  //   format: 'A4',
  //   printBackground: true,
  // });

  // Close the browser session.
  // await browser.close();

  console.log('PDF Generated successfully!');
})();
