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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxesService = exports.GST_NAME = void 0;
const common_1 = require("@nestjs/common");
const tax_entity_1 = require("./entities/tax.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const product_entity_1 = require("../products/entities/product.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
var GST_NAME;
(function (GST_NAME) {
    GST_NAME["GOODS"] = "goods";
    GST_NAME["SERVICES"] = "service";
})(GST_NAME = exports.GST_NAME || (exports.GST_NAME = {}));
let TaxesService = class TaxesService {
    constructor(taxRepository, productRepository, categoryRepository, shopRepository, cacheManager) {
        this.taxRepository = taxRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.shopRepository = shopRepository;
        this.cacheManager = cacheManager;
    }
    async create(createTaxDto) {
        try {
            let gst = null;
            let shop = null;
            const tax = new tax_entity_1.Tax();
            if (createTaxDto.shop_id) {
                shop = await this.shopRepository.findOne({ where: { id: createTaxDto.shop_id } });
                if (!shop) {
                    throw new common_1.NotFoundException(`Shop with ID ${createTaxDto.shop_id} not found`);
                }
            }
            if (createTaxDto.rate) {
                gst = createTaxDto.rate / 2;
            }
            tax.name = createTaxDto.name;
            if (createTaxDto.sac_no) {
                tax.sac_no = createTaxDto.sac_no;
                tax.gst_Name = GST_NAME.GOODS;
                tax.hsn_no = null;
            }
            else if (createTaxDto.hsn_no) {
                tax.hsn_no = createTaxDto.hsn_no;
                tax.gst_Name = GST_NAME.SERVICES;
                tax.sac_no = null;
            }
            tax.shop = shop;
            tax.cgst = gst !== null ? gst : createTaxDto.cgst;
            tax.sgst = gst !== null ? gst : createTaxDto.sgst;
            tax.compensation_Cess = createTaxDto.compensation_Cess;
            tax.rate = createTaxDto.rate;
            return await this.taxRepository.save(tax);
        }
        catch (error) {
            console.error('Error creating tax:', error);
            return 'Cannot Find Data Here';
        }
    }
    async findAllByShopIdentifier(shopId, shopSlug) {
        try {
            const cacheKey = `taxes_${shopId || shopSlug}`;
            let existingData = await this.cacheManager.get(cacheKey);
            if (!existingData) {
                if (shopId) {
                    existingData = await this.taxRepository.find({
                        where: { shop: { id: shopId } },
                        relations: ['shop'],
                    });
                }
                else if (shopSlug) {
                    existingData = await this.taxRepository.find({
                        where: { shop: { slug: shopSlug } },
                        relations: ['shop'],
                    });
                }
                else {
                    existingData = [];
                }
                await this.cacheManager.set(cacheKey, existingData, 60);
            }
            return existingData;
        }
        catch (error) {
            console.error("Error retrieving tax data:", error);
            throw new common_1.NotFoundException("Failed to retrieve tax data");
        }
    }
    async findOne(id) {
        try {
            const cacheKey = `tax_${id}`;
            let existingTax = await this.cacheManager.get(cacheKey);
            if (!existingTax) {
                existingTax = await this.taxRepository.findOne({ where: { id: id } });
                if (!existingTax) {
                    throw new common_1.NotFoundException("Cannot find TaxRate");
                }
                await this.cacheManager.set(cacheKey, existingTax, 60);
            }
            return existingTax;
        }
        catch (error) {
            console.error("Error retrieving tax data:", error);
            throw new common_1.NotFoundException("Cannot find TaxRate");
        }
    }
    async update(id, updateTaxDto) {
        try {
            const existingTaxes = await this.taxRepository.findOne({
                where: { id: id },
            });
            if (!existingTaxes) {
                throw new common_1.NotFoundException('Tax not found');
            }
            let gst = null;
            if (updateTaxDto.rate) {
                gst = updateTaxDto.rate / 2;
            }
            existingTaxes.name = updateTaxDto.name;
            if (updateTaxDto.sac_no) {
                existingTaxes.sac_no = updateTaxDto.sac_no;
                existingTaxes.gst_Name = GST_NAME.SERVICES;
                existingTaxes.hsn_no = null;
            }
            else if (updateTaxDto.hsn_no) {
                existingTaxes.hsn_no = updateTaxDto.hsn_no;
                existingTaxes.gst_Name = GST_NAME.GOODS;
                existingTaxes.sac_no = null;
            }
            existingTaxes.cgst = gst !== null ? gst : updateTaxDto.cgst;
            existingTaxes.sgst = gst !== null ? gst : updateTaxDto.sgst;
            existingTaxes.compensation_Cess = updateTaxDto.compensation_Cess;
            existingTaxes.rate = updateTaxDto.rate;
            return await this.taxRepository.save(existingTaxes);
        }
        catch (error) {
            console.error('Error updating tax:', error);
            return 'Updated unsuccessfully';
        }
    }
    async remove(id) {
        const existingTaxes = await this.taxRepository.findOne({
            where: { id: id }
        });
        if (!existingTaxes) {
            throw new common_1.NotFoundException('Question not found');
        }
        return this.taxRepository.remove(existingTaxes);
    }
    async validateGST(gstNumber) {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
        const isValidGST = gstRegex.test(gstNumber);
        return isValidGST;
    }
};
TaxesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(tax_entity_1.Tax)),
    __param(1, (0, typeorm_2.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_2.InjectRepository)(category_entity_1.Category)),
    __param(3, (0, typeorm_2.InjectRepository)(shop_entity_1.Shop)),
    __param(4, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository, Object])
], TaxesService);
exports.TaxesService = TaxesService;
//# sourceMappingURL=taxes.service.js.map