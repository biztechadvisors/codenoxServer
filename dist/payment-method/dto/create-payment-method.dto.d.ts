import { PaymentMethod } from '../entities/payment-method.entity';
declare const CreatePaymentMethodDto_base: import("@nestjs/common").Type<Omit<PaymentMethod, "id" | "created_at" | "updated_at">>;
export declare class CreatePaymentMethodDto extends CreatePaymentMethodDto_base {
}
export {};
