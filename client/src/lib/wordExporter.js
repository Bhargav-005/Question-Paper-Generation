import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign, HeightRule } from "docx";
import { saveAs } from "file-saver";
import { sanitizeQuestionText } from "../../../shared/questionSanitizer.js";


export async function exportPaperAsWord(finalPaper) {
  const children = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "SEMESTER END REGULAR EXAMINATIONS (AR23)",
          bold: true,
          size: 28,
          underline: {}
        })
      ],
      spacing: { after: 200 }
    })
  );

  // Metadata Table
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "U.G.", bold: true })] })] }),
            new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: finalPaper.department || "IT" })] })] }),
            new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Degree", bold: true })] })] }),
            new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Bachelor of Technology" })] })] }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Academic Year", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: finalPaper.academicYear || "2024-25" })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Sem.", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: finalPaper.semester || "N/A" })] })] }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Course Code", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: finalPaper.subjectCode || "N/A" })] })] }),
            new TableCell({ 
              columnSpan: 2,
              children: [
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
                  rows: [
                    new TableRow({
                      children: [
                         new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: { right: { style: BorderStyle.SINGLE, size: 1 } }, children: [new Paragraph({ children: [new TextRun({ text: "Course Title", bold: true })] })] }),
                         new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: finalPaper.subjectName || "N/A" })] })] })
                      ]
                    })
                  ]
                })
              ] 
            }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Duration", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3 Hours" })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Max Marks", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "70 (Seventy)" })] })] }),
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { after: 400 } })
  );

  // SECTION I
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "SECTION-I", bold: true, size: 24 })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "7 x 2 = 14 Marks", bold: true, size: 18 })],
      spacing: { after: 200 }
    })
  );

  const sectionARows = [
    new TableRow({
      children: [
        new TableCell({ shading: { fill: "F0F0F0" }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No.", bold: true })] })] }),
        new TableCell({ shading: { fill: "F0F0F0" }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Questions (a-g)", bold: true })] })] }),
        new TableCell({ shading: { fill: "F0F0F0" }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "COs", bold: true })] })] }),
        new TableCell({ shading: { fill: "F0F0F0" }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Marks", bold: true })] })] }),
      ]
    })
  ];

  finalPaper.sectionA.forEach((q, idx) => {
    sectionARows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (idx + 1).toString() })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: sanitizeQuestionText(q.questionText) || q.questionText })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: q.co })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (q.marks || 2) + "M", bold: true })] })] }),
        ]
      })
    );
  });

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: sectionARows
    }),
    new Paragraph({ spacing: { after: 400 } })
  );

  // SECTION II
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "SECTION-II", bold: true, size: 24 })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "4 x 14 = 56 Marks", bold: true, size: 18 })],
      spacing: { after: 200 }
    })
  );

  const sectionBRows = [
    new TableRow({
      children: [
        new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, shading: { fill: "F0F0F0" }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No.", bold: true })] })] }),
        new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, shading: { fill: "F0F0F0" }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Questions (2nd to 15th)", bold: true })] })] }),
        new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, shading: { fill: "F0F0F0" }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "COs", bold: true })] })] }),
        new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, shading: { fill: "F0F0F0" }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Marks", bold: true })] })] }),
      ]
    })
  ];

  finalPaper.sectionB.forEach((group) => {
    // Option 1
    group.option1.forEach((q, qIdx) => {
      sectionBRows.push(
        new TableRow({
          children: [
          new TableCell({ verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: qIdx === 0 ? q.questionNumber.toString().replace(/\D/g, '') : "", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `(${String.fromCharCode(97 + qIdx)}) ${sanitizeQuestionText(q.questionText || q.text) || q.questionText || q.text}` })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: q.co || q.slot?.co })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (q.marks || q.slot?.marks) + "M", bold: true })] })] }),
          ]
        })
      );
    });

    // OR
    sectionBRows.push(
      new TableRow({
        children: [
          new TableCell({ 
            columnSpan: 4, 
            shading: { fill: "FAFAFA" }, 
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "OR", bold: true, size: 16 })] })] 
          })
        ]
      })
    );

    // Option 2
    group.option2.forEach((q, qIdx) => {
      sectionBRows.push(
        new TableRow({
          children: [
          new TableCell({ verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: qIdx === 0 ? q.questionNumber.toString().replace(/\D/g, '') : "", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `(${String.fromCharCode(97 + qIdx)}) ${sanitizeQuestionText(q.questionText || q.text) || q.questionText || q.text}` })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: q.co || q.slot?.co })] })] }),
          new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (q.marks || q.slot?.marks) + "M", bold: true })] })] }),
          ]
        })
      );
    });
  });

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: sectionBRows
    }),
    new Paragraph({ 
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "— End of Paper —", bold: true, size: 18 })],
      spacing: { before: 400 } 
    })
  );

  const doc = new Document({
    sections: [{ children }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `QP-${finalPaper.paperId}.docx`);
}