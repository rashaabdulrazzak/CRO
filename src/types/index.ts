export const roleOptions = [
  { label: "Monitor", value: "Monitor" },
  { label: "Biostatistician", value: "Biostatistician" },
  { label: "Site coordinator", value: "Site coordinator" },
  { label: "Radiologist", value: "Radiologist" },
  { label: "Patolog coordinator", value: "Patolog coordinator" },
  { label: "Admin", value: "Admin" },
];
export type UserRecord = {
  id: string | number;
  name: string;
  age: number;
  country: string;
  city: string;
  weight: number;
  lenght: number;
  create_date: string;
  modify_date: string;
  status: string;
};
export type YesNo = "yes" | "no" |  null;
export type Sex = "male" | "female" | "not-specify" | "";
export type MixedAnswer = YesNo | boolean | string | null;
export type ActionDialogPayload = {
  userId: string | number | undefined;
  answers: MixedAnswer[];
  username: string;
  isApproved: boolean;
};

export interface DemographicForm {
  volunteerCode: string; // TRxxxxx (strict)
  nameSurname: string;
  protocolNo: string; // e.g. DSTR-2023
  visitDate: Date | null; // first visit (USG)
  secondVisitDate: Date | null; // second visit (pathology)
  gender: Sex;
  birthDate: Date | null;
  weight: string;
  size: string;
  bodyMassIndex: string;
  referredFrom: string;
  usgDevice: string; // device/probe details

  // Optional quick questions
  question1: YesNo;
  question2: YesNo;
  question3: YesNo;
  question4: YesNo;
  question5: YesNo;
}

export const emptyDemographicForm: DemographicForm = {
  volunteerCode: "",
  nameSurname: "",
  protocolNo: "",
  visitDate: null,
  secondVisitDate: null,
  gender: "",
  birthDate: null,
  weight: "",
  size: "",
  bodyMassIndex: "",
  referredFrom: "",
  usgDevice: "",

  question1: null,
  question2: null,
  question3: null,
  question4: null,
  question5: null,
};
export interface MedicalHistoryForm {
  medicalQuestion1: YesNo;
  diseaseType: string;
}
export const emptyMedicalHistoryForm: MedicalHistoryForm = {
  medicalQuestion1: null,
  diseaseType: "",
};
export type InclusionForm = {
  ageOver18: boolean | null;
  thyroidNoduleSuspicion: boolean | null;
  bgofVolunteer: boolean | null;
  notRestricted: boolean | null;
};

export type ExclusionForm = {
  ageUnder18: boolean | null;
  nonBgofVolunteer: boolean | null;
  restricted: boolean | null;
  baskaclinikcalismadayerolmak: boolean | null;
  tiroidBeziIleIlgiliOperasyon: boolean | null;
  diffuzParenkimalOlgular: boolean | null;
  birNoduluTespitEdilemeyenOlgular: boolean | null;
};