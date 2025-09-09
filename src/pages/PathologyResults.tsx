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
import { getPatients, savePatients, type Patient,type PatientImage } from '../lib/mockData';
import { useAuth } from '../components/AuthContext';



export default function PathologyResults() {
  const { user } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [evaluationData, setEvaluationData] = useState<Record<string, { decision: string; notes: string }>>({});
  const toast = useRef<Toast>(null);

  useEffect(() => {
    setPatients(getPatients());
  }, []);

  const handleSearch = () => {
    if (!searchId.trim()) {
      toast.current?.show({severity:'error', summary: 'Error', detail:'Please enter a Volunteer ID', life: 3000});

      return;
    }

    const patient = patients.find((p) => p.volunteerId.toLowerCase().includes(searchId.toLowerCase()));
    if (patient) {
      setSelectedPatient(patient);
      const initialData: Record<string, { decision: string; notes: string }> = {};
      patient.images.forEach((image) => {
        const existingEval = image.evaluations.find((evalItem) => evalItem.radiologistId === user?.id);
        initialData[image.id] = {
          decision: existingEval?.decision || 'pending',
          notes: existingEval?.notes || '',
        };
      });
      setEvaluationData(initialData);
    } else {
      setSelectedPatient(null);
     toast.current?.show({severity:'error', summary: 'Error', detail:'Patient not found', life: 3000});
    }
  };

  const handleEvaluationChange = (imageId: string, field: 'decision' | 'notes', value: string) => {
    setEvaluationData((prev) => ({
      ...prev,
      [imageId]: {
        ...prev[imageId],
        [field]: value,
      },
    }));
  };

  const saveEvaluation = (imageId: string) => {
    if (!selectedPatient || !user) return;

    const evaluation = evaluationData[imageId];
    if (!evaluation || evaluation.decision === 'pending') {
      toast.current?.show({severity:'error', summary: 'Error', detail:'Please make a decision before saving', life: 3000});

      return;
    }

    const updatedPatients = patients.map((patient) => {
      if (patient.id === selectedPatient.id) {
        const updatedImages = patient.images.map((image) => {
          if (image.id === imageId) {
            const updatedEvaluations = image.evaluations.map((imageEvaluation) => {
              if (imageEvaluation.radiologistId === user.id) {
                return {
                  ...imageEvaluation,
                  decision: evaluation.decision as 'biopsy_required' | 'biopsy_not_required',
                  notes: evaluation.notes,
                  evaluationDate: new Date().toISOString(),
                };
              }
              return imageEvaluation;
            });
            return { ...image, evaluations: updatedEvaluations };
          }
          return image;
        });
        return { ...patient, images: updatedImages };
      }
      return patient;
    });

    setPatients(updatedPatients);
    savePatients(updatedPatients);
    const updatedSelected = updatedPatients.find((p) => p.id === selectedPatient.id);
    setSelectedPatient(updatedSelected || null);

    // Check consensus after saving
    if (updatedSelected) {
      checkConsensus(imageId, updatedSelected);
    }

    toast.current?.show({severity:'success', summary: 'Success', detail:'Evaluation saved successfully', life: 3000});

  };

  const checkConsensus = (imageId: string, patient: Patient | undefined) => {
    if (!patient) return;
    const image = patient.images.find((img) => img.id === imageId);
    if (!image) return;
    const completed = image.evaluations.filter((e) => e.decision !== 'pending');
    if (completed.length >= 2) {
      const biopsyRequired = completed.filter((e) => e.decision === 'biopsy_required').length;
      if (biopsyRequired >= 2) {
      
        toast.current?.show({severity:'success', summary: 'Success', detail:'Consensus reached: Biopsy decision confirmed. Field Coordinator has been notified.', life: 3000});

      }
    }
  };

  const getConsensusStatus = (image: PatientImage) => {
    const completed = image.evaluations.filter((e) => e.decision !== 'pending');
    const biopsyRequired = completed.filter((e) => e.decision === 'biopsy_required').length;
    if (completed.length >= 3) {
      return biopsyRequired >= 2 ? 'Consensus: Biopsy Required' : 'Consensus: No Biopsy';
    } else if (completed.length >= 2 && biopsyRequired >= 2) {
      return 'Consensus: Biopsy Required';
    }
    return `${completed.length}/3 evaluations completed`;
  };

  const decisionOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Biopsy Required', value: 'biopsy_required' },
    { label: 'Biopsy Not Required', value: 'biopsy_not_required' },
  ];

  const getDecisionTag = (decision: string) => {
    switch (decision) {
      case 'biopsy_required':
        return <Tag severity="danger" value="Biopsy Required" />;
      case 'biopsy_not_required':
        return <Tag severity="success" value="No Biopsy Needed" />;
      default:
        return <Tag value="Pending" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
     <Toast ref={toast} />

      {/* Header */}
  {/*     <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              type="button"
              icon="pi pi-arrow-left"
              label="Back to Dashboard"
              className="p-button-text mr-4 flex items-center gap-2"
              onClick={() => navigate('/dashboard')}
            />
            <span className="pi pi-user-md text-blue-600 mr-3"></span>
            <h1 className="text-xl font-semibold text-gray-900">Image Evaluation</h1>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card className="mb-6">
          <div className="p-4 border-b">
            <span className="text-lg font-semibold">Search Patient</span>
          </div>
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium mb-1">
                  Volunteer ID
                </label>
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
                className="mt-2 md:mt-0"
              />
            </div>
          </div>
        </Card>
   {/*      <MedicalCriteriaForm/> */}

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

        {/* Images Evaluation */}
        {selectedPatient && (
          <div className="space-y-6">
            {selectedPatient.images.map((image) => (
              <Card key={image.id}>
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="pi pi-image text-gray-500 mr-2"></span>
                    <span className="text-lg font-semibold">{image.imageNumber}</span>
                  </div>
                  <Tag severity="info" value={getConsensusStatus(image)} className="text-sm" />
                </div>
                <div className="p-4">
                  {/* Image placeholder */}
                  <div className="mb-6 bg-gray-100 rounded-lg p-8 text-center">
                    <span className="pi pi-image text-6xl text-gray-400 mb-2 block"></span>
                    <p className="text-gray-500">USG Image: {image.imageNumber}</p>
                    <p className="text-sm text-gray-400">
                      Uploaded: {new Date(image.uploadDate).toLocaleString()}
                    </p>
                  </div>

                  {/* All Radiologist Evaluations */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">All Radiologist Evaluations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {image.evaluations.map((evaluation) => (
                        <div key={evaluation.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{evaluation.radiologistName}</span>
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

                  {/* Current User's Evaluation */}
                  {user && (
                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-3">Your Evaluation</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Decision</label>
                          <Dropdown
                            value={evaluationData[image.id]?.decision || 'pending'}
                            onChange={(e) => handleEvaluationChange(image.id, 'decision', e.value)}
                            options={decisionOptions}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select a decision"
                            className="w-full"
                            disabled={selectedPatient.isLocked}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Notes</label>
                          <InputTextarea
                            value={evaluationData[image.id]?.notes || ''}
                            onChange={(e) => handleEvaluationChange(image.id, 'notes', e.target.value)}
                            rows={3}
                            placeholder="Add your evaluation notes..."
                            className="w-full"
                            disabled={selectedPatient.isLocked}
                          />
                        </div>
                        <Button
                          type="button"
                          label="Save Evaluation"
                          onClick={() => saveEvaluation(image.id)}
                          disabled={
                            selectedPatient.isLocked ||
                            evaluationData[image.id]?.decision === 'pending'
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
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
