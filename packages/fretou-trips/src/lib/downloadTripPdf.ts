import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { TripDetail } from "../types/trips";
import { buildTripPdfContent, type PdfField, type PdfTimelineItem, type TripPdfContent } from "./tripPdfContent";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 36;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_LIMIT = 52;

const NAVY = rgb(13 / 255, 32 / 255, 86 / 255);
const BRAND = rgb(28 / 255, 68 / 255, 242 / 255);
const MUTED = rgb(92 / 255, 107 / 255, 138 / 255);
const INK = rgb(77 / 255, 91 / 255, 124 / 255);
const LINE = rgb(215 / 255, 222 / 255, 238 / 255);
const CANVAS = rgb(244 / 255, 247 / 255, 253 / 255);
const WHITE = rgb(1, 1, 1);

const STATUS_TONE: Record<TripPdfContent["status"], { background: ReturnType<typeof rgb>; text: ReturnType<typeof rgb> }> = {
  AGUARDANDO_CTE: { background: CANVAS, text: MUTED },
  AGUARDANDO_FOTO: { background: rgb(254 / 255, 243 / 255, 199 / 255), text: rgb(146 / 255, 64 / 255, 14 / 255) },
  CARREGADA: { background: rgb(232 / 255, 237 / 255, 253 / 255), text: BRAND },
  EM_TRANSITO: { background: rgb(232 / 255, 237 / 255, 253 / 255), text: BRAND },
  AGUARDANDO_COMPROVANTE: { background: rgb(209 / 255, 250 / 255, 229 / 255), text: rgb(6 / 255, 95 / 255, 70 / 255) },
  AGUARDANDO_PAGAMENTO: { background: rgb(254 / 255, 243 / 255, 199 / 255), text: rgb(146 / 255, 64 / 255, 14 / 255) },
  FINALIZADA: { background: rgb(231 / 255, 234 / 255, 243 / 255), text: NAVY },
  CANCELADA: { background: CANVAS, text: MUTED },
};

function pdfSafe(value: string): string {
  return Array.from(value)
    .map((char) => {
      if (char === "\u2014" || char === "\u2013" || char === "\u2192") return "-";
      const code = char.codePointAt(0) ?? 0;
      if (code === 0x20 || (code >= 0x21 && code <= 0x7e) || (code >= 0xa1 && code <= 0xff)) return char;
      return " ";
    })
    .join("")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const safe = pdfSafe(text) || "-";
  const words = safe.split(" ");
  const lines: string[] = [];
  let current = "";

  function pushLongWord(word: string) {
    let chunk = "";
    for (const char of word) {
      const trial = chunk + char;
      if (font.widthOfTextAtSize(trial, size) > maxWidth && chunk) {
        lines.push(chunk);
        chunk = char;
      } else {
        chunk = trial;
      }
    }
    current = chunk;
  }

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    if (font.widthOfTextAtSize(word, size) <= maxWidth) current = word;
    else pushLongWord(word);
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : ["-"];
}

function dataUrlBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function rasterizeLogo(): Promise<Uint8Array | null> {
  if (typeof document === "undefined") return null;
  try {
    const response = await fetch("/logo-fretou.svg");
    if (!response.ok) return null;
    const svg = await response.text();
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    try {
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("logo"));
        image.src = url;
      });
      const scale = 4;
      const canvas = document.createElement("canvas");
      canvas.width = 208 * scale;
      canvas.height = 60 * scale;
      const context = canvas.getContext("2d");
      if (!context) return null;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return dataUrlBytes(canvas.toDataURL("image/png"));
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return null;
  }
}

class TripPdfWriter {
  private page!: PDFPage;
  private top = 0;
  private readonly pages: PDFPage[] = [];

  private constructor(
    private readonly pdf: PDFDocument,
    private readonly font: PDFFont,
    private readonly bold: PDFFont,
    private readonly content: TripPdfContent,
    private readonly logo: PDFImage | null,
  ) {}

  static async create(content: TripPdfContent, logoBytes: Uint8Array | null) {
    const pdf = await PDFDocument.create();
    pdf.setTitle(`Viagem ${content.code}`);
    pdf.setAuthor("Fretou Brasil");
    pdf.setSubject("Relatório interno da viagem");
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const logo = logoBytes ? await pdf.embedPng(logoBytes) : null;
    const writer = new TripPdfWriter(pdf, font, bold, content, logo);
    writer.addPage(true);
    return writer;
  }

  private addPage(first: boolean) {
    this.page = this.pdf.addPage([PAGE_W, PAGE_H]);
    this.pages.push(this.page);
    this.page.drawRectangle({ x: 0, y: PAGE_H - 6, width: PAGE_W, height: 6, color: BRAND });
    if (first) {
      this.top = 22;
      this.drawCover();
      return;
    }
    this.top = 22;
    this.drawText(this.bold, 10, NAVY, "Fretou Brasil", MARGIN, this.top);
    const continued = pdfSafe(`${this.content.code} · continuação`);
    const width = this.font.widthOfTextAtSize(continued, 9);
    this.page.drawText(continued, {
      x: PAGE_W - MARGIN - width,
      y: PAGE_H - this.top - 10,
      size: 9,
      font: this.font,
      color: MUTED,
    });
    this.top = 42;
    this.rule();
    this.top += 16;
  }

