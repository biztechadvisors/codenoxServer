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
exports.AbandonedCartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cart_entity_1 = require("./entities/cart.entity");
const typeorm_2 = require("typeorm");
const mail_service_1 = require("../mail/mail.service");
let AbandonedCartService = class AbandonedCartService {
    constructor(cartRepository, mailService) {
        this.cartRepository = cartRepository;
        this.mailService = mailService;
    }
    async create(createCartDto) {
        const cartItems = Object.values(createCartDto.cartData);
        const totalQuantity = cartItems.reduce((acc, item) => {
            const quantity = item.quantity;
            acc += quantity;
            return acc;
        }, 0);
        const existingCart = await this.cartRepository.findOne({
            where: {
                email: createCartDto.email
            }
        });
        if (existingCart) {
            await this.cartRepository.update({ id: existingCart.id }, {
                cartData: JSON.stringify(createCartDto.cartData),
                cartQuantity: totalQuantity
            });
        }
        else {
            const newCart = new cart_entity_1.Cart();
            newCart.customerId = createCartDto.customerId;
            newCart.email = createCartDto.email;
            newCart.phone = createCartDto.phone;
            newCart.cartData = JSON.stringify(createCartDto.cartData);
            newCart.cartQuantity = totalQuantity;
            newCart.created_at = new Date();
            newCart.updated_at = new Date();
            await this.cartRepository.save(newCart);
            return newCart;
        }
        return existingCart;
    }
    async getCartData(param) {
        const existingCart = await this.cartRepository.findOne({ where: { customerId: param.customerId, email: param.email } });
        if (!existingCart) {
            return { products: [], totalCount: 0 };
        }
        let existingCartData = {};
        try {
            const exist = JSON.stringify(existingCart.cartData);
            existingCartData = JSON.parse(exist);
        }
        catch (err) {
            console.error(`Error parsing cart data: ${err.message}`);
            return { products: [], totalCount: 0 };
        }
        const products = [];
        let totalCount = 0;
        for (const key in existingCartData) {
            const product = existingCartData[key];
            products.push(product);
            totalCount += product.quantity;
        }
        return { products, totalCount };
    }
    async delete(itemId, query) {
        const itemsId = parseInt(itemId);
        const existingCart = await this.cartRepository.findOne({ where: { email: query.email } });
        if (!existingCart) {
            return { error: 'Cart not found for the provided email' };
        }
        const quantity = query.quantity;
        let existingCartData = {};
        try {
            if (typeof existingCart.cartData === 'object') {
                existingCartData = existingCart.cartData;
            }
            else {
                existingCartData = JSON.parse(existingCart.cartData);
            }
        }
        catch (err) {
            console.error(`Error parsing cart data: ${err.message}`);
            return null;
        }
        let itemRemoved = false;
        let cartQuantity = existingCart.cartQuantity;
        if (quantity) {
            for (let i = 0; i < quantity; i++) {
                if (existingCartData[itemsId]) {
                    if (existingCartData[itemsId].quantity > 1) {
                        existingCartData[itemsId].quantity -= 1;
                        cartQuantity -= 1;
                    }
                    else {
                        delete existingCartData[itemsId];
                        cartQuantity -= 1;
                    }
                    itemRemoved = true;
                }
            }
        }
        if (!quantity) {
            if (existingCartData[itemsId]) {
                if (existingCartData[itemsId].quantity > 1) {
                    existingCartData[itemsId].quantity -= 1;
                    cartQuantity -= 1;
                }
                else {
                    delete existingCartData[itemsId];
                    cartQuantity -= 1;
                }
                itemRemoved = true;
            }
        }
        if (!itemRemoved) {
            return { error: 'Item not found in cart' };
        }
        await this.cartRepository.update({ email: query.email }, {
            cartData: JSON.stringify(existingCartData),
            cartQuantity: cartQuantity,
        });
        return { updatedCart: existingCartData };
    }
    async clearCart(email) {
        const updatedRows = await this.cartRepository.update({ email: email }, { cartData: "{}", cartQuantity: null });
        if (updatedRows.affected > 0) {
            return 'Cart cleared successfully';
        }
        else {
            throw new common_1.NotFoundException('Cart not found');
        }
    }
    async sendAbandonedCartReminder() {
        try {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const abandonedCartData = await this.cartRepository.find({
                where: {
                    updated_at: (0, typeorm_2.LessThan)(twentyFourHoursAgo),
                },
            });
            for (const cart of abandonedCartData) {
                console.log("@working fine for cart data", cart);
                try {
                    const pro = JSON.stringify(cart.cartData);
                    const products = JSON.parse(pro);
                    const email = cart.email;
                    await this.mailService.sendAbandonmenCartReminder(email, products);
                }
                catch (error) {
                    console.log("erroor___________", error);
                }
            }
        }
        catch (error) {
            console.log('Failed to send abandoned cart reminder emails');
        }
    }
};
AbandonedCartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_entity_1.Cart)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        mail_service_1.MailService])
], AbandonedCartService);
exports.AbandonedCartService = AbandonedCartService;
//# sourceMappingURL=carts.service.js.map