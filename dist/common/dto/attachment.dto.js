"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentDTO = void 0;
const openapi = require("@nestjs/swagger");
class AttachmentDTO {
    constructor() {
        this.thumbnail = '';
        this.original = '';
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: false, type: () => Number }, thumbnail: { required: true, type: () => String, default: '' }, original: { required: true, type: () => String, default: '' } };
    }
}
exports.AttachmentDTO = AttachmentDTO;
//# sourceMappingURL=attachment.dto.js.map