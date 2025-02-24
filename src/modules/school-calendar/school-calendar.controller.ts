import { Controller, HttpCode, HttpStatus, Post, Get } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { ScraperService } from './scraper.service';

@Controller('school-calendar')
export class SchoolCalendarController {
  constructor(private readonly scraperService: ScraperService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('academic-dates')
  async getAcademicDates() {
    return await this.scraperService.scrapeAcademicDates();
  }


  // API 2: Get filtered academic dates (excluding "Vacation")
  @HttpCode(HttpStatus.OK)
  @Public()
  @Get('filtered-academic-dates')
  async getFilteredAcademicDates() {
    return this.scraperService.scrapeFilteredAcademicDates();
  }
}
