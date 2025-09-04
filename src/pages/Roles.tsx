import React, { useMemo, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { AddRoleDialog } from "../components/addRoleDialog";

// ===== Types =====
export type Role = {
  id: number;
  roleName: string;
  status: string;
  createdBy?: string;
  createdOn?: string;
  modifiedBy?: string;
  modifiedOn?: string;
};

// ===== Status Options =====
const statusOptions = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];
// Roles 
// { "Monitor","Biostatistician","Site coordinator","Hekim","Physician","Patolog Hekim"}
// ===== Dummy Data (5 roles) =====
const defaultRoles: Role[] = [
  {
    id: 1,
    roleName: "Monitor",
    status: "Active",
    createdBy: "system",
    createdOn: "2023-05-01T10:15:00Z",
    modifiedBy: "Alice",
    modifiedOn: "2023-06-10T14:20:00Z",
  },
  {
    id: 2,
    roleName: "Biostatistician",
    status: "Active",
    createdBy: "Alice",
    createdOn: "2023-06-10T12:30:00Z",
    modifiedBy: "Bob",
    modifiedOn: "2023-07-22T14:20:00Z",
  },
  {
    id: 3,
    roleName: "Site coordinator",
    status: "Inactive",
    createdBy: "Bob",
    createdOn: "2023-07-20T09:00:00Z",
    modifiedBy: "Charlie",
    modifiedOn: "2023-08-05T11:25:00Z",
  },
  {
    id: 4,
    roleName: "Hekim",
    status: "Active",
    createdBy: "Charlie",
    createdOn: "2023-08-05T16:10:00Z",
    modifiedBy: "Diana",
    modifiedOn: "2023-09-01T08:00:00Z",
  },
  {
    id: 5,
    roleName: "Physician",
    status: "Active",
    createdBy: "Diana",
    createdOn: "2023-09-01T08:00:00Z",
    modifiedBy: "Ethan",
    modifiedOn: "2023-09-03T13:40:00Z",
  },
  {
    id: 6,
    roleName: "Patolog Hekim",
    status: "Active",
    createdBy: "Diana",
    createdOn: "2023-09-01T08:00:00Z",
    modifiedBy: "Ethan",
    modifiedOn: "2023-09-03T13:40:00Z",
  },
];

// ===== Utilities =====
const coalesceId = (arr: Role[]) => (arr.length ? Math.max(...arr.map((r) => r.id)) + 1 : 1);
const nowIso = () => new Date().toISOString();
const formatDate = (isoString: string | undefined) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0]; // YYYY-MM-DD
};

