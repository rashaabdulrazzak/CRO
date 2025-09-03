import { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { RadioButton } from "primereact/radiobutton";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";

export type YesNo = "yes" | "no" | null;
type QType = "label" | "radio" | "checkbox" | "text";

 type QConfig = {
  type: QType;
  label: string;
};

type MixedAnswer = YesNo | boolean | string | null;

 type ActionDialogPayload = {
  userId: string | number | undefined;
  answers: MixedAnswer[];
  username: string;
  isApproved: boolean;
};

 type MinimalUserRecord = { id?: string | number };
  const defaultQConfig: QConfig[] = [
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

function makeInitialAnswers(cfg: QConfig[]): MixedAnswer[] {
  return cfg.map((q) =>
    q.type === "radio" ? null :
    q.type === "checkbox" ? false :
    q.type === "text" ? "" :
    null
  );
}

export default function ActionDialog({
  visible,
  target,
  onSubmit,
  onCancel,
  qConfig = defaultQConfig,
  width = "48rem",
}: {
  visible: boolean;
  target?: MinimalUserRecord | null;
  onSubmit: (payload: ActionDialogPayload) => void;
  onCancel: () => void;
  qConfig?: QConfig[];
  width?: string;
}) {
  const initialAnswers = useMemo(() => makeInitialAnswers(qConfig), [qConfig]);

  const [answers, setAnswers] = useState<MixedAnswer[]>(initialAnswers);
  const [username, setUsername] = useState("");
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    if (visible) {
      setAnswers(makeInitialAnswers(qConfig));
      setUsername("");
      setIsApproved(false);
    }
  }, [visible, target, qConfig]);

  const setAnswer = (idx: number, value: MixedAnswer) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const allRadiosAnswered = qConfig.every(
    (q, i) => q.type !== "radio" || answers[i] === "yes" || answers[i] === "no"
  );

  const canSubmit = allRadiosAnswered && username.trim().length > 0;

  const handleSubmit = () => {
    onSubmit({
      userId: target?.id,
      answers,
      username,
      isApproved,
    });
  };

  return (
    <Dialog
      header={target?.id ? `Action for ID ${target.id}` : "Action"}
      visible={visible}
      style={{ width, maxWidth: "95vw" }}
      modal
      onHide={onCancel}
      contentClassName="p-6"
      footer={
        <div className="flex justify-end gap-2">
          <Button label="Cancel" className="p-button-secondary" onClick={onCancel} />
          <Button
            label="Submit"
            icon="pi pi-check"
            className="p-button-success"
            onClick={handleSubmit}
            disabled={!canSubmit}
          />
        </div>
      }
    >
      {/* Questions */}
      <div className="flex flex-col gap-4">
        {qConfig.map((q, idx) => {
          const isYellow = idx === 6 || idx === 7 || idx === 8; // Q7, Q8, Q9

          if (q.type === "label") {
            return (
              <div
                key={idx}
                className={`p-3 border rounded-lg ${isYellow ? "bg-yellow-50" : ""}`}
              >
                <div className="font-medium text-sm">{q.label}</div>
              </div>
            );
          }

          if (q.type === "radio") {
            const value = answers[idx] as YesNo;
            return (
              <div
                key={idx}
                className={`p-3 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between ${isYellow ? "bg-yellow-50" : ""}`}
              >
                <div className="font-medium text-sm mb-2 md:mb-0">{q.label}</div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <RadioButton
                      inputId={`q-${idx}-yes`}
                      name={`q-${idx}`}
                      value="yes"
                      onChange={() => setAnswer(idx, "yes")}
                      checked={value === "yes"}
                    />
                    <label htmlFor={`q-${idx}-yes`} className="text-sm">Yes</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioButton
                      inputId={`q-${idx}-no`}
                      name={`q-${idx}`}
                      value="no"
                      onChange={() => setAnswer(idx, "no")}
                      checked={value === "no"}
                    />
                    <label htmlFor={`q-${idx}-no`} className="text-sm">No</label>
                  </div>
                </div>
              </div>
            );
          }

          if (q.type === "checkbox") {
            const checked = Boolean(answers[idx]);
            return (
              <div
                key={idx}
                className={`p-3 border rounded-lg flex items-center justify-between ${isYellow ? "bg-yellow-50" : ""}`}
              >
                <div className="font-medium text-sm">{q.label}</div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    inputId={`q-${idx}-cb`}
                    checked={checked}
                    onChange={(e) => setAnswer(idx, !!e.checked)}
                  />
                </div>
              </div>
            );
          }

          // text (textarea)
          const textVal = String(answers[idx] ?? "");
          return (
            <div key={idx} className="p-3 border rounded-lg">
              <label htmlFor={`q-${idx}-txt`} className="font-medium text-sm block mb-2">
                {q.label}
              </label>
              <InputTextarea
                id={`q-${idx}-txt`}
                rows={3}
                autoResize
                className={`w-full ${isYellow ? "bg-yellow-50" : ""}`} // ✅ yellow only for Q9 textarea
                value={textVal}
                onChange={(e) => setAnswer(idx, e.target.value)}
              />
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t my-5" />

      {/* Username */}
      <div className="flex items-center gap-3 mb-4">
        <label htmlFor="action-username" className="text-sm whitespace-nowrap">Username:</label>
        <InputText
          id="action-username"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Is Approved */}
      <div className="flex items-center gap-2">
       
        <label htmlFor="isApproved" className="text-sm">Is Approved</label>
         <Checkbox
          inputId="isApproved"
          checked={isApproved}
          onChange={(e) => setIsApproved(!!e.checked)}
        />
      </div>
    </Dialog>
  );
}
