/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import MedicalImageViewer from "./MedicalImageViewer";
import ImagePreviewDialog from "./ImagePreviewDialog";
import { medicalImageService } from "../services/medicalImageService"; 

interface RadiologistAssessmentDialogProps {
  visible: boolean;
  onHide: () => void;
  patientId?: number | null;
  caseId?: number | null;
  volunteerCode?: string;
}

const RadiologistAssessmentDialog: React.FC<RadiologistAssessmentDialogProps> = ({ 
  visible,
  onHide,
  patientId, 
  caseId, 
  volunteerCode 
}) => {
  const toast = useRef<Toast>(null);
  // Medical images state
  const [medicalImages, setMedicalImages] = useState<Array<{
    id: string;
    url: string;
    isDicom: boolean;
  }>>([]);

  const [selectedImage, setSelectedImage] = useState<{ url: string; isDicom: boolean } | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
      const isPreviewDialogVisible = !!selectedImage;

  const [loadingImages, setLoadingImages] = useState(false);

  // Define initial/default state
  const getInitialState = () => ({
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
    biopsyNeedEvaluation: {
    fnaNeeded: false,
    normal: false,
  }

  });

  const [aiDiagnosticsData, setAiDiagnosticsData] = useState(getInitialState());
  const [isSaving, setIsSaving] = useState(false);

  // Fetch medical images when dialog opens
  useEffect(() => {
    if (visible && (caseId || patientId)) {
      fetchMedicalImages();
    }
  }, [visible, caseId, patientId]);

  const fetchMedicalImages = async () => {
    try {
      setLoadingImages(true);
      const images = await medicalImageService.fetchImagesByCase(caseId || null, patientId || null);
      setMedicalImages(images);
    } catch (error) {
      console.error('Error fetching medical images:', error);
      showToast('error', 'Error', 'Failed to load medical images');
    } finally {
      setLoadingImages(false);
    }
  };

  const handleImageClick = (image: { url: string; isDicom: boolean }) => {
    setSelectedImage(image);
    setPreviewVisible(true);
  };
  // Calculate points based on ACR TI-RADS criteria
  const calculateTotalPoints = useCallback (() => {
    let total = 0;

    // Composition points
    switch (aiDiagnosticsData.composition) {
      case "cystic":
      case "spongioform":
        total += 0;
        break;
      case "mixed":
        total += 1;
        break;
      case "solid":
        total += 2;
        break;
    }

    // Echogenicity points
    switch (aiDiagnosticsData.echogenicity) {
      case "anechoic":
        total += 0;
        break;
      case "hyperechoic":
        total += 1;
        break;
      case "hypoechoic":
        total += 2;
        break;
      case "veryHypoechoic":
        total += 3;
        break;
    }

    // Shape points
    switch (aiDiagnosticsData.shape) {
      case "widerThanTall":
        total += 0;
        break;
      case "tallerThanWide":
        total += 3;
        break;
    }

    // Margin points
    switch (aiDiagnosticsData.margin) {
      case "smooth":
      case "illDefined":
        total += 0;
        break;
      case "lobular":
        total += 2;
        break;
      case "extraThyroidal":
        total += 3;
        break;
    }

    // Echogenic Foci points (can be multiple)
    if (aiDiagnosticsData.echogenicFocii.noneOrLarge) {
      total += 0;
    }
    if (aiDiagnosticsData.echogenicFocii.macrocalcifications) {
      total += 1;
    }
    if (aiDiagnosticsData.echogenicFocii.peripheral) {
      total += 2;
    }
    if (aiDiagnosticsData.echogenicFocii.punctate) {
      total += 3;
    }

    return total;
  }, [aiDiagnosticsData]);

  // Determine TR level based on total points
  const determineTRLevel = (totalPoints: number) => {
    if (totalPoints === 0) return "tr1";
    if (totalPoints === 2) return "tr2";
    if (totalPoints === 3) return "tr3";
    if (totalPoints >= 4 && totalPoints <= 6) return "tr4";
    if (totalPoints >= 7) return "tr5";
    return "tr1";
  };

  // Update TR checkboxes whenever selections change
  useEffect(() => {
    const totalPoints = calculateTotalPoints();
    const trLevel = determineTRLevel(totalPoints);

    // Reset all TR checkboxes
    const updatedPoints = {
      tr1: false,
      tr2: false,
      tr3: false,
      tr4: false,
      tr5: false,
    };

    // Set the appropriate TR level
    updatedPoints[trLevel as keyof typeof updatedPoints] = true;

    if (JSON.stringify(aiDiagnosticsData.points) !== JSON.stringify(updatedPoints)){
 setAiDiagnosticsData((prev) => ({
      ...prev,
      points: updatedPoints,
    }));
    }
   
  }, [
    aiDiagnosticsData.composition,
    aiDiagnosticsData.echogenicity,
    aiDiagnosticsData.shape,
    aiDiagnosticsData.margin,
    aiDiagnosticsData.echogenicFocii,
    calculateTotalPoints,aiDiagnosticsData.points
  ]);

  // Load existing assessment data when dialog opens OR reset to default
  useEffect(() => {
    if (visible && (caseId || volunteerCode)) {
      const existingAssessments = localStorage.getItem("app.RadiologistAssessments");
      
      if (existingAssessments) {
        const assessmentsList = JSON.parse(existingAssessments);
        const existingAssessment = assessmentsList.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item: any) => item.caseId === caseId || item.volunteerCode === volunteerCode
        );
        
        if (existingAssessment) {
          // Load existing assessment
          setAiDiagnosticsData({
            composition: existingAssessment.composition || "cystic",
            echogenicity: existingAssessment.echogenicity || "anechoic",
            shape: existingAssessment.shape || "widerThanTall",
            margin: existingAssessment.margin || "smooth",
            echogenicFocii: existingAssessment.echogenicFocii || {
              noneOrLarge: false,
              macrocalcifications: false,
              peripheral: false,
              punctate: false,
            },
            points: existingAssessment.points || {
              tr1: false,
              tr2: false,
              tr3: false,
              tr4: false,
              tr5: false,
            },
            biopsyNeedEvaluation: existingAssessment.biopsyNeedEvaluation || {
              fnaNeeded: false,
              normal: false,
            }
          });
        } else {
          // No existing assessment found - reset to default
          setAiDiagnosticsData(getInitialState());
        }
      } else {
        // No assessments in localStorage - reset to default
        setAiDiagnosticsData(getInitialState());
      }
    } else if (visible) {
      // Dialog opened without caseId/volunteerCode - reset to default
      setAiDiagnosticsData(getInitialState());
    }
  }, [visible, caseId, volunteerCode]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!visible) {
      // Reset to initial state when dialog is closed
      setAiDiagnosticsData(getInitialState());
    }
  }, [visible]);

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

  const handleSaveAssessment = async () => {
    try {
      setIsSaving(true);

      const totalPoints = calculateTotalPoints();

      const assessmentPayload = {
        ...aiDiagnosticsData,
        totalPoints: totalPoints,
        patientId: patientId,
        caseId: caseId,
        volunteerCode: volunteerCode,
        timestamp: new Date().toISOString(),
      };

      const existingAssessments = localStorage.getItem("app.RadiologistAssessments");
      const assessmentsList = existingAssessments ? JSON.parse(existingAssessments) : [];
      
      const existingIndex = assessmentsList.findIndex(
        (item: any) => item.caseId === caseId || item.volunteerCode === volunteerCode
      );

      if (existingIndex !== -1) {
        assessmentsList[existingIndex] = {
          ...assessmentsList[existingIndex],
          ...assessmentPayload,
          updatedAt: new Date().toISOString(),
        };
      } else {
        assessmentsList.push({
          id: assessmentsList.length + 1,
          ...assessmentPayload,
          createdAt: new Date().toISOString(),
        });
      }

      localStorage.setItem("app.RadiologistAssessments", JSON.stringify(assessmentsList));

      showToast("success", "Success", "Assessment saved successfully!");
      
      window.dispatchEvent(new Event('localStorageUpdate'));
      
      setTimeout(() => {
        onHide();
      }, 1000);

    } catch (error: any) {
      console.error("Error saving assessment:", error);
      showToast("error", "Error", error.message || "Failed to save assessment");
    } finally {
      setIsSaving(false);
    }
  };

  const renderAIDiagnostics = () => {
   // const totalPoints = calculateTotalPoints();
   // const trLevel = determineTRLevel(totalPoints);

    return (
      <div className="space-y-8">
        {/* Score Display */}
        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold text-gray-800">Current Score</h4>
              <p className="text-sm text-gray-600">Based on ACR TI-RADS criteria</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{totalPoints} points</div>
              <div className="text-sm font-medium text-gray-700">
                {trLevel.toUpperCase().replace("TR", "TR")}
              </div>
            </div>
          </div>
        </div> */}

        {/* Composition Images */}
      {/*  <div >
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
        </div>  */}
        {/* Medical Images */}
        <div className="grid grid-cols-3 gap-4 mb-6">
  {loadingImages ? (
    Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="relative">
        <div className="w-full h-30 bg-gray-200 rounded-lg border border-gray-300 animate-pulse" />
      </div>
    ))
  ) : medicalImages.length > 0 ? (
    medicalImages.slice(0, 3).map((image) => (
      <div key={image.id} className="relative cursor-pointer group">
        <MedicalImageViewer
          imageUrl={image.url}
          isDicom={image.isDicom}
          width="100%"      
          height="120px"
          onImageClick={() => handleImageClick(image)}
        />
        <div className="absolute top-2 left-2 bg-black bg-opacity-60 rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <i className="pi pi-eye text-white text-xs"></i>
          <span className="text-white text-xs ml-1">Preview</span>
        </div>
        {image.isDicom && (
          <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            DICOM
          </div>
        )}
      </div>
    ))
  ) : (
    <div className="col-span-3 text-center text-gray-500 py-8"> {/* ← also update this to col-span-3 */}
      No medical images available
    </div>
  )}
