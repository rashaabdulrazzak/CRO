import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

type Canvases = {
    id: number;
    title: string;
    created: string;
    status: string;
};



const initialCanvases: Canvases[] = [
    { id: 1, title: 'Canvas One', created: '2024-06-01', status: 'Active' },
    { id: 2, title: 'Canvas Two', created: '2024-06-02', status: 'Inactive' },
    { id: 3, title: 'Canvas Three', created: '2024-06-03', status: 'Rejected' }
];

const statuses = ['Active', 'Inactive', 'Pending', 'Rejected'];

const Downloads: React.FC = () => {
    const [canvases, setCanvases] = useState<Canvases[]>(initialCanvases);
    const [editDialog, setEditDialog] = useState(false);
    const [selectedCanvas, setSelectedCanvas] = useState<Canvases | null>(null);

    const getSeverity = (status: string) => {
        switch (status) {
            case 'Rejected': return 'danger';
            case 'Active': return 'success';
            case 'Pending': return 'info';
            case 'Inactive': return 'warning';
            default: return undefined;
        }
    };

    const statusBodyTemplate = (rowData: Canvases) => {
        return <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;
    };

    const actionBodyTemplate = (rowData: Canvases) => (
        <div className="flex gap-2">
            <Button 
                icon="pi pi-pencil" 
                className="p-button-text p-button-sm edit-btn mr-2" 
                onClick={() => openEditDialog(rowData)} 
            />
            <Button 
                icon="pi pi-trash" 
                className="p-button-text p-button-sm p-button-danger"
                onClick={() => handleDelete(rowData)} 
            />
        </div>
    );

    const openEditDialog = (canvas: Canvases) => {
        setSelectedCanvas({ ...canvas });
        setEditDialog(true);
    };

    const handleDelete = (rowData: Canvases) => {
        if (window.confirm(`Are you sure you want to delete "${rowData.title}"?`)) {
            setCanvases(canvases.filter(c => c.id !== rowData.id));
        }
    };

    const handleSave = () => {
        if (selectedCanvas) {
            setCanvases(canvases.map(c => c.id === selectedCanvas.id ? selectedCanvas : c));
        }
        setEditDialog(false);
        setSelectedCanvas(null);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* User Info */}
         

            {/* Downloads Table */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Downloads List</h2>
                <DataTable 
                    value={canvases} 
                    className=" p-datatable-hoverable" 
                    responsiveLayout="scroll"
                    rowHover
                    stripedRows
                    paginator
                    rows={5}
                >
                    <Column field="id" header="ID" className="rounded-l-lg" sortable />
                    <Column 
                        field="title" 
                        header="Title" 
                        sortable 
                        filter 
                        filterPlaceholder="Search by title"
                    />
                    <Column 
                        field="created" 
                        header="Created" 
                        sortable 
                        filter 
                        filterPlaceholder="Search by date"
                    />
                    <Column 
                        field="status" 
                        header="Status" 
                        body={statusBodyTemplate} 
                        sortable 
                        filter 
                        filterElement={
                            <Dropdown 
                                value={null} 
                                options={statuses} 
                                onChange={() => {}} 
                                placeholder="Filter by status"
                                className="p-column-filter"
                            />
                        }
                    />
                    <Column header="Actions" body={actionBodyTemplate} className="rounded-r-lg" />
                </DataTable>
            </div>

            {/* Edit Modal */}
            <Dialog 
                header="Edit Canvas" 
                visible={editDialog} 
                style={{ width: '400px' }} 
                modal 
                onHide={() => setEditDialog(false)}
                className="rounded-xl"
            >
                {selectedCanvas && (
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label>Title</label>
                            <InputText 
                                value={selectedCanvas.title} 
                                onChange={(e) => setSelectedCanvas({ ...selectedCanvas, title: e.target.value })} 
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label>Status</label>
                            <Dropdown 
                                value={selectedCanvas.status} 
                                options={statuses} 
                                onChange={(e) => setSelectedCanvas({ ...selectedCanvas, status: e.value })} 
                                placeholder="Select a status" 
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button label="Cancel" icon="pi pi-times" className=" p-button-sm save-btn mr-2" onClick={() => setEditDialog(false)} />
                            <Button label="Save" icon="pi pi-check" className="p-button-sm cancel-btn" onClick={handleSave} />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default Downloads;