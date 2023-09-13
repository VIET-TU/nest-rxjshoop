import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import validationOptions from './utils/validation-options'
import * as cookieParser from 'cookie-parser'
import helmet from 'helmet'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.use(cookieParser())
	app.use(helmet())
	app.useGlobalPipes(new ValidationPipe(validationOptions))

	await app.listen(4000)
}
bootstrap()
