import { useRef, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { Tag } from "primereact/tag";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import type { UserRecord } from "../types";
import { getSeverity, getTagClass } from "../helpers/helper";
import ImageAssessmentDialog from "../components/ImageAssessmentDialog";
import { initialUserRecord } from "../lib/mockData";
import { useNavigate } from "react-router-dom";
// import LocalStoreInspector from "./LocalStoreInspector";

export default function ImageAssessment() {
  const dt = useRef<DataTable<UserRecord[]>>(null);
  const [userRecords, setUserRecords] = useState<UserRecord[]>(initialUserRecord);
  const [selectedUserRecords, setSelectedUserRecords] = useState<UserRecord[]>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [assessmentDialogVisible, setAssessmentDialogVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState<UserRecord | null>(null);
  const navigate = useNavigate();

  const openAssessment = (row: UserRecord) => {
    setSelectedCase(row);
    setAssessmentDialogVisible(true);
     navigate(`/patient-image-assessment/${row.id}`);
  };

  const handleAssessmentComplete = (assessmentData: any) => {
    // Update the status to "Completed" when assessment is saved
    if (selectedCase) {
      setUserRecords((prev) =>
        prev.map((record) =>
          record.id === selectedCase.id
            ? { ...record, status: "Completed" }
            : record
        )
      );
    }
  };

  const clearFilters = () => {
    dt.current?.reset();
    setGlobalFilter("");
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

  return (
    <div>
      <div className="flex items-center justify-between mt-1.5 mb-4">
        <h2 className="text-2xl font-bold">AI Image Assessment</h2>
        <div className="flex flex-col md:flex-row gap-3 lg:items-end lg:justify-end justify-center items-initial mb-4">
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText
              type="search"
              placeholder="Search..."
              value={globalFilter}
              onInput={(e) =>
                setGlobalFilter((e.target as HTMLInputElement).value)
              }
            />
          </IconField>
          <Button
            label="Clear"
            icon="pi pi-filter-slash"
            className="p-button-secondary"
            onClick={clearFilters}
          />
        </div>
      </div>

      <DataTable
        value={userRecords}
        responsiveLayout="scroll"
        className="p-datatable-striped p-datatable-hoverable shadow rounded"
        ref={dt}
        paginator
        rows={10}
        dataKey="id"
        selectionMode="checkbox"
        selection={selectedUserRecords}
        onSelectionChange={(e) => setSelectedUserRecords(e.value)}
        paginatorLeft={
          <span className="text-sm text-gray-600">
            Total Records: {userRecords.length}
          </span>
        }
        paginatorRight={<span />}
        globalFilter={globalFilter}
        tableStyle={{
          minWidth: "50rem",
          maxWidth: "100%",
          overflowX: "auto",
          fontSize: "12px",
        }}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column field="id" header="ID" sortable style={{ minWidth: "3rem" }} />
        <Column field="name" header="Name" sortable style={{ minWidth: "8rem" }} />
        <Column field="age" header="Age" style={{ minWidth: "8rem" }} />
        <Column field="country" header="Country" sortable style={{ minWidth: "8rem" }} />
        <Column field="city" header="City" sortable style={{ minWidth: "8rem" }} />
        <Column field="weight" header="Weight" sortable style={{ minWidth: "8rem" }} />
        <Column field="lenght" header="Lenght" sortable style={{ minWidth: "8rem" }} />
        <Column field="create_date" header="Create Date" sortable style={{ minWidth: "8rem" }} />
        <Column field="modify_date" header="Modify Date" sortable style={{ minWidth: "8rem" }} />
        <Column field="status" header="Status" sortable style={{ minWidth: "8rem" }} body={statusBodyTemplate} />
        <Column
          header="Actions"
          body={(rowData) => (
            <Button
              disabled={rowData.status === "Completed"}
              label={rowData.status === "Completed" ? "Completed" : "Complete"}
              text
              className="p-button-sm"
              onClick={() => openAssessment(rowData)}
            />
          )}
          style={{ minWidth: "8rem" }}
        />
      </DataTable>

      <ImageAssessmentDialog
        visible={assessmentDialogVisible}
        onHide={() => {
          setAssessmentDialogVisible(false);
          setSelectedCase(null);
        }}
        patientId={selectedCase?.id || null}
        onComplete={handleAssessmentComplete}
      />
    </div>
  );
}

