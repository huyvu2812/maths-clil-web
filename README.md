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

This first version imports data at build time into `src/data/content.json`; it does not connect to a live database or require database credentials. Interactive worksheet exercises are included in `public/worksheet-content.js` and served by `public/worksheet.html`. The worksheet print button opens the corresponding original PDF from Google Drive so its printed layout matches the source; printing the PDF requires an internet connection.

## Drawing answers, automatic checks and marking

Every worksheet question has a **Write / Draw** choice. Draw opens a drawing pad (`public/drawing-pad.js`) with a 1 cm grid, a line tool that snaps to the grid and to points and shows length and angle, a compass, labelled points, text, a pen and an eraser. The Select tool changes what was drawn: drag an item to move it, drag its round handles to move a line end or change a circle's radius, type an exact length, angle, radius, name or text in the panel under the drawing, nudge with the arrow keys (0.1 cm), or press Delete. The board is unbounded: it opens on a 20 cm page, zooms from 25% to 400% (toolbox buttons, Ctrl + mouse wheel, or the + / - / 0 keys) and pans with the Hand tool, Space + drag or the middle mouse button, so zooming out shows more grid to draw on. It can also go full screen (F). Zooming only changes the view: lengths stay in grid centimetres, and Download PNG and the teacher's view include everything drawn, inside or outside the page. Drawings are saved as vector data in `localStorage` next to the written answers.

- `public/worksheet-drawings.js` adds drawing tasks to questions: locked given figures (`given`) and automatic checks (`check`). Coordinates are in centimetres on the grid. Some figures there replace the ones in the original PDFs, so for those questions the printed PDF shows a different figure.
- `public/drawing-check.js` checks a drawing against its task: constructed shapes (side lengths, right angles, a given angle, diagonals, height), completing a figure symmetrically about an axis or a centre, drawing all axes of symmetry of given shapes, and marking numbers on a number line. Pupils get the result from **Check my drawing**, with wrong lines shown in red.
- **Submit work (file)** downloads the pupil's answers as a `.json` file, which they send to the teacher. The teacher opens the files on `/grade.html`, which re-runs the checks, offers the automatic marks, and lets them score and comment on each question and export the marks as CSV. Marks are kept in that teacher's browser. Pupils can edit their files, so treat the automatic marks as a help, not a proof.

## Adding a picture to a worksheet question

No code changes are needed for a picture:

1. Find the worksheet id in the address bar of the worksheet page: `worksheet.html?lesson=lesson-19` means `lesson-19`. Reviews are `review` (Chapter I) and `chapter-2-review` to `chapter-5-review`.
2. Save the picture as `public/worksheet-figures/<worksheet id>/<question number>.png`, for example `public/worksheet-figures/lesson-19/4.8.png`. `.jpg`, `.jpeg`, `.webp` and `.svg` also work. Review questions are numbered as shown on the page, so question 1 of the Chapter IV review is `chapter-4-review/1.png`.
3. Run `npm run figures` (this also runs on its own before `npm run dev` and `npm run build`; while the dev server is running, run it after adding pictures and reload the page). It lists the pictures in `public/worksheet-figures/manifest.js`, which is generated: do not edit it.

The picture appears under the question's prompt, on the worksheet page and in the teacher's marking page. Use pictures about 500–800 px wide with a white background.

Optional, in `public/worksheet-drawings.js`, under the worksheet id and question number:

```js
"lesson-19": {
  "4.8": {
    figure: { alt: "Four quadrilaterals labelled 1 to 4." }, // description for screen readers
    prompt: "Use the figure below to identify the rectangle and the rhombus.",
    answer: "…",
  },
},
```

- `alt` describes the picture for pupils who use a screen reader. Without it they hear "Figure for question 4.8". Do not give the answer away in it.
- `prompt` and `answer` replace the question text, for example when it still says "Figure 4.11 in the original worksheet PDF".

If something does not match (a misspelt worksheet id, a question number that does not exist, or a description without a picture file), that entry is skipped and the browser console lists it under "worksheet-drawings.js skipped …"; everything else still loads. Open the browser's developer tools (F12) to see it.

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
