import { IsEmail, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class AddPointsDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsUUID()
    id?: string;

    @IsInt()
    @Min(1)
    points: number;
}
