# Prohibition of Direct DOM Manipulation & Declarative State Standards

This document establishes the mandatory architectural rules and execution guidelines for all AI coding agents (**Antigravity**, **Cursor**, **Claude**, **Codex**, **Kiro**, **GitHub Copilot**, etc.) working on this repository regarding DOM interaction and view state management.

---

## 🚫 Absolute Prohibition of Direct DOM Manipulation

Within this application framework (React / Next.js), direct DOM access and imperative DOM manipulation are **strictly forbidden**. The framework's virtual DOM and declarative view engine must remain the single source of truth for all UI updates, data bindings, event handling, and DOM element management.

### Prohibited Patterns
1. **No Low-Level DOM Element Selectors**:
   - `document.getElementById()`
   - `document.querySelector()`
   - `document.querySelectorAll()`
   - `document.getElementsByClassName()`, `document.getElementsByTagName()`, `document.getElementsByName()`
2. **No Imperative DOM Creation or Tree Mutation**:
   - `document.createElement()` (e.g. creating synthetic `<a>` or `<input>` tags for downloads or uploads)
   - `element.appendChild()`, `element.removeChild()`, `element.replaceChild()`, `element.insertBefore()`
   - `element.innerHTML`, `element.outerHTML`
3. **No Direct DOM Style or Class Manipulation**:
   - `element.style.*` direct assignments (use Tailwind CSS classes or declarative style bindings)
   - `element.classList.add()`, `element.classList.remove()`, `element.classList.toggle()`
4. **No Direct Global Event Listeners on Document/Window for Component Logic**:
   - Avoid `document.addEventListener()` / `document.removeEventListener()` for dropdowns, tooltips, or modals. Use React synthetic event handlers (`onClick`, `onBlur`, `onKeyDown`) and declarative backdrop overlays.
5. **No Low-Level DOM Libraries**:
   - Prohibit jQuery, Zepto, or any vanilla DOM manipulation libraries.

---

## 🎯 Mandatory Declarative Patterns

All UI interactions, form updates, element triggers, and rendering must follow React's declarative state management patterns:

### 1. Controlled Form Components Over DOM Value Extraction
- Never inspect the DOM to retrieve the value of an input, select, or textarea (e.g., `(document.getElementById('picker') as HTMLSelectElement)?.value` is prohibited).
- Always use React controlled component state (`value` and `onChange`):
  ```tsx
  // ✅ CORRECT: Declarative controlled input
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<string>('Standard Item');

  <select
    value={selectedCatalogItem}
    onChange={(e) => setSelectedCatalogItem(e.target.value)}
  >
    <option value="Item A">Item A</option>
    <option value="Item B">Item B</option>
  </select>
  ```

### 2. File Uploads & Imperative Element Triggers via `useRef`
- When interacting with native browser inputs that require programmatic triggering (e.g. hidden `<input type="file" />`), use React's typed `useRef` hook, never `document.getElementById().click()`:
  ```tsx
  // ✅ CORRECT: Typed React useRef
  const fileInputRef = useRef<HTMLInputElement>(null);

  <input
    ref={fileInputRef}
    type="file"
    className="hidden"
    onChange={handleFileUpload}
  />
  <button type="button" onClick={() => fileInputRef.current?.click()}>
    Upload Document
  </button>
  ```

### 3. Declarative File Downloads via JSX Elements
- Never construct temporary `document.createElement('a')` nodes, append them to `document.body`, click them, and remove them.
- Render declarative JSX `<a>` hyperlinks with `href` and `download` attributes, styled as buttons:
  ```tsx
  // ✅ CORRECT: Declarative JSX anchor
  <a
    href={BLANK_BOQ_TEMPLATE_CSV_URI}
    download="Blank_BOQ_Format_Template.csv"
    className="bg-emerald-100 text-emerald-900 px-4 py-2 rounded-lg font-bold flex items-center"
  >
    <Download className="w-4 h-4 mr-2" />
    <span>Download Template</span>
  </a>
  ```

### 4. Dropdowns, Menus & Modals via Declarative Backdrops
- Avoid `document.addEventListener('mousedown', handleClickOutside)`.
- Use declarative overlay backdrops to handle dismissal cleanly within the React lifecycle:
  ```tsx
  // ✅ CORRECT: Declarative backdrop overlay
  {isDropdownOpen && (
    <>
      <div
        className="fixed inset-0 z-10"
        onClick={() => setIsDropdownOpen(false)}
        aria-hidden="true"
      />
      <div className="absolute top-full z-20 bg-white shadow-xl">
        {/* Menu content */}
      </div>
    </>
  )}
  ```

### 5. Multi-Row or Dynamic List State
- When managing values across rendered items in a list or table, store row-level selections in a state map (`Record<number, string>` or `Record<string, string>`) rather than assigning dynamic IDs and reading from DOM:
  ```tsx
  // ✅ CORRECT: Row state map
  const [rowOfferVendors, setRowOfferVendors] = useState<Record<number, string>>({});

  {items.map((it, idx) => (
    <select
      key={it.code}
      value={rowOfferVendors[idx] ?? defaultVendorId}
      onChange={(e) => setRowOfferVendors({ ...rowOfferVendors, [idx]: e.target.value })}
    >
      {/* Options */}
    </select>
  ))}
  ```

---

## 🛡️ Static Enforcement via ESLint
All AI agents must ensure that `.eslintrc.json` includes `no-restricted-properties` to statically reject any direct DOM lookups in application code:
- `document.getElementById`
- `document.querySelector`
- `document.querySelectorAll`
- `document.createElement`

---

## ⚡ Quality Check & Verification Benchmark
- Any change touching UI components or DOM event handling must pass `npm run lint` and `npm run build`.
- All declarative state refactorings must maintain $\ge 90\%$ code coverage across all 4 parameters (`npm run test:coverage`).
