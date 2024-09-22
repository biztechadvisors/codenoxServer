import { Shipping } from '../entities/shipping.entity';
declare const CreateShippingDto_base: import("@nestjs/common").Type<Pick<Shipping, "name" | "type" | "amount" | "is_global">>;
export declare class CreateShippingDto extends CreateShippingDto_base {
}
export {};
