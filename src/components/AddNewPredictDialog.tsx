/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from "react"
import { useState } from "react"
import { Dialog } from "primereact/dialog"
import { Steps } from "primereact/steps"
import { InputText } from "primereact/inputtext"
import { Calendar } from "primereact/calendar"
import { RadioButton } from "primereact/radiobutton"
import { Dropdown } from "primereact/dropdown"
import { Button } from "primereact/button"
import { Checkbox } from "primereact/checkbox"
import { FileUpload } from "primereact/fileupload"

interface AddNewPredictDialogProps {
  visible: boolean
  onHide: () => void
}

export const AddNewPredictDialog: React.FC<AddNewPredictDialogProps> = ({ visible, onHide }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [formData, setFormData] = useState({
    nameSurname: "",
    protocolNo: "3478234687",
    visitDate: null,
    gender: "",
    birthDate: null,
    weight: "72",
    size: "173",
    bodyMassIndex: "24.16",
    referredFrom: "Radiology Clinic",
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
  })

  const [medicalHistoryData, setMedicalHistoryData] = useState({
    medicalQuestion1: "no",
    howManyYears: "1",
    medicalQuestion2: "",
    medicalQuestion3: "",
    medicalQuestion4: "no",
    diseaseType: "",
    medicalQuestion5: "",
  })

  const [inclusionCriteriaData, setInclusionCriteriaData] = useState({
    inclusionQuestion1: "yes",
    inclusionQuestion2: "yes",
    inclusionQuestion3: "yes",
    inclusionQuestion4: "yes",
    inclusionQuestion5: "yes",
  })

  const [exclusionCriteriaData, setExclusionCriteriaData] = useState({
    exclusionQuestion1: "yes",
    exclusionQuestion2: "yes",
    exclusionQuestion3: "yes",
    exclusionQuestion4: "yes",
    exclusionQuestion5: "yes",
  })

  const [aiDiagnosticsData, setAiDiagnosticsData] = useState({
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
      widerThanTall: false,
    },
    shape: {
      widerThanTall: true,
      tallerThanWide: false,
    },
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
    points: {
      tr1: true,
      tr2: true,
      tr3: true,
      tr4: true,
      tr5: true,
    },
  })

  const [uploadedPhotos, setUploadedPhotos] = useState([
    "/medical-scan-1.png", // Pre-loaded image to match the design
  ])

  const steps = [
    { label: "Demographic Information" },
    { label: "Medical History" },
    { label: "Inclusion Criteria" },
    { label: "Exclusion Criteria" },
    { label: "AI Diagnostics" },
    { label: "Upload Photo" },
  ]

  const referralOptions = [
    { label: "Radiology Clinic", value: "Radiology Clinic" },
    { label: "Emergency Department", value: "Emergency Department" },
    { label: "General Practice", value: "General Practice" },
  ]

  const yearsOptions = [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMedicalHistoryChange = (field: string, value: any) => {
    setMedicalHistoryData((prev) => ({ ...prev, [field]: value }))
  }

  const handleInclusionCriteriaChange = (field: string, value: any) => {
    setInclusionCriteriaData((prev) => ({ ...prev, [field]: value }))
  }

  const handleExclusionCriteriaChange = (field: string, value: any) => {
    setExclusionCriteriaData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAiDiagnosticsChange = (field: string, value: any) => {
    const [section, property] = field.split(".")
    setAiDiagnosticsData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [property]: value,
      },
    }))
  }

  const resetFormToInitialState = () => {
    setActiveIndex(0)
    setFormData({
      nameSurname: "",
      protocolNo: "3478234687",
      visitDate: null,
      gender: "",
      birthDate: null,
      weight: "72",
      size: "173",
      bodyMassIndex: "24.16",
      referredFrom: "Radiology Clinic",
      question1: "",
      question2: "",
      question3: "",
      question4: "",
      question5: "",
    })
    setMedicalHistoryData({
      medicalQuestion1: "no",
      howManyYears: "1",
      medicalQuestion2: "",
      medicalQuestion3: "",
      medicalQuestion4: "no",
      diseaseType: "",
      medicalQuestion5: "",
    })
    setInclusionCriteriaData({
      inclusionQuestion1: "yes",
      inclusionQuestion2: "yes",
      inclusionQuestion3: "yes",
      inclusionQuestion4: "yes",
      inclusionQuestion5: "yes",
    })
    setExclusionCriteriaData({
      exclusionQuestion1: "yes",
      exclusionQuestion2: "yes",
      exclusionQuestion3: "yes",
      exclusionQuestion4: "yes",
      exclusionQuestion5: "yes",
    })
    setAiDiagnosticsData({
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
        widerThanTall: false,
      },
      shape: {
        widerThanTall: true,
        tallerThanWide: false,
      },
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
      points: {
        tr1: true,
        tr2: true,
        tr3: true,
        tr4: true,
        tr5: true,
      },
    })
    setUploadedPhotos([])
  }

  const handleDialogClose = () => {
    resetFormToInitialState()
    onHide()
  }

  const handleSaveAndNext = () => {
    if (activeIndex < steps.length - 1) {
      setActiveIndex(activeIndex + 1)
    } else {
      console.log("Form completed:", {
        formData,
        medicalHistoryData,
        inclusionCriteriaData,
        exclusionCriteriaData,
        aiDiagnosticsData,
        uploadedPhotos,
      })

      resetFormToInitialState()
      onHide()
    }
  }

  const renderStepContent = () => {
    switch (activeIndex) {
      case 0:
        return renderDemographicInformation()
      case 1:
        return renderMedicalHistory()
      case 2:
        return renderInclusionCriteria()
      case 3:
        return renderExclusionCriteria()
      case 4:
        return renderAIDiagnostics()
      case 5:
        return renderUploadPhoto()
      default:
        return <div className="text-center py-8 text-gray-500">Step content coming soon...</div>
    }
  }

  const renderDemographicInformation = () => (
    <>
      {/* Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* First Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name Surname</label>
            <InputText
              value={formData.nameSurname}
              onChange={(e) => handleInputChange("nameSurname", e.target.value)}
              placeholder="Name Surname"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <div className="flex gap-6">
              <div className="flex items-center">
                <RadioButton
                  inputId="male"
                  name="gender"
                  value="male"
                  onChange={(e) => handleInputChange("gender", e.value)}
                  checked={formData.gender === "male"}
                />
                <label htmlFor="male" className="ml-2 text-sm text-gray-700">
                  Male
                </label>
              </div>
              <div className="flex items-center">
                <RadioButton
                  inputId="female"
                  name="gender"
                  value="female"
                  onChange={(e) => handleInputChange("gender", e.value)}
                  checked={formData.gender === "female"}
                />
                <label htmlFor="female" className="ml-2 text-sm text-gray-700">
                  Female
                </label>
              </div>
              <div className="flex items-center">
                <RadioButton
                  inputId="not-specify"
                  name="gender"
                  value="not-specify"
                  onChange={(e) => handleInputChange("gender", e.value)}
                  checked={formData.gender === "not-specify"}
                />
                <label htmlFor="not-specify" className="ml-2 text-sm text-gray-700">
                  Does not want to specify
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Size (cm)</label>
            <InputText
              value={formData.size}
              onChange={(e) => handleInputChange("size", e.target.value)}
              className="w-full p-3 border-2 border-blue-400 rounded-md"
            />
          </div>
        </div>

        {/* Second Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Protocol No</label>
            <InputText
              value={formData.protocolNo}
              onChange={(e) => handleInputChange("protocolNo", e.target.value)}
              className="w-full p-3 border-2 border-blue-400 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
            <Calendar
              value={formData.birthDate}
              onChange={(e) => handleInputChange("birthDate", e.value)}
              placeholder="Select date"
              className="w-full"
              inputClassName="w-full p-3 border border-gray-300 rounded-md"
              showIcon
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Body Mass Index</label>
            <InputText
              value={formData.bodyMassIndex}
              onChange={(e) => handleInputChange("bodyMassIndex", e.target.value)}
              className="w-full p-3 border-2 border-blue-400 rounded-md"
            />
          </div>
        </div>

        {/* Third Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visit date</label>
            <Calendar
              value={formData.visitDate}
              onChange={(e) => handleInputChange("visitDate", e.value)}
              placeholder="Select date"
              className="w-full"
              inputClassName="w-full p-3 border border-gray-300 rounded-md"
              showIcon
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
            <InputText
              value={formData.weight}
              onChange={(e) => handleInputChange("weight", e.target.value)}
              className="w-full p-3 border-2 border-blue-400 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Where was the patient referred from?</label>
            <Dropdown
              value={formData.referredFrom}
              options={referralOptions}
              onChange={(e) => handleInputChange("referredFrom", e.value)}
              className="w-full"
              panelClassName="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Other Information Section */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 mb-6">Other informations</h3>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((questionNum) => (
            <div key={questionNum} className="flex items-center gap-4">
              <div className="flex items-center gap-2 min-w-[120px]">
                <span className="text-sm text-gray-700">Question {questionNum}</span>
                <i className="pi pi-info-circle text-gray-400 text-sm"></i>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center">
                  <RadioButton
                    inputId={`q${questionNum}-yes`}
                    name={`question${questionNum}`}
                    value="yes"
                    onChange={(e) => handleInputChange(`question${questionNum}`, e.value)}
                    checked={formData[`question${questionNum}` as keyof typeof formData] === "yes"}
                  />
                  <label htmlFor={`q${questionNum}-yes`} className="ml-2 text-sm text-gray-700">
                    Yes
                  </label>
                </div>
                <div className="flex items-center">
                  <RadioButton
                    inputId={`q${questionNum}-no`}
                    name={`question${questionNum}`}
                    value="no"
                    onChange={(e) => handleInputChange(`question${questionNum}`, e.value)}
                    checked={formData[`question${questionNum}` as keyof typeof formData] === "no"}
                  />
                  <label htmlFor={`q${questionNum}-no`} className="ml-2 text-sm text-gray-700">
                    No
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  const renderMedicalHistory = () => (
    <div className="space-y-6">
      {/* Question 1 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 min-w-[120px]">
          <span className="text-sm text-gray-700">Question 1</span>
          <i className="pi pi-info-circle text-gray-400 text-sm"></i>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center">
            <RadioButton
              inputId="mq1-yes"
              name="medicalQuestion1"
              value="yes"
              onChange={(e) => handleMedicalHistoryChange("medicalQuestion1", e.value)}
              checked={medicalHistoryData.medicalQuestion1 === "yes"}
            />
            <label htmlFor="mq1-yes" className="ml-2 text-sm text-gray-700">
              Yes
            </label>
          </div>
          <div className="flex items-center">
            <RadioButton
              inputId="mq1-no"
              name="medicalQuestion1"
              value="no"
              onChange={(e) => handleMedicalHistoryChange("medicalQuestion1", e.value)}
              checked={medicalHistoryData.medicalQuestion1 === "no"}
            />
            <label htmlFor="mq1-no" className="ml-2 text-sm text-gray-700">
              No
            </label>
          </div>
        </div>
      </div>

      {/* How many years */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">How many years?</label>
        <Dropdown
          value={medicalHistoryData.howManyYears}
          options={yearsOptions}
          onChange={(e) => handleMedicalHistoryChange("howManyYears", e.value)}
          className="w-48"
          panelClassName="mt-1"
        />
      </div>

      {/* Question 2 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 min-w-[120px]">
          <span className="text-sm text-gray-700">Question 2</span>
          <i className="pi pi-info-circle text-gray-400 text-sm"></i>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center">
            <RadioButton
              inputId="mq2-yes"
              name="medicalQuestion2"
              value="yes"
              onChange={(e) => handleMedicalHistoryChange("medicalQuestion2", e.value)}
              checked={medicalHistoryData.medicalQuestion2 === "yes"}
            />
            <label htmlFor="mq2-yes" className="ml-2 text-sm text-gray-700">
              Yes
            </label>
          </div>
          <div className="flex items-center">
            <RadioButton
              inputId="mq2-no"
              name="medicalQuestion2"
              value="no"
              onChange={(e) => handleMedicalHistoryChange("medicalQuestion2", e.value)}
              checked={medicalHistoryData.medicalQuestion2 === "no"}
            />
            <label htmlFor="mq2-no" className="ml-2 text-sm text-gray-700">
              No
            </label>
          </div>
        </div>
      </div>

      {/* Question 3 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 min-w-[120px]">
          <span className="text-sm text-gray-700">Question 3</span>
          <i className="pi pi-info-circle text-gray-400 text-sm"></i>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center">
            <RadioButton
              inputId="mq3-yes"
              name="medicalQuestion3"
              value="yes"
              onChange={(e) => handleMedicalHistoryChange("medicalQuestion3", e.value)}
              checked={medicalHistoryData.medicalQuestion3 === "yes"}
            />
            <label htmlFor="mq3-yes" className="ml-2 text-sm text-gray-700">
              Yes
            </label>
          </div>
          <div className="flex items-center">
            <RadioButton
              inputId="mq3-no"
              name="medicalQuestion3"
              value="no"
              onChange={(e) => handleMedicalHistoryChange("medicalQuestion3", e.value)}
              checked={medicalHistoryData.medicalQuestion3 === "no"}
            />
            <label htmlFor="mq3-no" className="ml-2 text-sm text-gray-700">
              No
            </label>
          </div>
        </div>
      </div>

      {/* Question 4 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 min-w-[120px]">
          <span className="text-sm text-gray-700">Question 4</span>
          <i className="pi pi-info-circle text-gray-400 text-sm"></i>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center">
            <RadioButton
              inputId="mq4-yes"
              name="medicalQuestion4"
              value="yes"
              onChange={(e) => handleMedicalHistoryChange("medicalQuestion4", e.value)}
              checked={medicalHistoryData.medicalQuestion4 === "yes"}
            />
            <label htmlFor="mq4-yes" className="ml-2 text-sm text-gray-700">
              Yes
            </label>
          </div>
          <div className="flex items-center">
            <RadioButton
              inputId="mq4-no"
              name="medicalQuestion4"
              value="no"
              onChange={(e) => handleMedicalHistoryChange("medicalQuestion4", e.value)}
              checked={medicalHistoryData.medicalQuestion4 === "no"}
            />
            <label htmlFor="mq4-no" className="ml-2 text-sm text-gray-700">
              No
            </label>
          </div>
        </div>
      </div>

      {/* Disease type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Disease type</label>
        <InputText
          value={medicalHistoryData.diseaseType}
          onChange={(e) => handleMedicalHistoryChange("diseaseType", e.target.value)}
          placeholder="Disease type"
          className="w-full max-w-sm p-3 border border-gray-300 rounded-md"
        />
      </div>

      {/* Question 5 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 min-w-[120px]">
          <span className="text-sm text-gray-700">Question 5</span>
          <i className="pi pi-info-circle text-gray-400 text-sm"></i>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center">
            <RadioButton
              inputId="mq5-yes"
              name="medicalQuestion5"
              value="yes"
              onChange={(e) => handleMedicalHistoryChange("medicalQuestion5", e.value)}
              checked={medicalHistoryData.medicalQuestion5 === "yes"}
            />
            <label htmlFor="mq5-yes" className="ml-2 text-sm text-gray-700">
              Yes
            </label>
          </div>
          <div className="flex items-center">
            <RadioButton
              inputId="mq5-no"
              name="medicalQuestion5"
              value="no"
              onChange={(e) => handleMedicalHistoryChange("medicalQuestion5", e.value)}
              checked={medicalHistoryData.medicalQuestion5 === "no"}
            />
            <label htmlFor="mq5-no" className="ml-2 text-sm text-gray-700">
              No
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderInclusionCriteria = () => (
    <div className="space-y-6">
      {[1, 2, 3, 4, 5].map((questionNum) => (
        <div key={questionNum} className="flex items-center gap-4">
          <div className="flex items-center gap-2 min-w-[120px]">
            <span className="text-sm text-gray-700">Question {questionNum}</span>
            <i className="pi pi-info-circle text-gray-400 text-sm"></i>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center">
              <RadioButton
                inputId={`iq${questionNum}-yes`}
                name={`inclusionQuestion${questionNum}`}
                value="yes"
                onChange={(e) => handleInclusionCriteriaChange(`inclusionQuestion${questionNum}`, e.value)}
                checked={
                  inclusionCriteriaData[`inclusionQuestion${questionNum}` as keyof typeof inclusionCriteriaData] ===
                  "yes"
                }
              />
              <label htmlFor={`iq${questionNum}-yes`} className="ml-2 text-sm text-gray-700">
                Yes
              </label>
            </div>
            <div className="flex items-center">
              <RadioButton
                inputId={`iq${questionNum}-no`}
                name={`inclusionQuestion${questionNum}`}
                value="no"
                onChange={(e) => handleInclusionCriteriaChange(`inclusionQuestion${questionNum}`, e.value)}
                checked={
                  inclusionCriteriaData[`inclusionQuestion${questionNum}` as keyof typeof inclusionCriteriaData] ===
                  "no"
                }
              />
              <label htmlFor={`iq${questionNum}-no`} className="ml-2 text-sm text-gray-700">
                No
              </label>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderExclusionCriteria = () => (
    <div className="space-y-6">
      {[1, 2, 3, 4, 5].map((questionNum) => (
        <div key={questionNum} className="flex items-center gap-4">
          <div className="flex items-center gap-2 min-w-[120px]">
            <span className="text-sm text-gray-700">Question {questionNum}</span>
            <i className="pi pi-info-circle text-gray-400 text-sm"></i>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center">
              <RadioButton
                inputId={`eq${questionNum}-yes`}
                name={`exclusionQuestion${questionNum}`}
                value="yes"
                onChange={(e) => handleExclusionCriteriaChange(`exclusionQuestion${questionNum}`, e.value)}
                checked={
                  exclusionCriteriaData[`exclusionQuestion${questionNum}` as keyof typeof exclusionCriteriaData] ===
                  "yes"
                }
              />
              <label htmlFor={`eq${questionNum}-yes`} className="ml-2 text-sm text-gray-700">
                Yes
              </label>
            </div>
            <div className="flex items-center">
              <RadioButton
                inputId={`eq${questionNum}-no`}
                name={`exclusionQuestion${questionNum}`}
                value="no"
                onChange={(e) => handleExclusionCriteriaChange(`exclusionQuestion${questionNum}`, e.value)}
                checked={
                  exclusionCriteriaData[`exclusionQuestion${questionNum}` as keyof typeof exclusionCriteriaData] ===
                  "no"
                }
              />
              <label htmlFor={`eq${questionNum}-no`} className="ml-2 text-sm text-gray-700">
                No
              </label>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

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

      {/* Composition Checkboxes */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Composition</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="cystic"
              checked={aiDiagnosticsData.composition.cystic}
              onChange={(e) => handleAiDiagnosticsChange("composition.cystic", e.checked)}
            />
            <label htmlFor="cystic" className="text-sm text-gray-700 flex items-center gap-2">
              Cystic or almost completely cystic
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">Yes</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="solid"
              checked={aiDiagnosticsData.composition.solid}
              onChange={(e) => handleAiDiagnosticsChange("composition.solid", e.checked)}
            />
            <label htmlFor="solid" className="text-sm text-gray-700 flex items-center gap-2">
              Solid or Almost Completely Solid
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">No</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="mixed"
              checked={aiDiagnosticsData.composition.mixed}
              onChange={(e) => handleAiDiagnosticsChange("composition.mixed", e.checked)}
            />
            <label htmlFor="mixed" className="text-sm text-gray-700 flex items-center gap-2">
              Mixed Cystic and Solid
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">Yes</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="spongioform"
              checked={aiDiagnosticsData.composition.spongioform}
              onChange={(e) => handleAiDiagnosticsChange("composition.spongioform", e.checked)}
            />
            <label htmlFor="spongioform" className="text-sm text-gray-700 flex items-center gap-2">
              Spongioform
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">No</span>
          </div>
        </div>
      </div>

      {/* Echogenicity */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Echogenicity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="anechoic"
              checked={aiDiagnosticsData.echogenicity.anechoic}
              onChange={(e) => handleAiDiagnosticsChange("echogenicity.anechoic", e.checked)}
            />
            <label htmlFor="anechoic" className="text-sm text-gray-700 flex items-center gap-2">
              Anechoic
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">Yes</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="hyperechoic"
              checked={aiDiagnosticsData.echogenicity.hyperechoic}
              onChange={(e) => handleAiDiagnosticsChange("echogenicity.hyperechoic", e.checked)}
            />
            <label htmlFor="hyperechoic" className="text-sm text-gray-700 flex items-center gap-2">
              Hyperechoic or Isoechoic
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">No</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="hypoechoic"
              checked={aiDiagnosticsData.echogenicity.hypoechoic}
              onChange={(e) => handleAiDiagnosticsChange("echogenicity.hypoechoic", e.checked)}
            />
            <label htmlFor="hypoechoic" className="text-sm text-gray-700 flex items-center gap-2">
              Hypoechoic
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">Yes</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="veryHypoechoic"
              checked={aiDiagnosticsData.echogenicity.veryHypoechoic}
              onChange={(e) => handleAiDiagnosticsChange("echogenicity.veryHypoechoic", e.checked)}
            />
            <label htmlFor="veryHypoechoic" className="text-sm text-gray-700 flex items-center gap-2">
              Very Hypoechoic
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">No</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="widerThanTallEcho"
              checked={aiDiagnosticsData.echogenicity.widerThanTall}
              onChange={(e) => handleAiDiagnosticsChange("echogenicity.widerThanTall", e.checked)}
            />
            <label htmlFor="widerThanTallEcho" className="text-sm text-gray-700 flex items-center gap-2">
              Wider Than Tall
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">No</span>
          </div>
        </div>
      </div>

      {/* Shape */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Shape</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="widerThanTallShape"
              checked={aiDiagnosticsData.shape.widerThanTall}
              onChange={(e) => handleAiDiagnosticsChange("shape.widerThanTall", e.checked)}
            />
            <label htmlFor="widerThanTallShape" className="text-sm text-gray-700 flex items-center gap-2">
              Wider Than Tall
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">Yes</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="tallerThanWide"
              checked={aiDiagnosticsData.shape.tallerThanWide}
              onChange={(e) => handleAiDiagnosticsChange("shape.tallerThanWide", e.checked)}
            />
            <label htmlFor="tallerThanWide" className="text-sm text-gray-700 flex items-center gap-2">
              Taller Than Wide
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">No</span>
          </div>
        </div>
      </div>

      {/* Margin */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Margin</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="smooth"
              checked={aiDiagnosticsData.margin.smooth}
              onChange={(e) => handleAiDiagnosticsChange("margin.smooth", e.checked)}
            />
            <label htmlFor="smooth" className="text-sm text-gray-700 flex items-center gap-2">
              Smooth
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">Yes</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="illDefined"
              checked={aiDiagnosticsData.margin.illDefined}
              onChange={(e) => handleAiDiagnosticsChange("margin.illDefined", e.checked)}
            />
            <label htmlFor="illDefined" className="text-sm text-gray-700 flex items-center gap-2">
              Ill defined
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">No</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="lobularOrIrregular"
              checked={aiDiagnosticsData.margin.lobular}
              onChange={(e) => handleAiDiagnosticsChange("margin.lobular", e.checked)}
            />
            <label htmlFor="lobularOrIrregular" className="text-sm text-gray-700 flex items-center gap-2">
              Lobular or irregular
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">Yes</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="extraThyroidalExtension"
              checked={aiDiagnosticsData.margin.extraThyroidal}
              onChange={(e) => handleAiDiagnosticsChange("margin.extraThyroidal", e.checked)}
            />
            <label htmlFor="extraThyroidalExtension" className="text-sm text-gray-700 flex items-center gap-2">
              Extra thyroidal extension
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">No</span>
          </div>
        </div>
      </div>

      {/* Echogenic Focii */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Echogenic Focii</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="noneOrLargeCometTail"
              checked={aiDiagnosticsData.echogenicFocii.noneOrLarge}
              onChange={(e) => handleAiDiagnosticsChange("echogenicFocii.noneOrLarge", e.checked)}
            />
            <label htmlFor="noneOrLargeCometTail" className="text-sm text-gray-700 flex items-center gap-2">
              None or Large Comet Tail Artifacts
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">Yes</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="macrocalcifications"
              checked={aiDiagnosticsData.echogenicFocii.macrocalcifications}
              onChange={(e) => handleAiDiagnosticsChange("echogenicFocii.macrocalcifications", e.checked)}
            />
            <label htmlFor="macrocalcifications" className="text-sm text-gray-700 flex items-center gap-2">
              Macrocalcifications
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">No</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="peripheralCalcifications"
              checked={aiDiagnosticsData.echogenicFocii.peripheral}
              onChange={(e) => handleAiDiagnosticsChange("echogenicFocii.peripheral", e.checked)}
            />
            <label htmlFor="peripheralCalcifications" className="text-sm text-gray-700 flex items-center gap-2">
              Peripheral Calcifications
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">Yes</span>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              inputId="punctateEchogenicFoci"
              checked={aiDiagnosticsData.echogenicFocii.punctate}
              onChange={(e) => handleAiDiagnosticsChange("echogenicFocii.punctate", e.checked)}
            />
            <label htmlFor="punctateEchogenicFoci" className="text-sm text-gray-700 flex items-center gap-2">
              Punctate Echogenic Foci
              <i className="pi pi-info-circle text-gray-400 text-xs"></i>
            </label>
            <span className="text-sm text-gray-600">No</span>
          </div>
        </div>
      </div>

      {/* Point */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Point</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="tr1"
              checked={aiDiagnosticsData.points.tr1}
              onChange={(e) => handleAiDiagnosticsChange("points.tr1", e.checked)}
            />
            <div className="bg-green-100 border border-green-300 rounded px-3 py-2 text-sm">TR1 (0 point)</div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="tr2"
              checked={aiDiagnosticsData.points.tr2}
              onChange={(e) => handleAiDiagnosticsChange("points.tr2", e.checked)}
            />
            <div className="bg-blue-100 border border-blue-300 rounded px-3 py-2 text-sm">TR2 (2 points)</div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="tr3"
              checked={aiDiagnosticsData.points.tr3}
              onChange={(e) => handleAiDiagnosticsChange("points.tr3", e.checked)}
            />
            <div className="bg-purple-100 border border-purple-300 rounded px-3 py-2 text-sm">TR3 (3 points)</div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="tr4"
              checked={aiDiagnosticsData.points.tr4}
              onChange={(e) => handleAiDiagnosticsChange("points.tr4", e.checked)}
            />
            <div className="bg-yellow-100 border border-yellow-300 rounded px-3 py-2 text-sm">TR4 (4-6 points)</div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="tr5"
              checked={aiDiagnosticsData.points.tr5}
              onChange={(e) => handleAiDiagnosticsChange("points.tr5", e.checked)}
            />
            <div className="bg-red-100 border border-red-300 rounded px-3 py-2 text-sm">TR5 (7+ points)</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUploadPhoto = () => {
    const onFileSelect = (e: any) => {
      const files = e.files
      if (files && files.length > 0) {
        const file = files[0]
        if (file.size <= 2.5 * 1024 * 1024) {
          // 2.5MB limit
          const reader = new FileReader()
          reader.onload = (event) => {
            if (event.target?.result) {
              setUploadedPhotos([...uploadedPhotos, event.target.result as string])
            }
          }
          reader.readAsDataURL(file)
        }
      }
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Photo</h3>
          <p className="text-sm text-gray-600 mb-6">
            File must be less than 2.5 MB, and file format must be either JPEG, JPG or PNG.
          </p>
        </div>

        <div className="flex gap-4">
          {/* Display uploaded photos */}
          {uploadedPhotos.map((photo, index) => (
            <div key={index} className="w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
              <img
                src={photo || "/placeholder.svg"}
                alt={`Uploaded photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Upload area */}
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
              customUpload={true}
            />
            <div className="text-4xl text-gray-400 mb-2">+</div>
            <span className="text-sm text-gray-500">Upload</span>
          </div>
        </div>
      </div>
    )
  }

  const headerElement = (
    <div className="flex items-center gap-3">
      <button onClick={handleDialogClose} className="text-gray-500 hover:text-gray-700 text-xl">
        ×
      </button>
      <span className="text-lg font-medium text-gray-800">Add New Predict</span>
    </div>
  )

  return (
    <Dialog
      visible={visible}
      onHide={handleDialogClose}
      header={headerElement}
      style={{ width: "90vw", maxWidth: "1200px" }}
      className="p-0"
      modal
      draggable={false}
      resizable={false}
    >
      <div className="p-6">
        {/* Steps Component */}
        <div className="mb-8">
          <Steps model={steps} activeIndex={activeIndex} className="custom-steps" />
        </div>

        {renderStepContent()}

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <Button
            label="Cancel"
            onClick={handleDialogClose}
            className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            text
          />
          <Button
            label="Save and Next"
            onClick={handleSaveAndNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          />
        </div>
      </div>
    </Dialog>
  )
}
