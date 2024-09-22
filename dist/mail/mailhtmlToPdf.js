"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
(async () => {
    const htmlContent = fs_1.default.readFileSync(path_1.default.join(__dirname, 'invoiceToCustomer.hbs'), 'utf8');
    const template = handlebars_1.default.compile(htmlContent);
    const data = {};
    const html = template(data);
    const doc = new pdfkit_1.default();
    doc.pipe(fs_1.default.createWriteStream('invoice.pdf'));
    doc.text(html, {
        align: 'left',
    });
    doc.end();
    console.log('PDF Generated successfully!');
})();
//# sourceMappingURL=mailhtmlToPdf.js.map