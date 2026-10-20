'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getEmployeeAuth } from '@/lib/employeeAuth';
import Swal from 'sweetalert2';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft } from 'react-icons/fi';

const DRAFT_KEY = 'emp_quotation_draft';

const defaultService = () => ({
  name: '',
  description: '',
  quantity: 1,
  price: 0,
  currency: 'PKR',
  billingCycle: 'One-Time',
  total: 0,
});

const defaultForm = {
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  clientCompany: '',
  clientAddress: '',
  issueDate: new Date().toISOString().split('T')[0],
  validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency: 'PKR',
  services: [defaultService()],
  discount: 0,
  tax: 0,
  paymentTerms: '50% advance, 50% on completion',
  projectTimeline: '2-4 weeks',
  notes: '',
  termsAndConditions:
    'This quotation is valid for 30 days from the issue date.\nPayment terms must be agreed upon before project commencement.\nPrices are subject to change without notice after validity period.',
};

const SERVICE_TEMPLATES = [
  { name: 'Website Development', description: 'Custom website design and development', price: 50000, billingCycle: 'One-Time' },
  { name: 'Domain Registration', description: '.com domain registration', price: 1500, billingCycle: 'Annually' },
  { name: 'Web Hosting', description: 'Shared hosting with SSL', price: 2000, billingCycle: 'Annually' },
  { name: 'Business Email', description: 'Professional email hosting', price: 500, billingCycle: 'Monthly' },
  { name: 'SEO Optimization', description: 'On-page and technical SEO', price: 15000, billingCycle: 'One-Time' },
  { name: 'Maintenance & Support', description: 'Monthly website maintenance', price: 5000, billingCycle: 'Monthly' },
];

const BILLING_CYCLES = ['One-Time', 'Monthly', 'Half-Yearly', 'Annually', '2 Years'];

