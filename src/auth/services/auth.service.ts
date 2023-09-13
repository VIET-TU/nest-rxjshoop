import * as asOtpGenerator from 'otp-generator'
import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common'
import { IAuthService } from '../interfaces/aut.interface'
import { ConfirmEmailDto } from '../dtos/AuthConfirmEmailDto '
import { ConfirmEmailReponse } from '../types/VertifyEmailReponse'
import { UserService } from 'src/user/services/user.service'
import { Services } from 'src/utils/constants'
import { VertifyOtpDto } from '../dtos/VertifyOtpDto'
import { OtpService } from './otp.service'
import { MailerService } from '@nest-modules/mailer'
import { RedisService, HeadKey } from 'src/redis/redis.service'
import { RegisterDto } from '../dtos/register.dto'
import { StatusUser, UserEntity } from 'src/user/entities/user.entity'
import { Queue } from 'bull'
import { InjectQueue } from '@nestjs/bull'
import { Response, Request } from 'express'
import { loginDto } from '../dtos/login.dto'
import { compareHash } from 'src/utils/helpers'
import * as crypto from 'crypto'
import { JwtService } from '@nestjs/jwt'
import { KeyTokenService } from './keyToken.service'
import * as ms from 'ms'
import { LoginResponseType } from '../types/LoginResponse'
import { KeyTokenEntity } from '../entities/keyToken.entity'

@Injectable()
export class AuthService implements IAuthService {
	constructor(
		@Inject(Services.USERS) private readonly userService: UserService,
		@Inject(forwardRef(() => OtpService)) private readonly otpService: OtpService,
		@InjectQueue('send-email') private sendMail: Queue,
		private readonly mailerservice: MailerService,
		private readonly redisService: RedisService,
		private readonly jwtService: JwtService,
		private readonly keyTokenService: KeyTokenService
	) {}
	async logout(req: Request<any, Record<string, any>>, res: Response): Promise<void> {
		const user = req.user as UserEntity
		await this.keyTokenService.deleteKeyStoreByUser(user.id)
		res.clearCookie(process.env.REFRESH_TOKEN_COOKIE_NAME as string, {
			httpOnly: true,
			secure: false,
			path: '/',
			sameSite: 'strict',
		})
	}

	async refreshToken(
		req: Request<any, Record<string, any>>,
		res: Response
	): Promise<Omit<LoginResponseType, 'user'>> {
		const { publicKey, privateKey } = req.body.keyStore as KeyTokenEntity
		// const _refreshToken = req.body.refreshToken
		const user = req.user as UserEntity
		// if (refreshTokensUsed.includes(_refreshToken)) {
		// 	// await KeyTokenService.deleteKeyById(userId)
		// 	// throw new ForbiddenError('Something wrong happen !! Plean re-login')
		// }

		const { accessToken, refreshToken } = await this.getTokensData(
			{ userId: user.id },
			publicKey,
			privateKey
		)

		await this.keyTokenService.updateKeyToken({
			user,
			publicKey,
			privateKey,
			refreshToken,
		})

		this.sendCookieToken(
			res,
			process.env.REFRESH_TOKEN_COOKIE_NAME,
			refreshToken,
			ms(process.env.AUTH_JWT_TOKEN_EXPIRES_IN)
		)

		return {
			accessToken,
		}
	}

	async login(
		{ email, password }: loginDto,
		res: Response<any, Record<string, any>>
	): Promise<LoginResponseType> {
		const exitsUser = await this.userService.findOneUserByEmail(email)
		if (!exitsUser) {
			throw new HttpException('emaild not exits', HttpStatus.BAD_REQUEST)
		}
		console.log('exitsUser :>> ', exitsUser)
		if (exitsUser.status === StatusUser.INACTIVE)
			throw new HttpException('User is not active', HttpStatus.BAD_REQUEST)
		const match = await compareHash(password, exitsUser.password)
		if (!match) throw new HttpException('Wrong password', HttpStatus.BAD_REQUEST)

		// created privateKey, publicKey
		const privateKey = crypto.randomBytes(64).toString('hex')
		const publicKey = crypto.randomBytes(64).toString('hex')

		const { accessToken, refreshToken } = await this.getTokensData(
			{ userId: exitsUser.id },
			publicKey,
			privateKey
		)

		const keyStore = await this.keyTokenService.findKeyStoreByUserId(exitsUser.id)
		if (keyStore) {
			await this.keyTokenService.updateKeyToken({
				user: exitsUser,
				publicKey,
				privateKey,
				refreshToken,
			})
		} else {
			await this.keyTokenService.createKeyToken({
				user: exitsUser,
				publicKey,
				privateKey,
				refreshToken,
			})
		}

		this.sendCookieToken(
			res,
			process.env.REFRESH_TOKEN_COOKIE_NAME,
			refreshToken,
			ms(process.env.AUTH_JWT_TOKEN_EXPIRES_IN)
		)

		console.log(exitsUser.email + `:${exitsUser.id.toString()}`)
		await this.redisService.setOnKey(
			HeadKey.AC_TOKEN,
			exitsUser.id,
			accessToken,
			ms(process.env.AUTH_JWT_TOKEN_EXPIRES_IN) / 1000 // minute
		)
		return {
			user: UserEntity.plainToInstance(exitsUser),
			accessToken,
		}
	}

