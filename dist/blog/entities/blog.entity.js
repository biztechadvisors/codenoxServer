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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blog = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const attachment_entity_1 = require("../../common/entities/attachment.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const region_entity_1 = require("../../region/entities/region.entity");
const tag_entity_1 = require("../../tags/entities/tag.entity");
let Blog = class Blog {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, title: { required: true, type: () => String }, content: { required: true, type: () => String }, date: { required: true, type: () => String }, shop: { required: true, type: () => require("../../shops/entities/shop.entity").Shop }, attachments: { required: false, type: () => [require("../../common/entities/attachment.entity").Attachment] }, region: { required: true, type: () => require("../../region/entities/region.entity").Region }, tags: { required: false, type: () => [require("../../tags/entities/tag.entity").Tag] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Blog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Blog.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Blog.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], Blog.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop, { nullable: false, onDelete: 'CASCADE', onUpdate: "CASCADE" }),
    __metadata("design:type", shop_entity_1.Shop)
], Blog.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => attachment_entity_1.Attachment, { onDelete: "CASCADE", onUpdate: "CASCADE", eager: true }),
    (0, typeorm_1.JoinTable)({
        name: 'blog_attachments',
        joinColumn: { name: 'blogId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'attachmentId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Blog.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => region_entity_1.Region, (region) => region.blogs, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" }),
    __metadata("design:type", region_entity_1.Region)
], Blog.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => tag_entity_1.Tag, { onDelete: "CASCADE", onUpdate: "CASCADE", eager: true }),
    (0, typeorm_1.JoinTable)({
        name: 'blog_tags',
        joinColumn: { name: 'blogId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Blog.prototype, "tags", void 0);
Blog = __decorate([
    (0, typeorm_1.Entity)()
], Blog);
exports.Blog = Blog;
//# sourceMappingURL=blog.entity.js.map