</div>
        <div className="grid grid-cols-4 gap-4 mb-6">
  {/* {loadingImages ? (
    // Loading skeleton
    Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="relative">
        <div className="w-full h-30 bg-gray-200 rounded-lg border border-gray-300 animate-pulse" />
      </div>
    ))
  ) : medicalImages.length > 0 ? (
    medicalImages.slice(0, 4).map((image, index) => (
      <div key={image.id} className="relative cursor-pointer group">
        <SimpleImageViewer
          imageUrl={image.url}
          height="120px"
          onImageClick={() => handleImageClick(image)}
        />
        <div 
          className="absolute top-2 left-2 bg-black bg-opacity-60 rounded-full px-2 py-1 
                     opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleImageClick(image)}
        >
          <i className="pi pi-eye text-white text-xs"></i>
          <span className="text-white text-xs ml-1">Preview</span>
        </div>
        {image.isDicom && (
          <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            DICOM
          </div>
        )}
      </div>
    ))
  ) : (
    <div className="col-span-4 text-center text-gray-500 py-8">
      No medical images available
    </div>
  )} */}
</div>

        {/* Composition Radio Buttons */}
        <div className="p-4 border border-gray-200 rounded-lg">
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
              <label htmlFor="cystic" className="text-sm text-gray-700 flex items-center gap-2">
                Cystic Or Almost Completely Cystic <span className="text-blue-300 font-light text-xs">(0 points)</span>
                
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
              <label htmlFor="spongioform" className="text-sm text-gray-700 flex items-center gap-2">
                Spongioform <span className="text-blue-300 font-light text-xs">(0 points)</span>
                
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
              <label htmlFor="mixed" className="text-sm text-gray-700 flex items-center gap-2">
                Mixed Cystic and Solid <span className="text-blue-300 font-light text-xs">(1 point)</span>
                
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
              <label htmlFor="solid" className="text-sm text-gray-700 flex items-center gap-2">
                Solid or Almost Completely Solid <span className="text-blue-300 font-light text-xs">(2 points)</span>
                
              </label>
            </div>
          </div>
        </div>

        {/* Echogenicity Radio Buttons */}
        <div className="p-4 border border-gray-200 rounded-lg">
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
              <label htmlFor="anechoic" className="text-sm text-gray-700 flex items-center gap-2">
                Anechoic <span className="text-blue-300 font-light text-xs">(0 points)</span>
                
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
              <label htmlFor="hyperechoic" className="text-sm text-gray-700 flex items-center gap-2">
                Hyperechoic or Isoechoic <span className="text-blue-300 font-light text-xs">(1 point)</span>
                
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
              <label htmlFor="hypoechoic" className="text-sm text-gray-700 flex items-center gap-2">
                Hypoechoic <span className="text-blue-300 font-light text-xs">(2 points)</span>
                
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
              <label htmlFor="veryHypoechoic" className="text-sm text-gray-700 flex items-center gap-2">
                Very Hypoechoic <span className="text-blue-300 font-light text-xs">(3 points)</span>
                
              </label>
            </div>
          </div>
        </div>

        {/* Shape Radio Buttons */}
        <div className="p-4 border border-gray-200 rounded-lg">
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
              <label htmlFor="widerThanTallShape" className="text-sm text-gray-700 flex items-center gap-2">
                Wider Than Tall <span className="text-blue-300 font-light text-xs">(0 points)</span>
                
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
              <label htmlFor="tallerThanWide" className="text-sm text-gray-700 flex items-center gap-2">
                Taller Than Wide <span className="text-blue-300 font-light text-xs">(3 points)</span>
                
              </label>
            </div>
          </div>
        </div>

        {/* Margin Radio Buttons */}
        <div className="p-4 border border-gray-200 rounded-lg"> 
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
              <label htmlFor="smooth" className="text-sm text-gray-700 flex items-center gap-2">
                Smooth <span className="text-blue-300 font-light text-xs">(0 points)</span>
                
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
              <label htmlFor="illDefined" className="text-sm text-gray-700 flex items-center gap-2">
                Ill defined <span className="text-blue-300 font-light text-xs">(0 points)</span>
                
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
              <label htmlFor="lobularOrIrregular" className="text-sm text-gray-700 flex items-center gap-2">
                Lobulated or irregular <span className="text-blue-300 font-light text-xs">(2 points)</span>
                
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
              <label htmlFor="extraThyroidalExtension" className="text-sm text-gray-700 flex items-center gap-2">
                Extra Thyroidal Extension <span className="text-blue-300 font-light text-xs">(3 points)</span>
                
              </label>
            </div>
          </div>
        </div>

        {/* Echogenic Focii */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Echogenic Focii (Select all that apply)</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                inputId="noneOrLargeCometTail"
                checked={aiDiagnosticsData.echogenicFocii.noneOrLarge}
                onChange={(e) =>
                  handleCheckboxChange("echogenicFocii", "noneOrLarge", e.checked ?? false)
                }
              />
              <label htmlFor="noneOrLargeCometTail" className="text-sm text-gray-700 flex items-center gap-2">
                None or Large Comet-Tail Artifacts <span className="text-blue-300 font-light text-xs">(0 points)</span>
                
              </label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                inputId="macrocalcifications"
                checked={aiDiagnosticsData.echogenicFocii.macrocalcifications}
                onChange={(e) =>
                  handleCheckboxChange("echogenicFocii", "macrocalcifications", e.checked ?? false)
                }
              />
              <label htmlFor="macrocalcifications" className="text-sm text-gray-700 flex items-center gap-2">
                Macrocalcifications <span className="text-blue-300 font-light text-xs">(1 point)</span>
                
              </label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                inputId="peripheralCalcifications"
                checked={aiDiagnosticsData.echogenicFocii.peripheral}
                onChange={(e) =>
                  handleCheckboxChange("echogenicFocii", "peripheral", e.checked ?? false)
                }
              />
              <label htmlFor="peripheralCalcifications" className="text-sm text-gray-700 flex items-center gap-2">
                Peripheral/RIM Calcifications <span className="text-blue-300 font-light text-xs">(2 points)</span>
                
              </label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                inputId="punctateEchogenicFoci"
                checked={aiDiagnosticsData.echogenicFocii.punctate}
                onChange={(e) =>
                  handleCheckboxChange("echogenicFocii", "punctate", e.checked ?? false)
                }
              />
              <label htmlFor="punctateEchogenicFoci" className="text-sm text-gray-700 flex items-center gap-2">
                Punctate Echogenic Foci <span className="text-blue-300 font-light text-xs">(3 points)</span>
                
              </label>
            </div>
          </div>
        </div>

        {/* TR Level Display (Read-only) */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">TI-RADS Category (Auto-calculated)</h3>
          <div className="flex gap-4 flex-wrap">
            <div className={`flex items-center gap-2 ${aiDiagnosticsData.points.tr1 ? 'opacity-100' : 'opacity-40'}`}>
              <Checkbox
                inputId="tr1"
                checked={aiDiagnosticsData.points.tr1}
                disabled={true}
              />
              <div className="bg-green-100 border border-green-300 rounded px-3 py-2 text-sm font-medium">
                TR1 (0 points) - Benign
              </div>
            </div>
            <div className={`flex items-center gap-2 ${aiDiagnosticsData.points.tr2 ? 'opacity-100' : 'opacity-40'}`}>
              <Checkbox
                inputId="tr2"
                checked={aiDiagnosticsData.points.tr2}
                disabled={true}
              />
              <div className="bg-blue-100 border border-blue-300 rounded px-3 py-2 text-sm font-medium">
                TR2 (2 points) - Not Suspicious
              </div>
            </div>
            <div className={`flex items-center gap-2 ${aiDiagnosticsData.points.tr3 ? 'opacity-100' : 'opacity-40'}`}>
              <Checkbox
                inputId="tr3"
                checked={aiDiagnosticsData.points.tr3}
                disabled={true}
              />
              <div className="bg-purple-100 border border-purple-300 rounded px-3 py-2 text-sm font-medium">
                TR3 (3 points) - Mildly Suspicious
              </div>
            </div>
            <div className={`flex items-center gap-2 ${aiDiagnosticsData.points.tr4 ? 'opacity-100' : 'opacity-40'}`}>
              <Checkbox
                inputId="tr4"
                checked={aiDiagnosticsData.points.tr4}
                disabled={true}
              />
              <div className="bg-yellow-100 border border-yellow-300 rounded px-3 py-2 text-sm font-medium">
                TR4 (4-6 points) - Moderately Suspicious
              </div>
            </div>
            <div className={`flex items-center gap-2 ${aiDiagnosticsData.points.tr5 ? 'opacity-100' : 'opacity-40'}`}>
              <Checkbox
                inputId="tr5"
                checked={aiDiagnosticsData.points.tr5}
                disabled={true}
              />
              <div className="bg-red-100 border border-red-300 rounded px-3 py-2 text-sm font-medium">
                TR5 (7+ points) - Highly Suspicious
              </div>
            </div>
           
          </div>
        
        </div>
         
   {/* Biopsy Need Evaluation */}
<div className="p-4 border border-gray-200 rounded-lg">
  <h3 className="text-lg font-medium text-gray-800 mb-4">
    Biopsy Need Evaluation
  </h3>
  <div className="flex flex-col space-y-3">
    <div className="flex items-center gap-3">
      <Checkbox
        inputId="fnaNeeded"
        checked={aiDiagnosticsData.biopsyNeedEvaluation.fnaNeeded}
        onChange={() =>
          setAiDiagnosticsData((prev) => ({
            ...prev,
            biopsyNeedEvaluation: {
              fnaNeeded: true,
              normal: false,
            },
          }))
        }
      />
      <label htmlFor="fnaNeeded" className="text-sm text-gray-700">
        FNA Needed
      </label>
    </div>
    <div className="flex items-center gap-3">
      <Checkbox
        inputId="normal"
        checked={aiDiagnosticsData.biopsyNeedEvaluation.normal}
        onChange={() =>
          setAiDiagnosticsData((prev) => ({
            ...prev,
            biopsyNeedEvaluation: {
              fnaNeeded: false,
              normal: true,
            },
          }))
        }
      />
      <label htmlFor="normal" className="text-sm text-gray-700">
        Normal
      </label>
    </div>
  </div>
</div>

      </div>
    );
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        header="Radiologist Assessment"
        style={{ width: "70vw" }}
        breakpoints={{ "960px": "90vw", "641px": "95vw" }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={onHide}
              className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            />
            <Button
              label="Save Assessment"
              icon="pi pi-save"
              onClick={handleSaveAssessment}
              loading={isSaving}
              className="px-6 py-2 rounded-md p-button-secondary"
            />
          </div>
        }
      >
        <div className="p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {renderAIDiagnostics()}
        </div>
      </Dialog>
      {isPreviewDialogVisible && selectedImage && (
        <ImagePreviewDialog
          visible={previewVisible}
          onHide={() => setPreviewVisible(false)}
          imageUrl={selectedImage.url}
          isDicom={selectedImage.isDicom}
        />
      )}
    </>
  );
};

export default RadiologistAssessmentDialog;
