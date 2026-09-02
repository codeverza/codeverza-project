'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import '../../joining-letters.css';

const DEPARTMENTS         = ['Engineering', 'Design', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Customer Support', 'Management', 'Other'];
const EMPLOYMENT_TYPES    = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Probation'];
const SALARY_TYPES        = ['Monthly', 'Annual'];
const CURRENCIES          = ['PKR', 'USD', 'EUR', 'GBP'];
const COMPENSATION_TYPES  = ['Fixed Salary', 'Commission Only', 'Salary + Commission'];
const COMMISSION_TRIGGERS = ['Deal Closed', 'Payment Received', 'Project Delivered', 'Invoice Cleared'];

const blankSlab = () => ({ from: '', to: '', rate: '', rateType: '%' });

export default function EditJoiningLetterPage() {
  const { id }  = useParams();
  const router  = useRouter();

  const [form, setForm]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { if (id) fetchLetter(); }, [id]);

  const fetchLetter = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/joining-letters?id=${id}`);
      const data = await res.json();
      if (data.success) {
        // Ensure commissionSlabs exists for old records
        const d = data.data;
        if (!d.commissionSlabs || !Array.isArray(d.commissionSlabs) || d.commissionSlabs.length === 0) {
          d.commissionSlabs = [blankSlab()];
        }
        setForm(d);
      } else throw new Error(data.message);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load letter', background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
      router.push('/admin/joining-letters');
    } finally {
      setLoading(false);
    }
  };

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const handleChange = (e) => set(e.target.name, e.target.value);

  /* ── Slab helpers ── */
  const addSlab    = () => set('commissionSlabs', [...(form.commissionSlabs || []), blankSlab()]);
  const removeSlab = (i) => set('commissionSlabs', form.commissionSlabs.filter((_, idx) => idx !== i));
  const updateSlab = (i, field, val) =>
    set('commissionSlabs', form.commissionSlabs.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const showWarn = (title, text) => {
    Swal.fire({ icon: 'warning', title, text, background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
    return false;
  };

  const validate = () => {
    if (!form.employeeName?.trim())  return showWarn('Missing Name',     'Please enter employee name.');
    if (!form.employeeEmail?.trim()) return showWarn('Missing Email',    'Please enter employee email.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.employeeEmail)) return showWarn('Invalid Email', 'Please enter a valid email.');
    if (!form.position?.trim())      return showWarn('Missing Position', 'Please enter the job position.');
    if (!form.department?.trim())    return showWarn('Missing Dept',     'Please select a department.');
    if (!form.joiningDate)           return showWarn('Missing Date',     'Please select a joining date.');

    const hasFixed = (form.compensationType || 'Fixed Salary') === 'Fixed Salary' || form.compensationType === 'Salary + Commission';
    const hasComm  = form.compensationType === 'Commission Only' || form.compensationType === 'Salary + Commission';

    if (hasFixed && (!form.salary || isNaN(form.salary)))
      return showWarn('Invalid Salary', 'Please enter a valid salary.');

    if (hasComm) {
      for (let i = 0; i < (form.commissionSlabs || []).length; i++) {
        const s = form.commissionSlabs[i];
        if (s.from === '' || isNaN(s.from)) return showWarn(`Slab #${i+1}`, '"Project Value From" is required.');
        if (s.rate === '' || isNaN(s.rate)) return showWarn(`Slab #${i+1}`, 'Commission rate is required.');
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    Swal.fire({ title: 'Updating...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: '#0d0d0d', color: '#fff' });

    try {
      const { id: _id, letterNumber, createdAt, ...payload } = form;
      const res  = await fetch(`/api/joining-letters?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({ icon: 'success', title: 'Updated! ✅', timer: 2000, background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff', iconColor: '#28c840' });
        router.push('/admin/joining-letters');
      } else throw new Error(data.message);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error ❌', text: err.message || 'Update failed.', background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
    } finally { setSaving(false); }
  };

  if (loading || !form) return (
    <div className="jl-form-page"><div className="jl-loading"><div className="spinner" /><p>Loading...</p></div></div>
  );

  const isCommission = form.compensationType === 'Commission Only' || form.compensationType === 'Salary + Commission';
  const isFixed      = (form.compensationType || 'Fixed Salary') === 'Fixed Salary' || form.compensationType === 'Salary + Commission';
  const slabs        = form.commissionSlabs || [blankSlab()];
  const currency     = form.currency || 'PKR';

  return (
    <div className="jl-form-page">

      <div className="jl-form-header">
        <button className="jl-btn-back" onClick={() => router.push('/admin/joining-letters')}>
          <FiArrowLeft /> Back to Joining Letters
        </button>
        <h1>Edit Joining Letter &nbsp;<span style={{ fontSize: 16, color: '#b14cff' }}>{form.letterNumber}</span></h1>
      </div>

      <form onSubmit={handleSubmit} className="jl-form">

        {/* ── Employee Info ── */}
        <div className="jl-form-section">
          <h2>👤 Employee Information</h2>
          <div className="jl-form-grid">
            {[
              { label: 'Full Name *',   name: 'employeeName',  type: 'text',  placeholder: 'Muhammad Ali',     required: true },
              { label: 'Email *',       name: 'employeeEmail', type: 'email', placeholder: 'emp@example.com',  required: true },
              { label: 'Phone',         name: 'employeePhone', type: 'tel',   placeholder: '+92 300 1234567' },
              { label: "Father's Name", name: 'fatherName',    type: 'text',  placeholder: "Father's name" },
              { label: 'CNIC',          name: 'cnicNumber',    type: 'text',  placeholder: 'XXXXX-XXXXXXX-X' },
            ].map(f => (
              <div key={f.name} className="jl-form-group">
                <label>{f.label}</label>
                <input type={f.type} name={f.name} value={form[f.name] || ''} onChange={handleChange} placeholder={f.placeholder} required={f.required} />
              </div>
            ))}
            <div className="jl-form-group full">
              <label>Address</label>
              <textarea name="employeeAddress" value={form.employeeAddress || ''} onChange={handleChange} rows={2} placeholder="Residential address..." />
            </div>
          </div>
        </div>

        {/* ── Job Details ── */}
        <div className="jl-form-section">
          <h2>💼 Job Details</h2>
          <div className="jl-form-grid">
            <div className="jl-form-group">
              <label>Position *</label>
              <input name="position" value={form.position || ''} onChange={handleChange} placeholder="e.g. Sales Executive" required />
            </div>
            <div className="jl-form-group">
              <label>Department *</label>
              <select name="department" value={form.department || ''} onChange={handleChange} required>
                <option value="">Select...</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="jl-form-group">
              <label>Employment Type</label>
              <select name="employmentType" value={form.employmentType || ''} onChange={handleChange}>
                {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="jl-form-group">
              <label>Reporting To</label>
              <input name="reportingTo" value={form.reportingTo || ''} onChange={handleChange} placeholder="Manager name" />
            </div>
            <div className="jl-form-group">
              <label>Work Location</label>
              <select name="workLocation" value={form.workLocation || 'On-site'} onChange={handleChange}>
                {['On-site', 'Remote', 'Hybrid'].map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div className="jl-form-group">
              <label>Probation Period</label>
              <input name="probationPeriod" value={form.probationPeriod || ''} onChange={handleChange} placeholder="3 months" />
            </div>
          </div>
        </div>

        {/* ── Compensation ── */}
        <div className="jl-form-section">
          <h2>💰 Compensation</h2>
          <div className="jl-form-grid">

            <div className="jl-form-group">
              <label>Joining Date *</label>
              <input type="date" name="joiningDate" value={form.joiningDate || ''} onChange={handleChange} required />
            </div>
            <div className="jl-form-group">
              <label>Currency</label>
              <select name="currency" value={currency} onChange={handleChange}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Type toggle */}
            <div className="jl-form-group full">
              <label>Compensation Type *</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                {COMPENSATION_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => set('compensationType', t)}
                    style={{
                      padding: '10px 22px', borderRadius: 10, cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
                      background: (form.compensationType || 'Fixed Salary') === t ? 'linear-gradient(135deg,#b14cff,#6a00ff)' : 'rgba(255,255,255,0.05)',
                      color:  (form.compensationType || 'Fixed Salary') === t ? '#fff' : '#888',
                      border: (form.compensationType || 'Fixed Salary') === t ? '1px solid transparent' : '1px solid rgba(177,76,255,0.2)',
                      boxShadow: (form.compensationType || 'Fixed Salary') === t ? '0 4px 18px rgba(177,76,255,0.4)' : 'none',
                    }}>
                    {t === 'Fixed Salary' ? '💵 ' : t === 'Commission Only' ? '📈 ' : '💰 '}{t}
                  </button>
                ))}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#555' }}>
                {(form.compensationType || 'Fixed Salary') === 'Fixed Salary'       && 'Employee receives a fixed monthly/annual salary only.'}
                {form.compensationType === 'Commission Only'                         && 'No fixed salary — earns commission only on successful sales/projects.'}
                {form.compensationType === 'Salary + Commission'                     && 'Fixed base salary plus commission on successful sales/projects.'}
              </p>
            </div>

            {/* Base salary */}
            {isFixed && (
              <>
                <div className="jl-form-group">
                  <label>Base Salary *</label>
                  <input type="number" name="salary" value={form.salary || ''} onChange={handleChange} placeholder="50000" required />
                </div>
                <div className="jl-form-group">
                  <label>Salary Type</label>
                  <select name="salaryType" value={form.salaryType || 'Monthly'} onChange={handleChange}>
                    {SALARY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </>
            )}

            {/* ── Commission Slabs ── */}
            {isCommission && (
              <div className="jl-form-group full">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📊 Commission Slabs <span style={{ color: '#555', fontWeight: 400, fontSize: 11 }}>(Project value ranges → commission rate)</span></span>
                  <button type="button" onClick={addSlab}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(40,200,64,0.12)', border: '1px solid rgba(40,200,64,0.3)', color: '#28c840', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <FiPlus size={13} /> Add Slab
                  </button>
                </label>

                {/* Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px 36px', gap: 8, marginTop: 10, marginBottom: 4, padding: '0 4px' }}>
                  {['Project Value From', 'Project Value To (blank = ∞)', 'Commission', 'Type', ''].map((h, i) => (
                    <span key={i} style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
                  ))}
                </div>

                {/* Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {slabs.map((slab, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px 36px', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(177,76,255,0.15)', borderRadius: 10, padding: '10px 12px' }}>
                      {/* From */}
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#555', pointerEvents: 'none' }}>{currency}</span>
                        <input type="number" min="0" value={slab.from} placeholder="0"
                          onChange={e => updateSlab(i, 'from', e.target.value)}
                          style={{ width: '100%', paddingLeft: 36, paddingRight: 8, paddingTop: 10, paddingBottom: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(177,76,255,0.2)', borderRadius: 8, color: '#fff', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                      </div>
                      {/* To */}
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#555', pointerEvents: 'none' }}>{currency}</span>
                        <input type="number" min="0" value={slab.to} placeholder="No limit"
                          onChange={e => updateSlab(i, 'to', e.target.value)}
                          style={{ width: '100%', paddingLeft: 36, paddingRight: 8, paddingTop: 10, paddingBottom: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(177,76,255,0.2)', borderRadius: 8, color: '#fff', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                      </div>
                      {/* Rate */}
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#b14cff', fontWeight: 700, pointerEvents: 'none' }}>
                          {slab.rateType === '%' ? '%' : currency}
                        </span>
                        <input type="number" min="0" value={slab.rate} placeholder="e.g. 10"
                          onChange={e => updateSlab(i, 'rate', e.target.value)}
                          style={{ width: '100%', paddingLeft: 8, paddingRight: 36, paddingTop: 10, paddingBottom: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(177,76,255,0.2)', borderRadius: 8, color: '#fff', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                      </div>
                      {/* Type toggle */}
                      <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(177,76,255,0.25)' }}>
                        {['%', 'Flat'].map(rt => (
                          <button key={rt} type="button" onClick={() => updateSlab(i, 'rateType', rt)}
                            style={{ flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
                              background: slab.rateType === rt ? 'rgba(177,76,255,0.3)' : 'rgba(255,255,255,0.03)',
                              color: slab.rateType === rt ? '#e0aaff' : '#666',
                            }}>{rt}</button>
                        ))}
                      </div>
                      {/* Remove */}
                      <button type="button" onClick={() => removeSlab(i)} disabled={slabs.length === 1}
                        style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(255,107,107,0.25)', background: 'rgba(255,107,107,0.08)', color: '#ff6b6b', cursor: slabs.length === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: slabs.length === 1 ? 0.3 : 1 }}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Live preview */}
                {slabs.some(s => s.from !== '' && s.rate !== '') && (
                  <div style={{ marginTop: 12, background: 'rgba(40,200,64,0.05)', border: '1px solid rgba(40,200,64,0.2)', borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#28c840', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>📋 Slab Preview</div>
                    {slabs.map((s, i) => {
                      if (s.from === '' || s.rate === '') return null;
                      const from = Number(s.from).toLocaleString('en-PK');
                      const to   = s.to ? Number(s.to).toLocaleString('en-PK') : '∞';
                      const rate = s.rateType === '%' ? `${s.rate}%` : `${currency} ${Number(s.rate).toLocaleString('en-PK')} flat`;
                      return (
                        <div key={i} style={{ fontSize: 13, color: '#ccc', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: '#28c840', fontWeight: 700, minWidth: 16 }}>▸</span>
                          {currency} {from} – {to === '∞' ? '∞ (no limit)' : `${currency} ${to}`}
                          <span style={{ marginLeft: 4, background: 'rgba(177,76,255,0.15)', padding: '2px 10px', borderRadius: 20, color: '#e0aaff', fontWeight: 700, fontSize: 12 }}>{rate} commission</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Commission meta */}
            {isCommission && (
              <>
                <div className="jl-form-group">
                  <label>Commission Released On</label>
                  <select name="commissionTrigger" value={form.commissionTrigger || 'Payment Received'} onChange={handleChange}>
                    {COMMISSION_TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="jl-form-group">
                  <label>Monthly Cap (Optional)</label>
                  <input type="number" name="commissionCap" value={form.commissionCap || ''} onChange={handleChange}
                    placeholder={`Max ${currency} per month`} min="0" />
                </div>
                <div className="jl-form-group full">
                  <label>Commission Terms / Notes</label>
                  <textarea name="commissionNotes" value={form.commissionNotes || ''} onChange={handleChange} rows={3}
                    placeholder="e.g. Commission is applicable only on deals where full payment has been received..." />
                </div>
              </>
            )}

            <div className="jl-form-group full">
              <label>Benefits</label>
              <textarea name="benefits" value={form.benefits || ''} onChange={handleChange} rows={3} placeholder="Health insurance, Annual bonus..." />
            </div>
          </div>
        </div>

        {/* ── Letter Content ── */}
        <div className="jl-form-section">
          <h2>✍️ Letter Content</h2>
          <div className="jl-form-grid">
            <div className="jl-form-group full">
              <label>Opening Paragraph</label>
              <textarea name="openingParagraph" value={form.openingParagraph || ''} onChange={handleChange} rows={4} />
            </div>
            <div className="jl-form-group full">
              <label>Closing Paragraph</label>
              <textarea name="closingParagraph" value={form.closingParagraph || ''} onChange={handleChange} rows={4} />
            </div>
            <div className="jl-form-group full">
              <label>Terms &amp; Conditions</label>
              <textarea name="termsAndConditions" value={form.termsAndConditions || ''} onChange={handleChange} rows={5} />
            </div>
          </div>
        </div>

        {/* ── Status ── */}
        <div className="jl-form-section">
          <h2>📋 Status</h2>
          <div className="jl-form-grid">
            <div className="jl-form-group">
              <label>Status</label>
              <select name="status" value={form.status || 'Draft'} onChange={handleChange}>
                {['Draft', 'Sent', 'Accepted', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="jl-form-actions">
          <button type="button" className="jl-btn-secondary" onClick={() => router.push('/admin/joining-letters')}>Cancel</button>
          <button type="submit" className="jl-btn-primary" disabled={saving}>
            {saving ? <><span className="spinner-small" /> Saving...</> : <><FiSave /> Save Changes</>}
          </button>
        </div>

      </form>
    </div>
  );
}
