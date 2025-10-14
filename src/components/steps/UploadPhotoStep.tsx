import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { ProgressBar } from "primereact/progressbar";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Tooltip } from "primereact/tooltip";
import { useRef, useState } from "react";

interface UploadPhotoStepProps {
  uploadedPhotos: File[];
  setUploadedPhotos: React.Dispatch<React.SetStateAction<File[]>>;
}

const UploadPhotoStep: React.FC<UploadPhotoStepProps> = ({
  uploadedPhotos,
  setUploadedPhotos,
}) => {
  const [totalSize, setTotalSize] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileUploadRef = useRef<FileUpload>(null);
  const toast = useRef<any>(null);

  // Flag to control real upload vs local only
  const sendToApi = false; // 👈 Change to true to send to backend

  const onTemplateSelect = (e: any) => {
    let _totalSize = totalSize;
    let files = e.files;
    let errors: string[] = [];

    const validFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name.toLowerCase();
      const isDicom = fileName.endsWith(".dcm");
      const isPng = fileName.endsWith(".png");

      if (!isDicom && !isPng) {
        errors.push(
          `${file.name}: Only DICOM (.dcm) and PNG files are allowed.`
        );
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}: File must be less than 5MB.`);
        continue;
      }

      validFiles.push(file);
      _totalSize += file.size;
    }

    setTotalSize(_totalSize);

    if (errors.length > 0) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: errors.join("\n"),
        life: 4000,
      });
    }

    // Add valid files to state
    setUploadedPhotos((prev) => [...prev, ...validFiles]);
  };

  const onTemplateUpload = async (e: any) => {
    setIsUploading(true);
    setUploadProgress(0);

    toast.current?.show({
      severity: "info",
      summary: "Uploading",
      detail: `${uploadedPhotos.length} file(s) processing...`,
      life: 2000,
    });

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      if (sendToApi) {
        const formData = new FormData();
        uploadedPhotos.forEach((file) => {
          formData.append("files", file);
        });

        // 👇 Replace with your real endpoint
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          setUploadProgress(100);
          toast.current?.show({
            severity: "success",
            summary: "Uploaded",
            detail: "Files sent successfully to server",
            life: 3000,
          });
        } else {
          clearInterval(progressInterval);
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Server upload failed",
            life: 3000,
          });
        }
      } else {
        // Local upload simulation - complete the progress
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setUploadProgress(100);
        toast.current?.show({
          severity: "success",
          summary: "Local Upload",
          detail: "Files stored locally only (not sent to server)",
          life: 3000,
        });
      }
    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Upload Error",
        detail: "Something went wrong during upload.",
        life: 3000,
      });
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
      // Clear the FileUpload component UI
      setTimeout(() => {
        setUploadProgress(0);
        e.options.clear();
      }, 1500);
    }
  };

  const onTemplateRemove = (file: any, callback: () => void) => {
    setUploadedPhotos((prev) => prev.filter((f) => f.name !== file.name));
    setTotalSize(totalSize - file.size);
    callback();
  };

  const onTemplateClear = () => {
    setUploadedPhotos([]);
    setTotalSize(0);
    setUploadProgress(0);
  };

  const headerTemplate = (options: any) => {
    const { className, chooseButton, uploadButton, cancelButton } = options;
    const value = totalSize / 50000;
    const formattedValue =
      fileUploadRef.current?.formatSize(totalSize) || "0 B";

    return (
      <div
        className={className}
        style={{
          backgroundColor: "transparent",
          display: "flex",
          alignItems: "center",
        }}
      >
        {chooseButton}
        {uploadButton}
        {cancelButton}
        <div className="flex align-items-center gap-3 ml-auto">
          <span>{formattedValue} / 5 MB</span>
          <ProgressBar
            value={value}
            showValue={false}
            style={{ width: "10rem", height: "12px" }}
          />
        </div>
      </div>
    );
  };

  const itemTemplate = (file: any, props: any) => {
    const isDicom = file.name.toLowerCase().endsWith(".dcm");

    return (
      <div className="flex align-items-center flex-wrap">
        <div className="flex align-items-center" style={{ width: "40%" }}>
          {isDicom ? (
            <div
              className="flex align-items-center justify-content-center"
              style={{
                width: "100px",
                height: "80px",
                background: "#fafafa",
                borderRadius: 8,
              }}
            >
              <i
                className="pi pi-file"
                style={{ fontSize: "2em", color: "#888" }}
              />
              <span className="ml-2 text-xs text-gray-500">DICOM</span>
            </div>
          ) : (
            <img
              alt={file.name}
              role="presentation"
              src={file.objectURL}
              style={{ width: "100px", borderRadius: 8 }}
            />
          )}
          <span className="flex flex-column text-left ml-3">
            {file.name}
            <small>{new Date().toLocaleDateString()}</small>
          </span>
        </div>
        <Tag
          value={props.formatSize}
          severity="warning"
          className="px-3 py-2"
        />
        <Button
          type="button"
          icon="pi pi-times"
          className="p-button-outlined p-button-rounded p-button-danger ml-auto"
          onClick={() => onTemplateRemove(file, props.onRemove)}
        />
      </div>
    );
  };

  const emptyTemplate = () => (
    <div className="flex align-items-center flex-column">
      <i
        className="pi pi-image mt-3 p-5"
        style={{
          fontSize: "5em",
          borderRadius: "50%",
          backgroundColor: "var(--surface-b)",
          color: "var(--surface-d)",
        }}
      />
      <span
        style={{ fontSize: "1.2em", color: "var(--text-color-secondary)" }}
        className="my-5"
      >
        Drag and Drop DICOM/PNG Here
      </span>
    </div>
  );

  const chooseOptions = {
    icon: "pi pi-fw pi-images",
    iconOnly: true,
    className: "custom-choose-btn p-button-rounded p-button-outlined",
  };
  const uploadOptions = {
    icon: "pi pi-fw pi-cloud-upload",
    iconOnly: true,
    className: "custom-upload-btn p-button-success p-button-rounded p-button-outlined",
    disabled: isUploading || uploadedPhotos.length === 0,
  };
  const cancelOptions = {
    icon: "pi pi-fw pi-times",
    iconOnly: true,
    className: "custom-cancel-btn p-button-danger p-button-rounded p-button-outlined",
  };

  return (
    <div>
      <Toast ref={toast}></Toast>
      <Tooltip
        target=".custom-choose-btn"
        content="Choose"
        position="bottom"
      />
      <Tooltip
        target=".custom-upload-btn"
        content="Upload"
        position="bottom"
      />
      <Tooltip
        target=".custom-cancel-btn"
        content="Clear"
        position="bottom"
      />

      {/* Upload Progress Indicator */}
      {isUploading && (
        <div className="mb-3">
          <div className="flex justify-content-between mb-2">
            <span className="text-sm font-medium">Uploading files...</span>
            <span className="text-sm font-medium">{uploadProgress}%</span>
          </div>
          <ProgressBar
            value={uploadProgress}
            showValue={false}
            style={{ height: "8px" }}
          />
        </div>
      )}

      <FileUpload
        ref={fileUploadRef}
        name="files[]"
        multiple
        accept=".dcm,.png,image/png,application/dicom"
        maxFileSize={5000000}
        customUpload
        uploadHandler={onTemplateUpload}
        mode="advanced"
        auto={false}
        onSelect={onTemplateSelect}
        onError={onTemplateClear}
        onClear={() => {
          setUploadedPhotos([]);
          setTotalSize(0);
          setUploadProgress(0);
        }}
        headerTemplate={headerTemplate}
        itemTemplate={itemTemplate}
        emptyTemplate={emptyTemplate}
        chooseOptions={chooseOptions}
        uploadOptions={uploadOptions}
        cancelOptions={cancelOptions}
        style={{ width: "100%" }}
      />
    </div>
  );
};

export default UploadPhotoStep;