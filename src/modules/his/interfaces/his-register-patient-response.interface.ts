export interface HisRegisterPatientResponse {
  PatientInfo: {
    HN: string;
    PatientID: string;
    Fullname: string;
    Gender: string;
    DOB: string;
    VN: string;
    EpisodeID: number | null;
    VisitDate: string;
    LocationCode: string;
    Location: string;
    CareproviderCode: string;
    Careprovider: string;
    Height: string;
    Weight: string;
    BMI: string;
  };
}
