"use client"

import { useState } from "react"

interface FormData {
  // Patient Information
  patientName: string
  patientAge: string
  patientId: string

  // Inclusion Criteria
  ageOver18: boolean | null
  thyroidNoduleSuspicion: boolean | null
  bgofVolunteer: boolean | null
  notRestricted: boolean | null

  // Exclusion Criteria
  ageUnder18: boolean | null
  nonBgofVolunteer: boolean | null
  restricted: boolean | null
  baskaclinikcalismadayerolmak: boolean | null
  tiroidBeziIleIlgiliOperasyon : boolean | null
  diffüzPrenkimalOlgular : boolean | null
  birNoduluTespitEdilemeyenOlgular : boolean | null

  // Additional Information
  otherDiseases: string
  notes: string
}

const initialFormData: FormData = {
  patientName: "",
  patientAge: "",
  patientId: "",
  ageOver18: null,
  thyroidNoduleSuspicion: null,
  bgofVolunteer: null,
  notRestricted: null,
  ageUnder18: null,
  nonBgofVolunteer: null,
  restricted: null,
  baskaclinikcalismadayerolmak: null,
  tiroidBeziIleIlgiliOperasyon : null,
  diffüzPrenkimalOlgular : null,
  birNoduluTespitEdilemeyenOlgular : null,
  otherDiseases: "",
  notes: "",
}

