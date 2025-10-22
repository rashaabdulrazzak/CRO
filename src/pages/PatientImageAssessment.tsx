import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import type { AssessmentData, BethesdaLevel } from "../types";

export default function PatientImageAssessment() {
  const { userId } = useParams();
  const [protocolNumber, setProtocolNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // The rest of your assessmentData setup
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    composition: "",
    echogenicity: "",
    shape: "",
    margin: "",
    echogenicFocii: "",
    tiradsScore: "",
    tiradsPoint: "",
    biopsyPathologyExpectation: { bethesda: "" },
  });

  const toast = useRef<Toast>(null);

  // Auto-populate protocol number on first mount
  useEffect(() => {
    if (userId) {
      setProtocolNumber(String(userId));
    }
  }, [userId]);

  const mockResponseData: AssessmentData = {
    composition: "Solid and cystic",
    echogenicity: "Hypoechoic",
    shape: "Irregular",
    margin: "Ill-defined",
    echogenicFocii: "Present",
    tiradsScore: "TR4",
    tiradsPoint: "4",
    biopsyPathologyExpectation: {
      bethesda: "V",
    },
  };

  const handleInputChange = (field: string, value: string) => {
    setAssessmentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSendToTraick = () => {
    if (!protocolNumber.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please enter a protocol number",
        life: 3000,
      });
      return;
    }

    setIsLoading(true);
    console.log("Sending to TRAICK dev with protocol:", protocolNumber);

    // Simulate API call delay
    setTimeout(() => {
      setAssessmentData(mockResponseData);
      setShowResults(true);
      setIsLoading(false);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Protocol received successfully",
        life: 3000,
      });
    }, 2000);
  };

  const handleSaveAssessment = async () => {
    if (!protocolNumber.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Protocol number is required to save assessment",
        life: 3000,
      });
      return;
    }

    setIsSaving(true);

    try {
      // Replace with your actual API endpoint
      const response = await fetch(
        `/api/patients/${protocolNumber}/assessments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            protocolNumber,
            assessmentData,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save assessment");
      }

      const result = await response.json();

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Assessment saved successfully to patient record",
        life: 3000,
      });

      console.log("Assessment saved:", result);
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save assessment. Please try again.",
        life: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Toast ref={toast} />
        <h1 className="text-2xl font-bold text-gray-900">
          Image Assessment Module
        </h1>
        {/* Your Assessment UI (Panel, fields, buttons) exactly as in your dialog */}
        {/* Input Section */}
        <Panel className="panel-border p-0">
          <div className="border border-gray-300">
            <div className="grid grid-cols-2 border-b border-gray-300">
              <div className="p-4 border-r border-gray-300">
                <label
                  htmlFor="protocol-number"
                  className="text-sm font-medium text-black-700"
                >
                  Enter the Protocol Number:
                </label>
              </div>
              <div className="p-4">
                <InputText
                  id="protocol-number"
                  value={protocolNumber}
                  onChange={(e) => setProtocolNumber(e.target.value)}
                  placeholder="text"
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="p-4 border-r border-gray-300">
                <span className="text-sm font-medium text-gray-700">
                  Click to send the TRAICK dev.
                </span>
              </div>
              <div className="p-4">
                <Button
                  className="w-full"
                  disabled={isLoading}
                  label={isLoading ? "Sending..." : "Send to TRAICK"}
                  severity="secondary"
                  onClick={handleSendToTraick}
                />
              </div>
            </div>
          </div>
        </Panel>
        {showResults && (
          <div className="space-y-4">
            <p className="text-lg text-gray-900">
              The results of the image assessment are as follows:
            </p>

            <Panel className="p-0">
              <div className="border border-gray-300">
                {/* Text Input Fields */}
                {[
                  { label: "Composition", field: "composition" },
                  { label: "Echogenicity", field: "echogenicity" },
                  { label: "Shape", field: "shape" },
                  { label: "Margin", field: "margin" },
                  { label: "Echogenic Focii", field: "echogenicFocii" },
                  { label: "TIRADS Score", field: "tiradsScore" },
                  { label: "TIRADS Point", field: "tiradsPoint" },
                ].map((item, index) => (
                  <div
                    key={item.field}
                    className={`grid grid-cols-2 ${
                      index < 6 ? "border-b border-gray-300" : ""
                    }`}
                  >
                    <div className="p-4 border-r border-gray-300">
                      <label
                        htmlFor={item.field}
                        className="text-sm font-medium text-black-700"
                      >
                        {item.label}
                      </label>
                    </div>
                    <div className="p-4">
                      <InputText
                        id={item.field}
                        value={
                          assessmentData[
                            item.field as keyof typeof assessmentData
                          ] as string
                        }
                        onChange={(e) =>
                          handleInputChange(item.field, e.target.value)
                        }
                        placeholder="text"
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}

                {/* Biopsy Need Evaluation */}
                {/*    <div className="grid grid-cols-2 border-b border-t border-gray-300">
                  <div className="p-4 border-r border-gray-300">
                    <label className="text-sm font-medium text-gray-700">
                      Biopsy need evaluation
                    </label>
                  </div>
                  <div className="p-4 flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        inputId="fna-needed"
                        checked={assessmentData.biopsyNeedEvaluation.fnaNeeded}
                        onChange={(e) =>
                          handleCheckboxChange(
                            "biopsyNeedEvaluation",
                            "fnaNeeded",
                            e.checked || false
                          )
                        }
                      />
                      <label
                        htmlFor="fna-needed"
                        className="text-sm text-gray-700"
                      >
                        FNA needed
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        inputId="normal"
                        checked={assessmentData.biopsyNeedEvaluation.normal}
                        onChange={(e) =>
                          handleCheckboxChange(
                            "biopsyNeedEvaluation",
                            "normal",
                            e.checked || false
                          )
                        }
                      />
                      <label htmlFor="normal" className="text-sm text-gray-700">
                        Normal
                      </label>
                    </div>
                  </div>
                </div> */}

                {/* Biopsy Pathology Expectation */}
                {/* <div className="grid grid-cols-2">
                  <div className="p-4 border-r border-gray-300">
                    <label className="text-sm font-medium text-gray-700">
                      Biopsy pathology expectation (Bethesda)
                    </label>
                  </div>
                  <div className="p-4 flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        inputId="malign"
                        checked={
                          assessmentData.biopsyPathologyExpectation.malign
                        }
                        onChange={(e) =>
                          handleCheckboxChange(
                            "biopsyPathologyExpectation",
                            "malign",
                            e.checked || false
                          )
                        }
                      />
                      <label htmlFor="malign" className="text-sm text-gray-700">
                        Malign
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        inputId="benign"
                        checked={
                          assessmentData.biopsyPathologyExpectation.benign
                        }
                        onChange={(e) =>
                          handleCheckboxChange(
                            "biopsyPathologyExpectation",
                            "benign",
                            e.checked || false
                          )
                        }
                      />
                      <label htmlFor="benign" className="text-sm text-gray-700">
                        Benign
                      </label>
                    </div>
                  </div>
                </div> */}
                {/* Biopsy Pathology Expectation (Bethesda I–V) */}
                <div className="grid grid-cols-2 border-t border-gray-300">
                  <div className="p-4 border-r border-gray-300">
                    <label className="text-sm font-medium text-gray-700">
                      Biopsy pathology expectation (Bethesda)
                    </label>
                  </div>
                  <div className="p-4 flex flex-wrap gap-4">
                    {(["I", "II", "III", "IV", "V"] as BethesdaLevel[]).map(
                      (level) => (
                        <div
                          className="flex items-center space-x-2"
                          key={level}
                        >
                          <Checkbox
                            inputId={`bethesda-${level}`}
                            checked={
                              assessmentData.biopsyPathologyExpectation
                                .bethesda === level
                            }
                            onChange={() =>
                              setAssessmentData((prev) => ({
                                ...prev,
                                biopsyPathologyExpectation: { bethesda: level },
                              }))
                            }
                          />
                          <label
                            htmlFor={`bethesda-${level}`}
                            className="text-sm text-gray-700"
                          >
                            {`Bethesda ${level}`}
                          </label>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </Panel>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                label={isSaving ? "Saving..." : "Complete Assessment"}
                icon="pi pi-save"
                onClick={handleSaveAssessment}
                disabled={isSaving}
                severity="success"
                className="px-6 py-2 rounded-md p-button-secondary"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
