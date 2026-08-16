'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Play, Sparkles, CheckCircle, ArrowRight, X, Volume2, VolumeX } from 'lucide-react';
import ReusableNavbar from '@/app/components/reusable-navbar';
import Footer from '@/app/components/footer';
import './logo-animation.css';

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
  return <canvas ref={canvasRef} className="la-canvas" />;
}

// Sample logo animation videos — replace src with your actual video URLs
const videos = [
  {
    id: 1,
    title: 'Tech Startup Logo Reveal',
    desc: 'Clean, modern logo animation with particle burst effect and smooth fade-in.',
    tags: ['After Effects', 'Lottie', 'Particle FX'],
    color: '#ff61f6',
    // Replace with your actual video URL or YouTube embed
    videoUrl: '/animated-logo/airline-logo.mp4',
    thumb: '✨',
  },
  {
    id: 2,
    title: 'Minimal Logo Animation',
    desc: 'Elegant stroke draw-on animation with smooth easing and glow effect.',
    tags: ['After Effects', 'SVG Animation', 'Stroke FX'],
    color: '#b14cff',
    videoUrl: '/animated-logo/Fedex-logo.mp4',
    thumb: '🎬',
  },
  {
    id: 3,
    title: '3D Logo Spin Intro',
    desc: 'Dynamic 3D rotation logo intro with light flare and cinematic feel.',
    tags: ['After Effects', '3D', 'Light FX'],
    color: '#ffd43b',
    videoUrl: '/animated-logo/boomer-logo.mp4',
    thumb: '🌟',
  },
  {
    id: 4,
    title: 'Glitch Logo Animation',
    desc: 'Trendy glitch effect logo reveal perfect for gaming and tech brands.',
    tags: ['After Effects', 'Glitch FX', 'Motion'],
    color: '#61dafb',
    videoUrl: '/animated-logo/game-logo.mp4',
    thumb: '⚡',
  },
  {
    id: 5,
    title: 'Liquid Logo Morph',
    desc: 'Fluid liquid morphing animation that transforms into your brand logo.',
    tags: ['After Effects', 'Liquid FX', 'Morph'],
    color: '#68a063',
    videoUrl: '/animated-logo/motion-logo.mp4',
    thumb: '💧',
  },
  {
    id: 6,
    title: 'Neon Glow Logo',
    desc: 'Vibrant neon glow logo animation ideal for nightlife and entertainment brands.',
    tags: ['After Effects', 'Neon FX', 'Glow'],
    color: '#ff6b35',
    videoUrl: '/animated-logo/pen-logo.mp4',
    thumb: '🔥',
  },
  {
    id: 7,
    title: 'Neon Glow Logo',
    desc: 'Vibrant neon glow logo animation ideal for nightlife and entertainment brands.',
    tags: ['After Effects', 'Neon FX', 'Glow'],
    color: '#ff6b35',
    videoUrl: '/animated-logo/race-logo.mp4',
    thumb: '🔥',
  },
  {
    id: 8,
    title: 'Neon Glow Logo',
    desc: 'Vibrant neon glow logo animation ideal for nightlife and entertainment brands.',
    tags: ['After Effects', 'Neon FX', 'Glow'],
    color: '#ff6b35',
    videoUrl: '/animated-logo/soccer-logo.mp4',
    thumb: '🔥',
  },
];

