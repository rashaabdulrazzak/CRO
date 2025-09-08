/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Steps } from "primereact/steps";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { RadioButton } from "primereact/radiobutton";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { FileUpload } from "primereact/fileupload";
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
  usgDevice: string; // NEW: device/probe details

  // Optional quick questions (you had these in your UI)
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

// Step 2–3
/* interface InclusionForm {
  inclusionQuestion1: YesNo;
  inclusionQuestion2: YesNo;
  inclusionQuestion3: YesNo;
  inclusionQuestion4: YesNo;
  inclusionQuestion5: YesNo;
} */
type InclusionForm = {
  ageOver18: boolean | null
  thyroidNoduleSuspicion: boolean | null
  bgofVolunteer: boolean | null
  notRestricted: boolean | null
}

const initialInc: InclusionForm = {
  ageOver18: null,
  thyroidNoduleSuspicion: null,
  bgofVolunteer: null,
  notRestricted: null,
}

type ExclusionForm = {
  ageUnder18: boolean | null
  nonBgofVolunteer: boolean | null
  restricted: boolean | null
  baskaclinikcalismadayerolmak: boolean | null
  tiroidBeziIleIlgiliOperasyon: boolean | null
  diffuzParenkimalOlgular: boolean | null
  birNoduluTespitEdilemeyenOlgular: boolean | null
}

// Step 4
interface AIDiag {
  composition: {
    cystic: boolean;
    solid: boolean;
    mixed: boolean;
    spongioform: boolean;
  };
  echogenicity: {
    anechoic: boolean;
    hyperechoic: boolean;
    hypoechoic: boolean;
    veryHypoechoic: boolean;
  };
  shape: { widerThanTall: boolean; tallerThanWide: boolean };
  margin: {
    smooth: boolean;
    illDefined: boolean;
    lobular: boolean;
    extraThyroidal: boolean;
  };
  echogenicFocii: {
    noneOrLarge: boolean;
    macrocalcifications: boolean;
    peripheral: boolean;
    punctate: boolean;
  };
}

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

// TIRADS (simple rules)
const computeTirads = (ai: AIDiag) => {
  let pts = 0;
  // Composition
  if (ai.composition.solid) pts += 2;
  else if (ai.composition.mixed) pts += 1;
  // Echogenicity
  if (ai.echogenicity.hyperechoic) pts += 1;
  if (ai.echogenicity.hypoechoic) pts += 2;
  if (ai.echogenicity.veryHypoechoic) pts += 3;
  // Shape
  if (ai.shape.tallerThanWide) pts += 3;
  // Margin
  if (ai.margin.lobular) pts += 2;
  if (ai.margin.extraThyroidal) pts += 3;
  // Echogenic foci
  if (ai.echogenicFocii.macrocalcifications) pts += 1;
  if (ai.echogenicFocii.peripheral) pts += 2;
  if (ai.echogenicFocii.punctate) pts += 3;
  const category =
    pts >= 7
      ? "TR5"
      : pts >= 4
      ? "TR4"
      : pts === 3
      ? "TR3"
      : pts >= 1
      ? "TR2"
      : "TR1";
  return { points: pts, category };
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
}

