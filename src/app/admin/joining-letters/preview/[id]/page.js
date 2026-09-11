'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';
import {
  FiArrowLeft,
  FiDownload,
  FiPrinter,
  FiMail,
  FiMessageCircle,
  FiEdit,
  FiCopy,
} from 'react-icons/fi';
import '../../joining-letters.css';

export default function JoiningLetterPreviewPage() {
  const { id }  = useParams();
  const router  = useRouter();

  const [letter, setLetter]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { if (id) fetchLetter(); }, [id]);

  const fetchLetter = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/joining-letters?id=${id}`);
      const data = await res.json();
      if (data.success) setLetter(data.data);
      else throw new Error(data.message);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load letter', background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
      router.push('/admin/joining-letters');
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const fmtSalary = (amount, currency = 'PKR') =>
    new Intl.NumberFormat('en-PK', { style: 'currency', currency }).format(amount || 0);

  // Build a human-readable compensation summary for display
  const compensationSummary = (l) => {
    if (!l) return '—';
    const type = l.compensationType || 'Fixed Salary';
    if (type === 'Fixed Salary')
      return `${fmtSalary(l.salary, l.currency)} / ${l.salaryType || 'Monthly'}`;
    if (type === 'Commission Only')
      return `Commission-based (${(l.commissionSlabs || []).length} slab${(l.commissionSlabs||[]).length !== 1 ? 's' : ''})`;
    if (type === 'Salary + Commission')
      return `Base: ${fmtSalary(l.salary, l.currency)} / ${l.salaryType || 'Monthly'} + Commission slabs`;
    return '—';
  };

  // Replace [POSITION] placeholder in text
  const fillTemplate = (text) =>
    (text || '').replace(/\[POSITION\]/g, letter?.position || 'the position');

  /* ── PRINT ── */
  const handlePrint = () => window.print();

  /* ── PDF ── */
  const generatePDF = async () => {
    if (!letter) return;
    setGenerating(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const documentElement = document.querySelector('.jl-document');
      if (!documentElement) throw new Error('Joining letter document is not available');

      const footerElement = documentElement.querySelector('.jl-doc-footer');
      const headerElement = documentElement.querySelector('.jl-doc-header');
      const bodyElement = documentElement.querySelector('.jl-doc-body');
      
      const headerPadding = headerElement?.style.padding;
      const footerPadding = footerElement?.style.padding;
      const bodyPaddingBottom = bodyElement?.style.paddingBottom;
      
      if (headerElement) headerElement.style.padding = '12px 40px';
      if (footerElement) footerElement.style.padding = '10px 40px';
      if (bodyElement) bodyElement.style.paddingBottom = '120px'; // Extra large padding for PDF
      const headerCanvas = headerElement
        ? await html2canvas(headerElement, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            logging: false,
          })
        : null;
      const footerCanvas = footerElement
        ? await html2canvas(footerElement, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            logging: false,
          })
        : null;
      if (headerElement) headerElement.style.padding = headerPadding;
      if (footerElement) footerElement.style.padding = footerPadding;
      if (bodyElement) bodyElement.style.paddingBottom = bodyPaddingBottom;
      const footerDisplay = footerElement?.style.display;
      if (footerElement) footerElement.style.display = 'none';

      const canvas = await html2canvas(documentElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: documentElement.scrollWidth,
        windowHeight: documentElement.scrollHeight,
      });
      
      if (footerElement) footerElement.style.display = footerDisplay;
      if (bodyElement) bodyElement.style.paddingBottom = bodyPaddingBottom; // Restore padding

      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const headerHeight = headerCanvas ? (headerCanvas.height / headerCanvas.width) * pageWidth : 0;
      const footerHeight = footerCanvas ? (footerCanvas.height / footerCanvas.width) * pageWidth : 0;
      
      // Available content height per page (excluding header and footer with extra buffer)
      const footerBuffer = 20; // Very large buffer to ensure footer doesn't overlap content
      const availableContentHeight = pageHeight - footerHeight - footerBuffer;
      const renderedPageHeight = Math.floor((availableContentHeight / pageWidth) * canvas.width);
      
      const documentRect = documentElement.getBoundingClientRect();
      const scaleRatio = canvas.width / documentElement.scrollWidth;
      const detailsElement = documentElement.querySelector('.jl-details-table');
      const detailsBottom = detailsElement
        ? Math.round((detailsElement.getBoundingClientRect().bottom - documentRect.top) * scaleRatio)
        : 0;
      const pageBreaks = detailsBottom > 0 && detailsBottom < canvas.height
        ? [0, detailsBottom]
        : [0];
      while (pageBreaks[pageBreaks.length - 1] < canvas.height) {
        pageBreaks.push(Math.min(canvas.height, pageBreaks[pageBreaks.length - 1] + renderedPageHeight));
      }
      for (let pageIndex = 0; pageIndex < pageBreaks.length - 1; pageIndex += 1) {
        if (pageIndex > 0) pdf.addPage();

        const sourceY = pageBreaks[pageIndex];
        const sourceHeight = Math.min(pageBreaks[pageIndex + 1] - sourceY, renderedPageHeight);
        const topMargin = pageIndex > 0 ? headerHeight + 10 : 0;
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        pageCanvas.getContext('2d').drawImage(
          canvas,
          0, sourceY, canvas.width, sourceHeight,
          0, 0, pageCanvas.width, pageCanvas.height,
        );

        const imageHeight = (sourceHeight / canvas.width) * pageWidth;
        pdf.addImage(
          pageCanvas.toDataURL('image/jpeg', 0.98),
          'JPEG',
          0,
          topMargin,
          pageWidth,
          Math.min(availableContentHeight - (pageIndex > 0 ? 10 : 0), imageHeight),
        );
      }

      if (footerCanvas) {
        const footerImage = footerCanvas.toDataURL('image/png');
        for (let pageIndex = 1; pageIndex <= pdf.internal.getNumberOfPages(); pageIndex += 1) {
          pdf.setPage(pageIndex);
          pdf.addImage(footerImage, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
        }
      }

      if (headerCanvas) {
        const headerImage = headerCanvas.toDataURL('image/png');
        for (let pageIndex = 2; pageIndex <= pdf.internal.getNumberOfPages(); pageIndex += 1) {
          pdf.setPage(pageIndex);
          pdf.addImage(headerImage, 'PNG', 0, 0, pageWidth, headerHeight);
        }
      }

      pdf.save(`JoiningLetter_${letter.letterNumber}.pdf`);
      Swal.fire({
        icon: 'success',
        title: 'PDF Downloaded ✅',
        text: 'Joining letter saved successfully.',
        timer: 2000,
        background: '#0d0d0d',
        color: '#fff',
        confirmButtonColor: '#b14cff',
        iconColor: '#28c840',
      });
      return;

      {
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      const pdf       = new jsPDF('p', 'mm', 'a4');
      const PW        = pdf.internal.pageSize.getWidth();
      const PH        = pdf.internal.pageSize.getHeight();
      const MARGIN    = 14;
      const FOOTER_HEIGHT = 26;
      const MAX_Y     = PH - FOOTER_HEIGHT - 10; // Reserve space for footer + buffer
      let   y         = 20;
      let   currentPage = 1;

      // Helper to check and add new page
      const checkPageBreak = (requiredSpace) => {
        if (y + requiredSpace > MAX_Y) {
          addFooter();
          pdf.addPage();
          currentPage++;
          addHeader();
          y = 52;
          return true;
        }
        return false;
      };

      // Helper to add footer on each page
      const addFooter = () => {
        const fY = PH - 20;
        pdf.setFillColor(13, 27, 62);
        pdf.rect(0, fY - 6, PW, 26, 'F');
        pdf.setTextColor(255, 255, 255); 
        pdf.setFontSize(9); 
        pdf.setFont('helvetica', 'bold');
        pdf.text('CodeVerza – Building Digital Excellence', PW / 2, fY, { align: 'center' });
        pdf.setFontSize(7.5); 
        pdf.setFont('helvetica', 'normal'); 
        pdf.setTextColor(200, 200, 200);
        pdf.text('www.codeverza.com | info@codeverza.com | +92 325 1507557', PW / 2, fY + 5, { align: 'center' });
      };

      // Helper to add header on each page
      const addHeader = () => {
        pdf.setFillColor(13, 27, 62);
        pdf.rect(0, 0, PW, 42, 'F');

        if (logoLoaded) {
          try { pdf.addImage(logoImg, 'PNG', 12, 10, 20, 20); } catch { }
        } else {
          pdf.setFillColor(255, 255, 255);
          pdf.roundedRect(12, 12, 12, 12, 2, 2, 'F');
          pdf.setTextColor(13, 27, 62);
          pdf.setFontSize(14); pdf.setFont('helvetica', 'bold');
          pdf.text('C', 18, 21, { align: 'center' });
        }

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20); pdf.setFont('helvetica', 'bold');
        pdf.text('CODEVERZA', 36, 18);
        pdf.setFontSize(8); pdf.setFont('helvetica', 'normal');
        pdf.text('Professional Web Development Solutions', 36, 24);

        // contact right
        pdf.setFontSize(8);
        ['www.codeverza.com', 'info@codeverza.com', '+92 325 1507557'].forEach((t, i) => {
          pdf.text(t, PW - 14, 14 + i * 5, { align: 'right' });
        });
      };

      /* ── logo ── */
      let logoLoaded = false;
      const logoImg  = new window.Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = '/img/codeverza-logo.png';
      await Promise.race([
        new Promise(res => { logoImg.onload = () => { logoLoaded = true; res(); }; logoImg.onerror = res; }),
        new Promise(res => setTimeout(res, 2000)),
      ]);

      /* ── Header Band ── */
      addHeader();

      y = 52;

      /* ── Title Band ── */
      pdf.setFillColor(240, 244, 255);
      pdf.rect(0, y - 2, PW, 14, 'F');
      pdf.setTextColor(13, 27, 62);
      pdf.setFontSize(16); pdf.setFont('helvetica', 'bold');
      pdf.text('JOINING LETTER', 14, y + 6);
      pdf.setFontSize(9); pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Ref: ${letter.letterNumber}`, PW - 14, y + 6, { align: 'right' });

      y += 20;

      /* ── Date line ── */
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(10); pdf.setFont('helvetica', 'normal');
      pdf.text(`Date: ${fmtDate(letter.joiningDate)}`, PW - 14, y, { align: 'right' });

      y += 10;

      /* ── Subject ── */
      checkPageBreak(15);
      pdf.setTextColor(13, 27, 62);
      pdf.setFontSize(11); pdf.setFont('helvetica', 'bold');
      pdf.text(`SUBJECT: APPOINTMENT LETTER – ${(letter.position || '').toUpperCase()}`, 14, y);
      pdf.setLineWidth(0.4); pdf.setDrawColor(200, 210, 240);
      pdf.line(14, y + 2, PW - 14, y + 2);

      y += 12;

      /* ── Salutation ── */
      checkPageBreak(10);
      pdf.setTextColor(40, 40, 40);
      pdf.setFontSize(10); pdf.setFont('helvetica', 'bold');
      pdf.text(`Dear ${letter.employeeName},`, 14, y);

      y += 10;

      /* ── Opening Para ── */
      pdf.setFont('helvetica', 'normal');
      const openLines = pdf.splitTextToSize(fillTemplate(letter.openingParagraph), PW - 28);
      checkPageBreak(openLines.length * 5 + 8);
      pdf.text(openLines, 14, y);
      y += openLines.length * 5 + 8;

      /* ── Details Table ── */
      const tableRows = [
        ['Full Name',         letter.employeeName  || '-'],
        ...(letter.fatherName ? [['Father\'s Name', letter.fatherName]] : []),
        ...(letter.cnicNumber ? [['CNIC Number', letter.cnicNumber]] : []),
        ['Email Address',     letter.employeeEmail  || '-'],
        ...(letter.employeePhone ? [['Phone Number', letter.employeePhone]] : []),
        ['Designation',       letter.position       || '-'],
        ['Department',        letter.department     || '-'],
        ['Employment Type',   letter.employmentType || '-'],
        ['Work Location',     letter.workLocation   || '-'],
        ...(letter.reportingTo ? [['Reporting To', letter.reportingTo]] : []),
        ['Date of Joining',   fmtDate(letter.joiningDate)],
        ...(letter.probationPeriod ? [['Probation Period', letter.probationPeriod]] : []),
        ['Compensation Type', letter.compensationType || 'Fixed Salary'],
      ];

      // Add compensation-specific rows
      if (letter.compensationType === 'Fixed Salary' || !letter.compensationType) {
        tableRows.push(['Salary', `${fmtSalary(letter.salary, letter.currency)} / ${letter.salaryType || 'Monthly'}`]);
      } else if (letter.compensationType === 'Commission Only') {
        tableRows.push(
          ['Commission Structure', `${(letter.commissionSlabs||[]).length} slab(s) — see table below`],
          ['Commission Released', letter.commissionTrigger || '—']
        );
        if (letter.commissionCap) {
          tableRows.push(['Monthly Cap', fmtSalary(letter.commissionCap, letter.currency)]);
        }
      } else { // Salary + Commission
        tableRows.push(
          ['Base Salary', `${fmtSalary(letter.salary, letter.currency)} / ${letter.salaryType || 'Monthly'}`],
          ['Commission Structure', `${(letter.commissionSlabs||[]).length} slab(s) — see table below`],
          ['Commission Released', letter.commissionTrigger || '—']
        );
        if (letter.commissionCap) {
          tableRows.push(['Monthly Cap', fmtSalary(letter.commissionCap, letter.currency)]);
        }
      }

      checkPageBreak(50);
      const tableStartPage = currentPage;
      if (typeof pdf.autoTable === 'function') {
        pdf.autoTable({
          startY: y,
          body: tableRows,
          theme: 'striped',
          styles: { fontSize: 9, cellPadding: 4, lineColor: [221, 230, 255], lineWidth: 0.1 },
          headStyles: { fillColor: [13, 27, 62], textColor: 255, fontStyle: 'bold' },
          columnStyles: {
            0: { fontStyle: 'bold', textColor: [13, 27, 62], cellWidth: 60 },
            1: { textColor: [30, 30, 30] },
          },
          alternateRowStyles: { fillColor: [250, 251, 255] },
          margin: { left: MARGIN, right: MARGIN, top: 52, bottom: MAX_Y },
          didDrawPage: (data) => {
            // Add header and footer on new pages created by table overflow
            const tableCurrentPage = data.pageNumber;
            const actualPdfPage = tableStartPage + tableCurrentPage - 1;
            
            if (tableCurrentPage > 1) {
              currentPage = actualPdfPage;
              addHeader();
              addFooter();
            }
          }
        });
        y = pdf.lastAutoTable.finalY + 10;
        currentPage = pdf.internal.getCurrentPageInfo().pageNumber;
      } else {
        // Fallback manual table
        tableRows.forEach(([k, v]) => {
          checkPageBreak(8);
          pdf.setFont('helvetica', 'bold'); pdf.setTextColor(13, 27, 62);
          pdf.text(k + ':', 14, y);
          pdf.setFont('helvetica', 'normal'); pdf.setTextColor(40, 40, 40);
          pdf.text(v, 75, y);
          y += 6;
        });
        y += 4;
      }

      /* ── Commission Slabs Table ── */
      if ((letter.compensationType === 'Commission Only' || letter.compensationType === 'Salary + Commission') &&
          letter.commissionSlabs && letter.commissionSlabs.length > 0) {
        addFooter();
        pdf.addPage();
        currentPage++;
        addHeader();
        y = 52;
        
        // Title
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(13, 27, 62);
        pdf.text('Commission Slab Structure', MARGIN, y);
        
        if (letter.commissionTrigger) {
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(26, 47, 107);
          pdf.text(`(Released on: ${letter.commissionTrigger})`, MARGIN + 55, y);
        }
        
        y += 3;
        
        // Underline for title
        pdf.setDrawColor(200, 210, 240);
        pdf.setLineWidth(0.4);
        pdf.line(MARGIN, y, PW - MARGIN, y);
        
        y += 8;

        // Commission slabs table
        const commissionTableData = letter.commissionSlabs.map((slab, i) => {
          const from = Number(slab.from || 0).toLocaleString('en-PK');
          const to   = slab.to ? Number(slab.to).toLocaleString('en-PK') : 'No Limit';
          const rate = slab.rateType === '%'
            ? `${slab.rate}%`
            : `${letter.currency || 'PKR'} ${Number(slab.rate || 0).toLocaleString('en-PK')}`;
          const rateType = slab.rateType === '%' ? 'Percentage' : 'Flat Amount';
          
          return [
            `${i + 1}`,
            `${letter.currency || 'PKR'} ${from}`,
            slab.to ? `${letter.currency || 'PKR'} ${to}` : 'No Limit',
            rate,
            rateType
          ];
        });

        if (typeof pdf.autoTable === 'function') {
          pdf.autoTable({
            startY: y,
            head: [['#', 'From', 'To', 'Rate', 'Type']],
            body: commissionTableData,
            theme: 'striped',
            styles: { 
              fontSize: 8, 
              cellPadding: 3,
              lineColor: [221, 230, 255],
              lineWidth: 0.1,
              overflow: 'linebreak',
              cellWidth: 'wrap'
            },
            headStyles: { 
              fillColor: [13, 27, 62], 
              textColor: 255, 
              fontStyle: 'bold',
              halign: 'center'
            },
            columnStyles: {
              0: { fontStyle: 'bold', textColor: [26, 47, 107], cellWidth: 12, halign: 'center' },
              1: { textColor: [51, 51, 51], cellWidth: 40 },
              2: { textColor: [51, 51, 51], cellWidth: 40 },
              3: { textColor: [13, 27, 62], fontStyle: 'bold', cellWidth: 30, halign: 'center' },
              4: { textColor: [100, 100, 100], cellWidth: 28, fontSize: 7, halign: 'center' },
            },
            alternateRowStyles: { fillColor: [250, 251, 255] },
            margin: { left: MARGIN, right: MARGIN },
            didDrawPage: (data) => {
              y = data.cursor.y;
            }
          });
          y = pdf.lastAutoTable.finalY + 8;
        }

        // Commission cap note
        if (letter.commissionCap) {
          checkPageBreak(10);
          pdf.setFontSize(8.5);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(26, 47, 107);
          pdf.text('Monthly Cap: ', MARGIN, y);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(85, 85, 85);
          const capText = `${fmtSalary(letter.commissionCap, letter.currency)} - Maximum commission payable per month`;
          pdf.text(capText, MARGIN + 25, y);
          y += 10;
        }
      }

      /* ── Benefits ── */
      if (letter.benefits) {
        checkPageBreak(30);
        pdf.setFont('helvetica', 'bold'); 
        pdf.setTextColor(13, 27, 62);
        pdf.setFontSize(10);
        pdf.text('Benefits & Perks:', MARGIN, y); 
        y += 7;
        pdf.setFont('helvetica', 'normal'); 
        pdf.setTextColor(50, 50, 50);
        pdf.setFontSize(9);
        const bLines = pdf.splitTextToSize(letter.benefits, PW - 28);
        
        bLines.forEach(line => {
          checkPageBreak(5);
          pdf.text(line, MARGIN, y);
          y += 4.5;
        });
        
        y += 8;
      }

      /* ── Commission Notes ── */
      if ((letter.compensationType === 'Commission Only' || letter.compensationType === 'Salary + Commission') && 
          letter.commissionNotes) {
        checkPageBreak(30);
        pdf.setFont('helvetica', 'bold'); 
        pdf.setFontSize(10); 
        pdf.setTextColor(13, 27, 62);
        pdf.text('Commission Terms & Conditions:', MARGIN, y); 
        y += 7;
        pdf.setFont('helvetica', 'normal'); 
        pdf.setFontSize(8.5); 
        pdf.setTextColor(51, 51, 51);
        const cnLines = pdf.splitTextToSize(letter.commissionNotes, PW - 28);
        
        cnLines.forEach(line => {
          checkPageBreak(5);
          pdf.text(line, MARGIN, y);
          y += 4.5;
        });
        
        y += 8;
      }

      /* ── Closing Para ── */
      checkPageBreak(30);
      pdf.setFont('helvetica', 'normal'); 
      pdf.setFontSize(10); 
      pdf.setTextColor(40, 40, 40);
      const closeLines = pdf.splitTextToSize(fillTemplate(letter.closingParagraph), PW - 28);
      
      closeLines.forEach(line => {
        checkPageBreak(6);
        pdf.text(line, MARGIN, y);
        y += 5;
      });
      
      y += 8;

      /* ── T&C ── */
      if (letter.termsAndConditions) {
        checkPageBreak(30);
        pdf.setFont('helvetica', 'bold'); 
        pdf.setFontSize(10); 
        pdf.setTextColor(13, 27, 62);
        pdf.text('Terms & Conditions:', MARGIN, y); 
        y += 7;
        pdf.setFont('helvetica', 'normal'); 
        pdf.setFontSize(8.5); 
        pdf.setTextColor(60, 60, 60);
        const tcLines = pdf.splitTextToSize(letter.termsAndConditions, PW - 28);
        
        tcLines.forEach(line => {
          checkPageBreak(5);
          pdf.text(line, MARGIN, y);
          y += 4.2;
        });
        
        y += 10;
      }

      /* ── Signatures ── */
      checkPageBreak(50);
      y += 6;
      
      // Add CodeVerza stamp (text style) ABOVE the signature line
      pdf.setDrawColor(177, 76, 255); // Purple border
      pdf.setLineWidth(0.6);
      pdf.setTextColor(177, 76, 255); // Purple text
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      
      // Draw stamp box
      const stampText = 'CODEVERZA';
      const stampWidth = pdf.getTextWidth(stampText) + 12;
      const stampX = MARGIN + (61 - stampWidth) / 2; // Center in left column
      const stampY = y;
      
      // Stamp rectangle
      pdf.saveGraphicsState();
      pdf.setLineDash([]);
      pdf.rect(stampX, stampY, stampWidth, 10);
      pdf.restoreGraphicsState();
      
      // Stamp text
      pdf.text(stampText, stampX + 6, stampY + 7);
      
      // Move Y down after stamp
      y += 15;
      
      // Signature lines
      pdf.setDrawColor(100, 100, 100); 
      pdf.setLineWidth(0.3);
      pdf.line(MARGIN, y + 18, 75, y + 18);
      pdf.line(PW - 75, y + 18, PW - MARGIN, y + 18);
      
      // Labels
      pdf.setTextColor(40, 40, 40);
      pdf.setFont('helvetica', 'bold'); 
      pdf.setFontSize(9); 
      pdf.text('Authorized Signatory', MARGIN, y + 24);
      pdf.text('Employee Acceptance', PW - 75, y + 24);
      
      // Names
      pdf.setFont('helvetica', 'normal'); 
      pdf.setFontSize(8); 
      pdf.setTextColor(100, 100, 100);
      pdf.text('CodeVerza', MARGIN, y + 29);
      pdf.text(letter.employeeName || '', PW - 75, y + 29);

      /* ── Add footers to all pages ── */
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addFooter();
        // Page numbers
        pdf.setFontSize(7.5); 
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${totalPages}`, PW - MARGIN, PH - 8, { align: 'right' });
      }

      pdf.save(`JoiningLetter_${letter.letterNumber}.pdf`);
      }

      Swal.fire({ 
        icon: 'success', 
        title: 'PDF Downloaded ✅', 
        text: 'Joining letter saved successfully.', 
        timer: 2000, 
        background: '#0d0d0d', 
        color: '#fff', 
        confirmButtonColor: '#b14cff', 
        iconColor: '#28c840' 
      });
    } catch (err) {
      console.error('PDF error:', err);
      Swal.fire({ 
        icon: 'error', 
        title: 'PDF Error', 
        text: 'Could not generate PDF.', 
        background: '#0d0d0d', 
        color: '#fff', 
        confirmButtonColor: '#b14cff' 
      });
    } finally {
      setGenerating(false);
    }
  };

  /* ── WhatsApp Share ── */
  const handleWhatsApp = () => {
    if (!letter) return;
    const msg = encodeURIComponent(
      `Dear ${letter.employeeName},%0A%0A` +
      `We are pleased to inform you that you have been selected for the position of *${letter.position}* at CodeVerza.%0A%0A` +
      `📅 Joining Date: ${fmtDate(letter.joiningDate)}%0A` +
      `🏢 Department: ${letter.department}%0A` +
      `💰 Salary: ${fmtSalary(letter.salary, letter.currency)} / ${letter.salaryType}%0A%0A` +
      `Please confirm your acceptance at your earliest convenience.%0A%0ARegards,%0ACodeVerza Team`
    );
    const phone = (letter.employeePhone || '').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  /* ── Email Share ── */
  const handleEmail = () => {
    if (!letter) return;
    const subject = encodeURIComponent(`Joining Letter – ${letter.position} | CodeVerza`);
    const body = encodeURIComponent(
      `Dear ${letter.employeeName},\n\n` +
      `${fillTemplate(letter.openingParagraph)}\n\n` +
      `Position   : ${letter.position}\n` +
      `Department : ${letter.department}\n` +
      `Joining Date: ${fmtDate(letter.joiningDate)}\n` +
      `Salary     : ${fmtSalary(letter.salary, letter.currency)} / ${letter.salaryType}\n\n` +
      `${fillTemplate(letter.closingParagraph)}\n\n` +
      `Warm regards,\nCodeVerza Team`
    );
    window.location.href = `mailto:${letter.employeeEmail}?subject=${subject}&body=${body}`;
  };

  /* ── Copy Link ── */
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    Swal.fire({ icon: 'success', title: 'Link Copied!', timer: 1800, background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
  };

  /* ── Loading ── */
  if (loading) return null; // Global loader will handle this

  if (!letter) return (
    <div className="jl-preview-page">
      <div className="jl-empty">
        <p>Letter not found.</p>
        <button className="jl-btn-primary" onClick={() => router.push('/admin/joining-letters')}>Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="jl-preview-page">

      {/* ── Action Bar ── */}
      <div className="jl-preview-actions no-print">
        <button className="jl-btn-back" onClick={() => router.push('/admin/joining-letters')}>
          <FiArrowLeft /> Back
        </button>
        <div className="jl-actions">
          <button className="jl-btn-icon-text" onClick={() => router.push(`/admin/joining-letters/edit/${letter.id}`)}>
            <FiEdit /> Edit
          </button>
          <button className="jl-btn-icon-text" onClick={handleCopyLink}>
            <FiCopy /> Copy Link
          </button>
          <button className="jl-btn-icon-text" onClick={handleWhatsApp}>
            <FiMessageCircle /> WhatsApp
          </button>
          <button className="jl-btn-icon-text" onClick={handleEmail}>
            <FiMail /> Email
          </button>
          <button className="jl-btn-icon-text" onClick={handlePrint}>
            <FiPrinter /> Print
          </button>
          <button className="jl-btn-primary" onClick={generatePDF} disabled={generating}>
            {generating
              ? <><span className="spinner-small" /> Generating...</>
              : <><FiDownload /> Download PDF</>}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          JOINING LETTER DOCUMENT
      ══════════════════════════════════════ */}
      <div className="jl-document">

        {/* ── Header ── */}
        <div className="jl-doc-header">
          <div className="jl-doc-company">
            <div className="jl-doc-logo">
              <Image
                src="/img/codeverza-logo.png"
                alt="CodeVerza"
                width={64}
                height={64}
                style={{ objectFit: 'contain', width: '64px', height: '64px' }}
                priority
              />
            </div>
            <div>
              <h1 className="jl-doc-company-name">CODEVERZA</h1>
              <p className="jl-doc-company-tag">Professional Web Development Solutions</p>
            </div>
          </div>
          <div className="jl-doc-contact">
            <p>www.codeverza.com</p>
            <p>info@codeverza.com</p>
            <p>+92 325 1507557</p>
          </div>
        </div>

        {/* ── Title Band ── */}
        <div className="jl-doc-title-band">
          <h2>JOINING LETTER</h2>
          <div className="jl-doc-ref">Ref No: <span>{letter.letterNumber}</span></div>
        </div>

        {/* ── Body ── */}
        <div className="jl-doc-body">

          {/* Date */}
          <div className="jl-doc-date">
            Date: <strong>{fmtDate(letter.joiningDate)}</strong>
          </div>

          {/* Subject */}
          <div className="jl-doc-subject">
            Subject: Appointment Letter – {letter.position}
          </div>

          {/* Salutation */}
          <div className="jl-doc-salutation">Dear {letter.employeeName},</div>

          {/* Opening */}
          <p className="jl-doc-para">{fillTemplate(letter.openingParagraph)}</p>

          {/* Details Table */}
          <table className="jl-details-table">
            <thead>
              <tr>
                <th colSpan={2}>Employment Details</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Full Name',       letter.employeeName],
                letter.fatherName  ? ["Father's Name",  letter.fatherName]  : null,
                letter.cnicNumber  ? ['CNIC Number',    letter.cnicNumber]  : null,
                ['Email Address',   letter.employeeEmail],
                letter.employeePhone ? ['Phone Number', letter.employeePhone] : null,
                ['Designation',     letter.position],
                ['Department',      letter.department],
                ['Employment Type', letter.employmentType],
                ['Work Location',   letter.workLocation],
                letter.reportingTo ? ['Reporting To',   letter.reportingTo] : null,
                ['Date of Joining', fmtDate(letter.joiningDate)],
                letter.probationPeriod ? ['Probation Period', letter.probationPeriod] : null,
                // ── Compensation rows ──
                ['Compensation Type', letter.compensationType || 'Fixed Salary'],
                ...(
                  (letter.compensationType === 'Fixed Salary' || !letter.compensationType)
                    ? [['Salary', `${fmtSalary(letter.salary, letter.currency)} / ${letter.salaryType || 'Monthly'}`]]
                    : letter.compensationType === 'Commission Only'
                    ? [
                        ['Commission Structure', `${(letter.commissionSlabs||[]).length} slab(s) — see table below`, true],
                        ['Commission Released',  letter.commissionTrigger || '—'],
                        ...(letter.commissionCap ? [['Monthly Cap', fmtSalary(letter.commissionCap, letter.currency)]] : []),
                      ]
                    : [ // Salary + Commission
                        ['Base Salary',          `${fmtSalary(letter.salary, letter.currency)} / ${letter.salaryType || 'Monthly'}`],
                        ['Commission Structure', `${(letter.commissionSlabs||[]).length} slab(s) — see table below`, true],
                        ['Commission Released',  letter.commissionTrigger || '—'],
                        ...(letter.commissionCap ? [['Monthly Cap', fmtSalary(letter.commissionCap, letter.currency)]] : []),
                      ]
                ),
              ]
                .filter(Boolean)
                .map(([key, val, needMargin], i) => (
                  <tr key={i} style={needMargin ? { marginTop: '30px' } : {}}>
                    <td style={needMargin ? { paddingTop: '180px' } : {}}>{key}</td>
                    <td style={needMargin ? { paddingTop: '180px' } : {}}>{val || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Commission Slabs Table */}
          {(letter.compensationType === 'Commission Only' || letter.compensationType === 'Salary + Commission') &&
            letter.commissionSlabs && letter.commissionSlabs.length > 0 && (
            <div className="jl-commission-section" style={{ margin: '0 0 22px' }}>
              <div style={{ fontWeight: 700, color: '#0d1b3e', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                📊 Commission Slab Structure
                {letter.commissionTrigger && (
                  <span style={{ background: '#e8f0ff', color: '#1a2f6b', padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: 0 }}>
                    Released on: {letter.commissionTrigger}
                  </span>
                )}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #dde6ff', borderRadius: 8, overflow: 'hidden', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg,#0d1b3e,#1a2f6b)' }}>
                    <th style={{ padding: '9px 14px', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Slab #</th>
                    <th style={{ padding: '9px 14px', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Project Value From</th>
                    <th style={{ padding: '9px 14px', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Project Value To</th>
                    <th style={{ padding: '9px 14px', textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {letter.commissionSlabs.map((slab, i) => {
                    const from = Number(slab.from || 0).toLocaleString('en-PK');
                    const to   = slab.to ? Number(slab.to).toLocaleString('en-PK') : '— (No Limit)';
                    const rate = slab.rateType === '%'
                      ? `${slab.rate}% of Project Value`
                      : `${letter.currency || 'PKR'} ${Number(slab.rate || 0).toLocaleString('en-PK')} (Flat)`;
                    return (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafbff' }}>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid #eef1f8', color: '#1a2f6b', fontWeight: 700 }}>Slab {i + 1}</td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid #eef1f8', color: '#333' }}>
                          {letter.currency || 'PKR'} {from}
                        </td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid #eef1f8', color: '#333' }}>
                          {slab.to ? `${letter.currency || 'PKR'} ${to}` : '∞ No Upper Limit'}
                        </td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid #eef1f8', textAlign: 'center' }}>
                          <span style={{ background: 'rgba(13,27,62,0.08)', border: '1px solid #dde6ff', padding: '3px 12px', borderRadius: 20, fontWeight: 700, color: '#0d1b3e', fontSize: 12 }}>
                            {rate}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {letter.commissionCap && (
                <div style={{ marginTop: 8, fontSize: 11.5, color: '#555', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 700, color: '#1a2f6b' }}>Monthly Cap:</span>
                  {fmtSalary(letter.commissionCap, letter.currency)} — Maximum commission payable per month
                </div>
              )}
            </div>
          )}

          {/* Benefits */}
          {letter.benefits && (
            <div style={{ margin: '0 0 20px' }}>
              <div style={{ fontWeight: 700, color: '#0d1b3e', fontSize: 13, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Benefits &amp; Perks
              </div>
              <p className="jl-doc-para" style={{ whiteSpace: 'pre-line' }}>{letter.benefits}</p>
            </div>
          )}

          {/* Commission Terms */}
          {(letter.compensationType === 'Commission Only' || letter.compensationType === 'Salary + Commission') && letter.commissionNotes && (
            <div style={{ background: 'rgba(177,76,255,0.04)', border: '1px solid rgba(177,76,255,0.2)', borderRadius: 8, padding: '14px 18px', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: '#0d1b3e', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                📈 Commission Terms &amp; Conditions
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: '#333', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {letter.commissionNotes}
              </p>
            </div>
          )}

          {/* Closing */}
          <p className="jl-doc-para">{fillTemplate(letter.closingParagraph)}</p>

          {/* Terms & Conditions */}
          {letter.termsAndConditions && (
            <div style={{ background: '#fafbff', border: '1px solid #dde6ff', borderRadius: 8, padding: '0px 18px', marginBottom: 24, marginTop: "80px" }}>
              <div style={{ fontWeight: 700, color: '#1a2f6b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, marginTop: 50 }}>
                Terms &amp; Conditions
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#444', lineHeight: 1.8, whiteSpace: 'pre-line', marginBottom: "20px" }}>
                {letter.termsAndConditions}
              </p>
            </div>
          )}

          {/* Confidential stamp */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <span className="jl-confidential">Confidential</span>
          </div>

          {/* Signatures */}
          <div className="jl-doc-signature">
            <div className="jl-sig-box">
              {/* CodeVerza Stamp (text style like CONFIDENTIAL) - ABOVE the line */}
              <div style={{ height: '50px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '8px' }}>
                <span style={{ 
                  display: 'inline-block',
                  padding: '8px 20px', 
                  border: '2px solid #b14cff', 
                  borderRadius: '6px',
                  color: '#b14cff',
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  transform: 'rotate(-5deg)'
                }}>
                  CodeVerza
                </span>
              </div>
              <div className="jl-sig-line" />
              <strong>Authorized Signatory</strong>
              <span className='font-bold'>Muhammad Aqdas</span> <br/>
              <span className='font-bold'>CEO</span>
            </div>
            <div className="jl-sig-box">
              {/* Empty space to match height */}
              <div style={{ height: '50px', marginBottom: '8px' }}></div>
              <div className="jl-sig-line" />
              <strong>Employee Acceptance</strong>
              <span className='font-bold'>{letter.employeeName}</span> <br/>
              <span className='font-bold'>{letter.position}</span>
            </div>
          </div>

        </div>{/* end body */}

        {/* ── Footer ── */}
        <div className="jl-doc-footer">
          <div className="jl-doc-footer-left">
            <h3>CodeVerza – Building Digital Excellence</h3>
            <p>Delivering excellence in web development since 2020</p>
          </div>
          <div className="jl-doc-footer-right">
            <p>www.codeverza.com</p>
            <p>info@codeverza.com</p>
            <p>+92 325 1507557</p>
          </div>
        </div>

      </div>{/* end document */}
    </div>
  );
}
