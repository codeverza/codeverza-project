'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { FiArrowLeft, FiDownload, FiPrinter } from 'react-icons/fi';
import '../../quotations.css';
import './share.css';

export default function QuotationSharePage() {
  const params = useParams();
  const router = useRouter();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (params.id) fetchQuotation();
  }, [params.id]);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quotations?id=${params.id}`);
      const result = await response.json();
      if (result.success) {
        setQuotation(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error fetching quotation:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Quotation load nahi hua' });
      router.push('/admin/quotations');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'PKR') => {
    if (amount === 0) return 'FREE';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Shorter format for PDF columns — no decimals, avoids line breaks
  const formatCurrencyPDF = (amount, currency = 'PKR') => {
    if (amount === 0) return 'FREE';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => window.print();

  const generatePDF = async () => {
    if (!quotation) return;
    setGenerating(true);
    try {
      // Use standalone autoTable import — most reliable pattern across all bundlers
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let y = 20;

      // --- Logo ---
      let logoLoaded = false;
      const logoImg = typeof window !== 'undefined' ? new window.Image() : null;
      if (logoImg) {
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = '/img/codeverza-logo.png';
        await Promise.race([
          new Promise((res) => {
            logoImg.onload = () => { logoLoaded = true; res(); };
            logoImg.onerror = res;
          }),
          new Promise((res) => setTimeout(res, 2000)),
        ]);
      }

      // --- Header band ---
      pdf.setFillColor(13, 27, 62);
      pdf.rect(0, 0, pageWidth, 45, 'F');

      if (logoLoaded && logoImg) {
        try { pdf.addImage(logoImg, 'PNG', 12, 10, 20, 20); }
        catch { logoLoaded = false; }
      }
      if (!logoLoaded) {
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(12, 12, 12, 12, 2, 2, 'F');
        pdf.setTextColor(13, 27, 62);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('C', 18, 21, { align: 'center' });
      }

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CODEVERZA', 35, 18);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Professional Web Development Solutions', 35, 25);
      const companyContact = [
        quotation.companyWebsite || 'www.codeverza.com',
        quotation.companyEmail || 'info@codeverza.com',
        quotation.companyPhone || '+92 325 1507557',
      ];
      companyContact.forEach((line, i) => {
        pdf.text(line, pageWidth - 15, 15 + i * 5, { align: 'right' });
      });

      y = 55;

      // --- Title + ref ---
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('QUOTATION', 15, y);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Ref No: ${quotation.quotationNumber}`, pageWidth - 15, y, { align: 'right' });
      y += 10;

      pdf.setDrawColor(200, 210, 240);
      pdf.setLineWidth(0.4);
      pdf.line(15, y, pageWidth - 15, y);
      y += 8;

      // --- Services Table (standalone autoTable call) ---
      const tableData = quotation.services.map((s) => [
        s.name,
        s.description || '—',
        String(s.quantity),
        formatCurrencyPDF(s.price, quotation.currency),
        s.billingCycle || '—',
        formatCurrencyPDF(s.quantity * s.price, quotation.currency),
      ]);

      autoTable(pdf, {
        startY: y,
        head: [['Service', 'Description', 'Qty', 'Unit Price', 'Billing', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [13, 27, 62],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'left',
          valign: 'middle',
        },
        styles: {
          fontSize: 8.5,
          cellPadding: 4,
          overflow: 'linebreak',
          valign: 'middle',
          lineColor: [220, 228, 245],
          lineWidth: 0.1,
        },
        alternateRowStyles: { fillColor: [248, 250, 255] },
        columnStyles: {
          0: { cellWidth: 35, fontStyle: 'bold', valign: 'middle' },
          1: { cellWidth: 50, valign: 'middle' },
          2: { cellWidth: 14, halign: 'center', valign: 'middle', overflow: 'hidden' },
          3: { cellWidth: 32, halign: 'right', valign: 'middle', overflow: 'hidden' },
          4: { cellWidth: 20, halign: 'left', valign: 'middle', overflow: 'hidden' },
          5: { cellWidth: 29, halign: 'right', fontStyle: 'bold', valign: 'middle', overflow: 'hidden' },
        },
      });

      y = pdf.lastAutoTable.finalY + 12;

      // --- Totals block ---
      if (y > pageHeight - 70) { pdf.addPage(); y = 20; }

      const sx = pageWidth - 72;
      pdf.setFontSize(10);
      pdf.setTextColor(40, 40, 40);

      pdf.setFont('helvetica', 'normal');
      pdf.text('Subtotal:', sx, y);
      pdf.text(formatCurrencyPDF(quotation.subtotal, quotation.currency), pageWidth - 15, y, { align: 'right' });
      y += 7;

      if (quotation.discount > 0) {
        pdf.setTextColor(180, 30, 30);
        pdf.text(`Discount (${quotation.discount}%):`, sx, y);
        pdf.text(`- ${formatCurrencyPDF(quotation.discountAmount, quotation.currency)}`, pageWidth - 15, y, { align: 'right' });
        pdf.setTextColor(40, 40, 40);
        y += 7;
      }

      if (quotation.tax > 0) {
        pdf.text(`Tax (${quotation.tax}%):`, sx, y);
        pdf.text(formatCurrencyPDF(quotation.taxAmount, quotation.currency), pageWidth - 15, y, { align: 'right' });
        y += 7;
      }

      pdf.setDrawColor(13, 27, 62);
      pdf.setLineWidth(0.5);
      pdf.line(sx, y, pageWidth - 15, y);
      y += 6;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(13, 27, 62);
      pdf.text('Grand Total:', sx, y);
      pdf.text(formatCurrencyPDF(quotation.grandTotal, quotation.currency), pageWidth - 15, y, { align: 'right' });
      y += 16;

      // --- Extra info sections ---
      const colW = (pageWidth / 2) - 22;
      const rx = pageWidth / 2 + 8;

      if (quotation.paymentTerms || quotation.projectTimeline) {
        if (y > pageHeight - 80) { pdf.addPage(); y = 20; }
        let ly = y, ry2 = y;

        if (quotation.paymentTerms) {
          pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9.5); pdf.setTextColor(13, 27, 62);
          pdf.text('PAYMENT TERMS', 15, ly); ly += 5;
          pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); pdf.setTextColor(40, 40, 40);
          const lines = pdf.splitTextToSize(quotation.paymentTerms, colW);
          pdf.text(lines, 15, ly); ly += lines.length * 4.5 + 8;
        }
        if (quotation.projectTimeline) {
          pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9.5); pdf.setTextColor(13, 27, 62);
          pdf.text('PROJECT TIMELINE', rx, ry2); ry2 += 5;
          pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); pdf.setTextColor(40, 40, 40);
          const lines = pdf.splitTextToSize(quotation.projectTimeline, colW);
          pdf.text(lines, rx, ry2); ry2 += lines.length * 4.5 + 8;
        }
        y = Math.max(ly, ry2);
      }

      if (quotation.notes) {
        if (y > pageHeight - 60) { pdf.addPage(); y = 20; }
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9.5); pdf.setTextColor(13, 27, 62);
        pdf.text('NOTES', 15, y); y += 5;
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); pdf.setTextColor(40, 40, 40);
        const lines = pdf.splitTextToSize(quotation.notes, pageWidth - 30);
        pdf.text(lines, 15, y); y += lines.length * 4.5 + 8;
      }

      if (quotation.termsAndConditions) {
        if (y > pageHeight - 60) { pdf.addPage(); y = 20; }
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9.5); pdf.setTextColor(13, 27, 62);
        pdf.text('TERMS & CONDITIONS', 15, y); y += 5;
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(60, 60, 60);
        const lines = pdf.splitTextToSize(quotation.termsAndConditions, pageWidth - 30);
        pdf.text(lines, 15, y);
      }

      // --- Footer on every page ---
      const totalPages = pdf.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        const fy = pageHeight - 20;
        pdf.setFillColor(13, 27, 62);
        pdf.rect(0, fy - 6, pageWidth, 26, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9.5); pdf.setFont('helvetica', 'bold');
        pdf.text('Thank you for choosing Codeverza!', pageWidth / 2, fy, { align: 'center' });
        pdf.setFontSize(7.5); pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(210, 220, 240);
        const footerContact = `${quotation.companyWebsite || 'www.codeverza.com'} | ${quotation.companyEmail || 'info@codeverza.com'} | ${quotation.companyPhone || '+92 325 1507557'}`;
        pdf.text(footerContact, pageWidth / 2, fy + 5, { align: 'center' });
        pdf.setFontSize(7); pdf.setTextColor(160, 175, 210);
        pdf.text(`Page ${p} of ${totalPages}`, pageWidth - 15, fy + 5, { align: 'right' });
      }

      pdf.save(`Quotation_${quotation.quotationNumber}_Share.pdf`);
      Swal.fire({ icon: 'success', title: 'PDF Ready', text: 'Download ho gaya!', timer: 2000 });
    } catch (err) {
      console.error('PDF Error:', err);
      Swal.fire({ icon: 'error', title: 'Error', text: `PDF generate nahi hua: ${err.message}` });
    } finally {
      setGenerating(false);
    }
  };

  /* ─── LOADING ─── */
  if (loading) {
    return null; // Global loader will handle this
  }

  if (!quotation) {
    return (
      <div className="quotation-preview-page">
        <div className="error-container">
          <p>Quotation nahi mila</p>
          <button onClick={() => router.push('/admin/quotations')}>Back</button>
        </div>
      </div>
    );
  }

  const formatCurrencyDisplay = (amount) => formatCurrency(amount, quotation.currency);

  /* ─── RENDER ─── */
  return (
    <div className="quotation-preview-page">

      {/* ── ACTION BAR ── */}
      <div className="preview-actions no-print">
        <button className="btn-back" onClick={() => router.back()}>
          <FiArrowLeft /> Back
        </button>
        <div className="action-buttons">
          <button className="btn-icon-text" onClick={handlePrint}>
            <FiPrinter /> Print
          </button>
          <button className="btn-primary" onClick={generatePDF} disabled={generating}>
            {generating ? (
              <><span className="spinner-small"></span> Generating...</>
            ) : (
              <><FiDownload /> Download PDF</>
            )}
          </button>
        </div>
      </div>

      {/* ── QUOTATION DOCUMENT ── */}
      <div className="quotation-document share-document">

        {/* HEADER */}
        <div className="quotation-header">
          <div className="company-info">
            <div className="company-logo">
              <Image
                src="/img/codeverza-logo.png"
                alt="Codeverza"
                width={100}
                height={100}
                style={{ width: '110px', height: '110px', objectFit: 'contain' }}
                priority
              />
            </div>
            <div className="company-details">
              <h1 className="company-name">CODEVERZA</h1>
              <p className="company-tagline">Professional Web Development Solutions</p>
            </div>
          </div>
          <div className="company-contact">
            <p>{quotation.companyWebsite || 'www.codeverza.com'}</p>
            <p>{quotation.companyEmail || 'info@codeverza.com'}</p>
            <p>{quotation.companyPhone || '+92 325 1507557'}</p>
          </div>
        </div>

        {/* TITLE BAND */}
        <div className="document-title-band">
          <h2>QUOTATION</h2>
          <div className="doc-number-label">
            Ref No: <span>{quotation.quotationNumber}</span>
          </div>
        </div>

        {/* BODY */}
        <div className="document-body">

          {/* SERVICES TABLE */}
          <div className="services-section">
            <p className="section-label">Services &amp; Deliverables</p>
            <table className="services-table">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Service</th>
                  <th style={{ width: '36%' }}>Description</th>
                  <th style={{ width: '7%', textAlign: 'center' }}>Qty</th>
                  <th style={{ width: '13%', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ width: '10%' }}>Billing</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.services.map((service, index) => (
                  <tr key={index}>
                    <td><strong>{service.name}</strong></td>
                    <td>
                      {service.description
                        ? <span className="service-desc">{service.description}</span>
                        : '—'}
                    </td>
                    <td className="text-center">{service.quantity}</td>
                    <td className="text-right">{formatCurrencyDisplay(service.price)}</td>
                    <td style={{ textTransform: 'capitalize', fontSize: '11.5px', color: '#666' }}>
                      {service.billingCycle}
                    </td>
                    <td className="text-right">
                      {formatCurrencyDisplay(service.quantity * service.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTALS */}
          <div className="totals-wrapper">
            <div className="pricing-summary-section">
              <div className="sum-row">
                <span>Subtotal</span>
                <span>{formatCurrencyDisplay(quotation.subtotal)}</span>
              </div>
              {quotation.discount > 0 && (
                <div className="sum-row discount">
                  <span>Discount ({quotation.discount}%)</span>
                  <span>− {formatCurrencyDisplay(quotation.discountAmount)}</span>
                </div>
              )}
              {quotation.tax > 0 && (
                <div className="sum-row">
                  <span>Tax ({quotation.tax}%)</span>
                  <span>{formatCurrencyDisplay(quotation.taxAmount)}</span>
                </div>
              )}
              <div className="sum-row grand-total">
                <span>Grand Total</span>
                <span>{formatCurrencyDisplay(quotation.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* PAYMENT + TIMELINE */}
          {(quotation.paymentTerms || quotation.projectTimeline) && (
            <div className="info-grid">
              {quotation.paymentTerms && (
                <div className="info-section">
                  <div className="info-section-header"><h3>Payment Terms</h3></div>
                  <div className="info-section-body"><p>{quotation.paymentTerms}</p></div>
                </div>
              )}
              {quotation.projectTimeline && (
                <div className="info-section">
                  <div className="info-section-header"><h3>Project Timeline</h3></div>
                  <div className="info-section-body"><p>{quotation.projectTimeline}</p></div>
                </div>
              )}
            </div>
          )}

          {/* NOTES */}
          {quotation.notes && (
            <div className="info-section">
              <div className="info-section-header"><h3>Notes</h3></div>
              <div className="info-section-body"><p>{quotation.notes}</p></div>
            </div>
          )}

          {/* TERMS & CONDITIONS */}
          {quotation.termsAndConditions && (
            <div className="info-section">
              <div className="info-section-header"><h3>Terms &amp; Conditions</h3></div>
              <div className="info-section-body">
                <p className="terms-text">{quotation.termsAndConditions}</p>
              </div>
            </div>
          )}

        </div>{/* end document-body */}

        {/* FOOTER */}
        <div className="quotation-footer">
          <div className="footer-left">
            <h3>Thank you for choosing Codeverza!</h3>
            <p>Delivering excellence in web development since 2020</p>
          </div>
          <div className="footer-right">
            <p>{quotation.companyWebsite || 'www.codeverza.com'}</p>
            <p>{quotation.companyEmail || 'info@codeverza.com'}</p>
            <p>{quotation.companyPhone || '+92 325 1507557'}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
