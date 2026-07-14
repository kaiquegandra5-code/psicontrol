import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

/**
 * Replace {{placeholders}} inside a template with provided values.
 * Missing placeholders are left as-is.
 */
export function fillTemplate(
  template: string,
  values: Record<string, string | number | null | undefined>
): string {
  return template.replace(/\{\{\s*([\w_]+)\s*\}\}/g, (match, key) => {
    const v = values[key];
    if (v === null || v === undefined || v === "") return match;
    return String(v);
  });
}

interface PdfOptions {
  title: string;
  content: string;
  authorName?: string;
  authorCrp?: string;
  patientName?: string;
}

/**
 * Generate a clean, professional clinical PDF using pdf-lib.
 * Supports Portuguese text via WinAnsi encoding (default fonts).
 */
export async function generateClinicalPdf({
  title,
  content,
  authorName,
  authorCrp,
  patientName,
}: PdfOptions): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(title);
  pdfDoc.setAuthor(authorName ?? "");
  pdfDoc.setCreator("Psiorganizer");
  pdfDoc.setProducer("Psiorganizer");

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // A4: 595.28 x 841.89
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 64;
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = 14;
  const fontSize = 11;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Header: brand bar
  page.drawRectangle({
    x: 0,
    y: pageHeight - 4,
    width: pageWidth,
    height: 4,
    color: rgb(0, 0.345, 0.745),
  });

  // Title
  page.drawText(title, {
    x: margin,
    y: y - 20,
    size: 18,
    font: helveticaBold,
    color: rgb(0.067, 0.11, 0.176),
  });

  y -= 48;

  // Meta info
  if (patientName) {
    page.drawText(`Paciente: ${patientName}`, {
      x: margin,
      y,
      size: 10,
      font: helvetica,
      color: rgb(0.26, 0.28, 0.33),
    });
    y -= lineHeight + 2;
  }

  page.drawText(`Data de emissão: ${new Date().toLocaleDateString("pt-BR")}`, {
    x: margin,
    y,
    size: 10,
    font: helvetica,
    color: rgb(0.26, 0.28, 0.33),
  });
  y -= lineHeight + 2;

  // Divider
  page.drawLine({
    start: { x: margin, y: y - 4 },
    end: { x: pageWidth - margin, y: y - 4 },
    thickness: 0.5,
    color: rgb(0.76, 0.78, 0.84),
  });
  y -= 24;

  // Body
  drawTextLines(
    page,
    content,
    {
      x: margin,
      y,
      maxWidth: contentWidth,
      lineHeight,
      fontSize,
      font: helvetica,
      pageHeight,
      margin,
      newPage: () => pdfDoc.addPage([pageWidth, pageHeight]),
    },
    helvetica,
    helveticaBold
  );

  // Footer on every page
  const pages = pdfDoc.getPages();
  pages.forEach((p, i) => {
    drawFooter(p, helvetica, helveticaOblique, i + 1, pages.length, authorName, authorCrp);
  });

  return await pdfDoc.save();
}

function drawTextLines(
  page: PDFPage,
  text: string,
  options: {
    x: number;
    y: number;
    maxWidth: number;
    lineHeight: number;
    fontSize: number;
    font: PDFFont;
    pageHeight: number;
    margin: number;
    newPage: () => PDFPage;
  },
  helvetica: PDFFont,
  helveticaBold: PDFFont
) {
  let { x, y, maxWidth, lineHeight, fontSize, font, pageHeight, margin } = options;
  let currentPage = page;

  // Normalize line endings
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");

  for (let p = 0; p < paragraphs.length; p++) {
    const paragraph = paragraphs[p];

    if (paragraph.trim() === "") {
      y -= lineHeight * 0.6;
      continue;
    }

    // Detect simple section header (line in ALL CAPS or starting with section)
    const isHeader = /^[A-ZÀ-Ú\s]{8,}$/.test(paragraph.trim()) || paragraph.startsWith("# ");
    const isBullet = /^\s*[-•]\s+/.test(paragraph);
    const useFont = isHeader ? helveticaBold : helvetica;
    const useSize = isHeader ? fontSize + 1 : fontSize;
    const indent = isBullet ? 14 : 0;

    const cleanParagraph = paragraph.replace(/^#\s+/, "").replace(/^\s*[-•]\s+/, "•  ");

    const words = cleanParagraph.split(/(\s+)/);
    let line = "";
    for (const word of words) {
      const testLine = line + word;
      const width = useFont.widthOfTextAtSize(testLine, useSize);
      if (width > maxWidth - indent) {
        // Draw current line
        currentPage.drawText(line.trimEnd(), {
          x: x + indent,
          y,
          size: useSize,
          font: useFont,
          color: rgb(0.067, 0.11, 0.176),
        });
        y -= lineHeight;

        // New page if needed
        if (y < margin + 60) {
          currentPage = options.newPage();
          y = pageHeight - margin;
        }
        line = word.trimStart();
      } else {
        line = testLine;
      }
    }

    if (line.trim()) {
      currentPage.drawText(line, {
        x: x + indent,
        y,
        size: useSize,
        font: useFont,
        color: rgb(0.067, 0.11, 0.176),
      });
      y -= lineHeight;
    }

    // Extra space after paragraph
    y -= isHeader ? 4 : 4;

    if (y < margin + 60) {
      currentPage = options.newPage();
      y = pageHeight - margin;
    }
  }
}

function drawFooter(
  page: PDFPage,
  helvetica: PDFFont,
  italic: PDFFont,
  pageNum: number,
  total: number,
  authorName?: string,
  authorCrp?: string
) {
  const { width, height } = page.getSize();
  const margin = 48;
  const y = margin / 2;

  page.drawLine({
    start: { x: margin, y: y + 12 },
    end: { x: width - margin, y: y + 12 },
    thickness: 0.3,
    color: rgb(0.76, 0.78, 0.84),
  });

  const left = authorName
    ? `${authorName}${authorCrp ? ` · CRP ${authorCrp}` : ""}`
    : "Psiorganizer";
  page.drawText(left, {
    x: margin,
    y,
    size: 8,
    font: helvetica,
    color: rgb(0.45, 0.47, 0.52),
  });

  page.drawText(`Página ${pageNum} de ${total}`, {
    x: width - margin - helvetica.widthOfTextAtSize(`Página ${pageNum} de ${total}`, 8),
    y,
    size: 8,
    font: italic,
    color: rgb(0.45, 0.47, 0.52),
  });
}