export default function EmployeeCreateQuotationPage() {
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load employee auth + restore draft
  useEffect(() => {
    const emp = getEmployeeAuth();
    if (!emp) { router.push('/employee/login'); return; }
    if (!emp.permissions?.quotations?.add) {
      Swal.fire({ icon: 'error', title: 'Access Denied', text: 'You do not have permission to create quotations.', background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' })
        .then(() => router.push('/employee/dashboard'));
      return;
    }
    setEmployee(emp);

    // Restore draft
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) setForm(JSON.parse(raw));
    } catch {}

    setMounted(true);
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (!mounted) return;
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch {}
  }, [form, mounted]);

  /* ── helpers ── */
  const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  const setService = (idx, field, value) => {
    const services = [...form.services];
    services[idx] = { ...services[idx], [field]: value };
    if (field === 'quantity' || field === 'price') {
      services[idx].total = services[idx].quantity * services[idx].price;
    }
    setForm(prev => ({ ...prev, services }));
  };

  const applyTemplate = (idx, tpl) => {
    const services = [...form.services];
    services[idx] = { ...services[idx], name: tpl.name, description: tpl.description, price: tpl.price, billingCycle: tpl.billingCycle, quantity: 1, total: tpl.price };
    setForm(prev => ({ ...prev, services }));
  };

  const addService = () => setForm(prev => ({ ...prev, services: [...prev.services, defaultService()] }));
  const removeService = (idx) => {
    if (form.services.length === 1) return;
    setForm(prev => ({ ...prev, services: prev.services.filter((_, i) => i !== idx) }));
  };

  const subtotal = () => form.services.reduce((s, sv) => s + sv.quantity * sv.price, 0);
  const discountAmt = () => subtotal() * form.discount / 100;
  const taxAmt = () => (subtotal() - discountAmt()) * form.tax / 100;
  const grandTotal = () => subtotal() - discountAmt() + taxAmt();

  const fmt = (n) => new Intl.NumberFormat('en-PK').format(n);
  const fmtCur = (n, c = 'PKR') => {
    if (n === 0) return 'FREE';
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: c, minimumFractionDigits: 0 }).format(n);
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.clientName.trim()) return Swal.fire({ icon: 'warning', title: 'Missing Client Name', background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
    if (!form.clientEmail.trim()) return Swal.fire({ icon: 'warning', title: 'Missing Client Email', background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
    const validServices = form.services.filter(s => s.name.trim());
    if (!validServices.length) return Swal.fire({ icon: 'warning', title: 'No Services', text: 'Please add at least one service.', background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });

    setSaving(true);
    try {
      const payload = {
        ...form,
        services: validServices,
        employeeId:          employee.id,
        employeeName:        employee.name,
        employeeEmail:       employee.companyEmail || employee.email || employee.personalEmail || '',
        employeePhone:       employee.contactNumber || '',
        employeeDesignation: employee.designation || '',
      };

      const res  = await fetch('/api/employee-quotations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();

      if (data.success) {
        try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
        await Swal.fire({
          icon: 'success',
          title: 'Quotation Submitted!',
          html: `<p style="color:#fff">Ref: <strong style="color:#b14cff">${data.data.quotationNumber}</strong></p><p style="color:#aaa;font-size:13px">This can be sent only after admin approval.</p>`,
          background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff', confirmButtonText: 'View My Quotations',
        });
        router.push('/employee/dashboard');
      } else {
        Swal.fire({ icon: 'error', title: 'Failed', text: data.message, background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
    } finally {
      setSaving(false);
    }
  };

  if (!employee) return null;

  return (
    <div className="emp-qt-create-page">
      {/* ── Header ── */}
      <div className="emp-qt-header">
        <button className="emp-qt-back-btn" onClick={() => router.push('/employee/dashboard')}>
          <FiArrowLeft /> Back to Dashboard
        </button>
        <div>
          <h1>Create Quotation</h1>
          <p>Create a quotation for the client — it can be sent after admin approval.</p>
        </div>
      </div>

      {/* ── Approval notice ── */}
      <div className="emp-qt-notice">
        <span className="emp-qt-notice-icon">ℹ️</span>
        <span>The quotation you create will first be reviewed by the admin. You can share it only after it has been approved.</span>
      </div>

      <form onSubmit={handleSubmit} className="emp-qt-form">

        {/* ── Client Details ── */}
        <div className="emp-qt-section">
          <h2>Client Details</h2>
          <div className="emp-qt-grid">
            <div className="emp-qt-field">
              <label>Client Name *</label>
              <input type="text" value={form.clientName} onChange={e => setField('clientName', e.target.value)} placeholder="Client / Company name" required />
            </div>
            <div className="emp-qt-field">
              <label>Client Email *</label>
              <input type="email" value={form.clientEmail} onChange={e => setField('clientEmail', e.target.value)} placeholder="client@example.com" required />
            </div>
            <div className="emp-qt-field">
              <label>Client Phone</label>
              <input type="tel" value={form.clientPhone} onChange={e => setField('clientPhone', e.target.value)} placeholder="+92 300 0000000" />
            </div>
            <div className="emp-qt-field">
              <label>Company Name</label>
              <input type="text" value={form.clientCompany} onChange={e => setField('clientCompany', e.target.value)} placeholder="Company (optional)" />
            </div>
            <div className="emp-qt-field emp-qt-full">
              <label>Address</label>
              <input type="text" value={form.clientAddress} onChange={e => setField('clientAddress', e.target.value)} placeholder="Client address (optional)" />
            </div>
          </div>
        </div>

        {/* ── Quotation Dates ── */}
        <div className="emp-qt-section">
          <h2>Quotation Info</h2>
          <div className="emp-qt-grid">
            <div className="emp-qt-field">
              <label>Issue Date</label>
              <input type="date" value={form.issueDate} onChange={e => setField('issueDate', e.target.value)} />
            </div>
            <div className="emp-qt-field">
              <label>Valid Until</label>
              <input type="date" value={form.validityDate} onChange={e => setField('validityDate', e.target.value)} />
            </div>
            <div className="emp-qt-field">
              <label>Default Currency</label>
              <select value={form.currency} onChange={e => setField('currency', e.target.value)}>
                <option value="PKR">PKR – Pakistani Rupee</option>
                <option value="USD">USD – US Dollar</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Services ── */}
        <div className="emp-qt-section">
          <div className="emp-qt-section-header">
            <h2>Services & Deliverables</h2>
            <button type="button" className="emp-qt-add-btn" onClick={addService}><FiPlus /> Add Service</button>
          </div>

          {form.services.map((svc, idx) => (
            <div key={idx} className="emp-qt-service-card">
              <div className="emp-qt-service-top">
                <span className="emp-qt-service-label">Service #{idx + 1}</span>
                {form.services.length > 1 && (
                  <button type="button" className="emp-qt-remove-btn" onClick={() => removeService(idx)}><FiTrash2 /></button>
                )}
              </div>

              {/* Template picker */}
              <div className="emp-qt-template-row">
                <label>Quick Template:</label>
                <select defaultValue="" onChange={e => { if (e.target.value) applyTemplate(idx, SERVICE_TEMPLATES[parseInt(e.target.value)]); e.target.value = ''; }}>
                  <option value="">— Select template —</option>
                  {SERVICE_TEMPLATES.map((t, ti) => <option key={ti} value={ti}>{t.name}</option>)}
                </select>
              </div>

              <div className="emp-qt-service-grid">
                <div className="emp-qt-field">
                  <label>Service Name *</label>
                  <input type="text" value={svc.name} onChange={e => setService(idx, 'name', e.target.value)} placeholder="Service name" />
                </div>
                <div className="emp-qt-field emp-qt-full">
                  <label>Description</label>
                  <input type="text" value={svc.description} onChange={e => setService(idx, 'description', e.target.value)} placeholder="Brief description (optional)" />
                </div>
                <div className="emp-qt-field">
                  <label>Qty</label>
                  <input type="number" value={svc.quantity} min="1" onChange={e => setService(idx, 'quantity', parseFloat(e.target.value) || 1)} />
                </div>
                <div className="emp-qt-field">
                  <label>Unit Price</label>
                  <div className="emp-qt-price-row">
                    <input type="number" value={svc.price} min="0" onChange={e => setService(idx, 'price', parseFloat(e.target.value) || 0)} />
                    <select value={svc.currency || form.currency} onChange={e => setService(idx, 'currency', e.target.value)}>
                      <option value="PKR">PKR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                <div className="emp-qt-field">
                  <label>Billing Cycle</label>
                  <select value={svc.billingCycle} onChange={e => setService(idx, 'billingCycle', e.target.value)}>
                    {BILLING_CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="emp-qt-field emp-qt-total-display">
                  <label>Line Total</label>
                  <p className="emp-qt-line-total">{fmtCur(svc.quantity * svc.price, svc.currency || form.currency)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Pricing ── */}
        <div className="emp-qt-section">
          <h2>Pricing Summary</h2>
          <div className="emp-qt-grid">
            <div className="emp-qt-field">
              <label>Discount (%)</label>
              <input type="number" value={form.discount} min="0" max="100" onChange={e => setField('discount', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="emp-qt-field">
              <label>Tax (%)</label>
              <input type="number" value={form.tax} min="0" max="100" onChange={e => setField('tax', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="emp-qt-totals">
            <div className="emp-qt-total-row"><span>Subtotal</span><span>{fmtCur(subtotal(), form.currency)}</span></div>
            {form.discount > 0 && <div className="emp-qt-total-row emp-qt-discount"><span>Discount ({form.discount}%)</span><span>− {fmtCur(discountAmt(), form.currency)}</span></div>}
            {form.tax > 0 && <div className="emp-qt-total-row"><span>Tax ({form.tax}%)</span><span>{fmtCur(taxAmt(), form.currency)}</span></div>}
            <div className="emp-qt-total-row emp-qt-grand"><span>Grand Total</span><span>{fmtCur(grandTotal(), form.currency)}</span></div>
          </div>
        </div>

        {/* ── Payment & Timeline ── */}
        <div className="emp-qt-section">
          <h2>Payment & Timeline</h2>
          <div className="emp-qt-grid">
            <div className="emp-qt-field">
              <label>Payment Terms</label>
              <textarea rows="3" value={form.paymentTerms} onChange={e => setField('paymentTerms', e.target.value)} placeholder="e.g. 50% advance, 50% on completion" />
            </div>
            <div className="emp-qt-field">
              <label>Project Timeline</label>
              <textarea rows="3" value={form.projectTimeline} onChange={e => setField('projectTimeline', e.target.value)} placeholder="e.g. 2–4 weeks" />
            </div>
          </div>
        </div>

        {/* ── Notes & T&C ── */}
        <div className="emp-qt-section">
          <h2>Notes & Terms</h2>
          <div className="emp-qt-field emp-qt-full" style={{ marginBottom: '16px' }}>
            <label>Notes</label>
            <textarea rows="3" value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="Any additional notes for the client..." />
          </div>
          <div className="emp-qt-field emp-qt-full">
            <label>Terms & Conditions</label>
            <textarea rows="5" value={form.termsAndConditions} onChange={e => setField('termsAndConditions', e.target.value)} placeholder="Terms and conditions..." />
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="emp-qt-actions">
          <button type="button" className="emp-qt-cancel-btn" onClick={() => router.push('/employee/dashboard')} disabled={saving}>Cancel</button>
          <button type="submit" className="emp-qt-submit-btn" disabled={saving}>
            {saving ? <><span className="emp-qt-spinner" /> Submitting...</> : <><FiSave /> Submit for Approval</>}
          </button>
        </div>
      </form>
    </div>
  );
}
