import  { useEffect, useRef, useState } from 'react';

// PrimeReact components
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import * as XLSX from 'xlsx';
// Data
import { getPatients, getLastDownloadTime, setLastDownloadTime, canDownload, type Patient, type PatientImage, type ImageEvaluation } from '../lib/mockData';

// Narrow type: we only need isLocked
type RowWithLock = Pick<Patient, 'isLocked'>;



export default function DataDownload() {


  const [patients, setPatients] = useState(getPatients());
  const [lastDownload, setLastDownload] = useState<string | null>(null);
  const [canDownloadData, setCanDownloadData] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const toastRef = useRef<Toast>(null);

  useEffect(() => {
    const last = getLastDownloadTime();
    setLastDownload(last);
    setCanDownloadData(canDownload());
    setPatients(getPatients());
  }, []);

 /*  const notify = (severity: 'success' | 'error', summary: string, detail?: string) => {
    toastRef.current?.show({ severity, summary, detail, life: 3000 });
  }; */

 const handleDownload = async () => {
  if (!canDownloadData) {
    // your existing toast
    toastRef.current?.show?.({ severity: 'error', summary: 'Download blocked', detail: 'Download is only allowed once every 24 hours' });
    return;
  }

  setIsDownloading(true);
  try {
    // Simulate server prep if you want to keep the delay
    await new Promise((r) => setTimeout(r, 2000));

    // ✅ XLSX (protected)
    exportToXLSX(patients);

    // Update cooldown
    const now = new Date().toISOString();
    setLastDownloadTime(now);
    setLastDownload(now);
    setCanDownloadData(false);

    // your existing toast
    toastRef.current?.show?.({ severity: 'success', summary: 'Export complete', detail: 'Excel file exported successfully' });
  } catch (e) {
    console.error('Export error:', e);
    toastRef.current?.show?.({ severity: 'error', summary: 'Export failed', detail: 'Failed to export data' });
  } finally {
    setIsDownloading(false);
  }
};


/*   const generateCSVContent = () => {
    const headers = [
      'Volunteer ID',
      'Age',
      'Gender',
      'First Visit Date',
      'Second Visit Date',
      'Image Count',
      'Evaluation Status',
      'Consensus Result',
      'Is Locked',
      'Upload Date'
    ];

    const rows = patients.map((patient: any) => {
      const evaluationStatus = patient.images
        .map((image: any) => {
          const completed = image.evaluations.filter((ev: any) => ev.decision !== 'pending').length;
          return `${completed}/3`;
        })
        .join('; ');

      const consensusResults = patient.images
        .map((image: any) => {
          const completedEvaluations = image.evaluations.filter((ev: any) => ev.decision !== 'pending');
          const biopsyRequired = completedEvaluations.filter((ev: any) => ev.decision === 'biopsy_required').length;
          if (completedEvaluations.length >= 2 && biopsyRequired >= 2) return 'Biopsy Required';
          if (completedEvaluations.length >= 3 && biopsyRequired < 2) return 'No Biopsy';
          return 'Pending';
        })
        .join('; ');

      return [
        patient.volunteerId,
        patient.age,
        patient.gender,
        patient.firstVisitDate,
        patient.secondVisitDate || '',
        patient.images.length,
        evaluationStatus,
        consensusResults,
        patient.isLocked ? 'Yes' : 'No',
        patient.images[0]?.uploadDate ? new Date(patient.images[0].uploadDate).toLocaleDateString() : ''
      ];
    });

    return [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n');
  }; */


  const getTimeUntilNextDownload = () => {
    if (!lastDownload) return null;
    const last = new Date(lastDownload);
    const next = new Date(last.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    if (now >= next) return null;
    const diffMs = next.getTime() - now.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Build the rows you currently write to CSV

const buildExportRows = (patients: Patient[]) => {
  const headers = [
    'Volunteer ID',
    'Age',
    'Gender',
    'First Visit Date',
    'Second Visit Date',
    'Image Count',
    'Evaluation Status',
    'Consensus Result',
    'Is Locked',
    'Upload Date'
  ];

  const rows = patients.map((patient: Patient) => {
    const evaluationStatus = patient.images
      .map((image: PatientImage) => {
        const completed = image.evaluations.filter((ev: ImageEvaluation) => ev.decision !== 'pending').length;
        return `${completed}/3`;
      })
      .join('; ');

    const consensusResults = patient.images
      .map((image: PatientImage) => {
        const completedEvaluations = image.evaluations.filter((ev: ImageEvaluation) => ev.decision !== 'pending');
        const biopsyRequired = completedEvaluations.filter((ev: ImageEvaluation) => ev.decision === 'biopsy_required').length;
        if (completedEvaluations.length >= 2 && biopsyRequired >= 2) return 'Biopsy Required';
        if (completedEvaluations.length >= 3 && biopsyRequired < 2) return 'No Biopsy';
        return 'Pending';
      })
      .join('; ');

    return [
      patient.volunteerId,
      patient.age,
      patient.gender,
      patient.firstVisitDate,
      patient.secondVisitDate || '',
      patient.images.length,
      evaluationStatus,
      consensusResults,
      patient.isLocked ? 'Yes' : 'No',
      patient.images[0]?.uploadDate ? new Date(patient.images[0].uploadDate).toLocaleDateString() : ''
    ];
  });

  return [headers, ...rows];
};

// Plain worksheet (no protection/password)
const makeWorksheet = (aoa: (string | number)[][]): XLSX.WorkSheet => {
  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(aoa);

  if (aoa.length > 0) {
    const header = aoa[0];
    const colWidths: XLSX.ColInfo[] = header.map((h) => ({
      wch: Math.max(String(h ?? '').length + 2, 14),
    }));
    ws['!cols'] = colWidths; // typed, no 'any'
  }

  return ws;
};

// XLSX export — ONLY unlocked patients
const exportToXLSX = (
  patients: Patient[],
  filename = `clinical_research_data_${new Date().toISOString().split('T')[0]}.xlsx`
) => {
  const exportPatients = patients.filter(p => !p.isLocked);   // ✅ exclude locked
  const aoa = buildExportRows(exportPatients);
  const ws = makeWorksheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Export');

  XLSX.writeFile(wb, filename, { bookType: 'xlsx', compression: true });
};


  const lockedPatientsCount = patients.filter((p: Patient) => p.isLocked).length;
  const totalPatients = patients.length;
  const timeUntilNext = getTimeUntilNextDownload();

  const statusTemplate = (row: RowWithLock) =>
    row.isLocked ? (
      <Tag value="Locked" severity="danger" />
    ) : (
      <Tag value="Available" severity="success" />
    );

  return (
    <div className="min-h-screen">
      <Toast ref={toastRef} position="top-right" />

      {/* Header */}
   {/*    <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              link
              className="mr-4"
              onClick={() => navigate('/dashboard')}
              icon="pi pi-arrow-left"
              label="Back to Dashboard"
            />
            <i className="pi pi-heart text-blue-600 text-xl mr-3" aria-hidden />
            <h1 className="text-xl font-semibold text-gray-900">Data Download</h1>
          </div>
        </div>
      </header> */}

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Export Status */}
        <Card className="mb-6" title={<span className="font-semibold">Export Status</span>}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalPatients}</div>
              <div className="text-sm text-gray-500">Total Patients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalPatients - lockedPatientsCount}</div>
              <div className="text-sm text-gray-500">Available for Export</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{lockedPatientsCount}</div>
              <div className="text-sm text-gray-500">Locked Patients</div>
            </div>
          </div>

          {lastDownload && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center text-sm text-gray-600">
                <i className="pi pi-clock mr-2" />
                Last download: {new Date(lastDownload).toLocaleString()}
              </div>
            </div>
          )}

          {!canDownloadData && timeUntilNext && (
            <div className="mb-4">
              <Message severity="warn" text={`Next download available in: ${timeUntilNext}`} />
            </div>
          )}

          {lockedPatientsCount > 0 && (
            <div className="mb-4">
              <Message severity="info" text={`${lockedPatientsCount} patient(s) are locked and will be excluded from the export.`} />
            </div>
          )}
        </Card>

        {/* Download Action */}
        <Card title={<span className="font-semibold">Export Data to Excel</span>}>
          <div className="space-y-4">
            <p className="text-gray-600">
              Export all patient data, evaluations, and consensus results to a CSV file.
              Downloads are limited to once every 24 hours for security purposes.
            </p>

            <div className="flex items-center gap-4">
              <Button
                onClick={handleDownload}
                disabled={!canDownloadData || isDownloading}
                icon={isDownloading ? 'pi pi-spin pi-spinner' : 'pi pi-download'}
                label={isDownloading ? 'Preparing Download...' : 'Download Data (CSV)'}
              />

              {canDownloadData && <Tag value="Ready to Download" severity="success" />}
              {!canDownloadData && timeUntilNext && <Tag value={`Next: ${timeUntilNext}`} severity="warning" />}
            </div>

            <div className="text-sm text-gray-500">
              <p><strong>Export includes:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Patient demographics and visit dates</li>
                <li>Image upload information</li>
                <li>Radiologist evaluation status</li>
                <li>Consensus results for biopsy decisions</li>
                <li>Data lock status</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Data Preview */}
        <Card className="mt-6" title={<span className="font-semibold">Data Preview</span>}>
          <DataTable value={patients.slice(0, 5)} tableStyle={{ minWidth: '40rem' }} size="small">
            <Column field="volunteerId" header="Volunteer ID" />
            <Column field="age" header="Age" />
            <Column field="gender" header="Gender" body={(row) => String(row.gender).toUpperCase()} />
            <Column header="Images" body={(row) => row.images.length} />
            <Column header="Status" body={statusTemplate} />
          </DataTable>
          {patients.length > 5 && (
            <p className="text-center text-gray-500 mt-4">... and {patients.length - 5} more patients</p>
          )}
        </Card>
      </main>
    </div>
  );
}
