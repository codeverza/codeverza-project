'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { FiArrowLeft, FiDownload, FiEdit } from 'react-icons/fi';
import '../../../../admin/quotations/quotations.css';

// Print styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @media print {
      @page {
        size: A4 portrait;
        margin: 0;
      }
      
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        width: 100%;
        height: 100%;
      }
      
      .no-print,
      .preview-actions {
        display: none !important;
      }
      
      .quotation-preview-page {
        padding: 0 !important;
        margin: 0 !important;
        background: white !important;
        width: 100%;
      }
      
      .quotation-wrapper {
        background: white !important;
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
      }
      
      .quotation-document {
        box-shadow: none !important;
        max-width: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border-radius: 0 !important;
      }
      
      /* Ensure all colors print correctly */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default function EmployeeQuotationPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params?.id;

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!quotationId) return;
    loadQuotationData();
  }, [quotationId]);

  const loadQuotationData = async () => {
    try {
      console.log('Fetching quotation with ID:', quotationId);
      const res = await fetch(`/api/employee-quotations?id=${quotationId}`);
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (data.success && data.data) {
        let quotationData = data.data;
        
        // If employeeEmail is missing, fetch from employee document
        if (!quotationData.employeeEmail && quotationData.employeeId) {
          console.log('Employee email missing, fetching from employee document...');
          try {
            const empRes = await fetch(`/api/employees?id=${quotationData.employeeId}`);
            const empData = await empRes.json();
            if (empData.success && empData.employee) {
              quotationData.employeeEmail = empData.employee.companyEmail || empData.employee.email || '';
              quotationData.employeePhone = quotationData.employeePhone || empData.employee.contactNumber || '';
              console.log('Fetched employee email:', quotationData.employeeEmail);
            }
          } catch (empErr) {
            console.error('Failed to fetch employee data:', empErr);
          }
        }
        
        setQuotation(quotationData);
      } else {
        setError(data.message || 'Failed to fetch quotation');
      }
    } catch (err) {
      console.error('Error loading quotation:', err);
      setError('Error loading quotation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFDocument = async () => {
    if (!quotation) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      const documentElement = document.querySelector('.quotation-document');
      if (!documentElement) throw new Error('Document not found');

      const footerElement = documentElement.querySelector('.quotation-footer');
      const headerElement = documentElement.querySelector('.quotation-header');
      const bodyElement = documentElement.querySelector('.document-body');
      
      const headerPadding = headerElement?.style.padding;
      const footerPadding = footerElement?.style.padding;
      const bodyPaddingBottom = bodyElement?.style.paddingBottom;
      
      if (headerElement) headerElement.style.padding = '12px 40px';
      if (footerElement) footerElement.style.padding = '10px 40px';
      if (bodyElement) bodyElement.style.paddingBottom = '120px';

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
        windowWidth: documentElement.scrollWidth, windowHeight: documentElement.scrollHeight,
        onclone: (clonedDocument) => {
          const stamp = clonedDocument.querySelector('.codeverza-stamp');
          if (stamp) {
            stamp.style.transform = 'rotate(-5deg)';
            stamp.style.position = 'relative';
            stamp.style.zIndex = '2';
            stamp.style.backgroundColor = '#ffffff';
          }
        }
      });
      
      if (footerElement) footerElement.style.display = footerDisplay;
      if (bodyElement) bodyElement.style.paddingBottom = bodyPaddingBottom;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const headerHeight = headerCanvas ? (headerCanvas.height / headerCanvas.width) * pageWidth : 0;
      const footerHeight = footerCanvas ? (footerCanvas.height / footerCanvas.width) * pageWidth : 0;
      
      const footerBuffer = 20;
      const availableContentHeight = pageHeight - footerHeight - footerBuffer;
      const pixelsPerMm = canvas.width / pageWidth;
      const firstPageHeight = Math.floor(availableContentHeight * pixelsPerMm);
      const followingPageHeight = Math.floor(
        (availableContentHeight - headerHeight - 10) * pixelsPerMm
      );

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
        const searchEnd = Math.max(pageStart + 4, searchStart - 180);
        for (let row = searchStart; row >= searchEnd; row -= 1) {
          if (
            isBlankRow(row - 2) &&
            isBlankRow(row - 1) &&
            isBlankRow(row) &&
            isBlankRow(row + 1)
          ) {
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
        pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, topMargin, pageWidth,
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
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const handlePrint = async () => {
    try {
      const pdf = await generatePDFDocument();
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error printing:', error);
      alert('Failed to generate PDF');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p>Loading quotation...</p>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error || 'Quotation not found'}</p>
        <button onClick={() => router.push('/employee/dashboard')} style={{ marginTop: '20px', padding: '10px 20px' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const canEdit = quotation.approvalStatus === 'Pending' || quotation.approvalStatus === 'Rejected';

  return (
    <div className="quotation-preview-page" style={{ minHeight: '100vh', background: '#0a0a0a', padding: '20px 0' }}>
      {/* Top Action Bar - No Print */}
      <div className="no-print preview-actions" style={{
        background: 'rgba(20, 20, 20, 0.95)',
        borderBottom: '1px solid rgba(177, 76, 255, 0.2)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)'
      }}>
        <button
          onClick={() => router.push('/employee/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(177, 76, 255, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: '#fff',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(177, 76, 255, 0.15)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            background: quotation.approvalStatus === 'Approved' ? 'rgba(34, 197, 94, 0.2)' : quotation.approvalStatus === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(251, 191, 36, 0.2)',
            color: quotation.approvalStatus === 'Approved' ? '#22c55e' : quotation.approvalStatus === 'Rejected' ? '#ef4444' : '#fbbf24',
            border: `1px solid ${quotation.approvalStatus === 'Approved' ? '#22c55e' : quotation.approvalStatus === 'Rejected' ? '#ef4444' : '#fbbf24'}`
          }}>
            {quotation.approvalStatus}
          </span>
          {canEdit && (
            <button
              onClick={() => router.push(`/employee/quotations/edit/${quotationId}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
            >
              <FiEdit /> Edit
            </button>
          )}
          
          {/* Print button - Only show for Approved quotations */}
          {quotation.approvalStatus === 'Approved' && (
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: '#b14cff',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#9333ea'}
              onMouseOut={(e) => e.currentTarget.style.background = '#b14cff'}
            >
              <FiDownload /> Print PDF
            </button>
          )}
          
          {/* Message for non-approved quotations */}
          {quotation.approvalStatus !== 'Approved' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '8px',
              color: '#fbbf24',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {quotation.approvalStatus === 'Pending' && 'Print available after admin approval'}
              {quotation.approvalStatus === 'Rejected' && 'Quotation rejected - cannot print'}
            </div>
          )}
        </div>
      </div>

      {/* Preview Content - Modal Style (screen only) */}
      <div className="quotation-wrapper" style={{
        maxWidth: '900px',
        margin: '30px auto',
        background: 'rgba(20, 20, 20, 0.6)',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 8px 32px rgba(177, 76, 255, 0.15)',
        border: '1px solid rgba(177, 76, 255, 0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Rejection Reason Notice */}
        {quotation.approvalStatus === 'Rejected' && quotation.rejectionReason && (
          <div className="no-print" style={{
            marginBottom: '20px',
            padding: '16px 20px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#ef4444'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>❌</span>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Rejection Reason
                </strong>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '14px' }}>
                  {quotation.rejectionReason}
                </p>
                <p style={{ margin: '12px 0 0 0', fontSize: '13px', opacity: 0.8 }}>
                  💡 Aap is quotation ko edit kar ke dobara approval ke liye bhej sakte hain.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <QuotationPreviewContent quotation={quotation} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PREVIEW CONTENT - Same as Admin's Template
═══════════════════════════════════════════════════════════════ */
function QuotationPreviewContent({ quotation: qt }) {
  const fmtDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const fmtCur = (n, c = 'PKR') => {
    if (n === 0) return 'FREE';
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: c, minimumFractionDigits: 2 }).format(n);
  };
  
  const getCurrencyTotals = () => {
    // Always recalculate - ignore cached totalsByCurrency
    const totals = (qt.services || []).reduce((t, s) => {
      const c = s.currency || qt.currency || 'PKR';
      const discount = s.discount || 0;
      const subtotal = s.quantity * s.price;
      const discountAmount = subtotal * discount / 100;
      const total = subtotal - discountAmount;
      console.log(`Service: ${s.name}, Subtotal: ${subtotal}, Discount: ${discount}%, Total: ${total}`);
      t[c] = (t[c] || 0) + total;
      return t;
    }, {});
    console.log('Final Currency Totals:', totals);
    return totals;
  };

  // Debug: Check employee email
  console.log('Quotation data:', qt);
  console.log('Employee Name:', qt.employeeName);
  console.log('Employee Email:', qt.employeeEmail);

  return (
    <div className="quotation-document">
      {/* Header — employee branding */}
      <div className="quotation-header">
        <div className="company-info">
          <div className="company-logo">
            <Image src="/img/codeverza-logo.png" alt="Codeverza" width={60} height={60} style={{ objectFit: 'contain' }} />
          </div>
          <div className="company-details">
            <h1 className="company-name">CODEVERZA</h1>
            <p className="company-tagline">Professional Web Development Solutions</p>
          </div>
        </div>
        <div className="company-contact">
          <p>www.codeverza.com</p>
          <p>info@codeverza.com</p>
          <p>+923251507557</p>
        </div>
      </div>

      {/* Title band */}
      <div className="document-title-band">
        <h2>QUOTATION</h2>
        <div className="doc-number-label">Ref No: <span>{qt.quotationNumber}</span></div>
      </div>

      <div className="document-body">
        {/* Details */}
        <div className="details-section">
          <div className="details-box">
            <div className="details-box-header"><h3>Quotation Details</h3></div>
            <div className="details-box-body">
              {qt.issueDate && <p><strong>Issue Date</strong>{fmtDate(qt.issueDate)}</p>}
              {qt.validityDate && <p><strong>Valid Until</strong>{fmtDate(qt.validityDate)}</p>}
              {qt.employeeName && <p><strong>Contact Person</strong>{qt.employeeName}</p>}
              {qt.employeeEmail && <p><strong>Email</strong>{qt.employeeEmail}</p>}
            </div>
          </div>
          <div className="details-box">
            <div className="details-box-header"><h3>Client Information</h3></div>
            <div className="details-box-body">
              <p><strong>Name</strong>{qt.clientName}</p>
              {qt.clientCompany && <p><strong>Company</strong>{qt.clientCompany}</p>}
              <p><strong>Email</strong>{qt.clientEmail}</p>
              {qt.clientPhone && <p><strong>Phone</strong>{qt.clientPhone}</p>}
              {qt.clientAddress && <p><strong>Address</strong>{qt.clientAddress}</p>}
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="services-section">
          <p className="section-label">Services &amp; Deliverables</p>
          <table className="services-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Service</th>
                <th style={{ width: '30%' }}>Description</th>
                <th style={{ width: '7%', textAlign: 'center' }}>Qty</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Unit Price</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Disc%</th>
                <th style={{ width: '9%' }}>Billing</th>
                <th style={{ width: '14%', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(qt.services || []).map((svc, i) => {
                const discount = svc.discount || 0;
                const subtotal = svc.quantity * svc.price;
                const discountAmount = subtotal * discount / 100;
                const total = subtotal - discountAmount;
                
                return (
                <tr key={i}>
                  <td><strong>{svc.name}</strong></td>
                  <td>{svc.description ? <span className="service-desc">{svc.description}</span> : '—'}</td>
                  <td className="text-center">{svc.quantity}</td>
                  <td className="text-right">{fmtCur(svc.price, svc.currency || qt.currency)}</td>
                  <td className="text-center">
                    {discount > 0 ? (
                      <span style={{ 
                        color: '#10b981', 
                        fontWeight: '600',
                        fontSize: '12px'
                      }}>
                        {discount}%
                      </span>
                    ) : (
                      <span style={{ color: '#999', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td style={{ textTransform: 'capitalize', fontSize: '11.5px', color: '#666' }}>{svc.billingCycle}</td>
                  <td className="text-right">
                    {discount > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                        <span style={{ 
                          fontSize: '10px', 
                          color: '#999', 
                          textDecoration: 'line-through' 
                        }}>
                          {fmtCur(subtotal, svc.currency || qt.currency)}
                        </span>
                        <span style={{ color: '#10b981', fontWeight: '600' }}>
                          {fmtCur(total, svc.currency || qt.currency)}
                        </span>
                      </div>
                    ) : (
                      fmtCur(total, svc.currency || qt.currency)
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="totals-wrapper">
          <div className="pricing-summary-section">
            {Object.entries(getCurrencyTotals()).map(([currency, subtotal]) => {
              const disc = (subtotal * (qt.discount || 0)) / 100;
              const tax  = ((subtotal - disc) * (qt.tax || 0)) / 100;
              return (
                <div key={currency} className="currency-summary-group">
                  <div className="sum-row"><span>{currency} Subtotal</span><span>{fmtCur(subtotal, currency)}</span></div>
                  {qt.discount > 0 && <div className="sum-row discount"><span>Discount ({qt.discount}%)</span><span>− {fmtCur(disc, currency)}</span></div>}
                  {qt.tax > 0 && <div className="sum-row"><span>Tax ({qt.tax}%)</span><span>{fmtCur(tax, currency)}</span></div>}
                  <div className="sum-row grand-total"><span>{currency} Grand Total</span><span>{fmtCur(subtotal - disc + tax, currency)}</span></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment & Timeline */}
        {(qt.paymentTerms || qt.projectTimeline) && (
          <div className="info-grid">
            {qt.paymentTerms && <div className="info-section"><div className="info-section-header"><h3>Payment Terms</h3></div><div className="info-section-body"><p>{qt.paymentTerms}</p></div></div>}
            {qt.projectTimeline && <div className="info-section"><div className="info-section-header"><h3>Project Timeline</h3></div><div className="info-section-body"><p>{qt.projectTimeline}</p></div></div>}
          </div>
        )}
        {qt.notes && <div className="info-section"><div className="info-section-header"><h3>Notes</h3></div><div className="info-section-body"><p>{qt.notes}</p></div></div>}
        {qt.termsAndConditions && <div className="info-section"><div className="info-section-header"><h3>Terms &amp; Conditions</h3></div><div className="info-section-body"><p className="terms-text">{qt.termsAndConditions}</p></div></div>}

        {/* Signature — empty or filled depending on approval */}
        <div className="signature-section with-company-stamp employee-signature">
          <div className="signature-box">
            <div className="signature-image-area" style={{ minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {qt.approvalStatus === 'Approved'
                ? <Image src="/img/aqdas-signature-bg.png" alt="Signature" width={190} height={56} style={{ objectFit: 'contain' }} draggable={false} />
                : <div style={{ width: '190px', height: '56px', borderBottom: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#aaa' }}>Pending approval</span>
                  </div>
              }
            </div>
            <div className="signature-line"></div>
            <strong>Authorized Signature</strong>
            {qt.approvalStatus === 'Approved'
              ? <><p>{qt.authorizedSignatureName || 'Muhammad Aqdas'}</p><p>{qt.authorizedSignatureTitle || 'CEO'}</p></>
              : <p style={{ color: '#aaa', fontSize: '11px' }}>Pending admin approval</p>
            }
          </div>
          <div className="signature-box company-stamp-box">
            <div className="company-stamp-area">
              {qt.approvalStatus === 'Approved'
                ? <div className="codeverza-stamp"><span>CODEVERZA</span></div>
                : <div style={{ width: '100px', height: '60px', border: '1px dashed #ccc', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#aaa' }}>Stamp pending</span>
                  </div>
              }
            </div>
            <div className="signature-line"></div>
            <strong>Company Stamp</strong>
            <p>Codeverza</p>
            <p>Digital Solutions</p>
          </div>
        </div>
      </div>

      {/* Footer — employee branding */}
      <div className="quotation-footer">
        <div className="footer-left">
          <h3>Thank you for choosing Codeverza!</h3>
          <p>Delivering excellence in web development since 2020</p>
        </div>
        <div className="footer-right">
          <p>www.codeverza.com</p>
          <p>info@codeverza.com</p>
          <p>+923251507557</p>
        </div>
      </div>
    </div>
  );
}
