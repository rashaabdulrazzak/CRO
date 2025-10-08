import { useRef, useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { AddNewPredictDialog } from "../components/AddNewPredictDialog";
import ActionDialog from "../components/ActionDialog";
import { defaultQConfig } from "../constants/constant";
import "primereact/resources/primereact.min.css";
import { useAuth } from '../components/AuthContext';
import type { UserRecord, ActionDialogPayload } from "../types";
import { initialUserRecord } from "../lib/mockData";
import { getTagClass,getSeverity } from "../helpers/helper";



// Helper to get patients from localStorage
const getPatientsFromStorage = (): UserRecord[] => {
  try {
    const patients = localStorage.getItem("app.patients");
    const cases = localStorage.getItem("app.cases");
    const forms = localStorage.getItem("app.forms");
    
    if (!patients) return [];
    
    const patientList = JSON.parse(patients);
    const caseList = cases ? JSON.parse(cases) : [];
    const formList = forms ? JSON.parse(forms) : [];
    
    // Map localStorage data to UserRecord format
    return patientList.map((patient: any) => {
      // Find associated case
      const patientCase = caseList.find((c: any) => c.patientId === patient.id);
      
      // Find associated form
      const patientForm = patientCase 
        ? formList.find((f: any) => f.caseId === patientCase.id && f.type === "CRF01-visit")
        : null;
      
      const formData = patientForm?.data || {};
      
      return {
        id: patient.code || patient.id.toString(),
        name: patient.name,
        age: patient.age || 0,
        country: "Turkey", // Default value since not collected in form
        city: "Istanbul",  // Default value since not collected in form
        weight: parseFloat(formData.weight) || 0,
        lenght: parseFloat(formData.size) || 0,
        create_date: new Date(patient.createdAt).toISOString().split('T')[0],
        modify_date: new Date(patient.createdAt).toISOString().split('T')[0],
        status: patientCase ? "in Progress" : "to do",
      };
    });
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return [];
  }
};

export default function PredictData() {
  const dt = useRef<DataTable<UserRecord[]>>(null);
  const { user } = useAuth();

  // Initialize with localStorage data + initial mock data
  const [recentUserRecord, setRecentUserRecord] = useState<UserRecord[]>(() => {
    const storedPatients = getPatientsFromStorage();
    return [...initialUserRecord, ...storedPatients];
  });

  const [selectedUserRecords, setSelectedUserRecords] = useState<UserRecord[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [actionDialogVisible, setActionDialogVisible] = useState(false);
  const [actionTarget, setActionTarget] = useState<UserRecord | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedPatients = getPatientsFromStorage();
      setRecentUserRecord([...initialUserRecord, ...storedPatients]);
    };

    // Custom event listener for same-tab updates
    window.addEventListener('localStorageUpdate', handleStorageChange);
    
    // Standard storage event for cross-tab updates
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('localStorageUpdate', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Refresh data on component mount
  useEffect(() => {
    const storedPatients = getPatientsFromStorage();
    setRecentUserRecord([...initialUserRecord, ...storedPatients]);
  }, []);

  const clearFilters = () => {
    dt.current?.reset();
    setGlobalFilter("");
  };

  // Open new record dialog
  const openNew = () => {
    setDialogVisible(true);
  };

  // Refresh data when dialog closes
  const handleDialogClose = () => {
    setDialogVisible(false);
    
    // Refresh table data from localStorage
    const storedPatients = getPatientsFromStorage();
    setRecentUserRecord([...initialUserRecord, ...storedPatients]);
  };



  const statusBodyTemplate = (rowData: UserRecord) => {
    return (
      <Tag
        className={`predict-tag ${getTagClass(rowData.status)}`}
        value={rowData.status}
        severity={getSeverity(rowData.status)}
      />
    );
  };

  const handleActionSubmit = (payload: ActionDialogPayload) => {
    console.log("Submit payload:", payload);
    setActionDialogVisible(false);
    setActionTarget(null);
  };

  const handleActionCancel = () => {
    setActionDialogVisible(false);
    setActionTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mt-1.5 mb-4">
        <h2 className="text-2xl font-bold">Trial Cases</h2>
        <Button
          label="Add New Trial Case"
          className="add-btn"
          icon="pi pi-plus"
          onClick={openNew}
        />
      </div>

      {/* Search / Filter row */}
      <div className="flex flex-col md:flex-row gap-3 lg:items-end lg:justify-end justify-center items-initial mb-4">
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            type="search"
            placeholder="Search..."
            value={globalFilter}
            onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
          />
        </IconField>
        <Button
          label="Clear"
          icon="pi pi-filter-slash"
          className="p-button-secondary"
          onClick={clearFilters}
        />
      </div>

      <DataTable
        value={recentUserRecord}
        responsiveLayout="scroll"
        className="p-datatable-striped p-datatable-hoverable shadow rounded"
        ref={dt}
        paginator
        rows={10}
        dataKey="id"
        selectionMode="checkbox"
        selection={selectedUserRecords}
        onSelectionChange={(e) => setSelectedUserRecords(e.value)}
        globalFilter={globalFilter}
        paginatorLeft={
          <span className="text-sm text-gray-600">
            Total Records: {recentUserRecord.length}
          </span>
        }
        paginatorRight={<span />}
        tableStyle={{
          minWidth: "50rem",
          maxWidth: "100%",
          overflowX: "auto",
          fontSize: "12px",
        }}
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
        />

        <Column 
          field="id" 
          header="ID" 
          sortable 
          filter
          filterPlaceholder="Search by ID"
          style={{ minWidth: "3rem" }} 
        />
        <Column
          field="name"
          header="Name"
          sortable
          filter
          filterPlaceholder="Search by name"
          style={{ minWidth: "8rem" }}
        />
        <Column 
          field="age" 
          header="Age" 
          sortable
          filter
          filterPlaceholder="Search by age"
          style={{ minWidth: "8rem" }} 
        />
        <Column
          field="country"
          header="Country"
          sortable
          filter
          filterPlaceholder="Search by country"
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="city"
          header="City"
          sortable
          filter
          filterPlaceholder="Search by city"
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="weight"
          header="Weight"
          sortable
          filter
          filterPlaceholder="Search by weight"
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="lenght"
          header="Length"
          sortable
          filter
          filterPlaceholder="Search by length"
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="create_date"
          header="Create Date"
          sortable
          filter
          filterPlaceholder="Search by date"
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="modify_date"
          header="Modify Date"
          sortable
          filter
          filterPlaceholder="Search by date"
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="status"
          header="Status"
          sortable
          filter
          filterPlaceholder="Search by status"
          style={{ minWidth: "8rem" }}
          body={statusBodyTemplate}
        />
      </DataTable>

      <ActionDialog
        visible={actionDialogVisible}
        target={actionTarget ?? undefined}
        onSubmit={handleActionSubmit}
        onCancel={handleActionCancel}
        qConfig={defaultQConfig}
        width="48rem"
      />

      <AddNewPredictDialog
        visible={dialogVisible}
        onHide={handleDialogClose}
        currentRole={user?.role || "field_coordinator"}
      />
    </div>
  );
}
