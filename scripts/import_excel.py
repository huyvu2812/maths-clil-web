import json
import re
import sys
from pathlib import Path
from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "Materials for MathsCLILweb.xlsx"
if not SOURCE.is_absolute():
    SOURCE = (Path.cwd() / SOURCE).resolve()

wb = load_workbook(SOURCE, data_only=True)

terms = []
current_lesson = "General"
for row in wb["Maths term"].iter_rows(min_row=3, values_only=True):
    row = list(row) + [None] * 6
    number, lesson, vi, en, example, ipa = row[:6]
    if lesson and str(lesson).strip():
        current_lesson = re.sub(r"\s+", " ", str(lesson)).strip()
    if vi is None and en is None:
        continue
    terms.append({
        "id": str(number if number is not None else len(terms) + 1),
        "lesson": current_lesson,
        "vietnamese": str(vi).strip() if vi is not None else "",
        "english": str(en).strip() if en is not None else "",
        "example": str(example).strip() if example is not None else "",
        "ipa": str(ipa).strip() if ipa is not None else ""
    })

flashcards = []
for row in wb["flashcard"].iter_rows(min_row=3, values_only=True):
    row = list(row) + [None] * 5
    card_id, chapter_code, vietnamese, english, example = row[:5]
    if not any(v is not None for v in [card_id, chapter_code, vietnamese, english, example]):
        continue
    flashcards.append({
        "id": str(card_id).strip() if card_id is not None else f"FC_{len(flashcards)+1:02d}",
        "chapterCode": str(chapter_code).strip() if chapter_code is not None else "",
        "vietnamese": str(vietnamese).strip() if vietnamese is not None else "",
        "english": str(english).strip() if english is not None else "",
        "example": str(example).strip() if example is not None else ""
    })

worksheets = []
current_chapter = "Resources"
for row in wb["worksheet"].iter_rows(values_only=True):
    row = list(row) + [None] * 3
    chapter, lesson, url = row[:3]
    if chapter is not None and str(chapter).strip():
        current_chapter = str(chapter).strip()
    if lesson or url:
        worksheets.append({
            "chapter": current_chapter,
            "lesson": str(lesson).strip() if lesson is not None else "Resource",
            "url": str(url).strip() if url is not None else ""
        })

tips_url = ""
for row in wb["teaching tips"].iter_rows(values_only=True):
    for cell in row:
        if cell and str(cell).strip().startswith("http"):
            tips_url = str(cell).strip()
            break
    if tips_url:
        break

data = {
    "siteName": "Maths CLIL",
    "tagline": "Understand the maths concept",
    "terms": terms,
    "flashcards": flashcards,
    "worksheets": worksheets,
    "teachingTipsUrl": tips_url,
    "sourceWorkbook": SOURCE.name
}
target = ROOT / "src" / "data" / "content.json"
target.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Updated {target}")
print(f"Imported {len(terms)} terms, {len(flashcards)} flashcards, {len(worksheets)} worksheet/resource links.")
