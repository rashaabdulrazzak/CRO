import React from 'react';
import { Dialog } from 'primereact/dialog';
import MedicalImageViewer from './MedicalImageViewer';
import { Button } from 'primereact/button';

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
      dismissableMask
      footer={
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    label="Close"
                    icon="pi pi-times"
                    onClick={onHide}
                    className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  />
                 
                </div>
              }
    >
      <div className="flex justify-center items-center p-4" style={{ minHeight: '600px' }}>
        {visible && ( 
          <MedicalImageViewer
            imageUrl={imageUrl}
            isDicom={isDicom}
            width="100%"
            height="600px"
          />
        )}
      </div>
    </Dialog>
  );
};

export default ImagePreviewDialog;
