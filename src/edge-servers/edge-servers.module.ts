import { Module } from '@nestjs/common';
import { EdgeServersService } from './edge-servers.service';
import { EdgeServersController } from './edge-servers.controller';

@Module({
  controllers: [EdgeServersController],
  providers: [EdgeServersService],
})
export class EdgeServersModule {}
