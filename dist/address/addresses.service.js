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
exports.AddressesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const address_entity_1 = require("./entities/address.entity");
const user_entity_1 = require("../users/entities/user.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const typeorm_2 = require("typeorm");
let AddressesService = class AddressesService {
    constructor(userAddressRepository, addressRepository, userRepository, cacheManager) {
        this.userAddressRepository = userAddressRepository;
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
        this.cacheManager = cacheManager;
    }
    async create(createAddressDto) {
        const user = await this.userRepository.findOne({ where: { id: createAddressDto.customer_id } });
        if (!user) {
            throw new common_1.NotFoundException('User does not exist');
        }
        const userAddress = this.userAddressRepository.create(createAddressDto.address);
        const savedUserAddress = await this.userAddressRepository.save(userAddress);
        const address = this.addressRepository.create({
            title: createAddressDto.title,
            type: createAddressDto.type,
            default: createAddressDto.default,
            address: savedUserAddress,
            customer: user,
        });
        const savedAddress = await this.addressRepository.save(address);
        await this.cacheManager.del(`addresses:userId:${user.id}`);
        return savedAddress;
    }
    async findAll(userId) {
        const cacheKey = `addresses:userId:${userId}`;
        let addresses = await this.cacheManager.get(cacheKey);
        if (!addresses) {
            addresses = await this.addressRepository.find({
                where: { customer: { id: userId } },
                relations: ['address'],
            });
            if (addresses.length) {
                await this.cacheManager.set(cacheKey, addresses, 3600);
            }
        }
        return addresses;
    }
    async findOne(id) {
        const cacheKey = `address:id:${id}`;
        let address = await this.cacheManager.get(cacheKey);
        if (!address) {
            address = await this.addressRepository.findOne({
                where: { id },
                relations: ['address', 'customer'],
            });
            if (!address) {
                throw new common_1.NotFoundException(`Address with ID ${id} not found`);
            }
            await this.cacheManager.set(cacheKey, address, 3600);
        }
        return address;
    }
    async update(id, updateAddressDto) {
        const address = await this.addressRepository.findOne({
            where: { id },
            relations: ['address'],
        });
        if (!address) {
            throw new common_1.NotFoundException(`Address with ID ${id} not found`);
        }
        const userAddress = address.address;
        if (userAddress && updateAddressDto.address) {
            Object.assign(userAddress, updateAddressDto.address);
            await this.userAddressRepository.save(userAddress);
        }
        Object.assign(address, updateAddressDto);
        await this.addressRepository.save(address);
        await this.cacheManager.del(`addresses:userId:${address.customer.id}`);
        await this.cacheManager.del(`address:id:${id}`);
        return address;
    }
    async remove(id) {
        const address = await this.addressRepository.findOne({
            where: { id },
            relations: ['address', 'customer'],
        });
        if (!address) {
            throw new common_1.NotFoundException(`Address with ID ${id} not found`);
        }
        await this.addressRepository.remove(address);
        await this.cacheManager.del(`addresses:userId:${address.customer.id}`);
        await this.cacheManager.del(`address:id:${id}`);
    }
};
AddressesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(address_entity_1.UserAdd)),
    __param(1, (0, typeorm_1.InjectRepository)(address_entity_1.Add)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object])
], AddressesService);
exports.AddressesService = AddressesService;
//# sourceMappingURL=addresses.service.js.map