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
      // Replace with your actual API endpoint
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
      return this.getMockImages();
    }
  },

  // Mock data for testing (remove in production)
  getMockImages(): MedicalImage[] {
    return [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300',
        isDicom: false,
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=300',
        isDicom: false,
      },
    {
        id: '3',
        url: '/dicom/image1.dcm',
        isDicom: true,
        metadata: {
          modality: 'CT',
          studyDate: '2024-10-15',
        },
      },
      {
        id: '4',
        url: '/dicom/image2.dcm',
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
};
