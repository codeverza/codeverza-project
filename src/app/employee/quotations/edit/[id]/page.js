'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getEmployeeAuth } from '@/lib/employeeAuth';
import Swal from 'sweetalert2';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft } from 'react-icons/fi';
import '../../quotations.css';

const defaultService = () => ({
  name: '',
  description: '',
  quantity: 1,
  price: 0,
  currency: 'PKR',
  billingCycle: 'One-Time',
  total: 0,
});

const SERVICE_TEMPLATES = [
  { name: 'Website Development', description: 'Custom website design and development', price: 50000, billingCycle: 'One-Time' },
  { name: 'Domain Registration', description: '.com domain registration', price: 1500, billingCycle: 'Annually' },
  { name: 'Web Hosting', description: 'Shared hosting with SSL', price: 2000, billingCycle: 'Annually' },
  { name: 'Business Email', description: 'Professional email hosting', price: 500, billingCycle: 'Monthly' },
  { name: 'SEO Optimization', description: 'On-page and technical SEO', price: 15000, billingCycle: 'One-Time' },
  { name: 'Maintenance & Support', description: 'Monthly website maintenance', price: 5000, billingCycle: 'Monthly' },
];

const BILLING_CYCLES = ['One-Time', 'Monthly', 'Half-Yearly', 'Annually', '2 Years'];

