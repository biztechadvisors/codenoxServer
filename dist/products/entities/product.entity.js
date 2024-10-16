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
var Product_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariationOption = exports.Variation = exports.File = exports.OrderProductPivot = exports.Product = exports.ProductType = void 0;
const openapi = require("@nestjs/swagger");
const attribute_value_entity_1 = require("../../attributes/entities/attribute-value.entity");
const category_entity_1 = require("../../categories/entities/category.entity");
const attachment_entity_1 = require("../../common/entities/attachment.entity");
const core_entity_1 = require("../../common/entities/core.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const tag_entity_1 = require("../../tags/entities/tag.entity");
const type_entity_1 = require("../../types/entities/type.entity");
const review_entity_1 = require("../../reviews/entities/review.entity");
const typeorm_1 = require("typeorm");
const tax_entity_1 = require("../../taxes/entities/tax.entity");
const stocksOrd_entity_1 = require("../../stocks/entities/stocksOrd.entity");
const region_entity_1 = require("../../region/entities/region.entity");
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["PUBLISH"] = "Publish";
    ProductStatus["DRAFT"] = "Draft";
})(ProductStatus || (ProductStatus = {}));
var ProductType;
(function (ProductType) {
    ProductType["SIMPLE"] = "simple";
    ProductType["VARIABLE"] = "variable";
})(ProductType = exports.ProductType || (exports.ProductType = {}));
let Product = Product_1 = class Product extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, slug: { required: true, type: () => String }, type_id: { required: true, type: () => Number }, product_type: { required: true, enum: require("./product.entity").ProductType }, type: { required: true, type: () => require("../../types/entities/type.entity").Type, nullable: true }, regions: { required: true, type: () => [require("../../region/entities/region.entity").Region] }, categories: { required: true, type: () => [require("../../categories/entities/category.entity").Category] }, subCategories: { required: true, type: () => [require("../../categories/entities/category.entity").SubCategory] }, tags: { required: true, type: () => [require("../../tags/entities/tag.entity").Tag] }, variations: { required: false, type: () => [require("../../attributes/entities/attribute-value.entity").AttributeValue] }, variation_options: { required: true, type: () => [require("./product.entity").Variation] }, pivot: { required: false, type: () => [require("./product.entity").OrderProductPivot] }, orders: { required: true, type: () => [require("../../orders/entities/order.entity").Order] }, stocksSellOrders: { required: true, type: () => [require("../../stocks/entities/stocksOrd.entity").StocksSellOrd] }, shop: { required: true, type: () => require("../../shops/entities/shop.entity").Shop }, shop_id: { required: true, type: () => Number }, related_products: { required: false, type: () => [require("./product.entity").Product] }, my_review: { required: false, type: () => [require("../../reviews/entities/review.entity").Review] }, taxes: { required: true, type: () => require("../../taxes/entities/tax.entity").Tax }, gallery: { required: false, type: () => [require("../../common/entities/attachment.entity").Attachment] }, image: { required: false, type: () => require("../../common/entities/attachment.entity").Attachment }, description: { required: true, type: () => String }, in_stock: { required: true, type: () => Boolean }, is_taxable: { required: true, type: () => Boolean }, sale_price: { required: false, type: () => Number }, max_price: { required: false, type: () => Number }, min_price: { required: false, type: () => Number }, sku: { required: false, type: () => String }, status: { required: true, enum: ProductStatus }, height: { required: false, type: () => String }, length: { required: false, type: () => String }, width: { required: false, type: () => String }, price: { required: false, type: () => Number }, quantity: { required: true, type: () => Number }, unit: { required: true, type: () => String }, ratings: { required: true, type: () => Number }, in_wishlist: { required: true, type: () => Boolean }, language: { required: false, type: () => String }, Google_Shopping: { required: false, type: () => String }, translated_languages: { required: false, type: () => [String] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Product.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Product.prototype, "type_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "product_type", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => type_entity_1.Type, (type) => type.products),
    (0, typeorm_1.JoinColumn)({ name: 'typeId' }),
    __metadata("design:type", type_entity_1.Type)
], Product.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => region_entity_1.Region, (region) => region.products, { nullable: true }),
    (0, typeorm_1.JoinTable)({
        name: 'product_regions',
        joinColumn: { name: 'productId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'regionId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Product.prototype, "regions", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => category_entity_1.Category, (category) => category.products, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    }),
    (0, typeorm_1.JoinTable)({ name: 'product_category' }),
    __metadata("design:type", Array)
], Product.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => category_entity_1.SubCategory, (subCategory) => subCategory.products),
    (0, typeorm_1.JoinTable)({ name: 'product_subcategory' }),
    __metadata("design:type", Array)
], Product.prototype, "subCategories", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => tag_entity_1.Tag, (tag) => tag.products, { cascade: true }),
    (0, typeorm_1.JoinTable)({ name: 'product_tags' }),
    __metadata("design:type", Array)
], Product.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => attribute_value_entity_1.AttributeValue),
    (0, typeorm_1.JoinTable)({ name: 'products_attributeValue' }),
    __metadata("design:type", Array)
], Product.prototype, "variations", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Variation, { cascade: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinTable)({
        name: 'products_variationOptions',
        joinColumn: { name: 'productId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'variationId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Product.prototype, "variation_options", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => OrderProductPivot, (orderProductPivot) => orderProductPivot.product),
    __metadata("design:type", Array)
], Product.prototype, "pivot", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => order_entity_1.Order, (order) => order.products),
    __metadata("design:type", Array)
], Product.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => stocksOrd_entity_1.StocksSellOrd, (stocksSellOrd) => stocksSellOrd.products),
    __metadata("design:type", Array)
], Product.prototype, "stocksSellOrders", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop, (shop) => shop.products),
    __metadata("design:type", shop_entity_1.Shop)
], Product.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Product.prototype, "shop_id", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Product_1, { cascade: true }),
    (0, typeorm_1.JoinTable)({ name: 'products_relatedProducts' }),
    __metadata("design:type", Array)
], Product.prototype, "related_products", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_entity_1.Review, (review) => review.product, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], Product.prototype, "my_review", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tax_entity_1.Tax, (tax) => tax.products),
    __metadata("design:type", tax_entity_1.Tax)
], Product.prototype, "taxes", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => attachment_entity_1.Attachment),
    (0, typeorm_1.JoinTable)({ name: 'products_gallery' }),
    __metadata("design:type", Array)
], Product.prototype, "gallery", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => attachment_entity_1.Attachment, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'image_id' }),
    __metadata("design:type", attachment_entity_1.Attachment)
], Product.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Product.prototype, "in_stock", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Product.prototype, "is_taxable", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Product.prototype, "sale_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Product.prototype, "max_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Product.prototype, "min_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "sku", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "height", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "length", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "width", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Product.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Product.prototype, "ratings", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Product.prototype, "in_wishlist", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "Google_Shopping", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Array)
], Product.prototype, "translated_languages", void 0);
Product = Product_1 = __decorate([
    (0, typeorm_1.Entity)()
], Product);
exports.Product = Product;
let OrderProductPivot = class OrderProductPivot extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, variation_option_id: { required: false, type: () => Number }, order_quantity: { required: true, type: () => Number }, unit_price: { required: true, type: () => Number }, subtotal: { required: true, type: () => Number }, order: { required: true, type: () => require("../../orders/entities/order.entity").Order }, product: { required: true, type: () => require("./product.entity").Product }, StocksSellOrd: { required: true, type: () => require("../../stocks/entities/stocksOrd.entity").StocksSellOrd }, Ord_Id: { required: true, type: () => Number } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrderProductPivot.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], OrderProductPivot.prototype, "variation_option_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], OrderProductPivot.prototype, "order_quantity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], OrderProductPivot.prototype, "unit_price", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], OrderProductPivot.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.Order, (order) => order.orderProductPivots, {
        cascade: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'order_id' }),
    __metadata("design:type", order_entity_1.Order)
], OrderProductPivot.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product, (product) => product.pivot, {
        cascade: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", Product)
], OrderProductPivot.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => stocksOrd_entity_1.StocksSellOrd, (stocksSellOrd) => stocksSellOrd.products),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", stocksOrd_entity_1.StocksSellOrd)
], OrderProductPivot.prototype, "StocksSellOrd", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], OrderProductPivot.prototype, "Ord_Id", void 0);
OrderProductPivot = __decorate([
    (0, typeorm_1.Entity)()
], OrderProductPivot);
exports.OrderProductPivot = OrderProductPivot;
let File = class File extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, attachment_id: { required: true, type: () => require("../../common/entities/attachment.entity").Attachment }, url: { required: true, type: () => String }, fileable_id: { required: true, type: () => Number } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], File.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => attachment_entity_1.Attachment),
    __metadata("design:type", attachment_entity_1.Attachment)
], File.prototype, "attachment_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], File.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], File.prototype, "fileable_id", void 0);
File = __decorate([
    (0, typeorm_1.Entity)()
], File);
exports.File = File;
let Variation = class Variation {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, title: { required: true, type: () => String }, name: { required: true, type: () => String }, slug: { required: true, type: () => String }, price: { required: true, type: () => Number }, sku: { required: false, type: () => String }, is_disable: { required: true, type: () => Boolean }, sale_price: { required: false, type: () => Number }, quantity: { required: true, type: () => Number }, options: { required: true, type: () => [require("./product.entity").VariationOption] }, image: { required: false, type: () => [require("../../common/entities/attachment.entity").Attachment] }, value: { required: true, type: () => String }, meta: { required: true, type: () => String }, created_at: { required: true, type: () => Date }, updated_at: { required: true, type: () => Date } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Variation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Variation.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Variation.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Variation.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Variation.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Variation.prototype, "sku", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Variation.prototype, "is_disable", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Variation.prototype, "sale_price", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Variation.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => VariationOption, {
        onDelete: 'CASCADE',
        cascade: ['insert', 'update'],
    }),
    (0, typeorm_1.JoinTable)({ name: 'variation_variationOption' }),
    __metadata("design:type", Array)
], Variation.prototype, "options", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => attachment_entity_1.Attachment),
    (0, typeorm_1.JoinTable)({ name: 'Variation_image' }),
    __metadata("design:type", Array)
], Variation.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Variation.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Variation.prototype, "meta", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Variation.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Variation.prototype, "updated_at", void 0);
Variation = __decorate([
    (0, typeorm_1.Entity)()
], Variation);
exports.Variation = Variation;
let VariationOption = class VariationOption {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, value: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VariationOption.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VariationOption.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VariationOption.prototype, "value", void 0);
VariationOption = __decorate([
    (0, typeorm_1.Entity)()
], VariationOption);
exports.VariationOption = VariationOption;
//# sourceMappingURL=product.entity.js.map