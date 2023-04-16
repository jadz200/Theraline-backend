export class patientInfo {
  firstName: string;
  lastName: string;
  email: string;
  image?: string;
  nextAppointment?: any;
  lastAppointment?: any;
}
export class patientList {
  list: patientInfo[];
}