// ===== Component =====
const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  // Filters
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const clearFilters = () => {
    setGlobalFilter("");
    setStatusFilter(null);
  };

  // Pagination
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const onPage = (e: any) => {
    setFirst(e.first);
    setRows(e.rows);
  };

  // Derived filtered list
  const filteredRoles = useMemo(() => {
    const q = globalFilter.trim().toLowerCase();
    return roles.filter((r) => {
      const matchesGlobal =
        !q ||
        [
          r.id,
          r.roleName,
          r.status,
          r.createdBy,
          r.createdOn,
          r.modifiedBy,
          r.modifiedOn,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchesStatus = !statusFilter || r.status === statusFilter;

      return matchesGlobal && matchesStatus;
    });
  }, [roles, globalFilter, statusFilter]);

  const currentPage = Math.max(1, Math.floor(first / rows) + 1);
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / rows));

  const openNew = () => {
    const newId = coalesceId(roles);
    setEditingRole({
      id: newId,
      roleName: "",
      status: "Active",
      createdBy: "system",
      createdOn: nowIso(),
      modifiedBy: "system",
      modifiedOn: nowIso(),
    });
    setIsEdit(false);
    setDialogVisible(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole({ ...role });
    setIsEdit(true);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setEditingRole(null);
  };

  const saveRole = () => {
    if (!editingRole) return;

    const toSave: Role = {
      ...editingRole,
      modifiedBy: isEdit ? "editor" : editingRole.createdBy || "system",
      modifiedOn: nowIso(),
    };

    if (isEdit) {
      setRoles((prev) => prev.map((r) => (r.id === toSave.id ? toSave : r)));
    } else {
      setRoles((prev) => [...prev, toSave]);
    }
    hideDialog();
  };

  const deleteRole = (role: Role) => {
    setRoles((prev) => prev.filter((r) => r.id !== role.id));
  };

  const actionBodyTemplate = (rowData: Role) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-text p-button-sm edit-btn"
        onClick={() => openEdit(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-text p-button-sm p-button-danger"
        onClick={() => deleteRole(rowData)}
      />
    </div>
  );

  // Column body templates
  const createdOnBody = (rowData: Role) => <span>{formatDate(rowData.createdOn)}</span>;
  const modifiedOnBody = (rowData: Role) => <span>{formatDate(rowData.modifiedOn)}</span>;

  return (
    <div>
      {/* Title + Add */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl font-bold">Roles</h2>
        <Button label="Add Role" className="add-btn" icon="pi pi-plus" onClick={openNew} />
      </div>

      {/* Search / Filter row */}
      <div className="flex flex-col md:flex-row gap-3 lg:items-end lg:justify-end justify-center items-initial mb-4">
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            type="search"
            placeholder="Search..."
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              setGlobalFilter(target.value);
            }}
          />
        </IconField>

        <Dropdown
          value={statusFilter}
          options={statusOptions}
          onChange={(e) => setStatusFilter(e.value)}
          placeholder="Filter by Status"
          className="w-full md:w-14rem"
        />

        <Button
          label="Clear"
          icon="pi pi-filter-slash"
          className="p-button-secondary p-button-sm"
          onClick={clearFilters}
        />
      </div>

      {/* Table */}
      <DataTable
        value={filteredRoles}
        className="shadow rounded-lg"
        paginator
        first={first}
        rows={rows}
        onPage={onPage}
        rowsPerPageOptions={[5, 10, 20, 50]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        paginatorLeft={<span className="text-sm">Total {filteredRoles.length} items</span>}
        paginatorRight={<span className="text-sm">{currentPage} of {totalPages} page</span>}
        emptyMessage="No roles found"
        sortMode="multiple"
        tableStyle={{ minWidth: "50rem", maxWidth: "100%", fontSize: "12px" }}
        responsiveLayout="scroll"
      >
        <Column field="id" header="ID" sortable style={{ width: "80px" }} />
        <Column field="roleName" header="Role Name" sortable />
        <Column field="status" header="Status" sortable />
        <Column header="Created On" body={createdOnBody} sortable />
        <Column field="createdBy" header="Created By" sortable />
        <Column header="Modified On" body={modifiedOnBody} sortable />
        <Column field="modifiedBy" header="Modified By" sortable />
        <Column body={actionBodyTemplate} header="Actions" style={{ width: "150px" }} />
      </DataTable>

      {/* Dialog */}
      {
        isEdit ?  <Dialog
        header={"Edit Role"}
        visible={dialogVisible}
        style={{ width: "520px", maxWidth: "95vw" }}
        modal
        position="center"
        appendTo={document.body}
        draggable={false}
        onHide={hideDialog}
      >
        <div className="p-fluid grid formgrid">
          <div className="field col-12">
            <label htmlFor="roleName">Role Name</label>
            <InputText
              id="roleName"
              value={editingRole?.roleName || ""}
              onChange={(e) =>
                setEditingRole((r) => (r ? { ...r, roleName: e.target.value } : r))
              }
            />
          </div>

          <div className="field col-12">
            <label htmlFor="status">Status</label>
            <Dropdown
              id="status"
              value={editingRole?.status || "Active"}
              options={statusOptions}
              onChange={(e) =>
                setEditingRole((r) => (r ? { ...r, status: e.value } : r))
              }
              placeholder="Select Status"
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="createdBy">Created By</label>
            <InputText
              id="createdBy"
              value={editingRole?.createdBy || ""}
              onChange={(e) =>
                setEditingRole((r) => (r ? { ...r, createdBy: e.target.value } : r))
              }
            />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="createdOn">Created On (ISO)</label>
            <InputText
              id="createdOn"
              placeholder="YYYY-MM-DDTHH:mm:ssZ"
              value={editingRole?.createdOn || ""}
              onChange={(e) =>
                setEditingRole((r) => (r ? { ...r, createdOn: e.target.value } : r))
              }
            />
          </div>

          <div className="field col-12 md:col-6">
            <label htmlFor="modifiedBy">Modified By</label>
            <InputText
              id="modifiedBy"
              value={editingRole?.modifiedBy || ""}
              onChange={(e) =>
                setEditingRole((r) => (r ? { ...r, modifiedBy: e.target.value } : r))
              }
            />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="modifiedOn">Modified On (ISO)</label>
            <InputText
              id="modifiedOn"
              placeholder="YYYY-MM-DDTHH:mm:ssZ"
              value={editingRole?.modifiedOn || ""}
              onChange={(e) =>
                setEditingRole((r) => (r ? { ...r, modifiedOn: e.target.value } : r))
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button
            label="Save"
            icon="pi pi-check"
            className="p-button-sm save-btn"
            onClick={saveRole}
          />
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-sm p-button-secondary cancel-btn"
            onClick={hideDialog}
          />
        </div>
      </Dialog>:  
         <AddRoleDialog
            visible={dialogVisible}
            onHide={hideDialog}
           /*  onCreate={(newRole) => {
            setRoles((prev) => [...prev, newRole]);
            hideDialog();
            }} */
            />
      }
     
    
    </div>
  );
};

export default Roles;