'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Eye, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ReusableNavbar from '../../components/reusable-navbar';
import Footer from '../../components/footer';
import './graphic-design.css';

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
        ctx.fillStyle = 'rgba(242,78,30,0.7)'; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(242,78,30,${0.18 * (1 - d / 120)})`; ctx.lineWidth = 0.8; ctx.stroke();
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

const designProjects = [
  {
    id: 'd1',
    title: 'Brand Identity — TechStart',
    tags: ['Figma', 'Illustrator', 'Brand Design'],
    desc: 'Complete brand identity design including logo, color palette, typography, and brand guidelines for a tech startup.',
    color: '#f24e1e',
    gradient: 'linear-gradient(135deg, #2a0a00, #4a1500)',
    emoji: '🎨',
    detailPage: '/pages/portfolio-page/graphic-design/brand-identity',
  },
  {
    id: 'd2',
    title: 'Social Media Design — E-Commerce',
    tags: ['Canva', 'Photoshop', 'Social Media'],
    desc: 'Complete social media design package — posts, stories, banners, and promotional graphics for an e-commerce brand.',
    color: '#00c4cc',
    gradient: 'linear-gradient(135deg, #001a1a, #003333)',
    emoji: '📱',
    detailPage: '/pages/portfolio-page/graphic-design/social-media',
  },
  {
    id: 'd3',
    title: 'UI/UX Design — Mobile App',
    tags: ['Figma', 'Adobe XD', 'Prototyping'],
    desc: 'Full UI/UX design for a mobile food delivery app — wireframes, high-fidelity screens, and interactive prototype.',
    color: '#ff9a00',
    gradient: 'linear-gradient(135deg, #2a1500, #4a2800)',
    emoji: '🖌️',
    detailPage: '/pages/portfolio-page/graphic-design/ui-ux',
  },
];

export default function GraphicDesignPage() {
  const router = useRouter();

  return (
    <>
      <ReusableNavbar />
      <main className="gd-main pb-1">
        <ParticleBg />
        <div className="gd-orb gd-orb-1" />
        <div className="gd-orb gd-orb-2" />
        <div className="gd-orb gd-orb-3" />

        {/* ── HERO ── */}
        <div className="gd-hero">
          <div className="gd-back-wrap">
            <Link href="/portfolio-page?tab=design" className="gd-back">
              <ArrowLeft size={16} /> Back to Portfolio
            </Link>
          </div>

          <motion.div className="gd-hero-badge"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <span className="gd-badge-dot" /> Design Portfolio
          </motion.div>

          <motion.h1 className="gd-hero-title"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            Graphic <span className="gd-orange">Design</span>
          </motion.h1>

          <motion.p className="gd-hero-sub"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            Click any category to explore the work. We create designs that speak your brand's language.
          </motion.p>

          <motion.div className="gd-hero-pills"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            {['Figma', 'Illustrator', 'Photoshop', 'Brand Design', 'UI/UX'].map((t, i) => (
              <span key={i} className="gd-pill"><Sparkles size={12} /> {t}</span>
            ))}
          </motion.div>
        </div>

        {/* ── CARDS GRID ── */}
        <div className="gd-content">
          <div className="gd-grid">
            {designProjects.map((p, i) => (
              <motion.div
                key={p.id}
                className="gd-card"
                style={{ '--gc': p.color }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => router.push(p.detailPage)}
              >
                {/* visual */}
                <div className="gd-card-visual" style={{ background: p.gradient }}>
                  <span className="gd-card-emoji">{p.emoji}</span>
                  <div className="gd-card-overlay">
                    <div className="gd-view-btn" style={{ background: `${p.color}80`, borderColor: `${p.color}bb` }}>
                      <Eye size={15} /> Explore Work
                    </div>
                  </div>
                </div>

                {/* body */}
                <div className="gd-card-body">
                  <div className="gd-card-cat" style={{ color: p.color }}>Graphic Design</div>
                  <h3 className="gd-card-title">{p.title}</h3>
                  <p className="gd-card-desc">{p.desc}</p>
                  <div className="gd-card-tags">
                    {p.tags.map(t => <span key={t} className="gd-tag">{t}</span>)}
                  </div>
                  <div style={{ color: p.color, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, paddingTop: '8px' }}>
                    <Eye size={13} /> View All Work <ArrowRight size={13} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <motion.div className="gd-cta"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="gd-cta-glow" />
          <h3>Want a custom design?</h3>
          <p>Tell us about your brand and we'll create something that stands out.</p>
          <Link href="/pages/contact-page" className="gd-cta-btn">
            Get a Quote <ArrowRight size={16} />
          </Link>
        </motion.div>

      </main>
      <Footer />
    </>
  );
}
