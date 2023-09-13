import { Test, TestingModule } from '@nestjs/testing';
import { GrapqlService } from './grapql.service';

describe('GrapqlService', () => {
  let service: GrapqlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GrapqlService],
    }).compile();

    service = module.get<GrapqlService>(GrapqlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
