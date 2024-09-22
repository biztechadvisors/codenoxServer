"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToSlug = void 0;
function convertToSlug(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}
exports.convertToSlug = convertToSlug;
module.exports = {
    convertToSlug,
};
//# sourceMappingURL=index.js.map