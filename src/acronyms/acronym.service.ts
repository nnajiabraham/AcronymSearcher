import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { Acronym, AcronymStatus } from './acronym.entity';

@Injectable()
export class AcronymService {
  constructor(
    @InjectRepository(Acronym) private acronymRepository: Repository<Acronym>,
    @InjectRepository(AcronymStatus)
    private acronymStatusRepository: Repository<AcronymStatus>,
  ) {}

  async createAcronym(acronym: Acronym) {
    try {
      const newAcronym = await this.acronymRepository.save(acronym);
      return newAcronym;
    } catch (e) {
      throw new ConflictException('Unable to save acronym');
    }
  }

  getAcronymDefinition(acronym: string) {
    if (acronym == 'null') {
      throw new NotFoundException('Could not find acronym definition');
    }

    return { acronym: acronym };
  }

  async bootStrapDBWithInitialData() {
    const status = await this.acronymStatusRepository.findOne({
      where: { id: '1' },
    });

    if (status && status.id == '1' && status.seedDataLoaded) {
      return;
    }

    const acronymsEntity = await this.fetchJSONData();
    await this.acronymRepository.save(acronymsEntity);

    const acronymStatus = new AcronymStatus();
    acronymStatus.id = '1';
    acronymStatus.seedDataLoaded = true;

    await this.acronymStatusRepository.save(acronymStatus);
  }

  private fetchJSONData() {
    return new Promise<Acronym[]>((resolve, reject) => {
      // const data = fs.readFileSync(
      //   path.join(__dirname, '../../../') + 'seedData.json',
      //   'utf8',
      // );
      // console.log('data is ', data);
      // let acronyms: {
      //   [acronym: string]: string;
      // }[] = JSON.parse(data);
      // const finalData = acronyms.map(acronym => {
      //   const newAcronym = new Acronym();
      //   newAcronym.acronym = Object.keys(acronym)[0];
      //   newAcronym.definition = Object.values(acronym)[0];
      //   return newAcronym;
      // });
      // resolve(finalData);

      fs.readFile(
        path.join(__dirname, '../../../') + 'seedData.json',
        'utf8',
        function(err, data) {
          if (err) reject(err);
          let acronyms: {
            [acronym: string]: string;
          }[] = JSON.parse(data);
          const finalData = acronyms.map(acronym => {
            const newAcronym = new Acronym();
            newAcronym.acronym = Object.keys(acronym)[0];
            newAcronym.definition = Object.values(acronym)[0];
            return newAcronym;
          });
          resolve(finalData);
        },
      );
    });
  }
}
