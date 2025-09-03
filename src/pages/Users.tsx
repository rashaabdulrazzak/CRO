import React, { useMemo, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Tag } from "primereact/tag";
// ===== Types =====
export type User = {
  id: number;
  name: string;
  surname?: string;
  email: string;
  phoneNumber?: string;
  role: string;
  createdby?: string;
  createddate?: string;
  modifiedby?: string;
  modifiedon?: string;
  status: string;
};

// ===== Options =====
const roleOptions = [
  { label: "Default", value: "Default" },
  { label: "Developer Role", value: "Developer Role" },
  { label: "Tester Role", value: "Tester Role" },
  { label: "Admin", value: "Admin" },
  { label: "User", value: "User" },
];

const statusOptions = [
  { label: "Active", value: "Active" },
  { label: "Passive", value: "Passive" },
];

// ===== Dummy data (5 users) =====
const defaultUsers: User[] = [
  {
    id: 1,
    name: "Alice",
    surname: "Johnson",
    email: "alice.johnson@example.com",
    phoneNumber: "+1-555-123-4567",
    role: "Admin",
    createdby: "system",
    createddate: "2023-05-01T10:15:00Z",
    modifiedby: "system",
    modifiedon: "2023-05-01T10:15:00Z",
    status: "Active",
  },
  {
    id: 2,
    name: "Bob",
    surname: "Smith",
    email: "bob.smith@example.com",
    phoneNumber: "+1-555-987-6543",
    role: "Developer Role",
    createdby: "Alice",
    createddate: "2023-06-10T12:30:00Z",
    modifiedby: "Alice",
    modifiedon: "2023-06-15T08:45:00Z",
    status: "Active",
  },
  {
    id: 3,
    name: "Charlie",
    surname: "Brown",
    email: "charlie.brown@example.com",
    role: "Tester Role",
    createdby: "Bob",
    createddate: "2023-07-20T09:00:00Z",
    modifiedby: "Bob",
    modifiedon: "2023-07-22T14:20:00Z",
    status: "Passive",
  },
  {
    id: 4,
    name: "Diana",
    surname: "Miller",
    email: "diana.miller@example.com",
    phoneNumber: "+1-555-246-8101",
    role: "User",
    createdby: "Charlie",
    createddate: "2023-08-05T16:10:00Z",
    modifiedby: "Charlie",
    modifiedon: "2023-08-08T11:25:00Z",
    status: "Active",
  },
  {
    id: 5,
    name: "Ethan",
    surname: "Williams",
    email: "ethan.williams@example.com",
    role: "Default",
    createdby: "Diana",
    createddate: "2023-09-01T08:00:00Z",
    modifiedby: "Diana",
    modifiedon: "2023-09-03T13:40:00Z",
    status: "Passive",
  },
];

// ===== Utilities =====
const coalesceId = (arr: User[]) => (arr.length ? Math.max(...arr.map((u) => u.id)) + 1 : 1);
const nowIso = () => new Date().toISOString().slice(0, 19) + "Z";

