import * as xlsx from 'xlsx';
import { ProductsService } from './products.service';
import { Injectable } from '@nestjs/common';
import { CreateProductDto, VariationDto } from './dto/create-product.dto';

@Injectable()
export class UploadXlService {

    async parseExcelToDto(fileBuffer: Buffer): Promise<CreateProductDto[]> {
        try {
            const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            console.log('worksheet', worksheet)
            const products: CreateProductDto[] = [];

            for (let row = 2; ; row++) {
                const nameCell = worksheet[`A${row}`];
                if (!nameCell) break;

                // Parse data from each column in the row
                const productDto: CreateProductDto = {
                    name: nameCell.v,
                    description: worksheet[`B${row}`].v,
                    product_type: worksheet[`C${row}`].v,
                    status: worksheet[`D${row}`].v,
                    quantity: worksheet[`E${row}`].v,
                    max_price: worksheet[`F${row}`].v,
                    min_price: worksheet[`G${row}`].v,
                    price: worksheet[`H${row}`].v,
                    sale_price: worksheet[`I${row}`].v,
                    unit: worksheet[`J${row}`].v,
                    sku: worksheet[`K${row}`].v,
                    language: worksheet[`L${row}`].v,
                    categories: worksheet[`M${row}`].v.split(',').map(category => parseInt(category.trim())),
                    tags: worksheet[`N${row}`].v.split(',').map(tag => parseInt(tag.trim())),
                    type_id: worksheet[`O${row}`].v,
                    shop_id: worksheet[`P${row}`].v,
                    taxes: this.parseTax(worksheet[`Q${row}`].v),
                    variations: this.parseVariations(worksheet[`R${row}`].v),
                    variation_options: this.parseVariationOptions(worksheet[`S${row}`].v),
                    related_products: [],
                    translated_languages: []
                };

                products.push(productDto);
            }

            return products;
        } catch (error) {
            throw new Error('Error parsing Excel file: ' + error.message);
        }
    }

    parseVariationOptions(v: any): { delete: any; upsert: VariationDto[]; } {
        // Implement logic to parse variation options
        return { delete: null, upsert: [] };
    }

    parseVariations(v: any): any[] {
        // Implement logic to parse variations
        return [];
    }

    parseTax(v: any): any {
        // Implement logic to parse tax
        return null;
    }

    async uploadProductsFromExcel(fileBuffer: Buffer): Promise<void> {
        try {
            console.log('file**', fileBuffer)
            const products = await this.parseExcelToDto(fileBuffer);
            for (const product of products) {
                await this.productsService.create(product);
            }
        } catch (error) {
            throw new Error('Error uploading products from Excel: ' + error.message);
        }
    }

    constructor(private productsService: ProductsService) { }
}
