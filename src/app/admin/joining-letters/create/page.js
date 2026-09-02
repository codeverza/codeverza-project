'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import '../joining-letters.css';

const DEPARTMENTS         = ['Engineering', 'Design', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Customer Support', 'Management', 'Other'];
const EMPLOYMENT_TYPES    = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Probation'];
const SALARY_TYPES        = ['Monthly', 'Annual'];
const CURRENCIES          = ['PKR', 'USD', 'EUR', 'GBP'];
const COMPENSATION_TYPES  = ['Fixed Salary', 'Commission Only', 'Salary + Commission'];
const COMMISSION_TRIGGERS = ['Deal Closed', 'Payment Received', 'Project Delivered', 'Invoice Cleared'];

const blankSlab = () => ({ from: '', to: '', rate: '', rateType: '%' });

// ── Defined OUTSIDE component so they are stable across renders ──
const Field = ({ label, name, type = 'text', placeholder = '', required = false, value, onChange }) => (
  <div className="jl-form-group">
    <label>{label}{required && ' *'}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} />
  </div>
);

const SelectField = ({ label, name, options, required = false, value, onChange }) => (
  <div className="jl-form-group">
    <label>{label}{required && ' *'}</label>
    <select name={name} value={value} onChange={onChange} required={required}>
      <option value="">Select...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const defaultForm = {
  employeeName:    '',
  employeeEmail:   '',
  employeePhone:   '',
  employeeAddress: '',
  fatherName:      '',
  cnicNumber:      '',
  position:        '',
  department:      '',
  employmentType:  'Full-Time',
  reportingTo:     '',
  workLocation:    'On-site',
  joiningDate:     new Date().toISOString().split('T')[0],
  compensationType:'Fixed Salary',
  salary:          '',
  salaryType:      'Monthly',
  currency:        'PKR',
  probationPeriod: '3 months',
  commissionSlabs:    [blankSlab()],
  commissionTrigger:  'Payment Received',
  commissionCap:      '',
  commissionNotes:    '',
  benefits:           '',
  openingParagraph:   'We are pleased to offer you the position of [POSITION] at CodeVerza. After careful review of your qualifications and interviews, we are confident that your skills and experience will be a valuable addition to our team.',
  closingParagraph:   'We look forward to welcoming you to the CodeVerza family. Please sign and return a copy of this letter as your acceptance. Should you have any questions, feel free to reach out to us.',
  termsAndConditions: 'This offer is contingent upon successful completion of background verification.\nYou will be required to maintain confidentiality of all company information.\nThis letter does not constitute a contract of employment.\nThe company reserves the right to modify terms with prior notice.',
  status: 'Draft',
};

export default function CreateJoiningLetterPage() {
  const router  = useRouter();
  const [form, setForm]       = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const handleChange = (e) => set(e.target.name, e.target.value);

  const addSlab    = () => set('commissionSlabs', [...form.commissionSlabs, blankSlab()]);
  const removeSlab = (i) => set('commissionSlabs', form.commissionSlabs.filter((_, idx) => idx !== i));
  const updateSlab = (i, field, val) =>
    set('commissionSlabs', form.commissionSlabs.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const showWarn = (title, text) => {
    Swal.fire({ icon: 'warning', title, text, background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
    return false;
  };

  const validate = () => {
    if (!form.employeeName.trim())  return showWarn('Missing Name',    'Please enter the employee name.');
    if (!form.employeeEmail.trim()) return showWarn('Missing Email',   'Please enter employee email.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.employeeEmail)) return showWarn('Invalid Email', 'Please enter a valid email address.');
    if (!form.position.trim())      return showWarn('Missing Position','Please enter the job position.');
    if (!form.department.trim())    return showWarn('Missing Dept',    'Please select a department.');
    if (!form.joiningDate)          return showWarn('Missing Date',    'Please select a joining date.');

    const hasFixed = form.compensationType === 'Fixed Salary' || form.compensationType === 'Salary + Commission';
    const hasComm  = form.compensationType === 'Commission Only' || form.compensationType === 'Salary + Commission';

    if (hasFixed && (!form.salary || isNaN(form.salary) || Number(form.salary) < 0))
      return showWarn('Invalid Salary', 'Please enter a valid salary amount.');

    if (hasComm) {
      for (let i = 0; i < form.commissionSlabs.length; i++) {
        const s = form.commissionSlabs[i];
        if (s.from === '' || isNaN(s.from))
          return showWarn(`Slab #${i + 1} Error`, '"Project Value From" is required.');
        if (s.rate === '' || isNaN(s.rate) || Number(s.rate) < 0)
          return showWarn(`Slab #${i + 1} Error`, 'Commission rate is required.');
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    Swal.fire({ title: 'Creating Letter...', allowOutsideClick: false, allowEscapeKey: false, didOpen: () => Swal.showLoading(), background: '#0d0d0d', color: '#fff' });

    try {
      const res  = await fetch('/api/joining-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({ icon: 'success', title: 'Letter Created! ✅', text: `Letter ${data.data.letterNumber} created.`, background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff', iconColor: '#28c840', timer: 2200 });
        router.push('/admin/joining-letters');
      } else throw new Error(data.message);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error ❌', text: err.message || 'Failed to create letter.', background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
    } finally {
      setLoading(false);
    }
  };

  const isCommission = form.compensationType === 'Commission Only' || form.compensationType === 'Salary + Commission';
  const isFixed      = form.compensationType === 'Fixed Salary'    || form.compensationType === 'Salary + Commission';

  return (
    <div className="jl-form-page">

      <div className="jl-form-header">
        <button className="jl-btn-back" onClick={() => router.push('/admin/joining-letters')}>
          <FiArrowLeft /> Back to Joining Letters
        </button>
        <h1>Create Joining Letter</h1>
      </div>

      <form onSubmit={handleSubmit} className="jl-form">

        {/* ── Employee Info ── */}
        <div className="jl-form-section">
          <h2>👤 Employee Information</h2>
          <div className="jl-form-grid">
            <Field label="Full Name"     name="employeeName"  placeholder="e.g. Muhammad Ali"      required value={form.employeeName}  onChange={handleChange} />
            <Field label="Email Address" name="employeeEmail" type="email" placeholder="employee@example.com" required value={form.employeeEmail} onChange={handleChange} />
            <Field label="Phone Number"  name="employeePhone" type="tel"   placeholder="+92 300 1234567" value={form.employeePhone} onChange={handleChange} />
            <Field label="Father's Name" name="fatherName"    placeholder="Father's full name" value={form.fatherName} onChange={handleChange} />
            <Field label="CNIC Number"   name="cnicNumber"    placeholder="XXXXX-XXXXXXX-X" value={form.cnicNumber} onChange={handleChange} />
            <div className="jl-form-group full">
              <label>Residential Address</label>
              <textarea name="employeeAddress" value={form.employeeAddress} onChange={handleChange} rows={2} placeholder="Full home address..." />
            </div>
          </div>
        </div>

        {/* ── Job Details ── */}
        <div className="jl-form-section">
          <h2>💼 Job Details</h2>
          <div className="jl-form-grid">
            <Field label="Job Position / Title" name="position" placeholder="e.g. Sales Executive" required value={form.position} onChange={handleChange} />
            <SelectField label="Department" name="department" options={DEPARTMENTS} required value={form.department} onChange={handleChange} />
            <SelectField label="Employment Type" name="employmentType" options={EMPLOYMENT_TYPES} value={form.employmentType} onChange={handleChange} />
            <Field label="Reporting To" name="reportingTo" placeholder="Manager / Team Lead name" value={form.reportingTo} onChange={handleChange} />
            <div className="jl-form-group">
              <label>Work Location</label>
              <select name="workLocation" value={form.workLocation} onChange={handleChange}>
                {['On-site', 'Remote', 'Hybrid'].map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <Field label="Probation Period" name="probationPeriod" placeholder="e.g. 3 months" value={form.probationPeriod} onChange={handleChange} />
          </div>
        </div>

        {/* ── Compensation ── */}
        <div className="jl-form-section">
          <h2>💰 Compensation &amp; Dates</h2>
          <div className="jl-form-grid">

            <Field label="Joining Date" name="joiningDate" type="date" required value={form.joiningDate} onChange={handleChange} />

            <div className="jl-form-group">
              <label>Currency</label>
              <select name="currency" value={form.currency} onChange={handleChange}>
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
                      background: form.compensationType === t ? 'linear-gradient(135deg,#b14cff,#6a00ff)' : 'rgba(255,255,255,0.05)',
                      color:  form.compensationType === t ? '#fff' : '#888',
                      border: form.compensationType === t ? '1px solid transparent' : '1px solid rgba(177,76,255,0.2)',
                      boxShadow: form.compensationType === t ? '0 4px 18px rgba(177,76,255,0.4)' : 'none',
                    }}>
                    {t === 'Fixed Salary' ? '💵 ' : t === 'Commission Only' ? '📈 ' : '💰 '}{t}
                  </button>
                ))}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#555' }}>
                {form.compensationType === 'Fixed Salary'        && 'Employee receives a fixed monthly/annual salary only.'}
                {form.compensationType === 'Commission Only'     && 'No fixed salary — employee earns commission only on successful sales/projects.'}
                {form.compensationType === 'Salary + Commission' && 'Fixed base salary plus commission on successful sales/projects.'}
              </p>
            </div>

            {/* Base salary */}
            {isFixed && (
              <>
                <Field label="Base Salary *" name="salary" type="number" placeholder="e.g. 50000" required value={form.salary} onChange={handleChange} />
                <SelectField label="Salary Type" name="salaryType" options={SALARY_TYPES} value={form.salaryType} onChange={handleChange} />
              </>
            )}

            {/* ── Commission Slabs ── */}
            {isCommission && (
              <div className="jl-form-group full">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    📊 Commission Slabs
                    <span style={{ color: '#555', fontWeight: 400, fontSize: 11, marginLeft: 6 }}>
                      (Project value range → commission rate)
                    </span>
                  </span>
                  <button type="button" onClick={addSlab}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(40,200,64,0.12)', border: '1px solid rgba(40,200,64,0.3)', color: '#28c840', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <FiPlus size={13} /> Add Slab
                  </button>
                </label>

                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px 36px', gap: 8, marginTop: 10, marginBottom: 4, padding: '0 4px' }}>
                  {['Project Value From', 'Project Value To (blank = ∞)', 'Commission', 'Type', ''].map((h, i) => (
                    <span key={i} style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
                  ))}
                </div>

                {/* Slab rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {form.commissionSlabs.map((slab, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px 36px', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(177,76,255,0.15)', borderRadius: 10, padding: '10px 12px' }}>

                      {/* From */}
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#555', pointerEvents: 'none' }}>{form.currency}</span>
                        <input type="number" min="0" value={slab.from} placeholder="0"
                          onChange={e => updateSlab(i, 'from', e.target.value)}
                          style={{ width: '100%', paddingLeft: 36, paddingRight: 8, paddingTop: 10, paddingBottom: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(177,76,255,0.2)', borderRadius: 8, color: '#fff', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                      </div>

                      {/* To */}
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#555', pointerEvents: 'none' }}>{form.currency}</span>
                        <input type="number" min="0" value={slab.to} placeholder="No limit"
                          onChange={e => updateSlab(i, 'to', e.target.value)}
                          style={{ width: '100%', paddingLeft: 36, paddingRight: 8, paddingTop: 10, paddingBottom: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(177,76,255,0.2)', borderRadius: 8, color: '#fff', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                      </div>

                      {/* Rate */}
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#b14cff', fontWeight: 700, pointerEvents: 'none' }}>
                          {slab.rateType === '%' ? '%' : form.currency}
                        </span>
                        <input type="number" min="0" value={slab.rate} placeholder="e.g. 10"
                          onChange={e => updateSlab(i, 'rate', e.target.value)}
                          style={{ width: '100%', paddingLeft: 8, paddingRight: 36, paddingTop: 10, paddingBottom: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(177,76,255,0.2)', borderRadius: 8, color: '#fff', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                      </div>

                      {/* % / Flat toggle */}
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
                      <button type="button" onClick={() => removeSlab(i)} disabled={form.commissionSlabs.length === 1}
                        style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(255,107,107,0.25)', background: 'rgba(255,107,107,0.08)', color: '#ff6b6b', cursor: form.commissionSlabs.length === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: form.commissionSlabs.length === 1 ? 0.3 : 1 }}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Live preview */}
                {form.commissionSlabs.some(s => s.from !== '' && s.rate !== '') && (
                  <div style={{ marginTop: 12, background: 'rgba(40,200,64,0.05)', border: '1px solid rgba(40,200,64,0.2)', borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#28c840', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>📋 Slab Preview</div>
                    {form.commissionSlabs.map((s, i) => {
                      if (s.from === '' || s.rate === '') return null;
                      const from = Number(s.from).toLocaleString('en-PK');
                      const to   = s.to ? Number(s.to).toLocaleString('en-PK') : '∞';
                      const rate = s.rateType === '%' ? `${s.rate}%` : `${form.currency} ${Number(s.rate).toLocaleString('en-PK')} flat`;
                      return (
                        <div key={i} style={{ fontSize: 13, color: '#ccc', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: '#28c840', fontWeight: 700, minWidth: 16 }}>▸</span>
                          {form.currency} {from} – {to === '∞' ? '∞ (no limit)' : `${form.currency} ${to}`}
                          <span style={{ marginLeft: 4, background: 'rgba(177,76,255,0.15)', padding: '2px 10px', borderRadius: 20, color: '#e0aaff', fontWeight: 700, fontSize: 12 }}>
                            {rate} commission
                          </span>
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
                  <select name="commissionTrigger" value={form.commissionTrigger} onChange={handleChange}>
                    {COMMISSION_TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="jl-form-group">
                  <label>Monthly Cap (Optional)</label>
                  <input type="number" name="commissionCap" value={form.commissionCap} onChange={handleChange}
                    placeholder={`Max ${form.currency} per month (blank = no cap)`} min="0" />
                </div>
                <div className="jl-form-group full">
                  <label>Commission Terms / Notes</label>
                  <textarea name="commissionNotes" value={form.commissionNotes} onChange={handleChange} rows={3}
                    placeholder="e.g. Commission is only applicable on deals where full payment has been received. Refunded or cancelled deals are not eligible..." />
                </div>
              </>
            )}

            {/* Benefits */}
            <div className="jl-form-group full">
              <label>Benefits / Perks</label>
              <textarea name="benefits" value={form.benefits} onChange={handleChange} rows={3}
                placeholder="e.g. Health insurance, Annual bonus, Fuel allowance, Paid leaves..." />
            </div>

          </div>
        </div>

        {/* ── Letter Content ── */}
        <div className="jl-form-section">
          <h2>✍️ Letter Content</h2>
          <div className="jl-form-grid">
            <div className="jl-form-group full">
              <label>Opening Paragraph</label>
              <textarea name="openingParagraph" value={form.openingParagraph} onChange={handleChange} rows={4} placeholder="Opening paragraph..." />
            </div>
            <div className="jl-form-group full">
              <label>Closing Paragraph</label>
              <textarea name="closingParagraph" value={form.closingParagraph} onChange={handleChange} rows={4} placeholder="Closing paragraph..." />
            </div>
            <div className="jl-form-group full">
              <label>Terms &amp; Conditions</label>
              <textarea name="termsAndConditions" value={form.termsAndConditions} onChange={handleChange} rows={5} placeholder="Terms and conditions..." />
            </div>
          </div>
        </div>

        {/* ── Status ── */}
        <div className="jl-form-section">
          <h2>📋 Letter Status</h2>
          <div className="jl-form-grid">
            <div className="jl-form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                {['Draft', 'Sent', 'Accepted', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="jl-form-actions">
          <button type="button" className="jl-btn-secondary" onClick={() => router.push('/admin/joining-letters')}>
            Cancel
          </button>
          <button type="submit" className="jl-btn-primary" disabled={loading}>
            {loading ? <><span className="spinner-small" /> Creating...</> : <><FiSave /> Create Letter</>}
          </button>
        </div>

      </form>
    </div>
  );
}
