"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryAttributesOrderByColumn = exports.QueryAttributesOrderByOrderByClause = exports.GetAttributesArgs = void 0;
const openapi = require("@nestjs/swagger");
class GetAttributesArgs {
    static _OPENAPI_METADATA_FACTORY() {
        return { orderBy: { required: false, type: () => String }, sortedBy: { required: false, type: () => Object }, shop_id: { required: false, type: () => Number }, shopSlug: { required: false, type: () => String }, language: { required: false, type: () => String }, search: { required: false, type: () => Object } };
    }
}
exports.GetAttributesArgs = GetAttributesArgs;
class QueryAttributesOrderByOrderByClause {
    static _OPENAPI_METADATA_FACTORY() {
        return { column: { required: true, enum: require("./get-attributes.dto").QueryAttributesOrderByColumn }, order: { required: true, enum: require("../../common/dto/generic-conditions.dto").SortOrder } };
    }
}
exports.QueryAttributesOrderByOrderByClause = QueryAttributesOrderByOrderByClause;
var QueryAttributesOrderByColumn;
(function (QueryAttributesOrderByColumn) {
    QueryAttributesOrderByColumn["CREATED_AT"] = "CREATED_AT";
    QueryAttributesOrderByColumn["NAME"] = "NAME";
    QueryAttributesOrderByColumn["UPDATED_AT"] = "UPDATED_AT";
})(QueryAttributesOrderByColumn = exports.QueryAttributesOrderByColumn || (exports.QueryAttributesOrderByColumn = {}));
//# sourceMappingURL=get-attributes.dto.js.map