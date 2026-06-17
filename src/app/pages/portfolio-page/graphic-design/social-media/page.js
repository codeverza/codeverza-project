'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import ReusableNavbar from '../../../../components/reusable-navbar';
import Footer from '../../../../components/footer';
import '../graphic-design.css';
import './social-media.css';

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
        ctx.fillStyle = 'rgba(0,196,204,0.65)'; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0,196,204,${0.16 * (1 - d / 120)})`; ctx.lineWidth = 0.8; ctx.stroke();
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

/* ── Social media design items ── */
const socialWork = [
  {
    id: 1, label: 'Instagram Post', emoji: '📸',
    gradient: 'linear-gradient(135deg, #001a1a, #003333)',
    desc: 'Square post templates — product, promo & lifestyle',
    tags: ['Instagram', 'Canva'],
    platform: 'Instagram',
  },
  {
    id: 2, label: 'Instagram Story', emoji: '📖',
    gradient: 'linear-gradient(135deg, #1a0030, #3a0060)',
    desc: 'Vertical story templates with swipe-up CTA',
    tags: ['Instagram', 'Stories'],
    platform: 'Instagram',
  },
  {
    id: 3, label: 'Facebook Banner', emoji: '🖥️',
    gradient: 'linear-gradient(135deg, #001428, #002a50)',
    desc: 'Cover photo & timeline banner — brand-aligned',
    tags: ['Facebook', 'Photoshop'],
    platform: 'Facebook',
  },
  {
    id: 4, label: 'Facebook Ad', emoji: '📢',
    gradient: 'linear-gradient(135deg, #002010, #004020)',
    desc: 'Conversion-focused ad creatives — single & carousel',
    tags: ['Facebook Ads', 'Canva'],
    platform: 'Facebook',
  },
  {
    id: 5, label: 'Sale Poster', emoji: '🏷️',
    gradient: 'linear-gradient(135deg, #2a0a00, #5a1e00)',
    desc: 'Seasonal & flash sale promotional graphics',
    tags: ['Promotions', 'Photoshop'],
    platform: 'Multi-Platform',
  },
  {
    id: 6, label: 'Product Highlight', emoji: '✨',
    gradient: 'linear-gradient(135deg, #1a1a00, #3a3a00)',
    desc: 'Eye-catching product showcase posts',
    tags: ['Product', 'Canva'],
    platform: 'Instagram',
  },
  {
    id: 7, label: 'Reel Cover', emoji: '🎞️',
    gradient: 'linear-gradient(135deg, #200028, #4a0060)',
    desc: 'Branded reel thumbnail & cover design',
    tags: ['Reels', 'Illustrator'],
    platform: 'Instagram',
  },
  {
    id: 8, label: 'LinkedIn Post', emoji: '💼',
    gradient: 'linear-gradient(135deg, #001428, #003060)',
    desc: 'Professional LinkedIn post & company update graphics',
    tags: ['LinkedIn', 'Figma'],
    platform: 'LinkedIn',
  },
  {
    id: 9, label: 'YouTube Thumbnail', emoji: '▶️',
    gradient: 'linear-gradient(135deg, #1a0000, #3a0000)',
    desc: 'High-CTR YouTube thumbnails — bold & eye-catching',
    tags: ['YouTube', 'Photoshop'],
    platform: 'YouTube',
  },
];

const platformColors = {
  Instagram: '#e1306c',
  Facebook: '#1877f2',
  'Multi-Platform': '#00c4cc',
  LinkedIn: '#0a66c2',
  YouTube: '#ff0000',
};

export default function SocialMediaPage() {
  return (
    <>
      <ReusableNavbar />
      <main className="gd-main pb-1">
        <ParticleBg />
        <div className="sm-orb sm-orb-1" />
        <div className="sm-orb sm-orb-2" />
        <div className="sm-orb sm-orb-3" />

        {/* ── BACK BUTTON ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '90px 6% 0' }}>
          <Link href="/pages/portfolio-page" className="gd-back mt-[30px]">
            <ArrowLeft size={16} /> Back to Portfolio
          </Link>
        </div>

        {/* ── HERO ── */}
        <div className="gd-hero" style={{ borderBottomColor: 'rgba(0,196,204,0.12)' }}>

          <motion.div className="sm-hero-badge"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <span className="sm-badge-dot" /> Social Media
          </motion.div>

          <motion.h1 className="gd-hero-title"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            Social Media <span className="sm-cyan">Design</span>
          </motion.h1>

          <motion.p className="gd-hero-sub"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            Scroll-stopping designs for every platform — Instagram, Facebook, LinkedIn, YouTube & more.
          </motion.p>

          <motion.div className="gd-hero-pills"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            {['Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'Canva'].map((t, i) => (
              <span key={i} className="sm-pill"><Sparkles size={12} /> {t}</span>
            ))}
          </motion.div>
        </div>

        {/* ── WORK GRID ── */}
        <div className="gd-content">
          <div className="sm-section-label">Our Work</div>
          <h2 className="sm-section-title">Social Media <span className="sm-cyan">Designs</span></h2>
          <div className="sm-grid">
            {socialWork.map((item, i) => (
              <motion.div
                key={item.id}
                className="sm-card"
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
              >
                <div className="sm-card-visual" style={{ background: item.gradient }}>
                  <span className="sm-card-emoji">{item.emoji}</span>
                  <div className="sm-platform-badge"
                    style={{ background: platformColors[item.platform] + '33', borderColor: platformColors[item.platform] + '66', color: platformColors[item.platform] }}
                  >
                    {item.platform}
                  </div>
                  <div className="sm-card-shine" />
                </div>
                <div className="sm-card-body">
                  <div className="sm-card-label">{item.label}</div>
                  <p className="sm-card-desc">{item.desc}</p>
                  <div className="sm-card-tags">
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
          <div className="sm-section-label">What You Get</div>
          <h2 className="gd-section-title">Every Package <span className="sm-cyan">Includes</span></h2>
          <div className="gd-offer-grid" style={{ '--offer-color': '#00c4cc' }}>
            {[
              'Instagram post templates',
              'Story & reel covers',
              'Facebook banners & ads',
              'LinkedIn post graphics',
              'YouTube thumbnails',
              'Editable source files',
              'Brand-consistent style',
              'Unlimited revisions',
            ].map((item, i) => (
              <motion.div key={i} className="gd-offer-item"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <CheckCircle size={16} color="#00c4cc" style={{ flexShrink: 0 }} />
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div className="sm-cta"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="sm-cta-glow" />
          <h3>Need social media designs?</h3>
          <p>We create content that stops the scroll and drives engagement.</p>
          <Link href="/pages/contact-page" className="sm-cta-btn">
            Get Started <ArrowRight size={16} />
          </Link>
        </motion.div>

      </main>
      <Footer />
    </>
  );
}
