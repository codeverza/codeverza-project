'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';
import {
  FiArrowLeft, FiCheck, FiX, FiEye, FiEdit2,
  FiSearch, FiFilter, FiRefreshCw, FiUser, FiClock
} from 'react-icons/fi';
import '../quotations.css';
import './employee-approval.css';

export default function EmployeeQuotationApprovalPage() {
  const router = useRouter();

  const [quotations, setQuotations]         = useState([]);
  const [filtered, setFiltered]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [actionLoading, setActionLoading]   = useState(null); // id of quotation being actioned
  const [searchTerm, setSearchTerm]         = useState('');
  const [statusFilter, setStatusFilter]     = useState('Pending');
  const [previewQt, setPreviewQt]           = useState(null);
  const [editQt, setEditQt]                 = useState(null);  // quotation open in edit drawer

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { applyFilter(); }, [searchTerm, statusFilter, quotations]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res  = await fetch('/api/employee-quotations');
      const data = await res.json();
      if (data.success) setQuotations(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let list = [...quotations];
    if (statusFilter !== 'All') list = list.filter(q => q.approvalStatus === statusFilter);
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      list = list.filter(q =>
        q.quotationNumber?.toLowerCase().includes(t) ||
        q.clientName?.toLowerCase().includes(t) ||
        q.employeeName?.toLowerCase().includes(t) ||
        q.clientCompany?.toLowerCase().includes(t)
      );
    }
    setFiltered(list);
  };

  // Calculate grand total with per-service discounts
  const calculateGrandTotal = (qt) => {
    if (!qt.services || qt.services.length === 0) return 0;
    
    // Calculate subtotal with per-service discounts
    const subtotal = qt.services.reduce((sum, svc) => {
      const discount = svc.discount || 0;
      const serviceSubtotal = svc.quantity * svc.price;
      const serviceDiscountAmount = serviceSubtotal * discount / 100;
      return sum + (serviceSubtotal - serviceDiscountAmount);
    }, 0);
    
    // Apply overall discount
    const overallDiscount = subtotal * (qt.discount || 0) / 100;
    
    // Apply tax
    const tax = (subtotal - overallDiscount) * (qt.tax || 0) / 100;
    
    return subtotal - overallDiscount + tax;
  };

  /* ── Approve ── */
  const handleApprove = async (qt) => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Approve Quotation?',
      html: `<p style="color:#ccc">Ref: <strong style="color:#b14cff">${qt.quotationNumber}</strong><br>Employee: ${qt.employeeName}<br>Client: ${qt.clientName}</p>
             <p style="color:#aaa;font-size:13px;margin-top:10px">Approve karne se authorized signature aur company stamp auto-fill ho jayenga.</p>`,
      showCancelButton: true,
      confirmButtonText: 'Approve ✓',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#4b5563',
      background: '#0d0d0d',
      color: '#fff',
    });
    if (!result.isConfirmed) return;

    setActionLoading(qt.id);
    try {
      const res  = await fetch('/api/employee-quotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: qt.id, approvalStatus: 'Approved' }),
      });
      const data = await res.json();
      if (data.success) {
        await Swal.fire({ icon: 'success', title: 'Approved!', text: 'Quotation approve ho gayi. Employee ab ise share kar sakta hai.', timer: 2000, showConfirmButton: false, background: '#0d0d0d', color: '#fff' });
        fetchAll();
        if (previewQt?.id === qt.id) setPreviewQt(prev => ({ ...prev, approvalStatus: 'Approved', authorizedSignatureName: 'Muhammad Aqdas', authorizedSignatureTitle: 'CEO', companyStampLabel: 'CODEVERZA' }));
      } else throw new Error(data.message);
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Failed', text: e.message, background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Reject ── */
  const handleReject = async (qt) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Reject Quotation?',
      html: `<p style="color:#ccc">Ref: <strong style="color:#ef4444">${qt.quotationNumber}</strong></p>`,
      input: 'textarea',
      inputLabel: 'Rejection reason (optional)',
      inputPlaceholder: 'Reason for rejection...',
      inputAttributes: { style: 'background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;padding:10px;font-family:inherit' },
      showCancelButton: true,
      confirmButtonText: 'Reject ✕',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#4b5563',
      background: '#0d0d0d',
      color: '#fff',
    });
    if (!result.isConfirmed) return;

    setActionLoading(qt.id);
    try {
      const res  = await fetch('/api/employee-quotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: qt.id, approvalStatus: 'Rejected', rejectionReason: result.value || '' }),
      });
      const data = await res.json();
      if (data.success) {
        await Swal.fire({ icon: 'info', title: 'Rejected', timer: 1800, showConfirmButton: false, background: '#0d0d0d', color: '#fff' });
        fetchAll();
        if (previewQt?.id === qt.id) setPreviewQt(null);
      } else throw new Error(data.message);
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Failed', text: e.message, background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Edit save ── */
  const handleEditSave = async (updatedQt) => {
    setActionLoading(updatedQt.id);
    try {
      const res  = await fetch('/api/employee-quotations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQt),
      });
      const data = await res.json();
      if (data.success) {
        setEditQt(null);
        await Swal.fire({ icon: 'success', title: 'Saved', timer: 1500, showConfirmButton: false, background: '#0d0d0d', color: '#fff' });
        fetchAll();
      } else throw new Error(data.message);
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Save Failed', text: e.message, background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
    } finally {
      setActionLoading(null);
    }
  };

  const approvalPill = (status) => {
    const map = { Pending: 'eq-pill-pending', Approved: 'eq-pill-approved', Rejected: 'eq-pill-rejected' };
    return <span className={`eq-pill ${map[status] || 'eq-pill-pending'}`}>{status}</span>;
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    try {
      // Handle Firestore Timestamp
      const date = d?.toDate ? d.toDate() : (d?.seconds ? new Date(d.seconds * 1000) : new Date(d));
      if (isNaN(date.getTime())) return '—';
      const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${dateStr}, ${timeStr}`;
    } catch (e) {
      console.error('Date formatting error:', e, d);
      return '—';
    }
  };

  const fmtCur = (n, c = 'PKR') => {
    if (!n) return '—';
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: c, minimumFractionDigits: 0 }).format(n);
  };

  const pendingCount  = quotations.filter(q => q.approvalStatus === 'Pending').length;
  const approvedCount = quotations.filter(q => q.approvalStatus === 'Approved').length;
  const rejectedCount = quotations.filter(q => q.approvalStatus === 'Rejected').length;

  if (loading) return null;

  return (
    <div className="eq-approval-page">

      {/* ── Page Header ── */}
      <div className="eq-page-header">
        <div className="eq-page-header-left">
          <button className="eq-back-btn" onClick={() => router.push('/admin/quotations')}>
            <FiArrowLeft /> Back to Quotations
          </button>
          <h1>Employee Quotation Approvals</h1>
          <p>Review, edit, approve or reject employee-created quotations</p>
        </div>
        <button className="eq-refresh-btn" onClick={fetchAll} title="Refresh">
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="eq-stats">
        <div className="eq-stat-card eq-stat-pending">
          <h3>{pendingCount}</h3>
          <p>Pending Review</p>
        </div>
        <div className="eq-stat-card eq-stat-approved">
          <h3>{approvedCount}</h3>
          <p>Approved</p>
        </div>
        <div className="eq-stat-card eq-stat-rejected">
          <h3>{rejectedCount}</h3>
          <p>Rejected</p>
        </div>
        <div className="eq-stat-card">
          <h3>{quotations.length}</h3>
          <p>Total</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="eq-filters">
        <div className="eq-search-box">
          <FiSearch className="eq-search-icon" />
          <input
            type="text"
            placeholder="Search by ref, client, employee..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="eq-filter-tabs">
          {['Pending', 'Approved', 'Rejected', 'All'].map(s => (
            <button key={s} className={statusFilter === s ? 'eq-filter-tab active' : 'eq-filter-tab'} onClick={() => setStatusFilter(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="eq-empty">
          <p>{statusFilter === 'Pending' ? 'Koi pending quotation nahi hai 🎉' : 'Koi quotation nahi mili'}</p>
        </div>
      ) : (
        <div className="eq-table-container">
          <table className="eq-table">
            <thead>
              <tr>
                <th>Ref No</th>
                <th>Employee</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(qt => (
                <tr key={qt.id}>
                  <td>
                    <span className="eq-ref-no">{qt.quotationNumber}</span>
                  </td>
                  <td>
                    <div className="eq-employee-cell">
                      <span className="eq-emp-name">{qt.employeeName}</span>
                      <span className="eq-emp-email">{qt.employeeEmail}</span>
                    </div>
                  </td>
                  <td>
                    <div className="eq-client-cell">
                      <span className="eq-client-name">{qt.clientName}</span>
                      {qt.clientCompany && <span className="eq-client-co">{qt.clientCompany}</span>}
                    </div>
                  </td>
                  <td className="eq-amount">{fmtCur(calculateGrandTotal(qt), qt.currency)}</td>
                  <td className="eq-date">{fmtDate(qt.createdAt)}</td>
                  <td>{approvalPill(qt.approvalStatus)}</td>
                  <td>
                    <div className="eq-row-actions">
                      <button className="eq-action-btn eq-btn-view" title="Preview" onClick={() => setPreviewQt(qt)}>
                        <FiEye />
                      </button>
                      <button className="eq-action-btn eq-btn-edit" title="Edit" onClick={() => setEditQt({ ...qt })}>
                        <FiEdit2 />
                      </button>
                      {qt.approvalStatus === 'Pending' && (
                        <>
                          <button
                            className="eq-action-btn eq-btn-approve"
                            title="Approve"
                            disabled={actionLoading === qt.id}
                            onClick={() => handleApprove(qt)}
                          >
                            {actionLoading === qt.id ? <span className="eq-spinner" /> : <FiCheck />}
                          </button>
                          <button
                            className="eq-action-btn eq-btn-reject"
                            title="Reject"
                            disabled={actionLoading === qt.id}
                            onClick={() => handleReject(qt)}
                          >
                            <FiX />
                          </button>
                        </>
                      )}
                      {qt.approvalStatus === 'Approved' && (
                        <span className="eq-approved-label">✓ Approved</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Preview Modal ── */}
      {previewQt && (
        <QuotationPreviewModal
          quotation={previewQt}
          onClose={() => setPreviewQt(null)}
          onApprove={() => handleApprove(previewQt)}
          onReject={() => handleReject(previewQt)}
          actionLoading={actionLoading === previewQt.id}
        />
      )}

      {/* ── Edit Drawer ── */}
      {editQt && (
        <QuotationEditDrawer
          quotation={editQt}
          onClose={() => setEditQt(null)}
          onSave={handleEditSave}
          saving={actionLoading === editQt.id}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PREVIEW MODAL
═══════════════════════════════════════════════════════════════ */
function QuotationPreviewModal({ quotation: qt, onClose, onApprove, onReject, actionLoading }) {
  const [employeeEmail, setEmployeeEmail] = useState(qt.employeeEmail || '');
  const [employeePhone, setEmployeePhone] = useState(qt.employeePhone || '');

  // Fetch employee email if missing
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!qt.employeeEmail && qt.employeeId) {
        try {
          const res = await fetch(`/api/employees?id=${qt.employeeId}`);
          const data = await res.json();
          if (data.success && data.employee) {
            setEmployeeEmail(data.employee.companyEmail || data.employee.email || '');
            setEmployeePhone(qt.employeePhone || data.employee.contactNumber || '');
          }
        } catch (err) {
          console.error('Failed to fetch employee data:', err);
        }
      } else {
        setEmployeeEmail(qt.employeeEmail || '');
        setEmployeePhone(qt.employeePhone || '');
      }
    };
    fetchEmployeeData();
  }, [qt.employeeId, qt.employeeEmail, qt.employeePhone]);
  
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
    return (qt.services || []).reduce((t, s) => {
      const c = s.currency || qt.currency || 'PKR';
      const discount = s.discount || 0;
      const subtotal = s.quantity * s.price;
      const discountAmount = subtotal * discount / 100;
      const total = subtotal - discountAmount;
      t[c] = (t[c] || 0) + total;
      return t;
    }, {});
  };

  return (
    <div className="eq-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="eq-preview-modal">
        {/* Modal header */}
        <div className="eq-modal-header">
          <div>
            <h3>{qt.quotationNumber}</h3>
            <span className={`eq-pill ${qt.approvalStatus === 'Approved' ? 'eq-pill-approved' : qt.approvalStatus === 'Rejected' ? 'eq-pill-rejected' : 'eq-pill-pending'}`}>
              {qt.approvalStatus}
            </span>
          </div>
          <div className="eq-modal-header-actions">
            {qt.approvalStatus === 'Pending' && (
              <>
                <button className="eq-modal-approve-btn" disabled={actionLoading} onClick={onApprove}>
                  {actionLoading ? <span className="eq-spinner" /> : <FiCheck />} Approve
                </button>
                <button className="eq-modal-reject-btn" disabled={actionLoading} onClick={onReject}>
                  <FiX /> Reject
                </button>
              </>
            )}
            <button className="eq-modal-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Employee info bar */}
        <div className="eq-modal-emp-bar">
          <FiUser />
          <span><strong>{qt.employeeName}</strong></span>
          <span className="eq-modal-emp-sep">·</span>
          <span>{qt.employeeDesignation}</span>
          <span className="eq-modal-emp-sep">·</span>
          <span>{employeeEmail || 'N/A'}</span>
          {employeePhone && <><span className="eq-modal-emp-sep">·</span><span>{employeePhone}</span></>}
        </div>

        {/* Document */}
        <div className="eq-modal-body">
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
                    {employeeEmail && <p><strong>Email</strong>{employeeEmail}</p>}
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
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EDIT DRAWER — admin can modify any field before approving
═══════════════════════════════════════════════════════════════ */
function QuotationEditDrawer({ quotation, onClose, onSave, saving }) {
  const [form, setForm] = useState({ ...quotation });

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const setService = (idx, field, val) => {
    const services = [...form.services];
    services[idx] = { ...services[idx], [field]: val };
    if (field === 'quantity' || field === 'price') services[idx].total = services[idx].quantity * services[idx].price;
    setForm(p => ({ ...p, services }));
  };

  const handleSave = () => onSave(form);

  // Calculate totals
  const subtotal = (form.services || []).reduce((sum, svc) => sum + (svc.quantity * svc.price), 0);
  const discountAmt = (subtotal * (form.discount || 0)) / 100;
  const taxableAmt = subtotal - discountAmt;
  const taxAmt = (taxableAmt * (form.tax || 0)) / 100;
  const grandTotal = taxableAmt + taxAmt;

  const fmtCur = (n) => {
    if (n === 0) return 'FREE';
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: form.currency || 'PKR', minimumFractionDigits: 0 }).format(n);
  };

  return (
    <div className="eq-drawer-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="eq-drawer">
        <div className="eq-drawer-header">
          <h3>Edit Quotation — {quotation.quotationNumber}</h3>
          <button className="eq-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="eq-drawer-body">
          {/* Client */}
          <div className="eq-drawer-section">
            <h4>Client Details</h4>
            <div className="eq-drawer-grid">
              {[['clientName', 'Client Name'], ['clientEmail', 'Client Email'], ['clientPhone', 'Client Phone'], ['clientCompany', 'Company'], ['clientAddress', 'Address']].map(([k, label]) => (
                <div key={k} className={`eq-drawer-field ${k === 'clientAddress' ? 'eq-drawer-full' : ''}`}>
                  <label>{label}</label>
                  <input type="text" value={form[k] || ''} onChange={e => setField(k, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="eq-drawer-section">
            <h4>Dates</h4>
            <div className="eq-drawer-grid">
              <div className="eq-drawer-field"><label>Issue Date</label><input type="date" value={form.issueDate || ''} onChange={e => setField('issueDate', e.target.value)} /></div>
              <div className="eq-drawer-field"><label>Valid Until</label><input type="date" value={form.validityDate || ''} onChange={e => setField('validityDate', e.target.value)} /></div>
              <div className="eq-drawer-field">
                <label>Status</label>
                <select value={form.status || 'Draft'} onChange={e => setField('status', e.target.value)}>
                  {['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="eq-drawer-section">
            <h4>Services</h4>
            {(form.services || []).map((svc, idx) => (
              <div key={idx} className="eq-drawer-service">
                <div className="eq-drawer-grid">
                  <div className="eq-drawer-field eq-drawer-full"><label>Service Name</label><input type="text" value={svc.name} onChange={e => setService(idx, 'name', e.target.value)} /></div>
                  <div className="eq-drawer-field eq-drawer-full"><label>Description</label><input type="text" value={svc.description || ''} onChange={e => setService(idx, 'description', e.target.value)} /></div>
                  <div className="eq-drawer-field"><label>Qty</label><input type="number" value={svc.quantity} min="1" onChange={e => setService(idx, 'quantity', parseFloat(e.target.value) || 1)} /></div>
                  <div className="eq-drawer-field"><label>Price</label><input type="number" value={svc.price} min="0" onChange={e => setService(idx, 'price', parseFloat(e.target.value) || 0)} /></div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing: Discount & Tax */}
          <div className="eq-drawer-section">
            <h4>Pricing</h4>
            <div className="eq-drawer-grid">
              <div className="eq-drawer-field">
                <label>Discount (%)</label>
                <input 
                  type="number" 
                  value={form.discount || 0} 
                  min="0" 
                  max="100" 
                  onChange={e => setField('discount', parseFloat(e.target.value) || 0)} 
                />
              </div>
              <div className="eq-drawer-field">
                <label>Tax (%)</label>
                <input 
                  type="number" 
                  value={form.tax || 0} 
                  min="0" 
                  max="100" 
                  onChange={e => setField('tax', parseFloat(e.target.value) || 0)} 
                />
              </div>
            </div>

            {/* Live Pricing Summary */}
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: 'rgba(177, 76, 255, 0.05)',
              border: '1px solid rgba(177, 76, 255, 0.2)',
              borderRadius: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: '#fff' }}>
                <span>Subtotal:</span>
                <strong>{fmtCur(subtotal)}</strong>
              </div>
              {form.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: '#ef4444' }}>
                  <span>Discount ({form.discount}%):</span>
                  <strong>− {fmtCur(discountAmt)}</strong>
                </div>
              )}
              {form.tax > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: '#22c55e' }}>
                  <span>Tax ({form.tax}%):</span>
                  <strong>+ {fmtCur(taxAmt)}</strong>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0 0 0',
                marginTop: '8px',
                borderTop: '1px solid rgba(177, 76, 255, 0.3)',
                fontSize: '16px',
                fontWeight: '700',
                color: '#b14cff'
              }}>
                <span>Grand Total:</span>
                <span>{fmtCur(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Extra info */}
          <div className="eq-drawer-section">
            <h4>Additional Info</h4>
            <div className="eq-drawer-grid">
              <div className="eq-drawer-field"><label>Payment Terms</label><textarea rows="3" value={form.paymentTerms || ''} onChange={e => setField('paymentTerms', e.target.value)} /></div>
              <div className="eq-drawer-field"><label>Project Timeline</label><textarea rows="3" value={form.projectTimeline || ''} onChange={e => setField('projectTimeline', e.target.value)} /></div>
              <div className="eq-drawer-field eq-drawer-full"><label>Notes</label><textarea rows="3" value={form.notes || ''} onChange={e => setField('notes', e.target.value)} /></div>
              <div className="eq-drawer-field eq-drawer-full"><label>Terms &amp; Conditions</label><textarea rows="5" value={form.termsAndConditions || ''} onChange={e => setField('termsAndConditions', e.target.value)} /></div>
            </div>
          </div>
        </div>
        <div className="eq-drawer-footer">
          <button className="eq-drawer-cancel" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="eq-drawer-save" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="eq-spinner" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
