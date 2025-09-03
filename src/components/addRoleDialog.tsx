
import { useState } from "react"
import { Dialog } from "primereact/dialog"
import { Button } from "primereact/button"
import { InputSwitch } from "primereact/inputswitch"
import { InputText } from "primereact/inputtext"

interface Permission {
  area: string
  read: boolean
  modify: boolean
}

interface AddRoleDialogProps {
  visible: boolean
  onHide: () => void
}

export function AddRoleDialog({ visible, onHide }: AddRoleDialogProps) {
  const [roleName, setRoleName] = useState("")
  const [permissions, setPermissions] = useState<Permission[]>([
    { area: "Select All", read: true, modify: true },
    { area: "Predict Data", read: true, modify: true },
    { area: "Image Assessment", read: true, modify: true },
    { area: "Pathology Results", read: true, modify: true },
    { area: "Monitoring", read: true, modify: true },
    { area: "Users", read: true, modify: true },
  ])

  const handlePermissionChange = (index: number, type: "read" | "modify", value: boolean) => {
    const newPermissions = [...permissions]
    newPermissions[index][type] = value

    // Handle "Select All" logic
    if (index === 0) {
      newPermissions.forEach((_, i) => {
        newPermissions[i][type] = value
      })
    } else {
      // Update "Select All" based on other permissions
      const allSelected = newPermissions.slice(1).every((p) => p[type])
      newPermissions[0][type] = allSelected
    }

    setPermissions(newPermissions)
  }

  const handleCancel = () => {
    onHide()
    setRoleName("")
    setPermissions([
      { area: "Select All", read: true, modify: true },
      { area: "Predict Data", read: true, modify: true },
      { area: "Image Assessment", read: true, modify: true },
      { area: "Pathology Results", read: true, modify: true },
      { area: "Monitoring", read: true, modify: true },
      { area: "Users", read: true, modify: true },
    ])
  }

  const handleCreate = () => {
    // Handle role creation logic here
    console.log("Creating role:", { roleName, permissions })
    onHide()
  }

  const footerContent = (
    <div className="flex justify-end space-x-3">
      <Button
        label="Cancel"
        onClick={handleCancel}
        className="p-button-outlined"
        style={{
          color: "#374151",
          borderColor: "#d1d5db",
          backgroundColor: "white",
        }}
      />
      <Button
        label="Create"
        onClick={handleCreate}
        style={{
          backgroundColor: "#2563eb",
          borderColor: "#2563eb",
        }}
      />
    </div>
  )

  return (
    <Dialog
      header="Add New Role"
      visible={visible}
      onHide={onHide}
      footer={footerContent}
      style={{
        width: "28rem",
        backgroundColor: "white",
      }}
      className="p-dialog-custom"
      draggable={false}
      resizable={false}
      contentStyle={{
        backgroundColor: "white",
        padding: "1.5rem",
      }}
    >
      <div className="space-y-6">
        {/* Role Name Input */}
        <div className="space-y-2">
          <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">
            Role Name
          </label>
          <InputText
            id="roleName"
            placeholder="Role Name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="w-full"
            style={{
              padding: "0.5rem 0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem",
            }}
          />
        </div>

        {/* Permissions Table */}
        <div className="space-y-4">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 80px",
              gap: "1rem",
              paddingBottom: "0.5rem",
            }}
          >
            <div className="text-sm font-medium text-gray-700">Area</div>
            <div className="text-sm font-medium text-gray-700 text-center">Read</div>
            <div className="text-sm font-medium text-gray-700 text-center">Modify</div>
          </div>

          {permissions.map((permission, index) => (
            <div
              key={permission.area}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 80px",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <div className="text-sm text-gray-900">{permission.area}</div>

              <div className="flex justify-center items-center">
                <InputSwitch
                  checked={permission.read}
                  onChange={(e) => handlePermissionChange(index, "read", e.value)}
                  style={
                    {
                      "--p-inputswitch-handle-background": "white",
                      "--p-inputswitch-checked-background": "#2563eb",
                      "--p-inputswitch-background": "#e5e7eb",
                    } as never
                  }
                />
              </div>

              <div className="flex justify-center items-center">
                <InputSwitch
                  checked={permission.modify}
                  onChange={(e) => handlePermissionChange(index, "modify", e.value)}
                  style={
                    {
                      "--p-inputswitch-handle-background": "white",
                      "--p-inputswitch-checked-background": "#2563eb",
                      "--p-inputswitch-background": "#e5e7eb",
                    } as never
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  )
}
