import { Exclude, Expose, Transform } from 'class-transformer'
import { BaseEntity } from 'src/bases'
import { hashX } from 'src/utils/helpers'
import { AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, OneToOne } from 'typeorm'
import { KeyTokenEntity } from '../../auth/entities/keyToken.entity'
import { ProudctEntity } from 'src/products/entities/product.entity'
import { Role } from 'src/utils/enums/role.enum'

export enum StatusUser {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
	@Column()
	firstName!: string

	@Column()
	lastName!: string

	@Expose()
	@Transform(({ obj }) => obj.firstName + ' ' + obj.lastName)
	fullName: string

	@Column({ unique: true })
	@Expose()
	email!: string

	@Column()
	@Exclude({ toPlainOnly: true })
	password!: string

	@Exclude({ toPlainOnly: true })
	public previousPassword: string

	@AfterLoad()
	public loadPreviousPassword(): void {
		this.previousPassword = this.password
	}

	@BeforeInsert()
	@BeforeUpdate()
	async setPassword() {
		if (this.previousPassword !== this.password && this.password) {
			this.password = await hashX(this.password)
		}
	}

	@Column({
		type: 'enum',
		enum: StatusUser,
		default: StatusUser.ACTIVE,
	})
	@Exclude()
	status: StatusUser

	@Column({
		type: 'enum',
		enum: Role,
		default: Role.User,
	})
	@Exclude()
	roles: Role

	@Column({ nullable: true })
	@Expose()
	phone: string

	@Column({ nullable: true })
	@Expose()
	address: string

	@OneToOne((_to) => KeyTokenEntity, (keyToken) => keyToken.user)
	keyToken: KeyTokenEntity

	@OneToMany((_to) => ProudctEntity, (product) => product.product_shop)
	products: ProudctEntity[]
}
