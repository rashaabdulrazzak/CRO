import { useState, useRef } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { getPatients, savePatients, getNextImageNumber, type Patient, type PatientImage } from '../lib/mockData';
import 'primeicons/primeicons.css'; // ensure PrimeIcons are available

export default function PatientEntry() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  const fileUploadRef = useRef<FileUpload | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    volunteerId: '',
    firstVisitDate: '',
    secondVisitDate: '',
    age: '',
    gender: ''
  });
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' }
  ];

  const handleInputChange = (field: string, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value ?? '' }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileSelect = (event: any) => {
    // event.files contains the selected files
    const files: File[] = Array.from(event.files || []);
    setUploadedImages(prev => [...prev, ...files]);
  };

  // Custom upload handler to prevent actual HTTP requests
  const handleCustomUpload = () => {
    // We do not upload to a server here, so just clear the file input
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.volunteerId || !formData.firstVisitDate || !formData.age || !formData.gender) {
        toast.current?.show({severity:'error', summary: 'Error', detail:'Please fill in all required fields', life: 3000});

      //  Toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      const patients = getPatients();

      // Check if volunteer ID already exists
      const existingPatient = patients.find(p => p.volunteerId === formData.volunteerId);
      if (existingPatient) {
        //toast.error('Volunteer ID already exists');
        toast.current?.show({severity:'error', summary: 'Error', detail:'Volunteer ID already exists', life: 3000});

        setIsLoading(false);
        return;
      }

      // Create patient images
      const patientImages: PatientImage[] = uploadedImages.map((file, index) => {
        console.log('Processing file:', file);
        const imageNumber = `${formData.volunteerId}-${String(index + 1).padStart(2, '0')}`;
        return {
          id: `${Date.now()}-${index}`,
          imageNumber,
          uploadDate: new Date().toISOString(),
          uploadedBy: user?.username || '',
          evaluations: [
            {
              id: `eval-${Date.now()}-${index}-1`,
              radiologistId: '2',
              radiologistName: 'Dr. Smith',
              decision: 'pending',
              notes: ''
            },
            {
              id: `eval-${Date.now()}-${index}-2`,
              radiologistId: '3',
              radiologistName: 'Dr. Johnson',
              decision: 'pending',
              notes: ''
            },
            {
              id: `eval-${Date.now()}-${index}-3`,
              radiologistId: '4',
              radiologistName: 'Dr. Williams',
              decision: 'pending',
              notes: ''
            }
          ]
        };
      });

      // Create new patient
      const newPatient: Patient = {
        id: Date.now().toString(),
        volunteerId: formData.volunteerId,
        firstVisitDate: formData.firstVisitDate,
        secondVisitDate: formData.secondVisitDate || undefined,
        age: parseInt(formData.age),
        gender: formData.gender as 'male' | 'female',
        images: patientImages,
        isLocked: false
      };
      console.log('New Patient:', newPatient);

      // Save to localStorage
      const updatedPatients = [...patients, newPatient];
      savePatients(updatedPatients);
        toast.current?.show({severity:'success', summary: 'Success', detail:`Patient ${formData.volunteerId} added successfully with ${uploadedImages.length} images`, life: 3000});


      // Reset form
      setFormData({
        volunteerId: '',
        firstVisitDate: '',
        secondVisitDate: '',
        age: '',
        gender: ''
      });
      setUploadedImages([]);

    } catch (error) {
    
      toast.current?.show({severity:'error', summary: 'Error', detail:'Failed to save patient data', life: 3000});
      console.error('Error saving patient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateVolunteerId = () => {
    const nextId = getNextImageNumber();
    setFormData(prev => ({ ...prev, volunteerId: nextId }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
          
            <span className="pi pi-user text-blue-600 mr-3"></span>
            <h1 className="text-xl font-semibold text-gray-900">Patient Data Entry</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <div className="p-4 mb-2 border-b ">
            <p className="text-base mb-4 ">Araştırmanın Adı: Tiroid Ultrasonografi ile Elde Edilen Görüntülerde Nodüllerin Saptanması ve Skorlanması Amacıyla Kullanılacak Yapay Zeka
Algoritmasının Doğrulanması</p>
<p className="text-base font-semibold">Protokol No: <span className="text-sm ">DSTR-2023</span></p>
          </div>
          <div className="p-4 ">
            <span className="text-lg font-semibold">Add New Case</span>
          </div>
          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="volunteerId" className="block text-sm font-medium">
                    Volunteer ID <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <InputText
                      id="volunteerId"
                      value={formData.volunteerId}
                      onChange={(e) => handleInputChange('volunteerId', e.target.value)}
                      placeholder="e.g., TR00001"
                      className="flex-1"
                    />
                    <Button type="button" label="Generate" onClick={generateVolunteerId} className="p-button-outlined" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="age" className="block text-sm font-medium">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <InputNumber
                    id="age"
                    value={formData.age ? parseInt(formData.age) : null}
                    onValueChange={(e) => handleInputChange('age', e.value?.toString() || '')}
                    min={1}
                    max={120}
                    placeholder="Enter age"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="firstVisitDate" className="block text-sm font-medium">
                    First Visit Date (USG Scan) <span className="text-red-500">*</span>
                  </label>
                    <Calendar
                      id="firstVisitDate"
                      value={formData.firstVisitDate ? new Date(formData.firstVisitDate) : null}
                      onChange={(e) => handleInputChange('firstVisitDate', e.value ? e.value.toISOString().split('T')[0] : '')}
                      dateFormat="yy-mm-dd"
                      showIcon
                      className="w-full"
                    />
                </div>

                <div className="space-y-2">
                  <label htmlFor="secondVisitDate" className="block text-sm font-medium">
                    Second Visit Date (Pathology)
                  </label>
                    <Calendar
                      id="secondVisitDate"
                      value={formData.secondVisitDate ? new Date(formData.secondVisitDate) : null}
                      onChange={(e) => handleInputChange('secondVisitDate', e.value ? e.value.toISOString().split('T')[0] : '')}
                      dateFormat="yy-mm-dd"
                      showIcon
                      className="w-full"
                    />
                </div>

                <div className="space-y-2">
                  <label htmlFor="gender" className="block text-sm font-medium">
                    Gender <span className="text-red-500">*</span>
                  </label>
                    <Dropdown
                      id="gender"
                      value={formData.gender || null}
                      onChange={(e) => handleInputChange('gender', e.value)}
                      options={genderOptions}
                      placeholder="Select gender"
                      className="w-full"
                    />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-medium">USG Image Upload</label>
                {/* FileUpload with custom upload to store files locally */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <FileUpload
                    ref={fileUploadRef}
                    name="files"
                    mode="advanced"
                    multiple
                    accept="image/*"
                    maxFileSize={10 * 1024 * 1024}
                    onSelect={handleFileSelect}
                    customUpload
                    uploadHandler={handleCustomUpload}
                    chooseLabel="Browse"
                    className="w-full"
                  />
                  <div className="mt-4 text-center">
                    <span className="pi pi-upload text-gray-400"></span>
                    <p className="mt-2 text-sm font-medium text-gray-900">Upload anonymized USG images</p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB each</p>
                  </div>
                </div>

                {/* Uploaded Images List */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Uploaded Images ({uploadedImages.length})</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {uploadedImages.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {formData.volunteerId
                                ? `${formData.volunteerId}-${String(index + 1).padStart(2, '0')}`
                                : `Image ${index + 1}`}
                            </span>
                            <span className="text-xs text-gray-500">({file.name})</span>
                          </div>
                          <Button
                            type="button"
                            icon="pi pi-times"
                            className="p-button-text p-button-sm"
                            onClick={() => removeImage(index)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  label="Cancel"
                  className="p-button-outlined"
                  onClick={() => navigate('/dashboard')}
                />
                <Button
                  type="submit"
                  icon="pi pi-save"
                  label={isLoading ? 'Saving...' : 'Save Patient'}
                  disabled={isLoading}
                />

              </div>
            </form>
          </div>
        </Card>

        {/* Instructions */}
        <Card>
          <div className="p-4 border-b">
            <span className="text-lg font-semibold">Instructions</span>
          </div>
          <div className="p-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Patient Information:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Volunteer ID will be automatically assigned if you click "Generate"</li>
                <li>First visit date is required (ultrasound scan date)</li>
                <li>Second visit date is optional (pathology date if applicable)</li>
                <li>Age and gender are required fields</li>
              </ul>
              <p className="mt-4"><strong>Image Upload:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Upload anonymized USG images only</li>
                <li>Images will be automatically numbered in sequence</li>
                <li>Patient information should be masked in the images</li>
                <li>Supported formats: PNG, JPG, JPEG</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
