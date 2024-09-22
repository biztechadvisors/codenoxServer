export declare class CreateCareerDto {
    fullName: string;
    phone: string;
    email: string;
    position: string;
    location: string;
    cv_resume?: string;
    shopSlug: string;
    locationId: number;
    vacancyId: number;
}
export declare class UpdateCareerDto {
    fullName?: string;
    phone?: string;
    email?: string;
    position?: string;
    location?: string;
    cv_resume?: string;
    shopSlug?: string;
}
