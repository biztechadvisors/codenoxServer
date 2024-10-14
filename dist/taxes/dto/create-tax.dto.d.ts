import { Tax } from '../entities/tax.entity';
declare const CreateTaxDto_base: import("@nestjs/common").Type<Omit<Tax, "created_at" | "updated_at" | "id">>;
export declare class CreateTaxDto extends CreateTaxDto_base {
    shop_id: number;
}
export declare class ValidateGstDto {
    gstNumber: string;
}
export {};
