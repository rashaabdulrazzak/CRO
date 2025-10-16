import React from 'react';
import { Dialog } from 'primereact/dialog';
import MedicalImageViewer from './MedicalImageViewer';

interface ImagePreviewDialogProps {
  visible: boolean;
  onHide: () => void;
  imageUrl: string;
  isDicom: boolean;
  imageTitle?: string;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  visible,
  onHide,
  imageUrl,
  isDicom,
  imageTitle = 'Medical Image Preview',
}) => {
  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={imageTitle}
      style={{ width: '80vw', maxWidth: '1000px' }}
      breakpoints={{ '960px': '90vw', '641px': '95vw' }}
      modal
    >
      <div className="flex justify-center items-center p-4">
        <MedicalImageViewer
          imageUrl={imageUrl}
          isDicom={isDicom}
          width="100%"
          height="600px"
        />
      </div>
    </Dialog>
  );
};

export default ImagePreviewDialog;
