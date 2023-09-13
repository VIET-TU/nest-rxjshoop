import { Injectable } from '@nestjs/common'
import { UserRepository } from '../repositories/user.repository'
import { MailerService } from '@nest-modules/mailer'

import { UserEntity } from '../entities/user.entity'
import { CreateUserDto } from '../dtos/CreateUser.dto'
import { plainToClass } from 'class-transformer'

@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private mailerservice: MailerService
	) {}

	async findOneUserByEmail(email: string): Promise<UserEntity> {
		return await this.userRepository.getOne({ email })
	}

	async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
		const user = await this.userRepository.create(createUserDto)
		return UserEntity.plainToInstance(user)
	}

	async findOneUserById(id: string): Promise<UserEntity> {
		return await this.userRepository.getOneById(id)
	}
}
