
import { useRef, useState } from "react"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { Checkbox } from "primereact/checkbox"
import { Panel } from "primereact/panel"
import { Toast } from 'primereact/toast';
import LocalStoreInspector from "./LocalStoreInspector";

export default function ImageAssessment() {
  const [protocolNumber, setProtocolNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [assessmentData, setAssessmentData] = useState({
    composition: "",
    echogenicity: "",
    shape: "",
    margin: "",
    echogenicFocii: "",
    tiradsScore: "",
    biopsyNeedEvaluation: {
      fnaNeeded: false,
      normal: false,
    },
    biopsyPathologyExpectation: {
      malign: false,
      benign: false,
    },
  })
  const toast = useRef<Toast>(null);
 const mockResponseData = {
    composition: "Solid and cystic",
    echogenicity: "Hypoechoic",
    shape: "Irregular",
    margin: "Ill-defined",
    echogenicFocii: "Present",
    tiradsScore: "TR4",
    biopsyNeedEvaluation: {
      fnaNeeded: true,
      normal: false,
    },
    biopsyPathologyExpectation: {
      malign: false,
      benign: true,
    },
  }
  const handleInputChange = (field: string, value: string) => {
    setAssessmentData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCheckboxChange = (category: string, field: string, checked: boolean) => {
    setAssessmentData((prev) => ({
      ...prev,
      [category]: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(prev[category as keyof typeof prev] as any),
        [field]: checked,
      },
    }))
  }

  const handleSendToTraick = () => {
     if (!protocolNumber.trim()) {
      
      toast.current?.show({severity:'error', summary: 'Error', detail:'Please enter a protocol number', life: 3000});

      return
    }
    console.log("Sending to TRAICK dev with protocol:", protocolNumber)
        toast.current?.show({severity:'success', summary: 'Success', detail:'Protocol send successfully successfully', life: 3000});

    // Simulate sending data and receiving results
    setIsLoading(true)
    console.log("Sending to TRAICK dev with protocol:", protocolNumber)

    // Simulate API call delay
    setTimeout(() => {
      setAssessmentData(mockResponseData)
      setShowResults(true)
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
              <Toast ref={toast} />

        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900"> Image Assessment Module </h1>

        {/* Input Section */}
        <Panel className="panel-border p-0">
          <div className="border border-gray-300">
            <div className="grid grid-cols-2 border-b border-gray-300">
              <div className="p-4 border-r border-gray-300">
                <label htmlFor="protocol-number" className="text-sm font-medium text-black-700">
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
                <span className="text-sm font-medium text-gray-700">Click to send the TRAICK dev.</span>
              </div>
              <div className="p-4">
                <Button className= " w-full" disabled={isLoading} label={isLoading ? "Sending..." : "Send to TRAICK"} severity="secondary"  onClick={handleSendToTraick}  />
              </div>
            </div>
          </div>
        </Panel>
        <LocalStoreInspector />
        {showResults && (
          <div className="space-y-4">
            <p className="text-lg italic text-gray-900">
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
                ].map((item, index) => (
                  <div key={item.field} className={`grid grid-cols-2 ${index < 5 ? "border-b border-gray-300" : ""}`}>
                    <div className="p-4 border-r border-gray-300 ">
                      <label htmlFor={item.field} className="text-sm font-medium text-black-700">
                        {item.label}
                      </label>
                    </div>
                    <div className="p-4">
                      <InputText
                        id={item.field}
                        value={assessmentData[item.field as keyof typeof assessmentData] as string}
                        onChange={(e) => handleInputChange(item.field, e.target.value)}
                        placeholder="text"
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}

                {/* Biopsy Need Evaluation */}
                <div className="grid grid-cols-2 border-b border-t border-gray-300">
                  <div className="p-4 border-r border-gray-300 ">
                    <label className="text-sm font-medium text-gray-700">Biopsy need evaluation</label>
                  </div>
                  <div className="p-4 flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        inputId="fna-needed"
                        checked={assessmentData.biopsyNeedEvaluation.fnaNeeded}
                        onChange={(e) => handleCheckboxChange("biopsyNeedEvaluation", "fnaNeeded", e.checked ||false)}
                      />
                      <label htmlFor="fna-needed" className="text-sm text-gray-700">
                        FNA needed
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        inputId="normal"
                        checked={assessmentData.biopsyNeedEvaluation.normal}
                        onChange={(e) => handleCheckboxChange("biopsyNeedEvaluation", "normal", e.checked ||false)}
                      />
                      <label htmlFor="normal" className="text-sm text-gray-700">
                        Normal
                      </label>
                    </div>
                  </div>
                </div>

                {/* Biopsy Pathology Expectation */}
                <div className="grid grid-cols-2">
                  <div className="p-4 border-r border-gray-300">
                    <label className="text-sm font-medium text-gray-700">Biopsy pathology expectation</label>
                  </div>
                  <div className="p-4 flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        inputId="malign"
                        checked={assessmentData.biopsyPathologyExpectation.malign}
                        onChange={(e) => handleCheckboxChange("biopsyPathologyExpectation", "malign", e.checked ||false)}
                      />
                      <label htmlFor="malign" className="text-sm text-gray-700">
                        Malign
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        inputId="benign"
                        checked={assessmentData.biopsyPathologyExpectation.benign}
                        onChange={(e) => handleCheckboxChange("biopsyPathologyExpectation", "benign", e.checked || false)}
                      />
                      <label htmlFor="benign" className="text-sm text-gray-700">
                        Benign
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        )}
        {/* Results Section */}
      {/*   <div className="space-y-4">
          <p className="text-lg italic text-gray-900">
            Then, the results will be sent to the{" "}
            <span className="text-red-600 underline">Image Assessment Module</span> back in the same format:
          </p>

          <Panel className="p-0">
            <div className="border border-gray-300">
              
              {[
                { label: "Composition", field: "composition" },
                { label: "Echogenicity", field: "echogenicity" },
                { label: "Shape", field: "shape" },
                { label: "Margin", field: "margin" },
                { label: "Echogenic Focii", field: "echogenicFocii" },
                { label: "TIRADS Score", field: "tiradsScore" },
              ].map((item, index) => (
                <div key={item.field} className={`grid grid-cols-2 ${index < 5 ? "border-b border-gray-300" : ""}`}>
                  <div className="p-4 border-r border-gray-300">
                    <label htmlFor={item.field} className="text-sm font-medium text-gray-700">
                      {item.label}
                    </label>
                  </div>
                  <div className="p-4">
                    <InputText
                      id={item.field}
                      value={assessmentData[item.field as keyof typeof assessmentData] as string}
                      onChange={(e) => handleInputChange(item.field, e.target.value)}
                      placeholder="text"
                      className="w-full"
                    />
                  </div>
                </div>
              ))}

             
              <div className="grid grid-cols-2 border-b border-gray-300">
                <div className="p-4 border-r border-gray-300">
                  <label className="text-sm font-medium text-gray-700">Biopsy need evaluation</label>
                </div>
                <div className="p-4 flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      inputId="fna-needed"
                      checked={assessmentData.biopsyNeedEvaluation.fnaNeeded}
                      onChange={(e) => handleCheckboxChange("biopsyNeedEvaluation", "fnaNeeded", e.checked || false)}
                    />
                    <label htmlFor="fna-needed" className="text-sm text-gray-700">
                      FNA needed
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      inputId="normal"
                      checked={assessmentData.biopsyNeedEvaluation.normal}
                      onChange={(e) => handleCheckboxChange("biopsyNeedEvaluation", "normal", e.checked || false)}
                    />
                    <label htmlFor="normal" className="text-sm text-gray-700">
                      Normal
                    </label>
                  </div>
                </div>
              </div>

             
              <div className="grid grid-cols-2">
                <div className="p-4 border-r border-gray-300">
                  <label className="text-sm font-medium text-gray-700">Biopsy pathology expectation</label>
                </div>
                <div className="p-4 flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      inputId="malign"
                      checked={assessmentData.biopsyPathologyExpectation.malign}
                      onChange={(e) => handleCheckboxChange("biopsyPathologyExpectation", "malign", e.checked || false)}
                    />
                    <label htmlFor="malign" className="text-sm text-gray-700">
                      Malign
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      inputId="benign"
                      checked={assessmentData.biopsyPathologyExpectation.benign}
                      onChange={(e) => handleCheckboxChange("biopsyPathologyExpectation", "benign", e.checked || false)}
                    />
                    <label htmlFor="benign" className="text-sm text-gray-700">
                      Benign
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div> */}
      </div>
    </div>
  )
}
