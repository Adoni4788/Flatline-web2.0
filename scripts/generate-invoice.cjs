const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  PageBreak, Footer, PageNumber, LevelFormat
} = require('docx');
const fs = require('fs');
const path = require('path');

const RED = "8B1A1A";
const DARKGRAY = "1F2937";
const LIGHTGRAY = "F3F4F6";
const MIDGRAY = "6B7280";
const WHITE = "FFFFFF";
const BLACK = "111827";

const border = { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" };
const cellBorders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

const today = new Date();
const dueDate = new Date(today);
dueDate.setDate(dueDate.getDate() + 7);
const fmt = d => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const invoiceNum = `FST-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}01`;

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22, color: BLACK } } }
  },
  sections: [{
    properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" } },
          spacing: { before: 100 },
          children: [new TextRun({ text: "FST Solutions Ltd  ·  info@fstsolutionsltd.com  ·  876 298 2262 / 876 593 7721", size: 18, color: MIDGRAY })]
        })]
      })
    },
    children: [

      // ─── HEADER BAR ──────────────────────────────────────────
      new Table({
        columnWidths: [5500, 3860],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        rows: [new TableRow({
          children: [
            new TableCell({
              borders: noBorders,
              width: { size: 5500, type: WidthType.DXA },
              shading: { fill: WHITE, type: ShadingType.CLEAR },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({ children: [new TextRun({ text: "FST SOLUTIONS LTD", bold: true, size: 48, color: RED })] }),
                new Paragraph({ children: [new TextRun({ text: "Technology & Training Solutions", size: 20, color: MIDGRAY })] }),
                new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: "info@fstsolutionsltd.com  |  876 298 2262 / 876 593 7721", size: 18, color: MIDGRAY })] }),
              ]
            }),
            new TableCell({
              borders: noBorders,
              width: { size: 3860, type: WidthType.DXA },
              shading: { fill: WHITE, type: ShadingType.CLEAR },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "INVOICE", bold: true, size: 52, color: DARKGRAY })] }),
                new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: invoiceNum, size: 22, color: MIDGRAY })] }),
              ]
            })
          ]
        })]
      }),

      new Paragraph({
        spacing: { before: 240, after: 240 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: RED } },
        children: [new TextRun("")]
      }),

      // ─── BILL TO / INVOICE DETAILS ───────────────────────────
      new Table({
        columnWidths: [4680, 4680],
        margins: { top: 80, bottom: 80, left: 0, right: 0 },
        rows: [new TableRow({
          children: [
            new TableCell({
              borders: noBorders,
              width: { size: 4680, type: WidthType.DXA },
              shading: { fill: WHITE, type: ShadingType.CLEAR },
              children: [
                new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "BILL TO", bold: true, size: 20, color: MIDGRAY })] }),
                new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "[Client Name]", bold: true, size: 24, color: DARKGRAY })] }),
                new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "[Client Company]", size: 22, color: BLACK })] }),
                new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "[Client Address]", size: 22, color: BLACK })] }),
                new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "[Client Email]", size: 22, color: BLACK })] }),
                new Paragraph({ children: [new TextRun({ text: "[Client Phone]", size: 22, color: BLACK })] }),
              ]
            }),
            new TableCell({
              borders: noBorders,
              width: { size: 4680, type: WidthType.DXA },
              shading: { fill: WHITE, type: ShadingType.CLEAR },
              children: [
                ...[
                  ["Invoice No.", invoiceNum],
                  ["Invoice Date", fmt(today)],
                  ["Due Date", fmt(dueDate) + "  (Net 7)"],
                  ["Project", "Flatline Security Training Platform"],
                ].map(([label, value]) => new Paragraph({
                  spacing: { after: 80 },
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({ text: label + ":  ", size: 20, color: MIDGRAY }),
                    new TextRun({ text: value, bold: true, size: 20, color: DARKGRAY })
                  ]
                }))
              ]
            })
          ]
        })]
      }),

      new Paragraph({ spacing: { before: 240, after: 0 }, children: [new TextRun("")] }),

      // ─── LINE ITEMS TABLE ────────────────────────────────────
      new Table({
        columnWidths: [5200, 1200, 1560, 1400],
        margins: { top: 80, bottom: 80, left: 160, right: 160 },
        rows: [
          // Header
          new TableRow({
            tableHeader: true,
            children: [
              ...["Description", "Qty", "Unit Price", "Total"].map((h, i) => new TableCell({
                borders: cellBorders,
                width: { size: [5200, 1200, 1560, 1400][i], type: WidthType.DXA },
                shading: { fill: DARKGRAY, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: i > 0 ? AlignmentType.RIGHT : AlignmentType.LEFT, children: [new TextRun({ text: h, bold: true, size: 22, color: WHITE })] })]
              }))
            ]
          }),
          // Line items
          ...[
            ["Platform Design & Development", "", "", ""],
            ["  · Public-facing website (5 pages, responsive)", "1", "—", "—"],
            ["  · Student training portal with course player & exams", "1", "—", "—"],
            ["  · Admin portal (trainee, course & exam management)", "1", "—", "—"],
            ["Infrastructure & Deployment", "", "", ""],
            ["  · Supabase database design, auth & Row-Level Security", "1", "—", "—"],
            ["  · Email system setup (Resend + domain verification)", "1", "—", "—"],
            ["  · DNS configuration & live deployment on Render", "1", "—", "—"],
          ].map(([desc, qty, unit, total], i) => {
            const isSection = qty === "";
            return new TableRow({
              children: [
                new TableCell({
                  borders: cellBorders,
                  width: { size: 5200, type: WidthType.DXA },
                  shading: { fill: isSection ? LIGHTGRAY : WHITE, type: ShadingType.CLEAR },
                  children: [new Paragraph({ children: [new TextRun({ text: desc, bold: isSection, size: 22, color: isSection ? DARKGRAY : BLACK })] })]
                }),
                ...["qty", "unit", "total"].map((k, j) => new TableCell({
                  borders: cellBorders,
                  width: { size: [1200, 1560, 1400][j], type: WidthType.DXA },
                  shading: { fill: isSection ? LIGHTGRAY : WHITE, type: ShadingType.CLEAR },
                  children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: [qty, unit, total][j], size: 22, color: MIDGRAY })] })]
                }))
              ]
            });
          }),
          // Spacer
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 5200, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "  ", size: 10 })] })] }),
              ...([1200, 1560, 1400].map(w => new TableCell({ borders: cellBorders, width: { size: w, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: " ", size: 10 })] })] })))
            ]
          }),
          // Subtotal
          new TableRow({
            children: [
              new TableCell({ borders: noBorders, width: { size: 5200, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun("")] })] }),
              new TableCell({ borders: cellBorders, width: { size: 1200, type: WidthType.DXA }, shading: { fill: LIGHTGRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Subtotal", bold: true, size: 22, color: DARKGRAY })] })] }),
              new TableCell({ borders: cellBorders, colSpan: 2, width: { size: 2960, type: WidthType.DXA }, shading: { fill: LIGHTGRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "USD [AMOUNT]", bold: true, size: 22, color: DARKGRAY })] })] }),
            ]
          }),
          // Tax
          new TableRow({
            children: [
              new TableCell({ borders: noBorders, width: { size: 5200, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun("")] })] }),
              new TableCell({ borders: cellBorders, width: { size: 1200, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Tax", size: 22, color: MIDGRAY })] })] }),
              new TableCell({ borders: cellBorders, colSpan: 2, width: { size: 2960, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "N/A", size: 22, color: MIDGRAY })] })] }),
            ]
          }),
          // Total due
          new TableRow({
            children: [
              new TableCell({ borders: noBorders, width: { size: 5200, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun("")] })] }),
              new TableCell({ borders: cellBorders, width: { size: 1200, type: WidthType.DXA }, shading: { fill: DARKGRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "TOTAL DUE", bold: true, size: 24, color: WHITE })] })] }),
              new TableCell({ borders: cellBorders, colSpan: 2, width: { size: 2960, type: WidthType.DXA }, shading: { fill: RED, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "USD [AMOUNT]", bold: true, size: 28, color: WHITE })] })] }),
            ]
          }),
        ]
      }),

      new Paragraph({ spacing: { before: 320, after: 0 }, children: [new TextRun("")] }),

      // ─── PAYMENT DETAILS ─────────────────────────────────────
      new Table({
        columnWidths: [4320, 5040],
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        rows: [
          new TableRow({
            children: [
              // Payment info
              new TableCell({
                borders: cellBorders,
                width: { size: 4320, type: WidthType.DXA },
                shading: { fill: LIGHTGRAY, type: ShadingType.CLEAR },
                children: [
                  new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Payment Methods", bold: true, size: 22, color: DARKGRAY })] }),
                  ...[
                    ["Bank Transfer", "[Bank Name, Account #, Routing #]"],
                    ["Mobile Money", "[e.g., NCB QuickPay / Lynk]"],
                    ["Cash", "Accepted — receipt issued on payment"],
                  ].map(([method, detail]) => new Paragraph({
                    spacing: { after: 60 },
                    children: [
                      new TextRun({ text: method + ": ", bold: true, size: 20, color: DARKGRAY }),
                      new TextRun({ text: detail, size: 20, color: BLACK })
                    ]
                  }))
                ]
              }),
              // Notes
              new TableCell({
                borders: cellBorders,
                width: { size: 5040, type: WidthType.DXA },
                shading: { fill: WHITE, type: ShadingType.CLEAR },
                children: [
                  new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Notes", bold: true, size: 22, color: DARKGRAY })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "• Payment due within 7 days of this invoice date.", size: 20, color: BLACK })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "• Please reference invoice number " + invoiceNum + " on your payment.", size: 20, color: BLACK })] }),
                  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "• A receipt will be issued upon payment confirmation.", size: 20, color: BLACK })] }),
                  new Paragraph({ children: [new TextRun({ text: "• Late payments may be subject to a 2% monthly fee.", size: 20, color: MIDGRAY, italics: true })] }),
                ]
              })
            ]
          })
        ]
      }),

      // ─── THANK YOU ───────────────────────────────────────────
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
        children: [new TextRun({ text: "Thank you for your business.", bold: true, size: 26, color: DARKGRAY })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: "Questions about this invoice? Contact us at info@fstsolutionsltd.com", size: 20, color: MIDGRAY, italics: true })]
      }),
    ]
  }]
});

const outDir = path.join(__dirname, '../docs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(path.join(outDir, 'FST-Invoice.docx'), buf);
  console.log('✓ FST-Invoice.docx created');
});