  private drawCover() {
    const logoHeight = 32;
    const logoWidth = this.logo ? (this.logo.width / this.logo.height) * logoHeight : 0;
    if (this.logo) {
      this.page.drawImage(this.logo, {
        x: MARGIN,
        y: PAGE_H - this.top - logoHeight,
        width: logoWidth,
        height: logoHeight,
      });
    } else {
      this.drawText(this.bold, 14, NAVY, "Fretou Brasil", MARGIN, this.top + 8);
    }

    const textX = MARGIN + Math.max(logoWidth, 108) + 18;
    const textW = PAGE_W - MARGIN - textX;
    let textTop = this.top;
    this.drawText(this.bold, 8, BRAND, "RELATÓRIO DE VIAGEM", textX, textTop);
    textTop += 16;
    this.drawText(this.bold, 16, NAVY, this.content.code, textX, textTop);
    textTop += 20;
    for (const line of wrapText(this.content.client, this.bold, 11, textW)) {
      this.drawText(this.bold, 11, NAVY, line, textX, textTop);
      textTop += 14;
    }
    for (const line of wrapText(this.content.route, this.font, 9, textW)) {
      this.drawText(this.font, 9, MUTED, line, textX, textTop);
      textTop += 12;
    }
    this.drawText(this.font, 8, MUTED, `Gerado em ${this.content.generatedAt}`, textX, textTop);

    this.top = Math.max(this.top + logoHeight, textTop + 10) + 14;
    this.rule();
    this.top += 14;
    this.drawStatus();
    this.drawHint();
  }

  private drawStatus() {
    const tone = STATUS_TONE[this.content.status];
    const label = pdfSafe(this.content.statusLabel);
    const width = this.bold.widthOfTextAtSize(label, 9) + 16;
    const height = 18;
    this.page.drawRectangle({
      x: MARGIN,
      y: PAGE_H - this.top - height,
      width,
      height,
      color: tone.background,
    });
    this.page.drawText(label, {
      x: MARGIN + 8,
      y: PAGE_H - this.top - 13,
      size: 9,
      font: this.bold,
      color: tone.text,
    });
    this.top += height + 10;
  }

  private drawHint() {
    const lines = wrapText(this.content.hint, this.font, 9, CONTENT_W - 24);
    const height = 16 + lines.length * 13;
    this.ensure(height);
    this.page.drawRectangle({
      x: MARGIN,
      y: PAGE_H - this.top - height,
      width: CONTENT_W,
      height,
      color: CANVAS,
    });
    this.page.drawRectangle({
      x: MARGIN,
      y: PAGE_H - this.top - height,
      width: 3,
      height,
      color: BRAND,
    });
    let lineTop = this.top + 10;
    for (const line of lines) {
      this.drawText(this.font, 9, INK, line, MARGIN + 14, lineTop);
      lineTop += 13;
    }
    this.top += height + 8;
  }

  private rule() {
    this.page.drawLine({
      start: { x: MARGIN, y: PAGE_H - this.top },
      end: { x: PAGE_W - MARGIN, y: PAGE_H - this.top },
      thickness: 1,
      color: LINE,
    });
  }

  private drawText(font: PDFFont, size: number, color: ReturnType<typeof rgb>, text: string, x: number, top: number) {
    const safe = pdfSafe(text);
    if (!safe) return;
    this.page.drawText(safe, {
      x,
      y: PAGE_H - top - size,
      size,
      font,
      color,
    });
  }

  private ensure(height: number) {
    if (this.top + height <= PAGE_H - FOOTER_LIMIT) return;
    this.addPage(false);
  }

  section(title: string) {
    this.ensure(120);
    this.top += 12;
    this.page.drawRectangle({
      x: MARGIN,
      y: PAGE_H - this.top - 12,
      width: 3,
      height: 12,
      color: BRAND,
    });
    this.drawText(this.bold, 9, BRAND, title.toUpperCase(), MARGIN + 10, this.top);
    this.top += 16;
    this.rule();
    this.top += 12;
  }

  fields(items: PdfField[], columns = 2) {
    const gap = 12;
    const columnW = (CONTENT_W - gap * (columns - 1)) / columns;
    for (let index = 0; index < items.length; index += columns) {
      const row = items.slice(index, index + columns);
      const wrapped = row.map((item) => ({
        label: item.label,
        lines: wrapText(item.value, this.bold, 10, columnW),
      }));
      const height = 14 + Math.max(...wrapped.map((item) => item.lines.length)) * 13;
      this.ensure(height + 8);
      wrapped.forEach((item, column) => {
        const x = MARGIN + column * (columnW + gap);
        this.drawText(this.bold, 8, MUTED, item.label.toUpperCase(), x, this.top);
        item.lines.forEach((line, lineIndex) => {
          this.drawText(this.bold, 10, NAVY, line, x, this.top + 13 + lineIndex * 13);
        });
      });
      this.top += height + 10;
    }
  }

