import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Acronym } from './acronym.entity';
import { AcronymService } from './acronym.service';

@Controller('acronym')
export class AcronymController {
  constructor(private readonly acronymService: AcronymService) {}

  @Post()
  async addAcronym(
    @Body('acronym') acronym: string,
    @Body('definition') definition: string,
  ) {
    const newAcronym = new Acronym();
    newAcronym.acronym = acronym;
    newAcronym.definition = definition;

    const resp = await this.acronymService.createAcronym(newAcronym);
    return resp;
  }

  @Get(':acronym')
  async getAcronym(@Param('acronym') acronym: string) {
    return await this.acronymService.getAcronymDefinition(acronym);
  }
}
