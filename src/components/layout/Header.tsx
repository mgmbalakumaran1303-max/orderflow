import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, Search, Store, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@/components/ui/IconButton";
import { SearchInput } from "@/components/ui/SearchInput";
import { searchRepository } from "@/services/api/searchRepository";
import { notificationRepository } from "@/services/api/searchRepository";
import { useAuthStore } from "@/stores/authStore";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { useUiStore } from "@/stores/uiStore";
import type { AppNotification } from "@/types";
import type { SearchResults } from "@/services/api/searchRepository";

export function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const restaurants = useRestaurantStore((s) => s.restaurants);
  const selected = useRestaurantStore((s) => s.selected);
  const selectRestaurant = useRestaurantStore((s) => s.select);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const toast = useUiStore((s) => s.toast);
  const openConfirm = useUiStore((s) => s.openConfirm);
  const logout = useAuthStore((s) => s.logout);
  const setHelp = useUiStore((s) => s.setHelpOpen);

  const [restOpen, setRestOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [notes, setNotes] = useState<AppNotification[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void notificationRepository.list().then(setNotes);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "/" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (!query.trim()) {
        setResults(null);
        return;
      }
      void searchRepository.search(query).then(setResults);
    }, 160);
    return () => window.clearTimeout(handle);
  }, [query]);

  const unread = useMemo(() => notes.filter((item) => !item.read).length, [notes]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-6">
      <IconButton label="Open navigation" className="lg:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </IconButton>

      <div className="relative">
        <button
          type="button"
          onClick={() => setRestOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
        >
          <Store className="h-4 w-4 text-primary" />
          <span className="hidden max-w-[160px] truncate sm:inline">{selected?.name ?? "My Restaurant"}</span>
          <ChevronDown className="h-4 w-4 text-muted" />
        </button>
        {restOpen ? (
          <div className="absolute left-0 top-12 z-30 w-64 rounded-xl border border-border bg-card p-1 shadow-card">
            {restaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                type="button"
                className="flex w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-card-hover"
                onClick={() => {
                  selectRestaurant(restaurant.id);
                  setRestOpen(false);
                  toast("info", `Switched to ${restaurant.name}`);
                }}
              >
                {restaurant.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative hidden flex-1 md:block">
        <SearchInput
          ref={searchRef}
          placeholder="Search anything..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {results ? (
          <div className="absolute mt-2 w-full rounded-xl border border-border bg-card p-2 shadow-card">
            {(["orders", "customers", "menu", "users", "devices"] as const).map((group) => {
              const rows =
                group === "orders"
                  ? results.orders.map((order) => ({ label: `#${order.number}`, href: `/orders?orderId=${order.number}` }))
                  : group === "customers"
                    ? results.customers.map((c) => ({ label: c.name, href: `/orders?orderId=${c.orderNumber}` }))
                    : group === "menu"
                      ? results.menu.map((item) => ({ label: item.name, href: "/menu" }))
                      : group === "users"
                        ? results.users.map((item) => ({ label: item.name, href: "/users" }))
                        : results.devices.map((item) => ({ label: item.name, href: "/devices" }));
              if (!rows.length) return null;
              return (
                <div key={group} className="mb-2">
                  <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-subtle">{group}</p>
                  {rows.map((row) => (
                    <button
                      key={row.label}
                      type="button"
                      className="flex w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-card-hover"
                      onClick={() => {
                        navigate(row.href);
                        setQuery("");
                        setResults(null);
                      }}
                    >
                      {row.label}
                    </button>
                  ))}
                </div>
              );
            })}
            {!results.orders.length && !results.customers.length && !results.menu.length && !results.users.length && !results.devices.length ? (
              <p className="px-2 py-4 text-center text-sm text-muted">No search results</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <div className="relative md:hidden">
          <IconButton label="Search" onClick={() => searchRef.current?.focus()}>
            <Search className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="relative">
          <IconButton label="Notifications" onClick={() => setNotesOpen((v) => !v)}>
            <span className="relative">
              <Bell className="h-4 w-4" />
              {unread ? <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" /> : null}
            </span>
          </IconButton>
          {notesOpen ? (
            <div className="absolute right-0 top-11 w-80 rounded-xl border border-border bg-card p-2 shadow-card">
              {notes.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">No notifications</p>
              ) : (
                notes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-left hover:bg-card-hover"
                    onClick={() => {
                      void notificationRepository.markRead(note.id);
                      setNotes((prev) => prev.map((item) => (item.id === note.id ? { ...item, read: true } : item)));
                      navigate(note.href);
                      setNotesOpen(false);
                    }}
                  >
                    <p className="text-sm font-medium">{note.title}</p>
                    <p className="text-xs text-muted">{note.body}</p>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-card-hover"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-muted text-xs font-semibold text-primary">
              RA
            </div>
            <span className="hidden text-sm md:inline">{user?.name ?? "Restaurant Admin"}</span>
            <ChevronDown className="hidden h-4 w-4 text-muted md:block" />
          </button>
          {profileOpen ? (
            <div className="absolute right-0 top-12 w-56 rounded-xl border border-border bg-card p-1 shadow-card">
              <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-card-hover" onClick={() => { setProfileOpen(false); navigate("/settings"); }}>
                <UserRound className="h-4 w-4" /> Profile
              </button>
              <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-card-hover" onClick={() => { setProfileOpen(false); navigate("/settings"); }}>
                Account Settings
              </button>
              <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-card-hover" onClick={() => { setProfileOpen(false); setRestOpen(true); }}>
                Switch Restaurant
              </button>
              <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-card-hover" onClick={() => { setProfileOpen(false); setHelp(true); }}>
                Help Center
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-card-hover"
                onClick={() => {
                  setProfileOpen(false);
                  openConfirm({
                    title: "Logout",
                    description: "Are you sure you want to sign out of ORDERFLOW?",
                    confirmLabel: "Logout",
                    variant: "danger",
                    onConfirm: () => {
                      logout();
                      navigate("/login");
                    },
                  });
                }}
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
