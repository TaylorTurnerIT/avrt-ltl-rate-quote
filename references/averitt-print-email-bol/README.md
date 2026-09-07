# Averitt Print/Email BOL reference snapshot

The adjacent `index.html` is a source snapshot fetched from
`https://tools.averitt.com/print-email-bol` on 2026-09-05 (session established
via `https://tools.averitt.com/` first; the endpoint 500s without a session
cookie). It is reference material only; the rendered page is implemented in
`templates/print-email-bol.html`.

## Local asset map

- `js/js_shipPlus_shipPlusEditBol.js` — page controller and client-side
  validation; served from `assets/js/shipPlus/shipPlusEditBol.js`
- `js/js_averitt-main.js` — shared `Averitt` namespace (error display, dialog,
  login); served from `assets/js/averitt-main.js`
- `js/js_core.js`, `js/js_xssFilter.js`, `js/js_ajaxCities.js`,
  `js/js_AddRemoveRow.js`, `js/js_CharacterCounter.js`,
  `js/js_addressLine.js` — supporting modules under `assets/js/`
- `js/js_tour_ship_editBol.js` — walkthrough tour, intentionally not cloned

Vendor libraries (jQuery 3.6.4, jQuery UI 1.13.2 custom, pickadate, selectize
0.12.4, bootstrap 3.3.2) are served from `assets/js/vendor/`. The stylesheet
is the same `/assets/styles/main.css` already mirrored as
`assets/styles/averitt-reference.css`; it references jQuery UI theme images
served from `/js/vendor/jquery-ui-1.13.2.custom/images/` and the datepicker
icon at `/img/calendar.png`, both mirrored under `assets/`.

## Local extensions (not from the source page)

- `assets/js/bol-extensions.js` plus scoped `assets/styles/bol-extensions.css` —
  - "＋" rows on each flat hazmat group (live `/HazMaterials` lookup,
    variant select, N.O.S. technical names).
  - Convenience (only new behavior vs. the source page): a static `UN-`
    badge beside each UN input (container-box styling, not editable text),
    and bare 4-digit entries run the reference lookup with the prefix
    applied behind the scenes — the reference logic only fires on exactly
    6 characters and otherwise stays silent. The input value itself is
    never rewritten, fully-typed entries including `NA`-prefixed ones take
    the untouched reference path, and the server normalizes bare digits
    when printing (`0129` → `UN0129, …`).
  - Page-scoped presentation (`bol-extensions.css`): container remove X
    pinned to the container's top-right corner; cloned hazmat headers
    smaller with tight margins; readonly inputs gray (non-interactive)
    while selects stay white (interactive).
  - "+ Add Container" (padded `ae-m--left-large` from "+ Add Another Item"):
    containers reuse the reference gray-box section styling, sit above the
    add buttons, and hold sub-items that are full clones of the reference
    `section.shipment-fields.js-group` markup, labeled "Item N",
    re-suffixed to 100+ and bound to the reference logic
    (`toggleHazmatFields`, `registerUNnumberEvents`, `setLineItemEvents`,
    `clearInputRow`). Sub-item weight/length/width rows are hidden and
    muted (the container covers them, so they are never required).
    Cloned hazmat groups render as full-width rows below their item.
    Sub-items get no extra-UN rows: another UN means another sub-item.
    Remove controls replicate the reference red-X delete markup.
  - State is mirrored into `extra_uns_json` (keyed by document position)
    and `containers_json` (members carry line positions plus their extra
    UNs). Programmatic form submission is gated so extension fields
    validate before generation (mirroring the reference rule that hazmat
    rows print the UN description instead of a commodity description, so
    those are never required); if anything still blocks a submit, the
    first visible error is scrolled into view instead of leaving a dead
    button.
- Refresh-safe persistence: an inline script restores raw field values
  before the reference logic initializes (hazmat sections re-expand,
  lookups re-run); the extension rebuilds extra-UN rows, containers, and
  cloned sub-items from `avrt-bol-ext-v1`, re-selects saved multi-variant
  UN descriptions, and restores N.O.S. technical names. Everything
  autosaves (debounced) to localStorage. On a first visit with an empty
  form, realistic demo content is filled (Acme Party Supply → Beale
  Street Events, two line items incl. UN1046 helium, one pallet with two
  sub-items incl. UN1993 PG III).

## Backend behavior (clone-only)

- `POST /HazMaterials` (`method=fillHazMat&unNum=UN####&index=N`) replicates
  the pipe-delimited lookup protocol the reference JS expects
  (`{i}|invalid|`, `{i}|{un}|{pg}|{class}|{sub}|{desc}|{nos}|`, or
  `{i}|multiple|{un}|{nos};{pg};{class};{sub};{desc}|…|`), backed by the
  `hazmat` table seeded from `data/hazmat_table.csv` (derived 2026-09-06
  from the eCFR §172.101 Hazardous Materials Table).
- `POST /print-email-bol` builds the shipment, ordered for print as loose
  hazmat lines, then containers (hazmat pallets before non-hazmat
  pallets), then loose non-hazmat lines; within a pallet, hazmat items
  print before non-hazmat items (member sub-items are read from the
  shared line-item arrays by position and skipped as flat lines; extra UN
  numbers as count-less continuation lines; containers as header lines
  with numbered nested items; nested lines excluded from totals) and
  returns the filled `assets/pdf/AVRT_BOL.pdf` AcroForm (`https://www.averittexpress.com/public/documents/DocumentCenter/AVRT_BOL.pdf`).
  Field map: Text1–7 shipper, Text8–15 consignee, Text16–22 bill-to,
  Check Box23/24 prepaid/collect, Guaranteed Noon/Five checkboxes, Text26
  shipper's ref, Text27 consignee PO, 11 item rows
  (pieces / HM / Description / L-W-H / NMFC / class / weight), Text91 total
  pieces, Text92 additional info, Total Weight, Text97 shipper signature.
  Rows beyond the PDF's 11 lines are dropped.

## Deliberate deviations from the source page

- Walkthrough tour (Bootstrap Tour) markup, CSS, and JS are omitted.
- Third-party trackers (Autopilot, gtag, HubSpot, CXone chat) are omitted.
- The Tailwind/daisyUI app stylesheet (`output.css`) is not loaded on this
  page; it reset form-element backgrounds/fonts/appearance away from the
  reference rendering.
- City/state/ZIP lookups, address-book saves, promo-code checks, and email
  delivery are not implemented; their AJAX calls fail client-side.
