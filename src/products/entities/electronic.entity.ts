import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { ProudctEntity } from './product.entity'
import { BaseEntity } from 'src/bases'
import { UserEntity } from 'src/user/entities/user.entity'

@Entity({ name: 'electronics' })
export class ElectronicEntity extends BaseEntity {
	@Column()
	manufacturer!: string

	@Column()
	model!: string

	@Column()
	color!: string

	@ManyToOne(() => UserEntity)
	@JoinColumn({ name: 'shopId' })
	product_shop: UserEntity
}