export default function EmployeeEditQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const [employee, setEmployee] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load employee auth + fetch quotation
  useEffect(() => {
    const emp = getEmployeeAuth();
    if (!emp) { router.push('/employee/login'); return; }
    // If employee can add quotations, they can also edit their pending quotations
    if (!emp.permissions?.quotations?.add && !emp.permissions?.quotations?.edit) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Access Denied', 
        text: 'You do not have permission to edit the quotation.', 
        background: '#0d0d0d', 
        color: '#fff', 
        confirmButtonColor: '#b14cff' 
      }).then(() => router.push('/employee/dashboard'));
      return;
    }
    setEmployee(emp);
    fetchQuotation();
  }, [params.id]);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/employee-quotations?id=${params.id}`);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to load quotation');
      }

      const qt = data.data;

      // Check if quotation can be edited (only pending or rejected)
      if (qt.approvalStatus !== 'Pending' && qt.approvalStatus !== 'Rejected') {
        await Swal.fire({
          icon: 'warning',
          title: 'Cannot Edit',
          text: 'Only pending or rejected quotations can be edited.',
          background: '#0d0d0d',
          color: '#fff',
          confirmButtonColor: '#b14cff'
        });
        router.push('/employee/dashboard');
        return;
      }

      setQuotation(qt);
      
      // Convert Firestore timestamp to date string if needed
      const issueDate = qt.issueDate ? (typeof qt.issueDate === 'string' ? qt.issueDate : new Date(qt.issueDate).toISOString().split('T')[0]) : '';
      const validityDate = qt.validityDate ? (typeof qt.validityDate === 'string' ? qt.validityDate : new Date(qt.validityDate).toISOString().split('T')[0]) : '';

      setForm({
        clientName: qt.clientName || '',
        clientEmail: qt.clientEmail || '',
        clientPhone: qt.clientPhone || '',
        clientCompany: qt.clientCompany || '',
        clientAddress: qt.clientAddress || '',
        issueDate,
        validityDate,
        currency: qt.currency || 'PKR',
        services: qt.services?.length ? qt.services.map(s => ({
          ...s,
          total: s.quantity * s.price
        })) : [defaultService()],
        discount: qt.discount || 0,
        tax: qt.tax || 0,
        paymentTerms: qt.paymentTerms || '',
        projectTimeline: qt.projectTimeline || '',
        notes: qt.notes || '',
        termsAndConditions: qt.termsAndConditions || '',
      });

    } catch (error) {
      console.error('Error fetching quotation:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to load quotation',
        background: '#0d0d0d',
        color: '#fff',
        confirmButtonColor: '#b14cff'
      });
      router.push('/employee/dashboard');
    } finally {
      setLoading(false);
    }
  };

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
    services[idx] = { 
      ...services[idx], 
      name: tpl.name, 
      description: tpl.description, 
      price: tpl.price, 
      billingCycle: tpl.billingCycle, 
      quantity: 1, 
      total: tpl.price 
    };
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

  const fmtCur = (n, c = 'PKR') => {
    if (n === 0) return 'FREE';
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: c, minimumFractionDigits: 0 }).format(n);
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.clientName.trim()) {
      return Swal.fire({ 
        icon: 'warning', 
        title: 'Missing Client Name', 
        background: '#0d0d0d', 
        color: '#fff', 
        confirmButtonColor: '#b14cff' 
      });
    }
    
    if (!form.clientEmail.trim()) {
      return Swal.fire({ 
        icon: 'warning', 
        title: 'Missing Client Email', 
        background: '#0d0d0d', 
        color: '#fff', 
        confirmButtonColor: '#b14cff' 
      });
    }

    const validServices = form.services.filter(s => s.name.trim());
    if (!validServices.length) {
      return Swal.fire({ 
        icon: 'warning', 
        title: 'No Services', 
        text: 'Please add at least one service.', 
        background: '#0d0d0d', 
        color: '#fff', 
        confirmButtonColor: '#b14cff' 
      });
    }

    setSaving(true);
    try {
      const payload = {
        id: params.id,
        ...form,
        services: validServices,
      };

      const res = await fetch('/api/employee-quotations', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      
      const data = await res.json();

      if (data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Quotation Updated!',
          html: `<p style="color:#fff">Ref: <strong style="color:#b14cff">${quotation.quotationNumber}</strong></p><p style="color:#aaa;font-size:13px">Changes saved successfully. Admin ab updated quotation review karega.</p>`,
          background: '#0d0d0d', 
          color: '#fff', 
          confirmButtonColor: '#b14cff', 
          confirmButtonText: 'Back to Dashboard',
        });
        router.push('/employee/dashboard');
      } else {
        Swal.fire({ 
          icon: 'error', 
          title: 'Update Failed', 
          text: data.message, 
          background: '#0d0d0d', 
          color: '#fff', 
          confirmButtonColor: '#b14cff' 
        });
      }
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: err.message, 
        background: '#0d0d0d', 
        color: '#fff', 
        confirmButtonColor: '#b14cff' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (!employee || loading || !form) {
    return (
      <div className="emp-qt-create-page">
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
          <div className="emp-qt-spinner" style={{ width: '32px', height: '32px', margin: '0 auto 20px' }} />
          <p>Loading quotation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="emp-qt-create-page">
      {/* ── Header ── */}
      <div className="emp-qt-header">
        <button className="emp-qt-back-btn" onClick={() => router.push('/employee/dashboard')}>
          <FiArrowLeft /> Back to Dashboard
        </button>
        <div>
          <h1>Edit Quotation</h1>
          <p>
            Editing <strong style={{ color: '#b14cff' }}>{quotation.quotationNumber}</strong> — 
            changes admin ko show honge
          </p>
        </div>
      </div>

      {/* ── Edit notice ── */}
      <div className="emp-qt-notice">
        <span className="emp-qt-notice-icon">✏️</span>
        <span>
          Aap is pending quotation ko edit kar sakte hain. Jab save karenge to admin ko updated version 
          dikhai dega approval ke liye.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="emp-qt-form">

        {/* ── Client Details ── */}
        <div className="emp-qt-section">
          <h2>Client Details</h2>
          <div className="emp-qt-grid">
            <div className="emp-qt-field">
              <label>Client Name *</label>
              <input 
                type="text" 
                value={form.clientName} 
                onChange={e => setField('clientName', e.target.value)} 
                placeholder="Client / Company name" 
                required 
              />
            </div>
            <div className="emp-qt-field">
              <label>Client Email *</label>
              <input 
                type="email" 
                value={form.clientEmail} 
                onChange={e => setField('clientEmail', e.target.value)} 
                placeholder="client@example.com" 
                required 
              />
            </div>
            <div className="emp-qt-field">
              <label>Client Phone</label>
              <input 
                type="tel" 
                value={form.clientPhone} 
                onChange={e => setField('clientPhone', e.target.value)} 
                placeholder="+92 300 0000000" 
              />
            </div>
            <div className="emp-qt-field">
              <label>Company Name</label>
              <input 
                type="text" 
                value={form.clientCompany} 
                onChange={e => setField('clientCompany', e.target.value)} 
                placeholder="Company (optional)" 
              />
            </div>
            <div className="emp-qt-field emp-qt-full">
              <label>Address</label>
              <input 
                type="text" 
                value={form.clientAddress} 
                onChange={e => setField('clientAddress', e.target.value)} 
                placeholder="Client address (optional)" 
              />
            </div>
          </div>
        </div>

        {/* ── Quotation Dates ── */}
        <div className="emp-qt-section">
          <h2>Quotation Info</h2>
          <div className="emp-qt-grid">
            <div className="emp-qt-field">
              <label>Issue Date</label>
              <input 
                type="date" 
                value={form.issueDate} 
                onChange={e => setField('issueDate', e.target.value)} 
              />
            </div>
            <div className="emp-qt-field">
              <label>Valid Until</label>
              <input 
                type="date" 
                value={form.validityDate} 
                onChange={e => setField('validityDate', e.target.value)} 
              />
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
            <button type="button" className="emp-qt-add-btn" onClick={addService}>
              <FiPlus /> Add Service
            </button>
          </div>

          {form.services.map((svc, idx) => (
            <div key={idx} className="emp-qt-service-card">
              <div className="emp-qt-service-top">
                <span className="emp-qt-service-label">Service #{idx + 1}</span>
                {form.services.length > 1 && (
                  <button 
                    type="button" 
                    className="emp-qt-remove-btn" 
                    onClick={() => removeService(idx)}
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>

              {/* Template picker */}
              <div className="emp-qt-template-row">
                <label>Quick Template:</label>
                <select 
                  defaultValue="" 
                  onChange={e => { 
                    if (e.target.value) {
                      applyTemplate(idx, SERVICE_TEMPLATES[parseInt(e.target.value)]); 
                      e.target.value = ''; 
                    }
                  }}
                >
                  <option value="">— Select template —</option>
                  {SERVICE_TEMPLATES.map((t, ti) => (
                    <option key={ti} value={ti}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="emp-qt-service-grid">
                <div className="emp-qt-field">
                  <label>Service Name *</label>
                  <input 
                    type="text" 
                    value={svc.name} 
                    onChange={e => setService(idx, 'name', e.target.value)} 
                    placeholder="Service name" 
                  />
                </div>
                <div className="emp-qt-field emp-qt-full">
                  <label>Description</label>
                  <input 
                    type="text" 
                    value={svc.description} 
                    onChange={e => setService(idx, 'description', e.target.value)} 
                    placeholder="Brief description (optional)" 
                  />
                </div>
                <div className="emp-qt-field">
                  <label>Qty</label>
                  <input 
                    type="number" 
                    value={svc.quantity} 
                    min="1" 
                    onChange={e => setService(idx, 'quantity', parseFloat(e.target.value) || 1)} 
                  />
                </div>
                <div className="emp-qt-field">
                  <label>Unit Price</label>
                  <div className="emp-qt-price-row">
                    <input 
                      type="number" 
                      value={svc.price} 
                      min="0" 
                      onChange={e => setService(idx, 'price', parseFloat(e.target.value) || 0)} 
                    />
                    <select 
                      value={svc.currency || form.currency} 
                      onChange={e => setService(idx, 'currency', e.target.value)}
                    >
                      <option value="PKR">PKR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                <div className="emp-qt-field">
                  <label>Billing Cycle</label>
                  <select 
                    value={svc.billingCycle} 
                    onChange={e => setService(idx, 'billingCycle', e.target.value)}
                  >
                    {BILLING_CYCLES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="emp-qt-field emp-qt-total-display">
                  <label>Line Total</label>
                  <p className="emp-qt-line-total">
                    {fmtCur(svc.quantity * svc.price, svc.currency || form.currency)}
                  </p>
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
              <input 
                type="number" 
                value={form.discount} 
                min="0" 
                max="100" 
                onChange={e => setField('discount', parseFloat(e.target.value) || 0)} 
              />
            </div>
            <div className="emp-qt-field">
              <label>Tax (%)</label>
              <input 
                type="number" 
                value={form.tax} 
                min="0" 
                max="100" 
                onChange={e => setField('tax', parseFloat(e.target.value) || 0)} 
              />
            </div>
          </div>
          <div className="emp-qt-totals">
            <div className="emp-qt-total-row">
              <span>Subtotal</span>
              <span>{fmtCur(subtotal(), form.currency)}</span>
            </div>
            {form.discount > 0 && (
              <div className="emp-qt-total-row emp-qt-discount">
                <span>Discount ({form.discount}%)</span>
                <span>− {fmtCur(discountAmt(), form.currency)}</span>
              </div>
            )}
            {form.tax > 0 && (
              <div className="emp-qt-total-row">
                <span>Tax ({form.tax}%)</span>
                <span>{fmtCur(taxAmt(), form.currency)}</span>
              </div>
            )}
            <div className="emp-qt-total-row emp-qt-grand">
              <span>Grand Total</span>
              <span>{fmtCur(grandTotal(), form.currency)}</span>
            </div>
          </div>
        </div>

        {/* ── Payment & Timeline ── */}
        <div className="emp-qt-section">
          <h2>Payment & Timeline</h2>
          <div className="emp-qt-grid">
            <div className="emp-qt-field">
              <label>Payment Terms</label>
              <textarea 
                rows="3" 
                value={form.paymentTerms} 
                onChange={e => setField('paymentTerms', e.target.value)} 
                placeholder="e.g. 50% advance, 50% on completion" 
              />
            </div>
            <div className="emp-qt-field">
              <label>Project Timeline</label>
              <textarea 
                rows="3" 
                value={form.projectTimeline} 
                onChange={e => setField('projectTimeline', e.target.value)} 
                placeholder="e.g. 2–4 weeks" 
              />
            </div>
          </div>
        </div>

        {/* ── Notes & T&C ── */}
        <div className="emp-qt-section">
          <h2>Notes & Terms</h2>
          <div className="emp-qt-field emp-qt-full" style={{ marginBottom: '16px' }}>
            <label>Notes</label>
            <textarea 
              rows="3" 
              value={form.notes} 
              onChange={e => setField('notes', e.target.value)} 
              placeholder="Any additional notes for the client..." 
            />
          </div>
          <div className="emp-qt-field emp-qt-full">
            <label>Terms & Conditions</label>
            <textarea 
              rows="5" 
              value={form.termsAndConditions} 
              onChange={e => setField('termsAndConditions', e.target.value)} 
              placeholder="Terms and conditions..." 
            />
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="emp-qt-actions">
          <button 
            type="button" 
            className="emp-qt-cancel-btn" 
            onClick={() => router.push('/employee/dashboard')} 
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="emp-qt-submit-btn" disabled={saving}>
            {saving ? (
              <>
                <span className="emp-qt-spinner" /> 
                Saving Changes...
              </>
            ) : (
              <>
                <FiSave /> 
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
