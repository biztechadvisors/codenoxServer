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
exports.AuthorsService = void 0;
const common_1 = require("@nestjs/common");
const author_entity_1 = require("./entities/author.entity");
const fuse_js_1 = __importDefault(require("fuse.js"));
const paginate_1 = require("../common/pagination/paginate");
const typeorm_1 = require("@nestjs/typeorm");
const helpers_1 = require("../helpers");
const setting_entity_1 = require("../settings/entities/setting.entity");
const typeorm_2 = require("typeorm");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const options = {
    keys: ['name', 'slug'],
    threshold: 0.3,
};
let AuthorsService = class AuthorsService {
    constructor(authorRepository, shopSocialsRepository, attachmentRepository) {
        this.authorRepository = authorRepository;
        this.shopSocialsRepository = shopSocialsRepository;
        this.attachmentRepository = attachmentRepository;
    }
    async convertToSlug(text) {
        return await (0, helpers_1.convertToSlug)(text);
    }
    async create(createAuthorDto) {
        try {
            const newAuthor = new author_entity_1.Author();
            const socials = [];
            if (createAuthorDto.socials) {
                for (const social of createAuthorDto.socials) {
                    const newSocial = this.shopSocialsRepository.create(social);
                    const socialId = await this.shopSocialsRepository.save(newSocial);
                    socials.push(socialId);
                }
            }
            newAuthor.socials = socials;
            newAuthor.id = createAuthorDto.id;
            newAuthor.name = createAuthorDto.name;
            newAuthor.slug = await this.convertToSlug(createAuthorDto.name);
            newAuthor.bio = createAuthorDto.bio;
            newAuthor.born = createAuthorDto.born;
            newAuthor.death = createAuthorDto.death;
            newAuthor.translated_languages = createAuthorDto.translated_languages;
            newAuthor.languages = createAuthorDto.languages;
            newAuthor.quote = createAuthorDto.quote;
            newAuthor.cover_image = createAuthorDto.cover_image;
            newAuthor.image = createAuthorDto.image;
            newAuthor.language = createAuthorDto.language;
            newAuthor.translated_languages = createAuthorDto.translated_languages;
            const AuthorId = await this.authorRepository.save(newAuthor);
            if (AuthorId.socials) {
                AuthorId.socials.map((social) => social.id);
            }
            else {
                console.log("AuthorId socials is undefined or null");
            }
            return newAuthor;
        }
        catch (error) {
            console.log(error);
        }
    }
    async getAuthors({ page, limit, search, is_approved }) {
        var _a;
        page = page || 1;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        let data = await this.authorRepository.find({
            relations: ['socials']
        });
        const fuse = new fuse_js_1.default(data, options);
        if (search) {
            const parseSearchParams = search.split(';');
            for (const searchParam of parseSearchParams) {
                const [key, value] = searchParam.split(':');
                data = (_a = fuse.search(value)) === null || _a === void 0 ? void 0 : _a.map(({ item }) => item);
            }
        }
        if (is_approved) {
            const approvedData = await this.authorRepository.find({
                where: { is_approved: true }
            });
            data = approvedData;
        }
        const results = data.slice(startIndex, endIndex);
        const queryParams = [
            search ? `search=${encodeURIComponent(search)}` : '',
            `limit=${limit}`
        ]
            .filter(Boolean)
            .join('&');
        const url = `/authors?${queryParams}`;
        return Object.assign({ data: results }, (0, paginate_1.paginate)(data.length, page, limit, results.length, url));
    }
    async getAuthorBySlug(slug) {
        const findAuthor = await this.authorRepository.findOne({
            where: { slug: slug },
            relations: ['socials', 'image', 'cover_image']
        });
        return findAuthor;
    }
    async getTopAuthors({ limit = 10 }) {
        const topAuthors = await this.authorRepository.find({
            take: limit
        });
        return topAuthors;
    }
    async update(id, updateAuthorDto) {
        var _a;
        const author = await this.authorRepository.findOne({
            where: { id: id },
            relations: ['socials', 'image', 'cover_image']
        });
        if (author) {
            author.is_approved = (_a = updateAuthorDto.is_approved) !== null && _a !== void 0 ? _a : true;
            if (updateAuthorDto) {
                author.bio = updateAuthorDto.bio;
                author.quote = updateAuthorDto.quote;
                author.born = updateAuthorDto.born;
                author.death = updateAuthorDto.death;
                author.language = updateAuthorDto.language;
                author.languages = updateAuthorDto.languages;
                author.name = updateAuthorDto.name;
                author.slug = await this.convertToSlug(updateAuthorDto.name);
                author.translated_languages = updateAuthorDto.translated_languages;
            }
            if (updateAuthorDto.socials) {
                const socials = [];
                for (const updateSocial of updateAuthorDto.socials) {
                    const existingSocial = updateAuthorDto.socials.find((social) => social.icon === updateSocial.icon);
                    if (existingSocial) {
                        const final = this.shopSocialsRepository.create(Object.assign(Object.assign({}, existingSocial), updateSocial));
                        const updatedSocial = await this.shopSocialsRepository.save(final);
                        socials.push(updatedSocial);
                    }
                    else {
                        const newSocial = this.shopSocialsRepository.create(Object.assign({}, updateSocial));
                        const savedSocial = await this.shopSocialsRepository.save(newSocial);
                        socials.push(savedSocial);
                    }
                }
                author.socials = socials;
            }
            else {
                throw new common_1.NotFoundException("Invalid action Performed");
            }
            if (updateAuthorDto.image) {
                try {
                    const updateLogo = await this.attachmentRepository.findOne({
                        where: { id: author.image.id }
                    });
                    if (updateLogo) {
                        const findAttachment = await this.attachmentRepository.findOne({
                            where: { original: updateLogo.original }
                        });
                        await this.attachmentRepository.delete(findAttachment);
                        await this.attachmentRepository.delete(updateLogo);
                        const updates = this.attachmentRepository.create(updateAuthorDto.image);
                        await this.attachmentRepository.save(updates);
                    }
                    else {
                        const updates = this.attachmentRepository.create(updateAuthorDto.image);
                        await this.attachmentRepository.save(updates);
                    }
                }
                catch (error) {
                    console.error("Error saving logo:", error);
                    throw new common_1.NotFoundException("Invalid action Performed");
                }
            }
            const updatedAuthor = await this.authorRepository.save(author);
            return updatedAuthor;
        }
    }
    async remove(id) {
        try {
            const findId = await this.authorRepository.findOne({
                where: { id: id },
                relations: ['image', 'cover_image', 'socials']
            });
            if (findId) {
                await this.authorRepository.delete(findId.id);
                if (findId.cover_image) {
                    const findCoverImageId = await this.attachmentRepository.findOne({
                        where: { id: findId.cover_image.id }
                    });
                    await this.attachmentRepository.delete(findCoverImageId);
                }
                if (findId.image) {
                    const findImageId = await this.attachmentRepository.findOne({
                        where: { id: findId.image.id }
                    });
                    await this.attachmentRepository.delete(findImageId);
                }
                if (findId.socials) {
                    for (const id of findId.socials) {
                        const findSocialId = await this.shopSocialsRepository.findOne({
                            where: { id: id.id }
                        });
                        await this.shopSocialsRepository.delete(findSocialId);
                    }
                }
                return findId;
            }
            else {
                const findIds = await this.shopSocialsRepository.find({
                    where: { id: id }
                });
                return findIds;
            }
        }
        catch (error) {
            throw new common_1.NotFoundException(error);
        }
    }
};
AuthorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(author_entity_1.Author)),
    __param(1, (0, typeorm_1.InjectRepository)(setting_entity_1.ShopSocials)),
    __param(2, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuthorsService);
exports.AuthorsService = AuthorsService;
//# sourceMappingURL=authors.service.js.map