function VideoCard({ video, index, onOpen }) {
  const videoRef = useRef(null);

  useEffect(() => {
    // autoplay always — muted loop
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <motion.div
      className="la-card"
      style={{ '--vc': video.color }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={() => onOpen(video)}
    >
      {/* video — always playing, muted */}
      <div className="la-card-video">
        <video
          ref={videoRef}
          src={video.videoUrl}
          muted
          loop
          playsInline
          autoPlay
          className="la-video la-video-always"
        />
        {/* play icon overlay */}
        <div className="la-play-overlay">
          <div className="la-play-btn">
            <Play size={20} fill="white" color="white" />
          </div>
        </div>
      </div>

      {/* card body */}
      <div className="la-card-body">
        <div className="la-card-cat" style={{ color: video.color }}>Logo Animation</div>
        <h3 className="la-card-title">{video.title}</h3>
        <p className="la-card-desc">{video.desc}</p>
        <div className="la-card-tags">
          {video.tags.map(t => <span key={t} className="pp-tag">{t}</span>)}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Fullscreen Video Modal ── */
function VideoModal({ video, onClose }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
    }
    // close on ESC
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <motion.div className="la-modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div className="la-modal"
        initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }} transition={{ duration: 0.3 }}
        onClick={e => e.stopPropagation()}
      >
        {/* header */}
        <div className="la-modal-header">
          <div>
            <div className="la-modal-cat" style={{ color: video.color }}>{video.title}</div>
            <div className="la-modal-tags">
              {video.tags.map(t => <span key={t} className="pp-tag">{t}</span>)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setMuted(!muted); if (videoRef.current) videoRef.current.muted = !muted; }}
              className="la-modal-icon-btn">
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button onClick={onClose} className="la-modal-icon-btn"><X size={18} /></button>
          </div>
        </div>

        {/* video */}
        <video
          ref={videoRef}
          src={video.videoUrl}
          controls
          loop
          playsInline
          className="la-modal-video"
        />

        <p className="la-modal-desc">{video.fullDesc || video.desc}</p>
      </motion.div>
    </motion.div>
  );
}

export default function LogoAnimationPage() {
  const [activeVideo, setActiveVideo] = useState(null);
  return (
    <>
      <ReusableNavbar />
      <main className="la-main pb-1">
        <ParticleBg />
        <div className="la-orb la-orb-1" />
        <div className="la-orb la-orb-2" />

         {/* ── BACK ── */}
                <div style={{ position: 'relative', zIndex: 2, padding: '90px 6% 0' }}>
                  <Link href="/portfolio-page?tab=animation" className="mg-back mt-[30px]">
                    <ArrowLeft size={16} /> Back to Portfolio
                  </Link>
                </div>

        {/* HERO */}
        <div className="la-hero">


          <motion.div className="la-hero-badge"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <span className="la-badge-dot" /> Animation Portfolio
          </motion.div>

          <motion.h1 className="la-hero-title"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            Logo <span className="la-purple">Animations</span>
          </motion.h1>

          <motion.p className="la-hero-sub"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            Hover over any card to preview the animation. We craft custom logo animations that bring your brand to life.
          </motion.p>

          <motion.div className="la-hero-pills"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            {['After Effects', 'Lottie', 'SVG Animation', 'Motion Design'].map((t, i) => (
              <span key={i} className="la-pill"><Sparkles size={12} /> {t}</span>
            ))}
          </motion.div>
        </div>

        {/* VIDEO GRID */}
        <div className="la-content">
          <div className="la-grid">
            {videos.map((v, i) => <VideoCard key={v.id} video={v} index={i} onOpen={setActiveVideo} />)}
          </div>
        </div>

        {/* WHAT WE OFFER */}
        <motion.div className="la-offer"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="la-section-label">What We Deliver</div>
          <h2 className="la-section-title">Every Animation <span className="la-purple">Includes</span></h2>
          <div className="la-offer-grid">
            {[
              'Source file (.aep / .ai)',
              'Lottie JSON export',
              'MP4 & GIF formats',
              'Transparent background version',
              'Multiple size variants',
              'Unlimited revisions',
              'Fast 3–5 day delivery',
              'Commercial usage rights',
            ].map((item, i) => (
              <motion.div key={i} className="la-offer-item"
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

        {/* CTA */}
        <motion.div className="la-cta"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="la-cta-glow" />
          <h3>Want a custom logo animation?</h3>
          <p>Tell us about your brand and we'll create something amazing.</p>
          <Link href="/contact-page" className="la-cta-btn">
            Get a Quote <ArrowRight size={16} />
          </Link>
        </motion.div>

      </main>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />}
      </AnimatePresence>

      <Footer />
    </>
  );
}
