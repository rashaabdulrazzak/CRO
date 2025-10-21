/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Steps } from "primereact/steps";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { getNextImageNumber } from "../lib/mockData";
import { MultiSelect } from "primereact/multiselect";
import DemographicFormStep from "./steps/DemographicFormStep";
import type {
  DemographicForm,
  InclusionForm,
  MedicalHistoryForm,
  ExclusionForm,
} from "../types";
import MedicalHistoryStep from "./steps/MedicalHistoryStep";
import InclusionCriteriaStep from "./steps/InclusionCriteriaStep";
import ExclusionFormStep from "./steps/ExclusionCriteriaStep";
import UploadPhotoStep from "./steps/UploadPhotoStep";

// ================== CONFIG ==================
const USE_BACKEND = false; // switch to true when your API is ready

const initialInc: InclusionForm = {
  ageOver18: null,
  thyroidNoduleSuspicion: null,
  bgofVolunteer: null,
  notRestricted: null,
};

// step 6
const radiologistOptions = [
  { label: "Radiologist 1", value: "radiologist1" },
  { label: "Radiologist 2", value: "radiologist2" },
  { label: "Radiologist 3", value: "radiologist3" },
  { label: "Radiologist 4", value: "radiologist4" },
  { label: "Radiologist 5", value: "radiologist5" },
  { label: "Radiologist 6", value: "radiologist6" },
];

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
  currentRole:
    | "field_coordinator"
    | "radiologist"
    | "monitor"
    | "patolog_coordinator"
    | "biostatistician";
}

