export interface HisPatientsObservationsResponse {
  ObservationInfo: {
    HN: string;
    PatientID: string;
    VN: string;
  EpisodeID: string | null;
    VisitDate: string;
    Height: string;
    Weight: string;
    BMI: string;
  }[];
}