  highlights(items: PdfField[]) {
    const gap = 8;
    const boxW = (CONTENT_W - gap * Math.max(items.length - 1, 0)) / Math.max(items.length, 1);
    const values = items.map((item) => wrapText(item.value, this.bold, 11, boxW - 20).slice(0, 2));
    const height = 36 + Math.max(...values.map((lines) => lines.length)) * 14;
    this.ensure(height + 8);
    items.forEach((item, index) => {
      const x = MARGIN + index * (boxW + gap);
      this.page.drawRectangle({
        x,
        y: PAGE_H - this.top - height,
        width: boxW,
        height,
        color: CANVAS,
        borderColor: LINE,
        borderWidth: 1,
      });
      this.drawText(this.bold, 7, MUTED, item.label.toUpperCase(), x + 10, this.top + 8);
      values[index]?.forEach((line, lineIndex) => {
        this.drawText(this.bold, 11, NAVY, line, x + 10, this.top + 24 + lineIndex * 14);
      });
    });
    this.top += height + 12;
  }

  timeline(items: PdfTimelineItem[]) {
    for (const item of items) {
      const detail = wrapText(item.detail, this.font, 9, CONTENT_W - 22);
      const height = 16 + detail.length * 12;
      this.ensure(height + 8);
      const centerY = PAGE_H - this.top - 8;
      this.page.drawEllipse({
        x: MARGIN + 4,
        y: centerY,
        xScale: 4,
        yScale: 4,
        color: item.done ? BRAND : WHITE,
        borderColor: item.done ? BRAND : LINE,
        borderWidth: 1.2,
      });
      this.drawText(this.bold, 10, item.done ? NAVY : MUTED, item.title, MARGIN + 16, this.top);
      detail.forEach((line, lineIndex) => {
        this.drawText(this.font, 9, INK, line, MARGIN + 16, this.top + 14 + lineIndex * 12);
      });
      this.top += height + 6;
    }
  }

  async photo(dataUrl: string) {
    const bytes = dataUrlBytes(dataUrl);
    let image: PDFImage;
    try {
      image = /^data:image\/png/i.test(dataUrl) ? await this.pdf.embedPng(bytes) : await this.pdf.embedJpg(bytes);
    } catch {
      this.ensure(16);
      this.drawText(this.font, 9, MUTED, "A foto não pôde ser incluída neste PDF.", MARGIN, this.top);
      this.top += 18;
      return;
    }
    const maxH = 220;
    const scale = Math.min(1, CONTENT_W / image.width, maxH / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    this.ensure(height + 8);
    this.page.drawRectangle({
      x: MARGIN,
      y: PAGE_H - this.top - height - 8,
      width: CONTENT_W,
      height: height + 8,
      color: CANVAS,
    });
    this.page.drawImage(image, {
      x: MARGIN + (CONTENT_W - width) / 2,
      y: PAGE_H - this.top - height - 4,
      width,
      height,
    });
    this.top += height + 16;
  }

  private drawFooters() {
    const total = this.pages.length;
    this.pages.forEach((page, index) => {
      const y = 28;
      page.drawLine({
        start: { x: MARGIN, y: 40 },
        end: { x: PAGE_W - MARGIN, y: 40 },
        thickness: 1,
        color: LINE,
      });
      page.drawText(pdfSafe("Fretou Brasil  ·  Documento interno da operação"), {
        x: MARGIN,
        y,
        size: 8,
        font: this.font,
        color: MUTED,
      });
      const pageLabel = `Página ${index + 1} de ${total}`;
      const width = this.font.widthOfTextAtSize(pageLabel, 8);
      page.drawText(pageLabel, {
        x: PAGE_W - MARGIN - width,
        y,
        size: 8,
        font: this.font,
        color: MUTED,
      });
    });
  }

  async bytes(): Promise<Uint8Array> {
    this.drawFooters();
    return this.pdf.save();
  }
}

export async function buildTripPdf(trip: TripDetail): Promise<{ fileName: string; bytes: Uint8Array }> {
  const content = buildTripPdfContent(trip);
  const logoBytes = await rasterizeLogo();
  const writer = await TripPdfWriter.create(content, logoBytes);
  writer.section("Identificação");
  writer.fields(content.identification);
  writer.section("Rota e carga");
  writer.fields(content.routeFields);
  writer.section("Financeiro");
  writer.highlights(content.financeHighlights);
  writer.fields(content.financeDetails);
  writer.section("CT-e");
  writer.fields(content.cte);
  writer.section("Linha do tempo");
  writer.timeline(content.timeline);
  if (content.photo) {
    writer.section("Foto do caminhão carregado");
    await writer.photo(content.photo);
  }
  return { fileName: content.fileName, bytes: await writer.bytes() };
}

export async function downloadTripPdf(trip: TripDetail): Promise<void> {
  const { fileName, bytes } = await buildTripPdf(trip);
  const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