	async register(registerDto: RegisterDto): Promise<UserEntity> {
		console.log('object :>> ', registerDto)
		const { email, firstName, lastName, password } = registerDto
		const exitsUser = await this.userService.findOneUserByEmail(email)
		if (exitsUser) throw new HttpException('User already exists', HttpStatus.CONFLICT)
		const isVertifyEmail = await this.redisService.getOnKey(HeadKey.Register, email)
		if (!isVertifyEmail) throw new HttpException('Email expired vertify', HttpStatus.FORBIDDEN)
		await this.redisService.delOnKey(HeadKey.Register, email)
		const user = await this.userService.createUser(registerDto)

		this.sendMail.add(
			'register',
			{
				to: email,
				name: user.fullName,
			},
			{
				removeOnComplete: true,
			}
		)
		return user
	}

	async vertiyOtp(VertifyOtpDto: VertifyOtpDto): Promise<string> {
		const { email, Otp } = VertifyOtpDto
		const exitsUser = await this.userService.findOneUserByEmail(email)
		if (exitsUser) {
			throw new HttpException('User already exists', HttpStatus.CONFLICT)
		}
		const isVaild = await this.otpService.vaildOtp(email, Otp)
		if (!isVaild) throw new HttpException('Invalid Otp', HttpStatus.BAD_REQUEST)
		await this.otpService.deleteOtp(email)
		return await this.redisService.setOnKey(
			HeadKey.Register,
			email,
			JSON.stringify(isVaild),
			ms(process.env.AUTH_JWT_TOKEN_EXPIRES_IN) / 1000 // minute
		)
	}

	async ConfirmEmail({ email }: ConfirmEmailDto): Promise<ConfirmEmailReponse> {
		const exitsUser = await this.userService.findOneUserByEmail(email)

		if (exitsUser) {
			throw new HttpException('User already exists', HttpStatus.CONFLICT)
		}
		// send otp
		const OTP = asOtpGenerator?.generate(6, {
			digits: true,
			lowerCaseAlphabets: false,
			upperCaseAlphabets: false,
			specialChars: false,
		})
		console.log('OTP :>> ', OTP)

		try {
			await this.mailerservice.sendMail({
				to: email,
				subject: 'Welcome to my website',
				template: './sendOtp',
				context: {
					otpCode: OTP,
				},
			})
		} catch (error) {
			console.error('Error sending email:', error)
		}

		return {
			email,
			otp: await this.otpService.insertOtp(OTP, email),
		}
	}

	private async getTokensData(
		payload: any,
		publicKey: string,
		privateKey: string
	): Promise<IGetTokensData> {
		const [accessToken, refreshToken] = await Promise.all([
			await this.jwtService.signAsync(
				{ payload },
				{
					secret: publicKey,
					expiresIn: process.env.AUTH_JWT_TOKEN_EXPIRES_IN,
				}
			),
			await this.jwtService.signAsync(
				{ payload },
				{
					secret: privateKey,
					expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN,
				}
			),
		])

		return {
			accessToken,
			refreshToken,
		}
	}
	private sendCookieToken(res, key, value, time): Promise<void> {
		return res.cookie(key, value, {
			httpOnly: true,
			secure: false,
			path: '/',
			sameSite: 'strict',
			maxAge: time,
		})
	}
}

interface IGetTokensData {
	accessToken: string
	refreshToken: string
}
