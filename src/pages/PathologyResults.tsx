import { useState, useEffect, useRef } from 'react';
// PrimeReact
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
// Data
import { getPatients, savePatients, type Patient, type RadiologistEvaluation } from '../lib/mockData';
import { useAuth } from '../components/AuthContext';

type DecisionType = 'biopsy_required' | 'biopsy_not_required' | 'pending';

const decisionOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Bethesda I', value: '1' },
  { label: 'Bethesda II', value: '2' },
  { label: 'Bethesda III', value: '3' },
  { label: 'Bethesda IV', value: '4' },
  { label: 'Bethesda V - VI', value: '5' },
];

function mapBethesdaToDecision(value: string): DecisionType {
  switch (value) {
    case '4':
    case '5':
      return 'biopsy_required';
    case '1':
    case '2':
    case '3':
      return 'biopsy_not_required';
    case 'pending':
    default:
      return 'pending';
  }
}

function getDecisionTag(decision: string) {
  switch (decision) {
    case 'biopsy_required':
      return <Tag className="warning-tag p-tag p-component p-tag-warning" severity="danger" value="Biopsy Required" />;
    case 'biopsy_not_required':
      return <Tag className="success-tag" severity="success" value="No Biopsy Needed" />;
    default:
      return <Tag className="info-tag" value="Pending" />;
  }
}

