import { Injectable } from '@nestjs/common'
import { ProudctEntity } from '../entities/product.entity'
import { BaseRepository } from 'src/bases'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ElectronicEntity } from '../entities/electronic.entity'

@Injectable()
export class ProductRepository extends BaseRepository<ProudctEntity> {
	constructor(@InjectRepository(ProudctEntity) public readonly repo: Repository<ProudctEntity>) {
		super(repo)
	}
}

@Injectable()
export class ElectronicRepository extends BaseRepository<ElectronicEntity> {
	constructor(
		@InjectRepository(ElectronicEntity) public readonly repo: Repository<ElectronicEntity>
	) {
		super(repo)
	}
}
