import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Like, Repository } from 'typeorm';
import { CreateAcronymDto } from './dto/createAcronym.dto';
import { UpdateAcronymDto } from './dto/updateAcronym.dto';
import { Acronym, AcronymDBState } from './entity/acronym.entity';
import { Definition } from './entity/definition.entity';

@Injectable()
export class AcronymService {
  constructor(
    @InjectRepository(Acronym) private acronymRepository: Repository<Acronym>,
    @InjectRepository(Definition)
    private definitionRepository: Repository<Definition>,
    @InjectRepository(AcronymDBState)
    private acronymDBStateRepository: Repository<AcronymDBState>,
  ) {}

  async createAcronym(acronym: CreateAcronymDto): Promise<Definition> {
    const prevSaved = await this.acronymRepository.find({
      where: { acronym: Like(acronym.acronym) },
    });

    if (prevSaved.length == 0) {
      const newAcronym = new Acronym();
      newAcronym.acronym = acronym.acronym;
      await this.acronymRepository.save(newAcronym);

      const newDefinition = new Definition();
      newDefinition.definition = acronym.definition;
      newDefinition.acronym = newAcronym;

      const savedDefinition = await this.definitionRepository.save(
        newDefinition,
      );

      return savedDefinition;
    }

    const newDefinition = new Definition();
    newDefinition.definition = acronym.definition;
    newDefinition.acronym = prevSaved[0];

    const savedDefinition = await this.definitionRepository.save(newDefinition);
    return savedDefinition;
  }

  async getAcronymDefinition(acronym: string) {
    const result = await this.acronymRepository.find({
      where: { acronym: Like(acronym) },
      relations: ['definitions'],
    });
    return result;
  }

  async searchAcronym(acronym: string, offset: number = 0, limit: number = 10) {
    const result = await this.acronymRepository.findAndCount({
      where: { acronym: Like(`%${acronym}%`) },
      relations: ['definitions'],
      take: limit > 10 ? 10 : limit,
      skip: offset,
    });
    return result;
  }

  async getRandomRecords(count: number) {
    const result: Acronym[] = await this.acronymRepository
      .createQueryBuilder()
      .select(['acronymId', 'acronym', 'definitionId', 'definition'])
      .innerJoin(Definition, 'd')
      .limit(count)
      .orderBy('Random()')
      .execute();

    return result;
  }

  async updateAcronym(acronym: string, update: UpdateAcronymDto) {
    const acronymRecord = await this.acronymRepository.findOne({
      where: { acronym: Like(acronym) },
      relations: ['definitions'],
    });

    if (!acronymRecord) {
      console.error('Error updating acronym, Acronym not found ');
      throw new NotFoundException('Acronym not found');
    }

    const acronymDefinition = await this.definitionRepository.findOne({
      where: { definitionId: update.definitionId },
    });

    if (!acronymDefinition) {
      console.error(
        'Error updating acronym definition, Acronym definition not found ',
      );
      throw new NotFoundException('Acronym Definition not found');
    }

    try {
      acronymDefinition.definition = update.definition;
      const result = await this.definitionRepository.save(acronymDefinition);
      return result;
    } catch (err) {
      console.error('Error occurred updating record', err);
      throw new InternalServerErrorException('Error occurred updating record');
    }
  }

  async deleteAcronym(acronym: string) {
    const acronymObj = await this.acronymRepository.findOne({
      where: { acronym: Like(acronym) },
    });

    return await this.acronymRepository.remove(acronymObj);
  }

  async bootStrapDBWithInitialData() {
    const status = await this.acronymDBStateRepository.findOne({
      where: { id: '1' },
    });

    if (status && status.id == '1' && status.hasPreLoadedAcronym) {
      return;
    }

    const acronymsEntity = await this.fetchJSONData();

    acronymsEntity.forEach(async (definitions, acronym) => {
      const newAcronym = new Acronym();
      newAcronym.acronym = acronym;
      await this.acronymRepository.save(newAcronym);

      definitions.forEach(definition => {
        definition.acronym = newAcronym;
      });
      await this.definitionRepository.save(definitions);
    });

    const acronymStatus = new AcronymDBState();
    acronymStatus.id = '1';
    acronymStatus.hasPreLoadedAcronym = true;

    await this.acronymDBStateRepository.save(acronymStatus);
  }

  private fetchJSONData() {
    return new Promise<Map<string, Definition[]>>((resolve, reject) => {
      try {
        const data = fs.readFileSync(
          path.join(__dirname, '../../') + 'seedData.json',
          'utf8',
        );

        let acronyms: {
          [acronym: string]: string;
        }[] = JSON.parse(data);

        const acronymsMap = new Map<string, Definition[]>();

        // After parsing the initial JSON record,
        // some acronyms have multiple definitions
        // group them in a map
        acronyms.forEach(acronym => {
          const acronymKey = Object.keys(acronym)[0];

          const definitionObj = new Definition();
          definitionObj.definition = Object.values(acronym)[0];

          if (acronymsMap.has(acronymKey)) {
            acronymsMap.get(acronymKey).push(definitionObj);
            return;
          }

          acronymsMap.set(acronymKey, [definitionObj]);
        });

        resolve(acronymsMap);
      } catch (err) {
        reject(err);
      }
    });
  }
}
