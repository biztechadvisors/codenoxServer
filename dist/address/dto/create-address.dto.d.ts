import { Add, UserAdd } from '../entities/address.entity';
declare const CreateAddressDto_base: import("@nestjs/common").Type<Pick<Add, "type" | "title" | "default">>;
export declare class CreateAddressDto extends CreateAddressDto_base {
    address: UserAdd;
    customer_id: number;
}
export {};
