import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * High-Resolution Chart SVG to PNG Data URL converter.
 * Inlines computed CSS styles to guarantee razor-sharp vector-like rendering in PDF.
 */
export const captureSvgToDataUrl = async (svgElement, scale = 2.5) => {
  if (!svgElement) return null;

  try {
    const rect = svgElement.getBoundingClientRect();
    const width = Math.max(rect.width || 600, 400);
    const height = Math.max(rect.height || 300, 240);

    const clonedSvg = svgElement.cloneNode(true);
    clonedSvg.setAttribute('width', width);
    clonedSvg.setAttribute('height', height);
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    const copyStyles = (source, target) => {
      const computed = window.getComputedStyle(source);
      const fill = computed.getPropertyValue('fill');
      const stroke = computed.getPropertyValue('stroke');
      const strokeWidth = computed.getPropertyValue('stroke-width');
      const font = computed.getPropertyValue('font-family');
      const fontSize = computed.getPropertyValue('font-size');
      const fontWeight = computed.getPropertyValue('font-weight');
      const opacity = computed.getPropertyValue('opacity');
      const fillOpacity = computed.getPropertyValue('fill-opacity');
      const strokeOpacity = computed.getPropertyValue('stroke-opacity');

      const attrFill = source.getAttribute('fill');
      if (attrFill && attrFill.startsWith('url(')) {
        target.setAttribute('fill', attrFill);
      } else if (fill && fill !== 'none') {
        target.style.fill = fill;
      }

      if (stroke && stroke !== 'none') target.style.stroke = stroke;
      if (strokeWidth) target.style.strokeWidth = strokeWidth;
      if (font) target.style.fontFamily = font;
      if (fontSize) target.style.fontSize = fontSize;
      if (fontWeight) target.style.fontWeight = fontWeight;
      if (opacity && opacity !== '1') target.style.opacity = opacity;
      if (fillOpacity && fillOpacity !== '1') target.style.fillOpacity = fillOpacity;
      if (strokeOpacity && strokeOpacity !== '1') target.style.strokeOpacity = strokeOpacity;

      for (let i = 0; i < source.children.length; i++) {
        if (target.children[i]) {
          copyStyles(source.children[i], target.children[i]);
        }
      }
    };
    copyStyles(svgElement, clonedSvg);

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // Clean background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(svgUrl);
        resolve({
          dataUrl: canvas.toDataURL('image/png', 1.0),
          width,
          height,
          aspectRatio: width / height
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        resolve(null);
      };
      img.src = svgUrl;
    });
  } catch (err) {
    console.error('Error in captureSvgToDataUrl:', err);
    return null;
  }
};

/**
 * Capture an entire DOM card or element (including HTML tables, badges, text)
 * at high DPI (2.5x retina) using html2canvas.
 */
export const captureElementToCanvas = async (element, scale = 2.5) => {
  if (!element) return null;
  try {
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure all svgs inside cloned element have explicit dimensions
        const svgs = clonedDoc.querySelectorAll('svg');
        svgs.forEach((svg) => {
          const rect = svg.getBoundingClientRect();
          if (!svg.getAttribute('width') && rect.width) svg.setAttribute('width', rect.width);
          if (!svg.getAttribute('height') && rect.height) svg.setAttribute('height', rect.height);
        });
      }
    });

    return {
      dataUrl: canvas.toDataURL('image/png', 1.0),
      width: canvas.width / scale,
      height: canvas.height / scale,
      aspectRatio: canvas.width / canvas.height
    };
  } catch (err) {
    console.error('Error capturing element to canvas:', err);
    return null;
  }
};

/**
 * Hybrid high-DPI chart capturer.
 * Tries direct SVG rasterization first; falls back to html2canvas for guaranteed rendering.
 */
