import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AcronymModule } from './acronyms/acronym.module';
import { Acronym, AcronymDBState } from './acronyms/entity/acronym.entity';
import { Definition } from './acronyms/entity/definition.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    AcronymModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'wtf.db',
      synchronize: true,
      logging: false,
      entities: [Acronym, AcronymDBState, Definition],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
