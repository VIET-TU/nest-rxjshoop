import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseRepository } from 'src/bases'
import { KeyTokenEntity } from '../entities/keyToken.entity'

@Injectable()
export class KeyTokenRepository extends BaseRepository<KeyTokenEntity> {
	constructor(@InjectRepository(KeyTokenEntity) public readonly repo: Repository<KeyTokenEntity>) {
		super(repo)
	}
}