export const captureChart = async (containerOrSvg, scale = 2.5) => {
  if (!containerOrSvg) return null;
  try {
    const isSvg = containerOrSvg.tagName && containerOrSvg.tagName.toLowerCase() === 'svg';
    const svg = isSvg
      ? containerOrSvg
      : (containerOrSvg.querySelector('svg.recharts-surface') || containerOrSvg.querySelector('svg'));

    if (svg) {
      const svgRes = await captureSvgToDataUrl(svg, scale);
      if (svgRes && svgRes.dataUrl) return svgRes;
    }

    // Fallback: html2canvas on container
    const targetElement = isSvg ? containerOrSvg.parentElement : containerOrSvg;
    return await captureElementToCanvas(targetElement, scale);
  } catch (e) {
    console.error('captureChart error:', e);
    return null;
  }
};

/**
 * Adds an institutional header to an A4 PDF page.
 */
const addInstitutionalHeader = (doc, reportTitle, subtitle = '') => {
  // Top primary accent bar
  doc.setFillColor(37, 99, 235); // #2563eb
  doc.rect(0, 0, 210, 5, 'F');

  // Secondary sub-bar
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 5, 210, 1.5, 'F');

  // Institution title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('BANNARI AMMAN INSTITUTE OF TECHNOLOGY', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Autonomous Institution Affiliated to Anna University • Accredited by NAAC with "A+" Grade', 14, 19.5);

  // Report Title Badge (right aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(37, 99, 235);
  doc.text(reportTitle.toUpperCase(), 196, 15, { align: 'right' });

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 196, 19.5, { align: 'right' });
  }

  // Thin separator rule
  doc.setDrawColor(226, 232, 240); // #e2e8f0
  doc.setLineWidth(0.4);
  doc.line(14, 23, 196, 23);
};

/**
 * Adds footer with page numbers and confidentiality warning.
 */
