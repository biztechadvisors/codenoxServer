import { CustomRepository } from "src/typeorm-ex/typeorm-ex.decorator";
import { Repository } from "typeorm";
import { File, OrderProductPivot, Product, Variation, VariationOption } from "./entities/product.entity";


@CustomRepository(Product)
export class ProductRepository extends Repository<Product> { }

@CustomRepository(OrderProductPivot)
export class OrderProductPivotRepository extends Repository<OrderProductPivot> { }

@CustomRepository(Variation)
export class VariationRepository extends Repository<Variation> { }

@CustomRepository(VariationOption)
export class VariationOptionRepository extends Repository<VariationOption> { }

@CustomRepository(File)
export class FileRepository extends Repository<File> { }