import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthCheckController } from './health.controller';
/**
 * @param  {[TerminusModule} {imports
 * @param  {} HttpModule]
 * @param  {[HealthCheckController]} controllers
 * @param  {} }
 */
@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthCheckController],
})
export class HealthModule {}
