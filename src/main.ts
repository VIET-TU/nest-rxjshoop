import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import validationOptions from './utils/validation-options'
import * as cookieParser from 'cookie-parser'
import helmet from 'helmet'
import * as compression from 'compression'
import * as morgan from 'morgan'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.use(morgan('dev'))
	app.use(cookieParser())
	app.use(helmet())
	app.use(compression())
	app.useGlobalPipes(new ValidationPipe(validationOptions))

	await app.listen(4000)
}
bootstrap()
