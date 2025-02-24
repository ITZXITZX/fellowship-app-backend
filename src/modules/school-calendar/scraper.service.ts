import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as moment from 'moment'; // Install using `npm install moment`


/**
 * Service responsible for scraping academic calendar data from a URL.
 * It extracts various types of academic dates, including vacation periods and filtered dates.
 */
@Injectable()
export class ScraperService {
  private readonly ACADEMIC_CALENDAR_URL = 'https://www.sp.edu.sg/sp/student-services/academic-calendar';

  /**
   * Scrapes the academic calendar to retrieve events and their associated date ranges.
   * Each event is represented as a tuple with the event name and date range.
   * @returns {Promise<[string, string][]>} A promise that resolves to an array of tuples containing the event names and their corresponding date ranges.
   */
  async scrapeAcademicDates(): Promise<[string, string][]> {
    try {
      const { data } = await axios.get(this.ACADEMIC_CALENDAR_URL);
      const $ = cheerio.load(data);
      const eventsAndDates: [string, string][] = [];

      $('table tbody tr').each((_, element) => {
        let eventText = $(element).find('td').eq(0).text().trim();
        eventText = eventText.replace(/\s+/g, ' '); // Normalize spacing

        const dateText = $(element).find('td').eq(1).text().trim();

        if (eventText && dateText) {
          eventsAndDates.push([eventText, dateText]);
        }
      });

      return eventsAndDates;
    } catch (error) {
      console.error('Error scraping academic dates:', error);
      throw new Error('Failed to scrape academic dates');
    }
  }

  /**
   * Scrapes only the vacation periods from the academic calendar.
   * Filters out events that are not labeled as "Vacation".
   * @returns {Promise<string[]>} A promise that resolves to an array of vacation date ranges as strings.
   */
  async scrapeFilteredVacationDates(): Promise<string[]> {
    const eventsAndDates = await this.scrapeAcademicDates();

    // Extract vacation periods
    const vacationPeriods = eventsAndDates
      .filter(([event, _]) => event.toLowerCase() === "vacation")
      .map(([_, date]) => date);

    return vacationPeriods;
  }

  /**
   * Scrapes the vacation date ranges as tuples (start date, end date).
   * Each tuple is formatted as ["D MMM YYYY", "D MMM YYYY"].
   * @returns {Promise<[string, string][]>} A promise that resolves to an array of tuples representing the vacation date ranges.
   */
  async scrapeVacationDateRanges(): Promise<[string, string][]> {
    const eventsAndDates = await this.scrapeAcademicDates();
  
    // Extract and convert vacation periods into tuple format
    const vacationRanges = eventsAndDates
      .filter(([event, _]) => event.toLowerCase() === "vacation")
      .map(([_, date]) => this.parseDateRange(date)) // Convert to tuple
      .map(([start, end]) => [start.format("D MMM YYYY"), end.format("D MMM YYYY")] as [string, string]); // Ensure tuple type
  
    return vacationRanges;
  }
  
  /**
   * Parses a date range string (e.g., "1 Jan 2025 - 31 Dec 2025") and returns the start and end date as Moment objects.
   * @param dateStr The date range string to parse.
   * @returns { [moment.Moment, moment.Moment] } A tuple containing Moment objects for the start and end date.
   */
  private parseDateRange(dateStr: string): [moment.Moment, moment.Moment] {
    const [startStr, endStr] = dateStr.split(' - ');
    return [moment(startStr, "D MMM YYYY"), moment(endStr, "D MMM YYYY")];
  }

  /**
   * Scrapes and filters academic dates, excluding vacation periods.
   * The result contains non-vacation periods in the academic year.
   * @returns {Promise<string[]>} A promise that resolves to a list of non-vacation periods in the academic year.
   */
  async scrapeFilteredAcademicDates(): Promise<string[]> {
    const eventsAndDates = await this.scrapeAcademicDates();

    if (eventsAndDates.length === 0) {
      return [];
    }

    // Find full academic year range
    const allDates = eventsAndDates.map(([_, date]) => date);
    const firstDate = moment(allDates[0], "D MMM YYYY"); // Start of the academic year
    const lastDate = moment(allDates[allDates.length - 1], "D MMM YYYY"); // End of the academic year

    // Find vacation periods
    const vacationRanges = eventsAndDates
      .filter(([event, _]) => event.toLowerCase() === "vacation")
      .map(([_, date]) => this.parseDateRange(date)); // Convert vacation date string to moment range

    // Calculate non-vacation periods
    const availablePeriods = this.calculateNonVacationPeriods(firstDate, lastDate, vacationRanges);

    return availablePeriods.map(([start, end]) => `${start.format("D MMM YYYY")} - ${end.format("D MMM YYYY")}`);
  }

  /**
   * Calculates non-vacation periods within the academic year by excluding vacation ranges.
   * @param academicStart The start of the academic year.
   * @param academicEnd The end of the academic year.
   * @param vacations A list of vacation periods as Moment tuples.
   * @returns { [moment.Moment, moment.Moment][] } A list of non-vacation periods within the academic year.
   */
  private calculateNonVacationPeriods(
    academicStart: moment.Moment,
    academicEnd: moment.Moment,
    vacations: [moment.Moment, moment.Moment][]
  ): [moment.Moment, moment.Moment][] {
    const availablePeriods: [moment.Moment, moment.Moment][] = [];
    let currentStart = academicStart.clone();

    for (const [vacStart, vacEnd] of vacations) {
      if (currentStart.isBefore(vacStart)) {
        availablePeriods.push([currentStart, vacStart.clone().subtract(1, 'days')]); // Period before vacation
      }
      currentStart = vacEnd.clone().add(1, 'days'); // Resume after vacation
    }

    // Add the last remaining period
    if (currentStart.isBefore(academicEnd)) {
      availablePeriods.push([currentStart, academicEnd]);
    }

    return availablePeriods;
  }
}
