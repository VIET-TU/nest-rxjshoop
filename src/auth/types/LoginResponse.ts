import { UserEntity } from 'src/user/entities/user.entity'

export type LoginResponseType = Readonly<{
	accessToken: string
	user: UserEntity
}>
