'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { 
  FiArrowLeft, 
  FiDownload, 
  FiPrinter, 
  FiMail, 
  FiMessageCircle,
  FiEdit,
  FiCopy
} from 'react-icons/fi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../../quotations.css';

export default function QuotationPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const printRef = useRef();
  
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchQuotation();
    }
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch quotation'
      });
      router.push('/admin/quotations');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'PKR') => {
    if (amount === 0) return 'FREE';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const generatePDF = async () => {
    if (!quotation) return;
    
    setGenerating(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header - Company Info
      pdf.setFillColor(26, 26, 46); // Dark blue color
      pdf.rect(0, 0, pageWidth, 45, 'F');
      
      // Company Logo Box
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(12, 12, 12, 12, 2, 2, 'F');
      pdf.setTextColor(15, 52, 96);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('C', 18, 21, { align: 'center' });
      
      // Company Name and Tagline
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CODEVERZA', 28, 18);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Professional Web Development Solutions', 28, 25);
      
      // Contact info (right side)
      pdf.setFontSize(8);
      const contactInfo = [
        'www.codeverza.com',
        'info@codeverza.com',
        '+92 300 1234567'
      ];
      contactInfo.forEach((line, i) => {
        pdf.text(line, pageWidth - 15, 15 + (i * 5), { align: 'right' });
      });

      yPosition = 55;

      // Quotation Title
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('QUOTATION', 15, yPosition);
      
      yPosition += 10;

      // Quotation Details and Client Details (Two columns)
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      
      // Left Column - Quotation Details
      pdf.text('Quotation Details:', 15, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Number: ${quotation.quotationNumber}`, 15, yPosition + 6);
      pdf.text(`Issue Date: ${formatDate(quotation.issueDate)}`, 15, yPosition + 12);
      pdf.text(`Valid Until: ${formatDate(quotation.validityDate)}`, 15, yPosition + 18);
      pdf.text(`Status: ${quotation.status}`, 15, yPosition + 24);

      // Right Column - Client Details
      pdf.setFont('helvetica', 'bold');
      pdf.text('Client Details:', pageWidth / 2 + 10, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(quotation.clientName, pageWidth / 2 + 10, yPosition + 6);
      if (quotation.clientCompany) {
        pdf.text(quotation.clientCompany, pageWidth / 2 + 10, yPosition + 12);
      }
      pdf.text(quotation.clientEmail, pageWidth / 2 + 10, yPosition + 18);
      pdf.text(quotation.clientPhone || '', pageWidth / 2 + 10, yPosition + 24);

      yPosition += 35;

      // Services Table
      const tableData = quotation.services.map(service => [
        service.name,
        service.description || '-',
        service.quantity.toString(),
        formatCurrency(service.price, quotation.currency),
        service.billingCycle,
        formatCurrency(service.quantity * service.price, quotation.currency)
      ]);

      pdf.autoTable({
        startY: yPosition,
        head: [['Service', 'Description', 'Qty', 'Price', 'Billing', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [26, 26, 46],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          lineColor: [224, 224, 224],
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 45 },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 25 },
          5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
        }
      });

      yPosition = pdf.lastAutoTable.finalY + 10;

      // Pricing Summary (Right aligned)
      const summaryX = pageWidth - 70;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      pdf.text('Subtotal:', summaryX, yPosition);
      pdf.text(formatCurrency(quotation.subtotal, quotation.currency), pageWidth - 15, yPosition, { align: 'right' });
      yPosition += 6;

      if (quotation.discount > 0) {
        pdf.text(`Discount (${quotation.discount}%):`, summaryX, yPosition);
        pdf.text(`- ${formatCurrency(quotation.discountAmount, quotation.currency)}`, pageWidth - 15, yPosition, { align: 'right' });
        yPosition += 6;
      }

      if (quotation.tax > 0) {
        pdf.text(`Tax (${quotation.tax}%):`, summaryX, yPosition);
        pdf.text(formatCurrency(quotation.taxAmount, quotation.currency), pageWidth - 15, yPosition, { align: 'right' });
        yPosition += 6;
      }

      // Grand Total
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setDrawColor(15, 52, 96);
      pdf.setLineWidth(0.5);
      pdf.line(summaryX, yPosition, pageWidth - 15, yPosition);
      yPosition += 6;
      pdf.text('Grand Total:', summaryX, yPosition);
      pdf.text(formatCurrency(quotation.grandTotal, quotation.currency), pageWidth - 15, yPosition, { align: 'right' });
      
      yPosition += 15;

      // Additional Information
      if (quotation.paymentTerms) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('Payment Terms:', 15, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        yPosition += 6;
        const paymentLines = pdf.splitTextToSize(quotation.paymentTerms, pageWidth - 30);
        pdf.text(paymentLines, 15, yPosition);
        yPosition += paymentLines.length * 5 + 5;
      }

      if (quotation.projectTimeline) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('Project Timeline:', 15, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        yPosition += 6;
        pdf.text(quotation.projectTimeline, 15, yPosition);
        yPosition += 10;
      }

      if (quotation.notes) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('Notes:', 15, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        yPosition += 6;
        const notesLines = pdf.splitTextToSize(quotation.notes, pageWidth - 30);
        pdf.text(notesLines, 15, yPosition);
        yPosition += notesLines.length * 5 + 5;
      }

      if (quotation.termsAndConditions) {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('Terms & Conditions:', 15, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        yPosition += 6;
        const termsLines = pdf.splitTextToSize(quotation.termsAndConditions, pageWidth - 30);
        pdf.text(termsLines, 15, yPosition);
        yPosition += termsLines.length * 4 + 10;
      }

      // Footer
      const footerY = pageHeight - 25;
      pdf.setFillColor(26, 26, 46);
      pdf.rect(0, footerY - 5, pageWidth, 30, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Thank you for choosing Codeverza!', pageWidth / 2, footerY, { align: 'center' });
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(224, 224, 224);
      pdf.text('www.codeverza.com | info@codeverza.com | +92 300 1234567', pageWidth / 2, footerY + 5, { align: 'center' });
      pdf.text('Delivering excellence in web development since 2020', pageWidth / 2, footerY + 10, { align: 'center' });

      // Page numbers
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 15, footerY + 15, { align: 'right' });
      }

      // Save PDF
      pdf.save(`Quotation_${quotation.quotationNumber}.pdf`);
      
      Swal.fire({
        icon: 'success',
        title: 'PDF Generated',
        text: 'Quotation downloaded successfully',
        timer: 2000
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to generate PDF'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleWhatsAppShare = () => {
    if (!quotation) return;
    
    const message = `Hi ${quotation.clientName},%0A%0APlease find your quotation details:%0A%0AQuotation Number: ${quotation.quotationNumber}%0AAmount: ${formatCurrency(quotation.grandTotal, quotation.currency)}%0AValid Until: ${formatDate(quotation.validityDate)}%0A%0AFor full details, please contact us.%0A%0AThank you!%0ACodeverza Team`;
    
    const whatsappUrl = `https://wa.me/${quotation.clientPhone?.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailShare = () => {
    if (!quotation) return;
    
    const subject = `Quotation ${quotation.quotationNumber} - Codeverza`;
    const body = `Dear ${quotation.clientName},%0A%0APlease find your quotation details below:%0A%0AQuotation Number: ${quotation.quotationNumber}%0AAmount: ${formatCurrency(quotation.grandTotal, quotation.currency)}%0AIssue Date: ${formatDate(quotation.issueDate)}%0AValid Until: ${formatDate(quotation.validityDate)}%0A%0AFor complete details, please refer to the attached quotation document.%0A%0AThank you for considering Codeverza!%0A%0ABest regards,%0ACodeverza Team`;
    
    const mailtoUrl = `mailto:${quotation.clientEmail}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    Swal.fire({
      icon: 'success',
      title: 'Link Copied',
      text: 'Quotation link copied to clipboard',
      timer: 2000
    });
  };

  if (loading) {
    return (
      <div className="quotation-preview-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading quotation...</p>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="quotation-preview-page">
        <div className="error-container">
          <p>Quotation not found</p>
          <button onClick={() => router.push('/admin/quotations')}>
            Back to Quotations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quotation-preview-page">
      {/* Action Bar */}
      <div className="preview-actions no-print">
        <button 
          className="btn-back"
          onClick={() => router.push('/admin/quotations')}
        >
          <FiArrowLeft /> Back
        </button>
        
        <div className="action-buttons">
          <button 
            className="btn-icon-text"
            onClick={() => router.push(`/admin/quotations/edit/${quotation.id}`)}
          >
            <FiEdit /> Edit
          </button>
          
          <button 
            className="btn-icon-text"
            onClick={handleCopyLink}
          >
            <FiCopy /> Copy Link
          </button>
          
          <button 
            className="btn-icon-text"
            onClick={handleWhatsAppShare}
          >
            <FiMessageCircle /> WhatsApp
          </button>
          
          <button 
            className="btn-icon-text"
            onClick={handleEmailShare}
          >
            <FiMail /> Email
          </button>
          
          <button 
            className="btn-icon-text"
            onClick={handlePrint}
          >
            <FiPrinter /> Print
          </button>
          
          <button 
            className="btn-primary"
            onClick={generatePDF}
            disabled={generating}
          >
            {generating ? (
              <>
                <span className="spinner-small"></span> Generating...
              </>
            ) : (
              <>
                <FiDownload /> Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quotation Preview */}
      <div className="quotation-document" ref={printRef}>
        {/* Header */}
        <div className="quotation-header">
          <div className="company-info">
            <div className="company-logo">C</div>
            <div className="company-details">
              <h1 className="company-name">CODEVERZA</h1>
              <p className="company-tagline">Professional Web Development Solutions</p>
            </div>
          </div>
          <div className="company-contact">
            <p>www.codeverza.com</p>
            <p>info@codeverza.com</p>
            <p>+92 300 1234567</p>
          </div>
        </div>

        {/* Quotation Title */}
        <div className="document-title">
          <h2>QUOTATION</h2>
        </div>

        {/* Details Section */}
        <div className="details-section">
          <div className="details-box">
            <h3>Quotation Details</h3>
            <p><strong>Number:</strong> {quotation.quotationNumber}</p>
            <p><strong>Issue Date:</strong> {formatDate(quotation.issueDate)}</p>
            <p><strong>Valid Until:</strong> {formatDate(quotation.validityDate)}</p>
            <p><strong>Status:</strong> <span className={`status-badge ${quotation.status.toLowerCase()}`}>{quotation.status}</span></p>
          </div>

          <div className="details-box">
            <h3>Client Details</h3>
            <p><strong>{quotation.clientName}</strong></p>
            {quotation.clientCompany && <p>{quotation.clientCompany}</p>}
            <p>{quotation.clientEmail}</p>
            <p>{quotation.clientPhone}</p>
            {quotation.clientAddress && <p className="address">{quotation.clientAddress}</p>}
          </div>
        </div>

        {/* Services Table */}
        <div className="services-section">
          <h3>Services</h3>
          <table className="services-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Billing</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {quotation.services.map((service, index) => (
                <tr key={index}>
                  <td><strong>{service.name}</strong></td>
                  <td>{service.description || '-'}</td>
                  <td className="text-center">{service.quantity}</td>
                  <td className="text-right">{formatCurrency(service.price, quotation.currency)}</td>
                  <td>{service.billingCycle}</td>
                  <td className="text-right"><strong>{formatCurrency(service.quantity * service.price, quotation.currency)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div className="pricing-summary-section">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>{formatCurrency(quotation.subtotal, quotation.currency)}</span>
          </div>
          {quotation.discount > 0 && (
            <div className="summary-row discount">
              <span>Discount ({quotation.discount}%):</span>
              <span>- {formatCurrency(quotation.discountAmount, quotation.currency)}</span>
            </div>
          )}
          {quotation.tax > 0 && (
            <div className="summary-row">
              <span>Tax ({quotation.tax}%):</span>
              <span>{formatCurrency(quotation.taxAmount, quotation.currency)}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Grand Total:</span>
            <span>{formatCurrency(quotation.grandTotal, quotation.currency)}</span>
          </div>
        </div>

        {/* Additional Information */}
        {quotation.paymentTerms && (
          <div className="info-section">
            <h3>Payment Terms</h3>
            <p>{quotation.paymentTerms}</p>
          </div>
        )}

        {quotation.projectTimeline && (
          <div className="info-section">
            <h3>Project Timeline</h3>
            <p>{quotation.projectTimeline}</p>
          </div>
        )}

        {quotation.notes && (
          <div className="info-section">
            <h3>Notes</h3>
            <p>{quotation.notes}</p>
          </div>
        )}

        {quotation.termsAndConditions && (
          <div className="info-section">
            <h3>Terms & Conditions</h3>
            <p className="terms-text">{quotation.termsAndConditions}</p>
          </div>
        )}

        {/* Footer */}
        <div className="quotation-footer">
          <div className="footer-content">
            <h3>Thank you for choosing Codeverza!</h3>
            <p>www.codeverza.com | info@codeverza.com | +92 300 1234567</p>
            <p className="footer-tagline">Delivering excellence in web development since 2020</p>
          </div>
        </div>
      </div>
    </div>
  );
}
