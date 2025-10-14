import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import type { DemographicForm, Sex } from '../../types';
// import { normalizeVolunteerCode } from '../../helpers/helper';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
//import 'primeflex/primeflex.css';

interface DemographicFormStepProps {
  demographic: DemographicForm;
  setDemographic: React.Dispatch<React.SetStateAction<DemographicForm>>;
  generateVolunteerId: () => void;
}

 const referralOptions = [
    { label: "Radiology Clinic", value: "Radiology Clinic" },
    { label: "Emergency Department", value: "Emergency Department" },
    { label: "General Practice", value: "General Practice" },
  ];

   const normalizeVolunteerCode = (code: string): string => {
  const trimmedCode = code.trim().toUpperCase();
  const regex = /^TR\d{5}$/;
  if (regex.test(trimmedCode)) {
    return trimmedCode;
  }
  return ""; // Return empty string if format is invalid
};
const DemographicFormStep : React.FC<DemographicFormStepProps> = ({ demographic, setDemographic, generateVolunteerId }) => (

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <Button type="button" label="Generate" onClick={generateVolunteerId} className="shrink-0 p-button-secondary" />
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
  </div>
);

export default DemographicFormStep;
