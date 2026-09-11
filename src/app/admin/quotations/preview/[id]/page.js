'use client';

import { useState, useEffect, useRef } from 'react';
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
  FiShare2
} from 'react-icons/fi';
import '../../quotations.css';

export default function QuotationPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const printRef = useRef();
  
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);

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

  const getCurrencyTotals = () => {
    if (quotation?.totalsByCurrency) return quotation.totalsByCurrency;
    return (quotation?.services || []).reduce((totals, service) => {
      const currency = service.currency || quotation?.currency || 'PKR';
      totals[currency] = (totals[currency] || 0) + (service.quantity * service.price);
      return totals;
    }, {});
  };

  const handlePrint = () => {
    window.print();
  };

  const generatePDFDocument = async () => {
    if (!quotation) return;
    
    try {
      // Use html2canvas for PDF generation (similar to joining letters)
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

      // Keep each rendered text line together when choosing a manual page break.
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

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      const pdf = await generatePDFDocument();
      
      // Save/Download PDF
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

  const previewPDF = async () => {
    setGenerating(true);
    
    try {
      const pdf = await generatePDFDocument();
      
      // Open PDF in new window/tab for preview
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
      Swal.fire({
        icon: 'success',
        title: 'PDF Preview',
        text: 'Opening PDF in new window',
        timer: 2000
      });

    } catch (error) {
      console.error('Error previewing PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to preview PDF'
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

  /*
            // Add header on new pages only (first page already has content)
            if (data.pageNumber > 1) {
              addHeader(pdf);
            }
          },
          margin: { left: 15, right: 15 },
          pageBreak: 'auto',
          tableWidth: 'auto'
        });
        
        // Check if autoTable created a blank first page and remove it
        const totalPages = pdf.internal.getNumberOfPages();
        if (totalPages > 1) {
          // Check if page 1 has only header/details but no table
          // If table started on page 2, delete page 1 and shift everything
          const firstPageData = pdf.internal.pages[1];
          // AutoTable stores its final Y position
          const tableFinalY = pdf.lastAutoTable.finalY;
          const tableStartPage = pdf.lastAutoTable.startPageNumber || 1;
          
          console.log('Table started on page:', tableStartPage, 'Total pages:', totalPages);
          
          // If table started on page 2, that means page 1 was skipped
          if (tableStartPage === 2) {
            console.warn('AutoTable skipped to page 2, this should not happen');
            // Unfortunately we cannot easily fix this after the fact
            // The table is already rendered on page 2
          }
        }
        
        yPosition = pdf.lastAutoTable.finalY + 10;
      } else {
        // Fallback: Manual table drawing
        console.warn('autoTable not available, using fallback');
        
        pdf.setFillColor(13, 27, 62);
        pdf.rect(15, yPosition, pageWidth - 30, 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        
        const headers = ['Service', 'Description', 'Qty', 'Price', 'Billing', 'Total'];
        const colWidths = [40, 52, 12, 28, 22, 26]; // Total = 180mm
        const colX = [15, 55, 107, 119, 147, 169];
        
        headers.forEach((header, i) => {
          const align = i === 2 ? 'center' : i > 2 ? 'right' : 'left';
          const x = align === 'right' ? colX[i] + colWidths[i] - 3 : (align === 'center' ? colX[i] + colWidths[i]/2 : colX[i] + 4);
          pdf.text(header, x, yPosition + 6, { align });
        });
        
        yPosition += 12;
        
        quotation.services.forEach((service, index) => {
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9.5);
          
          const serviceName = pdf.splitTextToSize(service.name, colWidths[0] - 5);
          const descText = service.description || '-';
          const descLines = pdf.splitTextToSize(descText, colWidths[1] - 5);
          const billingLines = pdf.splitTextToSize(service.billingCycle, colWidths[4] - 5);
          
          // Calculate proper row height with more padding for multi-line content
          const maxLines = Math.max(serviceName.length, descLines.length, billingLines.length);
          const lineHeight = 5;
          const paddingTop = 7;
          const paddingBottom = 7;
          const rowHeight = Math.max(18, (maxLines * lineHeight) + paddingTop + paddingBottom);
          
          // Check if row will fit on current page, if not start new page
          if (yPosition + rowHeight > pageHeight - 30) {
            pdf.addPage();
            addHeader(pdf);
            yPosition = 35;
            
            // Re-draw header on new page
            pdf.setFillColor(13, 27, 62);
            pdf.rect(15, yPosition, pageWidth - 30, 10, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            
            headers.forEach((header, i) => {
              const align = i === 2 ? 'center' : i > 2 ? 'right' : 'left';
              const x = align === 'right' ? colX[i] + colWidths[i] - 3 : (align === 'center' ? colX[i] + colWidths[i]/2 : colX[i] + 4);
              pdf.text(header, x, yPosition + 6, { align });
            });
            
            yPosition += 12;
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'normal');
          }
          
          // Background
          if (index % 2 === 0) {
            pdf.setFillColor(250, 251, 255);
            pdf.rect(15, yPosition, pageWidth - 30, rowHeight, 'F');
          }
          
          // Borders
          pdf.setDrawColor(221, 230, 255);
          pdf.setLineWidth(0.1);
          colX.forEach((x, i) => {
            pdf.line(x, yPosition, x, yPosition + rowHeight);
          });
          pdf.line(colX[colX.length - 1] + colWidths[colWidths.length - 1], yPosition, colX[colX.length - 1] + colWidths[colWidths.length - 1], yPosition + rowHeight);
          pdf.line(15, yPosition + rowHeight, pageWidth - 15, yPosition + rowHeight);
          
          // Calculate text Y position (centered vertically in cell)
          const textStartY = yPosition + paddingTop + 4;
          
          // Service name (bold, larger)
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.text(serviceName, colX[0] + 4, textStartY);
          
          // Description (smaller font, multi-line)
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8.5);
          pdf.text(descLines, colX[1] + 4, textStartY);
          
          // Quantity (centered)
          pdf.setFontSize(9.5);
          pdf.text(service.quantity.toString(), colX[2] + colWidths[2]/2, textStartY, { align: 'center' });
          
          // Price (right)
          pdf.text(formatCurrency(service.price, quotation.currency), colX[3] + colWidths[3] - 4, textStartY, { align: 'right' });
          
          // Billing
          pdf.setFontSize(8.5);
          pdf.text(billingLines, colX[4] + 4, textStartY);
          
          // Total (right, bold, larger)
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.text(formatCurrency(service.quantity * service.price, quotation.currency), colX[5] + colWidths[5] - 4, textStartY, { align: 'right' });
          
          yPosition += rowHeight;
          
          // Removed old page break check since we now check before drawing row
        });
        
        yPosition += 10;
      }

      // Pricing Summary — skip for employee quotation
      if (!quotation.isEmployeeQuotation) {
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
      }

      // Check if we need a new page for additional info
      if (yPosition > pageHeight - 90) {
        pdf.addPage();
        addHeader(pdf);
        yPosition = 35;
      }

      // Add some spacing before additional sections
      yPosition += 5;

      // Single column layout for all additional info (Payment Terms, Timeline, Notes, Terms)
      const fullColX = 15;
      const fullColWidth = pageWidth - 30;
      
      if (quotation.paymentTerms) {
        // Check if we need new page before adding this section
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          addHeader(pdf);
          yPosition = 35;
        }
        
        // Calculate proper box height based on content with proper text wrapping
        const paymentLines = pdf.splitTextToSize(quotation.paymentTerms, fullColWidth - 8);
        const lineCount = Array.isArray(paymentLines) ? paymentLines.length : 1;
        const boxHeight = 10 + (lineCount * 4.5) + 6;
        
        // Border
        pdf.setDrawColor(232, 237, 245);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(fullColX, yPosition, fullColWidth, boxHeight, 2, 2, 'S');
        
        // Header background
        pdf.setFillColor(13, 27, 62);
        pdf.rect(fullColX, yPosition, fullColWidth, 10, 'F');
        
        // Header text
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PAYMENT TERMS', fullColX + 4, yPosition + 6.5);
        
        // Body background
        pdf.setFillColor(250, 251, 255);
        pdf.rect(fullColX, yPosition + 10, fullColWidth, boxHeight - 10, 'F');
        
        // Body text with proper wrapping
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.text(paymentLines, fullColX + 4, yPosition + 14, {
          maxWidth: fullColWidth - 8,
          align: 'left'
        });
        
        yPosition += boxHeight + 8;
      }

      if (quotation.projectTimeline) {
        // Check if we need new page before adding this section
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          addHeader(pdf);
          yPosition = 35;
        }
        
        // Calculate proper box height based on content with proper text wrapping
        const timelineLines = pdf.splitTextToSize(quotation.projectTimeline, fullColWidth - 8);
        const lineCount = Array.isArray(timelineLines) ? timelineLines.length : 1;
        const boxHeight = 10 + (lineCount * 4.5) + 6;
        
        // Border
        pdf.setDrawColor(232, 237, 245);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(fullColX, yPosition, fullColWidth, boxHeight, 2, 2, 'S');
        
        // Header background
        pdf.setFillColor(13, 27, 62);
        pdf.rect(fullColX, yPosition, fullColWidth, 10, 'F');
        
        // Header text
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PROJECT TIMELINE', fullColX + 4, yPosition + 6.5);
        
        // Body background
        pdf.setFillColor(250, 251, 255);
        pdf.rect(fullColX, yPosition + 10, fullColWidth, boxHeight - 10, 'F');
        
        // Body text with proper wrapping
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.text(timelineLines, fullColX + 4, yPosition + 14, {
          maxWidth: fullColWidth - 8,
          align: 'left'
        });
        
        yPosition += boxHeight + 8;
      }

      if (quotation.notes) {
        // Check if we need new page before adding this section
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          addHeader(pdf);
          yPosition = 35;
        }
        
        // Calculate proper box height based on content with proper text wrapping
        const notesLines = pdf.splitTextToSize(quotation.notes, fullColWidth - 8);
        const lineCount = Array.isArray(notesLines) ? notesLines.length : 1;
        const boxHeight = 10 + (lineCount * 4.5) + 6;
        
        // Border
        pdf.setDrawColor(232, 237, 245);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(fullColX, yPosition, fullColWidth, boxHeight, 2, 2, 'S');
        
        // Header background
        pdf.setFillColor(13, 27, 62);
        pdf.rect(fullColX, yPosition, fullColWidth, 10, 'F');
        
        // Header text
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('NOTES', fullColX + 4, yPosition + 6.5);
        
        // Body background
        pdf.setFillColor(250, 251, 255);
        pdf.rect(fullColX, yPosition + 10, fullColWidth, boxHeight - 10, 'F');
        
        // Body text with proper wrapping
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.text(notesLines, fullColX + 4, yPosition + 14, {
          maxWidth: fullColWidth - 8,
          align: 'left'
        });
        
        yPosition += boxHeight + 8;
      }

      if (quotation.termsAndConditions) {
        // Check if we need new page before adding this section
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          addHeader(pdf);
          yPosition = 35;
        }
        
        // Calculate proper box height based on content with proper text wrapping
        const termsLines = pdf.splitTextToSize(quotation.termsAndConditions, fullColWidth - 8);
        const lineCount = Array.isArray(termsLines) ? termsLines.length : 1;
        const boxHeight = 10 + (lineCount * 4) + 6;
        
        // Border
        pdf.setDrawColor(232, 237, 245);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(fullColX, yPosition, fullColWidth, boxHeight, 2, 2, 'S');
        
        // Header background
        pdf.setFillColor(240, 244, 255);
        pdf.rect(fullColX, yPosition, fullColWidth, 10, 'F');
        
        // Header text
        pdf.setTextColor(26, 47, 107);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TERMS & CONDITIONS', fullColX + 4, yPosition + 6.5);
        
        // Body background
        pdf.setFillColor(255, 255, 255);
        pdf.rect(fullColX, yPosition + 10, fullColWidth, boxHeight - 10, 'F');
        
        // Body text with proper wrapping
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.text(termsLines, fullColX + 4, yPosition + 14, {
          maxWidth: fullColWidth - 8,
          align: 'left'
        });
        
        yPosition += boxHeight + 8;
      }

      // Check if signature will fit on current page
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        addHeader(pdf);
        yPosition = 35;
      }

      // Signature Section (centered, with stamp like joining letter)
      const signatureY = yPosition + 10;
      const centerX = pageWidth / 2;
      
      // Add "CODEVERZA" stamp above signature line (simple non-rotated box like joining letter)
      const stampY = signatureY - 18;
      
      // Draw stamp using simple rectangle and text (NO ROTATION)
      pdf.setDrawColor(177, 76, 255); // Purple border
      pdf.setLineWidth(0.6);
      pdf.setTextColor(177, 76, 255); // Purple text
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      
      // Calculate stamp width based on text
      const stampText = 'CODEVERZA';
      const stampWidth = pdf.getTextWidth(stampText) + 12;
      const stampX = centerX - stampWidth / 2; // Center horizontally
      
      // Draw simple rectangle (non-rotated)
      pdf.saveGraphicsState();
      pdf.setLineDash([]);
      pdf.rect(stampX, stampY, stampWidth, 10);
      pdf.restoreGraphicsState();
      
      // Draw text inside box (non-rotated)
      pdf.text(stampText, stampX + 6, stampY + 7);
      
      // Reset colors
      pdf.setTextColor(0, 0, 0);
      pdf.setDrawColor(0, 0, 0);
      
      // Top line for signature
      pdf.setLineWidth(0.3);
      pdf.line(centerX - 35, signatureY, centerX + 35, signatureY);
      
      // "Authorized Signature" text
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Authorized Signature', centerX, signatureY + 6, { align: 'center' });
      
      // Name and designation
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Muhammad Aqdas', centerX, signatureY + 11, { align: 'center' });
      pdf.text('CEO', centerX, signatureY + 16, { align: 'center' });

      yPosition = signatureY + 15;

      // Add footers to all pages
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        addFooter(pdf, i, pageCount);
      }

      return pdf;

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      const pdf = await generatePDFDocument();
      
      // Save/Download PDF
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

  const previewPDF = async () => {
    setGenerating(true);
    
    try {
      const pdf = await generatePDFDocument();
      
      // Open PDF in new window/tab for preview
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
      Swal.fire({
        icon: 'success',
        title: 'PDF Preview',
        text: 'Opening PDF in new window',
        timer: 2000
      });

    } catch (error) {
      console.error('Error previewing PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to preview PDF'
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

  */

  if (loading) {
    return null; // Global loader will handle this
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
            className="btn-icon-text btn-share-employee"
            onClick={() => router.push(`/admin/quotations/share/${quotation.id}`)}
            title="Employee ke liye clean view"
          >
            <FiShare2 /> Share with Employee
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
            className="btn-icon-text btn-preview"
            onClick={previewPDF}
            disabled={generating}
            title="Open PDF in new window"
          >
            {generating ? (
              <>
                <span className="spinner-small"></span> Loading...
              </>
            ) : (
              <>
                <FiDownload /> Preview PDF
              </>
            )}
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

      {/* Quotation Document */}
      <div className="quotation-document" ref={printRef}>

        {/* ── HEADER ── */}
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

        {/* ── TITLE BAND ── */}
        <div className="document-title-band">
          <h2>QUOTATION</h2>
          <div className="doc-number-label">
            Ref No: <span>{quotation.quotationNumber}</span>
          </div>
        </div>

        {/* ── DOCUMENT BODY ── */}
        <div className="document-body">

          {/* Details: Quotation Info + Client Info */}
          <div className={`details-section ${quotation.isEmployeeQuotation ? 'single-col' : ''}`}>
            <div className="details-box">
              <div className="details-box-header">
                <h3>Quotation Details</h3>
              </div>
              <div className="details-box-body">
                {quotation.issueDate && (
                  <p><strong>Issue Date</strong>{formatDate(quotation.issueDate)}</p>
                )}
                {quotation.validityDate && (
                  <p><strong>Valid Until</strong>{formatDate(quotation.validityDate)}</p>
                )}
                <p>
                  <strong>Status</strong>
                  <span className={`status-badge ${quotation.status.toLowerCase()}`}>
                    {quotation.status}
                  </span>
                </p>
                {quotation.currency && (
                  <p><strong>Currency</strong>{quotation.currency}</p>
                )}
              </div>
            </div>

            {/* Client box — hidden for employee quotation */}
            {!quotation.isEmployeeQuotation && (
            <div className="details-box">
              <div className="details-box-header">
                <h3>Billed To</h3>
              </div>
              <div className="details-box-body">
                <span className="client-name">{quotation.clientName}</span>
                {quotation.clientCompany && (
                  <span className="client-company">{quotation.clientCompany}</span>
                )}
                <span className="client-contact">{quotation.clientEmail}</span>
                {quotation.clientPhone && (
                  <span className="client-contact">{quotation.clientPhone}</span>
                )}
                {quotation.clientAddress && (
                  <span className="address">{quotation.clientAddress}</span>
                )}
              </div>
            </div>
            )}
          </div>

          {/* Services Table */}
          <div className="services-section">
            <p className="section-label">Services & Deliverables</p>
            <table className="services-table">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Service</th>
                  <th style={{ width: '34%' }}>Description</th>
                  <th style={{ width: '7%', textAlign: 'center' }}>Qty</th>
                  <th style={{ width: '13%', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ width: '10%' }}>Billing</th>
                  <th style={{ width: '14%', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.services.map((service, index) => (
                  <tr key={index}>
                    <td><strong>{service.name}</strong></td>
                    <td>
                      {service.description ? (
                        <span className="service-desc">{service.description}</span>
                      ) : '—'}
                    </td>
                    <td className="text-center">{service.quantity}</td>
                    <td className="text-right">{formatCurrency(service.price, service.currency || quotation.currency)}</td>
                    <td style={{ textTransform: 'capitalize', fontSize: '11.5px', color: '#666' }}>
                      {service.billingCycle}
                    </td>
                    <td className="text-right">
                      {formatCurrency(service.quantity * service.price, service.currency || quotation.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals — hidden for employee quotation */}
          {!quotation.isEmployeeQuotation && (
          <div className="totals-wrapper">
            <div className="pricing-summary-section">
              {Object.entries(getCurrencyTotals()).map(([currency, subtotal]) => {
                const discount = (subtotal * (quotation.discount || 0)) / 100;
                const tax = ((subtotal - discount) * (quotation.tax || 0)) / 100;
                return (
                  <div key={currency} className="currency-summary-group">
                    <div className="sum-row"><span>{currency} Subtotal</span><span>{formatCurrency(subtotal, currency)}</span></div>
                    {quotation.discount > 0 && <div className="sum-row discount"><span>{currency} Discount ({quotation.discount}%)</span><span>− {formatCurrency(discount, currency)}</span></div>}
                    {quotation.tax > 0 && <div className="sum-row"><span>{currency} Tax ({quotation.tax}%)</span><span>{formatCurrency(tax, currency)}</span></div>}
                    <div className="sum-row grand-total"><span>{currency} Grand Total</span><span>{formatCurrency(subtotal - discount + tax, currency)}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* Payment Terms + Project Timeline side by side */}
          {(quotation.paymentTerms || quotation.projectTimeline) && (
            <div className="info-grid">
              {quotation.paymentTerms && (
                <div className="info-section">
                  <div className="info-section-header">
                    <h3>Payment Terms</h3>
                  </div>
                  <div className="info-section-body">
                    <p>{quotation.paymentTerms}</p>
                  </div>
                </div>
              )}
              {quotation.projectTimeline && (
                <div className="info-section">
                  <div className="info-section-header">
                    <h3>Project Timeline</h3>
                  </div>
                  <div className="info-section-body">
                    <p>{quotation.projectTimeline}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {quotation.notes && (
            <div className="info-section">
              <div className="info-section-header">
                <h3>Notes</h3>
              </div>
              <div className="info-section-body">
                <p>{quotation.notes}</p>
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          {quotation.termsAndConditions && (
            <div className="info-section">
              <div className="info-section-header">
                <h3>Terms &amp; Conditions</h3>
              </div>
              <div className="info-section-body">
                <p className="terms-text">{quotation.termsAndConditions}</p>
              </div>
            </div>
          )}

          {/* Signature Block */}
          <div className={`signature-section ${quotation.isEmployeeQuotation ? 'single-signature' : ''}`}>
            <div className="signature-box">
              {quotation.isEmployeeQuotation && (
                <div className="codeverza-stamp"><span>CODEVERZA</span></div>
              )}
              <div className="signature-line"></div>
              <strong>Authorized Signature</strong>
              {quotation.isEmployeeQuotation ? (
                <>
                  <p>{quotation.employeeName || (quotation.clientName === 'Employee Quotation' ? 'Muhammad Aqdas' : quotation.clientName)}</p>
                  <p>{quotation.employeeDesignation || 'CEO'}</p>
                </>
              ) : (
                <p>Codeverza</p>
              )}
            </div>
            {!quotation.isEmployeeQuotation && (
              <div className="signature-box">
                <div className="signature-line"></div>
                <strong>Client Acceptance</strong>
                <p>{quotation.clientName}</p>
              </div>
            )}
          </div>

        </div>{/* end document-body */}

        {/* ── FOOTER ── */}
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
