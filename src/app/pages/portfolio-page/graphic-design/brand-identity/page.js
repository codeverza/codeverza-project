'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import ReusableNavbar from '../../../../components/reusable-navbar';
import Footer from '../../../../components/footer';
import '../graphic-design.css';
import './brand-identity.css';

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
        ctx.fillStyle = 'rgba(242,78,30,0.65)'; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(242,78,30,${0.16 * (1 - d / 120)})`; ctx.lineWidth = 0.8; ctx.stroke();
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

/* ── Brand work items — replace emoji/gradient with real images when ready ── */
const brandWork = [
  {
    id: 1, label: 'Primary Logo', emoji: '🏷️',
    gradient: 'linear-gradient(135deg, #2a0a00, #5a1e00)',
    desc: 'Main brand mark — wordmark + icon variant',
    tags: ['Illustrator', 'Logo Design'],
  },
  {
    id: 2, label: 'Color Palette', emoji: '🎨',
    gradient: 'linear-gradient(135deg, #1a0030, #3d0060)',
    desc: 'Primary, secondary & accent color system',
    tags: ['Brand System', 'Figma'],
  },
  {
    id: 3, label: 'Typography', emoji: '🔤',
    gradient: 'linear-gradient(135deg, #001a2a, #003a5a)',
    desc: 'Heading + body typeface selection & pairing',
    tags: ['Typography', 'Brand Design'],
  },
  {
    id: 4, label: 'Business Card', emoji: '💼',
    gradient: 'linear-gradient(135deg, #0a1a00, #1a3a00)',
    desc: 'Front & back business card — print-ready',
    tags: ['Print Design', 'Illustrator'],
  },
  {
    id: 5, label: 'Letterhead', emoji: '📄',
    gradient: 'linear-gradient(135deg, #2a1500, #4a2800)',
    desc: 'Official letterhead & stationery design',
    tags: ['Stationery', 'Print Design'],
  },
  {
    id: 6, label: 'Social Media Kit', emoji: '📲',
    gradient: 'linear-gradient(135deg, #00101a, #002a3a)',
    desc: 'Profile picture, cover & post templates',
    tags: ['Social Media', 'Canva'],
  },
  {
    id: 7, label: 'Brand Guidelines', emoji: '📋',
    gradient: 'linear-gradient(135deg, #1a001a, #3a0040)',
    desc: 'Full brand guidelines document — do\'s & don\'ts',
    tags: ['Documentation', 'Figma'],
  },
  {
    id: 8, label: 'Icon Set', emoji: '✳️',
    gradient: 'linear-gradient(135deg, #001a10, #003a20)',
    desc: 'Custom icon set aligned to brand identity',
    tags: ['Icons', 'Illustrator'],
  },
  {
    id: 9, label: 'Brand Mockups', emoji: '🖼️',
    gradient: 'linear-gradient(135deg, #1a0800, #3a1800)',
    desc: 'Real-world mockups — tshirt, mug, signage',
    tags: ['Mockups', 'Photoshop'],
  },
];

export default function BrandIdentityPage() {
  return (
    <>
      <ReusableNavbar />
      <main className="gd-main pb-1">
        <ParticleBg />
        <div className="gd-orb gd-orb-1" />
        <div className="gd-orb gd-orb-2" />
        <div className="gd-orb gd-orb-3" />

        {/* ── BACK BUTTON ── */}
        <div style={{
          position: 'relative', zIndex: 2,
          padding: '90px 6% 0',
        }}>
          <Link href="/pages/portfolio-page" className="gd-back mt-[30px]">
            <ArrowLeft size={16} /> Back to Portfolio
          </Link>
        </div>

        {/* ── HERO ── */}
        <div className="gd-hero">

          <motion.div className="gd-hero-badge"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <span className="gd-badge-dot" /> Brand Design
          </motion.div>

          <motion.h1 className="gd-hero-title"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            Brand <span className="gd-orange">Identity</span>
          </motion.h1>

          <motion.p className="gd-hero-sub"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            A complete brand identity system — from logo to guidelines. Every element crafted to make your brand unforgettable.
          </motion.p>

          <motion.div className="gd-hero-pills"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            {['Figma', 'Illustrator', 'Photoshop', 'Brand System'].map((t, i) => (
              <span key={i} className="gd-pill"><Sparkles size={12} /> {t}</span>
            ))}
          </motion.div>
        </div>

        {/* ── WORK GRID ── */}
        <div className="gd-content">
          <div className="bi-section-label">What We Create</div>
          <h2 className="bi-section-title">Brand Identity <span className="gd-orange">Deliverables</span></h2>
          <div className="bi-grid">
            {brandWork.map((item, i) => (
              <motion.div
                key={item.id}
                className="bi-card"
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
              >
                <div className="bi-card-visual" style={{ background: item.gradient }}>
                  <span className="bi-card-emoji">{item.emoji}</span>
                  <div className="bi-card-shine" />
                </div>
                <div className="bi-card-body">
                  <div className="bi-card-label">{item.label}</div>
                  <p className="bi-card-desc">{item.desc}</p>
                  <div className="bi-card-tags">
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
          <div className="gd-section-label">Package Includes</div>
          <h2 className="gd-section-title">Every Brand Package <span className="gd-orange">Includes</span></h2>
          <div className="gd-offer-grid">
            {[
              'Primary + secondary logo variants',
              'Full color palette system',
              'Typography selection & pairing',
              'Business card design (print-ready)',
              'Letterhead & stationery',
              'Social media kit (profile + cover)',
              'Brand guidelines document',
              'All source files (AI / Figma)',
            ].map((item, i) => (
              <motion.div key={i} className="gd-offer-item"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <CheckCircle size={16} color="#f24e1e" style={{ flexShrink: 0 }} />
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div className="gd-cta"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="gd-cta-glow" />
          <h3>Need a brand identity?</h3>
          <p>Let's build a brand that people remember.</p>
          <Link href="/pages/contact-page" className="gd-cta-btn">
            Get Started <ArrowRight size={16} />
          </Link>
        </motion.div>

      </main>
      <Footer />
    </>
  );
}
