import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity';
export declare class MailService {
    private mailerService;
    constructor(mailerService: MailerService);
    renderTemplate(data: any, templateName: string): Promise<string>;
    dealer_renderTemplate(data: any, templateName: string): Promise<string>;
    sendUserConfirmation(userOrEmail: string | {
        email: string;
        name: string;
    }, token: string): Promise<void>;
    resendUserConfirmation(user: User, token: string): Promise<void>;
    forgetPasswordUserConfirmation(user: User, token: string): Promise<void>;
    successfullyRegister(user: User): Promise<void>;
    sendInvoiceToVendor(user: User, products: any): Promise<void>;
    sendInvoiceToCustomerORDealer(taxType: any): Promise<void>;
    sendInvoiceDealerToCustomer(Invoice: any): Promise<void>;
    sendUserRefund(user: User, products: any): Promise<void>;
    sendCancelOrder(user: User, products: any): Promise<void>;
    sendOrderConfirmation(order: any, user: User): Promise<void>;
    sendTransactionDeclined(user: User, products: any): Promise<void>;
    sendAbandonmenCartReminder(email: any, products: any): Promise<void>;
    sendPermissionUserConfirmation(password: any, user: User, token: string): Promise<void>;
}