export default function MedicalCriteriaForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [showToast, setShowToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    const patientInfoValid = !!(formData.patientName && formData.patientAge && formData.patientId)
    const inclusionCriteriaValid = !!(
      formData.ageOver18 !== null &&
      formData.thyroidNoduleSuspicion !== null &&
      formData.bgofVolunteer !== null &&
      formData.notRestricted !== null
    )
    const exclusionCriteriaValid = !!(
      formData.ageUnder18 !== null &&
      formData.nonBgofVolunteer !== null &&
      formData.restricted !== null
    )

    return patientInfoValid && inclusionCriteriaValid && exclusionCriteriaValid
  }

  const submitForm = () => {
    if (validateForm()) {
      console.log("Form Data:", formData)
      setShowToast({ message: "Form başarıyla gönderildi.", type: "success" })
      setTimeout(() => setShowToast(null), 3000)
    } else {
      setShowToast({ message: "Lütfen tüm gerekli alanları doldurun.", type: "error" })
      setTimeout(() => setShowToast(null), 3000)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            showToast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {showToast.message}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Tıbbi Çalışma Kriterleri Formu</h1>
        <p className="text-muted-foreground">
          Hastanın çalışmaya dahil edilme ve hariç tutulma kriterlerini değerlendirin
        </p>
      </div>

      <div className="space-y-8">
        {/* Patient Information Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Hasta Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Hasta Adı Soyadı</label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => updateFormData("patientName", e.target.value)}
                placeholder="Hasta adı soyadı"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Yaş</label>
              <input
                type="number"
                value={formData.patientAge}
                onChange={(e) => updateFormData("patientAge", e.target.value)}
                placeholder="Yaş"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Hasta Kimlik No</label>
              <input
                type="text"
                value={formData.patientId}
                onChange={(e) => updateFormData("patientId", e.target.value)}
                placeholder="Hasta kimlik numarası"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Inclusion Criteria Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Dahil Etme Kriterleri</h2>
          <p className="text-muted-foreground mb-6">
            Aşağıdaki kriterlerin hepsinin işaretlenmesi gönüllünün dahil edilme kriterlerini karşıladığını
            göstermektedir.
          </p>

          <div className="space-y-4">
            <CriteriaItem
              label="18 yaşından büyük"
              value={formData.ageOver18}
              onChange={(value) => updateFormData("ageOver18", value)}
            />

            <CriteriaItem
              label="Tiroid Nodülü Şüphesi Taşımak"
              value={formData.thyroidNoduleSuspicion}
              onChange={(value) => updateFormData("thyroidNoduleSuspicion", value)}
            />

            <CriteriaItem
              label="BGOF Alınmış Gönüllü"
              value={formData.bgofVolunteer}
              onChange={(value) => updateFormData("bgofVolunteer", value)}
            />

            <CriteriaItem
              label="Kısıtlı olmamak (asker, yükümlü)"
              value={formData.notRestricted}
              onChange={(value) => updateFormData("notRestricted", value)}
            />
          </div>
        </div>

        {/* Exclusion Criteria Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Hariç Tutma Kriterleri</h2>
          <p className="text-muted-foreground mb-6">
            Aşağıdaki kriterlerin en az birinin "Evet" olarak işaretlenmesi Hastanın hariç tutulmasını gerektirmektedir.
          </p>

          <div className="space-y-4">
            <CriteriaItem
              label="18 yaşından küçük olmak"
              value={formData.ageUnder18}
              onChange={(value) => updateFormData("ageUnder18", value)}
            />

            <CriteriaItem
              label="BGOF Alınmamış Gönüllüler"
              value={formData.nonBgofVolunteer}
              onChange={(value) => updateFormData("nonBgofVolunteer", value)}
            />

            <CriteriaItem
              label="Kısıtlı olmak (asker, yükümlü)"
              value={formData.restricted}
              onChange={(value) => updateFormData("restricted", value)}
            />
            <CriteriaItem
              label="Başka bir klinik çalışmada yer almak "
              value={formData.baskaclinikcalismadayerolmak}
              onChange={(value) => updateFormData("baskaclinikcalismadayerolmak", value)}
            />
            <CriteriaItem
              label="Tiroid bezi ile ilgili operasyon (total-subtotal tiroidektomi, lobektomi), görüntüleme
                eşliğinde müdahale (solid-kistik nodüllere yönelik herhangi bir metod ile ablasyon)
                geçirmiş
                Terapötik radyoizotop (nükleer tıp bölümünde yapılan) tedaviler geçiren olgular. "
              value={formData.tiroidBeziIleIlgiliOperasyon}
              onChange={(value) => updateFormData("tiroidBeziIleIlgiliOperasyon", value)}
            />
          
         <CriteriaItem
              label="Elde edilen inceleme bulgularında nodül saptanmayan, sadece diffüz parenkimal paternde değişiklikleri bulunan olgular"
              value={formData.diffüzPrenkimalOlgular}
              onChange={(value) => updateFormData("diffüzPrenkimalOlgular", value)}
            />
         
         <CriteriaItem
              label="Diffüz nodüler değişiklikleri olup radyolog değerlendirmesi ve AI ile demarke ayrıca bir nodülü tespit edilemeyen olgular."
              value={formData.birNoduluTespitEdilemeyenOlgular}
              onChange={(value) => updateFormData("birNoduluTespitEdilemeyenOlgular", value)}
            />
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Ek Bilgiler</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Çalışmaya dahil edilme nedeni olan ve varsa diğer hastalıkları
              </label>
              <textarea
                value={formData.otherDiseases}
                onChange={(e) => updateFormData("otherDiseases", e.target.value)}
                placeholder="Diğer hastalıkları belirtiniz..."
                rows={4}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-vertical"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Ek Notlar</label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateFormData("notes", e.target.value)}
                placeholder="Ek notlar..."
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-vertical"
              />
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Form Özeti</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Hasta Bilgileri</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Ad Soyad:</strong> {formData.patientName || "Belirtilmedi"}
                </p>
                <p>
                  <strong>Yaş:</strong> {formData.patientAge || "Belirtilmedi"}
                </p>
                <p>
                  <strong>Kimlik No:</strong> {formData.patientId || "Belirtilmedi"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Kriterlerin Durumu</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Dahil Etme:</strong>{" "}
                  {formData.ageOver18 &&
                  formData.thyroidNoduleSuspicion &&
                  formData.bgofVolunteer &&
                  formData.notRestricted
                    ? "✅ Uygun"
                    : "❌ Uygun Değil"}
                </p>
                <p>
                  <strong>Hariç Tutma:</strong>{" "}
                  {formData.ageUnder18 || formData.nonBgofVolunteer || formData.restricted
                    ? "❌ Hariç Tutulmalı"
                    : "✅ Hariç Tutulmamalı"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-border">
            <button
              onClick={submitForm}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring font-medium"
            >
              ✓ Formu Gönder
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CriteriaItemProps {
  label: string
  value: boolean | null
  onChange: (value: boolean) => void
}

function CriteriaItem({ label, value, onChange }: CriteriaItemProps) {
  const id = label.replace(/\s+/g, "-").toLowerCase()

  return (
    <div className=" rounded-lg p-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex-1">{label}</label>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id={`${id}-yes`}
              name={id}
              checked={value === true}
              onChange={() => onChange(true)}
              className="w-4 h-4 text-primary bg-background border-border focus:ring-ring focus:ring-2"
            />
            <label htmlFor={`${id}-yes`} className="text-sm">
              Evet
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="radio"
              id={`${id}-no`}
              name={id}
              checked={value === false}
              onChange={() => onChange(false)}
              className="w-4 h-4 text-primary bg-background border-border focus:ring-ring focus:ring-2"
            />
            <label htmlFor={`${id}-no`} className="text-sm">
              Hayır
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
