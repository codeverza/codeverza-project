'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, Database, Bell, Mail, RefreshCw, UserCheck, Globe } from 'lucide-react';
import ReusableNavbar from '../components/reusable-navbar';
import Footer from '../components/footer';
import './privacy-policy.css';

function ParticleBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h, pts, raf;
    const init = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      pts = Array.from({ length: 50 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.4,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(177,76,255,0.7)'; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(177,76,255,${0.18 * (1 - d / 120)})`; ctx.lineWidth = 0.8; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    init(); draw();
    const ro = new ResizeObserver(init); ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="prv-canvas" />;
}

const sections = [
  {
    icon: <Eye size={22} />,
    title: 'Information We Collect',
    content: [
      'Personal identification information (name, email address, phone number) when you contact us or fill out our forms.',
      'Technical data such as IP address, browser type, and pages visited when you use our website.',
      'Project-related information you voluntarily share with us during consultations or project discussions.',
      'Communication records including emails and messages exchanged with our team.',
    ],
  },
  {
    icon: <Database size={22} />,
    title: 'How We Use Your Information',
    content: [
      'To respond to your inquiries and provide the services you have requested.',
      'To send project updates, invoices, and relevant communications related to your project.',
      'To improve our website, services, and overall user experience.',
      'To comply with legal obligations and protect our legitimate business interests.',
      'We do not sell, trade, or rent your personal information to third parties.',
    ],
  },
  {
    icon: <Lock size={22} />,
    title: 'Data Security',
    content: [
      'We implement industry-standard security measures to protect your personal data from unauthorized access, alteration, or disclosure.',
      'All data transmitted between your browser and our servers is encrypted using SSL/TLS technology.',
      'Access to your personal information is restricted to authorized team members only.',
      'We regularly review and update our security practices to maintain the highest level of protection.',
    ],
  },
  {
    icon: <Globe size={22} />,
    title: 'Cookies & Tracking',
    content: [
      'Our website may use cookies to enhance your browsing experience and remember your preferences.',
      'We use analytics tools to understand how visitors interact with our website — all data is anonymized.',
      'You can control cookie settings through your browser preferences at any time.',
      'We do not use cookies for advertising or tracking across third-party websites.',
    ],
  },
  {
    icon: <UserCheck size={22} />,
    title: 'Your Rights',
    content: [
      'You have the right to access, correct, or delete any personal information we hold about you.',
      'You may request a copy of your data or ask us to stop processing it at any time.',
      'You can opt out of any marketing communications by contacting us directly.',
      'To exercise any of these rights, please reach out to us at codeverza02@gmail.com.',
    ],
  },
  {
    icon: <Bell size={22} />,
    title: 'Third-Party Services',
    content: [
      'We may use trusted third-party services (such as payment processors or analytics tools) that have their own privacy policies.',
      'We carefully vet all third-party providers to ensure they meet our data protection standards.',
      'We are not responsible for the privacy practices of external websites linked from our site.',
    ],
  },
  {
    icon: <RefreshCw size={22} />,
    title: 'Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.',
      'Any significant changes will be communicated via email or a prominent notice on our website.',
      'Your continued use of our services after changes are posted constitutes your acceptance of the updated policy.',
      'We encourage you to review this page periodically to stay informed.',
    ],
  },
  {
    icon: <Mail size={22} />,
    title: 'Contact Us',
    content: [
      'If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:',
      'Email: codeverza02@gmail.com',
      'WhatsApp: +92 325 1507557',
      'We aim to respond to all privacy-related inquiries within 48 hours.',
    ],
  },
];

function PolicySection({ section, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className="prv-section-card"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: 0.05 }}
    >
      <div className="prv-section-header">
        <div className="prv-section-icon">{section.icon}</div>
        <div className="prv-section-num">0{index + 1}</div>
        <h2 className="prv-section-title">{section.title}</h2>
      </div>
      <ul className="prv-section-list">
        {section.content.map((item, i) => (
          <motion.li key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 + i * 0.07 }}
          >
            <span className="prv-bullet" />
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <ReusableNavbar />
      <main className="prv-main pb-1">
        <ParticleBg />
        <div className="prv-orb prv-orb-1" />
        <div className="prv-orb prv-orb-2" />

        {/* ── HERO ── */}
        <div className="prv-hero">
          <div className="prv-back-wrap">
            <Link href="/" className="prv-back"><ArrowLeft size={16} /> Back to Home</Link>
          </div>

          <motion.div className="prv-hero-icon"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
          >
            <Shield size={40} color="#b14cff" />
            <motion.div className="prv-hero-icon-ring"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </motion.div>

          <motion.div className="prv-hero-badge"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="prv-badge-dot" /> Legal
          </motion.div>

          <motion.h1 className="prv-hero-title"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            Privacy <span className="prv-purple">Policy</span>
          </motion.h1>

          <motion.p className="prv-hero-sub"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          >
            Your privacy matters to us. This policy explains how Codeverza collects, uses, and protects your personal information.
          </motion.p>

          <motion.div className="prv-meta"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          >
            <span>Last updated: January 2025</span>
            <span className="prv-meta-dot" />
            <span>Effective immediately</span>
          </motion.div>
        </div>

        {/* ── QUICK SUMMARY ── */}
        <motion.div className="prv-summary"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="prv-summary-inner">
            <h3>The Short Version</h3>
            <p>We collect only what we need, we never sell your data, we keep it secure, and you're always in control. Simple as that.</p>
            <div className="prv-summary-pills">
              {['No data selling', 'SSL encrypted', 'You own your data', 'GDPR friendly'].map((p, i) => (
                <span key={i} className="prv-pill">✓ {p}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── SECTIONS ── */}
        <div className="prv-content">
          {sections.map((s, i) => (
            <PolicySection key={i} section={s} index={i} />
          ))}
        </div>

        {/* ── BOTTOM ── */}
        <motion.div className="prv-bottom"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <Shield size={32} color="#b14cff" />
          <h3>We take your privacy seriously.</h3>
          <p>If you have any questions about this policy, don't hesitate to reach out.</p>
          <Link href="/pages/contact-page" className="prv-cta-btn">
            Contact Us
          </Link>
        </motion.div>

      </main>
      <Footer />
    </>
  );
}
