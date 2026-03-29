const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType } = require('docx');
const htmlPdf = require('html-pdf-node');
const markdownIt = require('markdown-it');

const md = markdownIt({
  html: true,
  breaks: true,
  linkify: true
});

class ExportService {
  /**
   * Generate DOCX buffer from test plan
   */
  async generateDocx(testPlan) {
    const children = [];

    // Title
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: testPlan.title || 'Test Plan',
            bold: true,
            size: 36,
            font: 'Calibri'
          })
        ],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );

    // Metadata
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated: ${new Date(testPlan.generatedAt).toLocaleDateString()}  |  Project: ${testPlan.projectKey}  |  LLM: ${testPlan.llmProvider}`,
            size: 20,
            color: '666666',
            font: 'Calibri'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    // Add horizontal line
    children.push(
      new Paragraph({
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
        },
        spacing: { after: 300 }
      })
    );

    // Sections
    const sectionNames = {
      objective: '1. Objective',
      scope: '2. Scope',
      inclusions: '3. Inclusions',
      testEnvironments: '4. Test Environments',
      defectReportingProcedure: '5. Defect Reporting Procedure',
      testStrategy: '6. Test Strategy',
      testSchedule: '7. Test Schedule',
      testDeliverables: '8. Test Deliverables',
      entryAndExitCriteria: '9. Entry and Exit Criteria',
      tools: '10. Tools',
      risksAndMitigations: '11. Risks and Mitigations',
      approvals: '12. Approvals'
    };

    for (const [key, title] of Object.entries(sectionNames)) {
      const content = testPlan.sections?.[key] || testPlan.rawMarkdown || '';

      // Section heading
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 28,
              font: 'Calibri',
              color: '1a56db'
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 150 }
        })
      );

      // Section content - convert markdown lines to paragraphs
      if (content) {
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.trim()) {
            const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*');
            const isSubheading = line.trim().startsWith('###');
            const cleanLine = line.replace(/^[\s]*[-•*]\s*/, '').replace(/^###\s*/, '').replace(/\*\*/g, '');

            if (isSubheading) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cleanLine,
                      bold: true,
                      size: 24,
                      font: 'Calibri'
                    })
                  ],
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 200, after: 100 }
                })
              );
            } else {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: isBullet ? `  • ${cleanLine}` : cleanLine,
                      size: 22,
                      font: 'Calibri'
                    })
                  ],
                  spacing: { after: 80 },
                  indent: isBullet ? { left: 720 } : undefined
                })
              );
            }
          }
        }
      }
    }

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children
      }]
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * Generate PDF buffer from test plan
   */
  async generatePdf(testPlan) {
    // Build HTML from the test plan
    const rawMd = testPlan.rawMarkdown || this._sectionsToMarkdown(testPlan);
    const htmlContent = md.render(rawMd);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Calibri, Arial, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
        }
        h1 {
          color: #1a56db;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 10px;
          font-size: 24px;
        }
        h2 {
          color: #1e40af;
          font-size: 20px;
          margin-top: 30px;
        }
        h3 {
          color: #374151;
          font-size: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          border: 1px solid #d1d5db;
          padding: 10px 14px;
          text-align: left;
        }
        th {
          background-color: #eff6ff;
          color: #1e40af;
          font-weight: 600;
        }
        ul, ol {
          padding-left: 25px;
        }
        li {
          margin-bottom: 5px;
        }
        code {
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 14px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .header h1 {
          font-size: 28px;
          margin-bottom: 5px;
          border: none;
        }
        .header .meta {
          color: #6b7280;
          font-size: 14px;
        }
        hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${testPlan.title || 'Test Plan'}</h1>
        <p class="meta">Generated: ${new Date(testPlan.generatedAt).toLocaleDateString()} | Project: ${testPlan.projectKey} | LLM: ${testPlan.llmProvider}</p>
      </div>
      <hr/>
      ${htmlContent}
    </body>
    </html>`;

    const options = {
      format: 'A4',
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
    };

    const file = { content: html };
    return await htmlPdf.generatePdf(file, options);
  }

  /**
   * Convert sections object to markdown string
   */
  _sectionsToMarkdown(testPlan) {
    const sectionNames = {
      objective: '1. Objective',
      scope: '2. Scope',
      inclusions: '3. Inclusions',
      testEnvironments: '4. Test Environments',
      defectReportingProcedure: '5. Defect Reporting Procedure',
      testStrategy: '6. Test Strategy',
      testSchedule: '7. Test Schedule',
      testDeliverables: '8. Test Deliverables',
      entryAndExitCriteria: '9. Entry and Exit Criteria',
      tools: '10. Tools',
      risksAndMitigations: '11. Risks and Mitigations',
      approvals: '12. Approvals'
    };

    let markdown = `# ${testPlan.title || 'Test Plan'}\n\n`;

    for (const [key, title] of Object.entries(sectionNames)) {
      markdown += `## ${title}\n\n`;
      markdown += (testPlan.sections?.[key] || '[TO BE DEFINED]') + '\n\n';
    }

    return markdown;
  }
}

module.exports = new ExportService();
