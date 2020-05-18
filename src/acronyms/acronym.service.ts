import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Like, Repository } from 'typeorm';
import { Acronym, AcronymStatus } from './acronym.entity';

@Injectable()
export class AcronymService {
  constructor(
    @InjectRepository(Acronym) private acronymRepository: Repository<Acronym>,
    @InjectRepository(AcronymStatus)
    private acronymStatusRepository: Repository<AcronymStatus>,
  ) {}

  //TODO The relationship for one acronym is to many definitions, need to handle that in the db
  async createAcronym(acronym: Acronym): Promise<Acronym> {
    const newAcronym = await this.acronymRepository.save(acronym);
    return newAcronym;
  }

  async getAcronymDefinition(acronym: string) {
    const result = await this.acronymRepository.find({
      where: { acronym: Like(acronym) },
    });
    return result;
  }

  async searchAcronym(acronym: string, offset: number = 0, limit: number = 10) {
    const result = await this.acronymRepository.findAndCount({
      where: { acronym: Like(`%${acronym}%`) },
      take: limit > 10 ? 10 : limit,
      skip: offset,
    });
    return result;
  }

  async getRandomRecords(count: number) {
    const result: Acronym[] = await this.acronymRepository
      .createQueryBuilder()
      .select('*')
      .from<Acronym>(Acronym, 'a')
      .orderBy('Random()')
      .limit(count)
      .execute();

    return result;
  }

  async updateAcronym(acronym: string, update: Acronym) {
    //TODO after changing db structure to one to many have to handle updating
    const entity = await this.acronymRepository.findOne({
      where: { acronym: Like(acronym) },
    });

    if (!entity) {
      console.error('Error updating acronym, Acronym not found ');
      throw new NotFoundException('Acronym not found');
    }

    try {
      update.id = entity.id;
      const result = await this.acronymRepository.save(update);
      return result;
    } catch (err) {
      console.error('Error occurred updating record', err);
      throw new InternalServerErrorException('Error occurred updating record');
    }
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

  //TODO The relationship for one acronym is to many definitions, need to handle that in the db
  //when prepopulating data have to handle that by checking for duplicates
  private fetchJSONData() {
    return new Promise<Acronym[]>((resolve, reject) => {
      try {
        const data = fs.readFileSync(
          path.join(__dirname, '../../') + 'seedData.json',
          'utf8',
        );

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
      } catch (err) {
        reject(err);
      }
    });
  }
}
