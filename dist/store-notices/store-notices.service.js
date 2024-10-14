"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreNoticesService = void 0;
const common_1 = require("@nestjs/common");
const paginate_1 = require("../common/pagination/paginate");
let StoreNoticesService = class StoreNoticesService {
    create(createStoreNoticeDto) {
        return [];
    }
    getStoreNotices({ search, limit, page }) {
        if (!page)
            page = 1;
        if (!limit)
            limit = 12;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        let data = [];
        if (search) {
            const parseSearchParams = search.split(';');
            const searchText = [];
            for (const searchParam of parseSearchParams) {
                const [key, value] = searchParam.split(':');
                if (key !== 'slug') {
                    searchText.push({
                        [key]: value,
                    });
                }
            }
            data = [];
        }
        const results = data.slice(startIndex, endIndex);
        const url = `/store-notices?search=${search || ''}&limit=${limit || 15}`;
        return Object.assign({ data: results }, (0, paginate_1.paginate)(data.length, page, limit, results.length, url));
    }
    getStoreNotice(param, language) {
        return [];
    }
    update(id, updateStoreNoticeDto) {
        return [];
    }
    remove(id) {
        return `This action removes a #${id} store notice`;
    }
};
StoreNoticesService = __decorate([
    (0, common_1.Injectable)()
], StoreNoticesService);
exports.StoreNoticesService = StoreNoticesService;
//# sourceMappingURL=store-notices.service.js.map