import { Inject, Injectable, OnModuleDestroy, forwardRef } from '@nestjs/common'
import { REDIS_CLIENT, RedisClient } from './redis-client.type'

export enum HeadKey {
	Register = 'register',
	Otp = 'otp',
	AC_TOKEN = 'AC_TOKEN',
	RF_TOKEN = 'RF_TOKEN',
}

@Injectable()
export class RedisService implements OnModuleDestroy {
	public constructor(@Inject(forwardRef(() => REDIS_CLIENT)) private readonly redis: RedisClient) {}

	onModuleDestroy() {
		this.redis.quit()
	}

	ping() {
		return this.redis.ping()
	}

	async setEx(key: string, value: any, time: number) {
		return await this.redis.setEx(key, time, value)
	}

	async get(key: string) {
		return await this.redis.get(key)
	}

	async del(key: string) {
		return await this.redis.del(key)
	}

	async setOnKey(headKey: HeadKey, taliKey: string, value: any, expired?: number) {
		const key = `${headKey}:${taliKey}`
		if (expired) {
			return this.setEx(key, value, expired)
		} else {
			return this.redis.set(key, value)
		}
	}

	async getOnKey(headKey: HeadKey, taliKey: string) {
		const key = `${headKey}:${taliKey}`
		return this.get(key)
	}

	async delOnKey(headKey: HeadKey, taliKey: string) {
		const key = `${headKey}:${taliKey}`
		return this.del(key)
	}
}
