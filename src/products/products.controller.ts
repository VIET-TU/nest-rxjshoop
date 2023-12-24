import {
	Body,
	Controller,
	Post,
	UseGuards,
	UseInterceptors,
	Request,
	Patch,
	Param,
	UploadedFiles,
	Get,
	ParseFilePipe,
	FileValidator,
	FileTypeValidator,
	MaxFileSizeValidator,
} from '@nestjs/common'
import { ProductFactory } from './services/products.service'
import { AuthGuard } from '@nestjs/passport'
import { ResponseInterceptor } from 'src/utils/reponse.interceptor'
import { Roles } from 'src/utils/decorator/roles.decorator'
import { Role } from 'src/utils/enums/role.enum'
import { ProudctEntity } from './entities/product.entity'
import { CreateProductDto } from './dtos/create-product.dto'
import { RolesGuard } from 'src/utils/guards/roles.guard'
import { UpdateProducttDto } from './dtos/update-product.dto'
import { FilesInterceptor, NoFilesInterceptor } from '@nestjs/platform-express'
import { IsNotEmpty } from 'class-validator'

@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductFactory) {}

	@Post()
	@Roles(Role.Admin, Role.Shop)
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@UseInterceptors(FilesInterceptor('product_thumbs'))
	@UseInterceptors(new ResponseInterceptor('Create product  successfully'))
	async createProduct(
		@Request() { user },
		@Body() payload: CreateProductDto,
		@(UploadedFiles(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 1000000 }),
					new FileTypeValidator({ fileType: /^image\/(jpg|jpeg|png)$/ }),
				],
			})
		)!)
		product_thumbs: File[]
	): Promise<ProudctEntity> {
		let product_attributes = payload.product_attributes
		product_attributes = JSON.parse(product_attributes as unknown as string)

		return this.productsService.createProduct(payload.product_type, {
			...payload,
			product_shop: user,
			product_thumbs,
			product_attributes: product_attributes,
		})
	}

	@Get()
	@UseInterceptors(new ResponseInterceptor('Get all products successfully'))
	async getAllProduct(): Promise<ProudctEntity[]> {
		return this.productsService.getAllProducts()
	}

	@Get(':id')
	@UseInterceptors(new ResponseInterceptor('Get all products successfully'))
	async getAllProductById(@Param('id') id: number): Promise<ProudctEntity[]> {
		return this.productsService.getAllProducts()
	}

	@Patch(':productId')
	@Roles(Role.Admin, Role.Shop)
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@UseInterceptors(new ResponseInterceptor('update product  successfully'))
	async updateProduct(
		@Param('productId') productId: string,
		@Request() { user },
		@Body() payload: UpdateProducttDto
	): Promise<ProudctEntity> {
		return this.productsService.updateProduct(payload.product_type, productId, {
			...payload,
			product_shop: user,
		})
	}
}
