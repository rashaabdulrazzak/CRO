import { useState } from "react";
import { Checkbox } from "primereact/checkbox";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRef } from "react";

// Backend API helper (same pattern as AddNewPredictDialog)
const USE_BACKEND = false; // Switch to true when API is ready

const api = async (url: string, method: string, body?: any) => {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

interface AiAssessmentProps {
  patientId?: number | null;
  caseId?: number | null;
  volunteerCode?: string;
}

const AiAssessment: React.FC<AiAssessmentProps> = ({ 
  patientId, 
  caseId, 
  volunteerCode 
}) => {
  const toast = useRef<Toast>(null);
  
  const [aiDiagnosticsData, setAiDiagnosticsData] = useState({
    composition: "cystic",
    echogenicity: "anechoic",
    shape: "widerThanTall",
    margin: "smooth",
    echogenicFocii: {
      noneOrLarge: false,
      macrocalcifications: false,
      peripheral: false,
      punctate: false,
    },
    points: {
      tr1: false,
      tr2: false,
      tr3: false,
      tr4: false,
      tr5: false,
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleRadioChange = (section: string, value: string) => {
    setAiDiagnosticsData((prev) => ({
      ...prev,
      [section]: value,
    }));
  };

  const handleCheckboxChange = (section: string, property: string, value: boolean) => {
    setAiDiagnosticsData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as Record<string, boolean>),
        [property]: value,
      },
    }));
  };

  const showToast = (severity: "success" | "error" | "info", summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const handleSavePoint = async () => {
    try {
      setIsSaving(true);

      // Validation: Ensure at least one point is selected
      const hasSelectedPoint = Object.values(aiDiagnosticsData.points).some(val => val === true);
      if (!hasSelectedPoint) {
        showToast("error", "Validation Error", "Please select at least one point (TR1-TR5)");
        setIsSaving(false);
        return;
      }

      // Calculate total points based on selections
      const calculatePoints = () => {
        let total = 0;
        if (aiDiagnosticsData.points.tr1) total += 0;
        if (aiDiagnosticsData.points.tr2) total += 2;
        if (aiDiagnosticsData.points.tr3) total += 3;
        if (aiDiagnosticsData.points.tr4) total += 5; // Average of 4-6
        if (aiDiagnosticsData.points.tr5) total += 7;
        return total;
      };

      const assessmentPayload = {
        ...aiDiagnosticsData,
        totalPoints: calculatePoints(),
        patientId: patientId,
        caseId: caseId,
        volunteerCode: volunteerCode,
        timestamp: new Date().toISOString(),
      };

      // Save to localStorage
      const existingAssessments = localStorage.getItem("app.aiAssessments");
      const assessmentsList = existingAssessments ? JSON.parse(existingAssessments) : [];
      
      // Check if assessment for this case already exists
      const existingIndex = assessmentsList.findIndex(
        (item: any) => item.caseId === caseId || item.volunteerCode === volunteerCode
      );

      if (existingIndex !== -1) {
        // Update existing assessment
        assessmentsList[existingIndex] = {
          ...assessmentsList[existingIndex],
          ...assessmentPayload,
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Add new assessment
        assessmentsList.push({
          id: assessmentsList.length + 1,
          ...assessmentPayload,
          createdAt: new Date().toISOString(),
        });
      }

      localStorage.setItem("app.aiAssessments", JSON.stringify(assessmentsList));

      // Save to backend API (when enabled)
      if (USE_BACKEND && caseId) {
        await api(`/ai-assessments/cases/${caseId}`, "POST", {
          type: "CRF01-ai-diagnostics",
          version: "v1",
          data: assessmentPayload,
          createdByUserId: 1, // Replace with actual user ID
        });
      }

      showToast("success", "Success", "AI Diagnostics data saved successfully!");
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('localStorageUpdate'));

    } catch (error: any) {
      console.error("Error saving AI assessment:", error);
      showToast("error", "Error", error.message || "Failed to save AI Diagnostics data");
    } finally {
      setIsSaving(false);
    }
  };

  const renderAIDiagnostics = () => (
    <div className="space-y-8">
      {/* Composition Images */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Composition</h3>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((imageNum) => (
            <div key={imageNum} className="relative">
              <img
                src={`/medical-scan-.png?key=3u1ik&height=120&width=160&query=medical scan ${imageNum}`}
                alt={`Medical scan ${imageNum}`}
                className="w-full h-30 object-cover rounded-lg border border-gray-200"
              />
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 rounded-full p-1">
                <i className="pi pi-eye text-white text-xs"></i>
                <span className="text-white text-xs ml-1">Preview</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Composition Radio Buttons */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Composition</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <RadioButton
              inputId="cystic"
              name="composition"
              value="cystic"
              onChange={(e) => handleRadioChange("composition", e.value)}
              checked={aiDiagnosticsData.composition === "cystic"}
            />
            <label
              htmlFor="cystic"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              Cystic Or Almost Completely Cystic
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <RadioButton
              inputId="solid"
              name="composition"
              value="solid"
              onChange={(e) => handleRadioChange("composition", e.value)}
              checked={aiDiagnosticsData.composition === "solid"}
            />
            <label
              htmlFor="solid"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              Solid or Almost Completely Solid
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <RadioButton
              inputId="mixed"
              name="composition"
              value="mixed"
              onChange={(e) => handleRadioChange("composition", e.value)}
              checked={aiDiagnosticsData.composition === "mixed"}
            />
            <label
              htmlFor="mixed"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              Mixed Cystic and Solid
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <RadioButton
              inputId="spongioform"
              name="composition"
              value="spongioform"
              onChange={(e) => handleRadioChange("composition", e.value)}
              checked={aiDiagnosticsData.composition === "spongioform"}
            />
            <label
              htmlFor="spongioform"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              Spongioform
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
          </div>
        </div>
      </div>

      {/* Echogenicity Radio Buttons */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Echogenicity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <RadioButton
              inputId="anechoic"
              name="echogenicity"
              value="anechoic"
              onChange={(e) => handleRadioChange("echogenicity", e.value)}
              checked={aiDiagnosticsData.echogenicity === "anechoic"}
            />
            <label
              htmlFor="anechoic"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              Anechoic
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <RadioButton
              inputId="hyperechoic"
              name="echogenicity"
              value="hyperechoic"
              onChange={(e) => handleRadioChange("echogenicity", e.value)}
              checked={aiDiagnosticsData.echogenicity === "hyperechoic"}
            />
            <label
              htmlFor="hyperechoic"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              Hyperechoic or Isoechoic
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <RadioButton
              inputId="hypoechoic"
              name="echogenicity"
              value="hypoechoic"
              onChange={(e) => handleRadioChange("echogenicity", e.value)}
              checked={aiDiagnosticsData.echogenicity === "hypoechoic"}
            />
            <label
              htmlFor="hypoechoic"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              Hypoechoic
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <RadioButton
              inputId="veryHypoechoic"
              name="echogenicity"
              value="veryHypoechoic"
              onChange={(e) => handleRadioChange("echogenicity", e.value)}
              checked={aiDiagnosticsData.echogenicity === "veryHypoechoic"}
            />
            <label
              htmlFor="veryHypoechoic"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              Very Hypoechoic
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
          </div>
        </div>
      </div>

      {/* Shape Radio Buttons */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Shape</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <RadioButton
              inputId="widerThanTallShape"
              name="shape"
              value="widerThanTall"
              onChange={(e) => handleRadioChange("shape", e.value)}
              checked={aiDiagnosticsData.shape === "widerThanTall"}
            />
            <label
              htmlFor="widerThanTallShape"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              Wider Than Tall
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <RadioButton
              inputId="tallerThanWide"
              name="shape"
              value="tallerThanWide"
              onChange={(e) => handleRadioChange("shape", e.value)}
              checked={aiDiagnosticsData.shape === "tallerThanWide"}
            />
            <label
              htmlFor="tallerThanWide"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              Taller Than Wide
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
          </div>
        </div>
      </div>

      {/* Margin Radio Buttons */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Margin</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <RadioButton
              inputId="smooth"
              name="margin"
              value="smooth"
              onChange={(e) => handleRadioChange("margin", e.value)}
              checked={aiDiagnosticsData.margin === "smooth"}
            />
            <label
              htmlFor="smooth"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              Smooth
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <RadioButton
              inputId="illDefined"
              name="margin"
              value="illDefined"
              onChange={(e) => handleRadioChange("margin", e.value)}
              checked={aiDiagnosticsData.margin === "illDefined"}
            />
            <label
              htmlFor="illDefined"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              Ill defined
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <RadioButton
              inputId="lobularOrIrregular"
              name="margin"
              value="lobular"
              onChange={(e) => handleRadioChange("margin", e.value)}
              checked={aiDiagnosticsData.margin === "lobular"}
            />
            <label
              htmlFor="lobularOrIrregular"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              Lobulated or irregular
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <RadioButton
              inputId="extraThyroidalExtension"
              name="margin"
              value="extraThyroidal"
              onChange={(e) => handleRadioChange("margin", e.value)}
              checked={aiDiagnosticsData.margin === "extraThyroidal"}
            />
            <label
              htmlFor="extraThyroidalExtension"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              Extra Thyroidal Extension
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
          </div>
        </div>
      </div>

      {/* Echogenic Focii - Kept as Checkboxes */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Echogenic Focii
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="noneOrLargeCometTail"
              checked={aiDiagnosticsData.echogenicFocii.noneOrLarge}
              onChange={(e) =>
                handleCheckboxChange("echogenicFocii", "noneOrLarge", e.checked ?? false)
              }
            />
            <label
              htmlFor="noneOrLargeCometTail"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              None or Large Comet-Tail Artifacts
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">
              {aiDiagnosticsData.echogenicFocii.noneOrLarge ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="macrocalcifications"
              checked={aiDiagnosticsData.echogenicFocii.macrocalcifications}
              onChange={(e) =>
                handleCheckboxChange(
                  "echogenicFocii",
                  "macrocalcifications",
                  e.checked ?? false
                )
              }
            />
            <label
              htmlFor="macrocalcifications"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              Macrocalcifications
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">
              {aiDiagnosticsData.echogenicFocii.macrocalcifications ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="peripheralCalcifications"
              checked={aiDiagnosticsData.echogenicFocii.peripheral}
              onChange={(e) =>
                handleCheckboxChange(
                  "echogenicFocii",
                  "peripheral",
                  e.checked ?? false
                )
              }
            />
            <label
              htmlFor="peripheralCalcifications"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              Peripheral/RIM Calcifications
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">
              {aiDiagnosticsData.echogenicFocii.peripheral ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="punctateEchogenicFoci"
              checked={aiDiagnosticsData.echogenicFocii.punctate}
              onChange={(e) =>
                handleCheckboxChange("echogenicFocii", "punctate", e.checked ?? false)
              }
            />
            <label
              htmlFor="punctateEchogenicFoci"
              className="text-sm text-gray-700 flex items-center gap-2"
            >
              Punctate Echogenic Foci
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">
              {aiDiagnosticsData.echogenicFocii.punctate ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>

      {/* Point - Kept as Checkboxes WITH SAVE BUTTON */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Point</h3>
          <Button
            label="Save Assessment"
            icon="pi pi-save"
            onClick={handleSavePoint}
            loading={isSaving}
            className="p-button-success"
          />
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="tr1"
              checked={aiDiagnosticsData.points.tr1}
              onChange={(e) =>
                handleCheckboxChange("points", "tr1", e.checked ?? false)
              }
            />
            <div className="bg-green-100 border border-green-300 rounded px-3 py-2 text-sm">
              TR1 (0 point)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="tr2"
              checked={aiDiagnosticsData.points.tr2}
              onChange={(e) =>
                handleCheckboxChange("points", "tr2", e.checked ?? false)
              }
            />
            <div className="bg-blue-100 border border-blue-300 rounded px-3 py-2 text-sm">
              TR2 (2 points)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="tr3"
              checked={aiDiagnosticsData.points.tr3}
              onChange={(e) =>
                handleCheckboxChange("points", "tr3", e.checked ?? false)
              }
            />
            <div className="bg-purple-100 border border-purple-300 rounded px-3 py-2 text-sm">
              TR3 (3 points)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="tr4"
              checked={aiDiagnosticsData.points.tr4}
              onChange={(e) =>
                handleCheckboxChange("points", "tr4", e.checked ?? false)
              }
            />
            <div className="bg-yellow-100 border border-yellow-300 rounded px-3 py-2 text-sm">
              TR4 (4-6 points)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="tr5"
              checked={aiDiagnosticsData.points.tr5}
              onChange={(e) =>
                handleCheckboxChange("points", "tr5", e.checked ?? false)
              }
            />
            <div className="bg-red-100 border border-red-300 rounded px-3 py-2 text-sm">
              TR5 (7+ points)
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <Toast ref={toast} />
      <div className="my-8 border-t border-gray-200"></div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        AI Diagnostics
      </h2>
      {renderAIDiagnostics()}
    </div>
  );
};

export default AiAssessment;
{/* --- IGNORE ---
      modify_date: new Date(patient.createdAt).toISOString().split('T')[0], --- IGNORE ---
--- --- IGNORE ---
<AiAssessment 
  patientId={currentPatientId} 
  caseId={currentCaseId} 
  volunteerCode={currentVolunteerCode} 
/>
      let assessmentsList = existingAssessments ? JSON.parse(existingAssessments) : [];*/}