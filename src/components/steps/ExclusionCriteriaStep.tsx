import React from 'react';
import type { ExclusionForm } from '../../types';
import { CriteriaItem } from '../CriteriaItem';

interface ExclusionFormStepProps {
  exclusion: ExclusionForm;
  setExclusion: React.Dispatch<React.SetStateAction<ExclusionForm>>;
}


const ExclusionFormStep : React.FC<ExclusionFormStepProps> = ({ exclusion, setExclusion }) => (

 <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Hariç Tutma Kriterleri</h2>
      <p className="text-sm text-gray-600 mb-6">
        Aşağıdaki kriterlerin en az birinin <strong>“Evet”</strong> olması hastanın hariç tutulmasını gerektirir.
      </p>

      <div className="space-y-4">
        <CriteriaItem label="18 yaşından küçük olmak" value={exclusion.ageUnder18} onChange={(v) => setExclusion((p) => ({ ...p, ageUnder18: v }))} />
        <CriteriaItem label="BGOF alınmamış gönüllüler" value={exclusion.nonBgofVolunteer} onChange={(v) => setExclusion((p) => ({ ...p, nonBgofVolunteer: v }))} />
        <CriteriaItem label="Kısıtlı olmak (asker, yükümlü)" value={exclusion.restricted} onChange={(v) => setExclusion((p) => ({ ...p, restricted: v }))} />
        <CriteriaItem label="Başka bir klinik çalışmada yer almak" value={exclusion.baskaclinikcalismadayerolmak} onChange={(v) => setExclusion((p) => ({ ...p, baskaclinikcalismadayerolmak: v }))} />
        <CriteriaItem label="Tiroid bezi ile ilgili operasyon (total/subtotal tiroidektomi, lobektomi), görüntüleme eşliğinde müdahale/ablasyon veya terapötik radyoizotop tedavisi geçirmiş olmak" value={exclusion.tiroidBeziIleIlgiliOperasyon} onChange={(v) => setExclusion((p) => ({ ...p, tiroidBeziIleIlgiliOperasyon: v }))} />
        <CriteriaItem label="Nodül saptanmayan; yalnızca diffüz parenkimal patern değişikliği bulunan olgular" value={exclusion.diffuzParenkimalOlgular} onChange={(v) => setExclusion((p) => ({ ...p, diffuzParenkimalOlgular: v }))} />
        <CriteriaItem label="Diffüz nodüler değişiklik olup, radyolog ve/veya AI değerlendirmesi ile ayrıca demarke bir nodül tespit edilemeyen olgular" value={exclusion.birNoduluTespitEdilemeyenOlgular} onChange={(v) => setExclusion((p) => ({ ...p, birNoduluTespitEdilemeyenOlgular: v }))} />
      </div>
    </div>

);

export default ExclusionFormStep;
