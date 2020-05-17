import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { Acronym, AcronymStatus } from './acronyms/acronym.entity';
import { AcronymModule } from './acronyms/acronym.module';
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
      entities: [Acronym, AcronymStatus],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
