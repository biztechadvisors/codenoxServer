/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import * as XLSX from 'xlsx'
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import {
  CreateProductDto,
  VariationDto,
  VariationOptionDto,
} from './dto/create-product.dto'
import { ProductsService } from './products.service'
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity'
import { Tax } from 'src/taxes/entities/tax.entity'
import { InjectRepository } from '@nestjs/typeorm'
import {
  OrderProductPivot,
  Product,
  ProductType,
  Variation,
  VariationOption,
} from './entities/product.entity'
import { Attachment } from 'src/common/entities/attachment.entity'
import { Tag } from 'src/tags/entities/tag.entity'
import { Type } from 'src/types/entities/type.entity'
import { Shop } from 'src/shops/entities/shop.entity'
import { Category, SubCategory } from 'src/categories/entities/category.entity'
import {
  Dealer,
  DealerCategoryMargin,
  DealerProductMargin,
} from 'src/users/entities/dealer.entity'
import { User } from 'src/users/entities/user.entity'
import { Repository } from 'typeorm'

@Injectable()
export class UploadXlService {
  logger: any
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(OrderProductPivot)
    private readonly orderProductPivotRepository: Repository<OrderProductPivot>,
    @InjectRepository(Variation)
    private readonly variationRepository: Repository<Variation>,
    @InjectRepository(VariationOption)
    private readonly variationOptionRepository: Repository<VariationOption>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Type) private readonly typeRepository: Repository<Type>,
    @InjectRepository(Shop) private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(AttributeValue)
    private readonly attributeValueRepository: Repository<AttributeValue>,
    @InjectRepository(Dealer)
    private readonly dealerRepository: Repository<Dealer>,
    @InjectRepository(DealerProductMargin)
    private readonly dealerProductMarginRepository: Repository<DealerProductMargin>,
    @InjectRepository(DealerCategoryMargin)
    private readonly dealerCategoryMarginRepository: Repository<DealerCategoryMargin>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Tax) private readonly taxRepository: Repository<Tax>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
  ) { }

  async generateSKU(productName: any): Promise<string> {
    // Ensure productName is a string
    const name =
      typeof productName === 'string' ? productName : String(productName)

    // Get the first 3-5 letters from the product name, remove spaces, and make it uppercase
    const namePart = name.replace(/\s+/g, '').substring(0, 5).toUpperCase()

    // Get the current timestamp in milliseconds
    const timestamp = Date.now()

    // Combine the name part and the timestamp to form the SKU
    const sku = `${namePart}-${timestamp}`

    return sku
  }

  async parseExcelToDto(fileBuffer: Buffer, shopSlug: string): Promise<any[]> {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      if (!worksheet) {
        throw new Error('Invalid worksheet data.')
      }

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error('Invalid JSON data.')
      }

      const headerRow: any[] = jsonData[0] as any[]
      const rows: any[][] = jsonData.slice(1) as any[][]
      const products: Record<string, any> = {}

      for (const row of rows) {
        if (headerRow.length === 0 || row.length === 0) {
          continue // Skip empty rows
        }

        const productType = row[headerRow.indexOf('Product Type')]

        if (productType === 'child' || productType === 'Child') {
          const parentId = row[headerRow.indexOf('Parent ID')]
          if (!parentId || !products[parentId]) {
            console.error(
              new Error(`Invalid parent ID ${parentId} for variant.`),
            )
            return
          }

          // Initialize variations array if not already initialized
          if (!products[parentId].variations) {
            products[parentId].variations = []
          }

          // Initialize variation_options array if not already initialized
          if (!products[parentId].variation_options) {
            products[parentId].variation_options = { delete: [], upsert: [] }
          }

          const variationOptions = await this.createVariation(row, headerRow)

          const variations = await this.getVariations(row, headerRow)

          const attributes = await this.parseAttributes(row, headerRow)

          products[parentId].attributes.push(attributes)
          products[parentId].variations.push(...variations)

          products[parentId].variation_options.upsert.push(variationOptions)
        } else if (productType === 'parent' || productType === 'Parent') {
          const productIdIndex = headerRow.indexOf('Product ID')

          const productId = row[productIdIndex]

          // Collect variations for the parent
          const parentVariations = []

          for (const childRow of rows) {
            const childProductType = childRow[headerRow.indexOf('Product Type')]
            const childParentId = childRow[headerRow.indexOf('Parent ID')]

            if (
              (childProductType === 'child' || childProductType === 'Child') &&
              childParentId === productId
            ) {
              const variationOptions = await this.createVariation(
                childRow,
                headerRow,
              )
              parentVariations.push(variationOptions)
            }
          }

          const mainProduct = await this.createMainProduct(
            row,
            headerRow,
            shopSlug,
            parentVariations,
          )

          // Initialize variations array
          mainProduct.variations = []
          mainProduct.attributes = []

          // Initialize variation options
          mainProduct.variation_options = { delete: [], upsert: [] }
          products[productId] = mainProduct
        }
      }
      const finalProducts = Object.values(products)

      return finalProducts
    } catch (error) {
      console.error(`Error parsing Excel file: ${error.message}`)
      throw new Error('Error parsing Excel file.')
    }
  }

  async createMainProduct(
    row: any,
    headerRow: any,
    shopSlug: string,
    variations: any[],
  ): Promise<any> {
    const category = []
    const subCategories = []
    const tags = []

    // Fetch categories
    if (row[headerRow.indexOf('Product Category')]) {
      const categoryNames = row[headerRow.indexOf('Product Category')]
        .split(',')
        .map((name) => name.trim())
      for (const categoryName of categoryNames) {
        const categoryRecord = await this.categoryRepository.findOne({
          where: { name: categoryName },
        })
        if (categoryRecord) {
          category.push(categoryRecord.id)
        } else {
          console.warn(`Category '${categoryName}' not found in the database`)
        }
      }
    }

    // Fetch subcategories
    if (row[headerRow.indexOf('Product SubCategory')]) {
      const subCategoryNames = row[headerRow.indexOf('Product SubCategory')]
        .split(',')
        .map((name) => name.trim())
      for (const subCategoryName of subCategoryNames) {
        const subCategoryRecord = await this.subCategoryRepository.findOne({
          where: { name: subCategoryName },
        })
        if (subCategoryRecord) {
          subCategories.push(subCategoryRecord.id)
        } else {
          console.warn(
            `SubCategory '${subCategoryName}' not found in the database`,
          )
        }
      }
    }

    // Fetch tags
    if (row[headerRow.indexOf('Product Tags')]) {
      const tagNames = row[headerRow.indexOf('Product Tags')]
        .split(',')
        .map((name) => name.trim())
      for (const tagName of tagNames) {
        const tagRecord = await this.tagRepository.findOne({
          where: { name: tagName },
        })
        if (tagRecord) {
          tags.push(tagRecord.id)
        } else {
          console.warn(`Tag '${tagName}' not found in the database`)
        }
      }
    }

    // Fetch type
    let type = null
    if (row[headerRow.indexOf('Product Collection')]) {
      type = await this.typeRepository.findOne({
        where: { name: row[headerRow.indexOf('Product Collection')] },
      })
      if (!type) {
        console.warn(
          `Type '${row[headerRow.indexOf('Product Collection')]
          }' not found in the database`,
        )
      }
    }

    // Fetch shop
    let shop = null
    if (shopSlug) {
      shop = await this.shopRepository.findOne({ where: { slug: shopSlug } })
      if (!shop) {
        throw new Error(`Shop with slug '${shopSlug}' not found`)
      }
    }

    // Collect all variation prices and sum the quantities
    const prices: number[] = []
    let totalQuantity = 0
    variations.forEach((variation) => {
      if (variation.sale_price !== undefined && variation.sale_price !== null) {
        prices.push(parseFloat(variation.sale_price))
      }
      if (variation.price !== undefined && variation.price !== null) {
        prices.push(parseFloat(variation.price))
      }
      totalQuantity += parseInt(variation.quantity, 10)
    })

    // Calculate min and max prices
    const min_price = prices.length > 0 ? Math.min(...prices) : 0
    const max_price = prices.length > 0 ? Math.max(...prices) : 0

    // Handle undefined optional values gracefully
    const status = row[headerRow.indexOf('Product Status')] || 'Published'
    const unit = row[headerRow.indexOf('Product Unit')] || 1
    const sku =
      row[headerRow.indexOf('Product SKU')] ||
      this.generateSKU(row[headerRow.indexOf('Product Name')])
    const price = parseFloat(row[headerRow.indexOf('Price')] || '0')
    const salePrice = parseFloat(row[headerRow.indexOf('Sale Price')] || '0')
    const height = row[headerRow.indexOf('Height')] || 1
    const length = row[headerRow.indexOf('Length')] || 1
    const width = row[headerRow.indexOf('Width')] || 1

    return {
      name: row[headerRow.indexOf('Product Name')],
      description: row[headerRow.indexOf('Product Description')],
      product_type: 'variable',
      status: status,
      quantity: totalQuantity,
      min_price: min_price,
      max_price: max_price,
      price: price,
      sale_price: salePrice,
      unit: unit,
      sku: sku,
      category: category, // Array of category IDs
      subCategories: subCategories, // Array of subcategory IDs
      type_id: type ? type.id : null, // Type ID if found
      shop_id: shop ? shop.id : null, // Shop ID
      tags: tags, // Array of tag IDs
      variations: variations,
      attributes: [],
      variation_options: {
        delete: [],
        upsert: [],
      },
      height: height,
      length: length,
      width: width,
      related_products: [],
      translated_languages: [],
    }
  }

  // Utility to split attribute values by comma, slash, pipe, or backslash
  splitAttributeValues(value: string): string[] {
    return value
      .split(/[,\|\/\\]/) // Split by comma, pipe, slash, or backslash
      .map((v) => v.trim()) // Trim whitespace
      .filter(Boolean) // Filter out empty values
  }

  async findAttributeValue(
    attributeValue: string,
  ): Promise<AttributeValue | undefined> {
    return this.attributeValueRepository.findOne({
      where: { value: attributeValue },
    })
  }

  async createVariation(row: any, headerRow: any): Promise<any> {
    const options: VariationOptionDto[] = await this.createVariationOptions(
      row,
      headerRow,
    )
    // Build the title from attribute values
    let title = ''
    let i = 1
    while (
      row[headerRow.indexOf(`Attribute ${i} Name`)] !== undefined &&
      row[headerRow.indexOf(`Attribute ${i} Value`)] !== undefined
    ) {
      let attributeValue = row[headerRow.indexOf(`Attribute ${i} Value`)]

      attributeValue = this.splitAttributeValues(attributeValue)
      attributeValue.forEach((element) => {
        if (element) {
          if (title) {
            title += '/'
          }
          title += element
        }
      })
      i++
    }

    return {
      is_digital: row[headerRow.indexOf('Is Digital')] === true,
      sku:
        row[headerRow.indexOf('Product SKU')] ||
        this.generateSKU(row[headerRow.indexOf('Product Name')]),
      name: row[headerRow.indexOf('Product Name')],
      quantity: parseInt(row[headerRow.indexOf('Child Inventory')]),
      sale_price: parseFloat(row[headerRow.indexOf('Sale Price')]),
      price: parseFloat(row[headerRow.indexOf('Price')]),
      is_disable: row[headerRow.indexOf('Is Disable')] === true,
      title,
      options,
      id: null,
    }
  }

  async getVariations(
    row: any,
    headerRow: any,
  ): Promise<{ attribute_value_id: number }[]> {
    const variations: { attribute_value_id: number }[] = []
    let i = 1

    while (
      row[headerRow.indexOf(`Attribute ${i} Name`)] !== undefined &&
      row[headerRow.indexOf(`Attribute ${i} Value`)] !== undefined
    ) {
      const attributeName = row[headerRow.indexOf(`Attribute ${i} Name`)]
      let attributeValue = row[headerRow.indexOf(`Attribute ${i} Value`)]
      attributeValue = this.splitAttributeValues(attributeValue)

      if (attributeName && attributeValue) {
        for (const element of attributeValue) {
          // Use for...of loop
          const fetchedAttributeValue = await this.findAttributeValue(element)
          if (!fetchedAttributeValue) {
            console.warn(`Attribute value '${element}' not found.`)
          } else if (fetchedAttributeValue) {
            variations.push({ attribute_value_id: fetchedAttributeValue.id })
          }
        }
      }
      i++
    }
    return variations
  }

  async parseAttributes(
    row: any,
    headerRow: any,
  ): Promise<Record<string, number[]>> {
    const attributes: Record<string, number[]> = {} // Change to store arrays of IDs
    let i = 1

    while (
      row[headerRow.indexOf(`Attribute ${i} Name`)] !== undefined &&
      row[headerRow.indexOf(`Attribute ${i} Value`)] !== undefined
    ) {
      const attributeName = row[headerRow.indexOf(`Attribute ${i} Name`)]
      let attributeValue = row[headerRow.indexOf(`Attribute ${i} Value`)]

      // Split the attribute values
      attributeValue = this.splitAttributeValues(attributeValue)

      if (attributeName && attributeValue) {
        for (const element of attributeValue) {
          const fetchedAttributeValue = await this.findAttributeValue(element)
          if (!fetchedAttributeValue) {
            console.warn(`Attribute value '${element}' not found.`)
          }

          // Initialize the attribute entry if it doesn't exist
          if (!attributes[attributeName]) {
            attributes[attributeName] = [] // Initialize as an array
          }

          if (fetchedAttributeValue) {
            // Push the fetched attribute value ID into the array
            attributes[attributeName].push(fetchedAttributeValue.id)
          }
        }
      }
      i++
    }
    return attributes // Return the attributes object with all IDs
  }

  async createVariationOptions(
    row: any,
    headerRow: any,
  ): Promise<VariationOptionDto[]> {
    const variationOptions = []
    let i = 1

    while (
      row[headerRow.indexOf(`Attribute ${i} Name`)] !== undefined &&
      row[headerRow.indexOf(`Attribute ${i} Value`)] !== undefined
    ) {
      const attributeName = row[headerRow.indexOf(`Attribute ${i} Name`)]
      let attributeValue = row[headerRow.indexOf(`Attribute ${i} Value`)]
      attributeValue = this.splitAttributeValues(attributeValue) // Split attribute values

      if (attributeName && attributeValue) {
        for (const element of attributeValue) {
          // Use for...of for async/await
          const attribute = await this.attributeValueRepository.findOne({
            where: { value: element },
          })
          if (attribute) {
            variationOptions.push({
              name: attributeName,
              value: element,
            })
          } else {
            // Log a warning or handle the case where the attribute value is not found
            console.warn(`Attribute value '${element}' not found.`)
          }
        }
      }
      i++
    }
    return variationOptions
  }

  async uploadProductsFromExcel(
    fileBuffer: Buffer,
    shopSlug: string,
  ): Promise<void> {
    try {
      const products = await this.parseExcelToDto(fileBuffer, shopSlug)

      if (products && products.length > 0) {
        for (const product of products) {
          await this.saveProducts(product)
        }
      } else {
        this.logger.warn('No products found in Excel file.') // Use logger here
      }
    } catch (error) {
      this.logger.error(`Error uploading products from Excel: ${error.message}`)
      throw new Error('Error uploading products from Excel.')
    }
  }

  async saveProducts(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const existingProduct = await this.productRepository.findOne({
        where: [
          { name: createProductDto.name },
          { slug: createProductDto.slug },
        ],
        relations: [
          'type',
          'shop',
          'image',
          'categories',
          'tags',
          'gallery',
          'related_products',
          'variations',
          'variation_options',
          'subCategories',
        ],
      })

      if (existingProduct) {
        // Fetch related variations and their options
        const variations = await Promise.all(
          existingProduct.variation_options.map(async (v) => {
            const variation = await this.variationRepository.findOne({
              where: { id: v.id },
              relations: ['options', 'image'],
            })

            if (!variation) {
              throw new NotFoundException(`Variation with ID ${v.id} not found`)
            }

            return variation
          }),
        )
        existingProduct.variation_options = []
        existingProduct.variations = []

        await this.productRepository.save(existingProduct)

        // Delete variation options and images
        await Promise.all([
          ...variations.flatMap((v) =>
            v.options ? [this.variationOptionRepository.remove(v.options)] : [],
          ),
          ...variations.map(async (v) => {
            if (v.image) {
              const image = v.image
              v.image = null // Unlink the image from the variation
              await this.variationRepository.save(v) // Save the variation without the image
              const attachment = await this.attachmentRepository.findOne({
                where: { id: image.id },
              })
              if (attachment) {
                await this.attachmentRepository.remove(attachment)
              }
            }
          }),
        ])

        // Remove all the variations
        await this.variationRepository.remove(variations)

        console.log('Variation options, variations deleted')
      }

      // Update existing product
      let product: Product = existingProduct ? existingProduct : new Product()

      product.name = createProductDto.name
      product.slug = createProductDto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      product.description = createProductDto.description
      product.product_type = createProductDto.product_type
      product.status = createProductDto.status
      product.quantity = this.validateNumber(createProductDto.quantity)
      product.max_price =
        this.validateNumber(createProductDto.max_price) ||
        this.validateNumber(createProductDto.price)
      product.min_price =
        this.validateNumber(createProductDto.min_price) ||
        this.validateNumber(createProductDto.sale_price)
      product.price = this.validateNumber(createProductDto.price)
      product.sale_price = this.validateNumber(createProductDto.sale_price)
      product.unit = createProductDto.unit ? createProductDto.unit : 1
      product.height = createProductDto.height ? createProductDto.height : 1
      product.length = createProductDto.length ? createProductDto.length : 1
      product.width = createProductDto.width ? createProductDto.width : 1
      product.sku = createProductDto.sku
      product.language = createProductDto.language || 'en'
      product.translated_languages = createProductDto.translated_languages || [
        'en',
      ]

      // Update tax
      if (createProductDto.taxes) {
        const tax = await this.taxRepository.findOne({
          where: { id: createProductDto.taxes.id },
        })
        if (tax) {
          product.taxes = tax
        }
      }

      // Update type
      if (createProductDto.type_id) {
        const type = await this.typeRepository.findOne({
          where: { id: createProductDto.type_id },
        })
        if (!type) {
          throw new NotFoundException(
            `Type with ID ${createProductDto.type_id} not found`,
          )
        }
        product.type = type
        product.type_id = type.id
      }

      // Update shop
      if (createProductDto.shop_id) {
        const shop = await this.shopRepository.findOne({
          where: { id: createProductDto.shop_id },
        })
        if (!shop) {
          throw new NotFoundException(
            `Shop with ID ${createProductDto.shop_id} not found`,
          )
        }
        product.shop = shop
        product.shop_id = shop.id
      }

      // Update categories
      if (createProductDto.category) {
        const categories = await this.categoryRepository.findByIds(
          createProductDto.category,
        )
        product.categories = categories
      }

      // Update subcategories
      if (createProductDto.subCategories) {
        const subCategories = await this.subCategoryRepository.findByIds(
          createProductDto.subCategories,
        )
        product.subCategories = subCategories
      }

      // Update tags
      if (createProductDto.tags) {
        const tags = await this.tagRepository.findByIds(createProductDto.tags)
        product.tags = tags
      }

      // Set shop
      if (createProductDto.shop_id) {
        const shop = await this.shopRepository.findOne({
          where: { id: createProductDto.shop_id },
        })
        if (!shop) {
          throw new NotFoundException(
            `Shop with ID ${createProductDto.shop_id} not found`,
          )
        }
        product.shop = shop
        product.shop_id = shop.id
      }

      // Set image
      if (createProductDto?.image?.id) {
        const image = await this.attachmentRepository.findOne(
          createProductDto.image.id,
        )
        if (!image) {
          throw new NotFoundException(
            `Image with ID ${createProductDto.image.id} not found`,
          )
        }
        product.image = image
      }

      // Set gallery
      if (createProductDto?.gallery?.length > 0) {
        const galleryAttachments = []
        for (const galleryImage of createProductDto.gallery) {
          const image = await this.attachmentRepository.findOne(galleryImage.id)
          if (!image) {
            throw new NotFoundException(
              `Gallery image with ID ${galleryImage.id} not found`,
            )
          }
          galleryAttachments.push(image)
        }
        product.gallery = galleryAttachments
      }

      // Handle variations
      if (
        createProductDto.variations &&
        createProductDto.variations.length > 0
      ) {
        try {
          const attributeValueIds = [
            ...new Set(
              createProductDto.variations.map((v) => v.attribute_value_id),
            ),
          ]

          if (attributeValueIds.length > 0) {
            const attributeValues =
              await this.attributeValueRepository.findByIds(attributeValueIds)
            const attributeValueMap = new Map(
              attributeValues.map((attr) => [attr.id, attr]),
            )

            const uniqueVariations = new Set<number>()
            product.variations = createProductDto.variations
              .filter((variation) => {
                const { attribute_value_id } = variation
                if (uniqueVariations.has(attribute_value_id)) {
                  console.warn(
                    `Duplicate attribute value ID ${attribute_value_id} found and ignored`,
                  )
                  return false
                }
                uniqueVariations.add(attribute_value_id)
                return true
              })
              .map((variation) => {
                const attributeValue = attributeValueMap.get(
                  variation.attribute_value_id,
                )
                if (!attributeValue) {
                  console.warn(
                    `Attribute value with ID ${variation.attribute_value_id} not found`,
                  )
                  return null
                }
                return attributeValue
              })
              .filter(Boolean)

            // Save the product first
            await this.productRepository.save(product)
          }
        } catch (error) {
          console.error('Error handling variations:', error)
          throw error instanceof NotFoundException
            ? error
            : new InternalServerErrorException(
              'An error occurred while processing variations',
            )
        }
      } else {
        console.warn('No variations provided in createProductDto')
      }

      // Handle variation options
      if (
        product.product_type === ProductType.VARIABLE &&
        createProductDto.variation_options?.upsert
      ) {
        try {
          const variationOptions = await Promise.all(
            createProductDto.variation_options.upsert.map(
              async (variationDto) => {
                const existingVariations = await this.variationRepository.find({
                  where: { title: variationDto.title },
                  relations: ['options'],
                })

                // Delete existing variation options
                for (const existingVariation of existingVariations) {
                  for (const option of existingVariation.options) {
                    await this.variationOptionRepository.delete(option.id)
                  }
                }

                const newVariation = this.variationRepository.create({
                  title: variationDto.title,
                  name: variationDto.name,
                  price: this.validateNumber(variationDto.price),
                  sku: variationDto.sku,
                  is_disable: variationDto.is_disable,
                  sale_price: this.validateNumber(variationDto.sale_price),
                  quantity: this.validateNumber(variationDto.quantity),
                  created_at: new Date(),
                  updated_at: new Date(),
                })

                // Handle image if present
                if (variationDto?.image) {
                  let image = await this.attachmentRepository.findOne({
                    where: { id: variationDto.image.id },
                  })
                  if (!image) {
                    image = this.attachmentRepository.create({
                      id: variationDto.image.id,
                      original: variationDto.image.original,
                      thumbnail: variationDto.image.thumbnail,
                    })
                    await this.attachmentRepository.save(image)
                  }
                  newVariation.image = image
                }

                const savedVariation = await this.variationRepository.save(
                  newVariation,
                )

                // Handle variation options
                const variationOptionEntities = await Promise.all(
                  (variationDto.options || []).map(async (option) => {
                    const newVariationOption =
                      this.variationOptionRepository.create({
                        name: option.name,
                        value: option.value,
                      })
                    return await this.variationOptionRepository.save(
                      newVariationOption,
                    )
                  }),
                )

                savedVariation.options = variationOptionEntities
                await this.variationRepository.save(savedVariation)

                return savedVariation
              },
            ),
          )

          product.variation_options = variationOptions
          await this.productRepository.save(product)
        } catch (error) {
          console.error('Error handling variation options:', error)
          throw new InternalServerErrorException(
            'An error occurred while processing variation options',
          )
        }
      } else {
        console.warn('No variation options provided in createProductDto')
      }

      if (product) {
        await this.productsService.updateShopProductsCount(
          product.shop_id,
          product.id,
        )
      }

      return product
    } catch (error) {
      console.log('error', error)
      throw new Error('Error saving products: ' + error.message)
    }
  }

  private validateNumber(value: any): number {
    if (isNaN(value)) {
      return 0
    }
    return Number(value)
  }
}
