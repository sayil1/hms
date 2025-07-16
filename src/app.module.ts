import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EdgeServersModule } from './servers/edge-servers.module';

@Module({
  imports: [EdgeServersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
