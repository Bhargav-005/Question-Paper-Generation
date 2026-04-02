import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { sanitizeQuestionText } from "../../shared/questionSanitizer.js";

export const exportRouter = Router();

/**
 * PDF Generation Helper (Shared logic)
 */
function generatePDFBuffer(paper, paperContent) {
  const doc = new jsPDF();
  const margin = 15;
  let cursorY = 15;

  // Header
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("GMR Institute of Technology", 105, cursorY, { align: "center" });
  cursorY += 6;
  doc.setFontSize(10);
  doc.text("An Autonomous Institute Affiliated to JNTU-GV", 105, cursorY, { align: "center" });
  cursorY += 10;

  doc.setFontSize(12);
  doc.text(`${paper.exam_type?.toUpperCase() || 'SEMESTER END'} EXAMINATIONS (${paper.regulation || 'R-2021'})`, 105, cursorY, { align: "center" });
  doc.line(60, cursorY + 1, 150, cursorY + 1);
  cursorY += 8;

  autoTable(doc, {
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
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 50 },
      2: { fontStyle: 'bold', cellWidth: 30 },
      3: { cellWidth: 60 }
    },
    body: [
      ['U.G.', paper.department_id || paper.department || 'Engineering', 'Degree', 'Bachelor of Technology'],
      ['Academic Year', paper.academic_year || paper.academicYear || '2024-25', 'Sem.', paper.semester || 'N/A'],
      ['Course Code', paper.subject_code || paper.subjectCode || 'N/A', 'Course Title', paper.subject_name || paper.subjectName || 'N/A'],
      ['Duration', '3 Hours', 'Maximum Marks', '70 (Seventy)']
    ],
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

  // Adapt for different possible question formats
  const sectionA = paperContent.questions?.A || paperContent.sectionA || [];
  
  autoTable(doc, {
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
    head: [['No.', 'Questions (a-g)', 'COs', 'Marks']],
    body: sectionA.map((q, idx) => [
      q.questionNumber || (idx + 1),
      sanitizeQuestionText(q.text || q.questionText || "Question text missing") || "Question text missing",
      q.coId || q.co || "CO1",
      `${q.marks || 2}M`
    ]),
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'center', cellWidth: 20, fontStyle: 'bold' }
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

  const sectionB = paperContent.questions?.B || paperContent.sectionB || [];
  const sectionC = paperContent.questions?.C || [];
  
  const sectionBBody = [];
  
  // Handling Grouped (sectionB) vs Flat structure
  if (sectionB.length > 0 && sectionB[0].option1) {
    // Already organized in Option 1 / 2 (AssembledPaper format)
    sectionB.forEach((group) => {
      group.option1.forEach((q, qIdx) => {
        sectionBBody.push([
          qIdx === 0 ? ((q.questionNumber || group.groupNumber).toString().replace(/\D/g, '')) : '',
          `(${String.fromCharCode(97 + qIdx)}) ${sanitizeQuestionText(q.text || q.questionText || q.question?.questionText) || "Question text missing"}`,
          q.co || q.coId || q.slot?.co,
          `${q.marks || q.slot?.marks || 14}M`
        ]);
      });
      sectionBBody.push([{ content: 'OR', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fillColor: [250, 250, 250], fontSize: 8 } }]);
      group.option2.forEach((q, qIdx) => {
        sectionBBody.push([
          qIdx === 0 ? ((q.questionNumber || group.groupNumber).toString().replace(/\D/g, '')) : '',
          `(${String.fromCharCode(97 + qIdx)}) ${sanitizeQuestionText(q.text || q.questionText || q.question?.questionText) || "Question text missing"}`,
          q.co || q.coId || q.slot?.co,
          `${q.marks || q.slot?.marks || 14}M`
        ]);
      });
    });
  } else {
    // Flat questions format (OrganizedPaper format)
    sectionB.forEach((q, idx) => {
      sectionBBody.push([
        q.questionNumber || (idx + 2),
        sanitizeQuestionText(q.text || q.questionText) || "Question text missing",
        q.coId || q.co,
        `${q.marks || 13}M`
      ]);
      
      if (sectionC[idx]) {
        const cq = sectionC[idx];
        sectionBBody.push([{ content: 'OR', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fillColor: [250, 250, 250], fontSize: 8 } }]);
        sectionBBody.push([
          cq.questionNumber || (idx + 2),
          sanitizeQuestionText(cq.text || cq.questionText) || "Question text missing",
          cq.coId || cq.co,
          `${cq.marks || 15}M`
        ]);
      }
    });
  }

  autoTable(doc, {
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

  try {
    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(new Uint8Array(arrayBuffer));
  } catch (e) {
    // Fallback for environments where arraybuffer might fail
    const binaryString = doc.output();
    return Buffer.from(binaryString, 'binary');
  }
}

/**
 * POST /api/export/pdf
 * Robust version that accepts paper data from frontend or fetches from DB
 */
exportRouter.post("/pdf", requireAuth, async (req, res) => {
  try {
    const { paperId, finalPaper } = req.body;

    if (!paperId) {
      return res.status(400).json({ success: false, message: "paperId is required" });
    }

    let paperData = finalPaper;
    let paperMeta = finalPaper;

    if (!paperData) {
      // Fallback to fetching from DB
      const result = await db.query("SELECT * FROM papers WHERE id = $1", [paperId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Paper not found" });
      }
      paperMeta = result.rows[0];
      paperData = paperMeta.paper_content;
    }

    if (!paperData) {
      return res.status(400).json({ success: false, message: "Paper content not found" });
    }

    const buffer = generatePDFBuffer(paperMeta, paperData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=QP-${paperId}.pdf`);
    res.send(buffer);

  } catch (error) {
    console.error("[Export API] PDF error:", error);
    res.status(500).json({ success: false, message: "PDF generation failed", error: error.message });
  }
});

/**
 * GET /api/export/pdf (Backward compatibility)
 */
exportRouter.get("/pdf", requireAuth, async (req, res) => {
  try {
    const { paperId } = req.query;
    if (!paperId) return res.status(400).json({ success: false, message: "paperId required" });

    const result = await db.query("SELECT * FROM papers WHERE id = $1", [paperId]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Paper not found" });
    
    const paper = result.rows[0];
    if (!paper.paper_content) return res.status(400).json({ success: false, message: "Paper not finalized" });

    const buffer = generatePDFBuffer(paper, paper.paper_content);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=QP-${paperId}.pdf`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
