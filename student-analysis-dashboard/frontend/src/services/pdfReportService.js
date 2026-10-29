import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * High-Resolution Chart SVG to PNG Data URL converter.
 * Inlines computed CSS styles to guarantee razor-sharp vector-like rendering in PDF.
 */
/**
 * High-Resolution Chart SVG to PNG Data URL converter.
 * Inlines computed styles safely without breaking XML and eliminates absolute origin URLs.
 */
export const captureSvgToDataUrl = async (svgElement, scale = 2.5) => {
  if (!svgElement) return null;

  try {
    const rect = svgElement.getBoundingClientRect();
    const attrW = parseFloat(svgElement.getAttribute('width'));
    const attrH = parseFloat(svgElement.getAttribute('height'));
    const width = Math.max(attrW || rect.width || 400, 300);
    const height = Math.max(attrH || rect.height || 260, 200);

    const clonedSvg = svgElement.cloneNode(true);
    clonedSvg.setAttribute('width', String(width));
    clonedSvg.setAttribute('height', String(height));
    clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    const copyStylesSafe = (source, target) => {
      if (!source || !target || target.nodeType !== 1) return;
      const tag = target.tagName ? target.tagName.toLowerCase() : '';

      // Skip definitions, clip paths, masks internal structure
      if (tag === 'defs' || tag === 'clippath' || tag === 'mask') return;

      const computed = window.getComputedStyle(source);
      if (!computed) return;

      // Text styling
      if (tag === 'text' || tag === 'tspan') {
        const fill = computed.getPropertyValue('fill');
        if (fill && fill !== 'none') target.setAttribute('fill', fill);
        target.setAttribute('font-family', 'sans-serif');
        const fSize = computed.getPropertyValue('font-size');
        if (fSize) target.setAttribute('font-size', fSize);
        const fWeight = computed.getPropertyValue('font-weight');
        if (fWeight) target.setAttribute('font-weight', fWeight);
        const anchor = computed.getPropertyValue('text-anchor');
        if (anchor) target.setAttribute('text-anchor', anchor);
      }

      // Shape styling
      if (tag === 'path' || tag === 'rect' || tag === 'circle' || tag === 'line' || tag === 'polygon') {
        const attrFill = source.getAttribute('fill');
        if (attrFill) {
          target.setAttribute('fill', attrFill.replace(/url\(["']?https?:\/\/[^#]*#/gi, 'url(#').replace(/['"]/g, ''));
        } else {
          const computedFill = computed.getPropertyValue('fill');
          if (computedFill && computedFill !== 'none') {
            const cleanFill = computedFill.replace(/url\(["']?https?:\/\/[^#]*#/gi, 'url(#').replace(/['"]/g, '');
            target.setAttribute('fill', cleanFill);
          }
        }

        const attrStroke = source.getAttribute('stroke');
        if (attrStroke) {
          target.setAttribute('stroke', attrStroke.replace(/url\(["']?https?:\/\/[^#]*#/gi, 'url(#').replace(/['"]/g, ''));
        } else {
          const stroke = computed.getPropertyValue('stroke');
          if (stroke && stroke !== 'none') {
            target.setAttribute('stroke', stroke);
          }
        }

        const sWidth = source.getAttribute('stroke-width') || computed.getPropertyValue('stroke-width');
        if (sWidth && sWidth !== '0px') target.setAttribute('stroke-width', sWidth);

        const sDash = source.getAttribute('stroke-dasharray') || computed.getPropertyValue('stroke-dasharray');
        if (sDash && sDash !== 'none') target.setAttribute('stroke-dasharray', sDash);
      }

      // Clip path sanitization (keep purely relative)
      const clip = target.getAttribute('clip-path') || computed.getPropertyValue('clip-path');
      if (clip && clip !== 'none') {
        const cleanClip = clip.replace(/url\(["']?https?:\/\/[^#]*#/gi, 'url(#').replace(/['"]/g, '');
        target.setAttribute('clip-path', cleanClip);
      }

      for (let i = 0; i < Math.min(source.children.length, target.children.length); i++) {
        copyStylesSafe(source.children[i], target.children[i]);
      }
    };

    copyStylesSafe(svgElement, clonedSvg);

    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(clonedSvg);

    // Sanitize any remaining absolute URLs
    svgString = svgString.replace(/url\(['"]?https?:\/\/[^#]*#([^'"]+)['"]?\)/gi, 'url(#$1)');

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Try base64 data URL
    let loaded = false;
    try {
      const base64 = window.btoa(unescape(encodeURIComponent(svgString)));
      const dataUrl = `data:image/svg+xml;base64,${base64}`;
      const img = new Image();
      loaded = await new Promise((resolve) => {
        img.onload = () => {
          try {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(true);
          } catch (e) {
            resolve(false);
          }
        };
        img.onerror = () => resolve(false);
        img.src = dataUrl;
      });
    } catch (b64Err) {
      loaded = false;
    }

    // Backup: Blob URL
    if (!loaded) {
      try {
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const img = new Image();
        loaded = await new Promise((resolve) => {
          img.onload = () => {
            try {
              ctx.drawImage(img, 0, 0, width, height);
              URL.revokeObjectURL(svgUrl);
              resolve(true);
            } catch (e) {
              URL.revokeObjectURL(svgUrl);
              resolve(false);
            }
          };
          img.onerror = () => {
            URL.revokeObjectURL(svgUrl);
            resolve(false);
          };
          img.src = svgUrl;
        });
      } catch (blobErr) {
        loaded = false;
      }
    }

    if (loaded) {
      return {
        dataUrl: canvas.toDataURL('image/png', 1.0),
        width,
        height,
        aspectRatio: width / height
      };
    }
    return null;
  } catch (err) {
    console.warn('Error in captureSvgToDataUrl:', err);
    return null;
  }
};

/**
 * Capture an entire DOM card or element (including HTML tables, badges, text)
 * at high DPI (2x retina) using html2canvas.
 */
export const captureElementToCanvas = async (element, scale = 2.0) => {
  if (!element) return null;
  try {
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      ignoreElements: (el) => {
        return el.tagName === 'BUTTON' || el.classList?.contains('recharts-tooltip-wrapper');
      },
      onclone: (clonedDoc, clonedElement) => {
        if (clonedElement) {
          clonedElement.style.transform = 'none';
          clonedElement.style.boxShadow = 'none';
        }
      }
    });

    return {
      dataUrl: canvas.toDataURL('image/png', 1.0),
      width: canvas.width / scale,
      height: canvas.height / scale,
      aspectRatio: canvas.width / canvas.height
    };
  } catch (err) {
    console.warn('html2canvas capture error:', err);
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
    console.warn('captureChart error:', e);
    return null;
  }
};

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

/**
 * Dynamic Multi-Page PDF Exporter for AI Report Builder Canvas.
 * Captures user-configured cards in natural order, automatically handles page breaks,
 * preserves high-DPI resolution without cropping or splitting, and adds official branding.
 */
export const exportCustomReportPDF = async ({
  title = 'BANNARI AMMAN INSTITUTE OF TECHNOLOGY',
  subtitle = '',
  scope = 'student',
  entityInfo = {},
  dataset = null,
  pages = [],
  canvasElement = null,
  returnBlob = false
}) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = 182;
  const maxContentY = 280;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const studentInfo = dataset?.studentInfo || entityInfo || {};
  const cohortInfo = dataset?.cohortInfo || entityInfo || {};

  // Find DOM element robustly across canvas and preview modal
  const findComponentElement = (comp) => {
    if (!comp) return null;
    const queries = [
      comp.instanceId ? `[data-component-id="${comp.instanceId}"]` : null,
      comp.id ? `[data-component-id="${comp.id}"]` : null,
      comp.originalId ? `[data-component-id*="${comp.originalId}"]` : null,
      comp.id ? `[data-component-id*="${comp.id}"]` : null
    ].filter(Boolean);

    for (const q of queries) {
      try {
        const el = document.querySelector(q);
        if (el) return el;
      } catch (e) {}
    }
    return null;
  };

  // Direct vector chart drawer: guarantees 100% vector fidelity even if DOM image is absent
  const drawDirectVectorChart = (doc, comp, x, y, width, height) => {
    const data = comp.data || [];
    if (!data || data.length === 0) return;

    const viz = comp.visualization || comp.config?.type || '';
    const isLine = viz === 'line' || comp.id.includes('progression') || comp.id.includes('trend');
    const isStacked = viz === 'stacked_bar' || comp.id.includes('stacked') || comp.id.includes('internal_external') || comp.id.includes('comparison');
    const isDonut = viz === 'donut' || viz === 'pie' || comp.id.includes('donut') || comp.id.includes('division');

    const axisY = y + height - 8;
    const axisX1 = x + 8;
    const axisX2 = x + width - 4;
    const plotW = axisX2 - axisX1;
    const plotH = height - 16;

    // 1. Line Chart (SGPA Progression / Cohort SGPA Trend)
    if (isLine) {
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.line(axisX1, y + plotH * 0.5, axisX2, y + plotH * 0.5);

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(axisX1, axisY, axisX2, axisY);

      const pts = data.slice(0, 8);
      const n = pts.length;
      if (n > 0) {
        const step = plotW / Math.max(1, n - 1 || 1);
        const coords = pts.map((p, idx) => {
          const val = parseFloat(p.sgpa || p.averageGpa || p.gpa || p.y || 0);
          const ratio = Math.max(0, Math.min(1, val / 10.0));
          const px = n === 1 ? axisX1 + plotW / 2 : axisX1 + idx * step;
          const py = axisY - ratio * (plotH - 4);
          return { px, py, val, sem: p.semester || `Sem ${idx + 1}` };
        });

        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.7);
        for (let i = 0; i < coords.length - 1; i++) {
          doc.line(coords[i].px, coords[i].py, coords[i + 1].px, coords[i + 1].py);
        }

        coords.forEach((c) => {
          doc.setFillColor(37, 99, 235);
          doc.circle(c.px, c.py, 1.2, 'F');
          doc.setFillColor(255, 255, 255);
          doc.circle(c.px, c.py, 0.6, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(5.5);
          doc.setTextColor(37, 99, 235);
          doc.text(String(c.val), c.px, c.py - 2, { align: 'center' });

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5);
          doc.setTextColor(100, 116, 139);
          doc.text(String(c.sem), c.px, axisY + 4, { align: 'center' });
        });
      }
    }
    // 2. Stacked Bar Chart (Internal vs External Marks / Batch Comparison)
    else if (isStacked) {
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(axisX1, axisY, axisX2, axisY);

      doc.setFillColor(37, 99, 235);
      doc.rect(axisX2 - 28, y + 1, 3, 2.5, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5);
      doc.setTextColor(100, 116, 139);
      doc.text('CIA', axisX2 - 23, y + 3);

      doc.setFillColor(79, 70, 229);
      doc.rect(axisX2 - 14, y + 1, 3, 2.5, 'F');
      doc.text('ESE', axisX2 - 9, y + 3);

      const items = data.slice(0, 8);
      const n = items.length;
      const barW = Math.min(6, (plotW / Math.max(1, n)) * 0.6);
      const step = plotW / Math.max(1, n);

      items.forEach((item, idx) => {
        const bx = axisX1 + idx * step + (step - barW) / 2;
        const im = parseFloat(item.internalMarks || item.im || 0);
        const em = parseFloat(item.externalMarks || item.em || 0);
        const total = im + em || 1;
        const maxScore = 100;

        const hIm = Math.max(0, (im / maxScore) * (plotH - 6));
        const hEm = Math.max(0, (em / maxScore) * (plotH - 6));

        doc.setFillColor(37, 99, 235);
        doc.rect(bx, axisY - hIm, barW, hIm, 'F');

        doc.setFillColor(79, 70, 229);
        doc.rect(bx, axisY - hIm - hEm, barW, hEm, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(4.8);
        doc.setTextColor(15, 23, 42);
        doc.text(String(Math.round(total)), bx + barW / 2, axisY - hIm - hEm - 1.5, { align: 'center' });

        const label = String(item.code || item.batch || item.semester || '').slice(0, 7);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(4.8);
        doc.setTextColor(100, 116, 139);
        doc.text(label, bx + barW / 2, axisY + 4, { align: 'center' });
      });
    }
    // 3. Donut / Pie Grade Distribution
    else if (isDonut) {
      const items = data.slice(0, 6);
      const colors = [
        [37, 99, 235],
        [16, 185, 129],
        [245, 158, 11],
        [239, 68, 68],
        [139, 92, 246],
        [14, 165, 233]
      ];

      const blockW = (width - 12) / 3;
      const blockH = 11;

      items.forEach((item, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        const bx = x + 4 + col * (blockW + 2);
        const by = y + 5 + row * (blockH + 3);
        const c = colors[idx % colors.length];

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(bx, by, blockW, blockH, 1, 1, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(bx, by, blockW, blockH, 1, 1, 'S');

        doc.setFillColor(c[0], c[1], c[2]);
        doc.rect(bx + 2, by + 3.5, 2.5, 4, 'F');

        const name = String(item.grade || item.division || item.name || 'Grade').slice(0, 8);
        const count = item.count !== undefined ? item.count : (item.value || 0);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(15, 23, 42);
        doc.text(String(count), bx + 6, by + 5.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5);
        doc.setTextColor(100, 116, 139);
        doc.text(name, bx + 6, by + 9.5);
      });
    }
    // 4. Bar Chart (Latest Course Performance / Cohort Grade Distribution)
    else {
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(axisX1, axisY, axisX2, axisY);

      const items = data.slice(0, 9);
      const n = items.length;
      const barW = Math.min(6.5, (plotW / Math.max(1, n)) * 0.65);
      const step = plotW / Math.max(1, n);

      items.forEach((item, idx) => {
        const bx = axisX1 + idx * step + (step - barW) / 2;
        const val = parseFloat(item.tot || item.count || item.percentage || item.average || item.value || 0);
        const maxVal = Math.max(100, ...items.map((i) => parseFloat(i.tot || i.count || i.percentage || i.value || 0)));
        const barH = Math.max(1, (val / maxVal) * (plotH - 6));

        if (val >= 80) doc.setFillColor(16, 185, 129);
        else if (val >= 60) doc.setFillColor(37, 99, 235);
        else if (val >= 50) doc.setFillColor(245, 158, 11);
        else doc.setFillColor(239, 68, 68);

        doc.rect(bx, axisY - barH, barW, barH, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(4.8);
        doc.setTextColor(15, 23, 42);
        doc.text(String(Math.round(val)), bx + barW / 2, axisY - barH - 1.5, { align: 'center' });

        const label = String(item.code || item.grade || item.subject || '').slice(0, 7);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(4.8);
        doc.setTextColor(100, 116, 139);
        doc.text(label, bx + barW / 2, axisY + 4, { align: 'center' });
      });
    }
  };

  // Render individual chart card
  const renderChartCard = async (comp, x, y, width, height) => {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, width, height, 1.5, 1.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, width, height, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(comp.title || 'Academic Performance', x + 3.5, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    if (comp.subtitle) {
      const sub = comp.subtitle.length > 55 ? comp.subtitle.slice(0, 52) + '...' : comp.subtitle;
      doc.text(sub, x + 3.5, y + 9);
    }

    const chartEl = findComponentElement(comp);
    let chartImg = null;
    if (chartEl) {
      chartImg = await captureChart(chartEl, 2.5);
    }

    const topOff = comp.subtitle ? 10.5 : 7.5;
    if (chartImg && chartImg.dataUrl) {
      doc.addImage(chartImg.dataUrl, 'PNG', x + 2, y + topOff, width - 4, height - topOff - 2, undefined, 'FAST');
    } else {
      drawDirectVectorChart(doc, comp, x + 2, y + topOff, width - 4, height - topOff - 2);
    }
  };

  // Render KPI group
  const renderKPIGroup = (comp, x, y, width, height) => {
    const data = comp.data || {};
    const isStudentKpi = 'cgpa' in data;
    const kpis = isStudentKpi
      ? [
          { label: 'CUMULATIVE CGPA', val: `${data.cgpa || 0.0} / 10`, color: '#2563eb' },
          { label: 'LATEST SGPA', val: `${data.latestSgpa || 0.0}`, color: '#059669' },
          { label: 'STANDING ARREARS', val: `${data.totalArrears || 0}`, color: data.totalArrears > 0 ? '#dc2626' : '#059669' },
          { label: 'ACADEMIC STANDING', val: `${data.standing ? data.standing.split(' ')[0] : 'Optimal'}`, color: '#0f172a' }
        ]
      : [
          { label: 'TOTAL ENROLLED', val: `${data.totalStudents || 0}`, color: '#2563eb' },
          { label: 'PASS PERCENTAGE', val: `${data.passPercentage || 0}%`, color: '#059669' },
          { label: 'AVERAGE SGPA', val: `${data.averageGpa || 0.0}`, color: '#2563eb' },
          { label: 'AT-RISK STUDENTS', val: `${data.totalAtRisk || 0}`, color: data.totalAtRisk > 0 ? '#dc2626' : '#059669' }
        ];

    const tileW = (width - 9) / 4;
    const tileH = 17;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(comp.title || 'Core Academic KPIs', x, y + 4);

    kpis.forEach((kpi, kIdx) => {
      const tx = x + kIdx * (tileW + 3);
      const ty = y + 6;

      doc.setFillColor(255, 255, 255);
      doc.roundedRect(tx, ty, tileW, tileH, 1.5, 1.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(tx, ty, tileW, tileH, 1.5, 1.5, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(100, 116, 139);
      doc.text(kpi.label, tx + 3, ty + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      if (kpi.color === '#2563eb') doc.setTextColor(37, 99, 235);
      else if (kpi.color === '#059669') doc.setTextColor(5, 150, 105);
      else if (kpi.color === '#dc2626') doc.setTextColor(220, 38, 38);
      else doc.setTextColor(15, 23, 42);
      doc.text(kpi.val, tx + 3, ty + 12.5);
    });
  };

  // Render AI narrative insight card
  const renderAIInsightCard = (comp, x, y, width, height) => {
    const insightRaw = comp.data || comp.insightText || '';
    const insightText = typeof insightRaw === 'string'
      ? insightRaw
      : (insightRaw.summary || JSON.stringify(insightRaw));

    doc.setFillColor(250, 245, 255);
    doc.roundedRect(x, y, width, height, 1.5, 1.5, 'F');
    doc.setDrawColor(216, 180, 254);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, width, height, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(124, 58, 237);
    doc.text('AI ACADEMIC DIAGNOSTIC & PROGRESSION SUMMARY', x + 4, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(51, 65, 85);
    const splitText = doc.splitTextToSize(insightText, width - 8);
    const maxLines = Math.floor((height - 9) / 3.4);
    doc.text(splitText.slice(0, maxLines), x + 4, y + 10.5);
  };

  // Render highlight card (Strengths & Vulnerabilities)
  const renderHighlightCard = (comp, x, y, width, height) => {
    const data = comp.data || {};
    const strongest = data.strongest || [];
    const weakest = data.weakest || [];

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, width, height, 1.5, 1.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, width, height, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(comp.title || 'Curricular Strengths & Remedial Analysis', x + 3.5, y + 5.5);

    const subBoxW = (width - 7) / 2;
    const subBoxH = height - 9;
    const subY = y + 7;

    // Strongest Box (Green)
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(x + 2, subY, subBoxW, subBoxH, 1, 1, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.setLineWidth(0.2);
    doc.roundedRect(x + 2, subY, subBoxW, subBoxH, 1, 1, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(22, 101, 52);
    doc.text('HIGHEST COMPETENCY', x + 4, subY + 4.5);

    let sY = subY + 9;
    strongest.slice(0, 4).forEach((s) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(15, 23, 42);
      doc.text(s.code || '', x + 4, sY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(22, 101, 52);
      doc.text(`${s.tot || 0}/100`, x + subBoxW - 10, sY);
      sY += 4.2;
    });

    // Weakest Box (Red)
    const rX = x + 2 + subBoxW + 3;
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(rX, subY, subBoxW, subBoxH, 1, 1, 'F');
    doc.setDrawColor(254, 202, 202);
    doc.setLineWidth(0.2);
    doc.roundedRect(rX, subY, subBoxW, subBoxH, 1, 1, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(153, 27, 27);
    doc.text('REMEDIAL INTERVENTION', rX + 4, subY + 4.5);

    let wY = subY + 9;
    weakest.slice(0, 4).forEach((w) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(15, 23, 42);
      doc.text(w.code || '', rX + 4, wY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(185, 28, 28);
      doc.text(`${w.tot || 0}/100`, rX + subBoxW - 10, wY);
      wY += 4.2;
    });
  };

  // Render Top At-Risk Courses progress bars
  const renderProgressBars = (comp, x, y, width, height) => {
    const list = comp.data || [];
    const colors = [
      [239, 68, 68],
      [249, 115, 22],
      [245, 158, 11],
      [16, 185, 129],
      [59, 130, 246]
    ];

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, width, height, 1.5, 1.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, width, height, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Top At-Risk Courses', x + 3.5, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Fail %', x + width - 12, y + 5.5);

    const items = list.slice(0, 5);
    const rowStep = Math.min(6, (height - 9) / Math.max(1, items.length));
    items.forEach((item, idx) => {
      const rowY = y + 9 + idx * rowStep;
      const failVal = item.failPct !== undefined
        ? item.failPct
        : (item.failCount && (item.passCount + item.failCount) > 0
            ? Math.round((item.failCount / (item.passCount + item.failCount)) * 100)
            : item.failCount || 0);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(30, 41, 59);
      doc.text(String(item.subject || 'Course'), x + 3.5, rowY + 3.2);

      const trackX = x + 24;
      const trackW = width - 42;
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(trackX, rowY + 1.2, trackW, 2.4, 0.8, 0.8, 'F');

      const fillW = Math.max(1, (Math.min(100, Math.max(5, failVal)) / 100) * trackW);
      const c = colors[idx % colors.length];
      doc.setFillColor(c[0], c[1], c[2]);
      doc.roundedRect(trackX, rowY + 1.2, fillW, 2.4, 0.8, 0.8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(51, 65, 85);
      doc.text(`${failVal}%`, x + width - 12, rowY + 3.2);
    });
  };

  // Render Table Ledger
  const renderTable = (comp, x, y, width) => {
    const rows = comp.data || [];
    const cols = comp.columns || [];

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(comp.title || 'Official Examination Ledger', x, y + 4);

    if (rows.length > 0) {
      const tableW = width;
      const rowH = 5.2;
      const headerH = 6;
      const numCols = Math.max(1, cols.length);
      const colW = tableW / numCols;
      let curY = y + 6;

      // Header Row
      doc.setFillColor(241, 245, 249);
      doc.rect(x, curY, tableW, headerH, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.rect(x, curY, tableW, headerH, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(51, 65, 85);
      cols.forEach((col, cIdx) => {
        const label = col.label || col.header || col.name || '';
        doc.text(label.toUpperCase(), x + cIdx * colW + 2, curY + 4.2);
      });

      curY += headerH;

      const visibleRows = rows.slice(0, 10);
      visibleRows.forEach((row, rIdx) => {
        if (curY + rowH > maxContentY) return;

        doc.setFillColor(rIdx % 2 === 0 ? 255 : 248, rIdx % 2 === 0 ? 255 : 250, rIdx % 2 === 0 ? 255 : 252);
        doc.rect(x, curY, tableW, rowH, 'F');
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.2);
        doc.rect(x, curY, tableW, rowH, 'S');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(15, 23, 42);

        cols.forEach((col, cIdx) => {
          let cellVal = row[col.name];
          if (cellVal === undefined || cellVal === null) cellVal = '—';
          const cellStr = String(cellVal);

          if (col.name === 'res' || col.name === 'result') {
            const isPass = cellStr.toUpperCase().includes('PASS');
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(isPass ? 22 : 220, isPass ? 101 : 38, isPass ? 52 : 38);
            doc.text(cellStr, x + cIdx * colW + 2, curY + 3.6);
            doc.setTextColor(15, 23, 42);
            doc.setFont('helvetica', 'normal');
          } else if (col.name === 'grd' || col.name === 'grade') {
            doc.setFont('helvetica', 'bold');
            doc.text(cellStr, x + cIdx * colW + 2, curY + 3.6);
            doc.setFont('helvetica', 'normal');
          } else {
            const maxChars = Math.floor(colW / 2.2);
            const displayStr = cellStr.length > maxChars ? cellStr.substring(0, maxChars - 2) + '..' : cellStr;
            doc.text(displayStr, x + cIdx * colW + 2, curY + 3.6);
          }
        });

        curY += rowH;
      });
    }
  };

  // Render Signatures block
  const renderSignatures = (comp, x, y, width, height) => {
    const signatories = comp.data?.signatories || [
      { role: 'Faculty Mentor / Class Advisor', dept: 'Department of Computer Science' },
      { role: 'Head of Department', dept: 'Department of Computer Science' },
      { role: 'Dean (Academic Quality)', dept: 'Bannari Amman Institute of Technology' }
    ];

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, width, height, 1.5, 1.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, width, height, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('OFFICIAL INSTITUTIONAL ENDORSEMENTS & QUALITY VERIFICATION', x + 4, y + 5);

    const colW = (width - 12) / 3;
    signatories.forEach((sig, sIdx) => {
      const sx = x + 4 + sIdx * (colW + 4);
      const lineY = y + 18;

      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.3);
      doc.line(sx, lineY, sx + colW - 6, lineY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(15, 23, 42);
      doc.text(sig.role || '', sx, lineY + 3.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(100, 116, 139);
      doc.text(sig.dept || '', sx, lineY + 6.5);
    });
  };

  // Unified component dispatcher
  const renderComponent = async (comp, x, y, width, height) => {
    if (comp.type === 'kpi_group') {
      renderKPIGroup(comp, x, y, width, height);
    } else if (comp.type === 'ai_insight' || comp.type === 'narrative_card') {
      renderAIInsightCard(comp, x, y, width, height);
    } else if (comp.type === 'highlight_card') {
      renderHighlightCard(comp, x, y, width, height);
    } else if (comp.id === 'cohort_vulnerable_courses_card' || comp.id === 'cohort_vulnerable_courses_table') {
      renderProgressBars(comp, x, y, width, height);
    } else if (comp.type === 'chart') {
      await renderChartCard(comp, x, y, width, height);
    } else if (comp.type === 'signature_block') {
      renderSignatures(comp, x, y, width, height);
    } else if (comp.type === 'table') {
      renderTable(comp, x, y, width);
    } else {
      await renderChartCard(comp, x, y, width, height);
    }
  };

  // Allow brief settle for animations or dynamic charts
  await new Promise((r) => setTimeout(r, 200));

  if (pages && pages.length > 0) {
    const totalPages = pages.length;

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      if (pageIndex > 0) {
        doc.addPage();
      }

      const pNum = pageIndex + 1;
      const pageObj = pages[pageIndex];
      const pageComponents = pageObj.components || [];

      let currentY = 14;

      // ── Page 1: Official Institutional Letterhead + Student Identity Box ──
      if (pNum === 1) {
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, pageWidth, 5, 'F');

        doc.setFillColor(15, 23, 42);
        doc.rect(0, 5, pageWidth, 1.5, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text('BANNARI AMMAN INSTITUTE OF TECHNOLOGY', marginX, 15);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Autonomous Institution Affiliated to Anna University • Accredited by NAAC with "A+" Grade', marginX, 19.5);

        doc.setFillColor(239, 246, 255);
        doc.roundedRect(144, 9, 52, 12, 1.5, 1.5, 'F');
        doc.setDrawColor(191, 219, 254);
        doc.setLineWidth(0.3);
        doc.roundedRect(144, 9, 52, 12, 1.5, 1.5, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(37, 99, 235);
        doc.text('OFFICIAL ACADEMIC DOSSIER', 170, 14.5, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`${dateStr} • ${timeStr}`, 170, 18.5, { align: 'center' });

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(marginX, 23, marginX + contentWidth, 23);

        currentY = 26;

        if (scope === 'student' && (studentInfo.name || studentInfo.registerNumber)) {
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(marginX, currentY, contentWidth, 23, 2, 2, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.roundedRect(marginX, currentY, contentWidth, 23, 2, 2, 'S');

          doc.setFillColor(37, 99, 235);
          doc.circle(marginX + 9, currentY + 11.5, 6, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(255, 255, 255);
          doc.text((studentInfo.name || 'S').charAt(0), marginX + 9, currentY + 14.5, { align: 'center' });

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(15, 23, 42);
          doc.text(studentInfo.name || 'Student Name', marginX + 19, currentY + 9);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(37, 99, 235);
          doc.text(`REG NO: ${studentInfo.registerNumber || 'N/A'}`, marginX + 19, currentY + 15);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(`Department: ${studentInfo.department || 'All'}  |  Semester: ${studentInfo.currentSemester || 'All'}  |  Evaluated Terms: ${studentInfo.totalSemesters || 1}`, marginX + 19, currentY + 19.5);

          const cgpaVal = studentInfo.cgpa !== undefined ? `${studentInfo.cgpa}` : 'N/A';
          const arrearsVal = studentInfo.totalArrears !== undefined ? `${studentInfo.totalArrears}` : '0';
          const isOptimal = (studentInfo.totalArrears === 0 || studentInfo.totalArrears === undefined);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(100, 116, 139);
          doc.text('CUMULATIVE CGPA', 130, currentY + 7.5);
          doc.setFontSize(11);
          doc.setTextColor(37, 99, 235);
          doc.text(`${cgpaVal} / 10.0`, 130, currentY + 15.5);

          doc.setFontSize(6.5);
          doc.setTextColor(100, 116, 139);
          doc.text('ARREARS', 160, currentY + 7.5);
          doc.setFontSize(11);
          doc.setTextColor(isOptimal ? 22 : 220, isOptimal ? 163 : 38, isOptimal ? 74 : 38);
          doc.text(arrearsVal, 160, currentY + 15.5);

          const standingText = studentInfo.standing ? studentInfo.standing.split(' ')[0] : (isOptimal ? 'Optimal' : 'Alert');
          doc.setFillColor(isOptimal ? 236 : 254, isOptimal ? 253 : 242, isOptimal ? 245 : 242);
          doc.roundedRect(173, currentY + 8, 20, 9, 1.5, 1.5, 'F');
          doc.setFontSize(6.5);
          doc.setTextColor(isOptimal ? 5 : 185, isOptimal ? 150 : 28, isOptimal ? 105 : 28);
          doc.text(standingText.toUpperCase(), 183, currentY + 13.5, { align: 'center' });

          currentY += 27;
        } else if (scope === 'department') {
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(marginX, currentY, contentWidth, 20, 2, 2, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.roundedRect(marginX, currentY, contentWidth, 20, 2, 2, 'S');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10.5);
          doc.setTextColor(15, 23, 42);
          doc.text(cohortInfo.departmentLabel || 'Cohort Academic Review', marginX + 6, currentY + 8);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(`Academic Semester: ${cohortInfo.semesterLabel || 'All'}  |  Total Enrolled: ${cohortInfo.totalStudents || 0}  |  Pass Rate: ${cohortInfo.passPercentage || 0}%`, marginX + 6, currentY + 15);

          currentY += 24;
        }
      } else {
        // Page 2+: Institutional Running Header
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, pageWidth, 3, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text('BANNARI AMMAN INSTITUTE OF TECHNOLOGY • ACADEMIC EVALUATION DOSSIER', marginX, 10);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        const entityLabel = scope === 'student' ? (studentInfo.name || studentInfo.registerNumber || '') : (cohortInfo.departmentLabel || '');
        doc.text(`${entityLabel}  •  Page ${pNum} of ${totalPages}`, marginX + contentWidth, 10, { align: 'right' });

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(marginX, 13, marginX + contentWidth, 13);

        currentY = 17;
      }

      // Render Components on this Page
      let compIdx = 0;
      while (compIdx < pageComponents.length) {
        const comp = pageComponents[compIdx];
        const nextComp = compIdx + 1 < pageComponents.length ? pageComponents[compIdx + 1] : null;

        const isHalf = comp.width === '50' || comp.width === '50%' || comp.width === 'half' || comp.width === '40%' || comp.width === '60%' || comp.width === '33%' || comp.width === '33.3%';
        const isNextHalf = nextComp && (nextComp.width === '50' || nextComp.width === '50%' || nextComp.width === 'half' || nextComp.width === '40%' || nextComp.width === '60%' || nextComp.width === '33%' || nextComp.width === '33.3%');

        if (isHalf && isNextHalf) {
          const rowH = 60;
          const colW = (contentWidth - 6) / 2;
          await renderComponent(comp, marginX, currentY, colW, rowH);
          await renderComponent(nextComp, marginX + colW + 6, currentY, colW, rowH);
          currentY += rowH + 5;
          compIdx += 2;
        } else if (isHalf) {
          const rowH = 60;
          const colW = (contentWidth - 6) / 2;
          await renderComponent(comp, marginX, currentY, colW, rowH);
          currentY += rowH + 5;
          compIdx += 1;
        } else {
          let compH = 60;
          if (comp.type === 'kpi_group') compH = 24;
          else if (comp.type === 'signature_block') compH = 26;
          else if (comp.type === 'table') {
            const rowCount = Math.min(10, (comp.data || []).length);
            compH = 12 + rowCount * 5.2;
          } else if (comp.id === 'cohort_vulnerable_courses_table' || comp.id === 'cohort_vulnerable_courses_card') {
            compH = 36;
          } else if (comp.type === 'ai_insight' || comp.type === 'narrative_card') {
            compH = 28;
          } else if (comp.type === 'highlight_card') {
            compH = 28;
          } else if (comp.type === 'chart') {
            compH = 62;
          }

          await renderComponent(comp, marginX, currentY, contentWidth, compH);
          currentY += compH + 5;
          compIdx += 1;
        }
      }

      // Institutional Footer on every page
      const footY = 288;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(marginX, footY - 3, marginX + contentWidth, footY - 3);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('CONFIDENTIAL & PROPRIETARY  •  BANNARI AMMAN INSTITUTE OF TECHNOLOGY', marginX, footY + 1);

      doc.setFont('helvetica', 'bold');
      doc.text(`Page ${pNum} of ${totalPages}`, marginX + contentWidth, footY + 1, { align: 'right' });
    }

    if (returnBlob) {
      return doc.output('blob');
    }

    const safeName = (scope === 'student' ? (studentInfo.registerNumber || 'Student') : (cohortInfo.department || 'Department'))
      .replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `AI_Report_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
    return filename;
  }

  return null;
};


export default {
  exportCustomReportPDF,

  exportStudentReportPDF,
  exportClassReportPDF,
  captureChart,
  captureSvgToDataUrl,
  captureElementToCanvas
};
