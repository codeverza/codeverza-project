'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Play, Sparkles, CheckCircle, ArrowRight, X, Volume2, VolumeX } from 'lucide-react';
import ReusableNavbar from '@/app/components/reusable-navbar';
import Footer from '@/app/components/footer';
import './motion-graphics.css';

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
  return <canvas ref={canvasRef} className="mg-canvas" />;
}

const videos = [
  {
    id: 1,
    title: 'Product Launch Reveal',
    desc: 'Cinematic product reveal with particle burst, kinetic typography and brand-aligned color transitions.',
    tags: ['After Effects', 'Kinetic Type', 'Particle FX'],
    color: '#b14cff',
    videoUrl: '/animated-logo/motion-logo.MP4',
    thumb: '🎬',
  },
  {
    id: 2,
    title: 'Brand Story Animation',
    desc: 'Smooth motion graphics brand story — communicates vision, values and identity in seconds.',
    tags: ['After Effects', 'Motion Design', 'Brand'],
    color: '#ff61f6',
    videoUrl: '/animated-logo/airline-logo.MP4',
    thumb: '✨',
  },
  {
    id: 3,
    title: 'Social Media Ad Motion',
    desc: 'High-energy 15-second motion ad optimized for Instagram Reels, YouTube Shorts and TikTok.',
    tags: ['After Effects', 'Social Ad', 'Motion'],
    color: '#ffd43b',
    videoUrl: '/animated-logo/race-logo.MP4',
    thumb: '📱',
  },
  {
    id: 4,
    title: 'App Feature Highlight',
    desc: 'Clean UI motion animation that showcases app features with smooth screen transitions.',
    tags: ['After Effects', 'UI Animation', 'App'],
    color: '#61dafb',
    videoUrl: '/animated-logo/game-logo.MP4',
    thumb: '📲',
  },
  {
    id: 5,
    title: 'Event Promo Animation',
    desc: 'Bold event promo with countdown timer, dynamic text and immersive visual effects.',
    tags: ['After Effects', 'Event', 'Promo'],
    color: '#ff6b35',
    videoUrl: '/animated-logo/boomer-logo.MP4',
    thumb: '🎉',
  },
  {
    id: 6,
    title: 'Intro / Outro Package',
    desc: 'Professional YouTube / podcast intro and outro with custom sound sync and logo reveal.',
    tags: ['After Effects', 'Intro', 'YouTube'],
    color: '#68d391',
    videoUrl: '/animated-logo/soccer-logo.MP4',
    thumb: '▶️',
  },
];

function VideoCard({ video, index, onOpen }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(() => {});
  }, []);

  return (
    <motion.div
      className="mg-card"
      style={{ '--vc': video.color }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={() => onOpen(video)}
    >
      <div className="mg-card-video">
        <video ref={videoRef} src={video.videoUrl} muted loop playsInline autoPlay className="mg-video" />
        <div className="mg-play-overlay">
          <div className="mg-play-btn"><Play size={20} fill="white" color="white" /></div>
        </div>
      </div>
      <div className="mg-card-body">
        <div className="mg-card-cat" style={{ color: video.color }}>Motion Graphics</div>
        <h3 className="mg-card-title">{video.title}</h3>
        <p className="mg-card-desc">{video.desc}</p>
        <div className="mg-card-tags">
          {video.tags.map(t => <span key={t} className="mg-tag">{t}</span>)}
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
    <motion.div className="mg-modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div className="mg-modal"
        initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }} transition={{ duration: 0.3 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="mg-modal-header">
          <div>
            <div className="mg-modal-cat" style={{ color: video.color }}>{video.title}</div>
            <div className="mg-modal-tags">
              {video.tags.map(t => <span key={t} className="mg-tag">{t}</span>)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setMuted(!muted); if (videoRef.current) videoRef.current.muted = !muted; }} className="mg-modal-icon-btn">
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button onClick={onClose} className="mg-modal-icon-btn"><X size={18} /></button>
          </div>
        </div>
        <video ref={videoRef} src={video.videoUrl} controls loop playsInline className="mg-modal-video" />
        <p className="mg-modal-desc">{video.desc}</p>
      </motion.div>
    </motion.div>
  );
}

export default function MotionGraphicsPage() {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <>
      <ReusableNavbar />
      <main className="mg-main pb-1">
        <ParticleBg />
        <div className="mg-orb mg-orb-1" />
        <div className="mg-orb mg-orb-2" />

        {/* ── BACK ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '90px 6% 0' }}>
          <Link href="/portfolio-page" className="mg-back mt-[30px]">
            <ArrowLeft size={16} /> Back to Portfolio
          </Link>
        </div>

        {/* ── HERO ── */}
        <div className="mg-hero">
          <motion.div className="mg-hero-badge"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <span className="mg-badge-dot" /> Animation Portfolio
          </motion.div>

          <motion.h1 className="mg-hero-title"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            Motion <span className="mg-purple">Graphics</span>
          </motion.h1>

          <motion.p className="mg-hero-sub"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            Hover to preview. Click to watch full screen. We create motion graphics that captivate, communicate, and convert.
          </motion.p>

          <motion.div className="mg-hero-pills"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            {['After Effects', 'Motion Design', 'Kinetic Typography', 'Visual FX'].map((t, i) => (
              <span key={i} className="mg-pill"><Sparkles size={12} /> {t}</span>
            ))}
          </motion.div>
        </div>

        {/* ── VIDEO GRID ── */}
        <div className="mg-content">
          <div className="mg-grid">
            {videos.map((v, i) => <VideoCard key={v.id} video={v} index={i} onOpen={setActiveVideo} />)}
          </div>
        </div>

        {/* ── WHAT WE DELIVER ── */}
        <motion.div className="mg-offer"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="mg-section-label">What We Deliver</div>
          <h2 className="mg-section-title">Every Project <span className="mg-purple">Includes</span></h2>
          <div className="mg-offer-grid">
            {[
              'Source file (.aep)',
              'MP4 export (1080p / 4K)',
              'GIF & WebM formats',
              'Transparent BG version',
              'Social media size variants',
              'Voiceover-ready timing',
              'Fast 5–7 day delivery',
              'Commercial usage rights',
            ].map((item, i) => (
              <motion.div key={i} className="mg-offer-item"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <CheckCircle size={16} color="#b14cff" style={{ flexShrink: 0 }} />
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div className="mg-cta"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="mg-cta-glow" />
          <h3>Want a custom motion graphic?</h3>
          <p>Tell us your vision and we'll bring it to life with stunning animation.</p>
          <Link href="/contact-page" className="mg-cta-btn">
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