export const AddNewPredictDialog: React.FC<AddNewPredictDialogProps> = ({
  visible,
  onHide,
  currentRole,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const toast = useRef<Toast>(null);
  console.log(currentRole);
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
      question1: null,
      question2: null,
      question3: null,
      question4: null,
      question5: null,
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
  const [demographic, setDemographic] =
    useState<DemographicForm>(initialDemographic);
  const [medical, setMedical] = useState<MedicalHistoryForm>(initialMed);
  const [inclusion, setInclusion] = useState<InclusionForm>(initialInc);
  const [exclusion, setExclusion] = useState<ExclusionForm>(initialExc);

  const [patientId, setPatientId] = useState<number | null>(null);
  const [caseId, setCaseId] = useState<number | null>(null);
  const [selectedRadiologists, setSelectedRadiologists] = useState<string[]>(
    []
  );
  const [isRadiologistInvalid, setIsRadiologistInvalid] = useState(false);
  //const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  // In parent component
  const [uploadedPhotos, setUploadedPhotos] = useState<(File | null)[]>([null, null, null]);

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
      // setSelectedRadiologist(d.selectedRadiologist || radiologistOptions[0].value);
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
      //uploadedPhotos,
      
      patientId,
      caseId,
      selectedRadiologists, // Add this
      isRadiologistInvalid, // Add this
    });
  }, [
    activeIndex,
    demographic,
    medical,
    inclusion,
    exclusion,
   // uploadedPhotos,
   
    selectedRadiologists,
    isRadiologistInvalid,
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
    { label: "Upload Photo" },
    { label: "Choose Radiologist" },
  ];

  // Handler for radiologist selection
  const handleRadiologistChange = (e: any) => {
    const newSelection = e.value;

    if (newSelection.length > 3) {
      toast.current?.show({
        severity: "warn",
        summary: "Selection Limit",
        detail: "You can only select exactly 3 radiologists",
        life: 3000,
      });
      return;
    }

    setSelectedRadiologists(newSelection);
    setIsRadiologistInvalid(newSelection.length !== 3);
  };

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
    setSelectedRadiologists([]);
    setIsRadiologistInvalid(false);
    localStorage.removeItem(draftKey);
  };

  const generateVolunteerId = () => {
    const next = getNextImageNumber();
    setDemographic((prev) => ({
      ...prev,
      volunteerCode: normalizeVolunteerCode(next),
    }));
  };

  const toastRef = toast;
  const showError = (detail: string) =>
    toastRef.current?.show({
      severity: "error",
      summary: "Hata",
      detail,
      life: 3000,
    });
  const showInfo = (detail: string) =>
    toastRef.current?.show({
      severity: "info",
      summary: "Bilgi",
      detail,
      life: 2000,
    });
  const showSuccess = (detail: string) =>
    toastRef.current?.show({
      severity: "success",
      summary: "Başarılı",
      detail,
      life: 2500,
    });

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
          demographic.gender === "male"
            ? "male"
            : demographic.gender === "female"
            ? "female"
            : undefined;

        const localPatient = createPatientLocal({
          code,
          name: demographic.nameSurname.trim(),
          age,
          sex,
        });
        setPatientId(localPatient.id);

        if (USE_BACKEND) {
          await api("/patients", "POST", {
            name: demographic.nameSurname.trim(),
            age,
            sex,
            code,
          });
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
          showError(
            "Dahil etme kriterlerinin tamamı 'Evet' olmalıdır. Hasta eklenemez."
          );
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
          showError(
            "Hariç tutma kriterlerinden biri veya daha fazlası 'Evet'. Hasta eklenemez."
          );
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
        if (selectedRadiologists.length !== 3) {
          showError("Please select exactly 3 radiologists.");
          return;
        }

        // NOW save all data since all steps are complete
        const base = normalizeVolunteerCode(demographic.volunteerCode);
        const caseImageId = makeImageId(base, 0);
        if (patientId == null) {
          showError("Hasta bulunamadı. Lütfen baştan deneyin.");
          return;
        }
        const localCase = createCaseLocal({
          patientId: patientId,
          imageId: caseImageId,
        });
        setCaseId(localCase.id);

        if (USE_BACKEND) {
          await api("/cases", "POST", { patientId, imageId: caseImageId });
        }

        // ✅ FIX: Handle File objects correctly
        // Convert File objects to data URLs for local storage or prepare for upload
       /*  for (let i = 0; i < uploadedPhotos.length; i++) {
          const file = uploadedPhotos[i];
          const imgId = makeImageId(base, i);

          // Store file reference locally (you can't store File objects directly in localStorage)
          // Option 1: Store as data URL for display
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });

          createUploadLocal({
            caseId: localCase.id,
            kind: "USG",
            url: dataUrl,
            contentType: file?.type,
          });

          if (USE_BACKEND) {
            // Option 2: Send actual file to backend
            const formData = new FormData();
            formData.append("file", file);
            formData.append("kind", "USG");
            formData.append("imageId", imgId);
            formData.append("createdByUserId", "1");

            try {
              await fetch(`/uploads/cases/${localCase.id}`, {
                method: "POST",
                body: formData,
              });
            } catch (err) {
              console.error(`Failed to upload ${file?.name}:`, err);
              showError(`Failed to upload ${file?.name}`);
              return;
            }
          }
        } */

        // Inside handleSaveAndNext(), final step (activeIndex === 5)
for (let i = 0; i < uploadedPhotos.length; i++) {
  const file = uploadedPhotos[i];
  if (!file) continue; // skip empty slots

  const imgId = makeImageId(base, i);

  // 🔸 1. Upload to backend (if enabled)
  if (USE_BACKEND) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", "USG");
    formData.append("imageId", imgId);
    formData.append("createdByUserId", "1");

    try {
      const res = await fetch(`/uploads/cases/${localCase.id}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    } catch (err) {
      console.error(`Upload failed for ${file.name}:`, err);
      showError(`Failed to upload ${file.name}`);
      return; // stop on first failure
    }
  }

  // 🔸 2. Store ONLY METADATA in localStorage (NOT file content!)
  createUploadLocal({
    caseId: localCase.id,
    kind: "USG",
    // DO NOT store url as data URL!
    // Instead, store imageId or leave url empty
    url: USE_BACKEND 
      ? `/uploads/${imgId}` // or whatever your backend returns
      : "", // or omit entirely
    contentType: file.type,
  });
}
        // Visit/administrative form
        const visitPayload = {
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
          selectedRadiologists: selectedRadiologists,
        };
        createFormLocal({
          caseId: localCase.id,
          type: "CRF01-visit",
          version: "v1",
          data: visitPayload,
        });
        if (USE_BACKEND) {
          await api(`/forms/cases/${localCase.id}`, "POST", {
            type: "CRF01-visit",
            version: "v1",
            data: visitPayload,
            createdByUserId: 1,
          });
        }

        // Eligibility form (medical + inclusion + exclusion)
        const eligibilityPayload = {
          medicalHistory: medical,
          inclusion,
          exclusion,
        };
        createFormLocal({
          caseId: localCase.id,
          type: "CRF01-eligibility",
          version: "v1",
          data: eligibilityPayload,
        });
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
      showError(
        typeof err?.message === "string"
          ? err.message
          : "İşlem sırasında bir hata oluştu."
      );
    }
  };

  // ================== UI RENDERERS ==================
  const renderStepContent = () => {
    switch (activeIndex) {
      case 0:
        return (
          <DemographicFormStep
            demographic={demographic}
            setDemographic={setDemographic}
            generateVolunteerId={generateVolunteerId}
          />
        );
      case 1:
        return <MedicalHistoryStep medical={medical} setMedical={setMedical} />;
      case 2:
        return (
          <InclusionCriteriaStep
            inclusion={inclusion}
            setInclusion={setInclusion}
          />
        );
      case 3:
        return (
          <ExclusionFormStep
            exclusion={exclusion}
            setExclusion={setExclusion}
          />
        );
      case 4:
        return (
          <UploadPhotoStep
            uploadedPhotos={uploadedPhotos}
            setUploadedPhotos={setUploadedPhotos}
          />
        );
      case 5:
        return renderAvailableRadiologist();
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Step content coming soon...
          </div>
        );
    }
  };

  const renderAvailableRadiologist = () => {
    return (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Available Radiologists (Select Exactly 3) *
          </label>
          <MultiSelect
            value={selectedRadiologists}
            options={radiologistOptions}
            onChange={handleRadiologistChange}
            placeholder={`Select exactly 3 radiologists (${selectedRadiologists.length}/3 selected)`}
            display="chip"
            className={`w-full ${isRadiologistInvalid ? "p-invalid" : ""}`}
            panelClassName="mt-1"
            maxSelectedLabels={3}
            filter
            showSelectAll={false}
            invalid={isRadiologistInvalid}
          />
          {isRadiologistInvalid && selectedRadiologists.length < 3 && (
            <small className="text-red-500">
              Please select exactly 3 radiologists. Currently selected:{" "}
              {selectedRadiologists.length}
            </small>
          )}
          {selectedRadiologists.length === 3 && (
            <small className="text-green-600">✓ 3 radiologists selected</small>
          )}
        </div>
      </>
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
        <Toast ref={toast} />

        {/* Steps + Role badge */}
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
            className="px-6 py-2 rounded-md p-button-secondary"
          />
        </div>
      </div>
    </Dialog>
  );
};