const addInstitutionalFooter = (doc, pageNumber, totalPages) => {
  const y = 288;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(14, y - 3, 196, y - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Academic Intelligence Platform • Generated for Official Institutional Use Only', 14, y + 1);

  doc.setFont('helvetica', 'bold');
  doc.text(`Page ${pageNumber} of ${totalPages}`, 196, y + 1, { align: 'right' });
};

/**
 * =========================================================================
 * 1. INDIVIDUAL STUDENT PDF REPORT GENERATOR
 * =========================================================================
 */
export const exportStudentReportPDF = async (student, options = {}) => {
  if (!student || !student.records || student.records.length === 0) {
    throw new Error('Student data or academic records not found.');
  }

  const latestRecord = student.records[student.records.length - 1];
  const totalArrears = student.records.reduce((sum, r) => sum + (r.failCount || 0), 0);
  const isOptimal = latestRecord.gpa >= 6.0 && (latestRecord.result ? (latestRecord.result.toUpperCase() === 'P' || latestRecord.result.toUpperCase() === 'PASS') : (latestRecord.failCount === 0));
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const totalPages = 2;

  // -------------------------------------------------------------
  // PAGE 1: Executive Dossier & Visual Performance
  // -------------------------------------------------------------
  addInstitutionalHeader(doc, 'Student Performance Dossier', `Report Date: ${dateStr} ${timeStr}`);

  let currentY = 28;

  // 1. Student Bio Card
  doc.setFillColor(248, 250, 252); // #f8fafc
  doc.roundedRect(14, currentY, 182, 24, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, currentY, 182, 24, 2, 2, 'S');

  // Left Avatar placeholder
  doc.setFillColor(37, 99, 235);
  doc.circle(23, currentY + 12, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(student.name.charAt(0), 23, currentY + 15, { align: 'center' });

  // Student Name & Reg No
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(student.name, 33, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Reg. No: ${student.registerNumber}   |   B.E. Computer Science and Engineering`, 33, currentY + 15);
  doc.text(`Current: Semester ${latestRecord.semester}   |   Evaluated Semesters: ${student.records.length}`, 33, currentY + 20);

  // Status Badge on Right
  const badgeX = 160;
  const badgeY = currentY + 6;
  if (isOptimal) {
    doc.setFillColor(209, 250, 229); // #d1fae5
    doc.roundedRect(badgeX, badgeY, 32, 12, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(16, 185, 129);
    doc.text('STATUS: OPTIMAL', badgeX + 16, badgeY + 7.5, { align: 'center' });
  } else {
    doc.setFillColor(254, 226, 226); // #fee2e2
    doc.roundedRect(badgeX, badgeY, 32, 12, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(239, 68, 68);
    doc.text('STATUS: AT-RISK', badgeX + 16, badgeY + 7.5, { align: 'center' });
  }

  currentY += 28;

  // 2. Metric KPI Cards (4 Tiles)
  const cardW = 42.5;
  const cardH = 20;
  const gap = 4;
  const kpiData = [
    { label: 'CUMULATIVE CGPA', value: `${latestRecord.gpa} / 10`, color: '#2563eb' },
    { label: 'CURRENT SEMESTER', value: `Semester ${latestRecord.semester}`, color: '#0f172a' },
    { label: 'STANDING ARREARS', value: `${totalArrears}`, color: totalArrears > 0 ? '#ef4444' : '#10b981' },
    { label: 'ACADEMIC STANDING', value: isOptimal ? 'Good Standing' : 'Needs Support', color: isOptimal ? '#10b981' : '#f59e0b' }
  ];

  kpiData.forEach((kpi, idx) => {
    const x = 14 + idx * (cardW + gap);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, currentY, cardW, cardH, 1.5, 1.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, currentY, cardW, cardH, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 4, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(kpi.color === '#2563eb' ? 37 : kpi.color === '#ef4444' ? 239 : kpi.color === '#10b981' ? 16 : 15,
                     kpi.color === '#2563eb' ? 99 : kpi.color === '#ef4444' ? 68 : kpi.color === '#10b981' ? 185 : 23,
                     kpi.color === '#2563eb' ? 235 : kpi.color === '#ef4444' ? 68 : kpi.color === '#10b981' ? 129 : 42);
    doc.text(kpi.value, x + 4, currentY + 14);
  });

  currentY += cardH + 6;

  // 3. Visual Graphs (Capturing live charts from screen)
  // Let's locate the chart elements on the page
  const chartContainers = document.querySelectorAll('.chart-container, .charts-grid-2-1 > div, .chart-card');
  
  // Find SGPA Progression chart
  const sgpaElement = Array.from(chartContainers).find(el => el.textContent && el.textContent.includes('SGPA Progression')) || chartContainers[0];
  let sgpaImg = null;
  if (sgpaElement) {
    sgpaImg = await captureChart(sgpaElement, 2.5);
  }

  // Section Header for Chart 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. SGPA Progression Trajectory across Evaluated Semesters', 14, currentY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Historical grade point average performance and trajectory', 14, currentY + 8);

  currentY += 10;

  if (sgpaImg) {
    const chartW = 182;
    const chartH = 60;
    doc.addImage(sgpaImg.dataUrl, 'PNG', 14, currentY, chartW, chartH);
    currentY += chartH + 3;
  } else {
    currentY += 10;
  }

  // Insight Callout Bar
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, currentY, 182, 9, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(37, 99, 235);
  doc.text('ACADEMIC INSIGHT:', 18, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const insightText = isOptimal
    ? `Student has maintained consistent passing trajectory. Latest SGPA is ${latestRecord.gpa}. No immediate academic intervention required.`
    : `Student is in the academic alert zone. Latest SGPA is ${latestRecord.gpa} with ${totalArrears} standing arrears. Mandatory mentoring recommended.`;
  doc.text(insightText, 52, currentY + 6);

  currentY += 14;

  // 4. Two-Column Visual Section: Grade Distribution & Latest Semester Subject Marks
  const colW = 88;
  const colH = 68;

  // Left: Grade Distribution
  const gradeCard = Array.from(document.querySelectorAll('.kpi-card')).find(el => el.textContent && el.textContent.includes('Grade Distribution'));
  let gradeImg = null;
  if (gradeCard) {
    gradeImg = await captureChart(gradeCard, 2.5);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Cumulative Grade Distribution', 14, currentY + 2);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, currentY + 5, colW, colH, 1.5, 1.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, currentY + 5, colW, colH, 1.5, 1.5, 'S');

  if (gradeImg) {
    doc.addImage(gradeImg.dataUrl, 'PNG', 16, currentY + 8, 38, 38);
  }

  // Draw grade count breakdown beside donut
  const gradeCount = {};
  student.records.forEach(r => {
    r.subjects.forEach(s => {
      gradeCount[s.grd] = (gradeCount[s.grd] || 0) + 1;
    });
  });
  const gradeEntries = Object.entries(gradeCount);
  let gY = currentY + 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Grade', 58, gY);
  doc.text('Count', 84, gY, { align: 'right' });
  doc.setDrawColor(226, 232, 240);
  doc.line(58, gY + 1.5, 84, gY + 1.5);
  gY += 5;

  gradeEntries.slice(0, 7).forEach(([grd, count]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(grd === 'U' || grd === 'RA' ? 239 : 15, grd === 'U' || grd === 'RA' ? 68 : 23, grd === 'U' || grd === 'RA' ? 68 : 42);
    doc.text(`Grade ${grd}`, 58, gY);
    doc.setFont('helvetica', 'bold');
    doc.text(`${count}`, 84, gY, { align: 'right' });
    gY += 4.5;
  });

  // Right: Latest Subject Performance
  const subjectCard = Array.from(document.querySelectorAll('.chart-container')).find(el => el.textContent && el.textContent.includes('Latest Semester Subject-wise Marks'));
  let subImg = null;
  if (subjectCard) {
    subImg = await captureChart(subjectCard, 2.5);
  }

  const rightX = 14 + colW + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`3. Course Performance (Sem ${latestRecord.semester})`, rightX, currentY + 2);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rightX, currentY + 5, colW, colH, 1.5, 1.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(rightX, currentY + 5, colW, colH, 1.5, 1.5, 'S');

  if (subImg) {
    doc.addImage(subImg.dataUrl, 'PNG', rightX + 2, currentY + 7, colW - 4, colH - 8);
  }

  // Footer for page 1
  addInstitutionalFooter(doc, 1, totalPages);

  // -------------------------------------------------------------
  // PAGE 2: Detailed Course Records & Academic Endorsements
  // -------------------------------------------------------------
  doc.addPage();
  addInstitutionalHeader(doc, 'Semester Academic Records', `Student: ${student.name} (${student.registerNumber})`);

  currentY = 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Detailed Semester-by-Semester Examination Ledger', 14, currentY + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Official internal assessment, end-semester evaluation, and final grade registry', 14, currentY + 7.5);

  currentY += 12;

  // Render each semester table
  student.records.forEach((record) => {
    // Check if table fits on page, else break (or squeeze)
    if (currentY > 230) {
      doc.addPage();
      addInstitutionalHeader(doc, 'Semester Academic Records (Contd.)', `Student: ${student.name} (${student.registerNumber})`);
      currentY = 28;
    }

    // Semester Table Header Banner
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, 182, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, currentY, 182, 6.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`SEMESTER ${record.semester}`, 18, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`SGPA: ${record.gpa}   |   Result: ${record.result || (record.failCount === 0 ? 'PASS' : 'FAIL')}`, 190, currentY + 4.5, { align: 'right' });

    currentY += 6.5;

    // Table Columns Header
    doc.setFillColor(15, 23, 42); // Navy header
    doc.rect(14, currentY, 182, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('COURSE CODE', 18, currentY + 4.2);
    doc.text('COURSE TITLE', 50, currentY + 4.2);
    doc.text('GRADE', 140, currentY + 4.2, { align: 'center' });
    doc.text('TOTAL MARKS', 165, currentY + 4.2, { align: 'center' });
    doc.text('RESULT', 186, currentY + 4.2, { align: 'center' });

    currentY += 6;

    // Table Rows
    record.subjects.forEach((sub, sIdx) => {
      const rowBg = sIdx % 2 === 0 ? 255 : 248;
      doc.setFillColor(rowBg, rowBg, rowBg);
      doc.rect(14, currentY, 182, 5.5, 'F');
      doc.setDrawColor(241, 245, 249);
      doc.line(14, currentY + 5.5, 196, currentY + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(37, 99, 235);
      doc.text(sub.code, 18, currentY + 3.8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      const title = sub.title && sub.title.length > 45 ? `${sub.title.slice(0, 42)}...` : (sub.title || 'Course Module');
      doc.text(title, 50, currentY + 3.8);

      // Grade
      const isFail = sub.grd === 'U' || sub.grd === 'RA' || (sub.res && sub.res.toUpperCase() === 'FAIL');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(isFail ? 239 : 15, isFail ? 68 : 23, isFail ? 68 : 42);
      doc.text(sub.grd, 140, currentY + 3.8, { align: 'center' });

      // Marks
      doc.text(`${sub.tot}`, 165, currentY + 3.8, { align: 'center' });

      // Result Pill
      doc.setTextColor(isFail ? 239 : 16, isFail ? 68 : 185, isFail ? 68 : 129);
      doc.text(sub.res ? sub.res.toUpperCase() : (isFail ? 'FAIL' : 'PASS'), 186, currentY + 3.8, { align: 'center' });

      currentY += 5.5;
    });

    currentY += 5; // Spacing after semester table
  });

  // 5. Faculty Mentoring & Institutional Signature Blocks
  if (currentY > 235) {
    doc.addPage();
    addInstitutionalHeader(doc, 'Academic Endorsement & Mentor Notes', `Student: ${student.name}`);
    currentY = 28;
  }

  currentY += 4;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, 182, 20, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, 182, 20, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.text('FACULTY MENTOR ADVISORY & INTERVENTION DIRECTIVE:', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const directiveText = isOptimal
    ? 'Student exhibits consistent high competency across curriculum. Advised to participate in competitive technical symposiums, research publications, and honors certification tracks.'
    : 'Student has registered subject vulnerabilities and standing arrears. Mandatory weekly remedial mentoring and tutorial coaching attendance is required. Academic progress report shared with department advisor.';
  doc.text(directiveText, 18, currentY + 11, { maxWidth: 174 });

  currentY += 28;

  // Signatures
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(20, currentY + 10, 75, currentY + 10);
  doc.line(135, currentY + 10, 190, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Class Advisor / Faculty Mentor', 47.5, currentY + 14, { align: 'center' });
  doc.text('Head of the Department (CSE)', 162.5, currentY + 14, { align: 'center' });

  // Footer for page 2
  addInstitutionalFooter(doc, 2, totalPages);

  // Trigger Download
  const filename = `Student_Report_${student.registerNumber}_${student.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
  return filename;
};

/**
 * =========================================================================
 * 2. CLASS / DEPARTMENT COHORT PDF REPORT GENERATOR
 * =========================================================================
 */
export const exportClassReportPDF = async ({
  department = 'All',
  semester = 'All',
  summary = {},
  trends = [],
  topPerformers = [],
  gradeDistribution = [],
  classDivision = [],
  radarData = [],
  subjects = [],
  atRisk = null
}) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const totalPages = 3;

  // -------------------------------------------------------------
  // PAGE 1: Executive Cohort Overview & Core KPIs
  // -------------------------------------------------------------
  addInstitutionalHeader(doc, 'Class Performance Report', `Generated: ${dateStr} ${timeStr}`);

  let currentY = 28;

  // Cohort Metadata Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, 182, 18, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, currentY, 182, 18, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const deptTitle = department === 'All' ? 'All Engineering Departments' : `Department of ${department}`;
  const semTitle = semester === 'All' ? 'All Semesters (Cumulative)' : `Semester ${semester}`;
  doc.text(`${deptTitle.toUpperCase()} — ${semTitle.toUpperCase()}`, 18, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Cohort Strength: ${summary.totalStudents || 0} Students   |   Pass Rate: ${summary.passPercentage || 0}%   |   Academic Year: 2023–2027`, 18, currentY + 13);

  currentY += 22;

  // 4 Core KPI Tiles
  const cardW = 42.5;
  const cardH = 21;
  const gap = 4;
  const kpis = [
    { label: 'TOTAL STUDENTS', value: `${summary.totalStudents || 0}`, sub: 'Active Enrolled' },
    { label: 'OVERALL PASS RATE', value: `${summary.passPercentage || 0}%`, sub: 'Examination Benchmark' },
    { label: 'AT-RISK COHORT', value: `${atRisk ? atRisk.totalAtRisk : 0}`, sub: `${atRisk ? atRisk.highRiskCount : 0} Critical · ${atRisk ? atRisk.moderateRiskCount : 0} Warning` },
    { label: 'AVERAGE SGPA', value: `${summary.averageGpa || 0.0}`, sub: `Range: ${summary.highestGpa || 0} – ${summary.lowestGpa || 0}` }
  ];

  kpis.forEach((k, idx) => {
    const x = 14 + idx * (cardW + gap);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, currentY, cardW, cardH, 1.5, 1.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, currentY, cardW, cardH, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(k.label, x + 4, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(idx === 1 ? 16 : idx === 2 ? 239 : 37, idx === 1 ? 185 : idx === 2 ? 68 : 99, idx === 1 ? 129 : idx === 2 ? 68 : 235);
    doc.text(k.value, x + 4, currentY + 13.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(k.sub, x + 4, currentY + 18);
  });

  currentY += cardH + 7;

  // Live Chart 1: SGPA Trend Chart
  const trendEl = Array.from(document.querySelectorAll('.chart-container')).find(el => el.textContent && el.textContent.includes('SGPA Trend')) || document.querySelectorAll('.chart-container')[0];
  let trendImg = null;
  if (trendEl) {
    trendImg = await captureChart(trendEl, 2.5);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Historical Cohort SGPA Progression Trajectory', 14, currentY + 3);

  currentY += 6;
  if (trendImg) {
    doc.addImage(trendImg.dataUrl, 'PNG', 14, currentY, 182, 60);
    currentY += 64;
  } else {
    currentY += 15;
  }

  // Row with Top Performers (Left) & Class Division (Right)
  const halfW = 88;
  const halfH = 75;

  // Left: Top Performers Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Top Academic Performers (Honor Roll)', 14, currentY + 3);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, currentY + 6, halfW, halfH, 1.5, 1.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, currentY + 6, halfW, halfH, 1.5, 1.5, 'S');

  // Mini Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(14, currentY + 6, halfW, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('RANK', 18, currentY + 10.2);
  doc.text('STUDENT NAME', 32, currentY + 10.2);
  doc.text('REG. NUMBER', 68, currentY + 10.2);
  doc.text('SGPA', 98, currentY + 10.2, { align: 'right' });

  let topY = currentY + 16;
  topPerformers.slice(0, 5).forEach((p, i) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(i === 0 ? 245 : i === 1 ? 100 : i === 2 ? 180 : 15, i === 0 ? 158 : i === 1 ? 116 : i === 2 ? 83 : 23, i === 0 ? 11 : i === 1 ? 139 : i === 2 ? 9 : 42);
    doc.text(`#${i + 1}`, 18, topY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const shortName = p.name.length > 18 ? `${p.name.slice(0, 16)}...` : p.name;
    doc.text(shortName, 32, topY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(p.registerNumber, 68, topY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(`${p.gpa}`, 98, topY, { align: 'right' });

    doc.setDrawColor(241, 245, 249);
    doc.line(16, topY + 2.5, 100, topY + 2.5);
    topY += 10;
  });

  // Right: Class Division Chart
  const divCard = Array.from(document.querySelectorAll('.chart-container')).find(el => el.textContent && el.textContent.includes('Class Division'));
  let divImg = null;
  if (divCard) {
    divImg = await captureChart(divCard, 2.5);
  }

  const rightColX = 14 + halfW + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Standing & Class Classification', rightColX, currentY + 3);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rightColX, currentY + 6, halfW, halfH, 1.5, 1.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(rightColX, currentY + 6, halfW, halfH, 1.5, 1.5, 'S');

  if (divImg) {
    doc.addImage(divImg.dataUrl, 'PNG', rightColX + 2, currentY + 8, halfW - 4, halfH - 12);
  }

  addInstitutionalFooter(doc, 1, totalPages);

  // -------------------------------------------------------------
  // PAGE 2: Curriculum Diagnostics & Subject Analytics
  // -------------------------------------------------------------
  doc.addPage();
  addInstitutionalHeader(doc, 'Curriculum Diagnostics & Grading', `${deptTitle} — ${semTitle}`);

  currentY = 28;

  // Grade Distribution Bar Chart (Left) + Subject Difficulty Radar (Right)
  const gradeCard = Array.from(document.querySelectorAll('.chart-container')).find(el => el.textContent && el.textContent.includes('Grade Distribution') && !el.textContent.includes('Batch'));
  let gradeImg = null;
  if (gradeCard) {
    gradeImg = await captureChart(gradeCard, 2.5);
  }

  const radarCard = Array.from(document.querySelectorAll('.chart-container')).find(el => el.textContent && el.textContent.includes('Subject Difficulty Radar'));
  let radarImg = null;
  if (radarCard) {
    radarImg = await captureChart(radarCard, 2.5);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Cohort Grade Breakdown across Courses', 14, currentY + 3);
  doc.text('5. Subject Difficulty Spectrum (Radar)', rightColX, currentY + 3);

  currentY += 6;

  // Boxes
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, currentY, halfW, 70, 1.5, 1.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, currentY, halfW, 70, 1.5, 1.5, 'S');

  doc.roundedRect(rightColX, currentY, halfW, 70, 1.5, 1.5, 'F');
  doc.roundedRect(rightColX, currentY, halfW, 70, 1.5, 1.5, 'S');

  if (gradeImg) doc.addImage(gradeImg.dataUrl, 'PNG', 16, currentY + 2, halfW - 4, 66);
  if (radarImg) doc.addImage(radarImg.dataUrl, 'PNG', rightColX + 2, currentY + 2, halfW - 4, 66);

  currentY += 76;

  // Batch Comparison Stacked Bar (Full Width)
  const batchCard = Array.from(document.querySelectorAll('.chart-container')).find(el => el.textContent && el.textContent.includes('Grade Distribution by Batch'));
  let batchImg = null;
  if (batchCard) {
    batchImg = await captureChart(batchCard, 2.5);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('6. Multi-Semester Batch Grading Comparison (Relative Quality)', 14, currentY + 3);

  currentY += 6;
  if (batchImg) {
    doc.addImage(batchImg.dataUrl, 'PNG', 14, currentY, 182, 60);
    currentY += 65;
  } else {
    currentY += 15;
  }

  // Top At-Risk Courses Summary Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('7. Top Vulnerable / At-Risk Courses (Highest Arrear Rates)', 14, currentY + 3);

  currentY += 6;

  doc.setFillColor(15, 23, 42);
  doc.rect(14, currentY, 182, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('COURSE CODE / TITLE', 18, currentY + 4.2);
  doc.text('STUDENTS PASSED', 90, currentY + 4.2, { align: 'center' });
  doc.text('STUDENTS FAILED', 130, currentY + 4.2, { align: 'center' });
  doc.text('FAILURE RATE (%)', 175, currentY + 4.2, { align: 'center' });

  currentY += 6;

  subjects.slice(0, 5).forEach((sub, sIdx) => {
    const total = sub.passCount + sub.failCount;
    const failPct = total > 0 ? Math.round((sub.failCount / total) * 100) : 0;
    const rowBg = sIdx % 2 === 0 ? 255 : 248;

    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.rect(14, currentY, 182, 6, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(14, currentY + 6, 196, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(sub.subject, 18, currentY + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(16, 185, 129);
    doc.text(`${sub.passCount}`, 90, currentY + 4.2, { align: 'center' });

    doc.setTextColor(239, 68, 68);
    doc.text(`${sub.failCount}`, 130, currentY + 4.2, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.text(`${failPct}%`, 175, currentY + 4.2, { align: 'center' });

    currentY += 6;
  });

  addInstitutionalFooter(doc, 2, totalPages);

  // -------------------------------------------------------------
  // PAGE 3: Actionable At-Risk Student Registry & Remedial Directives
  // -------------------------------------------------------------
  doc.addPage();
  addInstitutionalHeader(doc, 'At-Risk Student Registry', `${deptTitle} — Priority Intervention`);

  currentY = 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('8. Institutional Early-Warning & Remedial Coaching Registry', 14, currentY + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Filtered registry of students classified as Critical or Warning requiring mentor intervention', 14, currentY + 7.5);

  currentY += 12;

  // At-Risk Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(14, currentY, 182, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('REGISTER NO.', 18, currentY + 4.5);
  doc.text('STUDENT NAME', 48, currentY + 4.5);
  doc.text('SEM', 95, currentY + 4.5, { align: 'center' });
  doc.text('GPA', 110, currentY + 4.5, { align: 'center' });
  doc.text('ARREARS', 128, currentY + 4.5, { align: 'center' });
  doc.text('RISK TIER', 148, currentY + 4.5, { align: 'center' });
  doc.text('REMEDIAL ADVISORY / REASON', 170, currentY + 4.5);

  currentY += 6.5;

  const atRiskList = atRisk ? [...atRisk.highRisk, ...atRisk.moderateRisk].slice(0, 18) : [];

  if (atRiskList.length === 0) {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, 182, 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('No students currently identified at academic risk under selected filters.', 105, currentY + 7.5, { align: 'center' });
    currentY += 15;
  } else {
    atRiskList.forEach((s, idx) => {
      const isCritical = s.riskLevel === 'critical';
      const rowBg = idx % 2 === 0 ? 255 : 248;
      doc.setFillColor(rowBg, rowBg, rowBg);
      doc.rect(14, currentY, 182, 5.5, 'F');
      doc.setDrawColor(241, 245, 249);
      doc.line(14, currentY + 5.5, 196, currentY + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(37, 99, 235);
      doc.text(s.registerNumber, 18, currentY + 3.8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const shortName = s.name.length > 22 ? `${s.name.slice(0, 20)}...` : s.name;
      doc.text(shortName, 48, currentY + 3.8);

      doc.text(`${s.semester}`, 95, currentY + 3.8, { align: 'center' });
      doc.text(`${s.gpa}`, 110, currentY + 3.8, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(s.failCount > 0 ? 239 : 15, s.failCount > 0 ? 68 : 23, s.failCount > 0 ? 68 : 42);
      doc.text(`${s.failCount}`, 128, currentY + 3.8, { align: 'center' });

      // Risk Pill
      doc.setTextColor(isCritical ? 239 : 245, isCritical ? 68 : 158, isCritical ? 68 : 11);
      doc.text(isCritical ? 'CRITICAL' : 'WARNING', 148, currentY + 3.8, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      const reason = s.reason && s.reason.length > 32 ? `${s.reason.slice(0, 30)}...` : (s.reason || 'Academic lag');
      doc.text(reason, 168, currentY + 3.8);

      currentY += 5.5;
    });
  }

  currentY += 8;

  // Institutional Remedial Directive Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, 182, 18, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, 182, 18, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.text('DEPARTMENTAL INTERVENTION & TUTORIAL ACTION PLAN:', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('1. Mandatory remedial coaching classes scheduled daily from 4:45 PM – 5:45 PM for all at-risk courses identified.', 18, currentY + 11);
  doc.text('2. Bi-weekly progress review logs must be submitted by designated faculty mentors to the Head of Department.', 18, currentY + 15);

  currentY += 26;

  // Three Signature Blocks
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(18, currentY + 8, 60, currentY + 8);
  doc.line(82, currentY + 8, 128, currentY + 8);
  doc.line(150, currentY + 8, 192, currentY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Programme Coordinator', 39, currentY + 12, { align: 'center' });
  doc.text('Head of the Department', 105, currentY + 12, { align: 'center' });
  doc.text('Dean (Academic Quality)', 171, currentY + 12, { align: 'center' });

  addInstitutionalFooter(doc, 3, totalPages);

  // Trigger Download
  const filename = `Class_Report_${department.replace(/[^a-zA-Z0-9]/g, '_')}_Sem_${semester}_${dateStr.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
  return filename;
};

export default {
  exportStudentReportPDF,
  exportClassReportPDF,
  captureChart,
  captureSvgToDataUrl,
  captureElementToCanvas
};
