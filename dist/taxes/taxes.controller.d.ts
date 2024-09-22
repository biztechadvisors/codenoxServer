import { TaxesService } from './taxes.service';
import { CreateTaxDto, ValidateGstDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
export declare class TaxesController {
    private readonly taxesService;
    constructor(taxesService: TaxesService);
    create(createTaxDto: CreateTaxDto): Promise<import("./entities/tax.entity").Tax | "Cannot Find Data Here">;
    createValidateGST(validateGstDto: ValidateGstDto): Promise<boolean>;
    findAll(shopId: number, shopSlug: string): Promise<import("./entities/tax.entity").Tax[]>;
    findOne(id: string): Promise<import("./entities/tax.entity").Tax>;
    update(id: string, updateTaxDto: UpdateTaxDto): Promise<import("./entities/tax.entity").Tax | "Updated unsuccessfully">;
    remove(id: string): Promise<import("./entities/tax.entity").Tax>;
}
