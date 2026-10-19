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
  FiFileText,
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

  const fillTemplate = (text) =>
    (text || '').replace(/\[POSITION\]/g, letter?.position || 'the position');

  /* ── PRINT ── */
  const handlePrint = () => window.print();

  /* ── Generate PDF Document (returns PDF object) ── */
  const generatePDFDocument = async () => {
    if (!letter) return null;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
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
      if (bodyElement) bodyElement.style.paddingBottom = '100px';

      const headerCanvas = headerElement ? await html2canvas(headerElement, {
        backgroundColor: null, scale: 2, useCORS: true, logging: false
      }) : null;

      const footerCanvas = footerElement ? await html2canvas(footerElement, {
        backgroundColor: null, scale: 2, useCORS: true, logging: false
      }) : null;

      if (headerElement) headerElement.style.padding = headerPadding;
      if (footerElement) footerElement.style.padding = footerPadding;
      if (bodyElement) bodyElement.style.paddingBottom = bodyPaddingBottom;

      const footerDisplay = footerElement?.style.display;
      if (footerElement) footerElement.style.display = 'none';

      const canvas = await html2canvas(documentElement, {
        backgroundColor: '#ffffff', scale: 2, useCORS: true, logging: false,
        windowWidth: documentElement.scrollWidth, windowHeight: documentElement.scrollHeight
      });
      
      if (footerElement) footerElement.style.display = footerDisplay;
      if (bodyElement) bodyElement.style.paddingBottom = bodyPaddingBottom;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const headerHeight = headerCanvas ? (headerCanvas.height / headerCanvas.width) * pageWidth : 0;
      const footerHeight = footerCanvas ? (footerCanvas.height / footerCanvas.width) * pageWidth : 0;
      
      const footerBuffer = 15;
      const availableContentHeight = pageHeight - footerHeight - footerBuffer;
      const pixelsPerMm = canvas.width / pageWidth;
      const firstPageHeight = Math.floor(availableContentHeight * pixelsPerMm);
      const followingPageHeight = Math.floor((availableContentHeight - headerHeight - 10) * pixelsPerMm);

      // Smart page break detection - find blank rows to break naturally
      const findSafePageBreak = (proposedBreak, pageStart, pageEnd) => {
        const context = canvas.getContext('2d', { willReadFrequently: true });
        const scanLeft = Math.floor(canvas.width * 0.1);
        const scanRight = Math.floor(canvas.width * 0.9);
        
        const isBlankRow = (row) => {
          if (row < 0 || row >= canvas.height) return false;
          const pixels = context.getImageData(scanLeft, row, scanRight - scanLeft, 1).data;
          let darkPixels = 0;
          for (let index = 0; index < pixels.length; index += 16) {
            if (pixels[index] < 235 || pixels[index + 1] < 235 || pixels[index + 2] < 235) {
              darkPixels += 1;
              if (darkPixels > 2) return false;
            }
          }
          return true;
        };

        const searchStart = Math.min(proposedBreak - 1, pageEnd - 1);
        const searchEnd = Math.max(pageStart + 4, searchStart - 200);
        for (let row = searchStart; row >= searchEnd; row -= 1) {
          if (isBlankRow(row - 2) && isBlankRow(row - 1) && isBlankRow(row) && isBlankRow(row + 1)) {
            return row - 1;
          }
        }
        return proposedBreak;
      };
      
      const pageBreaks = [0];
      while (pageBreaks[pageBreaks.length - 1] < canvas.height) {
        const pageIndex = pageBreaks.length - 1;
        const pageHeightInPixels = pageIndex === 0 ? firstPageHeight : followingPageHeight;
        const pageStart = pageBreaks[pageBreaks.length - 1];
        const proposedBreak = Math.min(canvas.height, pageStart + pageHeightInPixels);
        const nextBreak = proposedBreak < canvas.height
          ? findSafePageBreak(proposedBreak, pageStart, pageStart + pageHeightInPixels)
          : proposedBreak;

        if (nextBreak > pageBreaks[pageBreaks.length - 1]) pageBreaks.push(nextBreak);
        else break;
      }

      for (let pageIndex = 0; pageIndex < pageBreaks.length - 1; pageIndex++) {
        if (pageIndex > 0) pdf.addPage();
        const sourceY = pageBreaks[pageIndex];
        const sourceHeight = pageBreaks[pageIndex + 1] - sourceY;
        const topMargin = pageIndex > 0 ? headerHeight + 10 : 0;
        
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        pageCanvas.getContext('2d').drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, pageCanvas.width, pageCanvas.height);

        const imageHeight = (sourceHeight / canvas.width) * pageWidth;
        pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, topMargin, pageWidth,
          Math.min(availableContentHeight - (pageIndex > 0 ? 10 : 0), imageHeight));
      }

      if (footerCanvas) {
        const footerImage = footerCanvas.toDataURL('image/png');
        for (let i = 1; i <= pdf.internal.getNumberOfPages(); i++) {
          pdf.setPage(i);
          pdf.addImage(footerImage, 'PNG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
        }
      }

      if (headerCanvas) {
        const headerImage = headerCanvas.toDataURL('image/png');
        for (let i = 2; i <= pdf.internal.getNumberOfPages(); i++) {
          pdf.setPage(i);
          pdf.addImage(headerImage, 'PNG', 0, 0, pageWidth, headerHeight);
        }
      }

      return pdf;
    } catch (error) {
      console.error('Error generating PDF document:', error);
      throw error;
    }
  };

  /* ── PDF Preview ── */
  const previewPDF = async () => {
    setGenerating(true);
    
    try {
      const pdf = await generatePDFDocument();
      if (!pdf) throw new Error('Failed to generate PDF');
      
      // Open PDF in new window/tab for preview
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
      Swal.fire({
        icon: 'success',
        title: 'PDF Preview',
        text: 'Opening PDF in new window',
        timer: 2000,
        background: '#0d0d0d',
        color: '#fff',
        confirmButtonColor: '#b14cff',
        iconColor: '#28c840'
      });
    } catch (error) {
      console.error('Error previewing PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to preview PDF',
        background: '#0d0d0d',
        color: '#fff',
        confirmButtonColor: '#b14cff'
      });
    } finally {
      setGenerating(false);
    }
  };

  /* ── Download PDF ── */
  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      const pdf = await generatePDFDocument();
      if (!pdf) throw new Error('Failed to generate PDF');
      
      pdf.save(`JoiningLetter_${letter.letterNumber}.pdf`);
      
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
    } catch (error) {
      console.error('Error generating PDF:', error);
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
  if (loading) return null;

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
          <button className="jl-btn-icon-text" onClick={previewPDF} disabled={generating}>
            {generating ? <><span className="spinner-small" /> Generating...</> : <><FiFileText /> Preview PDF</>}
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
                ['Compensation Type', letter.compensationType || 'Fixed Salary'],
                ...(
                  (letter.compensationType === 'Fixed Salary' || !letter.compensationType)
                    ? [['Salary', `${fmtSalary(letter.salary, letter.currency)} / ${letter.salaryType || 'Monthly'}`]]
                    : letter.compensationType === 'Commission Only'
                    ? [
                        ['Commission Structure', `${(letter.commissionSlabs||[]).length} slab(s) — see table below`],
                        ['Commission Released',  letter.commissionTrigger || '—'],
                        ...(letter.commissionCap ? [['Monthly Cap', fmtSalary(letter.commissionCap, letter.currency)]] : []),
                      ]
                    : [
                        ['Base Salary',          `${fmtSalary(letter.salary, letter.currency)} / ${letter.salaryType || 'Monthly'}`],
                        ['Commission Structure', `${(letter.commissionSlabs||[]).length} slab(s) — see table below`],
                        ['Commission Released',  letter.commissionTrigger || '—'],
                        ...(letter.commissionCap ? [['Monthly Cap', fmtSalary(letter.commissionCap, letter.currency)]] : []),
                      ]
                ),
              ]
                .filter(Boolean)
                .map(([key, val], i) => (
                  <tr key={i}>
                    <td>{key}</td>
                    <td>{val || '—'}</td>
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
            <div style={{ background: '#fafbff', border: '1px solid #dde6ff', borderRadius: 8, padding: '16px 18px', marginBottom: 24, marginTop: "20px" }}>
              <div style={{ fontWeight: 700, color: '#1a2f6b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                Terms &amp; Conditions
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#444', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {letter.termsAndConditions}
              </p>
            </div>
          )}

          {/* Confidential stamp */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <span className="jl-confidential">Confidential</span>
          </div>

          {/* Signatures - 3 Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '40px' }}>
            
            {/* Left - Authorized Signatory */}
            <div style={{ textAlign: 'center' }}>
              {/* Signature Image Space */}
              <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <Image
                  src="/img/aqdas-signature-bg.png"
                  alt="Muhammad Aqdas signature"
                  width={200}
                  height={60}
                  draggable={false}
                  onDragStart={(event) => event.preventDefault()}
                  onDrop={(event) => event.preventDefault()}
                  onContextMenu={(event) => event.preventDefault()}
                  style={{ objectFit: 'contain', userSelect: 'none' }}
                />
              </div>
              <div style={{ borderTop: '1px solid #333', paddingTop: '8px', marginTop: '0' }} />
              <strong style={{ fontSize: '13px', color: '#333' }}>Authorized Signatory</strong><br/>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0d1b3e' }}>Muhammad Aqdas</span><br/>
              <span style={{ fontSize: '11px', color: '#666' }}>CEO</span>
            </div>

            {/* Center - Company Stamp */}
            <div style={{ textAlign: 'center' }}>
              {/* Company Stamp */}
              <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <div style={{ 
                  display: 'inline-block',
                  padding: '10px 22px', 
                  border: '3px solid #b14cff', 
                  borderRadius: '8px',
                  color: '#b14cff',
                  fontWeight: 700,
                  fontSize: '15px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  transform: 'rotate(-8deg)',
                  boxShadow: '0 2px 8px rgba(177,76,255,0.2)'
                }}>
                  CodeVerza
                </div>
              </div>
              <div style={{ borderTop: '1px solid #333', paddingTop: '8px', marginTop: '0' }} />
              <strong style={{ fontSize: '13px', color: '#333' }}>Company Stamp</strong><br/>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0d1b3e' }}>CodeVerza</span><br/>
              <span style={{ fontSize: '11px', color: '#666' }}>Digital Solutions</span>
            </div>

            {/* Right - Employee Acceptance */}
            <div style={{ textAlign: 'center' }}>
              {/* Empty space for employee signature */}
              <div style={{ height: '60px', marginBottom: '8px' }}></div>
              <div style={{ borderTop: '1px solid #333', paddingTop: '8px', marginTop: '0' }} />
              <strong style={{ fontSize: '13px', color: '#333' }}>Employee Acceptance</strong><br/>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0d1b3e' }}>{letter.employeeName}</span><br/>
              <span style={{ fontSize: '11px', color: '#666' }}>{letter.position}</span>
            </div>

          </div>

        </div>

        {/* ── Footer ── */}
        <div className="jl-doc-footer">
          <div className="jl-doc-footer-left">
            <h3>CodeVerza – Building Digital Excellence</h3>
            <p>Delivering excellence in Digital Services since 2020</p>
          </div>
          <div className="jl-doc-footer-right">
            <p>www.codeverza.com</p>
            <p>info@codeverza.com</p>
            <p>+92 325 1507557</p>
          </div>
        </div>

      </div>
    </div>
  );
}
