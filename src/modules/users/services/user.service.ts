// services/mentee.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { menteeDb, mentorToMenteeMapDb } from '../../../hacked-database';
import { Mentee } from '../domain/mentee';
import { Mentor } from '../domain/mentor';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UserService {
  constructor(@Inject() private usersRepository: UsersRepository) {}

  async attachMenteeToMentor(mentorId: string, menteeId: string) {
    // Check if mentee already exists
    if (mentorToMenteeMapDb[mentorId] == null) {
      Logger.warn('MentorId not found, add a mentor first.');
    }
    if (mentorToMenteeMapDb[mentorId].includes(menteeId)) {
      Logger.warn(' Mentee already exist for this Mentor.');
    }

    // Add mentee's events to the mentorToMenteeMapDb
    mentorToMenteeMapDb[mentorId].push(menteeId);
    Logger.log(
      `Added new mentee to mentorToMenteeMapDb - ${mentorId} - ${menteeId}`,
    );
  }

  async createNewMentee(
    mentorId: string,
    name: string,
    birthdate: Date,
    email: string,
  ) {
    const newMentee = new Mentee({ name, birthdate, email });

    const createdMenteeEntity =
      await this.usersRepository.createUser(newMentee);
    newMentee.id = createdMenteeEntity.id;

    await this.usersRepository.setMenteeForMentorUser(
      mentorId,
      createdMenteeEntity.id,
    );

    return newMentee;
  }

  generateNewMenteeId(): string {
    const newIndex = Object.keys(menteeDb).length + 1;
    return 'mentee-' + newIndex;
  }

  deleteMentee(mentorId: string, menteeId: string) {
    // Check if mentee already exists
    if (mentorToMenteeMapDb[mentorId] == null) {
      Logger.warn('MentorId not found, add a mentor first.');
    }

    const menteeList = mentorToMenteeMapDb[mentorId];
    const menteeIndex = menteeList.findIndex((id) => id === menteeId);
    if (menteeIndex !== -1) {
      menteeList.splice(menteeIndex, 1);
    }
    Logger.log(`Deleted mentee - ${mentorId} - ${menteeId}`);
  }

  getAllMentees(mentorId: string) {
    // Check if mentee already exists
    if (mentorToMenteeMapDb[mentorId] == null) {
      Logger.warn('MentorId not found, add a mentor first.');
    }

    const menteeList = mentorToMenteeMapDb[mentorId];
    if (menteeList) {
      Logger.log(`Found ${menteeList.length} mentees for mentor ${mentorId}`);
      return { mentorId, mentees: menteeList }; // Return mentorId and mentees in JSON format
    } else {
      Logger.warn(`No mentees found for mentor ${mentorId}`);
      return {
        mentorId,
        mentees: [],
        message: `No mentees found for mentor ${mentorId}`,
      }; // Empty array
    }
  }

  async createNewMentor(
    name: string,
    birthdate: Date,
    email: string,
    userName: string,
    pass: string,
  ) {
    const newMentor = new Mentor({ name, birthdate, email });

    return this.usersRepository.createUser(newMentor, userName, pass);
  }

  async getMentor(mentorId: string) {
    return this.usersRepository.findMentorById(mentorId);
  }

  async getUserByUsername(userName: string) {
    return this.usersRepository.findUserByUserName(userName);
  }
}