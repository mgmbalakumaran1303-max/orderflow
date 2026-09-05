import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/Tabs";
import { ConfirmModal, Modal } from "@/components/modals/Modal";
import { FormField, Select, TextInput } from "@/components/ui/FormField";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { userRepository } from "@/services/api/userRepository";
import { useUiStore } from "@/stores/uiStore";
import { formatRelative, roleLabel } from "@/utils/format";
import type { StaffUser, UserRole, UserStatus } from "@/types";

const empty = { name: "", email: "", role: "staff" as UserRole, status: "active" as UserStatus };

export function UsersPage() {
  const toast = useUiStore((s) => s.toast);
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StaffUser | null>(null);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deactivate, setDeactivate] = useState<StaffUser | null>(null);
  const [remove, setRemove] = useState<StaffUser | null>(null);

  async function reload() {
    setLoading(true);
    setUsers(await userRepository.list());
    setLoading(false);
  }

  useEffect(() => {
    void reload();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(user: StaffUser) {
    setEditing(user);
    setForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    setErrors({});
    setFormOpen(true);
  }

  return (
    <div>
      <PageHeader title="Users" actions={<Button onClick={openCreate}>Add User</Button>} />
      <Card padding={false}>
        {loading ? (
          <div className="p-4"><TableSkeleton /></div>
        ) : users.length === 0 ? (
          <EmptyState icon={<Users className="h-8 w-8" />} title="No users" description="Invite kitchen or front-of-house staff." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted">
                <tr className="border-b border-border">
                  {["Name", "Email", "Role", "Status", "Last Active", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/70">
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-muted">{user.email}</td>
                    <td className="px-4 py-3">{roleLabel(user.role)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={user.status === "active" ? "success" : "neutral"}>{user.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatRelative(user.lastActive)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(user)}>Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeactivate(user)}>Deactivate</Button>
                        <Button size="sm" variant="danger" onClick={() => setRemove(user)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Modal open={formOpen} title={editing ? "Edit User" : "Add User"} onClose={() => setFormOpen(false)}>
        <div className="space-y-3">
          <FormField label="Name" error={errors.name}>
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Email" error={errors.email}>
            <TextInput value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </FormField>
          <FormField label="Role">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
              <option value="admin">Restaurant Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
              <option value="viewer">Viewer</option>
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </FormField>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              const next: Record<string, string> = {};
              if (!form.name.trim()) next.name = "Name is required";
              if (!form.email.includes("@")) next.email = "Enter a valid email";
              setErrors(next);
              if (Object.keys(next).length) return;
              if (editing) await userRepository.save({ ...editing, ...form });
              else await userRepository.create(form);
              setFormOpen(false);
              await reload();
              toast("success", editing ? "User updated" : "User created successfully");
            }}
          >
            Save User
          </Button>
        </div>
      </Modal>
      <ConfirmModal
        open={Boolean(deactivate)}
        title="Deactivate User?"
        description={`${deactivate?.name} will lose access until reactivated.`}
        confirmLabel="Deactivate"
        variant="danger"
        onCancel={() => setDeactivate(null)}
        onConfirm={async () => {
          if (!deactivate) return;
          await userRepository.save({ ...deactivate, status: "inactive" });
          setDeactivate(null);
          await reload();
          toast("warning", "User deactivated");
        }}
      />
      <ConfirmModal
        open={Boolean(remove)}
        title="Delete User?"
        description="This staff account will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setRemove(null)}
        onConfirm={async () => {
          if (!remove) return;
          await userRepository.remove(remove.id);
          setRemove(null);
          await reload();
          toast("success", "User deleted");
        }}
      />
    </div>
  );
}
