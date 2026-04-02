import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Buffer } from "buffer";

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
    body: [
      ['U.G.', paper.department_id || paper.department || 'Engineering', 'Degree', 'Bachelor of Technology'],
      ['Academic Year', paper.academic_year || '2024-25', 'Sem.', paper.semester || 'N/A'],
      ['Course Code', paper.subject_code || 'N/A', 'Course Title', paper.subject_name || 'N/A'],
      ['Duration', '3 Hours', 'Maximum Marks', '70 (Seventy)']
    ],
  });

  cursorY = doc.lastAutoTable.finalY + 10;

  // Adapt for different possible question formats
  const sectionA = paperContent.questions?.A || paperContent.sectionA || [];
  
  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    head: [['No.', 'Questions (a-g)', 'COs']],
    body: sectionA.map((q, idx) => [
      q.questionNumber || (idx + 1),
      q.text || q.questionText || "Question text missing",
      q.coId || q.co || "CO1"
    ]),
  });

  cursorY = doc.lastAutoTable.finalY + 10;

  // SECTION II
  if (cursorY > 240) {
    doc.addPage();
    cursorY = 20;
  }

  const sectionB = paperContent.questions?.B || paperContent.sectionB || [];
  const sectionC = paperContent.questions?.C || [];
  
  const sectionBBody = [];
  
  // Handling Grouped (sectionB) vs Flat structure
  if (sectionB.length > 0 && sectionB[0].option1) {
    // Already organized in Option 1 / 2 (AssembledPaper format)
    sectionB.forEach((group) => {
      group.option1.forEach((q, qIdx) => {
        sectionBBody.push([
          qIdx === 0 ? (q.questionNumber || group.groupNumber) : '',
          `(${String.fromCharCode(97 + qIdx)}) ${q.text || q.questionText || q.question?.questionText}`,
          q.co || q.coId || q.slot?.co,
          `${q.marks || q.slot?.marks || 14}M`
        ]);
      });
      sectionBBody.push([{ content: 'OR', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fillColor: [250, 250, 250], fontSize: 8 } }]);
      group.option2.forEach((q, qIdx) => {
        sectionBBody.push([
          qIdx === 0 ? (q.questionNumber || group.groupNumber) : '',
          `(${String.fromCharCode(97 + qIdx)}) ${q.text || q.questionText || q.question?.questionText}`,
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
        q.text || q.questionText,
        q.coId || q.co,
        `${q.marks || 13}M`
      ]);
      
      if (sectionC[idx]) {
        const cq = sectionC[idx];
        sectionBBody.push([{ content: 'OR', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fillColor: [250, 250, 250], fontSize: 8 } }]);
        sectionBBody.push([
          cq.questionNumber || (idx + 2),
          cq.text || cq.questionText,
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
    head: [['No.', 'Questions (2nd to 15th)', 'COs', 'Marks']],
    body: sectionBBody,
  });

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(new Uint8Array(arrayBuffer));
}

const mockPaper = {
  department: "IT",
  academic_year: "2024-25",
  subject_code: "CS101",
  subject_name: "Computer Science",
  semester: "I",
  regulation: "AR23"
};

const mockContent = {
  sectionA: [
    { questionNumber: 1, questionText: "What is AI?", co: "CO1" }
  ],
  sectionB: [
    { 
      groupNumber: 2, 
      option1: [
        { questionNumber: 2, questionText: "Explain neural networks.", co: "CO2", marks: 7 }
      ],
      option2: [
        { questionNumber: 2, questionText: "Explain support vector machines.", co: "CO2", marks: 7 }
      ]
    }
  ]
};

try {
  const buffer = generatePDFBuffer(mockPaper, mockContent);
  console.log("Buffer length:", buffer.length);
  if (buffer.length > 1000) {
    console.log("SUCCESS");
  } else {
    console.log("FAILURE");
  }
} catch (err) {
  console.error("CRASH:", err);
  process.exit(1);
}
