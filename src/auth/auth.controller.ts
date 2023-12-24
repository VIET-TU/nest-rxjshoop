import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	Post,
	Request,
	Res,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'

import { AuthGuard } from '@nestjs/passport'
import { Response } from 'express'
import { UserEntity } from 'src/user/entities/user.entity'
import { Services } from 'src/utils/constants'
import { ResponseInterceptor } from 'src/utils/reponse.interceptor'
import { ConfirmEmailDto } from './dtos/AuthConfirmEmailDto '
import { VertifyOtpDto } from './dtos/VertifyOtpDto'
import { loginDto } from './dtos/login.dto'
import { RegisterDto } from './dtos/register.dto'
import { IAuthService } from './interfaces/auth.interface'
import { LoginResponseType } from './types/LoginResponse'
import { ConfirmEmailReponse } from './types/VertifyEmailReponse'

@Controller('auth')
export class AuthController {
	constructor(@Inject(Services.AUTH) private readonly authService: IAuthService) {}

	@Post('vertify-email')
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(new ResponseInterceptor('Send Otp successfully'))
	async ConfirmEmail(@Body() payload: ConfirmEmailDto): Promise<ConfirmEmailReponse> {
		return await this.authService.ConfirmEmail(payload)
	}

	@Post('vertify-otp')
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(new ResponseInterceptor('Email verified successfully'))
	async vertiyOtp(@Body() vertifyOtpDto: VertifyOtpDto): Promise<string> {
		return await this.authService.vertiyOtp(vertifyOtpDto)
	}

	@Post('register')
	@UseInterceptors(new ResponseInterceptor('Crete user successfully'))
	async register(@Body() registerDto: RegisterDto): Promise<UserEntity> {
		return await this.authService.register(registerDto)
	}

	@Post('login')
	@UseInterceptors(new ResponseInterceptor('Login successfully'))
	async login(
		@Body() LoginDto: loginDto,
		@Res({ passthrough: true }) res: Response
	): Promise<LoginResponseType> {
		return await this.authService.login(LoginDto, res)
	}

	@Post('refresh')
	@UseGuards(AuthGuard('jwt-refresh'))
	@UseInterceptors(new ResponseInterceptor('Refresh token successfully'))
	@HttpCode(HttpStatus.OK)
	async refreshToken(
		@Request() req,
		@Res({ passthrough: true }) res: Response
	): Promise<Omit<LoginResponseType, 'user'>> {
		return this.authService.refreshToken(req, res)
	}

	@Post('logout')
	@UseGuards(AuthGuard('jwt'))
	@UseInterceptors(new ResponseInterceptor('logout successfully'))
	@HttpCode(HttpStatus.NO_CONTENT)
	public async logout(@Request() req, @Res({ passthrough: true }) res: Response): Promise<any> {
		return await this.authService.logout(req, res)
	}

	@Get()
	@UseGuards(AuthGuard('jwt'))
	hello() {
		return 'hello world'
	}
}
