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
exports.WishlistsService = void 0;
const common_1 = require("@nestjs/common");
const paginate_1 = require("../common/pagination/paginate");
const wishlist_entity_1 = require("./entities/wishlist.entity");
const product_entity_1 = require("../products/entities/product.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
let WishlistsService = class WishlistsService {
    constructor(wishlistRepository, productRepository, cacheManager) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.cacheManager = cacheManager;
    }
    async findAllWishlists({ limit = 30, page = 1, search }, userId) {
        const cacheKey = `wishlists_${userId || 'all'}_${page}_${limit}_${search || 'all'}`;
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        const startIndex = (page - 1) * limit;
        const findOptions = {
            skip: startIndex,
            take: limit,
            relations: ['product'],
            where: userId ? { user: { id: userId } } : {},
        };
        let data = await this.wishlistRepository.find(findOptions);
        if (search) {
            data = data.filter(item => item.product.name.toLowerCase().includes(search.toLowerCase()));
        }
        const results = data.slice(startIndex, startIndex + limit);
        const withParam = 'shop';
        const orderBy = 'created_at';
        const sortedBy = 'desc';
        const url = `/wishlists?${[
            withParam ? `with=${withParam}` : '',
            orderBy ? `orderBy=${orderBy}` : '',
            sortedBy ? `sortedBy=${sortedBy}` : '',
        ].filter(Boolean).join('&')}`;
        const paginatedData = Object.assign({ data: results }, (0, paginate_1.paginate)(data.length, page, limit, results.length, url));
        await this.cacheManager.set(cacheKey, paginatedData, 60);
        return paginatedData;
    }
    async findWishlist(id) {
        const cacheKey = `wishlist_${id}`;
        const cachedWishlist = await this.cacheManager.get(cacheKey);
        if (cachedWishlist) {
            return cachedWishlist;
        }
        const wishlist = await this.wishlistRepository.findOne({
            where: { id: id },
            relations: ['product'],
        });
        if (!wishlist) {
            throw new common_1.NotFoundException(`Wishlist with ID ${id} not found`);
        }
        await this.cacheManager.set(cacheKey, wishlist, 60);
        return wishlist;
    }
    async create(createWishlistDto) {
        try {
            const wishlist = new wishlist_entity_1.Wishlist();
            wishlist.product_id = createWishlistDto.product_id;
            wishlist.product = createWishlistDto.product;
            wishlist.user = createWishlistDto.user;
            wishlist.user_id = createWishlistDto.user_id;
            await this.wishlistRepository.save(wishlist);
        }
        catch (err) {
            console.log('Error' + err);
        }
    }
    async update(id, updateWishlistDto) {
        if (id) {
            const existingTaxes = await this.wishlistRepository.findOne({
                where: { id: id }
            });
            if (!existingTaxes) {
                throw new common_1.NotFoundException('Question not found');
            }
            existingTaxes.product = updateWishlistDto.product;
            existingTaxes.product_id = updateWishlistDto.product_id;
            existingTaxes.user = updateWishlistDto.user;
            existingTaxes.user_id = updateWishlistDto.user_id;
            await this.wishlistRepository.save(existingTaxes);
        }
    }
    async delete(id) {
        const existingWishlist = await this.wishlistRepository.findOne({
            where: { id: id }
        });
        if (!existingWishlist) {
            throw new common_1.NotFoundException('Question not found');
        }
        return this.wishlistRepository.remove(existingWishlist);
    }
    isInWishlist(product_id) {
        var _a;
        const product = this.productRepository.find({ where: { id: product_id } });
        return (_a = product[0]) === null || _a === void 0 ? void 0 : _a.in_wishlist;
    }
    toggle({ product_id }) {
        var _a;
        const product = this.productRepository.find({ where: { id: product_id } });
        product[0].in_wishlist = !((_a = product[0]) === null || _a === void 0 ? void 0 : _a.in_wishlist);
        return product[0].in_wishlist;
    }
};
WishlistsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wishlist_entity_1.Wishlist)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, Object])
], WishlistsService);
exports.WishlistsService = WishlistsService;
//# sourceMappingURL=wishlists.service.js.map