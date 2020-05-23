import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcronymController } from './acronym.controller';
import { AcronymService } from './acronym.service';
import { Acronym, AcronymDBState } from './entity/acronym.entity';
import { Definition } from './entity/definition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Acronym, AcronymDBState, Definition])],
  controllers: [AcronymController],
  providers: [AcronymService],
})
export class AcronymModule {}
