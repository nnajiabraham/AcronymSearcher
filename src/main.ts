import { NestFactory } from '@nestjs/core';
import { AcronymService } from './acronyms/acronym.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const acronymService = app.get(AcronymService);
  try {
    await acronymService.bootStrapDBWithInitialData();
  } catch (e) {
    console.error(
      'An error occured bootstrapping db with sample json file, skipping process, \n',
      e,
    );
  }
  await app.listen(3000);
}
bootstrap();
