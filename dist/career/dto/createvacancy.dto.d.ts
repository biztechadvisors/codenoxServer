export declare class CreateVacancyDto {
    title: string;
    description: string;
    employmentType: string;
    salaryRange: string;
    locationId: number;
    shopId: number;
    careerId?: number;
}
export declare class UpdateVacancyDto {
    title?: string;
    description?: string;
    employmentType?: string;
    salaryRange?: string;
    locationId?: number;
    shopId?: number;
    careerId?: number;
}
export declare class FindVacanciesDto {
    city?: string;
    page?: number;
    limit?: number;
}
