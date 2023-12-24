import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { IProductService } from '../product.interface'
import { ProudctEntity } from '../entities/product.entity'
import { CreateProductDto } from '../dtos/create-product.dto'
import { ElectronicRepository, ProductRepository } from '../repositories/product.repository'
import { UserEntity } from 'src/user/entities/user.entity'
import { DataSource, EntityManager } from 'typeorm'
import { ElectronicEntity } from '../entities/electronic.entity'
import { UpdateProducttDto } from '../dtos/update-product.dto'
import { removeUndefinedObject } from '../../utils/index'
import { MediaService } from 'src/media/services/media.service'

@Injectable()
export class ProductFactory implements IProductService {
	constructor(
		private readonly productRepo: ProductRepository,
		private readonly electronicRepo: ElectronicRepository,
		private dataSource: DataSource,
		private readonly mediaService: MediaService
	) {}
	getAllProducts(): Promise<ProudctEntity[]> {
		return this.productRepo.getAll()
	}

	static productRegistry: { [key: string]: any } = {} // key - value

	static registerProductType(type, classRef) {
		ProductFactory.productRegistry[type] = classRef
	}

	async createProduct(type: string, payload: CreateProductDto): Promise<ProudctEntity> {
		const productClass = ProductFactory.productRegistry[type]

		if (!productClass)
			throw new HttpException(`Invalid Product Types ${type}`, HttpStatus.BAD_REQUEST)

		return await this.dataSource.transaction(async (manager) => {
			const product_thumbs = await this.handlerFile(payload.product_thumbs)
			return await new productClass(
				{ ...payload, product_thumbs },
				this.productRepo,
				manager
			).createProduct()
		})
	}

	private async handlerFile(files: File[]) {
		const urls: string[] = []
		for (const item of files) {
			const url = this.mediaService.getLinkMediaKey((await this.mediaService.upload(item)).key)
			urls.push(url)
		}
		return urls
	}

	async updateProduct(
		type: string,
		productId: string,
		payload: UpdateProducttDto
	): Promise<ProudctEntity> {
		const productClass = ProductFactory.productRegistry[type]
		if (!productClass)
			throw new HttpException(`Invalid Product Types ${type}`, HttpStatus.BAD_REQUEST)
		return await this.dataSource.transaction(async (manager) => {
			return await new productClass(payload, this.productRepo, manager).updateProduct(productId)
		})
	}
}

// define base product class
class Product {
	protected payload: CreateProductDto | UpdateProducttDto
	protected productRepo: ProductRepository
	protected electronicRepo: ElectronicRepository
	protected manager: EntityManager
	constructor(
		payload: CreateProductDto | UpdateProducttDto,
		productRepo: ProductRepository,
		manager?: EntityManager
	) {
		this.payload = payload
		this.productRepo = productRepo
		if (manager) this.manager = manager
	}

	protected async createProduct(prodcut_id: string) {
		const newProduct = await this.manager.create(ProudctEntity, {
			...this.payload,
			product_thumbs: this.payload.product_thumbs as unknown as string[],
			id: prodcut_id,
		})
		return newProduct
	}

	async updateProduct(productId: string, payload: UpdateProducttDto) {
		const product = await this.productRepo.getOneByIdOrFail(productId)
		const newProduct = {
			...product,
			...this.payload,
			product_attributes: { ...product.product_attributes, ...this.payload.product_attributes },
		} as ProudctEntity

		const _newProduct = this.manager.create(ProudctEntity, newProduct)

		return await this.manager.save(ProudctEntity, _newProduct)
	}
}

// define sub-class for diffrent product types electronic
class Electronic extends Product {
	async createProduct() {
		const newElectronic = await this.manager.create(ElectronicEntity, {
			...this.payload.product_attributes,
			product_shop: this.payload.product_shop,
		})
		if (!newElectronic)
			throw new HttpException('Error create new Electronic', HttpStatus.BAD_REQUEST)
		await this.manager.save(newElectronic)
		const newProduct = await super.createProduct(newElectronic.id)
		if (!newProduct) throw new HttpException('Error create new Product', HttpStatus.BAD_REQUEST)
		await this.manager.save(newProduct)
		return {
			...newProduct,
			product_shop: UserEntity.plainToInstance(this.payload.product_shop),
		} as ProudctEntity
	}

	async updateProduct(productId) {
		// 1. remove attr has null undifine
		const objetParams = removeUndefinedObject(this.payload)
		// 2. Check xem update o cho nao
		if (objetParams.product_attributes) {
			await this.manager.update(
				ElectronicEntity,
				{ id: productId },
				{ ...this.payload.product_attributes }
			)
		}
		// 3. update image

		const updateProduct = await super.updateProduct(productId, objetParams)
		return updateProduct
	}
}

ProductFactory.registerProductType('Electronics', Electronic)
