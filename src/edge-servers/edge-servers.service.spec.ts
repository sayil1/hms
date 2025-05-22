import { Test, TestingModule } from '@nestjs/testing';
import { EdgeServersService } from './edge-servers.service';

describe('EdgeServersService', () => {
  let service: EdgeServersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EdgeServersService],
    }).compile();

    service = module.get<EdgeServersService>(EdgeServersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
