export interface Patient {
  id: string;
  volunteerId: string;
  firstVisitDate: string;
  secondVisitDate?: string;
  age: number;
  gender: 'male' | 'female';
  images: PatientImage[];
  isLocked: boolean;
}

export interface PatientImage {
  id: string;
  imageNumber: string;
  uploadDate: string;
  uploadedBy: string;
  evaluations: ImageEvaluation[];
}

export interface ImageEvaluation {
  id: string;
  radiologistId: string;
  radiologistName: string;
  decision: 'biopsy_required' | 'biopsy_not_required' | 'pending';
  evaluationDate?: string;
  notes?: string;
}

// Mock data
export const mockPatients: Patient[] = [
  {
    id: '1',
    volunteerId: 'TR00001',
    firstVisitDate: '2024-01-15',
    secondVisitDate: '2024-01-22',
    age: 45,
    gender: 'female',
    isLocked: false,
    images: [
      {
        id: '1',
        imageNumber: 'TR00001-01',
        uploadDate: '2024-01-15T10:30:00Z',
        uploadedBy: 'coordinator1',
        evaluations: [
          {
            id: '1',
            radiologistId: '2',
            radiologistName: 'Dr. Smith',
            decision: 'biopsy_required',
            evaluationDate: '2024-01-16T09:00:00Z',
            notes: 'Suspicious lesion detected'
          },
          {
            id: '2',
            radiologistId: '3',
            radiologistName: 'Dr. Johnson',
            decision: 'biopsy_required',
            evaluationDate: '2024-01-16T14:30:00Z',
            notes: 'Agrees with biopsy recommendation'
          },
          {
            id: '3',
            radiologistId: '4',
            radiologistName: 'Dr. Williams',
            decision: 'pending',
            notes: ''
          }
        ]
      },
      {
        id: '2',
        imageNumber: 'TR00001-02',
        uploadDate: '2024-01-15T10:35:00Z',
        uploadedBy: 'coordinator1',
        evaluations: [
          {
            id: '4',
            radiologistId: '2',
            radiologistName: 'Dr. Smith',
            decision: 'pending',
            notes: ''
          },
          {
            id: '5',
            radiologistId: '3',
            radiologistName: 'Dr. Johnson',
            decision: 'pending',
            notes: ''
          },
          {
            id: '6',
            radiologistId: '4',
            radiologistName: 'Dr. Williams',
            decision: 'pending',
            notes: ''
          }
        ]
      }
    ]
  },
  {
    id: '2',
    volunteerId: 'TR00002',
    firstVisitDate: '2024-01-16',
    age: 52,
    gender: 'male',
    isLocked: true,
    images: [
      {
        id: '3',
        imageNumber: 'TR00002-01',
        uploadDate: '2024-01-16T11:00:00Z',
        uploadedBy: 'coordinator1',
        evaluations: [
          {
            id: '7',
            radiologistId: '2',
            radiologistName: 'Dr. Smith',
            decision: 'biopsy_not_required',
            evaluationDate: '2024-01-17T10:00:00Z',
            notes: 'Normal findings'
          },
          {
            id: '8',
            radiologistId: '3',
            radiologistName: 'Dr. Johnson',
            decision: 'biopsy_not_required',
            evaluationDate: '2024-01-17T15:00:00Z',
            notes: 'No suspicious findings'
          },
          {
            id: '9',
            radiologistId: '4',
            radiologistName: 'Dr. Williams',
            decision: 'biopsy_not_required',
            evaluationDate: '2024-01-17T16:30:00Z',
            notes: 'Concur with colleagues'
          }
        ]
      }
    ]
  }
];

export const getPatients = (): Patient[] => {
  const stored = localStorage.getItem('patients');
  return stored ? JSON.parse(stored) : mockPatients;
};

export const savePatients = (patients: Patient[]) => {
  localStorage.setItem('patients', JSON.stringify(patients));
};

export const getNextImageNumber = (): string => {
  const patients = getPatients();
  let maxNumber = 0;
  
  patients.forEach(patient => {
    const volunteerNumber = parseInt(patient.volunteerId.replace('TR', ''));
    if (volunteerNumber > maxNumber) {
      maxNumber = volunteerNumber;
    }
  });
  
  return `TR${String(maxNumber + 1).padStart(5, '0')}`;
};

export const getLastDownloadTime = (): string | null => {
    console.log('Last download time:', localStorage.getItem('lastDownloadTime'));

  return localStorage.getItem('lastDownloadTime');
};

export const setLastDownloadTime = (time: string) => {
  localStorage.setItem('lastDownloadTime', time);
};

export const canDownload = (): boolean => {
  const lastDownload = getLastDownloadTime();
  console.log('Last download time:', lastDownload);
  if (!lastDownload) return true;
  
  const lastDownloadTime = new Date(lastDownload);
  const now = new Date();
  const hoursDiff = (now.getTime() - lastDownloadTime.getTime()) / (1000 * 60 * 60);
  
  return hoursDiff >= 24;
};