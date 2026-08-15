'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, Send, User, Mail, Phone, Briefcase,
  BarChart2, Linkedin, Globe, FileText, CheckCircle, Loader2, AlertCircle,
  Upload, X, FileCheck
} from 'lucide-react';
import ReusableNavbar from '../components/reusable-navbar';
import Footer from '../components/footer';
import './career-form.css';

/* ── Particle Background ── */
function ParticleBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h, particles, raf;
    const init = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      particles = Array.from({ length: 55 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.4,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(177,76,255,0.75)'; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++)
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(177,76,255,${0.18 * (1 - d / 110)})`; ctx.lineWidth = 0.7; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    init(); draw();
    const ro = new ResizeObserver(init); ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="cf-canvas" />;
}

const positions = [
  'Sales Representative',
  'Other / General Application',
];

const experienceLevels = [
  'No Experience (Fresher)',
  'Less than 1 Year',
  '1 – 2 Years',
  '2 – 4 Years',
  '4+ Years',
];

const initialForm = {
  name: '', email: '', phone: '',
  position: '', experience: '',
  linkedin: '', portfolio: '', coverLetter: '',
};

export default function CareerFormPage() {
  const [form, setForm]       = useState(initialForm);
  const [cvFile, setCvFile]   = useState(null);
  const [cvError, setCvError] = useState('');
  const [errors, setErrors]   = useState({});
  const [status, setStatus]   = useState('idle'); // idle | loading | success | error
  const [touched, setTouched] = useState({});

  const validate = (data) => {
    const e = {};
    if (!data.name.trim())        e.name        = 'Full name is required.';
    if (!data.email.trim())       e.email       = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Please enter a valid email.';
    if (!data.position)           e.position    = 'Please select a position.';
    if (!data.coverLetter.trim()) e.coverLetter = 'Please tell us a little about yourself.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const errs = validate({ ...form, [name]: value });
      setErrors(prev => ({ ...prev, [name]: errs[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const errs = validate(form);
    setErrors(prev => ({ ...prev, [name]: errs[name] }));
  };

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      setCvError('Only PDF, DOC, or DOCX files are allowed.');
      setCvFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCvError('File size must be under 5MB.');
      setCvFile(null);
      return;
    }
    setCvError('');
    setCvFile(file);
  };

  const removeCv = () => {
    setCvFile(null);
    setCvError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(initialForm).map(k => [k, true]));
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!cvFile) { setCvError('Please upload your CV.'); return; }

    setStatus('loading');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('cv', cvFile);

      const res  = await fetch('/api/career', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setForm(initialForm);
        setCvFile(null);
        setTouched({});
        setErrors({});
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const Field = ({ label, name, icon: Icon, type = 'text', required, placeholder, children }) => (
    <div className="cf-field">
      <label className="cf-label">
        <Icon size={15} className="cf-label-icon" />
        {label} {required && <span className="cf-required">*</span>}
      </label>
      {children || (
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`cf-input ${errors[name] && touched[name] ? 'cf-input-error' : ''}`}
          autoComplete="off"
        />
      )}
      <AnimatePresence>
        {errors[name] && touched[name] && (
          <motion.p className="cf-error-msg"
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
            <AlertCircle size={13} /> {errors[name]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <ReusableNavbar />
      <main className="cf-main">
        <ParticleBg />
        <div className="cf-orb cf-orb-1" />
        <div className="cf-orb cf-orb-2" />
        <div className="cf-orb cf-orb-3" />

        <div className="cf-wrapper">

          {/* ── Back Link ── */}
          <div className="cf-back-wrap">
            <Link href="/career-page" className="cf-back">
              <ArrowLeft size={15} /> Back to Careers
            </Link>
          </div>

          {/* ── Header ── */}
          <motion.div className="cf-header main-margin-top"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="cf-header-badge">
              <span className="cf-badge-dot" /> Apply Now
            </div>
            <h1 className="cf-header-title">
              Start Your Journey<br />
              <span className="cf-purple">With Codeverza</span>
            </h1>
            <p className="cf-header-sub">
              Fill out the form below and our team will get back to you as soon as possible.
            </p>
          </motion.div>

          {/* ── Success State ── */}
          <AnimatePresence>
            {status === 'success' && (
              <motion.div className="cf-success-box"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
                <div className="cf-success-icon"><CheckCircle size={48} /></div>
                <h3>Application Submitted!</h3>
                <p>Thank you for applying. We've sent a confirmation to your email. Our team will reach out to you as soon as possible.</p>
                <Link href="/career-page" className="cf-success-btn">
                  <ArrowLeft size={16} /> Back to Careers
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Form ── */}
          {status !== 'success' && (
            <motion.form
              className="cf-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              noValidate
            >
              {/* Section: Personal Info */}
              <div className="cf-section-title">
                <span className="cf-section-dot" />
                Personal Information
              </div>

              <div className="cf-row">
                <Field label="Full Name" name="name" icon={User} required placeholder="e.g. Muhammad Ali">
                  <input
                    type="text" name="name" value={form.name}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="e.g. Muhammad Ali"
                    className={`cf-input ${errors.name && touched.name ? 'cf-input-error' : ''}`}
                    autoComplete="off"
                  />
                  <AnimatePresence>
                    {errors.name && touched.name && (
                      <motion.p className="cf-error-msg"
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                        <AlertCircle size={13} /> {errors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </Field>

                <Field label="Email Address" name="email" icon={Mail} required placeholder="e.g. ali@gmail.com">
                  <input
                    type="email" name="email" value={form.email}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="e.g. ali@gmail.com"
                    className={`cf-input ${errors.email && touched.email ? 'cf-input-error' : ''}`}
                    autoComplete="off"
                  />
                  <AnimatePresence>
                    {errors.email && touched.email && (
                      <motion.p className="cf-error-msg"
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                        <AlertCircle size={13} /> {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </Field>
              </div>

              <div className="cf-row cf-row-single">
                <Field label="Phone Number" name="phone" icon={Phone} placeholder="e.g. +92 300 1234567">
                  <input
                    type="tel" name="phone" value={form.phone}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="e.g. +92 300 1234567"
                    className="cf-input"
                    autoComplete="off"
                  />
                </Field>
              </div>

              {/* Section: Position */}
              <div className="cf-section-title">
                <span className="cf-section-dot" />
                Position Details
              </div>

              <div className="cf-row">
                <div className="cf-field">
                  <label className="cf-label">
                    <Briefcase size={15} className="cf-label-icon" />
                    Position Applying For <span className="cf-required">*</span>
                  </label>
                  <select
                    name="position" value={form.position}
                    onChange={handleChange} onBlur={handleBlur}
                    className={`cf-input cf-select ${errors.position && touched.position ? 'cf-input-error' : ''}`}
                  >
                    <option value="">Select a position...</option>
                    {positions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <AnimatePresence>
                    {errors.position && touched.position && (
                      <motion.p className="cf-error-msg"
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                        <AlertCircle size={13} /> {errors.position}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="cf-field">
                  <label className="cf-label">
                    <BarChart2 size={15} className="cf-label-icon" />
                    Experience Level
                  </label>
                  <select
                    name="experience" value={form.experience}
                    onChange={handleChange}
                    className="cf-input cf-select"
                  >
                    <option value="">Select experience...</option>
                    {experienceLevels.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>

              {/* Section: Online Presence */}
              <div className="cf-section-title">
                <span className="cf-section-dot" />
                Online Presence <span className="cf-optional">(Optional)</span>
              </div>

              <div className="cf-row">
                <div className="cf-field">
                  <label className="cf-label">
                    <Linkedin size={15} className="cf-label-icon" />
                    LinkedIn Profile
                  </label>
                  <input
                    type="url" name="linkedin" value={form.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/your-profile"
                    className="cf-input"
                    autoComplete="off"
                  />
                </div>

                <div className="cf-field">
                  <label className="cf-label">
                    <Globe size={15} className="cf-label-icon" />
                    Portfolio / Website
                  </label>
                  <input
                    type="url" name="portfolio" value={form.portfolio}
                    onChange={handleChange}
                    placeholder="https://yourportfolio.com"
                    className="cf-input"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Section: Cover Letter */}
              <div className="cf-section-title">
                <span className="cf-section-dot" />
                Tell Us About Yourself
              </div>

              <div className="cf-field">
                <label className="cf-label">
                  <FileText size={15} className="cf-label-icon" />
                  Cover Letter / Message <span className="cf-required">*</span>
                </label>
                <textarea
                  name="coverLetter" value={form.coverLetter}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="Tell us why you want to join Codeverza, what makes you a great fit, and anything else you'd like us to know..."
                  rows={6}
                  className={`cf-input cf-textarea ${errors.coverLetter && touched.coverLetter ? 'cf-input-error' : ''}`}
                />
                <div className="cf-char-count">{form.coverLetter.length} characters</div>
                <AnimatePresence>
                  {errors.coverLetter && touched.coverLetter && (
                    <motion.p className="cf-error-msg"
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                      <AlertCircle size={13} /> {errors.coverLetter}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Section: CV Upload */}
              <div className="cf-section-title">
                <span className="cf-section-dot" />
                Upload Your CV <span className="cf-required" style={{ textTransform: 'none', letterSpacing: 0, fontSize: '13px', fontWeight: 600 }}>*</span>
              </div>

              <div className="cf-field" style={{ marginBottom: '24px' }}>
                <label className="cf-label">
                  <Upload size={15} className="cf-label-icon" />
                  CV / Resume <span className="cf-required">*</span>
                  <span style={{ marginLeft: '8px', fontSize: '12px', color: '#555', fontWeight: 400 }}>PDF, DOC, DOCX — max 5MB</span>
                </label>

                {!cvFile ? (
                  <label className="cf-upload-zone">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleCvChange}
                      className="cf-upload-input"
                    />
                    <div className="cf-upload-icon"><Upload size={28} /></div>
                    <p className="cf-upload-text">Click to upload or drag & drop your CV</p>
                    <p className="cf-upload-hint">PDF, DOC, DOCX — max 5MB</p>
                  </label>
                ) : (
                  <div className="cf-file-preview">
                    <FileCheck size={22} className="cf-file-icon" />
                    <div className="cf-file-info">
                      <p className="cf-file-name">{cvFile.name}</p>
                      <p className="cf-file-size">{(cvFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button type="button" onClick={removeCv} className="cf-file-remove" aria-label="Remove CV">
                      <X size={16} />
                    </button>
                  </div>
                )}

                <AnimatePresence>
                  {cvError && (
                    <motion.p className="cf-error-msg"
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                      <AlertCircle size={13} /> {cvError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Error Banner */}
              <AnimatePresence>
                {status === 'error' && (
                  <motion.div className="cf-error-banner"
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <AlertCircle size={18} />
                    <span>Something went wrong. Please try again or contact us directly.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="cf-submit-btn"
              >
                {status === 'loading' ? (
                  <><Loader2 size={18} className="cf-spin" /> Submitting...</>
                ) : (
                  <><Send size={18} /> Submit Application</>
                )}
              </button>

              <p className="cf-privacy-note">
                Your information is kept confidential and will only be used for recruitment purposes.
              </p>
            </motion.form>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
