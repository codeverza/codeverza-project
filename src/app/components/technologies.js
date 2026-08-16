'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import {
  FaHtml5, FaCss3Alt, FaJs, FaReact, FaNodeJs,
  FaGithub, FaBootstrap,
} from 'react-icons/fa';
import {
  SiNextdotjs, SiFirebase, SiMongodb,
  SiTailwindcss, SiMysql, SiCanva, SiFigma,
  SiAdobephotoshop, SiAdobeillustrator, SiAdobexd, SiAdobeaftereffects,
} from 'react-icons/si';
import { ArrowRight } from 'lucide-react';
import '../css/technologies.css';

const techs = [
  { name: 'HTML5',        icon: FaHtml5,            color: '#e34f26' },
  { name: 'CSS3',         icon: FaCss3Alt,          color: '#1572b6' },
  { name: 'JavaScript',   icon: FaJs,               color: '#f7df1e' },
  { name: 'React.js',     icon: FaReact,            color: '#61dafb' },
  { name: 'Next.js',      icon: SiNextdotjs,        color: '#ffffff' },
  { name: 'Node.js',      icon: FaNodeJs,           color: '#68a063' },
  { name: 'Firebase',     icon: SiFirebase,         color: '#ffca28' },
  { name: 'SQL',          icon: SiMysql,            color: '#4479a1' },
  { name: 'MongoDB',      icon: SiMongodb,          color: '#4db33d' },
  { name: 'Tailwind',     icon: SiTailwindcss,      color: '#38bdf8' },
  { name: 'Bootstrap',    icon: FaBootstrap,        color: '#7952b3' },
  { name: 'GitHub',       icon: FaGithub,           color: '#ffffff' },
  { name: 'Figma',        icon: SiFigma,            color: '#f24e1e' },
  { name: 'Canva',        icon: SiCanva,            color: '#00c4cc' },
  { name: 'Photoshop',    icon: SiAdobephotoshop,   color: '#31a8ff' },
  { name: 'Illustrator',  icon: SiAdobeillustrator, color: '#ff9a00' },
  { name: 'Adobe XD',     icon: SiAdobexd,          color: '#ff61f6' },
  { name: 'After Effects',icon: SiAdobeaftereffects,color: '#9999ff' },
];

/* ── Particle BG ── */
import { useEffect } from 'react';
function ParticleBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h, particles, raf;
    const init = () => {
      w = canvas.width  = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.5 + 0.5,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(177,76,255,0.7)';
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(177,76,255,${0.18 * (1 - d / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    init(); draw();
    const ro = new ResizeObserver(init);
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="tech-particle-canvas" />;
}

export default function Technologies() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="tech-section" id="technologies" ref={ref}>
      <ParticleBg />
      <div className="tech-orb tech-orb-1" />
      <div className="tech-orb tech-orb-2" />
      <div className="tech-divider" />

      {/* heading */}
      <motion.div
        className="tech-heading-wrap"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="tech-badge">
          <span className="tech-badge-dot" />
          Our Stack
        </div>
        <h2 className="tech-title">
          Technologies <span className="tech-highlight">We Use</span>
        </h2>
        <p className="tech-subtitle">
          We work with modern, battle-tested tools to deliver fast, scalable, and maintainable products.
        </p>
      </motion.div>

      {/* grid */}
      <div className="tech-grid">
        {techs.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.div
              key={t.name}
              className="tech-card"
              style={{ '--tech-color': t.color }}
              initial={{ opacity: 0, y: 40, scale: 0.85 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07, type: 'spring', stiffness: 120 }}
              whileHover={{ y: -10, scale: 1.06 }}
            >
              <div className="tech-icon-wrap">
                <Icon size={42} color={t.color} />
                <div className="tech-icon-glow" style={{ background: t.color }} />
              </div>
              <span className="tech-name">{t.name}</span>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <motion.div
        className="tech-cta-wrap"
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Link
          href="/contact-page"
          className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-10 py-4 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-purple-500/40 inline-flex items-center gap-3 text-base"
        >
          Let&apos;s Work Together <ArrowRight size={18} />
        </Link>
      </motion.div>
    </section>
  );
}
