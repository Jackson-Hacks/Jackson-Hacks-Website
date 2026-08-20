"""Generate the public Jackson Hacks legal PDFs from the website content."""

from __future__ import annotations

import json
import shutil
from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


SCRIPT_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = SCRIPT_DIR.parent
REPO_DIR = FRONTEND_DIR.parent
SOURCE = FRONTEND_DIR / "src" / "content" / "legalDocuments.json"
OUTPUT_DIR = REPO_DIR / "output" / "pdf"
PUBLIC_DIR = FRONTEND_DIR / "public" / "documents"

BRAND_DARK = colors.HexColor("#272727")
BRAND_BLUE = colors.HexColor("#2072C7")
BRAND_BLUE_DARK = colors.HexColor("#084F9A")
BRAND_ORANGE = colors.HexColor("#F68A42")
TEXT = colors.HexColor("#33383D")
MUTED = colors.HexColor("#68717A")
LIGHT = colors.HexColor("#EEF4FA")
AMBER_LIGHT = colors.HexColor("#FFF5D6")


def register_fonts() -> tuple[str, str]:
    candidates = [
        Path("C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/Arial.ttf"),
    ]
    bold_candidates = [
        Path("C:/Windows/Fonts/arialbd.ttf"),
        Path("C:/Windows/Fonts/Arialbd.ttf"),
    ]
    regular = next((path for path in candidates if path.exists()), None)
    bold = next((path for path in bold_candidates if path.exists()), None)
    if regular and bold:
        pdfmetrics.registerFont(TTFont("JacksonSans", str(regular)))
        pdfmetrics.registerFont(TTFont("JacksonSans-Bold", str(bold)))
        return "JacksonSans", "JacksonSans-Bold"
    return "Helvetica", "Helvetica-Bold"


FONT, FONT_BOLD = register_fonts()


def build_styles():
    styles = getSampleStyleSheet()
    return {
        "eyebrow": ParagraphStyle(
            "Eyebrow",
            parent=styles["Normal"],
            fontName=FONT_BOLD,
            fontSize=9,
            leading=12,
            textColor=BRAND_ORANGE,
            alignment=TA_CENTER,
            spaceAfter=9,
        ),
        "title": ParagraphStyle(
            "Title",
            parent=styles["Title"],
            fontName=FONT_BOLD,
            fontSize=24,
            leading=29,
            textColor=BRAND_DARK,
            alignment=TA_CENTER,
            spaceAfter=10,
        ),
        "summary": ParagraphStyle(
            "Summary",
            parent=styles["Normal"],
            fontName=FONT,
            fontSize=10.5,
            leading=15,
            textColor=MUTED,
            alignment=TA_CENTER,
            spaceAfter=7,
        ),
        "meta": ParagraphStyle(
            "Meta",
            parent=styles["Normal"],
            fontName=FONT,
            fontSize=8.5,
            leading=11,
            textColor=MUTED,
            alignment=TA_CENTER,
            spaceAfter=18,
        ),
        "heading": ParagraphStyle(
            "Heading",
            parent=styles["Heading2"],
            fontName=FONT_BOLD,
            fontSize=13,
            leading=17,
            textColor=BRAND_BLUE_DARK,
            spaceBefore=10,
            spaceAfter=6,
            keepWithNext=True,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=styles["BodyText"],
            fontName=FONT,
            fontSize=9.25,
            leading=13.5,
            textColor=TEXT,
            spaceAfter=7,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=styles["BodyText"],
            fontName=FONT,
            fontSize=9.25,
            leading=13.5,
            textColor=TEXT,
            leftIndent=15,
            firstLineIndent=-8,
            bulletIndent=0,
            spaceAfter=4,
        ),
        "note": ParagraphStyle(
            "Note",
            parent=styles["BodyText"],
            fontName=FONT_BOLD,
            fontSize=9.25,
            leading=13.5,
            textColor=colors.HexColor("#6F5200"),
        ),
        "field": ParagraphStyle(
            "Field",
            parent=styles["BodyText"],
            fontName=FONT,
            fontSize=9,
            leading=12,
            textColor=TEXT,
        ),
    }


STYLES = build_styles()


