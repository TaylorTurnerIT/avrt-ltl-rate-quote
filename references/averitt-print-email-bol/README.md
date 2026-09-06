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

## Deliberate deviations from the source page

- Walkthrough tour (Bootstrap Tour) markup, CSS, and JS are omitted.
- Third-party trackers (Autopilot, gtag, HubSpot, CXone chat) are omitted.
- Server-backed AJAX endpoints (`/HazMaterials`, `/servlet/ShipBolServlet`,
  address-book saves, city lookups) are not implemented; the POST target
  `/print-email-bol` accepts GET only.
