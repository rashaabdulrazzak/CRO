// UploadPhotoStep.tsx
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import { useRef } from "react";

interface UploadPhotoStepProps {
  uploadedPhotos: (File | null)[];
  setUploadedPhotos: React.Dispatch<React.SetStateAction<(File | null)[]>>;
}

const UploadPhotoStep: React.FC<UploadPhotoStepProps> = ({
  uploadedPhotos,
  setUploadedPhotos,
}) => {
  const toast = useRef<any>(null);

  const handleSelect = (index: number) => (e: any) => {
    const file = e.files[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    const valid = name.endsWith('.png') || name.endsWith('.dcm');
    if (!valid) {
      toast.current?.show({
        severity: 'error',
        summary: 'Invalid file',
        detail: 'Only .png and .dcm files allowed',
        life: 3000,
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.current?.show({
        severity: 'error',
        summary: 'File too large',
        detail: 'Max 5MB per file',
        life: 3000,
      });
      return;
    }

    setUploadedPhotos(prev => {
      const updated = [...prev];
      updated[index] = file;
      return updated;
    });
  };

  const handleRemove = (index: number) => () => {
    setUploadedPhotos(prev => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col">
          <label className="mb-2 font-medium">Image {i + 1}</label>
          <FileUpload
            name={`file-${i}`}
            accept=".png,.dcm,image/png,application/dicom"
            maxFileSize={5000000}
            multiple={false}
            mode="basic"
            chooseLabel={uploadedPhotos[i] ? "Change" : "Choose File"}
            cancelLabel="Clear"
            onSelect={handleSelect(i)}
            onRemove={handleRemove(i)}
            customUpload // prevents auto POST
            uploadHandler={() => {}} // noop
            style={{ width: '100%' }}
          />
          {uploadedPhotos[i] && (
            <small className="mt-1 text-sm text-gray-600">
              {uploadedPhotos[i]?.name} ({Math.round((uploadedPhotos[i]!.size / 1024))} KB)
            </small>
          )}
        </div>
      ))}
      <Toast ref={toast} />
    </div>
  );
};

export default UploadPhotoStep;