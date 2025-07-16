import { Test, TestingModule } from '@nestjs/testing';
import { EdgeServersController } from './edge-servers.controller';
import { EdgeServersService } from './edge-servers.service';

describe('EdgeServersController', () => {
  let controller: EdgeServersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EdgeServersController],
      providers: [EdgeServersService],
    }).compile();

    controller = module.get<EdgeServersController>(EdgeServersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
