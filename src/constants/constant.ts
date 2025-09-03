export type QType = "label" | "radio" | "checkbox" | "text";

export type QConfig = {
  type: QType;
  label: string;
};
export const defaultQConfig: QConfig[] = [
  { type: "radio",   label: "Güvenlik Bildirimi gerektiren bir olumsuz olay (Adverse olay) yaşandı mı? (Have there been any adverse events requiring a Notification to Authorized Authorities? " },
  { type: "label",   label: " Bu adverse olay aşağıda listelenenlerden biri mi?  If yes, is it one of the below?" },
  { type: "checkbox",label: "Cihaz amaçlanmayan şekilde kullanıldı.(The device was used for an unintended purpose.)" },
  { type: "checkbox",label: "Algoritmanın otomatik segmentasyonunda nodül olmayan bir alanın nodül olarak değerlendirildi.(In the automatic segmentation of the algorithm, a non-nodule area was evaluated as a nodule)" },
  { type: "text",    label: "Explain in text please:" },
  { type: "radio",   label: "Ciddi olumsuz olay (Critical Adverse Event ) yaşandı mı?(Have any serious adverse events occurred?)" },
  { type: "checkbox",label: "Ölüme yol açtı. (Caused to death)" },
  { type: "checkbox",label: "Gönüllünün sağlık durumunda bunlardan herhangi biriyle sonuçlanan ciddi bozulmaya yol açtı: Fetal distres, fetal ölüm veya konjenital fiziksel veya zihinsel bozukluk ya da doğum defektine yol açan advers olaylar (Caused serious deterioration in the subject's health resulting in any of the following conditions: Adverse events leading to fetal distress, fetal death, or congenital physical or mental impairment or birth defect)" },
  { type: "text",    label: "Explain in text please:" },
  { type: "label",   label: "Not: Herhangi bir Ciddi Adverse olay oluştuysa Araştırmacı Broşürü’nde tarif edildiği şekilde TİTCK’ya raporlayınız. (If such a situation listed as Critical Adverse Event occurs, report it immediately to TİTCK as described in the Researcher's Brochure.)" },
];