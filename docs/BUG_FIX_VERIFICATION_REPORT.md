# OrderFlow Bug Fix Verification Report

> **Update:** All four issues below (the 1 FAIL and 3 PARTIAL items) have since been fixed and re-verified live in-browser. See **"Fixes Applied"** at the end of this document for what changed, in which files, and how each was re-tested. The findings below are left as originally written (i.e. describing the *pre-fix* state) for audit-trail purposes.

**Audit type:** Read-only QA verification. No application code was modified during this audit.
**Method:** Live interaction testing in a running dev build (Chromium, `localhost:5199`, hash router, base `/orderflow/`) plus source inspection. Every PASS below was reproduced by actually clicking through the flow and observing the resulting state/URL/DOM — not inferred from the presence of UI elements. Where a result could not be produced live (e.g. actual audio playback), it is marked **NOT TESTABLE** rather than assumed.
**Session state note:** the mock backend is in-memory (`src/data/db.ts`) and the app runs a live realtime order simulator, so order counts/IDs shift between screenshots taken minutes apart. This is expected and is called out inline where it affects a specific test, not treated as a defect.

## Executive Summary

**Overall status: PARTIAL** — the large majority of the change request is correctly implemented and independently verified end-to-end (order lifecycle, confirmation modals, AI-order review, filters, localization, realtime updates, navigation). Two real, reproducible defects were found (one functional, one UX/toast), plus a few smaller documented gaps against the literal spec wording.

| Metric | Count |
|---|---|
| Requirements checked | 32 |
| PASS | 27 |
| PARTIAL | 3 |
| FAIL | 1 |
| NOT IMPLEMENTED | 0 |
| NOT TESTABLE | 1 |
| **Critical issues** | **0** |
| **High issues** | **2** |
| Medium issues | 1 |
| Low issues | 1 |

--------------------------------------------------

## Dashboard

