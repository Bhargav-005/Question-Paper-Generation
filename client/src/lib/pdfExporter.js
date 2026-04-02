import { jsPDF } from "jspdf";
import "jspdf-autotable";

export function exportPaperAsPDF(finalPaper) {
  const doc = new jsPDF();
  const margin = 15;
  let cursorY = 15;

  // Add Logo (if possible, otherwise text placeholder)
  // For production, you'd convert /gmr-logo.png to base64
  // For now, we'll draw a text-based representation or use addImage if we assume it's pre-loaded
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("GMR Institute of Technology", 105, cursorY, { align: "center" });
  cursorY += 6;
  doc.setFontSize(10);
  doc.text("An Autonomous Institute Affiliated to JNTU-GV", 105, cursorY, { align: "center" });
  cursorY += 10;

  // Title
  doc.setFontSize(12);
  doc.text("SEMESTER END REGULAR EXAMINATIONS (AR23)", 105, cursorY, { align: "center" });
  doc.line(70, cursorY + 1, 140, cursorY + 1);
  cursorY += 8;

  // Header Table
  doc.autoTable({
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: { 
      cellPadding: 2, 
      fontSize: 9, 
      font: "times", 
      lineColor: [0, 0, 0], 
      lineWidth: 0.1,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { fontStyle: 'bold', width: 40 },
      1: { width: 50 },
      2: { fontStyle: 'bold', width: 30 },
      3: { width: 60 }
    },
    body: [
      ['U.G.', finalPaper.department || 'IT', 'Degree', 'Bachelor of Technology'],
      ['Academic Year', finalPaper.academicYear || '2024-25', 'Sem.', finalPaper.semester || 'N/A'],
      ['Course Code', finalPaper.subjectCode || 'N/A', 'Course Title', finalPaper.subjectName || 'N/A'],
      ['Duration', '3 Hours', 'Maximum Marks', '70 (Seventy)']
    ],
    didDrawCell: (data) => {}
  });

  cursorY = doc.lastAutoTable.finalY + 10;

  // SECTION I
  doc.setFontSize(11);
  doc.setFont("times", "bold");
  doc.text("SECTION-I", 105, cursorY, { align: "center" });
  cursorY += 5;
  doc.setFontSize(9);
  doc.text("7 x 2 = 14 Marks", 105, cursorY, { align: "center" });
  cursorY += 5;

  doc.autoTable({
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    headStyles: { 
      fillColor: [240, 240, 240], 
      textColor: [0, 0, 0], 
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: { 
      cellPadding: 3, 
      fontSize: 10, 
      font: "times", 
      lineColor: [0, 0, 0], 
      lineWidth: 0.1,
      textColor: [0, 0, 0]
    },
    head: [['No.', 'Questions (a-g)', 'COs']],
    body: finalPaper.sectionA.map((q, idx) => [
      idx + 1,
      q.questionText,
      q.co
    ]),
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 20 }
    }
  });

  cursorY = doc.lastAutoTable.finalY + 10;

  // SECTION II
  if (cursorY > 240) {
    doc.addPage();
    cursorY = 20;
  }

  doc.setFontSize(11);
  doc.setFont("times", "bold");
  doc.text("SECTION-II", 105, cursorY, { align: "center" });
  cursorY += 5;
  doc.setFontSize(9);
  doc.text("4 x 14 = 56 Marks", 105, cursorY, { align: "center" });
  cursorY += 5;

  const sectionBBody = [];
  finalPaper.sectionB.forEach((group, gIdx) => {
    // Option 1
    group.option1.forEach((q, qIdx) => {
      sectionBBody.push([
        qIdx === 0 ? q.questionNumber : '',
        `(${String.fromCharCode(97 + qIdx)}) ${q.questionText}`,
        q.co,
        `${q.marks}M`
      ]);
    });

    // OR Row
    sectionBBody.push([
      { content: 'OR', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fillColor: [250, 250, 250], fontSize: 8 } }
    ]);

    // Option 2
    group.option2.forEach((q, qIdx) => {
      sectionBBody.push([
        qIdx === 0 ? q.questionNumber : '',
        `(${String.fromCharCode(97 + qIdx)}) ${q.questionText}`,
        q.co,
        `${q.marks}M`
      ]);
    });
  });

  doc.autoTable({
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    headStyles: { 
      fillColor: [240, 240, 240], 
      textColor: [0, 0, 0], 
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: { 
      cellPadding: 3, 
      fontSize: 10, 
      font: "times", 
      lineColor: [0, 0, 0], 
      lineWidth: 0.1,
      textColor: [0, 0, 0]
    },
    head: [['No.', 'Questions (2nd to 15th)', 'COs', 'Marks']],
    body: sectionBBody,
    columnStyles: {
      0: { halign: 'center', cellWidth: 15, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'center', cellWidth: 20, fontStyle: 'bold' }
    }
  });

  cursorY = doc.lastAutoTable.finalY + 15;
  if (cursorY > 280) {
    doc.addPage();
    cursorY = 20;
  }

  doc.setFontSize(10);
  doc.setFont("times", "bold");
  doc.text("— End of Paper —", 105, cursorY, { align: "center" });

  doc.save(`QP-${finalPaper.paperId}.pdf`);
}