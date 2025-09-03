import React, { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

type Canvas = {
    id: number;
    name: string;
    user: string;
    lastModified: string;
};

const users = ['John Doe', 'Jane Smith', 'Alice Johnson'];

const initialCanvases: Canvas[] = [
    { id: 1, name: 'Canvas One', user: 'John Doe', lastModified: '2024-06-01' },
    { id: 2, name: 'Canvas Two', user: 'Jane Smith', lastModified: '2024-06-02' },
    { id: 3, name: 'Canvas Three', user: 'Alice Johnson', lastModified: '2024-06-03' },
];

const Canvases: React.FC = () => {
    const [canvases, setCanvases] = useState<Canvas[]>(initialCanvases);
    const [selectedCanvas, setSelectedCanvas] = useState<Canvas | null>(null);
    const [editDialog, setEditDialog] = useState(false);
    const [addDialog, setAddDialog] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const dt = useRef<DataTable<Canvas[]>>(null);


    const openEditDialog = (canvas: Canvas) => {
        setSelectedCanvas({ ...canvas });
        setEditDialog(true);
    };

    const hideDialog = () => {
        setEditDialog(false);
        setAddDialog(false);
        setSelectedCanvas(null);
    };

    const handleDelete = (canvas: Canvas) => {
        if (window.confirm(`Are you sure you want to delete "${canvas.name}"?`)) {
            setCanvases(canvases.filter(c => c.id !== canvas.id));
        }
    };

    const saveCanvas = () => {
        if (selectedCanvas) {
            if (editDialog) {
                setCanvases(canvases.map(c => c.id === selectedCanvas.id ? selectedCanvas : c));
            } else if (addDialog) {
                setCanvases([...canvases, { ...selectedCanvas, id: Math.max(...canvases.map(c => c.id)) + 1 }]);
            }
        }
        hideDialog();
    };

    const resetFilters = () => {
        setGlobalFilter('');
        dt.current?.reset();
    };

    const actionBodyTemplate = (rowData: Canvas) => (
        <div className="flex gap-2">
            <Button 
                icon="pi pi-pencil" 
                className="p-button-rounded p-button-info p-button-edit p-button-sm "
                onClick={() => openEditDialog(rowData)} 
            />
            <Button 
                icon="pi pi-trash" 
                className="p-button-rounded p-button-danger p-button-delete  p-button-sm"
                onClick={() => handleDelete(rowData)} 
            />
        </div>
    );

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Canvases</h2>
                <Button 
                    label="Add Canvas" 
                    icon="pi pi-plus" 
                    className="p-button-sm p-button-primary add-btn"
                    onClick={() => {
                        setSelectedCanvas({ id: 0, name: '', user: '', lastModified: new Date().toISOString().slice(0,10) });
                        setAddDialog(true);
                    }}
                />
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                {/* Global Search + Reset */}
                <div className="mb-4 flex gap-2">
                    <span className="p-input-icon-left flex-grow">
                        <i className="pi pi-search" />
                        <InputText
                            type="search"
                            placeholder="Search canvases"
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="w-full"
                        />
                    </span>
                    <Button 
                        label="Reset Filters" 
                        icon="pi pi-filter-slash" 
                        className="p-button-sm p-button-secondary"
                        onClick={resetFilters} 
                    />
                </div>

               <DataTable<Canvas[]>
                    ref={dt}
                    value={canvases}
                    className="p-datatable-gridlines p-datatable-hoverable"
                    responsiveLayout="scroll"
                    rowHover
                    stripedRows
                    paginator
                    rows={5}
                    globalFilter={globalFilter}
                >

            
                    <Column field="id" header="ID" sortable />
                    <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" />
                    <Column field="user" header="User" sortable filter filterPlaceholder="Filter by user" />
                    <Column field="lastModified" header="Last Modified" sortable filter filterPlaceholder="Filter by date" />
                    <Column header="Actions" body={actionBodyTemplate} />
                </DataTable>
            </div>

            {/* Add/Edit Modal */}
            <Dialog 
                header={editDialog ? "Edit Canvas" : "Add Canvas"} 
                visible={editDialog || addDialog} 
                style={{ width: '400px' }} 
                modal 
                onHide={hideDialog}
                className="rounded-xl"
            >
                {selectedCanvas && (
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label>Name</label>
                            <InputText 
                                value={selectedCanvas.name} 
                                onChange={(e) => setSelectedCanvas({ ...selectedCanvas, name: e.target.value })} 
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label>User</label>
                            <Dropdown 
                                value={selectedCanvas.user} 
                                options={users} 
                                onChange={(e) => setSelectedCanvas({ ...selectedCanvas, user: e.value })} 
                                placeholder="Select a user" 
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label>Last Modified</label>
                            <Calendar 
                                value={new Date(selectedCanvas.lastModified)}
                                onChange={(e) => setSelectedCanvas({ ...selectedCanvas, lastModified: (e.value as Date).toISOString().slice(0,10) })}
                                dateFormat="yy-mm-dd"
                                className="w-full"
                            />
                        </div>

                        {/* Save & Cancel Buttons */}
                        <div className="flex justify-content-end mt-4">
                            <Button 
                                label="Save" 
                                icon="pi pi-check" 
                                className="p-button-sm save-btn mr-2" 
                                onClick={saveCanvas} 
                            />
                            <Button 
                                label="Cancel" 
                                icon="pi pi-times"
                                className="p-button-sm cancel-btn"  
                                onClick={hideDialog} 
                            />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default Canvases;
