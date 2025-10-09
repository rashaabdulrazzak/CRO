import  { useEffect, useRef, useState } from 'react';
//import { useNavigate } from 'react-router-dom';

// PrimeReact
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';

// Data
import { getPatients, savePatients, type Patient } from '../lib/mockData';

export default function LockedData() {
 // const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const toastRef = useRef<Toast>(null);

  useEffect(() => {
    setPatients(getPatients());
  }, []);

  const notify = (
    severity: 'success' | 'info' | 'warn' | 'error',
    summary: string,
    detail?: string
  ) => toastRef.current?.show({ severity, summary, detail, life: 2500 });

  const toggleLockStatus = (patientId: string) => {
    const updated = patients.map((patient) => {
      if (patient.id === patientId) {
        const newLockStatus = !patient.isLocked;
        notify(
          'success',
          `Patient ${patient.volunteerId} ${newLockStatus ? 'locked' : 'unlocked'}`
        );
        return { ...patient, isLocked: newLockStatus };
      }
      return patient;
    });

    setPatients(updated);
    savePatients(updated);
  };

  const lockAllData = () => {
    const updated = patients.map((p) => ({ ...p, isLocked: true }));
    setPatients(updated);
    savePatients(updated);
    notify('success', 'All patient data has been locked');
  };

  const unlockAllData = () => {
    const updated = patients.map((p) => ({ ...p, isLocked: false }));
    setPatients(updated);
    savePatients(updated);
    notify('success', 'All patient data has been unlocked');
  };

  const lockedPatients = patients.filter((p) => p.isLocked);
  const unlockedPatients = patients.filter((p) => !p.isLocked);

  const getEvaluationSummary = (patient: Patient) => {
    let totalEvaluations = 0;
    let completedEvaluations = 0;
    let consensusReached = 0;

    patient.images.forEach((image) => {
      totalEvaluations += 3; // 3 radiologists per image
      const completed = image.evaluations.filter((e) => e.decision !== 'pending');
      completedEvaluations += completed.length;

      const biopsyRequired = completed.filter((e) => e.decision === 'biopsy_required').length;
      if (completed.length >= 2 && biopsyRequired >= 2) {
        consensusReached++;
      } else if (completed.length >= 3 && biopsyRequired < 2) {
        consensusReached++;
      }
    });

    return {
      totalEvaluations,
      completedEvaluations,
      consensusReached,
      totalImages: patient.images.length,
    };
  };
    console.log('Loaded patients:', patients);

  return (
    <div className="min-h-screen">
      <Toast ref={toastRef} position="top-right" />

      {/* Header */}
     {/*  <header className="bg-white shadow-sm border-b">
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
            <h1 className="text-xl font-semibold text-gray-900">Locked Data Management</h1>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <h1 className="text-xl font-semibold text-gray-900">Locked Data Management</h1>
        {/* Summary Cards */
        }
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{patients.length}</div>
              <div className="text-sm text-gray-500">Total Patients</div>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600">{lockedPatients.length}</div>
              <div className="text-sm text-gray-500">Locked Patients</div>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{unlockedPatients.length}</div>
              <div className="text-sm text-gray-500">Unlocked Patients</div>
            </div>
          </Card>
        </div>

        {/* Bulk Actions */}
        <Card className="mb-6" title={<span className="font-semibold">Bulk Actions</span>}>
          <div className="flex gap-4">
            <Button onClick={lockAllData} severity="danger" className='add-btn' icon="pi pi-lock" label="Lock All Data" />
            <Button onClick={unlockAllData} outlined icon="pi pi-lock-open" label="Unlock All Data" />
          </div>
          <div className="mt-4">
            <Message
              severity="warn"
              text="Locked data cannot be exported and prevents new data entry. Use this feature to freeze data during audits or reviews."
            />
          </div>
        </Card>

        {/* Patient List */}
        <Card title={<span className="font-semibold">Patient Data Status</span>}>
          <div className="space-y-4">
            {patients.map((patient) => {
              const summary = getEvaluationSummary(patient);
              return (
                <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium">{patient.volunteerId}</h3>
                        <p className="text-sm text-gray-500">
                          {patient.age} years, {patient.gender}
                        </p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{summary.totalImages} images</p>
                        <p>
                          {summary.completedEvaluations}/{summary.totalEvaluations} evaluations
                        </p>
                      </div>
                      <div>
                        {patient.isLocked ? (
                          <Tag value="Locked" severity="danger" className='locked'  />
                        ) : (
                          <Tag value="Unlocked" severity="success" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm text-gray-500">
                      <p>First visit: {new Date(patient.firstVisitDate).toLocaleDateString()}</p>
                      {patient.secondVisitDate && (
                        <p>Second visit: {new Date(patient.secondVisitDate).toLocaleDateString()}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => toggleLockStatus(patient.id)}
                      severity={patient.isLocked ? 'secondary' : 'danger'}
                      outlined={patient.isLocked}
                      icon={patient.isLocked ? 'pi pi-lock-open' : 'pi pi-lock'}
                      label={patient.isLocked ? 'Unlock' : 'Lock'}
                      size="small"
                    />
                  </div>
                </div>
              );
            })}

            {patients.length === 0 && (
              <div className="text-center py-8 text-gray-500">No patient data available</div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
