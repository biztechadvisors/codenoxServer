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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingsService = void 0;
const common_1 = require("@nestjs/common");
const shipping_entity_1 = require("./entities/shipping.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fuse_js_1 = __importDefault(require("fuse.js"));
let ShippingsService = class ShippingsService {
    constructor(shippingRepository) {
        this.shippingRepository = shippingRepository;
    }
    async create(createShippingDto) {
        const shipping = new shipping_entity_1.Shipping();
        shipping.name = createShippingDto.name;
        shipping.amount = createShippingDto.amount;
        shipping.type = createShippingDto.type;
        shipping.is_global = createShippingDto.is_global;
        return await this.shippingRepository.save(shipping);
    }
    async getShippings({ search }) {
        var _a;
        const options = {
            keys: ['name', 'slug'],
            threshold: 0.3,
        };
        let shippingFind = await this.shippingRepository.find();
        const fuse = new fuse_js_1.default(shippingFind, options);
        if (search) {
            const parseSearchParams = search.split(';');
            for (const searchParam of parseSearchParams) {
                const [key, value] = searchParam.split(':');
                shippingFind = (_a = fuse.search(value)) === null || _a === void 0 ? void 0 : _a.map(({ item }) => item);
            }
        }
        return shippingFind ? shippingFind : [];
    }
    async findOne(id) {
        const finalValue = await this.shippingRepository.findOne({ where: { id: id } });
        return finalValue;
    }
    async update(id, updateShippingDto) {
        const existingShipping = await this.shippingRepository.findOne({ where: { id: id } });
        if (!existingShipping) {
            throw new common_1.NotFoundException('Address not found');
        }
        existingShipping.name = updateShippingDto.name;
        existingShipping.type = updateShippingDto.type;
        existingShipping.amount = updateShippingDto.amount;
        existingShipping.is_global = updateShippingDto.is_global;
        return await this.shippingRepository.save(existingShipping);
    }
    async remove(id) {
        const existingShipping = await this.shippingRepository.findOne({ where: { id: id } });
        if (!existingShipping) {
            throw new common_1.NotFoundException('Address not found');
        }
        await this.shippingRepository.remove(existingShipping);
    }
};
ShippingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shipping_entity_1.Shipping)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ShippingsService);
exports.ShippingsService = ShippingsService;
//# sourceMappingURL=shippings.service.js.map