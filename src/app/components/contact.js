'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, User, MessageSquare, CheckCircle, Briefcase } from 'lucide-react';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Swal from 'sweetalert2';
import '../css/contact.css';

/* ── Particle BG ── */
function ParticleBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h, particles, raf;
    const init = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.5 + 0.5,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(177,76,255,0.7)'; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++)
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(177,76,255,${0.18 * (1 - d / 120)})`;
            ctx.lineWidth = 0.8; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    init(); draw();
    const ro = new ResizeObserver(init); ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="contact-particle-canvas" />;
}

/* ── Left Visual ── */
function ContactVisual({ inView }) {
  const contactInfo = [
    { icon: <Mail size={20} />, label: 'Email Us', value: 'info@codeverza.com' },
    { icon: <Phone size={20} />, label: 'Call Us', value: '+92 325 1507557' },
    { icon: <MapPin size={20} />, label: 'Location', value: 'Pakistan 🇵🇰' },
  ];

  return (
    <div className="cv-wrapper">

      {/* top tagline */}
      <motion.div className="cv-tagline"
        initial={{ opacity: 0, y: -20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <span className="cv-tagline-dot" />
        Available for new projects
      </motion.div>

      {/* big headline */}
      <motion.h3 className="cv-headline"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Got an idea? <br />
        <span className="cv-headline-purple">Let's build it</span><br />
        together.
      </motion.h3>

      <motion.p className="cv-desc"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        Whether you need a web app, mobile solution, or AI-powered platform — we're here to turn your vision into reality.
      </motion.p>

      {/* contact info cards */}
      <div className="cv-info-list">
        {contactInfo.map((item, i) => (
          <motion.div key={i} className="cv-info-row"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
          >
            <div className="cv-info-icon-box">{item.icon}</div>
            <div>
              <div className="cv-info-label">{item.label}</div>
              <div className="cv-info-value">{item.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* animated illustration box */}
      <motion.div className="cv-illustration"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.5 }}
      >
        {/* glow orb */}
        <div className="cv-illus-orb" />

        {/* floating code snippets */}
        <motion.div className="cv-code-block cv-code-1"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="cv-code-dot" style={{ background: '#ff5f57' }} />
          <span className="cv-code-dot" style={{ background: '#febc2e' }} />
          <span className="cv-code-dot" style={{ background: '#28c840' }} />
          <div className="cv-code-lines">
            <div className="cv-code-line" style={{ width: '80%', background: '#e0aaff' }} />
            <div className="cv-code-line" style={{ width: '60%', background: '#61dafb' }} />
            <div className="cv-code-line" style={{ width: '70%', background: '#68a063' }} />
          </div>
        </motion.div>

        <motion.div className="cv-code-block cv-code-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <span className="cv-code-dot" style={{ background: '#ff5f57' }} />
          <span className="cv-code-dot" style={{ background: '#febc2e' }} />
          <span className="cv-code-dot" style={{ background: '#28c840' }} />
          <div className="cv-code-lines">
            <div className="cv-code-line" style={{ width: '65%', background: '#ffd43b' }} />
            <div className="cv-code-line" style={{ width: '85%', background: '#e0aaff' }} />
          </div>
        </motion.div>

        {/* center icon */}
        <motion.div className="cv-illus-center"
          animate={{ boxShadow: ['0 0 30px rgba(177,76,255,0.3)', '0 0 60px rgba(177,76,255,0.6)', '0 0 30px rgba(177,76,255,0.3)'] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <Briefcase size={36} color="#b14cff" />
        </motion.div>

        {/* floating badges */}
        <motion.div className="cv-badge-float cv-badge-f1"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          ⚡ Fast Delivery
        </motion.div>
        <motion.div className="cv-badge-float cv-badge-f2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          🔒 Secure Code
        </motion.div>
        <motion.div className="cv-badge-float cv-badge-f3"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          ✨ Clean UI
        </motion.div>
      </motion.div>

    </div>
  );
}

/* ── Right Form ── */
function ContactForm({ inView }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' });
  const [focused, setFocused] = useState('');

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();

    // Loading popup
    Swal.fire({
      title: 'Sending...',
      text: 'Please wait while we send your message.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
      background: '#0d0d0d',
      color: '#fff',
    });

    try {
      await addDoc(collection(db, 'contacts'), {
        ...form,
        source: 'homepage-contact',
        createdAt: serverTimestamp(),
      });

      // Send emails
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'homepage-contact' }),
      });

      Swal.fire({
        title: 'Message Sent! 🚀',
        text: "We've received your message and will get back to you within 24 hours.",
        icon: 'success',
        confirmButtonText: 'Awesome!',
        background: '#0d0d0d',
        color: '#ffffff',
        confirmButtonColor: '#b14cff',
        iconColor: '#b14cff',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
        },
      });
      setForm({ name: '', email: '', phone: '', service: '', message: '' });
    } catch (err) {
      console.error('Firebase error:', err);
      Swal.fire({
        title: 'Oops! 😕',
        text: 'Something went wrong. Please try again or contact us directly.',
        icon: 'error',
        confirmButtonText: 'Try Again',
        background: '#0d0d0d',
        color: '#ffffff',
        confirmButtonColor: '#b14cff',
      });
    }
  };

  const services = ['Web Development', 'Mobile App', 'UI/UX Design', 'AI Solution', 'Other'];

  return (
    <motion.div className="cf-wrapper"
      initial={{ opacity: 0, x: 60 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <motion.form onSubmit={submit} className="cf-form"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        {/* form heading */}
        <div className="cf-form-header">
          <h3 className="cf-form-title">Send Us a <span>Message</span></h3>
          <p className="cf-form-sub">Fill in the details and we'll get back to you within 24 hours.</p>
        </div>
            {/* two col */}
            <div className="cf-row">
              {/* Name */}
              <div className="cf-field">
                <label className="cf-label">Your Name</label>
                <div className={`cf-input-box ${focused === 'name' ? 'cf-focused' : ''}`}>
                  <User size={16} className="cf-icon" />
                  <input name="name" value={form.name} onChange={handle}
                    onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                    placeholder="John Doe" required className="cf-input" />
                </div>
              </div>
              {/* Email */}
              <div className="cf-field">
                <label className="cf-label">Email Address</label>
                <div className={`cf-input-box ${focused === 'email' ? 'cf-focused' : ''}`}>
                  <Mail size={16} className="cf-icon" />
                  <input name="email" type="email" value={form.email} onChange={handle}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    placeholder="you@email.com" required className="cf-input" />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="cf-field cf-field-full">
              <label className="cf-label">Phone / WhatsApp (Optional)</label>
              <div className={`cf-input-box ${focused === 'phone' ? 'cf-focused' : ''}`}>
                <Phone size={16} className="cf-icon" />
                <input name="phone" type="tel" value={form.phone} onChange={handle}
                  onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
                  placeholder="+92 300 0000000" className="cf-input" />
              </div>
            </div>

            {/* Service select */}
            <div className="cf-field cf-field-full">
              <label className="cf-label">Service Needed</label>
              <div className="cf-services-grid">
                {services.map(s => (
                  <button key={s} type="button"
                    className={`cf-service-btn ${form.service === s ? 'cf-service-active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, service: s }))}
                  >{s}</button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="cf-field cf-field-full">
              <label className="cf-label">Your Message</label>
              <div className={`cf-input-box cf-textarea-box ${focused === 'message' ? 'cf-focused' : ''}`}>
                <MessageSquare size={16} className="cf-icon cf-icon-top" />
                <textarea name="message" value={form.message} onChange={handle}
                  onFocus={() => setFocused('message')} onBlur={() => setFocused('')}
                  placeholder="Tell us about your project, goals, timeline..." rows={5}
                  required className="cf-input cf-textarea" />
              </div>
            </div>

            {/* Submit */}
            <motion.button type="submit" className="cf-submit"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            >
              <span>Send Message</span>
              <Send size={18} />
            </motion.button>
          </motion.form>
    </motion.div>
  );
}

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="contact-section" id="contact" ref={ref}>
      <ParticleBg />
      <div className="contact-orb contact-orb-1" />
      <div className="contact-orb contact-orb-2" />
      <div className="contact-divider" />

      <div className="contact-grid">
        <ContactVisual inView={inView} />
        <ContactForm inView={inView} />
      </div>
    </section>
  );
}
