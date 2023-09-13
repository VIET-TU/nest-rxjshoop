// user
// publicKey
// privateKey
// refreshToken

import { Expose } from 'class-transformer'
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm'
import { UserEntity } from '../../user/entities/user.entity'
import { BaseEntity } from 'src/bases'

@Entity({ name: 'key-tokens' })
export class KeyTokenEntity extends BaseEntity {
	@OneToOne((_to) => UserEntity, (user) => user.keyToken)
	@JoinColumn()
	user!: UserEntity

	@Column({ unique: true })
	publicKey!: string

	@Column({ unique: true })
	privateKey!: string

	@Column({ unique: true, default: null })
	refreshTokensUsed: string

	@Column({ unique: true })
	refreshToken!: string
}
