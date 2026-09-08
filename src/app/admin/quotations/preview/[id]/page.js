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

  const handlePrint = () => {
    window.print();
  };

  const generatePDFDocument = async () => {
    if (!quotation) return;
    
    setGenerating(true);
    
    try {
      // Dynamically import jspdf-autotable to ensure proper loading
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Load company logo using native browser Image
      let logoLoaded = false;
      const logoImg = typeof window !== 'undefined' ? window.Image ? new window.Image() : document.createElement('img') : null;
      
      if (logoImg) {
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = '/img/codeverza-logo.png';
        
        // Wait for logo to load with timeout
        try {
          await Promise.race([
            new Promise((resolve) => {
              logoImg.onload = () => {
                logoLoaded = true;
                resolve();
              };
              logoImg.onerror = resolve;
            }),
            new Promise((resolve) => setTimeout(resolve, 2000)) // 2 second timeout
          ]);
        } catch (err) {
          console.log('Logo loading timed out or failed');
        }
      }

      // Function to add header on each page
      const addHeader = (pdf) => {
        // Thin header bar
        pdf.setFillColor(13, 27, 62);
        pdf.rect(0, 0, pageWidth, 28, 'F');
        
        // Accent line
        pdf.setFillColor(79, 142, 247);
        pdf.rect(0, 28, pageWidth, 1.5, 'F');
        
        // Company Logo (small, left side)
        if (logoLoaded && logoImg) {
          try {
            pdf.addImage(logoImg, 'PNG', 12, 8, 12, 12);
          } catch (err) {
            console.log('Failed to add logo');
          }
        }
        
        // Company Name
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CODEVERZA', 28, 16);
        
        // Tagline
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Professional Web Development Solutions', 28, 20);
        
        // Contact info (right side, compact)
        pdf.setFontSize(7);
        const contactX = pageWidth - 12;
        pdf.text(quotation.companyWebsite || 'www.codeverza.com', contactX, 12, { align: 'right' });
        pdf.text(quotation.companyEmail || 'info@codeverza.com', contactX, 16, { align: 'right' });
        pdf.text(quotation.companyPhone || '+92 325 1507557', contactX, 20, { align: 'right' });
      };

      // Function to add footer on each page
      const addFooter = (pdf, pageNum, totalPages) => {
        const footerY = pageHeight - 18;
        
        // Accent line
        pdf.setFillColor(79, 142, 247);
        pdf.rect(0, footerY - 1, pageWidth, 1, 'F');
        
        // Footer background
        pdf.setFillColor(13, 27, 62);
        pdf.rect(0, footerY, pageWidth, 18, 'F');
        
        // Left side - Thank you message
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Thank you for choosing Codeverza!', 12, footerY + 7);
        
        pdf.setFontSize(6.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(200, 200, 200);
        pdf.text('Delivering excellence in web development since 2020', 12, footerY + 12);
        
        // Right side - Page number
        pdf.setFontSize(7);
        pdf.setTextColor(200, 200, 200);
        pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 12, footerY + 10, { align: 'right' });
      };

      // Add header on first page
      addHeader(pdf);

      yPosition = 35;

      // Quotation Title Band (directly after header, no gap)
      pdf.setFillColor(240, 244, 255);
      pdf.rect(0, yPosition, pageWidth, 14, 'F');
      
      // Border line
      pdf.setDrawColor(221, 230, 255);
      pdf.setLineWidth(0.3);
      pdf.line(0, yPosition + 14, pageWidth, yPosition + 14);
      
      pdf.setTextColor(13, 27, 62);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('QUOTATION', 15, yPosition + 9);
      
      // Quotation number (right side)
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      const refLabel = 'Ref No: ';
      const refWidth = pdf.getTextWidth(refLabel);
      pdf.text(refLabel, pageWidth - 15 - pdf.getTextWidth(quotation.quotationNumber) - refWidth, yPosition + 9, { align: 'left' });
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(13, 27, 62);
      pdf.text(quotation.quotationNumber, pageWidth - 15, yPosition + 9, { align: 'right' });
      
      yPosition += 22;

      // Two-column layout for Quotation Details and Client Details (with styled boxes like preview)
      const boxMargin = 15;
      const boxWidth = quotation.isEmployeeQuotation ? (pageWidth - 2 * boxMargin) : ((pageWidth - 3 * boxMargin) / 2);
      const leftBoxX = boxMargin;
      const rightBoxX = pageWidth - boxMargin - boxWidth;
      let currentY = yPosition;

      // Left Box - Quotation Details (styled box with header)
      const quotationDetailsLines = [];
      if (quotation.issueDate) {
        quotationDetailsLines.push({ label: 'Issue Date', value: formatDate(quotation.issueDate) });
      }
      if (quotation.validityDate) {
        quotationDetailsLines.push({ label: 'Valid Until', value: formatDate(quotation.validityDate) });
      }
      quotationDetailsLines.push({ label: 'Status', value: quotation.status });
      if (quotation.currency) {
        quotationDetailsLines.push({ label: 'Currency', value: quotation.currency });
      }

      const detailsBoxHeight = 10 + (quotationDetailsLines.length * 7) + 6;

      // Border
      pdf.setDrawColor(232, 237, 245);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(leftBoxX, currentY, boxWidth, detailsBoxHeight, 2, 2, 'S');

      // Header background
      pdf.setFillColor(13, 27, 62);
      pdf.rect(leftBoxX, currentY, boxWidth, 10, 'F');

      // Header text
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('QUOTATION DETAILS', leftBoxX + 4, currentY + 6.5);

      // Body background
      pdf.setFillColor(250, 251, 255);
      pdf.rect(leftBoxX, currentY + 10, boxWidth, detailsBoxHeight - 10, 'F');

      // Body content
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
      let detailY = currentY + 17;
      quotationDetailsLines.forEach(item => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.label + ':', leftBoxX + 4, detailY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(item.value, leftBoxX + 35, detailY);
        detailY += 7;
      });

      // Right Box - Client Details (only if not employee quotation)
      if (!quotation.isEmployeeQuotation) {
        const clientDetailsLines = [];
        clientDetailsLines.push({ type: 'name', value: quotation.clientName });
        if (quotation.clientCompany) {
          clientDetailsLines.push({ type: 'company', value: quotation.clientCompany });
        }
        clientDetailsLines.push({ type: 'contact', value: quotation.clientEmail });
        if (quotation.clientPhone) {
          clientDetailsLines.push({ type: 'contact', value: quotation.clientPhone });
        }
        if (quotation.clientAddress) {
          clientDetailsLines.push({ type: 'address', value: quotation.clientAddress });
        }

        const clientBoxHeight = 10 + (clientDetailsLines.length * 7) + 6;

        // Border
        pdf.setDrawColor(232, 237, 245);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(rightBoxX, currentY, boxWidth, clientBoxHeight, 2, 2, 'S');

        // Header background
        pdf.setFillColor(13, 27, 62);
        pdf.rect(rightBoxX, currentY, boxWidth, 10, 'F');

        // Header text
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('BILLED TO', rightBoxX + 4, currentY + 6.5);

        // Body background
        pdf.setFillColor(255, 255, 255);
        pdf.rect(rightBoxX, currentY + 10, boxWidth, clientBoxHeight - 10, 'F');

        // Body content
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(9);
        let clientY = currentY + 17;
        clientDetailsLines.forEach(item => {
          if (item.type === 'name') {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
          } else if (item.type === 'company') {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
          } else {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8.5);
          }
          pdf.text(item.value, rightBoxX + 4, clientY);
          clientY += 7;
        });

        yPosition = currentY + Math.max(detailsBoxHeight, clientBoxHeight) + 10;
      } else {
        yPosition = currentY + detailsBoxHeight + 10;
      }

      // Add spacing before table
      yPosition += 5;

      // IMPORTANT: Ensure table starts on page 1 by capping the Y position
      // If yPosition is too high (close to bottom), autoTable will skip to page 2
      // For employee quotations, yPosition might be around 90-100mm
      // We need to ensure it's not too close to page bottom (297mm)
      const MAX_START_Y_FOR_TABLE = 180; // If starting position > 180mm, table will go to page 2
      if (yPosition > MAX_START_Y_FOR_TABLE) {
        console.warn(`Table starting Y (${yPosition}) is too high, autoTable might skip to page 2`);
      }

      // Check if we have reasonable space on first page for table
      // If not enough space, it's better to add content on same page anyway
      const availableSpaceOnFirstPage = pageHeight - yPosition - 25; // 25 for footer
      console.log('Available space for table:', availableSpaceOnFirstPage, 'Starting Y:', yPosition);

      // Services Table with proper formatting
      const tableData = quotation.services.map(service => {
        // Format description with proper line breaks for numbered lists
        const formattedDesc = service.description || '-';
        
        return [
          service.name,
          formattedDesc,
          service.quantity.toString(),
          formatCurrency(service.price, quotation.currency),
          service.billingCycle,
          formatCurrency(service.quantity * service.price, quotation.currency)
        ];
      });

      if (typeof pdf.autoTable === 'function') {
        // Prevent autoTable from creating a blank first page
        const currentPage = pdf.internal.getCurrentPageInfo().pageNumber;
        
        pdf.autoTable({
          startY: yPosition,
          head: [['Service', 'Description', 'Qty', 'Price', 'Billing', 'Total']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [13, 27, 62],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'left',
            valign: 'middle',
            cellPadding: { top: 5, right: 4, bottom: 5, left: 4 }
          },
          bodyStyles: {
            fontSize: 9.5,
            cellPadding: { top: 7, right: 4, bottom: 7, left: 4 },
            lineColor: [221, 230, 255],
            lineWidth: 0.1,
            valign: 'top',
            textColor: [0, 0, 0],
            minCellHeight: 16,
            lineHeight: 1.6
          },
          alternateRowStyles: {
            fillColor: [250, 251, 255]
          },
          columnStyles: {
            0: { 
              cellWidth: 40, 
              overflow: 'linebreak', 
              halign: 'left',
              fontStyle: 'bold',
              textColor: [13, 27, 62],
              minCellHeight: 16,
              fontSize: 9.5
            },
            1: { 
              cellWidth: 52,
              overflow: 'linebreak',
              halign: 'left',
              minCellHeight: 16,
              fontSize: 8.5,
              textColor: [0, 0, 0],
              cellPadding: { top: 7, right: 3, bottom: 7, left: 3 },
              lineHeight: 1.6
            },
            2: { 
              cellWidth: 12, 
              halign: 'center',
              overflow: 'visible',
              fontSize: 9
            },
            3: { 
              cellWidth: 28, 
              halign: 'right',
              overflow: 'linebreak',
              fontSize: 9
            },
            4: { 
              cellWidth: 22, 
              overflow: 'linebreak', 
              halign: 'left',
              fontSize: 8
            },
            5: { 
              cellWidth: 26, 
              halign: 'right',
              fontStyle: 'bold',
              textColor: [13, 27, 62],
              overflow: 'linebreak',
              fontSize: 9.5
            }
          },
          tableLineColor: [221, 230, 255],
          tableLineWidth: 0.1,
          didParseCell: function(data) {
            // Make service name bold
            if (data.column.index === 0 && data.section === 'body') {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fontSize = 9.5;
            }
            // Ensure description has proper wrapping and height
            if (data.column.index === 1 && data.section === 'body') {
              data.cell.styles.overflow = 'linebreak';
              data.cell.styles.minCellHeight = 16;
              data.cell.styles.fontSize = 8.5;
            }
          },
          willDrawPage: function(data) {
            // Force table to render on current page (page 1) if it's the initial render
            // AutoTable sometimes skips to page 2 thinking there's not enough space
            // But we want at least the header row on page 1
          },
          didDrawPage: function(data) {
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
                    <td className="text-right">{formatCurrency(service.price, quotation.currency)}</td>
                    <td style={{ textTransform: 'capitalize', fontSize: '11.5px', color: '#666' }}>
                      {service.billingCycle}
                    </td>
                    <td className="text-right">
                      {formatCurrency(service.quantity * service.price, quotation.currency)}
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
              <div className="sum-row">
                <span>Subtotal</span>
                <span>{formatCurrency(quotation.subtotal, quotation.currency)}</span>
              </div>
              {quotation.discount > 0 && (
                <div className="sum-row discount">
                  <span>Discount ({quotation.discount}%)</span>
                  <span>− {formatCurrency(quotation.discountAmount, quotation.currency)}</span>
                </div>
              )}
              {quotation.tax > 0 && (
                <div className="sum-row">
                  <span>Tax ({quotation.tax}%)</span>
                  <span>{formatCurrency(quotation.taxAmount, quotation.currency)}</span>
                </div>
              )}
              <div className="sum-row grand-total">
                <span>Grand Total</span>
                <span>{formatCurrency(quotation.grandTotal, quotation.currency)}</span>
              </div>
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
          <div className="signature-section">
            <div className="signature-box">
              <div className="signature-line"></div>
              <strong>Authorized Signature</strong>
              <p>Codeverza</p>
            </div>
            <div className="signature-box">
              <div className="signature-line"></div>
              <strong>Client Acceptance</strong>
              <p>{quotation.clientName}</p>
            </div>
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
