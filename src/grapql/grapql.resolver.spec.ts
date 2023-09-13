import { Test, TestingModule } from '@nestjs/testing';
import { GrapqlResolver } from './grapql.resolver';
import { GrapqlService } from './grapql.service';

describe('GrapqlResolver', () => {
  let resolver: GrapqlResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GrapqlResolver, GrapqlService],
    }).compile();

    resolver = module.get<GrapqlResolver>(GrapqlResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
