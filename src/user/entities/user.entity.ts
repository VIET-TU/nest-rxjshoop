import { Exclude, Expose, Transform } from 'class-transformer'
import { BaseEntity } from 'src/bases'
import { hashX } from 'src/utils/helpers'
import {
	AfterLoad,
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	ManyToMany,
	ManyToOne,
	OneToOne,
} from 'typeorm'
import { KeyTokenEntity } from '../../auth/entities/keyToken.entity'

export enum StatusUser {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}

export enum Role {
	User = 'user',
	Admin = 'admin',
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

	@OneToOne((_to) => KeyTokenEntity, (keyToken) => keyToken.user)
	keyToken: KeyTokenEntity
}
