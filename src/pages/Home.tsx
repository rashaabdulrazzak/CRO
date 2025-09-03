import { useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import StatCard from "../components/StatCard";
import { Tag } from "primereact/tag";

type UserRecord = {
  id: string | number;
  name: string;
  age: number;
  country: string;
  city: string;
  weight: number;
  lenght: number;
  create_date: string;
  modify_date: string;
  status: string;
};

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
    status: "Active",
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
    status: "Ongoing",
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
    status: "On Hold",
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

export default function UserRecordTable() {
    const dt = useRef<DataTable<UserRecord[]>>(null); // ref to DataTable

  const [recentUserRecord, setRecentUserRecord] =
    useState<UserRecord[]>(initialUserRecord);
    const [selectedUserRecords, setSelectedUserRecords] = useState<UserRecord[]>([]);

const [ageOrder, setAgeOrder] = useState<1 | -1>(1);
const [dateOrder, setDateOrder] = useState<1 | -1>(1);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
const cards = [
 
  {
    bgHex: "#FCF1F7",
    icon: "pi pi-calendar",
    emptyState: true,
    title: "No Task Today",
    subtitle: "There is no task today yet.",
    value: "",
    label: "",
  },
   {
    bgHex: "#EAF4FE",
    icon: "pi pi-users",
    value: "1.391",
    label: "Total Predict",
    delta: "-%23",
    deltaDirection: "down" as const, // ✅ literal
  },
  {
    bgHex: "#F5F4FE",
    icon: "pi pi-users",
    value: "7.933",
    label: "Total Data",
    delta: "+%23",
    deltaDirection: "up" as const, // ✅ literal
    accentHex: "#2563EB",
  },
] as const;


  
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
};

const clearFilters = () => {
  // If you use PrimeReact column filters/sorting, this resets them:
  dt.current?.reset();
};
  const [form, setForm] = useState<UserRecord>({
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
  });

  // open new record dialog
  const openNew = () => {
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
    setIsEdit(false);
    setDialogVisible(true);
  };

  // edit existing record
  const openEdit = (UserRecord: UserRecord) => {
    setForm(UserRecord);
    setIsEdit(true);
    setDialogVisible(true);
  };

  const saveUserRecord = () => {
    if (isEdit) {
      setRecentUserRecord((prev) =>
        prev.map((a) => (a.id === form.id ? form : a))
      );
    } else {
      setRecentUserRecord((prev) => [...prev, form]);
    }
    setDialogVisible(false);
  };

  const deleteUserRecord = (UserRecord: UserRecord) => {
    setRecentUserRecord((prev) => prev.filter((a) => a.id !== UserRecord.id));
  };

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
  );
  const getSeverity = (status:string) => {
        switch (status) {
            case 'On Hold':
                return 'danger';

            case 'Completed':
                return 'success';

            case 'Active':
                return 'info';

            case 'Ongoing':
                return 'warning';

            case 'renewal':
                return null;
        }
    };
      const statusBodyTemplate = (rowData:UserRecord) => {
        return <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;
    };
  return (
    <div >
        <div className="my-2">
           <h3 className="text-2xl font-semibold ">Summary</h3>
        </div>
        
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
  {cards.map((c, i) => (
    <StatCard key={i} {...c} />
  ))}
</div>
      
      <div className="flex items-center justify-between mt-8 mb-4">
    {/* Left: Title */}
    <h2 className="text-2xl font-bold">Recent Records</h2>

    {/* Right: Buttons */}
    <div className="flex gap-2">
      <Button
        label="Sort Age"
        icon="pi pi-sort-numeric-down"
        className="p-button-sm p-button-outlined text-gray-400"
        onClick={() => sortBy("age")}
      />
      <Button
        label="Sort Date"
        icon="pi pi-calendar"
        className="p-button-sm p-button-outlined text-gray-400"
        onClick={() => sortBy("create_date")}
      />
      <Button
        label="Clear Filters"
        icon="pi pi-filter-slash"
        className="p-button-sm p-button-outlined text-gray-400"
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
       dataKey="id" selectionMode="checkbox" selection={selectedUserRecords} onSelectionChange={(e) => setSelectedUserRecords(e.value)}
        paginatorLeft={
        <span className="text-sm text-gray-600">
        Total Records: {recentUserRecord.length}

        </span>
    }
    paginatorRight={<span />} 
    tableStyle={{ minWidth: "50rem" , maxWidth: "100%", overflowX: "auto" , fontSize: "12px"}}
      >
         <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>

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

        {/* ✅ Actions column with PrimeReact Buttons */}
        <Column
          header="Actions"
          body={(rowData) => (
            <div className="flex gap-2">
              <Button
                icon="pi pi-pencil"
                className="p-button-sm p-button-rounded p-button-warning edit-btn"
                onClick={() => openEdit(rowData)}
                tooltip="Edit"
              />
              <Button
                icon="pi pi-trash"
                className="p-button-sm p-button-rounded p-button-danger delete-btn"
                onClick={() => deleteUserRecord(rowData)}
                tooltip="Delete"
              />
            </div>
          )}
          style={{ minWidth: "8rem" }}
        />
      </DataTable>

      {/* Dialog for Add/Edit */}
      <Dialog
        header={isEdit ? "Edit UserRecord" : "Add UserRecord"}
        visible={dialogVisible}
        style={{ width: "40vw" }}
        footer={dialogFooter}
        onHide={() => setDialogVisible(false)}
      >
        <div className="flex flex-col gap-4">
          <span className="p-float-label">
            <InputText
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full"
            />
            <label htmlFor="name">Name</label>
          </span>
          <span className="p-float-label">
            <InputText
              id="age"
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
              className="w-full"
            />
            <label htmlFor="age">Age</label>
          </span>
          <span className="p-float-label">
            <InputText
              id="country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full"
            />
            <label htmlFor="country">Country</label>
          </span>
          <span className="p-float-label">
            <InputText
              id="city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full"
            />
            <label htmlFor="city">City</label>
          </span>
          <span className="p-float-label">
            <InputText
              id="weight"
              type="number"
              value={form.weight}
              onChange={(e) =>
                setForm({ ...form, weight: Number(e.target.value) })
              }
              className="w-full"
            />
            <label htmlFor="weight">Weight</label>
          </span>
          <span className="p-float-label">
            <InputText
              id="lenght"
              type="number"
              value={form.lenght}
              onChange={(e) =>
                setForm({ ...form, lenght: Number(e.target.value) })
              }
              className="w-full"
            />
            <label htmlFor="lenght">Length</label>
          </span>
          <span className="p-float-label">
            <InputText
              id="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full"
            />
            <label htmlFor="status">Status</label>
          </span>
        </div>
      </Dialog>
    </div>
  );
}