def draw_page(canvas, doc):
    canvas.saveState()
    width, height = letter
    canvas.setFillColor(BRAND_DARK)
    canvas.rect(0, height - 0.36 * inch, width, 0.36 * inch, fill=1, stroke=0)
    canvas.setFillColor(BRAND_ORANGE)
    canvas.rect(0, height - 0.39 * inch, width, 0.03 * inch, fill=1, stroke=0)
    canvas.setFont(FONT_BOLD, 8)
    canvas.setFillColor(colors.white)
    canvas.drawString(0.65 * inch, height - 0.24 * inch, "JACKSON HACKS")
    canvas.setFont(FONT, 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.65 * inch, 0.38 * inch, "jacksonhacks.com  |  ayjacksonhacks@gmail.com")
    canvas.drawRightString(width - 0.65 * inch, 0.38 * inch, f"Page {doc.page}")
    canvas.restoreState()


def status_box(text: str):
    table = Table([[Paragraph(escape(text), STYLES["note"])]], colWidths=[6.9 * inch])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), AMBER_LIGHT),
        ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#D7A700")),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return table


def signature_fields(fields: list[str]):
    flowables = [PageBreak(), Paragraph("Signature information", STYLES["heading"])]
    flowables.append(Paragraph(
        "Complete this section only after acceptance. Use additional space if needed. A parent or guardian must sign when the participant is under 18.",
        STYLES["body"],
    ))
    for field in fields:
        flowables.extend([
            Spacer(1, 8),
            Paragraph(escape(field), STYLES["field"]),
            Spacer(1, 12),
            Table([[""]], colWidths=[6.7 * inch], rowHeights=[1], style=[
                ("LINEBELOW", (0, 0), (-1, -1), 0.7, MUTED),
            ]),
        ])
    return flowables


def build_document(document: dict, legal_content: dict, destination: Path):
    doc = SimpleDocTemplate(
        str(destination),
        pagesize=letter,
        rightMargin=0.65 * inch,
        leftMargin=0.65 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.65 * inch,
        title=f"Jackson Hacks - {document['title']}",
        author="Jackson Hacks organizing team",
        subject=document["summary"],
    )
    story = [
        Spacer(1, 8),
        Paragraph("JACKSON HACKS 2026", STYLES["eyebrow"]),
        Paragraph(escape(document["title"]), STYLES["title"]),
        Paragraph(escape(document["summary"]), STYLES["summary"]),
        Paragraph(
            f"Version {escape(legal_content['version'])} | Last updated {escape(legal_content['lastUpdated'])}",
            STYLES["meta"],
        ),
    ]
    if document.get("status"):
        story.extend([status_box(document["status"]), Spacer(1, 10)])

    for section in document["sections"]:
        heading = Paragraph(escape(section["heading"]), STYLES["heading"])
        first_content = None
        if section.get("paragraphs"):
            first_content = Paragraph(escape(section["paragraphs"][0]), STYLES["body"])
        elif section.get("bullets"):
            first_content = Paragraph(f"• {escape(section['bullets'][0])}", STYLES["bullet"])
        if first_content:
            story.append(KeepTogether([heading, first_content]))
        else:
            story.append(heading)

        for paragraph in section.get("paragraphs", [])[1:]:
            story.append(Paragraph(escape(paragraph), STYLES["body"]))
        bullets = section.get("bullets", [])
        start = 1 if bullets and not section.get("paragraphs") else 0
        for bullet in bullets[start:]:
            story.append(Paragraph(f"• {escape(bullet)}", STYLES["bullet"]))
        story.append(Spacer(1, 2))

    if document.get("formFields"):
        story.extend(signature_fields(document["formFields"]))

    doc.build(story, onFirstPage=draw_page, onLaterPages=draw_page)


def main():
    legal_content = json.loads(SOURCE.read_text(encoding="utf-8"))
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    for document in legal_content["documents"]:
        filename = Path(document["pdf"]).name
        output_path = OUTPUT_DIR / filename
        build_document(document, legal_content, output_path)
        shutil.copy2(output_path, PUBLIC_DIR / filename)
        print(output_path)


if __name__ == "__main__":
    main()
