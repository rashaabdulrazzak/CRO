import  { useMemo, useState } from "react";
import { Button } from "primereact/button";

type LSPatient = {
  id: number;
  code?: string;
  name: string;
  age?: number | null;
  sex?: "male" | "female";
  createdAt: string;
};
type LSCase = {
  id: number;
  patientId: number;
  imageId: string;
  createdAt: string;
};
type LSForm = {
  id: number;
  caseId: number;
  type: string;
  version: string;
  data: unknown;
  createdAt: string;
};
type LSUpload = {
  id: number;
  caseId: number;
  kind: string;
  url: string;
  contentType?: string;
  createdAt: string;
};

const KEYS = {
  patients: "app.patients",
  cases: "app.cases",
  forms: "app.forms",
  uploads: "app.uploads",
  draft: "app.addPredictDraft",
};

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export default function LocalStoreInspector() {
  const [tick, setTick] = useState(0);

  const data = useMemo(() => {
    return {
      patients: read<LSPatient[]>(KEYS.patients, []),
      cases: read<LSCase[]>(KEYS.cases, []),
      forms: read<LSForm[]>(KEYS.forms, []),
      uploads: read<LSUpload[]>(KEYS.uploads, []),
      draft: read<unknown | null>(KEYS.draft, null),
    };
  }, [tick]);

  const refresh = () => setTick((t) => t + 1);

  const clearAll = () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    refresh();
  };

  const clearDataOnly = () => {
    [KEYS.patients, KEYS.cases, KEYS.forms, KEYS.uploads].forEach((k) =>
      localStorage.removeItem(k)
    );
    refresh();
  };

  const clearDraftOnly = () => {
    localStorage.removeItem(KEYS.draft);
    refresh();
  };

  const downloadJSON = () => {
    const payload = {
      patients: data.patients,
      cases: data.cases,
      forms: data.forms,
      uploads: data.uploads,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "app-localstorage-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-semibold">Local Storage Inspector</h3>
        <div className="flex gap-2">
          <Button label="Refresh" onClick={refresh} className="p-button-text" />
          <Button label="Download JSON" onClick={downloadJSON} className="p-button-outlined" />
          <Button label="Clear Data" onClick={clearDataOnly} className="p-button-warning" />
          <Button label="Clear Draft" onClick={clearDraftOnly} className="p-button-secondary" />
          <Button label="Clear ALL" onClick={clearAll} className="p-button-danger" />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-50 rounded p-3">
          <div className="text-xs text-gray-500">Patients</div>
          <div className="text-xl font-semibold">{data.patients.length}</div>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <div className="text-xs text-gray-500">Cases</div>
          <div className="text-xl font-semibold">{data.cases.length}</div>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <div className="text-xs text-gray-500">Forms</div>
          <div className="text-xl font-semibold">{data.forms.length}</div>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <div className="text-xs text-gray-500">Uploads</div>
          <div className="text-xl font-semibold">{data.uploads.length}</div>
        </div>
      </div>

      {/* Patients */}
      <details className="mb-3" open>
        <summary className="cursor-pointer font-medium">Patients ({data.patients.length})</summary>
        <div className="overflow-auto mt-2">
          <table className="min-w-[700px] w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Code</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Age</th>
                <th className="py-2 pr-4">Sex</th>
                <th className="py-2 pr-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {data.patients.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-2 pr-4">{p.id}</td>
                  <td className="py-2 pr-4">{p.code}</td>
                  <td className="py-2 pr-4">{p.name}</td>
                  <td className="py-2 pr-4">{p.age ?? ""}</td>
                  <td className="py-2 pr-4">{p.sex ?? ""}</td>
                  <td className="py-2 pr-4">{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {data.patients.length === 0 && (
                <tr><td className="py-3 text-gray-500" colSpan={6}>No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </details>

      {/* Cases */}
      <details className="mb-3">
        <summary className="cursor-pointer font-medium">Cases ({data.cases.length})</summary>
        <div className="overflow-auto mt-2">
          <table className="min-w-[700px] w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Patient ID</th>
                <th className="py-2 pr-4">Image ID</th>
                <th className="py-2 pr-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {data.cases.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="py-2 pr-4">{c.id}</td>
                  <td className="py-2 pr-4">{c.patientId}</td>
                  <td className="py-2 pr-4">{c.imageId}</td>
                  <td className="py-2 pr-4">{new Date(c.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {data.cases.length === 0 && (
                <tr><td className="py-3 text-gray-500" colSpan={4}>No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </details>

      {/* Forms */}
      <details className="mb-3">
        <summary className="cursor-pointer font-medium">Forms ({data.forms.length})</summary>
        <div className="overflow-auto mt-2">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Case ID</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Version</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Data (preview)</th>
              </tr>
            </thead>
            <tbody>
              {data.forms.map((f) => (
                <tr key={f.id} className="border-b align-top">
                  <td className="py-2 pr-4">{f.id}</td>
                  <td className="py-2 pr-4">{f.caseId}</td>
                  <td className="py-2 pr-4">{f.type}</td>
                  <td className="py-2 pr-4">{f.version}</td>
                  <td className="py-2 pr-4">{new Date(f.createdAt).toLocaleString()}</td>
                  <td className="py-2 pr-4">
                    <pre className="whitespace-pre-wrap break-words max-h-40 overflow-auto bg-gray-50 p-2 rounded">
{JSON.stringify(f.data, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
              {data.forms.length === 0 && (
                <tr><td className="py-3 text-gray-500" colSpan={6}>No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </details>

      {/* Uploads */}
      <details>
        <summary className="cursor-pointer font-medium">Uploads ({data.uploads.length})</summary>
        <div className="overflow-auto mt-2">
          <table className="min-w-[800px] w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Case ID</th>
                <th className="py-2 pr-4">Kind</th>
                <th className="py-2 pr-4">URL</th>
                <th className="py-2 pr-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {data.uploads.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="py-2 pr-4">{u.id}</td>
                  <td className="py-2 pr-4">{u.caseId}</td>
                  <td className="py-2 pr-4">{u.kind}</td>
                  <td className="py-2 pr-4">
                    <div className="truncate max-w-[380px]" title={u.url}>{u.url}</div>
                  </td>
                  <td className="py-2 pr-4">{new Date(u.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {data.uploads.length === 0 && (
                <tr><td className="py-3 text-gray-500" colSpan={5}>No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
