const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageBreak, Header, Footer, PageNumber, LevelFormat
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

const h = (text, level = HeadingLevel.HEADING_1) =>
  new Paragraph({ heading: level, spacing: { before: 280, after: 120 }, children: [new TextRun({ text, bold: true, color: level === HeadingLevel.HEADING_1 ? RED : DARKGRAY })] });

const p = (text, opts = {}) =>
  new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text, color: BLACK, size: 22, ...opts })] });

const divider = () => new Paragraph({
  spacing: { before: 200, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" } },
  children: [new TextRun("")]
});

const spacer = () => new Paragraph({ spacing: { after: 160 }, children: [new TextRun("")] });

function sectionTable(rows, colWidths = [3000, 6360]) {
  return new Table({
    columnWidths: colWidths,
    margins: { top: 80, bottom: 80, left: 160, right: 160 },
    rows: rows.map(([label, desc], i) => new TableRow({
      children: [
        new TableCell({
          borders: cellBorders,
          width: { size: colWidths[0], type: WidthType.DXA },
          shading: { fill: i === 0 ? "E5E7EB" : LIGHTGRAY, type: ShadingType.CLEAR },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: i === 0, size: 20, color: DARKGRAY })] })]
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: colWidths[1], type: WidthType.DXA },
          shading: { fill: i === 0 ? "E5E7EB" : WHITE, type: ShadingType.CLEAR },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [new TextRun({ text: desc, bold: i === 0, size: 20, color: i === 0 ? DARKGRAY : BLACK })] })]
        })
      ]
    }))
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22, color: BLACK } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: RED, font: "Arial" },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: DARKGRAY, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullet-list",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
      }
    ]
  },
  sections: [{
    properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" } },
          spacing: { after: 200 },
          children: [new TextRun({ text: "Avalanche Creative Studios  |  Confidential Project Proposal", size: 18, color: MIDGRAY })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" } },
          spacing: { before: 100 },
          children: [
            new TextRun({ text: "Page ", size: 18, color: MIDGRAY }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: MIDGRAY }),
            new TextRun({ text: " of ", size: 18, color: MIDGRAY }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: MIDGRAY }),
            new TextRun({ text: "   ·   Avalanche Creative Studios", size: 18, color: MIDGRAY })
          ]
        })]
      })
    },
    children: [

      // ─── COVER ───────────────────────────────────────────────
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1440, after: 80 },
        children: [new TextRun({ text: "AVALANCHE CREATIVE STUDIOS", bold: true, size: 56, color: RED, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: "Design  ·  Development  ·  Digital Strategy", size: 26, color: MIDGRAY })]
      }),
      divider(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 120 },
        children: [new TextRun({ text: "PROJECT PROPOSAL", bold: true, size: 44, color: DARKGRAY })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: "Flatline Security Training Platform", bold: true, size: 32, color: BLACK })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: "Website Redesign  ·  Student Portal  ·  Admin Portal  ·  Content Development", size: 24, color: MIDGRAY })]
      }),

      new Table({
        columnWidths: [2200, 7160],
        margins: { top: 80, bottom: 80, left: 160, right: 160 },
        rows: [
          ...[
            ["Prepared for:", "FST Solutions Ltd"],
            ["Prepared by:", "Avalanche Creative Studios"],
            ["Date:", new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
            ["Contact:", "info@avalanchecreativestudios.com  |  [Phone Number]"]
          ].map(([label, value]) => new TableRow({
            children: [
              new TableCell({
                borders: noBorders,
                width: { size: 2200, type: WidthType.DXA },
                shading: { fill: WHITE, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, color: MIDGRAY })] })]
              }),
              new TableCell({
                borders: noBorders,
                width: { size: 7160, type: WidthType.DXA },
                shading: { fill: WHITE, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: value, size: 20, color: BLACK })] })]
              })
            ]
          }))
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ─── 1. OVERVIEW ────────────────────────────────────────
      h("1. Project Overview"),
      p("Avalanche Creative Studios was engaged by FST Solutions Ltd to design, develop, and deploy a full-stack web platform for the Flatline Security Training brand. The platform comprises three core components: a public-facing marketing website, a student training portal, and a secure administrator portal."),
      p("Prior to launch, the platform underwent a complete redesign initiated by Avalanche Creative Studios. This redesign addressed both the visual identity and the structural foundation of the product, resulting in a significantly improved user experience across all three components."),
      p("In addition to the redesign, a series of feature enhancements and structural improvements were implemented throughout the development phase in response to evolving requirements and client-requested refinements. These additions expanded the original scope and increased the overall value delivered to FST Solutions Ltd."),
      p("All website copywriting, service descriptions, and structured messaging were developed by Avalanche Creative Studios and written to reflect the professional positioning and operational focus of the Flatline Security Training brand."),

      divider(),

      // ─── 2. SCOPE ────────────────────────────────────────────
      h("2. Scope of Work"),

      h("2.1  Public Website", HeadingLevel.HEADING_2),
      sectionTable([
        ["Deliverable", "Description"],
        ["UI/UX Design", "Custom dark tactical theme, fully branded to client identity"],
        ["Home Page", "Hero section, services overview, statistics, and calls to action"],
        ["About Page", "Company story, mission, and values"],
        ["Services Page", "Detailed listing of all security training services offered"],
        ["Contact Page", "Functional contact form with automated email delivery"],
        ["Responsive Design", "Fully optimized for mobile, tablet, and desktop devices"],
      ]),

      spacer(),

      h("2.2  Student Training Portal", HeadingLevel.HEADING_2),
      sectionTable([
        ["Deliverable", "Description"],
        ["Authentication", "Secure login, session management, and protected routes"],
        ["Student Dashboard", "Course progress tracking and enrolled course overview"],
        ["Course Player", "Lesson viewer with progress saving across sessions"],
        ["Exam Engine", "Timed assessments with auto-scoring and pass/fail results"],
        ["Certificate Tracking", "Completion status per course"],
      ]),

      spacer(),

      h("2.3  Admin Portal", HeadingLevel.HEADING_2),
      sectionTable([
        ["Deliverable", "Description"],
        ["Admin Dashboard", "Real-time statistics and platform overview"],
        ["Trainee Management", "Add, edit, delete, bulk actions, and search for trainees"],
        ["Course Management", "Create and manage courses, modules, and lessons"],
        ["Exam Management", "Build and manage assessments with question banks"],
        ["User Authentication", "Secure admin login with password change functionality"],
      ]),

      spacer(),

      h("2.4  Infrastructure & Setup", HeadingLevel.HEADING_2),
      sectionTable([
        ["Deliverable", "Description"],
        ["Database Design", "Full schema design, tables, and Row-Level Security policies"],
        ["Authentication System", "Supabase Auth user management integrated with portal"],
        ["Email System", "Transactional email via Resend with verified domain"],
        ["Domain & DNS", "DNS records configured in Hostinger for email delivery"],
        ["Live Deployment", "Platform deployed and live on Render hosting"],
      ]),

      spacer(),

      h("2.5  Platform Redesign & Enhancements", HeadingLevel.HEADING_2),
      sectionTable([
        ["Deliverable", "Description"],
        ["Full UI/UX Overhaul", "Complete visual redesign of the public website prior to go-live"],
        ["Portal Redesign", "Full redesign of both the Student and Admin portal interfaces"],
        ["Navigation Restructuring", "Workflow improvements and navigation restructuring across all sections"],
        ["Feature Enhancements", "Multiple functional additions implemented during the development phase"],
        ["System Refinements", "Iterative improvements and adjustments based on client-requested updates"],
      ]),

      spacer(),

      h("2.6  Website Content Development", HeadingLevel.HEADING_2),
      sectionTable([
        ["Deliverable", "Description"],
        ["Copywriting", "Full website copy written and structured by Avalanche Creative Studios"],
        ["Service Descriptions", "All service offerings written, organized, and formatted for clarity"],
        ["CTA Messaging", "Calls-to-action aligned with brand tone and conversion intent"],
      ]),

      new Paragraph({ children: [new PageBreak()] }),

      // ─── 3. PROJECT DURATION ────────────────────────────────
      h("3. Project Duration"),
      p("Development and refinement of the Flatline Security Training Platform occurred over approximately 2 to 3 months. This period encompassed the initial build, a full platform redesign, iterative feature expansion, and a series of client-requested updates and structural improvements prior to final delivery and go-live."),

      divider(),

      // ─── 4. INVESTMENT ───────────────────────────────────────
      h("4. Investment"),

      h("4.1  Total Project Value", HeadingLevel.HEADING_2),
      p("The following reflects the total value of services delivered by Avalanche Creative Studios for the complete design, development, redesign, content, and deployment of the platform as described in Section 2."),

      new Table({
        columnWidths: [6240, 3120],
        margins: { top: 80, bottom: 80, left: 160, right: 160 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 6240, type: WidthType.DXA },
                shading: { fill: DARKGRAY, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Service", bold: true, size: 22, color: WHITE })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: DARKGRAY, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Fee (JMD)", bold: true, size: 22, color: WHITE })] })]
              })
            ]
          }),
          ...([
            ["Public Website — Design, Redesign & Development", "Included"],
            ["Student Training Portal", "Included"],
            ["Admin Portal", "Included"],
            ["Platform Redesign & Feature Enhancements", "Included"],
            ["Website Copywriting & Content Development", "Included"],
            ["Database Design & Infrastructure Setup", "Included"],
            ["Email System, Domain Configuration & Deployment", "Included"],
          ].map(([item, fee]) => new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 6240, type: WidthType.DXA },
                shading: { fill: WHITE, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: item, size: 22, color: BLACK })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: WHITE, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fee, size: 22, color: MIDGRAY })] })]
              })
            ]
          }))),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 6240, type: WidthType.DXA },
                shading: { fill: "F9FAFB", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "TOTAL PROJECT VALUE", bold: true, size: 24, color: DARKGRAY })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: "F9FAFB", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "JMD 80,000", bold: true, size: 24, color: RED })] })]
              })
            ]
          })
        ]
      }),

      spacer(),
      p("Note: Outstanding reimbursements for third-party hosting services and platform subscriptions incurred during the development and deployment period are not included in the above total and will be billed separately.", { italics: true, color: MIDGRAY }),

      new Paragraph({ spacing: { after: 240 }, children: [new TextRun("")] }),

      h("4.2  Monthly Hosting & Maintenance", HeadingLevel.HEADING_2),
      p("A monthly retainer covers all platform hosting costs, upkeep, and minor updates. This ensures the platform remains live, secure, and fully operational."),

      new Table({
        columnWidths: [5200, 4160],
        margins: { top: 80, bottom: 80, left: 160, right: 160 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders, width: { size: 5200, type: WidthType.DXA },
                shading: { fill: DARKGRAY, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "What's Included", bold: true, size: 22, color: WHITE })] })]
              }),
              new TableCell({
                borders: cellBorders, width: { size: 4160, type: WidthType.DXA },
                shading: { fill: DARKGRAY, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Monthly Fee (JMD)", bold: true, size: 22, color: WHITE })] })]
              })
            ]
          }),
          ...[
            "Platform hosting on Render",
            "Supabase database hosting",
            "Email delivery service (Resend)",
            "Domain renewal (pro-rated)",
            "Uptime monitoring",
            "Minor content updates and bug fixes",
          ].map(item => new TableRow({
            children: [
              new TableCell({
                borders: cellBorders, width: { size: 5200, type: WidthType.DXA },
                shading: { fill: WHITE, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: item, size: 22, color: BLACK })] })]
              }),
              new TableCell({
                borders: cellBorders, width: { size: 4160, type: WidthType.DXA },
                shading: { fill: WHITE, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "", size: 22 })] })]
              })
            ]
          })),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders, width: { size: 5200, type: WidthType.DXA },
                shading: { fill: "F9FAFB", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "MONTHLY RETAINER TOTAL", bold: true, size: 24, color: DARKGRAY })] })]
              }),
              new TableCell({
                borders: cellBorders, width: { size: 4160, type: WidthType.DXA },
                shading: { fill: "F9FAFB", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "JMD [MONTHLY AMOUNT]", bold: true, size: 24, color: RED })] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ─── 5. PAYMENT ──────────────────────────────────────────
      h("5. Payment Schedule"),
      p("The total project fee is structured across three milestones to provide clarity and accountability for both parties:"),

      new Table({
        columnWidths: [1400, 3760, 2000, 2200],
        margins: { top: 80, bottom: 80, left: 160, right: 160 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              ...["#", "Milestone", "% of Total", "Amount Due"].map((hdr, i) => new TableCell({
                borders: cellBorders,
                width: { size: [1400, 3760, 2000, 2200][i], type: WidthType.DXA },
                shading: { fill: DARKGRAY, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: i >= 2 ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text: hdr, bold: true, size: 22, color: WHITE })] })]
              }))
            ]
          }),
          ...[
            ["1", "Project kickoff — deposit due before work begins", "40%", "JMD 32,000"],
            ["2", "Staging delivery — client review and approval", "30%", "JMD 24,000"],
            ["3", "Final delivery and live deployment", "30%", "JMD 24,000"],
          ].map(([num, milestone, pct, amt]) => new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 1400, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: num, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 3760, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: milestone, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2000, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: pct, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2200, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: amt, bold: true, size: 22, color: DARKGRAY })] })] }),
            ]
          }))
        ]
      }),

      new Paragraph({ spacing: { after: 240 }, children: [new TextRun("")] }),
      p("Payment terms: Net 7 — payment due within 7 days of each milestone invoice.", { italics: true, color: MIDGRAY }),
      p("Monthly retainer billing begins on the first of the month following platform go-live.", { italics: true, color: MIDGRAY }),

      divider(),

      // ─── 6. TERMS ────────────────────────────────────────────
      h("6. Terms & Conditions"),

      h("6.1  Ownership", HeadingLevel.HEADING_2),
      p("Full ownership of the platform, codebase, and all associated assets transfers to FST Solutions Ltd upon receipt of final payment in full."),

      h("6.2  Revisions", HeadingLevel.HEADING_2),
      p("This proposal covers the scope defined in Section 2. Changes or additions outside this scope will be quoted separately and billed at an agreed rate."),

      h("6.3  Confidentiality", HeadingLevel.HEADING_2),
      p("Avalanche Creative Studios agrees to keep all client information, business data, and platform access credentials belonging to FST Solutions Ltd strictly confidential."),

      h("6.4  Cancellation", HeadingLevel.HEADING_2),
      p("If FST Solutions Ltd cancels the project after a milestone payment has been made, that milestone payment is non-refundable. Work completed up to that point remains the intellectual property of Avalanche Creative Studios until the outstanding balance is settled in full."),

      h("6.5  Hosting & Maintenance", HeadingLevel.HEADING_2),
      p("The monthly retainer is billed on a rolling monthly basis. Either party may terminate the arrangement with 30 days written notice. Avalanche Creative Studios is not liable for platform downtime caused by third-party hosting or infrastructure providers."),

      new Paragraph({ children: [new PageBreak()] }),

      // ─── 7. ACCEPTANCE ───────────────────────────────────────
      h("7. Acceptance"),
      p("By signing below, FST Solutions Ltd acknowledges that they have read and agreed to the terms outlined in this proposal and authorises Avalanche Creative Studios to proceed accordingly."),

      new Paragraph({ spacing: { after: 480 }, children: [new TextRun("")] }),

      new Table({
        columnWidths: [4680, 4680],
        margins: { top: 80, bottom: 80, left: 0, right: 0 },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: noBorders, width: { size: 4680, type: WidthType.DXA },
                shading: { fill: WHITE, type: ShadingType.CLEAR },
                children: [
                  new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "9CA3AF" } }, spacing: { after: 80 }, children: [new TextRun({ text: "  ", size: 22 })] }),
                  new Paragraph({ children: [new TextRun({ text: "Client Signature — FST Solutions Ltd", size: 20, color: MIDGRAY })] }),
                  new Paragraph({ spacing: { before: 200, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "9CA3AF" } }, children: [new TextRun({ text: "  ", size: 22 })] }),
                  new Paragraph({ children: [new TextRun({ text: "Printed Name & Title", size: 20, color: MIDGRAY })] }),
                  new Paragraph({ spacing: { before: 200, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "9CA3AF" } }, children: [new TextRun({ text: "  ", size: 22 })] }),
                  new Paragraph({ children: [new TextRun({ text: "Date", size: 20, color: MIDGRAY })] }),
                ]
              }),
              new TableCell({
                borders: noBorders, width: { size: 4680, type: WidthType.DXA },
                shading: { fill: WHITE, type: ShadingType.CLEAR },
                children: [
                  new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "9CA3AF" } }, spacing: { after: 80 }, children: [new TextRun({ text: "  ", size: 22 })] }),
                  new Paragraph({ children: [new TextRun({ text: "Authorised — Avalanche Creative Studios", size: 20, color: MIDGRAY })] }),
                  new Paragraph({ spacing: { before: 200, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "9CA3AF" } }, children: [new TextRun({ text: "  ", size: 22 })] }),
                  new Paragraph({ children: [new TextRun({ text: "Printed Name & Title", size: 20, color: MIDGRAY })] }),
                  new Paragraph({ spacing: { before: 200, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "9CA3AF" } }, children: [new TextRun({ text: "  ", size: 22 })] }),
                  new Paragraph({ children: [new TextRun({ text: "Date", size: 20, color: MIDGRAY })] }),
                ]
              })
            ]
          })
        ]
      }),

      new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Thank you for your business.", italics: true, size: 22, color: MIDGRAY })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Avalanche Creative Studios", size: 20, color: MIDGRAY })] }),
    ]
  }]
});

const outDir = path.join(__dirname, '../docs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(path.join(outDir, 'FST-Project-Proposal.docx'), buf);
  console.log('✓ FST-Project-Proposal.docx updated');
});
