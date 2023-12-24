import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { ProductFactory } from './services/products.service'
import { ProductsController } from './products.controller'
import { ElectronicRepository, ProductRepository } from './repositories/product.repository'
import { ProudctEntity } from './entities/product.entity'
import { ElectronicEntity } from './entities/electronic.entity'

@Module({
	imports: [TypeOrmModule.forFeature([ProudctEntity, ElectronicEntity])],
	controllers: [ProductsController],
	providers: [ProductFactory, ProductRepository, ElectronicRepository],
})
export class ProductsModule {}
