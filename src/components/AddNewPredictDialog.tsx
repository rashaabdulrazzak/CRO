/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Steps } from "primereact/steps";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { RadioButton } from "primereact/radiobutton";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import { getNextImageNumber } from "../lib/mockData";
import { CriteriaItem } from "./CriteriaItem";

// ================== CONFIG ==================
const USE_BACKEND = false; // switch to true when your API is ready

// ================== TYPES ==================
type Sex = "male" | "female" | "not-specify" | "";
type YesNo = "yes" | "no" | "";

// Step 0
interface DemographicForm {
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

// Step 1
interface MedicalHistoryForm {
  medicalQuestion1: YesNo;
  howManyYears: string;
  medicalQuestion2: YesNo | "";
  medicalQuestion3: YesNo | "";
  medicalQuestion4: YesNo;
  diseaseType: string;
  medicalQuestion5: YesNo | "";
}

// Step 2–3 (booleans)
type InclusionForm = {
  ageOver18: boolean | null;
  thyroidNoduleSuspicion: boolean | null;
  bgofVolunteer: boolean | null;
  notRestricted: boolean | null;
};

const initialInc: InclusionForm = {
  ageOver18: null,
  thyroidNoduleSuspicion: null,
  bgofVolunteer: null,
  notRestricted: null,
};

type ExclusionForm = {
  ageUnder18: boolean | null;
  nonBgofVolunteer: boolean | null;
  restricted: boolean | null;
  baskaclinikcalismadayerolmak: boolean | null;
  tiroidBeziIleIlgiliOperasyon: boolean | null;
  diffuzParenkimalOlgular: boolean | null;
  birNoduluTespitEdilemeyenOlgular: boolean | null;
};


// step 6 
 const radiologistOptions = [
    { label: 'Radiologist 1', value: 'radiologist1' },
    { label: 'Radiologist 2', value: 'radiologist2' },
    { label: 'Radiologist 3', value: 'radiologist3' }
  ];

type UploadedPhoto = string; // dataURL or stub URL

// Final “records” kept in localStorage
interface LSPatient {
  id: number;
  code?: string;
  name: string;
  age?: number | null;
  sex?: "male" | "female";
  createdAt: string;
}
interface LSCase {
  id: number;
  patientId: number;
  imageId: string;
  createdAt: string;
}
interface LSForm {
  id: number;
  caseId: number;
  type: string;
  version: string;
  data: any;
  createdAt: string;
}
interface LSUpload {
  id: number;
  caseId: number;
  kind: string;
  url: string;
  contentType?: string;
  createdAt: string;
}

// ================== HELPERS ==================
const lsGet = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const lsSet = (key: string, value: any) =>
  localStorage.setItem(key, JSON.stringify(value));
const nextId = (items: { id: number }[]) =>
  items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;

const calcAgeFromDate = (d: Date | null): number | null => {
  if (!d) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
};


// Volunteer ID: TR + 5 digits
const VOL_ID_RE = /^TR\d{5}$/;
const normalizeVolunteerCode = (raw: string) => {
  const s = (raw || "").trim().toUpperCase();
  if (VOL_ID_RE.test(s)) return s;
  const digits = s.replace(/\D/g, "");
  return digits ? `TR${digits.padStart(5, "0")}` : s;
};
const makeImageId = (code: string, idxZeroBased = 0) =>
  `${code}-${String(idxZeroBased + 1).padStart(2, "0")}`;

// backend helper
const api = async (url: string, method: string, body?: any) => {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ================== COMPONENT ==================
interface AddNewPredictDialogProps {
  visible: boolean;
  onHide: () => void;
  currentRole :"field_coordinator" | "radiologist" | "monitor" | "patolog_coordinator" | "biostatistician";
}

export const AddNewPredictDialog: React.FC<AddNewPredictDialogProps> = ({
  visible,
  onHide,
  currentRole
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const toast = useRef<Toast>(null);
console.log(currentRole)
  // ---- initial states
  const initialDemographic: DemographicForm = useMemo(
    () => ({
      volunteerCode: "",
      nameSurname: "",
      protocolNo: "DSTR-2023",
      visitDate: null,
      secondVisitDate: null,
      gender: "",
      birthDate: null,
      weight: "72",
      size: "173",
      bodyMassIndex: "24.16",
      referredFrom: "Radiology Clinic",
      usgDevice: "",
      question1: "",
      question2: "",
      question3: "",
      question4: "",
      question5: "",
    }),
    []
  );
  const initialMed: MedicalHistoryForm = useMemo(
    () => ({
      medicalQuestion1: "no",
      howManyYears: "1",
      medicalQuestion2: "",
      medicalQuestion3: "",
      medicalQuestion4: "no",
      diseaseType: "",
      medicalQuestion5: "",
    }),
    []
  );

  const initialExc: ExclusionForm = {
    ageUnder18: null,
    nonBgofVolunteer: null,
    restricted: null,
    baskaclinikcalismadayerolmak: null,
    tiroidBeziIleIlgiliOperasyon: null,
    diffuzParenkimalOlgular: null,
    birNoduluTespitEdilemeyenOlgular: null,
  };

 

  // ---- state
  const draftKey = "app.addPredictDraft";
  const [demographic, setDemographic] = useState<DemographicForm>(initialDemographic);
  const [medical, setMedical] = useState<MedicalHistoryForm>(initialMed);
  const [inclusion, setInclusion] = useState<InclusionForm>(initialInc);
  const [exclusion, setExclusion] = useState<ExclusionForm>(initialExc);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);

  const [patientId, setPatientId] = useState<number | null>(null);
  const [caseId, setCaseId] = useState<number | null>(null);
  const [selectedRadiologist, setSelectedRadiologist] = useState<string>(radiologistOptions[0].value);

  // ---- load draft + revive dates
  useEffect(() => {
    const d = lsGet<any | null>(draftKey, null);
    if (d) {
      setActiveIndex(d.activeIndex ?? 0);
      const reviveDate = (v: any) => (v ? new Date(v) : null);
      const dm = { ...initialDemographic, ...(d.demographic || {}) };
      dm.birthDate = reviveDate(dm.birthDate);
      dm.visitDate = reviveDate(dm.visitDate);
      dm.secondVisitDate = reviveDate(dm.secondVisitDate);
      setDemographic(dm);
      setMedical({ ...initialMed, ...(d.medical || {}) });
      setInclusion({ ...initialInc, ...(d.inclusion || {}) });
      setExclusion({ ...initialExc, ...(d.exclusion || {}) });
    
      setUploadedPhotos(d.uploadedPhotos || []);
      setPatientId(d.patientId ?? null);
      setCaseId(d.caseId ?? null);
      setSelectedRadiologist(d.selectedRadiologist || radiologistOptions[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- autosave draft
  useEffect(() => {
    lsSet(draftKey, {
      activeIndex,
      demographic,
      medical,
      inclusion,
      exclusion,
      uploadedPhotos,
      patientId,
      caseId,
      selectedRadiologist
    });
  }, [activeIndex, demographic, medical, inclusion, exclusion, uploadedPhotos,selectedRadiologist, patientId, caseId]);

  // ---- localStorage “collections”
  const patientsKey = "app.patients";
  const casesKey = "app.cases";
  const formsKey = "app.forms";
  const uploadsKey = "app.uploads";

  const createPatientLocal = (payload: Omit<LSPatient, "id" | "createdAt">): LSPatient => {
    const list = lsGet<LSPatient[]>(patientsKey, []);
    const p: LSPatient = { id: nextId(list), createdAt: new Date().toISOString(), ...payload };
    lsSet(patientsKey, [...list, p]);
    return p;
  };
  const createCaseLocal = (payload: Omit<LSCase, "id" | "createdAt">): LSCase => {
    const list = lsGet<LSCase[]>(casesKey, []);
    const c: LSCase = { id: nextId(list), createdAt: new Date().toISOString(), ...payload };
    lsSet(casesKey, [...list, c]);
    return c;
  };
  const createUploadLocal = (payload: Omit<LSUpload, "id" | "createdAt">): LSUpload => {
    const list = lsGet<LSUpload[]>(uploadsKey, []);
    const u: LSUpload = { id: nextId(list), createdAt: new Date().toISOString(), ...payload };
    lsSet(uploadsKey, [...list, u]);
    return u;
  };
  const createFormLocal = (payload: Omit<LSForm, "id" | "createdAt">): LSForm => {
    const list = lsGet<LSForm[]>(formsKey, []);
    const f: LSForm = { id: nextId(list), createdAt: new Date().toISOString(), ...payload };
    lsSet(formsKey, [...list, f]);
    return f;
  };

  // ---- steps model
  const steps = [
    { label: "Demographic Information" },
    { label: "Medical History" },
    { label: "Inclusion Criteria" },
    { label: "Exclusion Criteria" },
    { label: "Upload Photo" },
    { label: "Choose Radiologist" },
  ];

  // Role per step (from protocol)
  // const stepRole = ["Hekim", "Koordinatör", "Hekim", "Hekim", "Koordinatör", "Hekim"] as const;

  const referralOptions = [
    { label: "Radiology Clinic", value: "Radiology Clinic" },
    { label: "Emergency Department", value: "Emergency Department" },
    { label: "General Practice", value: "General Practice" },
  ];
  const yearsOptions = ["1", "2", "3", "4", "5"].map((v) => ({ label: v, value: v }));

  // ================== ACTIONS ==================
  const handleDialogClose = () => {
    resetFormToInitialState();
    onHide();
  };

  const resetFormToInitialState = () => {
    setActiveIndex(0);
    setDemographic(initialDemographic);
    setMedical(initialMed);
    setInclusion(initialInc);
    setExclusion(initialExc);
    setUploadedPhotos([]);
    setPatientId(null);
    setCaseId(null);
    localStorage.removeItem(draftKey);
  };

  const generateVolunteerId = () => {
    const next = getNextImageNumber();
    setDemographic((prev) => ({ ...prev, volunteerCode: normalizeVolunteerCode(next) }));
  };

  const toastRef = toast;
  const showError = (detail: string) =>
    toastRef.current?.show({ severity: "error", summary: "Hata", detail, life: 3000 });
  const showInfo = (detail: string) =>
    toastRef.current?.show({ severity: "info", summary: "Bilgi", detail, life: 2000 });
  const showSuccess = (detail: string) =>
    toastRef.current?.show({ severity: "success", summary: "Başarılı", detail, life: 2500 });

  const handleSaveAndNext = async () => {
  try {
    // STEP 0: create patient with validations
    if (activeIndex === 0) {
      const code = normalizeVolunteerCode(demographic.volunteerCode);
      if (!VOL_ID_RE.test(code)) {
        showError("Gönüllü ID formatı TR00000 olmalıdır (ör. TR00001).");
        return;
      }
      if (!demographic.nameSurname?.trim()) {
        showError("Name Surname zorunludur.");
        return;
      }
      setDemographic((prev) => ({ ...prev, volunteerCode: code }));

      const age = calcAgeFromDate(demographic.birthDate);
      const sex =
        demographic.gender === "male" ? "male" : demographic.gender === "female" ? "female" : undefined;

      const localPatient = createPatientLocal({
        code,
        name: demographic.nameSurname.trim(),
        age,
        sex,
      });
      setPatientId(localPatient.id);

      if (USE_BACKEND) {
        await api("/patients", "POST", { name: demographic.nameSurname.trim(), age, sex, code });
      }
      setActiveIndex(1);
      showInfo("Hasta oluşturuldu.");
      return;
    }

    // STEP 1 (Medical History): Just advance
    if (activeIndex === 1) {
      setActiveIndex(2);
      return;
    }

    // STEP 2 (Inclusion): ALL must be true; also ensure all answered
    if (activeIndex === 2) {
      const values = Object.values(inclusion);
      if (values.some((v) => v === null)) {
        showError("Lütfen tüm dahil etme kriterlerini yanıtlayın.");
        return;
      }
      const allTrue = values.every((v) => v === true);
      if (!allTrue) {
        showError("Dahil etme kriterlerinin tamamı 'Evet' olmalıdır. Hasta eklenemez.");
        return;
      }
      setActiveIndex(3);
      return;
    }

    // STEP 3 (Exclusion): ANY true means exclude; ensure all answered
    if (activeIndex === 3) {
      const values = Object.values(exclusion);
      if (values.some((v) => v === null)) {
        showError("Lütfen tüm hariç tutma kriterlerini yanıtlayın.");
        return;
      }
      const anyTrue = values.some((v) => v === true);
      if (anyTrue) {
        showError("Hariç tutma kriterlerinden biri veya daha fazlası 'Evet'. Hasta eklenemez.");
        return;
      }
      setActiveIndex(4);
      return;
    }

    // STEP 4 (Upload Photo): Validate images and advance
    if (activeIndex === 4) {
      if (!patientId) {
        showError("Hasta oluşturulamadı. Lütfen baştan deneyin.");
        return;
      }
      if (!uploadedPhotos.length) {
        showError("Lütfen en az bir USG görüntüsü yükleyin.");
        return;
      }
      setActiveIndex(5);
      return;
    }

    // FINAL STEP 5 (Radiologist Selection): Validate and save EVERYTHING
    if (activeIndex === 5) {
      if (!selectedRadiologist) {
        showError("Please select a radiologist.");
        return;
      }

      // NOW save all data since all steps are complete
      const base = normalizeVolunteerCode(demographic.volunteerCode);
      const caseImageId = makeImageId(base, 0);
      const localCase = createCaseLocal({ patientId, imageId: caseImageId });
      setCaseId(localCase.id);

      if (USE_BACKEND) {
        await api("/cases", "POST", { patientId, imageId: caseImageId });
      }

      // Uploads numbered TRxxxxx-01, -02, ...
      for (let i = 0; i < uploadedPhotos.length; i++) {
        const imgId = makeImageId(base, i);
        const url = uploadedPhotos[i]?.startsWith("data:")
          ? `local://${imgId}`
          : uploadedPhotos[i] || `local://${imgId}`;
        createUploadLocal({ caseId: localCase.id, kind: "USG", url });
        if (USE_BACKEND) {
          await api(`/uploads/cases/${localCase.id}`, "POST", { kind: "USG", url, createdByUserId: 1 });
        }
      }

      // Visit/administrative form
      const visitPayload = {
        volunteerCode: base,
        protocolNo: demographic.protocolNo,
        visitDate: demographic.visitDate ? demographic.visitDate.toISOString().split("T")[0] : null,
        secondVisitDate: demographic.secondVisitDate
          ? demographic.secondVisitDate.toISOString().split("T")[0]
          : null,
        referredFrom: demographic.referredFrom,
        usgDevice: demographic.usgDevice,
        bmi: demographic.bodyMassIndex,
        weight: demographic.weight,
        size: demographic.size,
        extraQuestions: {
          q1: demographic.question1,
          q2: demographic.question2,
          q3: demographic.question3,
          q4: demographic.question4,
          q5: demographic.question5,
        },
        selectedRadiologist: selectedRadiologist,  // Add radiologist to payload
      };
      createFormLocal({ caseId: localCase.id, type: "CRF01-visit", version: "v1", data: visitPayload });
      if (USE_BACKEND) {
        await api(`/forms/cases/${localCase.id}`, "POST", {
          type: "CRF01-visit",
          version: "v1",
          data: visitPayload,
          createdByUserId: 1,
        });
      }

      // Eligibility form (medical + inclusion + exclusion)
      const eligibilityPayload = { medicalHistory: medical, inclusion, exclusion };
      createFormLocal({ caseId: localCase.id, type: "CRF01-eligibility", version: "v1", data: eligibilityPayload });
      if (USE_BACKEND) {
        await api(`/forms/cases/${localCase.id}`, "POST", {
          type: "CRF01-eligibility",
          version: "v1",
          data: eligibilityPayload,
          createdByUserId: 1,
        });
      }

      showSuccess("Kayıt tamamlandı.");
      resetFormToInitialState();
      onHide();
    }
  } catch (err: any) {
    console.error(err);
    showError(typeof err?.message === "string" ? err.message : "İşlem sırasında bir hata oluştu.");
  }
};


  // ================== UI RENDERERS ==================
  const renderStepContent = () => {
  switch (activeIndex) {
    case 0:
      return renderDemographicInformation();
    case 1:
      return renderMedicalHistory();
    case 2:
      return renderInclusionCriteria();
    case 3:
      return renderExclusionCriteria();
    case 4:
      return renderUploadPhoto();
    case 5:
      return renderAvailableRadiologist();  
    default:
      return <div className="text-center py-8 text-gray-500">Step content coming soon...</div>;
  }
};


  const renderDemographicInformation = () => (
    <>
      {/* ONE grid for all fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Volunteer ID + Generate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Volunteer ID (Gönüllü No)</label>
          <div className="flex gap-2">
            <InputText
              id="volunteerId"
              value={demographic.volunteerCode}
              onChange={(e) => setDemographic((prev) => ({ ...prev, volunteerCode: e.target.value }))}
              onBlur={(e) =>
                setDemographic((prev) => ({ ...prev, volunteerCode: normalizeVolunteerCode(e.target.value) }))
              }
              placeholder="e.g., TR00001"
              className="w-full"
            />
            <Button type="button" label="Generate" onClick={generateVolunteerId} className="shrink-0" />
          </div>
          <small className="text-gray-500">Format: TR + 5 digits (TR00001)</small>
        </div>

        {/* Protocol No */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Protocol No</label>
          <InputText
            value={demographic.protocolNo}
            onChange={(e) => setDemographic((prev) => ({ ...prev, protocolNo: e.target.value }))}
            className="w-full"
          />
        </div>

        {/* First Visit Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Visit Date (USG)</label>
          <Calendar
            value={demographic.visitDate}
            onChange={(e) => setDemographic((prev) => ({ ...prev, visitDate: (e.value as Date) ?? null }))}
            className="w-full"
            inputClassName="w-full"
            showIcon
          />
        </div>

        {/* Name Surname */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name Surname</label>
          <InputText
            value={demographic.nameSurname}
            onChange={(e) => setDemographic((prev) => ({ ...prev, nameSurname: e.target.value }))}
            placeholder="Name Surname"
            className="w-full"
          />
        </div>

        {/* Birth Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
          <Calendar
            value={demographic.birthDate}
            onChange={(e) => setDemographic((prev) => ({ ...prev, birthDate: (e.value as Date) ?? null }))}
            className="w-full"
            inputClassName="w-full"
            showIcon
          />
        </div>

        {/* Second Visit Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Second Visit Date (Pathology)</label>
          <Calendar
            value={demographic.secondVisitDate}
            onChange={(e) =>
              setDemographic((prev) => ({ ...prev, secondVisitDate: (e.value as Date) ?? null }))
            }
            className="w-full"
            inputClassName="w-full"
            showIcon
          />
        </div>

        {/* Body Mass Index */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Body Mass Index</label>
          <InputText
            value={demographic.bodyMassIndex}
            onChange={(e) => setDemographic((prev) => ({ ...prev, bodyMassIndex: e.target.value }))}
            className="w-full"
          />
        </div>

        {/* USG Device / Probe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">USG Device / Probe</label>
          <InputText
            value={demographic.usgDevice}
            onChange={(e) => setDemographic((prev) => ({ ...prev, usgDevice: e.target.value }))}
            placeholder="e.g., Brand Model, Probe MHz"
            className="w-full"
          />
        </div>

        {/* Referred From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Referred From</label>
          <Dropdown
            value={demographic.referredFrom}
            options={referralOptions}
            onChange={(e) => setDemographic((prev) => ({ ...prev, referredFrom: e.value }))}
            className="w-full"
            panelClassName="mt-1"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
          <InputText
            value={demographic.weight}
            onChange={(e) => setDemographic((prev) => ({ ...prev, weight: e.target.value }))}
            className="w-full"
          />
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Size (cm)</label>
          <InputText
            value={demographic.size}
            onChange={(e) => setDemographic((prev) => ({ ...prev, size: e.target.value }))}
            className="w-full"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <div className="flex flex-wrap gap-6">
            {(["male", "female", "not-specify"] as Sex[]).map((val) => (
              <div className="flex items-center" key={val}>
                <RadioButton
                  inputId={`gender-${val}`}
                  name="gender"
                  value={val}
                  onChange={(e) => setDemographic((prev) => ({ ...prev, gender: e.value }))}
                  checked={demographic.gender === val}
                />
                <label htmlFor={`gender-${val}`} className="ml-2 text-sm text-gray-700">
                  {val === "not-specify" ? "Does not want to specify" : val[0].toUpperCase() + val.slice(1)}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderMedicalHistory = () => (
    <div className="space-y-6">
      {/* Q1 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 min-w-[120px]">
          <span className="text-sm text-gray-700">Question 1</span>
          <i className="pi pi-info-circle text-gray-400 text-sm"></i>
        </div>
        <div className="flex gap-6">
          {(["yes", "no"] as YesNo[]).map((val) => (
            <div className="flex items-center" key={val}>
              <RadioButton
                inputId={`mq1-${val}`}
                name="medicalQuestion1"
                value={val}
                onChange={(e) => setMedical((prev) => ({ ...prev, medicalQuestion1: e.value }))}
                checked={medical.medicalQuestion1 === val}
              />
              <label htmlFor={`mq1-${val}`} className="ml-2 text-sm text-gray-700 capitalize">
                {val}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* years */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">How many years?</label>
        <Dropdown
          value={medical.howManyYears}
          options={yearsOptions}
          onChange={(e) => setMedical((prev) => ({ ...prev, howManyYears: e.value }))}
          className="w-48"
          panelClassName="mt-1"
        />
      </div>

      {/* Q2–Q5 */}
      {[2, 3, 4, 5].map((n) => (
        <div className="flex items-center gap-4" key={n}>
          <div className="flex items-center gap-2 min-w-[120px]">
            <span className="text-sm text-gray-700">Question {n}</span>
            <i className="pi pi-info-circle text-gray-400 text-sm"></i>
          </div>
          <div className="flex gap-6">
            {(["yes", "no"] as YesNo[]).map((val) => (
              <div className="flex items-center" key={val}>
                <RadioButton
                  inputId={`mq${n}-${val}`}
                  name={`medicalQuestion${n}`}
                  value={val}
                  onChange={(e) =>
                    setMedical((prev) => ({ ...prev, [`medicalQuestion${n}`]: e.value as YesNo }))
                  }
                  checked={(medical as any)[`medicalQuestion${n}`] === val}
                />
                <label htmlFor={`mq${n}-${val}`} className="ml-2 text-sm text-gray-700 capitalize">
                  {val}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* disease type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Disease type</label>
        <InputText
          value={medical.diseaseType}
          onChange={(e) => setMedical((prev) => ({ ...prev, diseaseType: e.target.value }))}
          placeholder="Disease type"
          className="w-full max-w-sm p-3 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );

  const renderInclusionCriteria = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Dahil Etme Kriterleri</h2>
      <p className="text-sm text-gray-600 mb-6">
        Aşağıdaki kriterlerin hepsinin işaretlenmesi gönüllünün dahil edilme kriterlerini karşıladığını
        göstermektedir.
      </p>

      <div className="space-y-4">
        <CriteriaItem label="18 yaşından büyük" value={inclusion.ageOver18} onChange={(v) => setInclusion((p) => ({ ...p, ageOver18: v }))} />
        <CriteriaItem label="Tiroid nodülü şüphesi taşımak" value={inclusion.thyroidNoduleSuspicion} onChange={(v) => setInclusion((p) => ({ ...p, thyroidNoduleSuspicion: v }))} />
        <CriteriaItem label="BGOF alınmış gönüllü" value={inclusion.bgofVolunteer} onChange={(v) => setInclusion((p) => ({ ...p, bgofVolunteer: v }))} />
        <CriteriaItem label="Kısıtlı olmamak (asker, yükümlü)" value={inclusion.notRestricted} onChange={(v) => setInclusion((p) => ({ ...p, notRestricted: v }))} />
      </div>
    </div>
  );

  const renderExclusionCriteria = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Hariç Tutma Kriterleri</h2>
      <p className="text-sm text-gray-600 mb-6">
        Aşağıdaki kriterlerin en az birinin <strong>“Evet”</strong> olması hastanın hariç tutulmasını gerektirir.
      </p>

      <div className="space-y-4">
        <CriteriaItem label="18 yaşından küçük olmak" value={exclusion.ageUnder18} onChange={(v) => setExclusion((p) => ({ ...p, ageUnder18: v }))} />
        <CriteriaItem label="BGOF alınmamış gönüllüler" value={exclusion.nonBgofVolunteer} onChange={(v) => setExclusion((p) => ({ ...p, nonBgofVolunteer: v }))} />
        <CriteriaItem label="Kısıtlı olmak (asker, yükümlü)" value={exclusion.restricted} onChange={(v) => setExclusion((p) => ({ ...p, restricted: v }))} />
        <CriteriaItem label="Başka bir klinik çalışmada yer almak" value={exclusion.baskaclinikcalismadayerolmak} onChange={(v) => setExclusion((p) => ({ ...p, baskaclinikcalismadayerolmak: v }))} />
        <CriteriaItem label="Tiroid bezi ile ilgili operasyon (total/subtotal tiroidektomi, lobektomi), görüntüleme eşliğinde müdahale/ablasyon veya terapötik radyoizotop tedavisi geçirmiş olmak" value={exclusion.tiroidBeziIleIlgiliOperasyon} onChange={(v) => setExclusion((p) => ({ ...p, tiroidBeziIleIlgiliOperasyon: v }))} />
        <CriteriaItem label="Nodül saptanmayan; yalnızca diffüz parenkimal patern değişikliği bulunan olgular" value={exclusion.diffuzParenkimalOlgular} onChange={(v) => setExclusion((p) => ({ ...p, diffuzParenkimalOlgular: v }))} />
        <CriteriaItem label="Diffüz nodüler değişiklik olup, radyolog ve/veya AI değerlendirmesi ile ayrıca demarke bir nodül tespit edilemeyen olgular" value={exclusion.birNoduluTespitEdilemeyenOlgular} onChange={(v) => setExclusion((p) => ({ ...p, birNoduluTespitEdilemeyenOlgular: v }))} />
      </div>
    </div>
  );



  const renderUploadPhoto = () => {
    const onFileSelect = (e: any) => {
      const files: File[] = e.files || [];
      if (!files.length) return;
      const file = files[0];
      if (file.size <= 2.5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setUploadedPhotos((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        showError("Dosya 2.5MB'den küçük olmalıdır.");
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Photo</h3>
          <p className="text-sm text-gray-600 mb-6">
            File must be less than 2.5 MB, and file format must be either JPEG, JPG or PNG.
          </p>
        </div>

        <div className="flex gap-4 flex-wrap">
          {uploadedPhotos.map((photo, index) => (
            <div key={index} className="w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
              <img src={photo || "/placeholder.svg"} alt={`Uploaded photo ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}

          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer">
            <FileUpload
              mode="basic"
              name="photo"
              accept="image/jpeg,image/jpg,image/png"
              maxFileSize={2500000}
              onSelect={onFileSelect}
              chooseLabel=""
              className="p-fileupload-basic"
              auto={false}
              customUpload
            />
            <div className="text-4xl text-gray-400 mb-2">+</div>
            <span className="text-sm text-gray-500">Upload</span>
          </div>
        </div>
      </div>
    );
  };

const renderAvailableRadiologist = () => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose Available Radiologist
        </label>
        <Dropdown
          value={selectedRadiologist}
          options={radiologistOptions}
          onChange={(e) => setSelectedRadiologist(e.value)}
          placeholder="Select a Radiologist"
          className="w-48"
          panelClassName="mt-1"
        />
      </div>
    </>
  );
};

  // ================== SHELL ==================
  const headerElement = (
    <div className="flex items-center gap-3">
      <button onClick={handleDialogClose} className="text-gray-500 hover:text-gray-700 text-xl">
        ×
      </button>
      <span className="text-lg font-medium text-gray-800">Add New Predict</span>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={handleDialogClose}
      header={headerElement}
      style={{ width: "90vw", maxWidth: "1200px", height: "100vh" }}
      className="p-0"
      modal
      draggable={false}
      resizable={false}
    >
      <div className="p-6">
        <Toast ref={toast} />

        {/* Steps + Role badge */}
        <div className="mb-2">
          <Steps model={steps} activeIndex={activeIndex} className="custom-steps" />
        </div>
        <div className="mb-6">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium `}
          >
          </span>
        </div>

        {renderStepContent()}

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <Button
            label="Cancel"
            onClick={handleDialogClose}
            className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            text
          />
          <Button
            label={activeIndex < steps.length - 1 ? "Save and Next" : "Finish"}
            onClick={handleSaveAndNext}
            className="px-6 py-2 rounded-md p-button-secondary"
          />
        </div>
      </div>
    </Dialog>
  );
};


