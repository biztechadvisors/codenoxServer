export class CreateGetInspiredDto {
    title: string;
    type: string;
    shopId: number;
    imageIds: number[];
}

export class UpdateGetInspiredDto {
    title?: string;
    type?: string;
    imageIds?: number[];
}