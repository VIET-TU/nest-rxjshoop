import { ExtractJwt, Strategy } from 'passport-jwt'
import { Inject, Injectable, forwardRef, HttpStatus, HttpException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { HEADER } from '../enums/header.enum'
import { KeyTokenService } from '../services/keyToken.service'
import { UserService } from 'src/user/services/user.service'
import { JwtPayoadType } from './types/jwt-payload-types'
import { UserEntity } from 'src/user/entities/user.entity'
import { Services } from 'src/utils/constants'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		@Inject(Services.USERS) private readonly userService: UserService,
		@Inject(forwardRef(() => KeyTokenService))
		private readonly keyTokenService: KeyTokenService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken()]),
			ignoreExpiration: false,
			passReqToCallback: true,
			secretOrKeyProvider: async (req: Request, _, done) => {
				try {
					const userId = req.headers[HEADER.CLIENT_ID]
					if (!userId) throw new HttpException('Invalid request', HttpStatus.UNAUTHORIZED)
					const keyStore = await this.keyTokenService.findKeyStoreByUserId(userId as string)
					if (!keyStore) throw new HttpException('Not found keyStore', HttpStatus.UNAUTHORIZED)
					req.body.keyStore = keyStore
					done(null, keyStore.publicKey)
				} catch (error) {
					done(error)
				}
			},
		})
	}
	async validate(req: Request, { payload }: { payload: JwtPayoadType }): Promise<UserEntity> {
		if (payload.userId !== req.headers[HEADER.CLIENT_ID])
			throw new HttpException('Invaild userId', HttpStatus.BAD_REQUEST)
		const user = await this.userService.findOneUserById(payload.userId)
		if (!user) {
			throw new HttpException('User not registered', HttpStatus.UNAUTHORIZED)
		}
		return user
	}
}
