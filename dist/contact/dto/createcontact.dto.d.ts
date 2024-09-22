export declare class CreateContactDto {
    fullName: string;
    phone: string;
    email: string;
    location?: string;
    subject: string;
    message: string;
    shopSlug: string;
}
export declare class UpdateContactDto {
    fullName?: string;
    phone?: string;
    email: string;
    location?: string;
    subject?: string;
    message?: string;
    shopSlug: string;
}
