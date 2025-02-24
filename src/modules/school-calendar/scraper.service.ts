import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ScraperService {
  private readonly ACADEMIC_CALENDAR_URL = 'https://www.sp.edu.sg/sp/student-services/academic-calendar';

  async scrapeAcademicDates(): Promise<string[]> {
    try {
      const { data } = await axios.get(this.ACADEMIC_CALENDAR_URL);
      const $ = cheerio.load(data);
      const dates: string[] = [];

      $('table tbody tr').each((_, element) => {
        const dateText = $(element).find('td').eq(1).text().trim();
        if (dateText) {
          dates.push(dateText);
        }
      });

      return dates;
    } catch (error) {
      console.error('Error scraping academic dates:', error);
      throw new Error('Failed to scrape academic dates');
    }
  }
}
