import { FactoryProvider } from '@nestjs/common'
import { createClient } from 'redis'
import { RedisClient, REDIS_CLIENT } from './redis-client.type'

export const redisClientFactory: FactoryProvider<Promise<RedisClient>> = {
	provide: REDIS_CLIENT,
	useFactory: async () => {
		const client = createClient({ url: process.env.URL_REDIS })
		await client.connect()
		return client
	},
}
