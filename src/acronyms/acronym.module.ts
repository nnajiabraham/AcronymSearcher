import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcronymController } from './acronym.controller';
import { Acronym, AcronymStatus } from './acronym.entity';
import { AcronymService } from './acronym.service';

@Module({
  imports: [TypeOrmModule.forFeature([Acronym, AcronymStatus])],
  controllers: [AcronymController],
  providers: [AcronymService],
})
export class AcronymModule {}
