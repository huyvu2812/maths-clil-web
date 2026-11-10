# Maths CLIL — Learning Space

A responsive React + Vite prototype based on the supplied `Materials for MathsCLILweb.xlsx` workbook. It runs locally in VS Code and currently uses a JSON data snapshot exported from the workbook, so no database setup is required to preview the app.

## Included pages

- **Home** — learning-space landing page and shortcuts
- **Maths terms** — searchable English/Vietnamese glossary with lesson filtering, examples, IPA and browser text-to-speech pronunciation
- **Flashcards** — searchable flip cards with previous/next controls
- **Worksheets** — interactive HTML worksheets converted from the workbook's PDF resources, with saved progress and suggested answers revealed after learners attempt questions
- **Teaching tips** — opens the Google Docs resource linked in the workbook

## Requirements

- Node.js 20 or newer recommended
- VS Code

## Run locally

1. Unzip the project.
2. Open the `maths-clil-web` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL printed by Vite (usually `http://localhost:5173`).

To test a production build:

```bash
npm run build
npm run preview
```

## Data source

`src/data/content.json` is generated from these sheets:

- `Maths term`
- `flashcard`
- `worksheet`
- `teaching tips`

If the spreadsheet changes, regenerate the JSON snapshot with the included importer:

```bash
python3 -m pip install openpyxl
python3 scripts/import_excel.py
```

By default, the script reads `Materials for MathsCLILweb.xlsx` in the project root. You can also pass a workbook path:

```bash
python3 scripts/import_excel.py "/path/to/your-updated-workbook.xlsx"
```

This first version imports data at build time into `src/data/content.json`; it does not connect to a live database or require database credentials. Worksheet exercises are included in `public/worksheet-content.js` and are served by `public/worksheet.html`, so they open directly inside the site without relying on Google Drive.

## Project structure

```text
src/
  App.jsx
  main.jsx
  styles.css
  data/
    content.json
index.html
package.json
```

## Design note

The Canva edit URL did not expose a readable preview in the environment used to generate this project, so the UI is a first-pass, responsive educational design inspired by the “Understand the maths concept” tagline and the reference site's learning-resource structure. To match the Canva design pixel-for-pixel, export the Canva design as PNG/PDF or send screenshots of the key screens and the styling can be adjusted against them.

## Next recommended steps

1. Confirm the UI against the Canva design.
2. Decide whether content needs a teacher/admin dashboard.
3. Add Firebase/another database only if the content must be edited without rebuilding the frontend.
4. Confirm users access their saved worksheet answers from the same browser and device.
