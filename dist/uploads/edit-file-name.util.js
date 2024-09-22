"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editFileName = void 0;
function editFileName(req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
}
exports.editFileName = editFileName;
//# sourceMappingURL=edit-file-name.util.js.map