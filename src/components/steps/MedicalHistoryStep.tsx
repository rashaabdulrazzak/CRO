import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import type { MedicalHistoryForm, YesNo } from '../../types';
import { RadioButton } from 'primereact/radiobutton';

interface MedicalHistoryStepProps {
  medical: MedicalHistoryForm;
  setMedical: React.Dispatch<React.SetStateAction<MedicalHistoryForm>>;
}
const yearsOptions = ["1", "2", "3", "4", "5"].map((v) => ({ label: v, value: v }));


const MedicalHistoryStep : React.FC<MedicalHistoryStepProps> = ({ medical, setMedical }) => (

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

export default MedicalHistoryStep;
