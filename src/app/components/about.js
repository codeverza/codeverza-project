'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle, Rocket, Users, Award, ArrowRight } from 'lucide-react';
import '../css/about.css';

const techStack = [
  { label: 'React',   color: '#61dafb', x: '8%',  y: '10%' },
  { label: 'Next.js', color: '#ffffff', x: '68%', y: '6%'  },
  { label: 'Node.js', color: '#68a063', x: '75%', y: '52%' },
  { label: 'MongoDB', color: '#4db33d', x: '2%',  y: '58%' },
  { label: 'Python',  color: '#ffd43b', x: '52%', y: '88%' },
  { label: 'AWS',     color: '#ff9900', x: '14%', y: '86%' },
  { label: 'Docker',  color: '#2496ed', x: '62%', y: '26%' },
  { label: 'GraphQL', color: '#e535ab', x: '28%', y: '2%'  },
];

const codeLines = [
  { text: 'const codecoves = new SoftwareHouse();', color: '#e0aaff' },
  { text: 'codecoves.build("web-app");',             color: '#61dafb' },
  { text: '// Deploying to production... ✓',         color: '#68a063' },
  { text: 'codecoves.ship({ quality: "100%" });',    color: '#ffd43b' },
  { text: 'client.satisfaction = Infinity;',         color: '#e0aaff' },
  { text: '// Dream it. We build it. 🚀',            color: '#68a063' },
];

/* ── Background particle canvas ── */
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

    init();
    draw();
    const ro = new ResizeObserver(init);
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} className="about-particle-canvas" />;
}

/* ── Typing terminal ── */
function Terminal({ inView }) {
  const [lines, setLines]   = useState([]);
  const [cursor, setCursor] = useState(true);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    let li = 0, ci = 0;
    const type = () => {
      if (li >= codeLines.length) return;
      const full = codeLines[li].text;
      if (ci <= full.length) {
        const txt = full.slice(0, ci);
        setLines(prev => { const n = [...prev]; n[li] = { text: txt, color: codeLines[li].color }; return n; });
        ci++;
        setTimeout(type, 36);
      } else { li++; ci = 0; setTimeout(type, 300); }
    };
    setTimeout(type, 600);
  }, [inView]);

  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="terminal-window ">
      <div className="terminal-bar">
        <span className="t-dot red" /><span className="t-dot yellow" /><span className="t-dot green" />
        <span className="t-title">codecoves — bash</span>
      </div>
      <div className="terminal-body">
        <div className="terminal-prompt">
          <span className="prompt-user">codecoves</span>
          <span className="prompt-at">@</span>
          <span className="prompt-host">studio</span>
          <span className="prompt-sym"> ~ $&nbsp;</span>
          <span style={{ color: '#b14cff' }}>node index.js</span>
        </div>
        {lines.map((l, i) => (
          <div key={i} className="terminal-line" style={{ color: l.color }}>
            {l.text}
            {i === lines.length - 1 && <span className="t-cursor" style={{ opacity: cursor ? 1 : 0 }}>▋</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

const features = [
  { icon: <Rocket size={18} />,      text: 'Cutting-edge stack — Next.js, React, Node.js & AI' },
  { icon: <Users size={18} />,       text: 'Dedicated team of passionate devs & designers'      },
  { icon: <Award size={18} />,       text: 'Quality-first approach with on-time delivery'        },
  { icon: <CheckCircle size={18} />, text: 'End-to-end solutions from idea to deployment'        },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12, ease: 'easeOut' } }),
};

export default function About() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="about-section " id="about" ref={ref}>
      {/* BG particle network */}
      <ParticleBg />

      <div className="about-orb about-orb-1" />
      <div className="about-orb about-orb-2" />
      <div className="about-divider" />

      <div className="about-grid">

        {/* ══ LEFT ══ */}
        <motion.div
          className="about-visual"
          initial={{ opacity: 0, x: -60 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {techStack.map((t, i) => (
            <motion.div
              key={t.label}
              className="tech-pill"
              style={{ left: t.x, top: t.y, '--pill-color': t.color }}
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.5, type: 'spring' }}
            >
              <span className="pill-dot" style={{ background: t.color }} />
              {t.label}
            </motion.div>
          ))}

          <motion.div
            className="terminal-wrap"
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Terminal inView={inView} />
          </motion.div>
        </motion.div>

        {/* ══ RIGHT ══ */}
        <motion.div
          className="about-content"
          initial={{ opacity: 0, x: 60 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div className="about-badge" variants={fadeUp} custom={0} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            <span />Who We Are
          </motion.div>

          <motion.h2 className="about-title" variants={fadeUp} custom={1} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            We Build Digital <br />
            <span className="highlight">Experiences That</span><br />
            Actually Matter
          </motion.h2>

          <motion.p className="about-desc" variants={fadeUp} custom={2} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            CodeCoves is a forward-thinking software house crafting high-performance web apps,
            mobile solutions, and AI-powered platforms. We don't just write code — we engineer
            experiences that help businesses grow, scale, and stand out in the digital world.
          </motion.p>

          <div className="about-features">
            {features.map((f, i) => (
              <motion.div key={i} className="about-feature-item" variants={fadeUp} custom={3 + i} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
                <div className="feature-icon">{f.icon}</div>
                {f.text}
              </motion.div>
            ))}
          </div>

          <motion.a href="/pages/contact-page" className="about-cta" variants={fadeUp} custom={7} initial="hidden" animate={inView ? 'visible' : 'hidden'} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            Let's Work Together <ArrowRight size={18} />
          </motion.a>

          <motion.div variants={fadeUp} custom={8} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            <Link href="/pages/about-page" className="about-learn-more">
              Learn More About Us <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
