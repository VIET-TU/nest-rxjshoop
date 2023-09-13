import { IsNumberString, IsOptional } from 'class-validator'
import { Expose, plainToClass } from 'class-transformer'

export class BaseDto {
	@IsOptional()
	@IsNumberString()
	limit?: string

	@IsOptional()
	@IsNumberString()
	page?: string

	@Expose()
	id?: string

	@Expose()
	createdAt?: Date

	@Expose()
	updatedAt?: Date

	static plainToInstance<T>(this: new (...args: any[]) => T, obj: T): T {
		return plainToClass(this, obj, { excludeExtraneousValues: true })
	}
}
