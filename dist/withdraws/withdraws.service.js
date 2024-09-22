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
exports.WithdrawsService = void 0;
const common_1 = require("@nestjs/common");
const withdraw_entity_1 = require("./entities/withdraw.entity");
const paginate_1 = require("../common/pagination/paginate");
const typeorm_1 = require("@nestjs/typeorm");
const fuse_js_1 = __importDefault(require("fuse.js"));
const typeorm_2 = require("typeorm");
const balance_entity_1 = require("../shops/entities/balance.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
let WithdrawsService = class WithdrawsService {
    constructor(withdrawRepository, balanceRepository, shopRepository) {
        this.withdrawRepository = withdrawRepository;
        this.balanceRepository = balanceRepository;
        this.shopRepository = shopRepository;
    }
    async create(createWithdrawDto) {
        const newWithdraw = new withdraw_entity_1.Withdraw();
        try {
            const findId = await this.withdrawRepository.find({
                where: {
                    shop_id: createWithdrawDto.shop_id
                }
            });
            if (findId) {
                newWithdraw.amount = createWithdrawDto.amount;
                newWithdraw.details = createWithdrawDto.details;
                newWithdraw.note = createWithdrawDto.note;
                newWithdraw.payment_method = createWithdrawDto.payment_method;
                newWithdraw.shop_id = createWithdrawDto.shop_id;
                newWithdraw.status = withdraw_entity_1.WithdrawStatus.PROCESSING;
                newWithdraw.created_at = new Date();
                newWithdraw.updated_at = new Date();
                const shop = await this.shopRepository.findOne({
                    where: {
                        id: createWithdrawDto.shop_id,
                    },
                    relations: ['balance'],
                });
                newWithdraw.shop = shop;
                const addWithdraw = await this.withdrawRepository.save(newWithdraw);
                const findBalanceId = await this.balanceRepository.findOne({
                    where: {
                        id: addWithdraw.shop.balance.id
                    }
                });
                if (findBalanceId) {
                    findBalanceId.withdrawn_amount = addWithdraw.amount;
                    await this.balanceRepository.save(findBalanceId);
                }
                return addWithdraw;
            }
            else {
                return 'You Already Have Pending Request';
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    async getWithdraws({ limit, page, status, shop_id, }) {
        if (!page)
            page = 1;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        let data = await this.withdrawRepository.find({
            relations: ['shop'],
        });
        const fuse = new fuse_js_1.default(data, {
            keys: ['name', 'shop_id', 'status'],
            threshold: 0.3,
        });
        if (status) {
            const fuseSearchResult = fuse.search(status);
            data = (fuseSearchResult === null || fuseSearchResult === void 0 ? void 0 : fuseSearchResult.map(({ item }) => item)) || [];
        }
        if (shop_id) {
            data = await this.withdrawRepository.find({
                where: {
                    shop_id: shop_id
                },
                relations: ['shop']
            });
        }
        const results = data.slice(startIndex, endIndex);
        const url = `/withdraws?limit=${limit}`;
        return Object.assign({ data: results }, (0, paginate_1.paginate)(data.length, page, limit, results.length, url));
    }
    async findOne(id) {
        const getWthdraw = await this.withdrawRepository.findOne({
            where: { id: id },
            relations: ['shop']
        });
        return getWthdraw;
    }
    async update(id, updateWithdrawDto) {
        const findWithdraw = await this.withdrawRepository.findOne({
            where: {
                id: updateWithdrawDto.id,
            },
            relations: [
                'shop',
            ]
        });
        findWithdraw.status = updateWithdrawDto.status;
        if (findWithdraw.status === withdraw_entity_1.WithdrawStatus.APPROVED) {
            const shop = await this.shopRepository.findOne({
                where: {
                    id: findWithdraw.shop.id,
                },
                relations: ['balance'],
            });
            const balance = await this.balanceRepository.findOne({
                where: {
                    id: shop.balance.id
                }
            });
            balance.current_balance -= findWithdraw.amount;
            const final = await this.balanceRepository.save(balance);
        }
        const updatedStatus = await this.withdrawRepository.save(findWithdraw);
        return updatedStatus;
    }
    async remove(id) {
        const idFind = await this.withdrawRepository.findOne({
            where: {
                id: id
            }
        });
        if (!idFind) {
            throw new Error(`Withdraw with ID ${id} not found`);
        }
        const deleteData = {
            id: idFind.id
        };
        await this.withdrawRepository.delete(deleteData);
        return deleteData;
    }
};
WithdrawsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(withdraw_entity_1.Withdraw)),
    __param(1, (0, typeorm_1.InjectRepository)(balance_entity_1.Balance)),
    __param(2, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], WithdrawsService);
exports.WithdrawsService = WithdrawsService;
//# sourceMappingURL=withdraws.service.js.map