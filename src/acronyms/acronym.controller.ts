import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/Auth/auth.guard';
import { AcronymService } from './acronym.service';
import { CreateAcronymDto } from './dto/createAcronym.dto';
import { HTTPResponseDto } from './dto/response.dto';
import { UpdateAcronymDto } from './dto/updateAcronym.dto';
import { Acronym } from './entity/acronym.entity';
import { Definition } from './entity/definition.entity';

@Controller('acronym')
export class AcronymController {
  constructor(private readonly acronymService: AcronymService) {}

  @Get()
  async searchAcronyms(
    @Query('search') search: string,
    @Query('from') from: string,
    @Query('limit') limit: string,
    @Res() res,
  ) {
    try {
      const resp = await this.acronymService.searchAcronym(
        search,
        parseInt(from),
        parseInt(limit),
      );

      res.set('X-Pagination-Count', resp.totalNoPages);
      res.set('X-Pagination-Page', resp.currentPageAtOffSet);
      res.set('X-Pagination-Limit', resp.pageLimit);
      res.set('X-More-Records', resp.currentPageAtOffSet < resp.totalNoPages);
      res.set('X-Total-Records', resp.totalRecords);
      res.send(new HTTPResponseDto<Acronym[]>(200, resp.results, null));
    } catch (e) {
      console.error('Error occurred search for Acronym ', e);
      throw new InternalServerErrorException('Unable to search for acronym');
    }
  }

  @Post()
  async addAcronym(@Body() payload: CreateAcronymDto) {
    try {
      const resp = await this.acronymService.createAcronym(payload);
      return new HTTPResponseDto<Definition>(200, resp, null);
    } catch (e) {
      console.error('Error occurred creating a new Acronym ', e);
      throw new InternalServerErrorException('Unable to save acronym');
    }
  }

  @Get(':acronym')
  async getAcronym(@Param('acronym') acronym: string) {
    try {
      const resp = await this.acronymService.getAcronymDefinition(acronym);
      return new HTTPResponseDto<Acronym[]>(200, resp, null);
    } catch (e) {
      console.error('Error occurred retrieving Acronym ', e);
      throw new InternalServerErrorException('Unable to retrieve acronym');
    }
  }

  @Get('random/:count')
  async getRandom(@Param('count') count: number) {
    try {
      const resp = await this.acronymService.getRandomRecords(count);
      return new HTTPResponseDto<Acronym[]>(200, resp, null);
    } catch (e) {
      console.error('Error occurred retrieving Acronym ', e);
      throw new InternalServerErrorException('Unable to retrieve acronym');
    }
  }

  @Put(':acronym')
  @UseGuards(AuthGuard)
  async updateAcronym(
    @Param('acronym') acronym: string,
    @Body() payload: UpdateAcronymDto,
  ) {
    if (!payload || !payload.definitionId || !payload.definition) {
      throw new BadRequestException('Missing definitionId or definition');
    }

    const resp = await this.acronymService.updateAcronym(acronym, payload);
    return new HTTPResponseDto<Definition>(200, resp, null);
  }

  @Delete(':acronym')
  @UseGuards(AuthGuard)
  async deleteAcronym(@Param('acronym') acronym: string) {
    try {
      await this.acronymService.deleteAcronym(acronym);
      return new HTTPResponseDto<null>(200, null, null);
    } catch (e) {
      console.error('Error occurred deleting Acronym ', e);
      throw new NotFoundException('Acronym does not exist');
    }
  }
}
