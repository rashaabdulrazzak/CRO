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

export type YesNo = "yes" | "no" | null;

export type MixedAnswer = YesNo | boolean | string | null;
export type ActionDialogPayload = {
  userId: string | number | undefined;
  answers: MixedAnswer[];
  username: string;
  isApproved: boolean;
};