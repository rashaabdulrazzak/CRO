interface MedicalImage {
  id: string;
  url: string;
  isDicom: boolean;
  thumbnail?: string;
  metadata?: {
    modality?: string;
    studyDate?: string;
    patientId?: string;
  };
}

export const medicalImageService = {
  // Fetch images by patient/case ID
  async fetchImagesByCase(caseId: number | null, patientId: number | null): Promise<MedicalImage[]> {
    try {
      // Replace with actual API endpoint
      const response = await fetch(`/api/medical-images?caseId=${caseId}&patientId=${patientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      return data.images || [];
    } catch (error) {
      console.error('Error fetching medical images:', error);
      // Return mock data for development
      return this.getLocalMockImages();
    }
  },

  // Mock data for testing (remove in production)
  getMockImages(): MedicalImage[] {
    return [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop',
        isDicom: false,
        metadata: {
          modality: 'PHOTO',
          studyDate: '2024-10-15',
        },
      },
   
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=300&fit=crop',
        isDicom: false,
        metadata: {
          modality: 'XRAY',
          studyDate: '2024-10-13',
        },
      },
      {
        id: '4',
        url: 'https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=400&h=300&fit=crop',
        isDicom: false,
        metadata: {
          modality: 'SCAN',
          studyDate: '2024-10-12',
        },
      },
    ];
  },

  // Alternative: Get mock images from local public folder
  // Make sure to place your DICOM files in public/dicom/ folder
  getLocalMockImages(): MedicalImage[] {
    return [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop',
        isDicom: false,
      },
    
      {
        id: '3',
        url: 'http://localhost:5173/dicom/3.dcm',
        isDicom: true,
        metadata: {
          modality: 'CT',
          studyDate: '2024-10-15',
        },
      },
      {
        id: '4',
        url: 'http://localhost:5173/dicom/2.DCM',
        isDicom: true,
        metadata: {
          modality: 'MRI',
          studyDate: '2024-10-14',
        },
      },
    ];
  },

  // Detect if file is DICOM based on extension or content type
  isDicomFile(url: string, contentType?: string): boolean {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension === 'dcm' || 
           extension === 'dicom' || 
           contentType === 'application/dicom';
  },

  // Helper to convert File/Blob to DICOM URL
  async fileToImageId(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'application/dicom' });
    const url = URL.createObjectURL(blob);
    return `wadouri:${url}`;
  },
};