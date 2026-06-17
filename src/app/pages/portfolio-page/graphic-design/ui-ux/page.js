'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import ReusableNavbar from '../../../../components/reusable-navbar';
import Footer from '../../../../components/footer';
import '../graphic-design.css';
import './ui-ux.css';

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
        ctx.fillStyle = 'rgba(255,154,0,0.65)'; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(255,154,0,${0.16 * (1 - d / 120)})`; ctx.lineWidth = 0.8; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    init(); draw();
    const ro = new ResizeObserver(init); ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="gd-canvas" />;
}

const uiuxWork = [
  {
    id: 1, label: 'User Research', emoji: '🔍',
    gradient: 'linear-gradient(135deg, #1a0f00, #3a2000)',
    desc: 'Competitor analysis, user interviews & persona creation',
    tags: ['Research', 'UX'],
    phase: 'Discovery',
  },
  {
    id: 2, label: 'Wireframes', emoji: '📐',
    gradient: 'linear-gradient(135deg, #001a28, #003348)',
    desc: 'Low-fidelity wireframes — layout & user flow mapping',
    tags: ['Wireframing', 'Figma'],
    phase: 'Design',
  },
  {
    id: 3, label: 'UI Design', emoji: '🎨',
    gradient: 'linear-gradient(135deg, #200028, #4a0060)',
    desc: 'High-fidelity screens — pixel-perfect UI design',
    tags: ['UI Design', 'Figma'],
    phase: 'Design',
  },
  {
    id: 4, label: 'Component Library', emoji: '🧩',
    gradient: 'linear-gradient(135deg, #001a10, #003320)',
    desc: 'Reusable component system — buttons, forms, cards',
    tags: ['Design System', 'Figma'],
    phase: 'Design',
  },
  {
    id: 5, label: 'Prototype', emoji: '▶️',
    gradient: 'linear-gradient(135deg, #1a1000, #3a2500)',
    desc: 'Clickable interactive prototype for user testing',
    tags: ['Prototyping', 'Figma'],
    phase: 'Prototype',
  },
  {
    id: 6, label: 'User Testing', emoji: '🧪',
    gradient: 'linear-gradient(135deg, #001428, #003060)',
    desc: 'Usability testing sessions & heatmap analysis',
    tags: ['Testing', 'UX'],
    phase: 'Testing',
  },
  {
    id: 7, label: 'Mobile App Screens', emoji: '📱',
    gradient: 'linear-gradient(135deg, #1a0030, #3d0070)',
    desc: 'iOS & Android screen designs — all breakpoints',
    tags: ['Mobile', 'UI Design'],
    phase: 'Design',
  },
  {
    id: 8, label: 'Web App Design', emoji: '🖥️',
    gradient: 'linear-gradient(135deg, #001a18, #003530)',
    desc: 'Dashboard, admin panel & web application UI',
    tags: ['Web App', 'Figma'],
    phase: 'Design',
  },
  {
    id: 9, label: 'Design Handoff', emoji: '📦',
    gradient: 'linear-gradient(135deg, #1a0800, #3a1500)',
    desc: 'Dev-ready handoff — specs, assets & style tokens',
    tags: ['Handoff', 'Zeplin'],
    phase: 'Delivery',
  },
];

const phaseColors = {
  Discovery: '#b14cff',
  Design: '#ff9a00',
  Prototype: '#00c4cc',
  Testing: '#f24e1e',
  Delivery: '#68d391',
};

export default function UiUxPage() {
  return (
    <>
      <ReusableNavbar />
      <main className="gd-main pb-1">
        <ParticleBg />
        <div className="ux-orb ux-orb-1" />
        <div className="ux-orb ux-orb-2" />
        <div className="ux-orb ux-orb-3" />

        {/* ── BACK BUTTON ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '90px 6% 0' }}>
          <Link href="/pages/portfolio-page" className="gd-back mt-[30px]">
            <ArrowLeft size={16} /> Back to Portfolio
          </Link>
        </div>

        {/* ── HERO ── */}
        <div className="gd-hero" style={{ borderBottomColor: 'rgba(255,154,0,0.12)' }}>

          <motion.div className="ux-hero-badge"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <span className="ux-badge-dot" /> UI/UX Design
          </motion.div>

          <motion.h1 className="gd-hero-title"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            UI<span className="ux-slash">/</span>UX <span className="ux-amber">Design</span>
          </motion.h1>

          <motion.p className="gd-hero-sub"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            From research to pixel-perfect screens — we design experiences that users love and businesses rely on.
          </motion.p>

          <motion.div className="gd-hero-pills"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            {['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems'].map((t, i) => (
              <span key={i} className="ux-pill"><Sparkles size={12} /> {t}</span>
            ))}
          </motion.div>
        </div>

        {/* ── WORK GRID ── */}
        <div className="gd-content">
          <div className="ux-section-label">Our Process</div>
          <h2 className="ux-section-title">UI/UX <span className="ux-amber">Deliverables</span></h2>
          <div className="ux-grid">
            {uiuxWork.map((item, i) => (
              <motion.div
                key={item.id}
                className="ux-card"
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
              >
                <div className="ux-card-visual" style={{ background: item.gradient }}>
                  <span className="ux-card-emoji">{item.emoji}</span>
                  <div className="ux-phase-badge"
                    style={{ background: phaseColors[item.phase] + '33', borderColor: phaseColors[item.phase] + '66', color: phaseColors[item.phase] }}
                  >
                    {item.phase}
                  </div>
                  <div className="ux-card-shine" />
                </div>
                <div className="ux-card-body">
                  <div className="ux-card-label">{item.label}</div>
                  <p className="ux-card-desc">{item.desc}</p>
                  <div className="ux-card-tags">
                    {item.tags.map(t => <span key={t} className="gd-tag">{t}</span>)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── WHAT WE DELIVER ── */}
        <motion.div className="gd-offer"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="ux-section-label">What You Get</div>
          <h2 className="gd-section-title">Every Project <span className="ux-amber">Includes</span></h2>
          <div className="gd-offer-grid">
            {[
              'User research & personas',
              'Wireframes & user flows',
              'High-fidelity UI screens',
              'Component / design system',
              'Clickable Figma prototype',
              'Usability testing report',
              'Developer handoff (Zeplin)',
              'Source files — all formats',
            ].map((item, i) => (
              <motion.div key={i} className="gd-offer-item"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <CheckCircle size={16} color="#ff9a00" style={{ flexShrink: 0 }} />
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div className="ux-cta"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="ux-cta-glow" />
          <h3>Need a UI/UX design?</h3>
          <p>We design experiences that convert visitors into loyal users.</p>
          <Link href="/pages/contact-page" className="ux-cta-btn">
            Get Started <ArrowRight size={16} />
          </Link>
        </motion.div>

      </main>
      <Footer />
    </>
  );
}
