import { UserEntity } from 'src/user/entities/user.entity'
import { ConfirmEmailDto } from '../dtos/AuthConfirmEmailDto '
import { VertifyOtpDto } from '../dtos/VertifyOtpDto'
import { RegisterDto } from '../dtos/register.dto'
import { ConfirmEmailReponse } from '../types/VertifyEmailReponse'
import { loginDto } from '../dtos/login.dto'
import { Response } from 'express'
import { LoginResponseType } from '../types/LoginResponse'

export interface IAuthService {
	ConfirmEmail(email: ConfirmEmailDto): Promise<ConfirmEmailReponse>
	vertiyOtp(vertifyOtpDto: VertifyOtpDto): Promise<any>
	register(registerDto: RegisterDto): Promise<UserEntity>
	login(LoginDto: loginDto, res: Response): Promise<LoginResponseType>
	refreshToken(req: any, res: Response): Promise<Omit<LoginResponseType, 'user'>>
	logout(req: any, res: Response): Promise<void>
}
