'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { db } from '../../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Swal from 'sweetalert2';
import {
  ArrowLeft, Mail, Phone, MapPin, Send,
  User, MessageSquare, CheckCircle, Clock, Globe, ArrowRight
} from 'lucide-react';
import { FaWhatsapp, FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';
import ReusableNavbar from '../../components/reusable-navbar';
import Footer from '../../components/footer';
import './contact-page.css';

/* ── Particle BG ── */
function ParticleBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h, pts, raf;
    const init = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      pts = Array.from({ length: 60 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.4,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(177,76,255,0.8)'; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(177,76,255,${0.22 * (1 - d / 120)})`; ctx.lineWidth = 0.8; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    init(); draw();
    const ro = new ResizeObserver(init); ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="cp-canvas" />;
}

const services = ['Web Development', 'Mobile App', 'UI/UX Design', 'AI Solution', 'Cloud & DevOps', 'Other'];

const contactCards = [
  { icon: <Mail size={22} />,    label: 'Email Us',      value: 'codecoves02@gmail.com', sub: 'We reply within 24 hours',   color: '#b14cff', href: 'mailto:codecoves02@gmail.com'    },
  { icon: <Phone size={22} />,   label: 'WhatsApp Us',   value: '+92 325 1507557',        sub: 'Mon–Sat, 9am–7pm PKT',       color: '#25d366', href: 'https://wa.me/923251507557'      },
  { icon: <MapPin size={22} />,  label: 'Location',      value: 'Pakistan 🇵🇰',            sub: 'Remote-first, global reach',  color: '#68a063', href: null                              },
  { icon: <Clock size={22} />,   label: 'Response Time', value: '< 24 Hours',             sub: 'Fast & reliable support',    color: '#ffd43b', href: null                              },
];

const socials = [
  { icon: <FaWhatsapp size={20} />, label: 'WhatsApp', href: 'https://wa.me/923251507557',                    color: '#25d366' },
  { icon: <FaLinkedin size={20} />, label: 'LinkedIn', href: 'https://www.linkedin.com/feed/',        color: '#0077b5' },
  { icon: <FaGithub size={20} />,   label: 'GitHub',   href: 'https://github.com/codecoves02',                  color: '#fff'    },
  { icon: <FaInstagram size={20} />,label: 'Instagram', href: 'https://www.instagram.com/codecoves?igsh=Z2NkOW84ejE1cXQ3',              color: '#e535ab' },
];

const faqs = [
  { q: 'How long does a project take?',         a: 'Timelines vary by scope. A simple website takes 1–2 weeks; complex apps can take 4–12 weeks. We always give a clear estimate upfront.' },
  { q: 'Do you work with international clients?',a: 'Absolutely. We work with clients across Pakistan, UK, UAE, USA, and beyond. Communication is fully remote and seamless.' },
  { q: 'What is your payment structure?',        a: 'We typically work with a 50% upfront and 50% on delivery model. Milestone-based payments are also available for larger projects.' },
  { q: 'Will I own the source code?',            a: 'Yes. Once the project is complete and payment is settled, full ownership of the source code transfers to you.' },
];

function FAQItem({ q, a, i, isOpen, onToggle }) {
  return (
    <motion.div className="cp-faq-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
      <button className={`cp-faq-q ${isOpen ? 'cp-faq-open' : ''}`} onClick={onToggle}>
        {q}
        <span className="cp-faq-arrow">{isOpen ? '−' : '+'}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div className="cp-faq-a" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <p>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ContactForm() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', budget: '', message: '' });
  const [focused, setFocused] = useState('');
  const [sent, setSent] = useState(false);

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
        source: 'contact-page',
        createdAt: serverTimestamp(),
      });

      // Send emails
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'contact-page' }),
      });

      Swal.fire({
        title: 'Message Sent! 🚀',
        text: "Thanks for reaching out! We'll get back to you within 24 hours.",
        icon: 'success',
        confirmButtonText: 'Great, thanks!',
        background: '#0d0d0d',
        color: '#ffffff',
        confirmButtonColor: '#b14cff',
        iconColor: '#b14cff',
      });
      setForm({ name: '', email: '', phone: '', service: '', message: '' });
    } catch (err) {
      console.error('Firebase error:', err);
      Swal.fire({
        title: 'Oops! 😕',
        text: 'Something went wrong. Please try again or reach us on WhatsApp.',
        icon: 'error',
        confirmButtonText: 'Try Again',
        background: '#0d0d0d',
        color: '#ffffff',
        confirmButtonColor: '#b14cff',
      });
    }
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  // const budgets = ['< $500', '$500–$1k', '$1k–$5k', '$5k–$10k', '$10k+'];

  return (
    <motion.div ref={ref} className="cp-form-card"
      initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
    >
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div key="success" className="cp-success"
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
              <CheckCircle size={64} color="#68a063" />
            </motion.div>
            <h3>Message Sent!</h3>
            <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
            <button className="cp-success-btn" onClick={() => setSent(false)}>Send Another</button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="cp-form-header">
              <h3>Send Us a <span>Message</span></h3>
              <p>Fill in the details below and we'll get back to you shortly.</p>
            </div>

            {/* name + email */}
            <div className="cp-row">
              {[
                { name: 'name',  label: 'Full Name',     icon: <User size={15} />,  type: 'text',  placeholder: 'Muhammad'         },
                { name: 'email', label: 'Email Address', icon: <Mail size={15} />,  type: 'email', placeholder: 'you@gmail.com'    },
              ].map(f => (
                <div key={f.name} className="cp-field">
                  <label className="cp-label">{f.label}</label>
                  <div className={`cp-input-box ${focused === f.name ? 'cp-focused' : ''}`}>
                    <span className="cp-icon">{f.icon}</span>
                    <input name={f.name} type={f.type} value={form[f.name]} onChange={handle}
                      onFocus={() => setFocused(f.name)} onBlur={() => setFocused('')}
                      placeholder={f.placeholder} required className="cp-input" />
                  </div>
                </div>
              ))}
            </div>

            {/* phone */}
            <div className="cp-field">
              <label className="cp-label">Phone (Optional)</label>
              <div className={`cp-input-box ${focused === 'phone' ? 'cp-focused' : ''}`}>
                <span className="cp-icon"><Phone size={15} /></span>
                <input name="phone" type="tel" value={form.phone} onChange={handle}
                  onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
                  placeholder="+92 300 0000000" className="cp-input" />
              </div>
            </div>

            {/* service */}
            <div className="cp-field">
              <label className="cp-label">Service Needed</label>
              <div className="cp-chips">
                {services.map(s => (
                  <button key={s} type="button"
                    className={`cp-chip ${form.service === s ? 'cp-chip-active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, service: s }))}
                  >{s}</button>
                ))}
              </div>
            </div>

            {/* budget */}
            {/* <div className="cp-field">
              <label className="cp-label">Estimated Budget</label>
              <div className="cp-chips">
                {budgets.map(b => (
                  <button key={b} type="button"
                    className={`cp-chip ${form.budget === b ? 'cp-chip-active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, budget: b }))}
                  >{b}</button>
                ))}
              </div>
            </div> */}

            {/* message */}
            <div className="cp-field">
              <label className="cp-label">Your Message</label>
              <div className={`cp-input-box cp-textarea-box ${focused === 'message' ? 'cp-focused' : ''}`}>
                <span className="cp-icon cp-icon-top"><MessageSquare size={15} /></span>
                <textarea name="message" value={form.message} onChange={handle}
                  onFocus={() => setFocused('message')} onBlur={() => setFocused('')}
                  placeholder="Tell us about your project, goals, and timeline..." rows={5}
                  required className="cp-input cp-textarea" />
              </div>
            </div>

            <motion.button type="submit" className="cp-submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Send size={18} /> Send Message <ArrowRight size={16} />
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ContactPage() {
  const [faqOpen, setFaqOpen] = useState(null);
  const toggleFaq = (i) => setFaqOpen(faqOpen === i ? null : i);
  return (
    <>
      <ReusableNavbar />
      <main className="cp-main pb-1">
        <ParticleBg />
        <div className="cp-orb cp-orb-1" />
        <div className="cp-orb cp-orb-2" />
        <div className="cp-orb cp-orb-3" />

        {/* ── HERO ── */}
        <div className="cp-hero">
          <div className="cp-back-wrap">
            <Link href="/" className="cp-back"><ArrowLeft size={16} /> Back to Home</Link>
          </div>
          <motion.div className="cp-hero-badge" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="cp-badge-dot" /> Get In Touch
          </motion.div>
          <motion.h1 className="cp-hero-title" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            Let's Build Something<br /><span className="cp-purple">Amazing Together</span>
          </motion.h1>
          <motion.p className="cp-hero-sub" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            Have a project in mind? We'd love to hear about it. Drop us a message and we'll get back to you within 24 hours.
          </motion.p>

          {/* quick info pills */}
          <motion.div className="cp-hero-pills" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <span className="cp-pill"><Clock size={13} /> 24h Response</span>
            <span className="cp-pill"><Globe size={13} /> Remote Friendly</span>
            <span className="cp-pill"><CheckCircle size={13} /> Free Consultation</span>
          </motion.div>
        </div>

        {/* ── CONTACT CARDS ── */}
        <div className="cp-cards-section">
          <div className="cp-cards-grid">
            {contactCards.map((c, i) => {
              const CardWrapper = c.href ? 'a' : 'div';
              return (
                <motion.div key={i} className={`cp-info-card ${c.href ? 'cp-info-card-link' : ''}`}
                  style={{ '--cc': c.color }}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                >
                  <CardWrapper href={c.href || undefined} target={c.href ? '_blank' : undefined} rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'contents' }}>
                    <div className="cp-info-icon" style={{ color: c.color, boxShadow: `0 0 20px ${c.color}30` }}>
                      {c.icon}
                    </div>
                    <div className="cp-info-label">{c.label}</div>
                    <div className="cp-info-value">{c.value}</div>
                    <div className="cp-info-sub">{c.sub}</div>
                  </CardWrapper>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── MAIN FORM + SIDEBAR ── */}
        <div className="cp-main-grid">

          {/* form */}
          <ContactForm />

          {/* sidebar */}
          <div className="cp-sidebar">

            {/* why us */}
            <motion.div className="cp-why-card"
              initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
            >
              <h4 className="cp-sidebar-title">Why Work With Us?</h4>
              {[
                '✅ Clean, maintainable code',
                '✅ On-time delivery, always',
                '✅ Transparent communication',
                '✅ Post-launch support included',
                '✅ Competitive pricing',
                '✅ Full source code ownership',
              ].map((item, i) => (
                <motion.div key={i} className="cp-why-item"
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                >{item}</motion.div>
              ))}
            </motion.div>

            {/* socials */}
            <motion.div className="cp-social-card"
              initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h4 className="cp-sidebar-title">Find Us On</h4>
              <div className="cp-socials">
                {socials.map((s, i) => (
                  <motion.a key={i} target='_blank' href={s.href} className="cp-social-btn"
                    style={{ '--sc': s.color }}
                    whileHover={{ scale: 1.1, y: -3 }} whileTap={{ scale: 0.95 }}
                  >
                    <span style={{ color: s.color }}>{s.icon}</span>
                    <span>{s.label}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* availability */}
            <motion.div className="cp-avail-card"
              initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="cp-avail-dot" />
              <div>
                <div className="cp-avail-title">Currently Available</div>
                <div className="cp-avail-sub">Taking on new projects — let's talk!</div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="cp-faq-section">
          <motion.div className="cp-section-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            Common Questions
          </motion.div>
          <motion.h2 className="cp-section-title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            Frequently Asked <span className="cp-purple">Questions</span>
          </motion.h2>
          <div className="cp-faq-list">
            {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} i={i} isOpen={faqOpen === i} onToggle={() => toggleFaq(i)} />)}
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <motion.div className="cp-bottom-cta"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="cp-bottom-glow" />
          <h3>Still have questions?</h3>
          <p>Reach out directly and we'll be happy to help.</p>
          <a href="mailto:codecoves02@gmail.com" className="cp-bottom-btn">
            <Mail size={18} /> codecoves02@gmail.com
          </a>
        </motion.div>

      </main>
      <Footer />
    </>
  );
}