export default function PathologyResults() {
  const { user } = useAuth(); // user.role: 'radiologist', 'patolog_coordinator', or 'monitor'
  const [searchId, setSearchId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [evaluation, setEvaluation] = useState<{ decision: string; notes: string }>({ decision: 'pending', notes: '' });
  const toast = useRef<Toast>(null);

  // Data migration to patient-level evaluations on load
  useEffect(() => {
    const fetchedPatients = getPatients();
    // migrate: radiologistEvaluations (one per radiologist)
    const processedPatients = fetchedPatients.map(p => {
      // Deduplicate across images by radiologistId (take most recent, or latest decision not 'pending')
      const evalMap = new Map<string, RadiologistEvaluation>();
      p.images?.forEach(img => {
        img.evaluations.forEach(ev => {
          const existing = evalMap.get(ev.radiologistId);
          // prefer not pending, or latest by date if both are not pending (simplified)
          if (!existing || (existing.decision === 'pending' && ev.decision !== 'pending')) {
            evalMap.set(ev.radiologistId, { ...ev, evaluationDate: ev.evaluationDate || img.uploadDate });
          }
        });
      });
      return {
        ...p,
        radiologistEvaluations: Array.from(evalMap.values())
      };
    });
    setPatients(processedPatients);
  }, []);

  const handleSearch = () => {
    if (!searchId.trim()) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Please enter a Volunteer ID', life: 3000 });
      return;
    }
    const patient = patients.find((p) => p.volunteerId.toLowerCase().includes(searchId.toLowerCase()));
    if (patient) {
      setSelectedPatient(patient);
      setEvaluation(patient.evaluation || { decision: 'pending', notes: '' });
    } else {
      setSelectedPatient(null);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Patient not found', life: 3000 });
    }
  };

  const handleEvaluationChange = (field: 'decision' | 'notes', value: string) => {
    setEvaluation((prev) => ({ ...prev, [field]: value }));
  };

  // Coordinator or Monitor can save evaluation
  const canEdit = user?.role === 'patolog_coordinator' || user?.role === 'monitor';
  const canView =  user?.role === 'biostatistician' || user?.role === 'patolog_coordinator' || user?.role === 'monitor';
 
  const saveEvaluation = () => {
    if (!selectedPatient || !user || !canEdit) return;
    if (evaluation.decision === 'pending') {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Please make a decision before saving',
        life: 3000,
      });
      return;
    }
    const mappedDecision = mapBethesdaToDecision(evaluation.decision);
    // Attach evaluation to the patient
    const updatedPatients = patients.map((p) =>
      p.id === selectedPatient.id
        ? {
            ...p,
            evaluation: {
              decision: mappedDecision,
              notes: evaluation.notes,
              evaluator: user.username,
              date: new Date().toISOString(),
            },
          }
        : p
    );
    setPatients(updatedPatients);
    savePatients(updatedPatients);
    setSelectedPatient(updatedPatients.find((p) => p.id === selectedPatient.id) || null);
    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Evaluation saved successfully',
      life: 3000,
    });
  };

  return (
    <div className="min-h-screen">
      <Toast ref={toast} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card className="mb-6">
          <div className="p-4 border-b">
            <span className="text-lg font-semibold">Search Patient</span>
          </div>
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium mb-1">Volunteer ID</label>
                <InputText
                  id="search"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter Volunteer ID (e.g., TR00001)"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full"
                />
              </div>
              <Button
                type="button"
                icon="pi pi-search"
                label="Search"
                onClick={handleSearch}
                className="mt-2 md:mt-0 px-6 py-2 rounded-md p-button-secondary"
              />
            </div>
          </div>
        </Card>
        {/* Patient Information */}
        {selectedPatient && (
          <Card className="mb-6">
            <div className="p-4 border-b">
              <span className="text-lg font-semibold">Patient Information</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Volunteer ID</span>
                  <p className="text-lg font-semibold">{selectedPatient.volunteerId}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Age</span>
                  <p className="text-lg">{selectedPatient.age}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Gender</span>
                  <p className="text-lg capitalize">{selectedPatient.gender}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">First Visit</span>
                  <p className="text-lg">
                    {new Date(selectedPatient.firstVisitDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {selectedPatient.isLocked && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
                  <span className="pi pi-exclamation-triangle text-yellow-600 mr-2"></span>
                  <span className="text-yellow-800">This patient's data is locked by the monitor.</span>
                </div>
              )}
            </div>
          </Card>
        )}
        {/* Images (side by side, up to 3) and Evaluation */}
        {selectedPatient && (
          <>
            {/* Display images side-by-side */}
            <div className="flex gap-4 mb-6">
              {selectedPatient.images.slice(0, 3).map((img) => (
                <div key={img.id} className="w-[30%] border rounded-lg p-2 flex flex-col items-center">
                  <span className="pi pi-image text-6xl text-gray-400 mb-2"></span>
                  <p className="text-gray-500">USG Image: {img.imageNumber}</p>
                  <p className="text-xs text-gray-400 mb-2">Uploaded: {new Date(img.uploadDate).toLocaleString()}</p>
                </div>
              ))}
            </div>
            {/* Evaluation section */}
            <Card className="mb-6">
              <div className="p-4 border-b">
                <span className="text-lg font-semibold">{!canEdit ? 'Pathology Evaluation ': 'Your Evaluation'}</span>
                {selectedPatient.evaluation?.decision && (
                  <span className="ml-4">{getDecisionTag(selectedPatient.evaluation.decision)}</span>
                )}
              </div>
              <div className="p-4">
                <div>
                  <label className="block text-sm mb-2">
                    {!canEdit ? 'Decision Made by Pathology ': 'Your Decision'}</label>
                  <Dropdown
                    value={evaluation.decision}
                    onChange={(e) => handleEvaluationChange('decision', e.value)}
                    options={decisionOptions}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select decision"
                    className="w-full"
                    disabled={!canEdit || selectedPatient.isLocked}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm mb-2">
                     {!canEdit ? 'Notes Made by Pathology ': 'Your Notes'}</label>
                  <InputTextarea
                    value={evaluation.notes}
                    onChange={(e) => handleEvaluationChange('notes', e.target.value)}
                    rows={3}
                    className="w-full"
                    disabled={!canEdit || selectedPatient.isLocked}
                  />
                </div>
                {canEdit && (
                  <Button
                    label="Save Evaluation"
                    onClick={saveEvaluation}
                    className="mt-4"
                    disabled={selectedPatient.isLocked || evaluation.decision === 'pending'}
                  />
                )}
              </div>
            </Card>
            {/* All Radiologist Evaluations - coordinator and monitor */}
            {canView  && (
              <Card>
                <div className="p-4">
                  <h4 className="font-medium mb-3">All Radiologist Evaluations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedPatient.radiologistEvaluations?.map((evaluation) => (
                      <div key={evaluation.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span>{evaluation.radiologistName}</span>
                          {getDecisionTag(evaluation.decision)}
                        </div>
                        {evaluation.evaluationDate && (
                          <p className="text-xs text-gray-500 mb-2">
                            {new Date(evaluation.evaluationDate).toLocaleString()}
                          </p>
                        )}
                        {evaluation.notes && (
                          <p className="text-sm text-gray-600">{evaluation.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
        {!selectedPatient && (
          <Card>
            <div className="p-4 text-center">
              <span className="pi pi-search text-5xl text-gray-400 mb-4 block"></span>
              <p className="text-gray-500">Search for a patient to begin image evaluation</p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
