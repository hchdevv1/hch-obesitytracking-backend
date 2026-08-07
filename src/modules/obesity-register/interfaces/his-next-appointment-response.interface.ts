export interface HisNextAppointmentResponse {
  AppointmentInfo: HisAppointmentInfo | null;
}

export interface HisAppointmentInfo {
  HN: string;
  PatientID: string;
  ApptDate: string;
  ApptTime: string;
  LocationCode: string;
  Location: string;
}
