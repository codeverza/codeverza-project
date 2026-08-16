'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Play, Sparkles, CheckCircle, ArrowRight, X, Volume2, VolumeX } from 'lucide-react';
import ReusableNavbar from '@/app/components/reusable-navbar';
import Footer from '@/app/components/footer';
import './explainer-animation.css';

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
        ctx.fillStyle = 'rgba(255,212,59,0.6)'; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(255,212,59,${0.15 * (1 - d / 120)})`; ctx.lineWidth = 0.8; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    init(); draw();
    const ro = new ResizeObserver(init); ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="ex-canvas" />;
}

const videos = [
  {
    id: 1,
    title: 'SaaS Product Explainer',
    desc: '60-second explainer breaking down a SaaS product — clear, engaging and conversion-focused.',
    tags: ['After Effects', '2D Animation', 'SaaS'],
    color: '#ffd43b',
    videoUrl: '/animated-logo/pen-logo.MP4',
    thumb: '🎥',
  },
  {
    id: 2,
    title: 'FinTech App Walkthrough',
    desc: 'Step-by-step animated walkthrough of a fintech mobile app — builds trust and drives downloads.',
    tags: ['After Effects', 'Character Anim', 'FinTech'],
    color: '#68d391',
    videoUrl: '/animated-logo/motion-logo.MP4',
    thumb: '💰',
  },
  {
    id: 3,
    title: 'E-Commerce Onboarding',
    desc: 'Friendly 45-second onboarding animation showing how to shop, pay and track orders.',
    tags: ['After Effects', 'Icon Anim', 'E-Commerce'],
    color: '#61dafb',
    videoUrl: '/animated-logo/soccer-logo.MP4',
    thumb: '🛍️',
  },
  {
    id: 4,
    title: 'Healthcare Service Explainer',
    desc: 'Clean, reassuring explainer animation for a healthcare platform — simplifies complex topics.',
    tags: ['After Effects', '2D Animation', 'Healthcare'],
    color: '#ff6b35',
    videoUrl: '/animated-logo/airline-logo.MP4',
    thumb: '🏥',
  },
  {
    id: 5,
    title: 'Startup Pitch Animation',
    desc: 'Investor-ready animated pitch deck — communicates the problem, solution and market clearly.',
    tags: ['After Effects', 'Pitch', 'Startup'],
    color: '#b14cff',
    videoUrl: '/animated-logo/boomer-logo.MP4',
    thumb: '🚀',
  },
  {
    id: 6,
    title: 'How-It-Works Animation',
    desc: '3-step process animation — simple, clear visuals that show exactly how your product works.',
    tags: ['After Effects', 'Process', 'Explainer'],
    color: '#ff61f6',
    videoUrl: '/animated-logo/race-logo.MP4',
    thumb: '⚙️',
  },
];

function VideoCard({ video, index, onOpen }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(() => {});
  }, []);

  return (
    <motion.div
      className="ex-card"
      style={{ '--vc': video.color }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={() => onOpen(video)}
    >
      <div className="ex-card-video">
        <video ref={videoRef} src={video.videoUrl} muted loop playsInline autoPlay className="ex-video" />
        <div className="ex-play-overlay">
          <div className="ex-play-btn"><Play size={20} fill="white" color="white" /></div>
        </div>
      </div>
      <div className="ex-card-body">
        <div className="ex-card-cat" style={{ color: video.color }}>Explainer Animation</div>
        <h3 className="ex-card-title">{video.title}</h3>
        <p className="ex-card-desc">{video.desc}</p>
        <div className="ex-card-tags">
          {video.tags.map(t => <span key={t} className="ex-tag">{t}</span>)}
        </div>
      </div>
    </motion.div>
  );
}

function VideoModal({ video, onClose }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(false);
  useEffect(() => {
    if (videoRef.current) { videoRef.current.muted = false; videoRef.current.play().catch(() => {}); }
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div className="ex-modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div className="ex-modal"
        initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }} transition={{ duration: 0.3 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="ex-modal-header">
          <div>
            <div className="ex-modal-cat" style={{ color: video.color }}>{video.title}</div>
            <div className="ex-modal-tags">
              {video.tags.map(t => <span key={t} className="ex-tag">{t}</span>)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setMuted(!muted); if (videoRef.current) videoRef.current.muted = !muted; }} className="ex-modal-icon-btn">
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button onClick={onClose} className="ex-modal-icon-btn"><X size={18} /></button>
          </div>
        </div>
        <video ref={videoRef} src={video.videoUrl} controls loop playsInline className="ex-modal-video" />
        <p className="ex-modal-desc">{video.desc}</p>
      </motion.div>
    </motion.div>
  );
}

export default function ExplainerAnimationPage() {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <>
      <ReusableNavbar />
      <main className="ex-main pb-1">
        <ParticleBg />
        <div className="ex-orb ex-orb-1" />
        <div className="ex-orb ex-orb-2" />

        {/* ── BACK ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '90px 6% 0' }}>
          <Link href="/portfolio-page?tab=animation" className="ex-back mt-[30px]">
            <ArrowLeft size={16} /> Back to Portfolio
          </Link>
        </div>

        {/* ── HERO ── */}
        <div className="ex-hero">
          <motion.div className="ex-hero-badge"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <span className="ex-badge-dot" /> Animation Portfolio
          </motion.div>

          <motion.h1 className="ex-hero-title"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            Explainer <span className="ex-yellow">Animations</span>
          </motion.h1>

          <motion.p className="ex-hero-sub"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            Hover to preview. Click to watch full screen. We simplify complex ideas into clear, engaging animated stories.
          </motion.p>

          <motion.div className="ex-hero-pills"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            {['After Effects', '2D Animation', 'Character Anim', 'Voiceover Ready'].map((t, i) => (
              <span key={i} className="ex-pill"><Sparkles size={12} /> {t}</span>
            ))}
          </motion.div>
        </div>

        {/* ── VIDEO GRID ── */}
        <div className="ex-content">
          <div className="ex-grid">
            {videos.map((v, i) => <VideoCard key={v.id} video={v} index={i} onOpen={setActiveVideo} />)}
          </div>
        </div>

        {/* ── WHAT WE DELIVER ── */}
        <motion.div className="ex-offer"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="ex-section-label">What We Deliver</div>
          <h2 className="ex-section-title">Every Explainer <span className="ex-yellow">Includes</span></h2>
          <div className="ex-offer-grid">
            {[
              'Script writing & storyboard',
              'Character & scene design',
              'Full 2D animation',
              'Voiceover-ready timing',
              'Background music (licensed)',
              'MP4 / MOV export',
              'Multiple language versions',
              'Commercial usage rights',
            ].map((item, i) => (
              <motion.div key={i} className="ex-offer-item"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <CheckCircle size={16} color="#ffd43b" style={{ flexShrink: 0 }} />
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div className="ex-cta"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="ex-cta-glow" />
          <h3>Need an explainer animation?</h3>
          <p>We turn your complex idea into a simple, beautiful animated story.</p>
          <Link href="/contact-page" className="ex-cta-btn">
            Get a Quote <ArrowRight size={16} />
          </Link>
        </motion.div>

      </main>

      <AnimatePresence>
        {activeVideo && <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />}
      </AnimatePresence>

      <Footer />
    </>
  );
}
