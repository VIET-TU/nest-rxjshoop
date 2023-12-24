import { CreatePostDto } from 'src/post/dto/create-post.dto'
import { ProudctEntity } from './entities/product.entity'

export interface IProductService {
	createProduct(type: string, payload: CreatePostDto): Promise<ProudctEntity>
	updateProduct(type: string, productId: string, payload: CreatePostDto): Promise<ProudctEntity>
	getAllProducts(): Promise<ProudctEntity[]>
}
