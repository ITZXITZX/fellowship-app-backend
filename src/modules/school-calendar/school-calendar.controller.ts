import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { Public } from 'src/decorators/public.decorator';

@Controller('school-calendar')
export class SchoolCalendarController {
  constructor(private readonly scraperService: ScraperService) {}

  /**
   * Retrieves a list of academic dates from the scraper service.
   * @returns {Promise<[string, string][]>} A list of tuples with academic event names and their corresponding date ranges.
   */
  @HttpCode(HttpStatus.OK)
  @Public()
  @Get('academic-dates')
  async getAcademicDates() {
    return this.scraperService.scrapeAcademicDates();
  }

  /**
   * Retrieves a list of filtered vacation dates, excluding non-vacation periods.
   * @returns {Promise<string[]>} A list of vacation date ranges as strings.
   */
  @HttpCode(HttpStatus.OK)
  @Public()
  @Get('filtered-vacation-dates')
  async getFilteredVacationDates() {
    return this.scraperService.scrapeFilteredVacationDates();
  }

  /**
   * Retrieves a list of vacation date ranges as tuples (start date, end date).
   * @returns {Promise<[string, string][]>} A list of vacation date ranges as tuples of strings.
   */
  @HttpCode(HttpStatus.OK)
  @Public()
  @Get('vacation-date-ranges')
  async getVacationDateRanges() {
    return this.scraperService.scrapeVacationDateRanges();
  }

  /**
   * Retrieves a list of filtered academic dates, excluding vacation periods.
   * @returns {Promise<string[]>} A list of academic date ranges excluding vacation periods.
   */
  @HttpCode(HttpStatus.OK)
  @Public()
  @Get('filtered-academic-dates')
  async getFilteredAcademicDates() {
    return this.scraperService.scrapeFilteredAcademicDates();
  }
}
