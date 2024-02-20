import { Module } from '@nestjs/common';
import { FileManagerService } from './file-manager.service';
import { FileManagerController } from './file-manager.controller';
import { FileManagerProviders } from './entities/file-manager.provide';

@Module({
  controllers: [FileManagerController],
  providers: [FileManagerService, ...FileManagerProviders],
})
export class FileManagerModule {}
