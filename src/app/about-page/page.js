'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Rocket, Users, Heart, Zap, Shield, Globe } from 'lucide-react';
import ReusableNavbar from '../components/reusable-navbar';
import Footer from '../components/footer';
import JsonLd from './JsonLd';
import './about-page.css';

/* ── Particle BG ── */
function ParticleBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h, particles, raf;
    const init = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      particles = Array.from({ length: 55 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.4 + 0.4,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(177,76,255,0.8)'; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++)
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(177,76,255,${0.22 * (1 - d / 120)})`; ctx.lineWidth = 0.8; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    init(); draw();
    const ro = new ResizeObserver(init); ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="ap-canvas"
      aria-hidden="true"
      role="presentation"
    />
  );
}

const values = [
  { icon: <Rocket size={24} aria-hidden="true" />, title: 'Innovation First',   desc: 'We stay ahead of the curve, constantly exploring new technologies to deliver cutting-edge solutions.' },
  { icon: <Shield size={24} aria-hidden="true" />, title: 'Quality & Security', desc: 'Every line of code is written with security and performance in mind. No shortcuts, ever.' },
  { icon: <Heart  size={24} aria-hidden="true" />, title: 'Client Obsessed',    desc: 'Your success is our success. We build long-term partnerships, not just one-time projects.' },
  { icon: <Users  size={24} aria-hidden="true" />, title: 'Team Collaboration', desc: 'Our diverse team of developers, designers, and strategists work in perfect sync.' },
  { icon: <Zap    size={24} aria-hidden="true" />, title: 'Fast Delivery',      desc: 'We respect your time. Agile workflows and clear communication ensure on-time delivery.' },
  { icon: <Globe  size={24} aria-hidden="true" />, title: 'Global Mindset',     desc: 'We build products for a global audience — scalable, multilingual, and accessible.' },
];

const milestones = [
  { year: '01', title: 'Understanding Your Vision',   desc: 'Every great product starts with a deep understanding of the problem. We listen first, then we build.' },
  { year: '02', title: 'Crafting the Right Solution', desc: 'We design and architect solutions that are not just functional — but scalable, secure, and future-proof.' },
  { year: '03', title: 'Building with Precision',     desc: 'Our developers write clean, maintainable code using modern tech stacks that stand the test of time.' },
  { year: '04', title: 'Delivering on Time',          desc: 'We respect deadlines. Agile workflows and clear communication keep every project on track.' },
  { year: '05', title: 'Growing Together',            desc: "We don't disappear after launch. We stay, support, and scale with you as your business grows." },
];

function Section({ children, className = '', tag: Tag = 'section', ariaLabel }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65 }}
      aria-label={ariaLabel}
    >
      <Tag>{children}</Tag>
    </motion.div>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* JSON-LD structured data – rendered server-side via RSC import */}
      <JsonLd />

      <ReusableNavbar />

      <main className="ap-main pb-1" id="main-content">
        <ParticleBg />
        <div className="ap-orb ap-orb-1" aria-hidden="true" />
        <div className="ap-orb ap-orb-2" aria-hidden="true" />
        <div className="ap-orb ap-orb-3" aria-hidden="true" />

        {/* ── HERO ── */}
        <header className="ap-hero">
          <nav className="ap-back-wrap" aria-label="Breadcrumb">
            <ol style={{ listStyle: 'none', display: 'flex', gap: 6, padding: 0, margin: 0, alignItems: 'center' }}>
              <li>
                <Link href="/" className="ap-back">
                  <ArrowLeft size={16} aria-hidden="true" /> Home
                </Link>
              </li>
              <li aria-hidden="true" style={{ color: '#555', fontSize: 13 }}>/</li>
              <li>
                <span style={{ color: '#b14cff', fontSize: 13 }} aria-current="page">About Us</span>
              </li>
            </ol>
          </nav>

          <motion.div
            className="ap-hero-badge main-margin-top"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            aria-label="About Us section"
          >
            <span className="ap-badge-dot" aria-hidden="true" /> About Us
          </motion.div>

          <motion.h1
            className="ap-hero-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            We Are <span className="ap-purple">Codeverza</span>
          </motion.h1>

          <motion.p
            className="ap-hero-sub"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            A forward-thinking software house from Pakistan, building digital experiences
            that drive real business growth.
          </motion.p>
        </header>

        {/* ── WHO WE ARE ── */}
        <section className="ap-section ap-who" aria-labelledby="who-heading">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65 }}
          >
            <p className="ap-section-label">Who We Are</p>
            <div className="ap-who-grid">
              <div className="ap-who-text">
                <h2 id="who-heading" className="ap-section-title">
                  Building the Future,<br />
                  <span className="ap-purple">One Line at a Time</span>
                </h2>
                <p>
                  Codeverza is a full-service software house dedicated to crafting
                  high-performance digital products. Founded with a passion for technology
                  and a commitment to excellence, we bring together talented developers,
                  creative designers, and strategic thinkers to deliver solutions that matter.
                </p>
                <p>
                  We don&apos;t just build software — we build partnerships. Every project we
                  take on is treated as our own, with the same level of care, attention to
                  detail, and drive for perfection that we&apos;d want for ourselves.
                </p>
                <p>
                  From startups launching their first MVP to enterprises scaling their
                  platforms, Codeverza is the team you want in your corner.
                </p>
              </div>

              <div className="ap-who-visual" aria-hidden="true">
                <div className="ap-tech-showcase">
                  <div className="ap-ts-glow" />
                  <motion.div
                    className="ap-ts-center"
                    animate={{ boxShadow: ['0 0 30px rgba(177,76,255,0.3)', '0 0 60px rgba(177,76,255,0.55)', '0 0 30px rgba(177,76,255,0.3)'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <span className="ap-ts-logo">Code<span>verza</span></span>
                    <span className="ap-ts-sub">Software House</span>
                    <div className="ap-ts-divider" />
                    <div className="ap-ts-stack">
                      {['Next.js', 'React', 'Node.js', 'Firebase'].map((t) => (
                        <span key={t} className="ap-ts-tag">{t}</span>
                      ))}
                    </div>
                  </motion.div>

                  {[
                    { icon: '⚡', title: 'Fast Delivery',  sub: 'On-time, every time',  pos: 'top-left'     },
                    { icon: '🔒', title: 'Secure Code',    sub: 'Built to last',         pos: 'top-right'    },
                    { icon: '✨', title: 'Clean UI/UX',    sub: 'Pixel-perfect design',  pos: 'bottom-left'  },
                    { icon: '🌍', title: 'Global Ready',   sub: 'Scalable & responsive', pos: 'bottom-right' },
                  ].map((card, i) => (
                    <motion.div
                      key={i}
                      className={`ap-ts-card ap-ts-card-${card.pos}`}
                      animate={{ y: [0, i % 2 === 0 ? -10 : 10, 0] }}
                      transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <span className="ap-ts-card-icon">{card.icon}</span>
                      <div>
                        <div className="ap-ts-card-title">{card.title}</div>
                        <div className="ap-ts-card-sub">{card.sub}</div>
                      </div>
                    </motion.div>
                  ))}

                  <div className="ap-ts-orbit">
                    {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                      <div key={i} className="ap-ts-orbit-dot" style={{ '--deg': `${deg}deg` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── MISSION & VISION ── */}
        <section className="ap-section" aria-labelledby="purpose-heading">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65 }}
          >
            <p className="ap-section-label">Our Purpose</p>
            <h2 id="purpose-heading" className="ap-section-title ap-center" style={{ marginBottom: 32 }}>
              Mission &amp; <span className="ap-purple">Vision</span>
            </h2>
            <div className="ap-mv-grid">
              <article className="ap-mv-card">
                <div className="ap-mv-icon" aria-hidden="true">🎯</div>
                <h3>Our Mission</h3>
                <p>
                  To empower businesses worldwide with innovative, reliable, and scalable
                  digital solutions — delivered with transparency, speed, and a relentless
                  focus on quality.
                </p>
              </article>
              <article className="ap-mv-card ap-mv-card-alt">
                <div className="ap-mv-icon" aria-hidden="true">🚀</div>
                <h3>Our Vision</h3>
                <p>
                  To become the most trusted software partner for startups and enterprises
                  globally — known for turning bold ideas into exceptional digital products.
                </p>
              </article>
            </div>
          </motion.div>
        </section>

        {/* ── VALUES ── */}
        <section className="ap-section" aria-labelledby="values-heading">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65 }}
          >
            <p className="ap-section-label">What Drives Us</p>
            <h2 id="values-heading" className="ap-section-title ap-center">
              Our Core <span className="ap-purple">Values</span>
            </h2>
            <ul className="ap-values-grid" role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {values.map((v, i) => (
                <motion.li
                  key={i}
                  className="ap-value-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                >
                  <div className="ap-value-icon" aria-hidden="true">{v.icon}</div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </section>

        {/* ── TIMELINE / HOW WE WORK ── */}
        <section className="ap-section" aria-labelledby="process-heading">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65 }}
          >
            <p className="ap-section-label">Our Approach</p>
            <h2 id="process-heading" className="ap-section-title ap-center">
              How We <span className="ap-purple">Work</span>
            </h2>
            <ol className="ap-timeline" aria-label="Our work process steps" style={{ listStyle: 'none', padding: 0, margin: '0 auto' }}>
              {milestones.map((m, i) => (
                <motion.li
                  key={i}
                  className={`ap-milestone ${i % 2 === 0 ? 'ap-ml-left' : 'ap-ml-right'}`}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.1 }}
                >
                  <div className="ap-ml-year" aria-label={`Step ${m.year}`}>{m.year}</div>
                  <div className="ap-ml-content">
                    <h3>{m.title}</h3>
                    <p>{m.desc}</p>
                  </div>
                </motion.li>
              ))}
              <div className="ap-timeline-line" aria-hidden="true" />
            </ol>
          </motion.div>
        </section>

        {/* ── CTA ── */}
        <motion.aside
          className="ap-cta-box"
          aria-label="Start a project with Codeverza"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Ready to build something great?</h2>
          <p>Let&apos;s turn your idea into a world-class digital product.</p>
          <Link href="/contact-page" className="ap-cta-btn">
            Start a Project <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </motion.aside>
      </main>

      <Footer />
    </>
  );
}
