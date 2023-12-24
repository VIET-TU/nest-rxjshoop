import { Global, Module } from '@nestjs/common'
import { MediaController } from './controllers/media.controller'
import { MediaService } from './services/media.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MediaEntity } from './entities/media.entity'
import { ConfigModule } from '@nestjs/config'
import { MediaRopository } from './repositories/media.repository'

@Global()
@Module({
	imports: [TypeOrmModule.forFeature([MediaEntity]), ConfigModule],
	controllers: [MediaController],
	providers: [MediaService, MediaRopository],
	exports: [MediaService],
})
export class MediaModule {}
