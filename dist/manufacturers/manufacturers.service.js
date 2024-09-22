"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManufacturersService = void 0;
const common_1 = require("@nestjs/common");
const paginate_1 = require("../common/pagination/paginate");
const options = {
    keys: ['name'],
    threshold: 0.3,
};
let ManufacturersService = class ManufacturersService {
    create(createManufactureDto) {
        return [];
    }
    async getManufactures({ limit, page, search, }) {
        if (!page)
            page = 1;
        if (!limit)
            limit = 30;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        let data = [];
        if (search) {
            const parseSearchParams = search.split(';');
            for (const searchParam of parseSearchParams) {
                const [key, value] = searchParam.split(':');
                data = [];
            }
        }
        const results = data.slice(startIndex, endIndex);
        const url = `/manufacturers?search=${search}&limit=${limit}`;
        return Object.assign({ data: results }, (0, paginate_1.paginate)(data.length, page, limit, results.length, url));
    }
    async getTopManufactures({ limit = 10, }) {
        return [];
    }
    async getManufacturesBySlug(slug) {
        return [];
    }
    update(id, updateManufacturesDto) {
        const manufacturer = {};
        return manufacturer;
    }
    remove(id) {
        return `This action removes a #${id} product`;
    }
};
ManufacturersService = __decorate([
    (0, common_1.Injectable)()
], ManufacturersService);
exports.ManufacturersService = ManufacturersService;
//# sourceMappingURL=manufacturers.service.js.map