// ===== Component =====
const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  // Filters (row under title)
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const clearFilters = () => {
    setGlobalFilter("");
    setRoleFilter(null);
    setStatusFilter(null);
  };

  // Pagination state to control current page/rows
  const [first, setFirst] = useState(0); // index of first record in the current page
  const [rows, setRows] = useState(10); // rows per page
  const onPage = (e: any) => {
    setFirst(e.first);
    setRows(e.rows);
  };

  // Derived filtered list
  const filteredUsers = useMemo(() => {
    const q = globalFilter.trim().toLowerCase();
    return users.filter((u) => {
      const matchesGlobal =
        !q ||
        [
          u.id,
          u.name,
          u.surname,
          u.email,
          u.phoneNumber,
          u.role,
          u.status,
          u.createdby,
          u.createddate,
          u.modifiedby,
          u.modifiedon,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchesRole = !roleFilter || u.role === roleFilter;
      const matchesStatus = !statusFilter || u.status === statusFilter;

      return matchesGlobal && matchesRole && matchesStatus;
    });
  }, [users, globalFilter, roleFilter, statusFilter]);

  const currentPage = Math.max(1, Math.floor(first / rows) + 1);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rows));
  const getSeverity = (status:string) => {
        switch (status) {
            case 'Passive':
                return 'warning';

            case 'Active':
                return 'success';
        }
    };
    const getTagClass = (status: string) => {
    switch (status) {
        case 'Passive':
            return 'warning-tag';
        case 'Active':
            return 'success-tag';
    }
};
      const statusBodyTemplate = (rowData:User) => {
        return <Tag className={`predict-tag ${getTagClass(rowData.status)}`} value={rowData.status} severity={getSeverity(rowData.status)} />;
    };
  const openNew = () => {
    setEditingUser({
      id: coalesceId(users),
      name: "",
      surname: "",
      email: "",
      phoneNumber: "",
      role: "User",
      createdby: "system",
      createddate: nowIso(),
      modifiedby: "system",
      modifiedon: nowIso(),
      status: "Active",
    });
    setIsEdit(false);
    setDialogVisible(true);
  };

  const openEdit = (user: User) => {
    setEditingUser({ ...user });
    setIsEdit(true);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setEditingUser(null);
  };

  const saveUser = () => {
    if (!editingUser) return;
    const toSave: User = {
      ...editingUser,
      modifiedby: isEdit ? "editor" : editingUser.createdby || "system",
      modifiedon: nowIso(),
    };

    if (isEdit) {
      setUsers((prev) => prev.map((u) => (u.id === toSave.id ? toSave : u)));
    } else {
      setUsers((prev) => [...prev, toSave]);
    }
    hideDialog();
  };

  const deleteUser = (user: User) => {
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  const actionBodyTemplate = (rowData: User) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-text p-button-sm edit-btn"
        onClick={() => openEdit(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-text p-button-sm p-button-danger"
        onClick={() => deleteUser(rowData)}
      />
    </div>
  );

  return (
    <div>
      {/* Title + Add */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl font-bold">Users</h2>
        <Button label="Add User" className="add-btn" icon="pi pi-plus" onClick={openNew} />
      </div>

      {/* Search / Filter row (small controls + Clear) */}
     <div className="flex flex-col md:flex-row gap-3 lg:items-end lg:justify-end justify-center items-initial mb-4">
        <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                 <InputText type="search" placeholder="Search..." onInput={(e) => {const target = e.target as HTMLInputElement; setGlobalFilter(target.value);}}  />
        </IconField>
     
        <Button
          label="Clear"
          icon="pi pi-filter-slash"
          className="p-button-secondary p-button-sm"
          onClick={clearFilters}
        />
      </div>

      {/* Table */}
      <DataTable
        value={filteredUsers}
        className="shadow rounded-lg"
        paginator
        first={first}
        rows={rows}
        onPage={onPage}
        rowsPerPageOptions={[5, 10, 20, 50]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        paginatorLeft={<span className="text-sm">Total {filteredUsers.length} items</span>}
        paginatorRight={<span className="text-sm">{currentPage} of {totalPages} page</span>}
        emptyMessage="No users found"
        sortMode="multiple"
        tableStyle={{ minWidth: "50rem" , maxWidth: "100%", overflowX: "auto" , fontSize: "12px"}}
        responsiveLayout="scroll"
      >
        <Column field="id" header="ID" sortable style={{ width: 90 }} />
        <Column field="name" header="Name" sortable />
        <Column field="surname" header="Surname" sortable />
        <Column field="email" header="Email" sortable />
        <Column field="phoneNumber" header="Phone" sortable />
        <Column field="role" header="Role" sortable />
        <Column field="createdby" header="Created By" sortable />
        <Column field="createddate" header="Created Date" sortable />
        <Column field="modifiedby" header="Modified By" sortable />
        <Column field="modifiedon" header="Modified On" sortable />
         <Column field="status" header="Status" body={statusBodyTemplate} sortable />
        <Column body={actionBodyTemplate} header="Actions" style={{ width: 150 }} />
      </DataTable>

      {/* Dialog */}
      <Dialog
        header={isEdit ? "Edit User" : "Add User"}
        visible={dialogVisible}
        style={{ width: "520px", maxWidth: "95vw" }}
        modal
        position="center"
        appendTo={document.body}
        draggable={false}
        onHide={hideDialog}
      >
        <div className="p-fluid grid formgrid">
          <div className="field col-12 md:col-6">
            <label htmlFor="name">Name</label>
            <InputText
              id="name"
              value={editingUser?.name || ""}
              onChange={(e) => setEditingUser((u) => (u ? { ...u, name: e.target.value } : u))}
            />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="surname">Surname</label>
            <InputText
              id="surname"
              value={editingUser?.surname || ""}
              onChange={(e) => setEditingUser((u) => (u ? { ...u, surname: e.target.value } : u))}
            />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              value={editingUser?.email || ""}
              onChange={(e) => setEditingUser((u) => (u ? { ...u, email: e.target.value } : u))}
            />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="phone">Phone</label>
            <InputText
              id="phone"
              value={editingUser?.phoneNumber || ""}
              onChange={(e) => setEditingUser((u) => (u ? { ...u, phoneNumber: e.target.value } : u))}
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="role">Role</label>
            <Dropdown
              id="role"
              value={editingUser?.role || "User"}
              options={roleOptions}
              onChange={(e) => setEditingUser((u) => (u ? { ...u, role: e.value } : u))}
              placeholder="Select a Role"
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="status">Status</label>
            <Dropdown
              id="status"
              value={editingUser?.status || "Active"}
              options={statusOptions}
              onChange={(e) => setEditingUser((u) => (u ? { ...u, status: e.value } : u))}
              placeholder="Select Status"
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="createdby">Created By</label>
            <InputText
              id="createdby"
              value={editingUser?.createdby || ""}
              onChange={(e) => setEditingUser((u) => (u ? { ...u, createdby: e.target.value } : u))}
            />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="createddate">Created Date (ISO)</label>
            <InputText
              id="createddate"
              placeholder="YYYY-MM-DDTHH:mm:ssZ"
              value={editingUser?.createddate || ""}
              onChange={(e) => setEditingUser((u) => (u ? { ...u, createddate: e.target.value } : u))}
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="modifiedby">Modified By</label>
            <InputText
              id="modifiedby"
              value={editingUser?.modifiedby || ""}
              onChange={(e) => setEditingUser((u) => (u ? { ...u, modifiedby: e.target.value } : u))}
            />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="modifiedon">Modified On (ISO)</label>
            <InputText
              id="modifiedon"
              placeholder="YYYY-MM-DDTHH:mm:ssZ"
              value={editingUser?.modifiedon || ""}
              onChange={(e) => setEditingUser((u) => (u ? { ...u, modifiedon: e.target.value } : u))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button label="Save" icon="pi pi-check" className="p-button-sm save-btn" onClick={saveUser} />
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-sm p-button-secondary cancel-btn"
            onClick={hideDialog}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default Users;
