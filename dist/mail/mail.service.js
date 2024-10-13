"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const mailer_1 = require("@nestjs-modules/mailer");
const common_1 = require("@nestjs/common");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const handlebars_1 = __importDefault(require("handlebars"));
const { toWords } = require('number-to-words');
let MailService = class MailService {
    constructor(mailerService) {
        this.mailerService = mailerService;
    }
    async renderTemplate(data, templateName) {
        const templatePath = path_1.default.join(__dirname, 'templates', `${templateName}.hbs`);
        try {
            const templateContent = fs_1.default.readFileSync(templatePath, 'utf8');
            const compiledTemplate = handlebars_1.default.compile(templateContent);
            const renderedTemplate = compiledTemplate(data);
            await this.mailerService.sendMail({
                to: data.finalEmail,
                from: '"Codenox Purchase" <' + process.env.MAIL_FROM + '>',
                subject: 'Your Codenox Order Confirmation',
                html: renderedTemplate,
                attachments: [
                    {
                        filename: 'invoice.pdf',
                        encoding: 'base64',
                        contentType: 'application/pdf',
                    },
                ],
            });
            return renderedTemplate;
        }
        catch (err) {
            console.error('Error rendering or sending email:', err);
            throw new common_1.InternalServerErrorException('Failed to send email');
        }
    }
    async dealer_renderTemplate(data, templateName) {
        const templatePath = path_1.default.join(__dirname, 'templates', `${templateName}.hbs`);
        try {
            const templateContent = fs_1.default.readFileSync(templatePath, 'utf8');
            const compiledTemplate = handlebars_1.default.compile(templateContent);
            const renderedTemplate = compiledTemplate(data);
            await this.mailerService.sendMail({
                to: data.customer.email,
                from: '"Codenox Purchase" <info@codenoxx.tech>',
                subject: 'Your Codenox Order Confirmation. Please share your feedback',
                html: renderedTemplate,
                attachments: [
                    {
                        filename: 'invoice.pdf',
                        encoding: 'base64',
                        contentType: 'application/pdf',
                    },
                ],
            });
            return templateContent;
        }
        catch (err) {
            console.error('Error reading or sending email:', err);
            return null;
        }
    }
    async sendUserConfirmation(userOrEmail, token) {
        const url = `https://${process.env.FRONTEND_APP_URL}/auth/confirm?token=${token}`;
        let email, name;
        if (typeof userOrEmail === 'string') {
            email = userOrEmail;
            name = email.split('@')[0];
        }
        else {
            email = userOrEmail.email;
            name = userOrEmail.name;
        }
        try {
            await this.mailerService.sendMail({
                to: email,
                from: '"Support Team" <' + process.env.MAIL_FROM + '>',
                subject: `Welcome to Codenox! Confirm your OTP: ${token}`,
                template: './confirmation',
                context: {
                    name,
                    otp: token,
                    url,
                },
            });
        }
        catch (error) {
            console.error('Error sending confirmation email:', error);
            throw new common_1.InternalServerErrorException('Failed to send confirmation email');
        }
    }
    async resendUserConfirmation(user, token) {
        const url = `https://${process.env.FRONTEND_APP_URL}/auth/confirm?token=${token}`;
        try {
            await this.mailerService.sendMail({
                to: user.email,
                from: '"Support Team" <info@codenoxx.tech>',
                subject: `Welcome to Codenox! Confirm your OTP: ${user.otp}`,
                template: 'confirmation',
                context: {
                    name: user.name,
                    otp: user.otp,
                    url,
                },
            });
        }
        catch (error) {
            console.error('Error resending confirmation email:', error);
        }
    }
    async forgetPasswordUserConfirmation(user, token) {
        const url = `https://${process.env.FRONTEND_APP_URL}/auth/confirm?token=${token}`;
        try {
            await this.mailerService.sendMail({
                to: user.email,
                from: '"Support Team" <info@codenoxx.tech>',
                subject: `Welcome to Codenox! Confirm your Forgot OTP: ${user.otp}`,
                template: 'forgetPassWord',
                context: {
                    name: user.name,
                    otp: user.otp,
                    url,
                },
            });
        }
        catch (error) {
            console.error('Error sending forgot password email:', error);
        }
    }
    async successfullyRegister(user) {
        try {
            await this.mailerService.sendMail({
                to: user.email,
                from: '"Support Team" <info@codenoxx.tech>',
                subject: `Welcome to Our Platform! Confirm your registration.`,
                template: 'successfullyRegister',
                context: {
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    otp: user.otp,
                },
            });
        }
        catch (error) {
            console.error('Error sending registration success email:', error);
        }
    }
    async sendInvoiceToVendor(user, products) {
        try {
            const productDetails = products.map((items) => ({
                name: items.Name,
                price: items.netPrice,
                imageUrl: items.image,
            }));
            await this.mailerService.sendMail({
                to: user.email,
                from: '"Support Team" <info@codenoxx.tech>',
                subject: 'New Order Placed',
                template: 'invoiceToVendor',
                context: {
                    email: user.email,
                    products: productDetails,
                },
            });
        }
        catch (error) {
            console.error('Error sending invoice to vendor:', error);
        }
    }
    async sendInvoiceToCustomerORDealer(taxType) {
        try {
            const { CGST, IGST, SGST, net_amount, total_amount, shop, soldByUserAddress, sales_tax_total, total_amount_in_words, payment_Mode, paymentInfo, billing_address, shipping_address, total_tax_amount, shop_address, products, created_at, order_no, invoice_date, } = taxType;
            const totalSubtotal = products.reduce((accumulator, currentValue) => {
                return accumulator + currentValue.pivot.subtotal;
            }, 0);
            const totalSubtotalInWords = toWords(totalSubtotal);
            const updatedProducts = products.map((product) => {
                var _a, _b, _c;
                const unit_price = Number(((_a = product.pivot) === null || _a === void 0 ? void 0 : _a.unit_price) || 0);
                const quantity = Number(((_b = product.pivot) === null || _b === void 0 ? void 0 : _b.order_quantity) || 0);
                const tax_rate = Number(((_c = product.taxes) === null || _c === void 0 ? void 0 : _c.rate) || 0) / 100;
                const subtotal = unit_price * quantity;
                const taxAmount = Math.round(subtotal * tax_rate);
                const total = subtotal + taxAmount;
                return Object.assign(Object.assign({}, product), { subtotal, taxAmount, total });
            });
            const finalEmail = taxType.dealer.email ? taxType.dealer.email : taxType.customer.email;
            const orderDetails = {
                IGST,
                CGST,
                SGST,
                net_amount,
                total_amount,
                shop,
                soldByUserAddress,
                sales_tax_total,
                total_amount_in_words,
                payment_Mode,
                paymentInfo,
                billing_address,
                shipping_address,
                total_tax_amount,
                shop_address,
                finalEmail,
                finalTotal: totalSubtotal,
                amountinWord: totalSubtotalInWords,
                products: updatedProducts,
                created_at,
                order_no,
                invoice_date,
            };
            await this.renderTemplate(orderDetails, 'invoiceToCustomer');
        }
        catch (error) {
            console.error('Invoice sending failed to Customer or Dealer:', error);
        }
    }
    async sendInvoiceDealerToCustomer(Invoice) {
        try {
            const { CGST, IGST, SGST, net_amount, total_amount, shop, soldByUserAddress, sales_tax_total, total_amount_in_words, payment_Mode, paymentInfo, billing_address, shipping_address, sales_tax, total_tax_amount, shop_address, customer, dealer, products, created_at, order_no, invoice_date, } = Invoice;
            const totalSubtotal = products.reduce((accumulator, currentValue) => {
                return accumulator + currentValue.pivot.subtotal;
            }, 0);
            const totalSubtotalInWords = toWords(totalSubtotal);
            const updatedProducts = products.map((product) => {
                var _a, _b, _c;
                const unit_price = Number(((_a = product.pivot) === null || _a === void 0 ? void 0 : _a.unit_price) || 0);
                const quantity = Number(((_b = product.pivot) === null || _b === void 0 ? void 0 : _b.order_quantity) || 0);
                const tax_rate = Number(((_c = product.taxes) === null || _c === void 0 ? void 0 : _c.rate) || 0) / 100;
                const subtotal = unit_price * quantity;
                const taxAmount = Math.round(subtotal * tax_rate);
                const total = subtotal + taxAmount;
                return Object.assign(Object.assign({}, product), { subtotal, taxAmount, total });
            });
            const dealerEmail = Invoice.dealer.email ? Invoice.dealer.email : Invoice.customer.email;
            const orderDetails = {
                IGST,
                CGST,
                SGST,
                net_amount,
                total_amount,
                shop,
                soldByUserAddress,
                sales_tax_total,
                total_amount_in_words,
                payment_Mode,
                paymentInfo,
                billing_address,
                shipping_address,
                sales_tax,
                total_tax_amount,
                shop_address,
                dealerEmail,
                finalTotal: totalSubtotal,
                amountinWord: totalSubtotalInWords,
                products: updatedProducts,
                created_at,
                order_no,
                invoice_date,
            };
            await this.dealer_renderTemplate(orderDetails, 'invoiceToCustomer');
        }
        catch (error) {
            console.error('Dealer Invoice sending failed:', error);
        }
    }
    async sendUserRefund(user, products) {
        try {
            const productDetails = products.map((items) => ({
                name: items.Name,
                price: items.netPrice,
                imageUrl: items.image
            }));
            await this.mailerService.sendMail({
                to: user.email,
                from: '"Dealer" <info@codenoxx.tech>',
                subject: 'Your Refund amount. Please share your feedback',
                template: '/refund',
                context: {
                    email: user.email,
                    products: productDetails,
                },
            });
        }
        catch (error) {
            console.error("Invoice sending failed to Customer", error);
        }
    }
    async sendCancelOrder(user, products) {
        try {
            const productDetails = products.map((items) => ({
                name: items.Name,
                price: items.netPrice,
                imageUrl: items.image
            }));
            await this.mailerService.sendMail({
                to: user.email,
                from: '"Dealer" <info@codenoxx.tech>',
                subject: 'Your Codenox Order Confirmation. Please share your feedback',
                template: '/cancelOrder',
                context: {
                    email: user.email,
                    products: productDetails,
                },
            });
        }
        catch (error) {
            console.error("Invoice sending failed to Customer", error);
        }
    }
    async sendOrderConfirmation(order, user) {
        try {
            const emailSubject = 'Order Confirmation';
            const emailBody = `
        <h1>Order Confirmation</h1>
        <p>Dear ${user.name || 'Customer'},</p>
        <p>Thank you for your order!</p>
        <p>Your order ID: ${order.id}</p>
        <p>Order Date: ${order.created_at.toLocaleDateString()}</p>
        <p>Order Status: ${order.order_status}</p>
        <p>Total Amount: ${order.total}</p>
        <p>Billing Address: ${order.billing_address.street_address}, ${order.billing_address.city}, ${order.billing_address.state}, ${order.billing_address.country}, ${order.billing_address.zip}</p>
        <p>Shipping Address: ${order.shipping_address.street_address}, ${order.shipping_address.city}, ${order.shipping_address.state}, ${order.shipping_address.country}, ${order.shipping_address.zip}</p>
        <p>Thank you for shopping with us!</p>
        <p>Best regards,</p>
        <p>Codenox.com</p>
      `;
            await this.mailerService.sendMail({
                to: user.email,
                subject: emailSubject,
                html: emailBody,
            });
        }
        catch (error) {
            console.error('Error sending order confirmation email:', error.message || error);
            throw new common_1.InternalServerErrorException('Failed to send order confirmation email');
        }
    }
    async sendTransactionDeclined(user, products) {
        try {
            const productDetails = products.map((items) => ({
                name: items.Name,
                price: items.netPrice,
                imageUrl: items.image
            }));
            await this.mailerService.sendMail({
                to: user.email,
                from: '"Dealer" <info@codenoxx.tech>',
                subject: 'Your Codenox Order Confirmation. Please share your feedback',
                template: '/transactionDeclined',
                context: {
                    email: user.email,
                    products: productDetails,
                },
            });
        }
        catch (error) {
            console.error("Invoice sending failed to Customer", error);
        }
    }
    async sendAbandonmenCartReminder(email, products) {
        if (!Array.isArray(products) || products.length === 0) {
            console.error("Invalid or empty products array");
            return;
        }
        try {
            const productDetails = products.map(item => ({
                name: item.name,
                price: item.price,
                imageUrl: item.image,
                slug: item.slug
            }));
            const CartUrl = `https://${process.env.FRONTEND_APP_URL}/shop-cart`;
            await this.mailerService.sendMail({
                to: email,
                from: '"Support Team" <info@codenoxx.tech>',
                subject: "Don't forget your items! ️ Your cart reminder from Codenox",
                template: '/abandonmentCartReminder',
                context: {
                    email: email,
                    products: productDetails,
                    cartUrl: CartUrl,
                },
            });
        }
        catch (error) {
            console.error("Email sending Failed", error);
        }
    }
    async sendPermissionUserConfirmation(password, user, token) {
        const url = `https://${process.env.FRONTEND_APP_URL}/auth/confirm?token=${token}`;
        const templatePath = path_1.default.join(__dirname, 'templates', 'userbyowner.hbs');
        try {
            await this.mailerService.sendMail({
                to: user.email,
                from: '"Support Team" <info@codenoxx.tech>',
                subject: `Welcome to Codenox!`,
                template: templatePath,
                context: {
                    email: user.email,
                    password: password,
                    name: user.name,
                    otp: user.otp,
                    permission: user.permission.type_name,
                    url,
                },
            });
            console.log('Mail sent successfully');
        }
        catch (error) {
            console.error('Error sending email:', error);
        }
    }
};
MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService])
], MailService);
exports.MailService = MailService;
//# sourceMappingURL=mail.service.js.map