export const AddNewPredictDialog: React.FC<AddNewPredictDialogProps> = ({
  visible,
  onHide,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

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
  
/*   const initialInc: InclusionForm = useMemo(
    () => ({
      inclusionQuestion1: "yes",
      inclusionQuestion2: "yes",
      inclusionQuestion3: "yes",
      inclusionQuestion4: "yes",
      inclusionQuestion5: "yes",
    }),
    []
  ); */
const initialExc: ExclusionForm = {
  ageUnder18: null,
  nonBgofVolunteer: null,
  restricted: null,
  baskaclinikcalismadayerolmak: null,
  tiroidBeziIleIlgiliOperasyon: null,
  diffuzParenkimalOlgular: null,
  birNoduluTespitEdilemeyenOlgular: null,
}

  const initialAI: AIDiag = useMemo(
    () => ({
      composition: {
        cystic: true,
        solid: false,
        mixed: true,
        spongioform: false,
      },
      echogenicity: {
        anechoic: true,
        hyperechoic: false,
        hypoechoic: true,
        veryHypoechoic: false,
      },
      shape: { widerThanTall: true, tallerThanWide: false },
      margin: {
        smooth: true,
        illDefined: false,
        lobular: true,
        extraThyroidal: false,
      },
      echogenicFocii: {
        noneOrLarge: true,
        macrocalcifications: false,
        peripheral: true,
        punctate: false,
      },
    }),
    []
  );

  // ---- state
  const draftKey = "app.addPredictDraft";
  const [demographic, setDemographic] =
    useState<DemographicForm>(initialDemographic);
  const [medical, setMedical] = useState<MedicalHistoryForm>(initialMed);
  const [inclusion, setInclusion] = useState<InclusionForm>(initialInc);
  const [exclusion, setExclusion] = useState<ExclusionForm>(initialExc);
  const [ai, setAi] = useState<AIDiag>(initialAI);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);

  const [patientId, setPatientId] = useState<number | null>(null);
  const [caseId, setCaseId] = useState<number | null>(null);

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
      setAi({ ...initialAI, ...(d.ai || {}) });
      setUploadedPhotos(d.uploadedPhotos || []);
      setPatientId(d.patientId ?? null);
      setCaseId(d.caseId ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const generateVolunteerId = () => {
    const nextId = getNextImageNumber();
    //setFormData(prev => ({ ...prev, volunteerId: nextId }));
    setDemographic((prev) => ({ ...prev, volunteerCode: nextId }));
    //  return nextId;
  };
  // ---- autosave draft
  useEffect(() => {
    lsSet(draftKey, {
      activeIndex,
      demographic,
      medical,
      inclusion,
      exclusion,
      ai,
      uploadedPhotos,
      patientId,
      caseId,
    });
  }, [
    activeIndex,
    demographic,
    medical,
    inclusion,
    exclusion,
    ai,
    uploadedPhotos,
    patientId,
    caseId,
  ]);

  // ---- localStorage “collections”
  const patientsKey = "app.patients";
  const casesKey = "app.cases";
  const formsKey = "app.forms";
  const uploadsKey = "app.uploads";

  const createPatientLocal = (
    payload: Omit<LSPatient, "id" | "createdAt">
  ): LSPatient => {
    const list = lsGet<LSPatient[]>(patientsKey, []);
    const p: LSPatient = {
      id: nextId(list),
      createdAt: new Date().toISOString(),
      ...payload,
    };
    lsSet(patientsKey, [...list, p]);
    return p;
  };
  const createCaseLocal = (
    payload: Omit<LSCase, "id" | "createdAt">
  ): LSCase => {
    const list = lsGet<LSCase[]>(casesKey, []);
    const c: LSCase = {
      id: nextId(list),
      createdAt: new Date().toISOString(),
      ...payload,
    };
    lsSet(casesKey, [...list, c]);
    return c;
  };
  const createUploadLocal = (
    payload: Omit<LSUpload, "id" | "createdAt">
  ): LSUpload => {
    const list = lsGet<LSUpload[]>(uploadsKey, []);
    const u: LSUpload = {
      id: nextId(list),
      createdAt: new Date().toISOString(),
      ...payload,
    };
    lsSet(uploadsKey, [...list, u]);
    return u;
  };
  const createFormLocal = (
    payload: Omit<LSForm, "id" | "createdAt">
  ): LSForm => {
    const list = lsGet<LSForm[]>(formsKey, []);
    const f: LSForm = {
      id: nextId(list),
      createdAt: new Date().toISOString(),
      ...payload,
    };
    lsSet(formsKey, [...list, f]);
    return f;
  };

  // ---- steps model
  const steps = [
    { label: "Demographic Information" },
    { label: "Medical History" },
    { label: "Inclusion Criteria" },
    { label: "Exclusion Criteria" },
    { label: "AI Diagnostics" },
    { label: "Upload Photo" },
  ];

  const referralOptions = [
    { label: "Radiology Clinic", value: "Radiology Clinic" },
    { label: "Emergency Department", value: "Emergency Department" },
    { label: "General Practice", value: "General Practice" },
  ];
  const yearsOptions = ["1", "2", "3", "4", "5"].map((v) => ({
    label: v,
    value: v,
  }));

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
    setAi(initialAI);
    setUploadedPhotos([]);
    setPatientId(null);
    setCaseId(null);
    localStorage.removeItem(draftKey);
  };

  const handleSaveAndNext = async () => {
    try {
      // STEP 0: create patient
      if (activeIndex === 0) {
        const code = normalizeVolunteerCode(demographic.volunteerCode);
        if (!VOL_ID_RE.test(code))
          throw new Error(
            "Volunteer ID must match TR00000 format (e.g., TR00001)"
          );
        if (!demographic.nameSurname?.trim())
          throw new Error("Name Surname is required");

        setDemographic((prev) => ({ ...prev, volunteerCode: code }));
        const age = calcAgeFromDate(demographic.birthDate);
        const sex =
          demographic.gender === "male"
            ? "male"
            : demographic.gender === "female"
            ? "female"
            : undefined;

        // local patient
        const localPatient = createPatientLocal({
          code,
          name: demographic.nameSurname.trim(),
          age,
          sex,
        });
        setPatientId(localPatient.id);

        // mirror to backend (optional)
        if (USE_BACKEND) {
          const { patient } = await api("/patients", "POST", {
            name: demographic.nameSurname.trim(),
            age,
            sex,
            code,
          });
          console.log("backend patient", patient);
        }

        setActiveIndex(1);
        return;
      }

      // intermediate steps
      if (activeIndex > 0 && activeIndex < 5) {
        setActiveIndex(activeIndex + 1);
        return;
      }

      // FINAL STEP: case + uploads + forms
      if (activeIndex === 5) {
        if (!patientId) throw new Error("Patient not created");

        // Case imageId = first numbered image TRxxxxx-01
        const base = demographic.volunteerCode;
        const caseImageId = makeImageId(base, 0);
        const localCase = createCaseLocal({ patientId, imageId: caseImageId });
        setCaseId(localCase.id);

        if (USE_BACKEND) {
          const { case: createdCase } = await api("/cases", "POST", {
            patientId,
            imageId: caseImageId,
          });
          console.log("backend case", createdCase);
        }

        // Uploads numbered TRxxxxx-01, -02, ...
        for (let i = 0; i < uploadedPhotos.length; i++) {
          const imgId = makeImageId(base, i);
          const url = uploadedPhotos[i]?.startsWith("data:")
            ? `local://${imgId}`
            : uploadedPhotos[i] || `local://${imgId}`;
          createUploadLocal({ caseId: localCase.id, kind: "USG", url });
          if (USE_BACKEND) {
            await api(`/uploads/cases/${localCase.id}`, "POST", {
              kind: "USG",
              url,
              createdByUserId: 1,
            });
          }
        }

        // Visit/administrative form
        createFormLocal({
          caseId: localCase.id,
          type: "CRF01-visit",
          version: "v1",
          data: {
            volunteerCode: base,
            protocolNo: demographic.protocolNo,
            visitDate: demographic.visitDate
              ? demographic.visitDate.toISOString().split("T")[0]
              : null,
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
          },
        });
        if (USE_BACKEND) {
          await api(`/forms/cases/${localCase.id}`, "POST", {
            type: "CRF01-visit",
            version: "v1",
            data: {
              volunteerCode: base,
              protocolNo: demographic.protocolNo,
              visitDate: demographic.visitDate
                ? demographic.visitDate.toISOString().split("T")[0]
                : null,
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
            },
            createdByUserId: 1,
          });
        }

        // Eligibility form (medical + inclusion + exclusion)
        createFormLocal({
          caseId: localCase.id,
          type: "CRF01-eligibility",
          version: "v1",
          data: { medicalHistory: medical, inclusion, exclusion },
        });
        if (USE_BACKEND) {
          await api(`/forms/cases/${localCase.id}`, "POST", {
            type: "CRF01-eligibility",
            version: "v1",
            data: { medicalHistory: medical, inclusion, exclusion },
            createdByUserId: 1,
          });
        }

        // AI form with TIRADS
        const tirads = computeTirads(ai);
        createFormLocal({
          caseId: localCase.id,
          type: "CRF01-ai",
          version: "v1",
          data: { ...ai, tirads },
        });
        if (USE_BACKEND) {
          await api(`/forms/cases/${localCase.id}`, "POST", {
            type: "CRF01-ai",
            version: "v1",
            data: { ...ai, tirads },
            createdByUserId: 1,
          });
        }

        // done
        resetFormToInitialState();
        onHide();
      }
    } catch (err) {
      console.error(err);
      // TODO: show a toast if desired
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
        return renderAIDiagnostics();
      case 5:
        return renderUploadPhoto();
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Step content coming soon...
          </div>
        );
    }
  };

 const renderDemographicInformation = () => (
  <>
    {/* ONE grid for all fields */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Volunteer ID + Generate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Volunteer ID (Gönüllü No)
        </label>
        <div className="flex gap-2">
          <InputText
            id="volunteerId"
            value={demographic.volunteerCode}
            onChange={(e) =>
              setDemographic((prev) => ({ ...prev, volunteerCode: e.target.value }))
            }
            onBlur={(e) =>
              setDemographic((prev) => ({
                ...prev,
                volunteerCode: normalizeVolunteerCode(e.target.value),
              }))
            }
            placeholder="e.g., TR00001"
            className="w-full"
          />
          <Button
            type="button"
            label="Generate"
            onClick={generateVolunteerId}
            className="shrink-0"
          />
        </div>
        <small className="text-gray-500">Format: TR + 5 digits (TR00001)</small>
      </div>

      {/* Protocol No */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Protocol No</label>
        <InputText
          value={demographic.protocolNo}
          onChange={(e) =>
            setDemographic((prev) => ({ ...prev, protocolNo: e.target.value }))
          }
          className="w-full"
        />
      </div>

      {/* First Visit Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          First Visit Date (USG)
        </label>
        <Calendar
          value={demographic.visitDate}
          onChange={(e) =>
            setDemographic((prev) => ({ ...prev, visitDate: (e.value as Date) ?? null }))
          }
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
          onChange={(e) =>
            setDemographic((prev) => ({ ...prev, nameSurname: e.target.value }))
          }
          placeholder="Name Surname"
          className="w-full"
        />
      </div>

      {/* Birth Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
        <Calendar
          value={demographic.birthDate}
          onChange={(e) =>
            setDemographic((prev) => ({ ...prev, birthDate: (e.value as Date) ?? null }))
          }
          className="w-full"
          inputClassName="w-full"
          showIcon
        />
      </div>

      {/* Second Visit Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Second Visit Date (Pathology)
        </label>
        <Calendar
          value={demographic.secondVisitDate}
          onChange={(e) =>
            setDemographic((prev) => ({
              ...prev,
              secondVisitDate: (e.value as Date) ?? null,
            }))
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
          onChange={(e) =>
            setDemographic((prev) => ({ ...prev, bodyMassIndex: e.target.value }))
          }
          className="w-full"
        />
      </div>

      {/* USG Device / Probe */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">USG Device / Probe</label>
        <InputText
          value={demographic.usgDevice}
          onChange={(e) =>
            setDemographic((prev) => ({ ...prev, usgDevice: e.target.value }))
          }
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
          onChange={(e) =>
            setDemographic((prev) => ({ ...prev, referredFrom: e.value }))
          }
          className="w-full"
          panelClassName="mt-1"
        />
      </div>

      {/* Weight */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
        <InputText
          value={demographic.weight}
          onChange={(e) =>
            setDemographic((prev) => ({ ...prev, weight: e.target.value }))
          }
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
                onChange={(e) =>
                  setDemographic((prev) => ({ ...prev, gender: e.value }))
                }
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


    {/* Other Information Section (unchanged) */}
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-800 mb-6">Other informations</h3>
      {/* ... keep your questions here ... */}
    </div>
  </>
)


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
                onChange={(e) =>
                  setMedical((prev) => ({ ...prev, medicalQuestion1: e.value }))
                }
                checked={medical.medicalQuestion1 === val}
              />
              <label
                htmlFor={`mq1-${val}`}
                className="ml-2 text-sm text-gray-700 capitalize"
              >
                {val}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* years */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How many years?
        </label>
        <Dropdown
          value={medical.howManyYears}
          options={yearsOptions}
          onChange={(e) =>
            setMedical((prev) => ({ ...prev, howManyYears: e.value }))
          }
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
                    setMedical((prev) => ({
                      ...prev,
                      [`medicalQuestion${n}`]: e.value as YesNo,
                    }))
                  }
                  checked={(medical as any)[`medicalQuestion${n}`] === val}
                />
                <label
                  htmlFor={`mq${n}-${val}`}
                  className="ml-2 text-sm text-gray-700 capitalize"
                >
                  {val}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* disease type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Disease type
        </label>
        <InputText
          value={medical.diseaseType}
          onChange={(e) =>
            setMedical((prev) => ({ ...prev, diseaseType: e.target.value }))
          }
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
      Aşağıdaki kriterlerin hepsinin işaretlenmesi gönüllünün dahil edilme kriterlerini karşıladığını göstermektedir.
    </p>

    <div className="space-y-4">
      <CriteriaItem
        label="18 yaşından büyük"
        value={inclusion.ageOver18}
        onChange={(v) => setInclusion((p) => ({ ...p, ageOver18: v }))}
      />
      <CriteriaItem
        label="Tiroid nodülü şüphesi taşımak"
        value={inclusion.thyroidNoduleSuspicion}
        onChange={(v) => setInclusion((p) => ({ ...p, thyroidNoduleSuspicion: v }))}
      />
      <CriteriaItem
        label="BGOF alınmış gönüllü"
        value={inclusion.bgofVolunteer}
        onChange={(v) => setInclusion((p) => ({ ...p, bgofVolunteer: v }))}
      />
      <CriteriaItem
        label="Kısıtlı olmamak (asker, yükümlü)"
        value={inclusion.notRestricted}
        onChange={(v) => setInclusion((p) => ({ ...p, notRestricted: v }))}
      />
    </div>
  </div>
)
const renderExclusionCriteria = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Hariç Tutma Kriterleri</h2>
    <p className="text-sm text-gray-600 mb-6">
      Aşağıdaki kriterlerin en az birinin <strong>“Evet”</strong> olması hastanın hariç tutulmasını gerektirir.
    </p>

    <div className="space-y-4">
      <CriteriaItem
        label="18 yaşından küçük olmak"
        value={exclusion.ageUnder18}
        onChange={(v) => setExclusion((p) => ({ ...p, ageUnder18: v }))}
      />

      <CriteriaItem
        label="BGOF alınmamış gönüllüler"
        value={exclusion.nonBgofVolunteer}
        onChange={(v) => setExclusion((p) => ({ ...p, nonBgofVolunteer: v }))}
      />

      <CriteriaItem
        label="Kısıtlı olmak (asker, yükümlü)"
        value={exclusion.restricted}
        onChange={(v) => setExclusion((p) => ({ ...p, restricted: v }))}
      />

      <CriteriaItem
        label="Başka bir klinik çalışmada yer almak"
        value={exclusion.baskaclinikcalismadayerolmak}
        onChange={(v) => setExclusion((p) => ({ ...p, baskaclinikcalismadayerolmak: v }))}
      />

      <CriteriaItem
        label="Tiroid bezi ile ilgili operasyon (total/subtotal tiroidektomi, lobektomi), görüntüleme eşliğinde müdahale/ablasyon veya terapötik radyoizotop tedavisi geçirmiş olmak"
        value={exclusion.tiroidBeziIleIlgiliOperasyon}
        onChange={(v) => setExclusion((p) => ({ ...p, tiroidBeziIleIlgiliOperasyon: v }))}
      />

      <CriteriaItem
        label="Nodül saptanmayan; yalnızca diffüz parenkimal patern değişikliği bulunan olgular"
        value={exclusion.diffuzParenkimalOlgular}
        onChange={(v) => setExclusion((p) => ({ ...p, diffuzParenkimalOlgular: v }))}
      />

      <CriteriaItem
        label="Diffüz nodüler değişiklik olup, radyolog ve/veya AI değerlendirmesi ile ayrıca demarke bir nodül tespit edilemeyen olgular"
        value={exclusion.birNoduluTespitEdilemeyenOlgular}
        onChange={(v) => setExclusion((p) => ({ ...p, birNoduluTespitEdilemeyenOlgular: v }))}
      />
    </div>
  </div>
)


  const renderAIDiagnostics = () => (
    <div className="space-y-8">
      {/* Composition */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Composition</h3>
        <div className="space-y-3">
          {[
            ["cystic", "Cystic or almost completely cystic"],
            ["solid", "Solid or Almost Completely Solid"],
            ["mixed", "Mixed Cystic and Solid"],
            ["spongioform", "Spongioform"],
          ].map(([key, label]) => (
            <div className="flex items-center gap-3" key={key}>
              <Checkbox
                inputId={`comp-${key}`}
                checked={(ai.composition as any)[key]}
                onChange={(e) =>
                  setAi((prev) => ({
                    ...prev,
                    composition: { ...prev.composition, [key]: e.checked },
                  }))
                }
              />
              <label
                htmlFor={`comp-${key}`}
                className="text-sm text-gray-700 flex items-center gap-2"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Echogenicity */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Echogenicity</h3>
        <div className="space-y-3">
          {[
            ["anechoic", "Anechoic"],
            ["hyperechoic", "Hyperechoic or Isoechoic"],
            ["hypoechoic", "Hypoechoic"],
            ["veryHypoechoic", "Very Hypoechoic"],
          ].map(([key, label]) => (
            <div className="flex items-center gap-3" key={key}>
              <Checkbox
                inputId={`echo-${key}`}
                checked={(ai.echogenicity as any)[key]}
                onChange={(e) =>
                  setAi((prev) => ({
                    ...prev,
                    echogenicity: { ...prev.echogenicity, [key]: e.checked },
                  }))
                }
              />
              <label
                htmlFor={`echo-${key}`}
                className="text-sm text-gray-700 flex items-center gap-2"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Shape */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Shape</h3>
        <div className="space-y-3">
          {[
            ["widerThanTall", "Wider Than Tall"],
            ["tallerThanWide", "Taller Than Wide"],
          ].map(([key, label]) => (
            <div className="flex items-center gap-3" key={key}>
              <Checkbox
                inputId={`shape-${key}`}
                checked={(ai.shape as any)[key]}
                onChange={(e) =>
                  setAi((prev) => ({
                    ...prev,
                    shape: { ...prev.shape, [key]: e.checked },
                  }))
                }
              />
              <label
                htmlFor={`shape-${key}`}
                className="text-sm text-gray-700 flex items-center gap-2"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Margin */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Margin</h3>
        <div className="space-y-3">
          {[
            ["smooth", "Smooth"],
            ["illDefined", "Ill defined"],
            ["lobular", "Lobular or irregular"],
            ["extraThyroidal", "Extra thyroidal extension"],
          ].map(([key, label]) => (
            <div className="flex items-center gap-3" key={key}>
              <Checkbox
                inputId={`margin-${key}`}
                checked={(ai.margin as any)[key]}
                onChange={(e) =>
                  setAi((prev) => ({
                    ...prev,
                    margin: { ...prev.margin, [key]: e.checked },
                  }))
                }
              />
              <label
                htmlFor={`margin-${key}`}
                className="text-sm text-gray-700 flex items-center gap-2"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Echogenic Focii */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Echogenic Focii
        </h3>
        <div className="space-y-3">
          {[
            ["noneOrLarge", "None or Large Comet Tail Artifacts"],
            ["macrocalcifications", "Macrocalcifications"],
            ["peripheral", "Peripheral Calcifications"],
            ["punctate", "Punctate Echogenic Foci"],
          ].map(([key, label]) => (
            <div className="flex items-center gap-3" key={key}>
              <Checkbox
                inputId={`foci-${key}`}
                checked={(ai.echogenicFocii as any)[key]}
                onChange={(e) =>
                  setAi((prev) => ({
                    ...prev,
                    echogenicFocii: {
                      ...prev.echogenicFocii,
                      [key]: e.checked,
                    },
                  }))
                }
              />
              <label
                htmlFor={`foci-${key}`}
                className="text-sm text-gray-700 flex items-center gap-2"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
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
            setUploadedPhotos((prev) => [
              ...prev,
              event.target!.result as string,
            ]);
          }
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload Photo
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            File must be less than 2.5 MB, and file format must be either JPEG,
            JPG or PNG.
          </p>
        </div>

        <div className="flex gap-4 flex-wrap">
          {uploadedPhotos.map((photo, index) => (
            <div
              key={index}
              className="w-32 h-32 border border-gray-200 rounded-lg overflow-hidden"
            >
              <img
                src={photo || "/placeholder.svg"}
                alt={`Uploaded photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
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

  // ================== SHELL ==================
  const headerElement = (
    <div className="flex items-center gap-3">
      <button
        onClick={handleDialogClose}
        className="text-gray-500 hover:text-gray-700 text-xl"
      >
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
        <div className="mb-6">
          <Steps
            model={steps}
            activeIndex={activeIndex}
            className="custom-steps"
          />
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
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          />
        </div>
      </div>
    </Dialog>
  );
};
