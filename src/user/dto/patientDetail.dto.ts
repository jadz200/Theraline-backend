import { Notes } from '../schema/notes.schema';

export class PatientDetail {
  _id: string;

  firstName: string;

  lastName: string;

  email: string;

  image?: string;

  phone?: string;

  gender: string;

  birthday: Date;

  groups?: string[];

  doctors?: string[];

  notes?: Notes[];
}