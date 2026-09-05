import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField, TextArea, TextInput, Toggle } from "@/components/ui/FormField";
import { Tabs, EmptyState } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/StatusBadge";
import { ConfirmModal, Modal } from "@/components/modals/Modal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { menuRepository } from "@/services/api/menuRepository";
import { useUiStore } from "@/stores/uiStore";
import { formatEuro } from "@/utils/format";
import { UtensilsCrossed } from "lucide-react";
import type { MenuCategory, MenuItem } from "@/types";

type Tab = "categories" | "items" | "variants" | "addons";

export function MenuPage() {
  const toast = useUiStore((s) => s.toast);
  const [tab, setTab] = useState<Tab>("items");
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categoryId, setCategoryId] = useState("cat-pizza");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveOpen, setSaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [deleteCatOpen, setDeleteCatOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "", price: "", categoryId: "cat-pizza", available: true });
  const [newCategory, setNewCategory] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function reload() {
    setLoading(true);
    const [cats, list] = await Promise.all([menuRepository.categories(), menuRepository.items()]);
    setCategories(cats);
    setItems(list);
    setLoading(false);
  }

  useEffect(() => {
    void reload();
  }, []);

  const visible = items.filter((item) => item.categoryId === categoryId);
  const selected = draft ?? items.find((item) => item.id === selectedId) ?? visible[0] ?? null;

  useEffect(() => {
    if (selected && selected.id !== draft?.id) setDraft(selected);
  }, [selected, draft?.id]);

  return (
    <div>
      <PageHeader
        title="Menu Management"
        actions={
          <>
            <Button variant="secondary" onClick={() => setCategoryOpen(true)}>Add Category</Button>
            <Button onClick={() => setCreateOpen(true)}>Add Item</Button>
          </>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "categories", label: "Categories" },
          { id: "items", label: "Items" },
          { id: "variants", label: "Variants" },
          { id: "addons", label: "Add-ons" },
        ]}
      />
      {loading ? (
        <div className="mt-4"><TableSkeleton /></div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr_320px]">
          <Card padding={false}>
            <div className="p-3 text-xs uppercase tracking-wide text-subtle">Menu</div>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryId(category.id)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${categoryId === category.id ? "bg-primary-muted text-primary" : "hover:bg-card-hover"}`}
              >
                {category.name}
                {tab === "categories" ? (
                  <span
                    className="text-xs text-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoryId(category.id);
                      setDeleteCatOpen(true);
                    }}
                  >
                    Delete
                  </span>
                ) : null}
              </button>
            ))}
          </Card>
          <Card padding={false}>
            {visible.length === 0 ? (
              <EmptyState icon={<UtensilsCrossed className="h-8 w-8" />} title="No menu items" description="Add an item to this category." />
            ) : (
              visible.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id);
                    setDraft(item);
                    if (tab === "categories") setTab("items");
                  }}
                  className={`flex w-full items-center justify-between border-b border-border px-4 py-3 text-left hover:bg-card-hover ${selected?.id === item.id ? "bg-surface-2" : ""}`}
                >
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted">{formatEuro(item.price)}</p>
                  </div>
                  <Badge tone={item.available ? "success" : "danger"}>{item.available ? "Available" : "Hidden"}</Badge>
                </button>
              ))
            )}
          </Card>
          <Card>
            {draft ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{draft.name}</h2>
                  <Toggle checked={draft.available} onChange={(available) => setDraft({ ...draft, available })} label="Available" />
                </div>
                <FormField label="Description">
                  <TextArea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
                </FormField>
                <FormField label="Price">
                  <TextInput type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
                </FormField>
                {(tab === "variants" || tab === "items") && (
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>Variants</span>
                      <Button size="sm" variant="ghost" onClick={() => setDraft({ ...draft, variants: [...draft.variants, { id: `v-${Date.now()}`, name: "New variant", price: draft.price }] })}>
                        Add Variant
                      </Button>
                    </div>
                    {draft.variants.map((variant) => (
                      <p key={variant.id} className="text-sm text-muted">
                        {variant.name} · {formatEuro(variant.price)}
                      </p>
                    ))}
                  </div>
                )}
                {(tab === "addons" || tab === "items") && (
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>Add-ons</span>
                      <Button size="sm" variant="ghost" onClick={() => setDraft({ ...draft, addons: [...draft.addons, { id: `a-${Date.now()}`, name: "New add-on", price: 1 }] })}>
                        Add Add-on
                      </Button>
                    </div>
                    {draft.addons.map((addon) => (
                      <p key={addon.id} className="text-sm text-muted">
                        {addon.name} · {formatEuro(addon.price)}
                      </p>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" onClick={() => setSaveOpen(true)}>Save Changes</Button>
                  <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete Item</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">Select an item.</p>
            )}
          </Card>
        </div>
      )}

      <ConfirmModal
        open={saveOpen}
        title="Save Changes?"
        description="Your menu changes will be published to customers."
        confirmLabel="Save Changes"
        onCancel={() => setSaveOpen(false)}
        onConfirm={async () => {
          if (!draft) return;
          await menuRepository.saveItem(draft);
          await reload();
          setSaveOpen(false);
          toast("success", "Menu updated successfully");
        }}
      />
      <ConfirmModal
        open={deleteOpen}
        title="Delete Menu Item?"
        description="This item will be removed from the menu."
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          if (!draft) return;
          await menuRepository.deleteItem(draft.id);
          setDraft(null);
          setSelectedId(null);
          await reload();
          setDeleteOpen(false);
          toast("success", "Menu item deleted");
        }}
      />
      <ConfirmModal
        open={deleteCatOpen}
        title="Delete Category?"
        description="Items in this category will also be removed."
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setDeleteCatOpen(false)}
        onConfirm={async () => {
          await menuRepository.deleteCategory(categoryId);
          await reload();
          setDeleteCatOpen(false);
          toast("success", "Category deleted");
        }}
      />
      <Modal open={createOpen} title="Add Item" onClose={() => setCreateOpen(false)}>
        <div className="space-y-3">
          <FormField label="Name" error={errors.name}>
            <TextInput value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
          </FormField>
          <FormField label="Description">
            <TextArea value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
          </FormField>
          <FormField label="Price" error={errors.price}>
            <TextInput type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
          </FormField>
          <FormField label="Category">
            <select className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3" value={newItem.categoryId} onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </FormField>
          <div className="flex items-center justify-between">
            <span className="text-sm">Available</span>
            <Toggle checked={newItem.available} onChange={(available) => setNewItem({ ...newItem, available })} />
          </div>
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted">
            Image placeholder
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              const next: Record<string, string> = {};
              if (!newItem.name.trim()) next.name = "Name is required";
              if (!newItem.price || Number(newItem.price) <= 0) next.price = "Enter a valid price";
              setErrors(next);
              if (Object.keys(next).length) return;
              await menuRepository.createItem({
                name: newItem.name,
                description: newItem.description,
                price: Number(newItem.price),
                categoryId: newItem.categoryId,
                available: newItem.available,
                variants: [],
                addons: [],
              });
              setCreateOpen(false);
              setNewItem({ name: "", description: "", price: "", categoryId: "cat-pizza", available: true });
              await reload();
              toast("success", "Menu item created");
            }}
          >
            Create Item
          </Button>
        </div>
      </Modal>
      <Modal open={categoryOpen} title="Add Category" onClose={() => setCategoryOpen(false)}>
        <FormField label="Name">
          <TextInput value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
        </FormField>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setCategoryOpen(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              if (!newCategory.trim()) return;
              await menuRepository.createCategory(newCategory.trim());
              setNewCategory("");
              setCategoryOpen(false);
              await reload();
              toast("success", "Category created");
            }}
          >
            Create
          </Button>
        </div>
      </Modal>
    </div>
  );
}