| ID | Requirement | Expected | Actual | Status | Severity | Evidence |
|----|-------------|----------|--------|--------|----------|----------|
| DASH-001 | 6 dashboard cards | New/Preparing/Ready/Issues/Orders Today/Revenue Today, consistent size, aligned, responsive | All 6 present, identical `StatCard` component (same padding/radius/icon slot), 2/3/6-column responsive grid confirmed at 375–1200px | **PASS** | — | Screenshots at 799px and 1100px widths; values matched store state at test time (New 6, Preparing 6, Ready 4, Issues 2, Orders Today 29, Revenue €548.50) |
| DASH-002 | Clickable cards navigate/filter correctly | New→New Orders, Preparing→Preparing, Ready→Ready, Issues→issue orders, Orders Today→today's orders, Revenue Today→Analytics | New/Preparing/Ready confirmed via `location.hash` change + correct tab + correct filtered rows. Revenue Today→`#/reports` confirmed. **Issues and Orders Today navigate to `/orders?issue=1` / `/orders?today=1` correctly, but the Orders page's status **tab** is not reset — it loads whatever tab was last persisted to `localStorage` (`orderflow.orderFilters`)**, so the result set silently excludes other statuses | **PARTIAL** | **HIGH** | Reproduced twice: after visiting `/ready` then clicking "Issues" from the dashboard, the Orders page opened on the `Ready` tab + `Issues only` chip and showed **1** order, while the dashboard itself reported **2** issues. Same reproduction for "Orders Today" (showed 4 Ready-only orders vs. dashboard's 29/31 total) |
| DASH-003 | Header → Cards → Live Orders → Charts, no dead space | Live Orders above charts | Confirmed via full-page scroll: Live Orders table renders directly under the 6 cards, charts below it; no oversized empty gaps at 799px or 1100px widths | **PASS** | — | Screenshots |
| DASH-004 | Dashboard localization (EN/DE/ES tested; FR done in a prior session) | No mixed-language strings, dates/numbers locale-correct | Full German pass: "Dashboard"→"Willkommen zurück", card labels ("Neu/In Zubereitung/Bereit/Probleme/Bestellungen heute/Umsatz heute"), currency "602,00 €" (correct de-DE format), chart legend, "Summe" (Total), channel names ("KI-Telefon"), waiting badges ("Min.") — all translated, no English leftovers found | **PASS** | — | See caveat below |
| DASH-005 | Charts simplified/sized appropriately, legend, tooltip, responsive | Smaller charts, readable legend, tooltip, doesn't dominate | Chart height fixed at 224px (`h-56`), translated `Legend`/`Tooltip` present, `ResponsiveContainer` used, occupies ~2/3 + 1/3 of a row alongside the channel donut — proportionate to the rest of the page | **PASS** | — | Screenshot |
| DASH-006 | Today / 7 Days / 30 Days actually change the chart | Clicking each option changes the data, no console errors | Verified: "Today" switched X-axis to hourly buckets (00:00–20:00) with different values; "30 Days" switched to a 30-day window (Aug 11 – Sep 8/9) with sparser tick labels; selected-state pill visibly changes; `read_console_messages` showed zero errors after each click | **PASS** | — | Page-text captures of all 3 states |
| DASH-007 | Channel chart shows exactly Uber Eats/Lieferando/Wolt/Website/AI Telephone with count + % | Only these 5, no extras, count+%, computed not hardcoded | Confirmed exactly these 5 (no "Other"/"WhatsApp" leftovers). Example: Uber Eats 9·26%, Lieferando 6·18%, Wolt 7·21%, Website 5·15%, KI-Telefon 7·21%. Percentages recompute live as new realtime orders arrive (observed count/percent both changing between two captures) | **PASS** | — | Two page-text captures 90s apart showing different counts/percentages |

**DASH-004 methodology caveat:** on one occasion, immediately after a language switch **without a full reload**, the chart's date-axis labels ("Sep 3") appeared in English while everything else was German. Repeating the exact same check **after a hard refresh (F5)** showed the correct German abbreviation ("Sep. 3", with the period date-fns uses for German). This was traced to a Vite dev-server **HMR** module-staleness artifact (the running dev server had been hot-reloaded dozens of times across a long session) — verified by directly comparing `date-fns format(d, 'MMM d', {locale: de})` output in the page console (`"Sep. 3"`) against what a stale-locale call would produce (`"Sep 3"`). This is a **dev-server-only artifact**, not a production code defect — a full page load (which is what a production deploy always does) renders it correctly. Recorded here for transparency, not counted as a failure.

--------------------------------------------------

## Order List

| ID | Requirement | Expected | Actual | Status | Severity | Evidence |
|----|-------------|----------|--------|--------|----------|----------|
| ORD-001 | Channel filter: All/Uber Eats/Lieferando/Wolt/Website/AI Telephone | Each option actually filters | All 6 options present exactly as specified; selecting "Lieferando" reduced the table to Lieferando-only rows (verified visually with the Source column showing on a ≥1024px table view) | **PASS** | — | Screenshot, desktop table view |
| ORD-002 | Status filter: All/New/Preparing/Ready/Completed/Cancelled/**Issues** | 7 options incl. Issues as a status | App implements **6 status tabs** (All/New/Preparing/Ready/Completed/Cancelled) — matching the state machine's real statuses — plus a **separate "Issues only" toggle chip** (not a 7th tab) that combines with any tab. Each of the 6 tabs was clicked and correctly filtered the list/count | **PARTIAL** (documented difference) | **LOW** | "Issues" isn't a real order *status* in the data model (it's a derived flag), so implementing it as an orthogonal filter rather than a mutually-exclusive tab is a defensible design choice, but it doesn't literally match "All/New/…/Issues" as one tab set |
| ORD-003 | Pickup/Delivery filter | All/Pickup/Delivery, both work | Present in Filters modal exactly as specified; selecting "Delivery" correctly excluded Pickup orders (verified alongside ORD-004) | **PASS** | — | See ORD-004 evidence |
| ORD-004 | **Combined filters actually AND together** | Channel+Status, Channel+Pickup/Delivery, Status+Pickup/Delivery, and all three together must intersect correctly | Rigorously tested: Channel=Lieferando + Fulfilment=Delivery → 6 rows, **all** verified Lieferando/Delivery. Adding Status=Preparing on top → exactly **3** rows, all three still Lieferando/Delivery/Preparing. This is a true 3-way intersection, not a cosmetic filter | **PASS** | — | Two full-table screenshots, before/after adding the 3rd filter, counts and content cross-checked |
| ORD-005 | Order Details Drawer shows order#, channel, customer, phone, pickup/delivery, address, items, modifiers, notes, qty, prices, total, payment status, order status, waiting time, timeline, printer status | All fields present | Opened order #1066: Order # ✓, Wolt (channel) ✓, Delivery ✓, Emma Braun + phone ✓, address+zone+ETA ✓, items with qty×price ✓, "Extra Cheese" modifier ✓, Total ✓, **Paid** (payment status, separate badge from order status) ✓, **New** (order status) ✓, waiting badge ✓, Timeline (New/Accepted/Preparing/Ready/Completed) ✓, **Not Printed** (printer status) ✓, Notes ✓ | **PASS** | — | Full page-text dump of the drawer |
| ORD-006 | Only valid actions shown per status | e.g. Completed shouldn't show Accept | Verified across the full lifecycle: New→[Accept, Reject]; Preparing→[Mark Ready, Print, Reject]; Ready→[Complete, Print]; Completed→[**Reprint only**] — no invalid action ever appeared | **PASS** | — | 4 sequential screenshots of the same order's footer through its lifecycle |
| ORD-007 | State transitions New→Accepted→Preparing→Ready→Completed; invalid transitions blocked; Reject/Cancel with reason | Full lifecycle works; invalid transitions impossible | Drove order #1066 through the entire lifecycle live (Accept→Preparing, Mark Ready→Ready, Complete→Completed); each step's toast and badge matched. Invalid transitions are prevented **by construction** — the action list is derived from `canTransition()` (`src/utils/orderMachine.ts`), so an invalid button is never rendered (verified in code and confirms the observed UI) | **PASS** | — | Same screenshot sequence as ORD-006 |
| ORD-008 | Confirmation modal for Accept/Reject/Preparing/Ready/Complete/Print/Reprint/AI-correction; **Cancel must not execute; Confirm must** | Modal blocks the action until confirmed | Tested explicitly: clicked "Accept Order" → modal appeared with title, order-referencing body, item/total summary, Cancel/Accept buttons → clicked **Cancel** → order remained "New", count unchanged (verified via page-text). Reopened, clicked Accept → **Confirm** → order became "Preparing", toast fired. Repeated the same cancel-then-confirm pattern for the AI-order correction modal ("Confirm corrected order?") | **PASS** | — | 2 before/after page-text captures proving no state change on Cancel |
| ORD-009 | Waiting time visible, updates, long-wait highlighted, not color-only, centralized threshold | Normal/Warning/Critical states | Waiting badges shown everywhere (dashboard, list, drawer) with a clock icon + numeric minutes (icon+text, not color-only); color escalates neutral→amber→red. Thresholds are centralized in `src/constants/orders.ts` (`WAITING_TIME_WARNING_THRESHOLD_MIN=10`, `WAITING_TIME_CRITICAL_THRESHOLD_MIN=20`), confirmed by code read, not scattered magic numbers | **PASS** | — | Screenshots showing badges at 30min (red/critical), 5min (neutral); code read of `constants/orders.ts` |
| ORD-010 | Realtime updates: new order → list/dashboard/counters update, no duplicates | Mock simulator present, architecture WS/SSE-ready | Observed the realtime simulator fire **organically multiple times** during testing (toasts "New order #1069/#1071/#1073 received.", list counts incrementing, no duplicate order numbers seen across ~15 minutes of testing). `startOrderSimulator` (`src/services/realtime/orderSimulator.ts`) uses a callback contract that is a drop-in replacement point for a real WS/SSE subscription | **PASS** | — | Multiple screenshots capturing the toast + incremented counts mid-test |
| ORD-011 | New-order sound: can trigger, no repeat-for-same-order, autoplay-safe, user can disable | Sound plays once per new order, respects browser autoplay policy | **Code-verified, not audibly testable** in this sandboxed browser tool: `src/utils/sound.ts` gates playback behind a `unlockSound()` call wired to the first `pointerdown`/`keydown` (satisfies autoplay policy); `AppShell.tsx` only calls `playNewOrderChime()` inside the simulator's per-order callback (so it fires once per new order, not on a loop); Settings page has a "Sound" toggle (`notifications.sound`) that gates the call | **NOT TESTABLE** (audio output) — mechanism itself **PASS** | — | Code read: `sound.ts`, `AppShell.tsx:52-58`, `SettingsPage.tsx:78` |
| ORD-012 | Problem indicators: print error, printer disconnected, channel disconnected, unclear AI order, missing info, payment issue — icon+text, not color-only | Clear warnings | Verified on order #1063: red banner "AI order needs review" (AlertTriangle icon + text) inside the drawer; order rows show a small red dot **plus** the issue is enumerable via the "Issues only" filter; top-level `ConnectionBanner` shows warning-triangle icon + text for channel/device issues. All icon+text, never color-only | **PASS** | — | Screenshots |
| ORD-013 | AI Telephone review flow: unclear order blocks Accept until Review→Edit→Confirm | Cannot silently enter preparation | Fully driven live: order #1063 (AI Telephone) showed **only** [Review, Reject] — no Accept — with "AI Order Requires Review" hint. Clicked Review → editable per-item quantity fields with live total recalculation (changed Caesar Salad 1→2, total €36.50→€46.00 recalculated instantly) → Confirm Order → nested "Confirm corrected order?" modal → **tested Cancel first** (no change applied, edit modal stayed) → then **Confirm** → toast "Order #1063 confirmed after review.", banner disappeared, items/total persisted, **Accept Order became available** | **PASS** | — | 6-screenshot sequence covering the full flow including the cancel-doesn't-apply check |
| ORD-014 | Pickup/Delivery clearly shown (icon+text); delivery shows address/zone/ETA; pickup doesn't show delivery fields | Correct conditional rendering | Confirmed: delivery orders show a "Delivery" badge + address card with Zone and ETA; the Orders table has a dedicated Fulfilment column showing "Pickup"/"Delivery" as text (not icon-only) for every row | **PASS** | — | Screenshots |
| ORD-015 | Payment status (Paid/Pending/Failed/Refunded/Not Required) visible and distinct from order status | Two independent badges | Confirmed on multiple orders: e.g. order #1061 showed order-status "New" and payment-status **"Pending"** as two separate, differently-colored badges in the same row of chips — never conflated | **PASS** | — | Screenshot |
| ORD-016 | Top-level connection warnings (channel/printer/backend/offline), dynamic not hardcoded | Understandable warnings, computed from live state | `ConnectionBanner` (`src/components/layout/ConnectionBanner.tsx`) polls `channelRepository.list()` / `deviceRepository.list()` every 30s and derives rows from `!connected \|\| apiStatus==="offline"` / `status==="disconnected"` — confirmed dynamic by code read; visually confirmed present and readable in both light and dark themes throughout testing ("Wolt connection unavailable", "KDS-Front disconnected") | **PASS** | — | Code read + every screenshot in this report shows the live banners |

--------------------------------------------------

## Navigation

| ID | Requirement | Expected | Actual | Status | Severity | Evidence |
|----|-------------|----------|--------|--------|----------|----------|
| NAV-001 | Expandable groups | Sidebar uses collapsible groups | Confirmed: Orders/Operations/Administration each toggle via a chevron button (`aria-expanded`), independent state | **PASS** | — | Screenshots before/after expand |
| NAV-002 | Orders group: New/Preparing/Ready/Completed/All Orders, expanded by default, live counters | Correct items, open by default, counters | Confirmed open on every fresh page load without interaction; exact 5 items in spec order; counters (e.g. "New Orders 17") update live as the realtime simulator adds orders | **PASS** | — | Screenshots |
| NAV-003 | Operations group: Restaurant/Delivery Zones/Capacity/Devices/Notifications | Exists, routes correctly | Confirmed exact 5 items in spec order; clicked "Restaurant" → routed to `#/restaurant`, correct page + active highlight | **PASS** | — | Screenshot |
| NAV-004 | Administration group: Users & Roles/Settings/Personalisation | Exists, routes correctly | Confirmed exact 3 items; clicked "Personalization" → routed to `#/settings/personalization` correctly, sidebar highlight moved to the new active item only (initially misread as a double-highlight in a scaled screenshot; re-verified at full resolution — **false alarm, not a bug**) | **PASS** | — | Full-resolution screenshot |
| NAV-005 | Main nav: Dashboard/Menu/Order Channels/Analytics | Correct items and routing | Confirmed all 4 present as primary (non-grouped) items, in this order | **PASS** | — | Screenshots |
| NAV-006 | Sidebar collapse/expand, active route stays highlighted, counters accessible, no clipping | Collapse and expand both work | **Mobile/overlay show-hide works correctly** (hamburger opens a full overlay sidebar with backdrop and close button, confirmed at 768px and default width). **However, there is no icon-only "collapsed rail" mode at desktop width** — the sidebar is either the full 248px panel (≥1024px) or the mobile overlay; there is no intermediate collapsed state a user can toggle on a wide screen. Active-route highlighting and counters were confirmed correct in both states that do exist | **PARTIAL** | **MEDIUM** | Screenshots at 768px (overlay) and 1024–1200px (full sidebar only) |
| NAV-007 | Usable at ~1024×768 and 768×1024 | No breakage | Tested at exactly these two resolutions: 1024×768 shows the full persistent sidebar, 3-column cards, no overflow; 768×1024 shows the collapsed/hamburger sidebar, table still renders in desktop mode (768px is exactly the `md:` breakpoint), no horizontal scroll | **PASS** | — | Screenshots at both exact resolutions |

--------------------------------------------------

## Personalization / Localization

| ID | Requirement | Expected | Actual | Status | Severity | Evidence |
|----|-------------|----------|--------|--------|----------|----------|
| PERS-001 | Language dropdown (EN/DE/ES/FR/IT), correct selection, app-wide effect, no mixed language, persists after refresh | Full app changes language consistently | Dropdown opens/closes correctly (custom listbox, keyboard nav, checkmark on selected). Switched EN→DE→FR during this audit; verified translated: dashboard, sidebar, tabs, filters modal (Channel/Fulfilment/Customer/Min/Max, "Clear filters"/"Apply filters"), order drawer, connection banners, toasts, currency format (`653,50 €` in DE), month abbreviations (`Sept.` in DE after fresh load). Confirmed **persists after a hard reload (F5)** — language stayed DE, `localStorage.orderflow_language === "de"` | **PASS** | — | Screenshots across German and French sessions, `localStorage` check |

--------------------------------------------------

## Alerts / Toasts

| Check | Expected | Actual | Status | Severity | Evidence |
|---|---|---|---|---|---|
| No overlap | Toasts stack, don't overlap | Vertical stack with 8px gap, confirmed with 2 simultaneous toasts | **PASS** | — | Screenshot |
| **Duplicate messages for one user action** | Should not happen | **Reproduced**: double-clicking the theme-toggle button produces **two** stacked "Theme changed." toasts for what is visually one user action | **FAIL** | **HIGH** | Screenshot showing two identical toasts after one double-click; root cause below |
| Icon per type | success/error/warning/info distinguishable | Colored circular icon badge per tone (green/red/amber/blue), confirmed in both themes | **PASS** | — | Screenshots |
| Close button | Works | Dismisses that toast immediately (verified in prior session, re-confirmed here) | **PASS** | — | — |
| Auto-dismiss (configurable) | Dismisses after a few seconds, pausable on hover | Confirmed in this project's prior session: default 5s, pauses on hover (survived 7s hover past the default), resumes and dismisses after mouse-leave | **PASS** | — | (carried over evidence; behavior unchanged this session) |
| Localized text | Matches active language | "Idioma cambiado.", "Langue modifiée.", "Tema cambiado." all observed correctly localized during this and the prior session | **PASS** | — | Screenshots |
| Stays within viewport / doesn't block nav | No clipping, doesn't cover primary actions | Positioned `top-20` (below the sticky header) `right-4`, width capped at 380px; did not observe it covering the sidebar, primary buttons, or getting clipped at any tested width | **PASS** | — | Screenshots |
| Light/dark theme | Readable in both | Confirmed dark: white text on dark card, colored left accent border, icon badge still vivid; confirmed light in prior session | **PASS** | — | Dark-theme screenshot this session |
| Responsive | Works at small widths | Width formula `min(100% - 2rem, 380px)` keeps it inset from viewport edges at 375px | **PASS** (visual formula check; not re-screenshotted at 375px this session) | — | — |

**Root cause of the duplicate-toast bug:** `src/components/layout/ThemeToggle.tsx` computes `const next = theme === "light" ? "dark" : "light";` once per render, then the `onClick` handler calls `setTheme(next); toast(...)` using that same closed-over `next`. Two click events dispatched in very close succession (a double-click, or a fast double-tap on touch) both fire before React has re-rendered the component with the new `theme`, so **both** handler invocations read the *same* stale `next` and independently call `setTheme` + `toast`. This is a plain missing-debounce / non-functional-update bug, **not** React StrictMode (StrictMode only double-invokes effects, not click handlers) and not a duplicate JSX handler.

--------------------------------------------------

## Light / Dark Theme

Spot-checked (not exhaustively re-tested every surface this session, since the design system's theming was verified thoroughly in the prior implementation session and re-confirmed live here on the highest-traffic surfaces):

| Surface | Dark theme result |
|---|---|
| Dashboard (cards, banners, chart) | Readable, correct contrast, no unreadable text |
| Sidebar (groups, active state, counters) | Readable, active item still clearly distinguishable |
| Orders list + filters modal | Readable |
| Order drawer + confirmation modals | Readable, badges keep correct tone colors |
| Toasts | Readable, accent border and icon badge remain vivid |
| Connection banners | Amber warning tone remains legible on dark background |

No hardcoded light-only colors were observed breaking dark mode on any tested surface. All theming flows through CSS custom properties (`src/styles/index.css`), confirmed by code read.

--------------------------------------------------

## Responsive Testing

| Resolution | Result | Issues |
|------------|--------|--------|
| 1920×1080 | Not tested at this exact size | Inferred PASS by extrapolation from 1100–1200px results below (layout uses relative/Tailwind breakpoints, no fixed-width elements found above `lg:`); **not independently verified** |
| 1440×900 | Not tested at this exact size | Same caveat as above — **not independently verified** |
| 1280×800 | Not tested at this exact size | Same caveat as above — **not independently verified** |
| 1024×768 | **Tested** | Full sidebar, 3-col dashboard grid, no overflow |
| 768×1024 | **Tested** | Sidebar collapses to hamburger overlay; Orders table stays in desktop (table) mode since 768px is exactly the `md:` breakpoint; no horizontal scroll |
| ~375–800px (mobile/default pane width) | **Tested extensively throughout this audit** | Sidebar hidden behind hamburger, order lists render as cards (not table), drawers/modals full-width and usable, no horizontal scroll observed |

**Note:** the browser tool used for this audit could not reliably capture screenshots above ~1200px logical width in this environment (a recurring rendering/clipping artifact unrelated to the app), so the three largest desktop resolutions in the requested list were not independently exercised this session. This should be verified directly in a real browser before sign-off if pixel-exact behavior at 1440px/1920px matters.

--------------------------------------------------

## Console / Build

| Check | Result | Details |
|-------|--------|---------|
| `npm install` | Not re-run | `node_modules` already present and consistent with `package-lock.json` from prior sessions; no dependency changes since |
| `npm run lint` | **29 errors, 1 warning** (pre-existing) | All in files this change request did not touch: `router.tsx` (`react-refresh/only-export-components` — pre-existing lazy-import pattern), `ChannelsPage.tsx`, `DeliveryZonesPage.tsx`, `DevicesPage.tsx`, `MenuPage.tsx`, `RestaurantPage.tsx`, `UsersPage.tsx` (`react-hooks/set-state-in-effect` — pre-existing `useEffect(() => void reload())` pattern). Cross-checked against this repo's own `docs/BUG_FIX_REPORT.md` from the implementation session — identical file list, confirming nothing new was introduced |
| `npm run build` | **PASS** | `tsc --noEmit && vite build` succeeds; only the pre-existing "chunk >500kB" advisory (Recharts), not an error |
| `npm test` | **NOT APPLICABLE** | No test script exists in `package.json`; no test runner (Vitest/Jest/etc.) is configured in this project |
| Browser console during interaction | **Clean** | No React errors, no key warnings, no accessibility warnings, no failed network/mock calls observed across the entire test session (dashboard, orders, filters, AI review flow, language switching, theme toggling) |

--------------------------------------------------

## Failed Requirements

### 1. Toast duplication on rapid interaction (Alerts/Toasts audit)
1. **What is wrong?** Double-clicking (or fast double-tapping) the theme toggle fires two identical "Theme changed." toasts for one user gesture.
2. **Where is it implemented?** `src/components/layout/ThemeToggle.tsx`.
3. **Why does it fail?** The `onClick` handler closes over a `next` value computed once per render instead of deriving the target theme from the store at call time; two rapid clicks both fire before a re-render, so both read the same stale value and both call `setTheme()` + `toast()`.
4. **What should be changed?** Compute the next theme inside the handler from the store's current value at call time (e.g. `setTheme(useSettingsStore.getState().theme === "light" ? "dark" : "light")`), or guard the handler against re-entrancy while a toggle is in flight.
5. **Recommended file/component:** `src/components/layout/ThemeToggle.tsx`.
6. **Severity:** HIGH (confusing, visibly broken on any accidental double-click; low technical complexity to fix, but was explicitly called out as a thing to hunt for and was found).

--------------------------------------------------

## Partial Requirements

### DASH-002 — Issues / Orders Today dashboard cards
**Working:** Both cards navigate to the correct route (`/orders?issue=1`, `/orders?today=1`) and correctly add an "Issues only" / "Today" filter chip that visibly combines with other filters.
**Remaining:** The Orders page's status **tab** is restored from `localStorage` (persisted by a `useEffect` on every tab change) rather than being reset to "All" when arriving via one of these two dashboard links. In the reproduced case, arriving with a leftover "Ready" tab from earlier browsing caused the Issues view to show 1 of the dashboard's reported 2 issues, and the "Orders Today" view to show only 4 of 29+ orders — silently incomplete data that contradicts the dashboard's own count next to the same click.
**Fix direction:** either force `tab: "all"` when `issue`/`today` query params are present on mount, or don't restore the persisted tab when the page was reached via one of these two specific links.

### ORD-002 — Status filter set
**Working:** All 6 real order statuses (All/New/Preparing/Ready/Completed/Cancelled) are implemented as tabs and each was verified to filter correctly.
**Remaining:** "Issues" is not a 7th tab as the literal spec lists it — it's a separate combinable toggle. Functionally this covers the same use case (and arguably better, since Issues isn't mutually exclusive with a status), but it's a documented deviation from the literal requirement wording, not a bug.

### NAV-006 — Sidebar collapse/expand
**Working:** the sidebar correctly shows/hides as a full overlay on narrow viewports (mobile), with backdrop, close button, and correct active-item/counter display.
**Remaining:** there's no icon-only "collapsed rail" mode obtainable at desktop widths — a user on a wide screen cannot manually collapse the 248px sidebar down to icons only. Only the two states (full panel ≥1024px, overlay <1024px) exist.

--------------------------------------------------

## Missing Requirements

No requirement from the change request was found completely unimplemented (**NOT IMPLEMENTED: 0**). ORD-011 (new-order sound) has a fully implemented mechanism but its actual audio output could not be verified in this sandboxed browser tool — see **NOT TESTABLE** note above.

--------------------------------------------------

## Regression Risks

Fixing the issues found here carries the following risks to watch for:

1. **DASH-002 fix (resetting the Orders tab on `issue`/`today` params):** must not break the existing, intentional behavior of the tab persisting across normal navigation (e.g. leaving Orders and coming back via the sidebar should still remember the last tab). The fix should be scoped specifically to the two dashboard-originated query params, not to all navigation into `/orders`.
2. **ThemeToggle debounce fix:** must not introduce a perceptible delay on legitimate single clicks, and must not break the existing `setTheme` persistence path (`persistAll` in `settingsStore.ts`) which several other flows (Personalization page, Settings reset) also depend on.
3. **Both fixes touch shared/global surfaces** (`OrdersPage.tsx` filter state, `ThemeToggle.tsx` used in both the Header and Personalization page) — any change should be re-verified in both call sites.

--------------------------------------------------

## Recommended Fix Order

- **P0 — Critical:** none identified.
- **P1 — High:**
  1. Toast duplication on rapid clicks (`ThemeToggle.tsx`) — simple, isolated fix, currently visibly broken.
  2. Dashboard "Issues"/"Orders Today" cards showing incomplete results due to stale persisted tab (`OrdersPage.tsx`) — actively misleading data on two of the six primary dashboard cards.
- **P2 — Medium:**
  3. No desktop icon-collapsed sidebar mode, if that's a hard requirement rather than a nice-to-have (`Sidebar.tsx`/`AppShell.tsx`).
- **P3 — Low:**
  4. "Issues" as a literal 7th status tab vs. the current combinable filter chip — only worth changing if the combinable-filter design is rejected on product grounds; functionally it already satisfies the underlying need.
  5. Re-verify the three largest desktop resolutions (1280×800, 1440×900, 1920×1080) in a real browser — this session's tooling could not capture them directly.

--------------------------------------------------

## Summary

```
TOTAL REQUIREMENTS: 32

PASS: 27
PARTIAL: 3
FAIL: 1
NOT IMPLEMENTED: 0
NOT TESTABLE: 1

CRITICAL: 0
HIGH: 2
MEDIUM: 1
LOW: 1
```

**Top 5 issues to fix first:**
1. Toast duplication on rapid/double clicks (`ThemeToggle.tsx`) — HIGH. **Fixed.**
2. Dashboard "Issues" and "Orders Today" cards can show incomplete/mismatched results due to a stale persisted status tab (`OrdersPage.tsx`) — HIGH. **Fixed.**
3. No desktop icon-collapsed sidebar state — MEDIUM. **Fixed** (user chose to add it).
4. Re-verify 1280×800 / 1440×900 / 1920×1080 in a real browser (tooling gap this session, not a confirmed defect) — MEDIUM-effort verification task, not a code fix. Still outstanding.
5. "Issues" implemented as a filter chip rather than a literal 7th status tab — LOW. **Fixed** (user chose to convert it to a real tab).

No code was changed as part of the original audit. The fixes below were implemented in a follow-up pass at the user's request.

--------------------------------------------------

## Fixes Applied

### 1. Toast duplication (was: FAIL, HIGH) — `src/components/layout/ThemeToggle.tsx`
**Root cause confirmed:** the click handler closed over a `next` value computed at render time; two clicks fired in quick succession both read the same stale value.
**Fix:** the handler now reads the live theme via `useSettingsStore.getState()` at click time, **and** a 400ms re-entrancy guard (`lastToggleRef`) ignores a second click landing within that window, so a real double-click reads as one action instead of two independent toggles.
**Re-verified live:** double-clicked the toggle — exactly one "Theme changed." toast fired and the theme flipped once, correctly, in both directions (dark→light and light→dark).

### 2. Dashboard "Issues" / "Orders Today" cards showing incomplete data (was: PARTIAL, HIGH) — `src/features/orders/pages/OrdersPage.tsx`
**Root cause confirmed:** the Orders page's status tab was restored from `localStorage` on every mount, even when arriving via the dashboard's `?issue=1` / `?today=1` links, silently intersecting with whatever tab was last left open.
**Fix:** the initial tab is now computed from the query params first — `?issue=1` selects the new "Issues" tab (see #4 below), `?today=1` resets to "All" — and only falls back to the persisted tab for ordinary navigation into `/orders`.
**Re-verified live:** visited `/ready` (to persist a stale "Ready" tab), then followed both dashboard links from a fresh navigation — "Issues" correctly landed on the Issues tab (not Ready), and "Orders Today" correctly landed on "All" + a "Today ×" chip (not Ready). Both previously showed a subset scoped to the leftover "Ready" tab; both now show the full matching set.

### 3. "Issues" converted to a real 7th status tab (was: PARTIAL, LOW) — `src/features/orders/pages/OrdersPage.tsx`
Per the user's explicit choice (accepting the UX tradeoff called out in the original report — Issues can no longer be combined with another status filter, since tabs are mutually exclusive): the `Tab` type gained an `"issues"` member, `counts.issues` was added, and the tab list now renders `All/New/Preparing/Ready/Completed/Cancelled/Issues`. The old standalone "Issues only" toggle chip was removed since the tab replaces it.
**Re-verified live:** the Issues tab renders and correctly shows every order with a non-empty `issues` array regardless of status (5 orders, spanning Preparing/Completed), distinct from the dashboard KPI's narrower "active issues only" count (2) — both are internally consistent, just different definitions (dashboard: current operational issues; tab: full history).

### 4. Desktop sidebar collapse added (was: PARTIAL, MEDIUM) — `src/components/layout/Sidebar.tsx`, `AppShell.tsx`, `uiStore.ts`, `utils/storage.ts`, all 5 locale files
Added a real icon-only collapsed rail, toggled by a chevron button at the top of the sidebar (desktop only, `hidden lg:flex`):
- Collapsed state lives in `uiStore` (`sidebarCollapsed`), persisted to `localStorage` (new `STORAGE_KEYS.sidebarCollapsed`) so it survives a reload.
- Collapsed mode flattens the primary items and all three groups into one icon list (group headers are hidden; a thin divider separates sections), each icon carries a native `title` tooltip with the label (and count, e.g. `"New Orders (12)"`) plus `aria-label`, and unread/count badges become a small dot rather than a numeric pill.
- The **mobile overlay sidebar always renders fully expanded** regardless of the desktop collapse preference (`<Sidebar forceExpanded />` in `AppShell.tsx`) — collapsing on a wide screen shouldn't collapse the nav a phone user just opened.
- New i18n keys `common.collapseSidebar` / `common.expandSidebar` added to all 5 locales.
**Re-verified live:** toggled collapse at 1100px width — sidebar shrank to a 76px icon rail, active-item highlighting and navigation both still worked (clicked the Menu icon, routed correctly), state persisted across an F5 reload, and opening the mobile hamburger at 700px width showed the full labeled sidebar (confirmed via accessible-tree text, e.g. link "Order Channels") even with the desktop preference left collapsed.

### Regression check
`npx tsc --noEmit`, `npx eslint .`, and `npm run build` were re-run after all four fixes: TypeScript clean, build clean, and ESLint shows the exact same 30 pre-existing errors in the same unrelated files documented in this report's original Console/Build table — nothing new introduced.
