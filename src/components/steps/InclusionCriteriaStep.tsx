import React from 'react';
import type { InclusionForm } from '../../types';
import { CriteriaItem } from '../CriteriaItem';

interface InclusionCriteriaStepProps {
  inclusion: InclusionForm;
  setInclusion: React.Dispatch<React.SetStateAction<InclusionForm>>;
}


const InclusionCriteriaStep : React.FC<InclusionCriteriaStepProps> = ({ inclusion, setInclusion }) => (

  <div className="bg-white  rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Dahil Etme Kriterleri</h2>
      <p className="text-sm text-gray-600 mb-4">
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

export default InclusionCriteriaStep;
