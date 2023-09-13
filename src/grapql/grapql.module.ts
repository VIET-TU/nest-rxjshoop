import { Module } from '@nestjs/common';
import { GrapqlService } from './grapql.service';
import { GrapqlResolver } from './grapql.resolver';

@Module({
  providers: [GrapqlResolver, GrapqlService],
})
export class GrapqlModule {}
