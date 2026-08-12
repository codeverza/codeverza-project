'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, FileText, ArrowRight } from 'lucide-react';
import ReusableNavbar from '../components/reusable-navbar';
import Footer from '../components/footer';
import './terms.css';

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
            ctx.strokeStyle = `rgba(177,76,255,${0.18*(1-d/120)})`; ctx.lineWidth = 0.8; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    init(); draw();
    const ro = new ResizeObserver(init); ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="tc-canvas" />;
}

const sections = [
  {
    num: '01', title: 'Acceptance of Terms',
    points: [
      'By accessing or using Codeverza\'s website or services, you agree to be bound by these Terms and Conditions.',
      'If you do not agree with any part of these terms, please do not use our services.',
      'These terms apply to all visitors, clients, and anyone who accesses or uses our services.',
      'We reserve the right to update these terms at any time. Continued use of our services constitutes acceptance of any changes.',
    ],
  },
  {
    num: '02', title: 'Services',
    points: [
      'Codeverza provides software development, design, and consulting services as agreed upon in individual project contracts.',
      'The scope, timeline, and deliverables of each project are defined in a separate agreement or proposal.',
      'We reserve the right to refuse service to anyone for any reason at any time.',
      'Service availability may vary and we do not guarantee uninterrupted access to our website or services.',
    ],
  },
  {
    num: '03', title: 'Project Agreements & Payments',
    points: [
      'All projects begin with a written agreement outlining scope, timeline, cost, and deliverables.',
      'A deposit (typically 50%) is required before work begins. The remaining balance is due upon project completion.',
      'For larger projects, milestone-based payment schedules may be arranged and agreed upon in writing.',
      'Failure to make timely payments may result in work being paused until payment is received.',
      'All prices are in USD unless otherwise agreed. Taxes, if applicable, are the client\'s responsibility.',
    ],
  },
  {
    num: '04', title: 'Intellectual Property & Ownership',
    points: [
      'Upon full payment, the client receives full ownership of all custom code, designs, and deliverables created for their project.',
      'Codeverza retains the right to showcase completed work in our portfolio unless the client requests confidentiality in writing.',
      'Any third-party libraries, frameworks, or tools used remain subject to their respective licenses.',
      'Pre-existing intellectual property owned by Codeverza (templates, tools, processes) remains our property.',
    ],
  },
  {
    num: '05', title: 'Client Responsibilities',
    points: [
      'Clients are responsible for providing accurate, complete, and timely information required for the project.',
      'Delays caused by late feedback, missing content, or unresponsiveness may affect the project timeline.',
      'Clients must ensure they have the legal right to use any content, images, or materials they provide to us.',
      'Clients are responsible for reviewing and approving deliverables within the agreed timeframe.',
    ],
  },
  {
    num: '06', title: 'Revisions & Changes',
    points: [
      'Each project includes a defined number of revision rounds as specified in the project agreement.',
      'Revisions beyond the agreed scope may incur additional charges, which will be communicated before proceeding.',
      'Significant changes to project scope after work has begun may affect both timeline and cost.',
      'All change requests must be submitted in writing via email or the agreed communication channel.',
    ],
  },
  {
    num: '07', title: 'Confidentiality',
    points: [
      'Both parties agree to keep confidential any sensitive business information shared during the project.',
      'Codeverza will not disclose client data, project details, or proprietary information to third parties without consent.',
      'This confidentiality obligation survives the termination of any project agreement.',
      'Clients agree not to share our internal processes, pricing structures, or proprietary methodologies.',
    ],
  },
  {
    num: '08', title: 'Limitation of Liability',
    points: [
      'Codeverza is not liable for any indirect, incidental, or consequential damages arising from the use of our services.',
      'Our total liability for any claim shall not exceed the total amount paid by the client for the specific project.',
      'We are not responsible for losses caused by third-party services, hosting providers, or external factors beyond our control.',
      'Clients are responsible for maintaining backups of their data and content.',
    ],
  },
  {
    num: '09', title: 'Termination',
    points: [
      'Either party may terminate a project agreement with written notice if the other party materially breaches the terms.',
      'Upon termination, the client is responsible for payment of all work completed up to the termination date.',
      'Codeverza reserves the right to terminate services immediately if a client engages in abusive, illegal, or unethical behavior.',
      'Deliverables will only be transferred upon receipt of all outstanding payments.',
    ],
  },
  {
    num: '10', title: 'Governing Law & Contact',
    points: [
      'These Terms and Conditions are governed by the laws of Pakistan.',
      'Any disputes shall first be attempted to be resolved through good-faith negotiation between both parties.',
      'If you have any questions about these terms, please contact us at codeverza02@gmail.com.',
      'We aim to respond to all legal inquiries within 5 business days.',
    ],
  },
];

function TermSection({ section }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} className="tc-card"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55 }}
    >
      <div className="tc-card-header">
        <div className="tc-card-num">{section.num}</div>
        <h2 className="tc-card-title">{section.title}</h2>
      </div>
      <ul className="tc-card-list">
        {section.points.map((p, i) => (
          <motion.li key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.08 + i * 0.07 }}
          >
            <span className="tc-bullet" />{p}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function TermsPage() {
  return (
    <>
      <ReusableNavbar />
      <main className="tc-main pb-1">
        <ParticleBg />
        <div className="tc-orb tc-orb-1" />
        <div className="tc-orb tc-orb-2" />

        {/* HERO */}
        <div className="tc-hero">
          <div className="tc-back-wrap">
            <Link href="/" className="tc-back"><ArrowLeft size={16} /> Back to Home</Link>
          </div>

          <motion.div className="tc-hero-icon"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
          >
            <FileText size={40} color="#b14cff" />
            <motion.div className="tc-hero-ring"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </motion.div>

          <motion.div className="tc-hero-badge"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            <span className="tc-badge-dot" /> Legal
          </motion.div>

          <motion.h1 className="tc-hero-title"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            Terms & <span className="tc-purple">Conditions</span>
          </motion.h1>

          <motion.p className="tc-hero-sub"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            Please read these terms carefully before using our services. By working with Codeverza, you agree to the following.
          </motion.p>

          <motion.div className="tc-meta"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          >
            <span>Last updated: January 2025</span>
            <span className="tc-meta-dot" />
            <span>Effective immediately</span>
          </motion.div>
        </div>

        {/* SUMMARY */}
        <motion.div className="tc-summary"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="tc-summary-inner">
            <h3>The Short Version</h3>
            <p>Be honest, pay on time, respect each other's work, and we'll build something great together.</p>
            <div className="tc-summary-pills">
              {['Fair agreements', 'Full code ownership', 'Transparent pricing', 'Mutual respect'].map((p, i) => (
                <span key={i} className="tc-pill">✓ {p}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* SECTIONS */}
        <div className="tc-content">
          {sections.map((s, i) => <TermSection key={i} section={s} />)}
        </div>

        {/* BOTTOM */}
        <motion.div className="tc-bottom"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <FileText size={32} color="#b14cff" />
          <h3>Questions about our terms?</h3>
          <p>We're happy to clarify anything before you get started.</p>
          <Link href="/pages/contact-page" className="tc-cta-btn">
            Contact Us <ArrowRight size={16} />
          </Link>
        </motion.div>

      </main>
      <Footer />
    </>
  );
}
