export declare class CreateRegionDto {
    name: string;
    shop_id: number;
}
declare const UpdateRegionDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateRegionDto>>;
export declare class UpdateRegionDto extends UpdateRegionDto_base {
}
export {};
