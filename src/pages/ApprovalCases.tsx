import { useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { Tag } from "primereact/tag";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { AddNewPredictDialog } from "../components/AddNewPredictDialog";
import ActionDialog from "../components/ActionDialog";
import { defaultQConfig } from "../constants/constant";
import { useAuth } from "../components/AuthContext";
import type { UserRecord, ActionDialogPayload } from "../types";
import { getSeverity, getTagClass } from "../helpers/helper";

// Sample Data
const initialUserRecord: UserRecord[] = [
  {
    id: "0237",
    name: "Alice",
    age: 29,
    country: "USA",
    city: "New York",
    weight: 65,
    lenght: 170,
    create_date: "2023-01-01",
    modify_date: "2023-01-10",
    status: "in Progress",
  },
  {
    id: "0238",
    name: "Bob",
    age: 34,
    country: "UK",
    city: "London",
    weight: 80,
    lenght: 180,
    create_date: "2023-02-01",
    modify_date: "2023-02-15",
    status: "to do",
  },
  {
    id: "0239",
    name: "Bob",
    age: 34,
    country: "UK",
    city: "London",
    weight: 80,
    lenght: 180,
    create_date: "2023-02-01",
    modify_date: "2023-02-15",
    status: "in Progress",
  },
  {
    id: "0240",
    name: "Bob",
    age: 34,
    country: "UK",
    city: "London",
    weight: 80,
    lenght: 180,
    create_date: "2023-02-01",
    modify_date: "2023-02-15",
    status: "Completed",
  },
  {
    id: "0238",
    name: "Bob",
    age: 34,
    country: "UK",
    city: "London",
    weight: 80,
    lenght: 180,
    create_date: "2023-02-01",
    modify_date: "2023-02-15",
    status: "Completed",
  },
];

export default function PredictData() {
  const dt = useRef<DataTable<UserRecord[]>>(null); // ref to DataTable
  const { user } = useAuth();
  const recentUserRecord = initialUserRecord; // In real app, fetch this from API

  const [selectedUserRecords, setSelectedUserRecords] = useState<UserRecord[]>(
    []
  );

  // const [ageOrder, setAgeOrder] = useState<1 | -1>(1);
  // const [dateOrder, setDateOrder] = useState<1 | -1>(1);
  const [dialogVisible, setDialogVisible] = useState(false);
  //  const [isEdit, setIsEdit] = useState(false);
  const [actionDialogVisible, setActionDialogVisible] = useState(false);
  const [actionTarget, setActionTarget] = useState<UserRecord | null>(null);
    const [globalFilter, setGlobalFilter] = useState<string>("");



  /*   
    const sortBy = (field: "age" | "create_date") => {
  setRecentUserRecord(prev => {
    const copy = [...prev];
    const order = field === "age" ? ageOrder : dateOrder;

    copy.sort((a, b) => {
      const va = a[field] as unknown as number | string;
      const vb = b[field] as unknown as number | string;

      // normalize dates if needed
      const na = field === "create_date" ? new Date(String(va)).getTime() : Number(va);
      const nb = field === "create_date" ? new Date(String(vb)).getTime() : Number(vb);

      return order === 1 ? na - nb : nb - na;
    });

    // flip order for next click
    if (field === "age") setAgeOrder(o => (o === 1 ? -1 : 1));
    else setDateOrder(o => (o === 1 ? -1 : 1));

    return copy;
  });
}; */

  const clearFilters = () => {
    // If you use PrimeReact column filters/sorting, this resets them:
    dt.current?.reset();
      setGlobalFilter("");
  };
  /*   const [form, setForm] = useState<UserRecord>({
    id: 0,
    name: "",
    age: 0,
    country: "",
    city: "",
    weight: 0,
    lenght: 0,
    create_date: "",
    modify_date: "",
    status: "",
  }); */

  // open new record dialog
  /*const openNew = () => {
     setForm({
      id: Date.now(),
      name: "",
      age: 0,
      country: "",
      city: "",
      weight: 0,
      lenght: 0,
      create_date: new Date().toISOString().split("T")[0],
      modify_date: new Date().toISOString().split("T")[0],
      status: "Active",
    }); 
    //setIsEdit(false);
    setDialogVisible(true);
  };*/

  // edit existing record
  /*   const openEdit = (UserRecord: UserRecord) => {
    setForm(UserRecord);
    setIsEdit(true);
    setDialogVisible(true);
  }; */

  /* const saveUserRecord = () => {
    if (isEdit) {
      setRecentUserRecord((prev) =>
        prev.map((a) => (a.id === form.id ? form : a))
      );
    } else {
      setRecentUserRecord((prev) => [...prev, form]);
    }
    setDialogVisible(false);
  };
 */
  /*   const deleteUserRecord = (UserRecord: UserRecord) => {
    setRecentUserRecord((prev) => prev.filter((a) => a.id !== UserRecord.id));
  }; */
  /*   const exportExcel = () => {
        dt.current?.exportCSV();
    }; */

  /* 
  const dialogFooter = (
    <div>
      <Button
        label="Save"
        icon="pi pi-check"
        onClick={saveUserRecord}
        className="p-button-sm p-button-success mr-2"
      />
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setDialogVisible(false)}
        className="p-button-sm p-button-secondary"
      />
    </div>
  ); */

  const statusBodyTemplate = (rowData: UserRecord) => {
    return (
      <Tag
        className={`predict-tag ${getTagClass(rowData.status)}`}
        value={rowData.status}
        severity={getSeverity(rowData.status)}
      />
    );
  };

  const openAction = (row: UserRecord) => {
    setActionTarget(row);
    setActionDialogVisible(true);
  };

  const handleActionSubmit = (payload: ActionDialogPayload) => {
    // TODO: send payload to your API or update local state
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
        {/* Left: Title */}
        <h2 className="text-2xl font-bold">Approval of Cases</h2>
        {/* <Button label="Add New Case" className="add-btn" icon="pi pi-plus" onClick={openNew} />
         */}{" "}
         {/* Search / Filter row (small controls + Clear) */}
           <div className="flex flex-col md:flex-row gap-3 lg:items-end lg:justify-end justify-center items-initial mb-4">
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText type="search" placeholder="Search..."  value={globalFilter} onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} />

        </IconField>
     
        <Button
          label="Clear"
          icon="pi pi-filter-slash"
          className="p-button-secondary "
          onClick={clearFilters}
        />
      </div>
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
        paginatorLeft={
          <span className="text-sm text-gray-600">
            Total Records: {recentUserRecord.length}
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
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
        ></Column>

        <Column field="id" header="ID" sortable style={{ minWidth: "3rem" }} />
        <Column
          field="name"
          header="Name"
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column field="age" header="Age" style={{ minWidth: "8rem" }} />
        <Column
          field="country"
          header="Country"
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="city"
          header="City"
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="weight"
          header="Weight"
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="lenght"
          header="Lenght"
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="create_date"
          header="Create Date"
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="modify_date"
          header="Modify Date"
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="status"
          header="Status"
          sortable
          style={{ minWidth: "8rem" }}
          body={statusBodyTemplate}
        />

        <Column
          header="Actions"
          body={(rowData) => (
            <Button
              disabled={rowData.status === "Completed"}
              label="Confirm"
              text
              className="p-button-sm"
              
              onClick={() => openAction(rowData)}
            />
          )}
          style={{ minWidth: "8rem" }}
        />
      </DataTable>

      <ActionDialog
        visible={actionDialogVisible}
        target={actionTarget ?? undefined}
        onSubmit={handleActionSubmit}
        onCancel={handleActionCancel}
        qConfig={defaultQConfig} // or pass your own config
        width="48rem" // optional
      />

      <AddNewPredictDialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        currentRole={user?.role || "patolog_coordinator"}
      />
    </div>
  );
}
