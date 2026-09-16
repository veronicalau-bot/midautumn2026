# Content sources and publication checklist

This prototype separates official guidance from illustrative estimates. Review every item below before public launch.

## Official Hong Kong sources

- Centre for Health Protection, Department of Health: "Preparing for Exercise"
  - https://www.chp.gov.hk/en/static/90004.html
  - Used for clothing, footwear, hydration, warm-up, symptoms that require stopping, and weather awareness.
  - Page revision shown during research: 4 June 2026.
- Centre for Food Safety: Nutrition Labelling Scheme
  - https://www.cfs.gov.hk/english/programme/programme_nifl/programme_nifl.html
  - Used for nutrition-label context. Replace sample mooncake values with a named product label or a verified CFS publication before launch.
- Hong Kong Observatory
  - https://www.hko.gov.hk/
  - Link to current forecasts and warnings. The prototype does not claim to display live warning data.
- Harbourfront Commission
  - https://www.waterfront.hk/
  - Verify promenade names, access and current works before launch.
- Leisure and Cultural Services Department
  - https://www.lcsd.gov.hk/
  - Verify park facilities and opening arrangements before launch.
- Transport Department / MTR
  - https://www.td.gov.hk/
  - https://www.mtr.com.hk/
  - Verify route access and station exits before launch.

## Estimates requiring review

- Route distances and map lines in `src/App.tsx` are illustrative, not government-certified route measurements.
- Energy uses `MET x body weight in kg x hours`. Current speed bands are prototype values and must be checked against a cited edition of the Compendium of Physical Activities or reviewed by a qualified health professional.
- Mooncake energy values are placeholders representing broad product styles. Replace each with product name, package serving size, label image permission, value and retrieval date.

## Library resources

- The published Google Sheet CSV is the live source of truth:
  - https://docs.google.com/spreadsheets/d/e/2PACX-1vQuH-ct_RJapHBKleDnpXfI1HTB9HRM7ie77Oy4KIcqToP_1vA_i-cNHFsVi6uP_PBSPnzM0GJNqO_b/pub?output=csv
- Keep the column names `Title`, `Link`, `Cover` and `Type`. Extra spaces around names and values are ignored.
- `Title` and `Link` are required. Rows missing either value are not displayed.
- `Cover` is optional and must be a direct `http` or `https` image URL. A title-based fallback is shown when it is empty or fails to load.
- Use `eBook` or `Physical Book` in `Type`; these display as `電子書` or `實體書` in Chinese.
- Keep the sheet published to the web as CSV. Changes appear when a visitor next loads or refreshes the page; Google may cache published changes briefly.
- Use permanent catalogue records supplied by Academy Libraries for `Link`.
- Confirm cover-image permission. Prefer publisher media kits, licensed cover services or library-owned artwork.
- Test every generated QR code on both iOS and Android before publishing.

## Final sign-off

- Health or sports unit: calculation assumptions, wording and safety advice.
- Library: titles, metadata, permanent links and image rights.
- Activity owner: route status, transport, facilities and bilingual copy.
- Web owner: accessibility, mobile rendering, privacy and external-link checks.