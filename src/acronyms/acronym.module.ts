import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcronymController } from './acronym.controller';
import { AcronymService } from './acronym.service';
import { Acronym, AcronymDBState } from './entity/acronym.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Acronym, AcronymDBState])],
  controllers: [AcronymController],
  providers: [AcronymService],
})
export class AcronymModule {}
