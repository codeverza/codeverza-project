'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import ReusableNavbar from '../components/reusable-navbar';
import Footer from '../components/footer';
import JsonLd from './JsonLd';
import {
  Code, Smartphone, Palette, Brain, Cloud, Headphones,
  ArrowLeft, CheckCircle, ArrowRight, Brush, Sparkles
} from 'lucide-react';
import './services-page.css';

/* ── Particle BG ── */
function ParticleBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h, particles, raf;
    const init = () => {
      w = canvas.width  = canvas.offsetWidth;
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
        ctx.fillStyle = 'rgba(177,76,255,0.85)'; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++)
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(177,76,255,${0.25*(1-d/120)})`; ctx.lineWidth = 0.8; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    init(); draw();
    const ro = new ResizeObserver(init); ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="sp-hero-canvas" />;
}

const services = [
  {
    icon: <Code size={36} />,
    title: 'Web Development',
    tagline: 'Fast, scalable & modern web applications',
    color: '#61dafb',
    desc: 'We build high-performance web applications using the latest technologies like Next.js, React, and Node.js. From simple landing pages to complex enterprise platforms, we deliver clean, maintainable code that scales with your business.',
    features: [
      'Custom Next.js & React applications',
      'RESTful & GraphQL API development',
      'E-commerce & CMS integrations',
      'Performance optimization & SEO',
      'Progressive Web Apps (PWA)',
      'Database design & management',
    ],
    process: ['Discovery & Planning', 'UI/UX Wireframing', 'Development', 'Testing & QA', 'Deployment'],
  },
  {
    icon: <Smartphone size={36} />,
    title: 'Mobile Apps',
    tagline: 'iOS & Android apps that users love',
    color: '#68a063',
    desc: 'We craft beautiful, intuitive mobile applications for both iOS and Android platforms. Using React Native and modern mobile frameworks, we deliver cross-platform apps with native-like performance and seamless user experiences.',
    features: [
      'Cross-platform React Native development',
      'Native iOS & Android apps',
      'Push notifications & real-time features',
      'Offline-first architecture',
      'App Store & Play Store deployment',
      'Performance monitoring & analytics',
    ],
    process: ['Requirement Analysis', 'Prototyping', 'Development', 'Device Testing', 'Launch'],
  },
  {
    icon: <Palette size={36} />,
    title: 'UI / UX Design',
    tagline: 'Designs that convert visitors into customers',
    color: '#e535ab',
    desc: 'Great software starts with great design. Our UI/UX team creates visually stunning, user-centered interfaces that are intuitive, accessible, and aligned with your brand identity. We turn complex workflows into delightful experiences.',
    features: [
      'User research & persona development',
      'Wireframing & interactive prototypes',
      'Design systems & component libraries',
      'Responsive & mobile-first design',
      'Accessibility (WCAG) compliance',
      'Figma & Adobe XD deliverables',
    ],
    process: ['Research', 'Wireframes', 'Visual Design', 'Prototype', 'Handoff'],
  },
  {
    icon: <Brain size={36} />,
    title: 'AI Solutions',
    tagline: 'Intelligent systems that automate & innovate',
    color: '#ffd43b',
    desc: 'Harness the power of artificial intelligence to automate processes, gain insights, and build smarter products. From chatbots to machine learning pipelines, we integrate AI capabilities that give your business a competitive edge.',
    features: [
      'Custom AI chatbots & virtual assistants',
      'Machine learning model development',
      'Natural language processing (NLP)',
      'Computer vision & image recognition',
      'Predictive analytics & data insights',
      'OpenAI & LLM integrations',
    ],
    process: ['Data Assessment', 'Model Design', 'Training', 'Integration', 'Monitoring'],
  },
  {
    icon: <Cloud size={36} />,
    title: 'Cloud & DevOps',
    tagline: 'Reliable infrastructure that never sleeps',
    color: '#2496ed',
    desc: 'We design and manage cloud infrastructure that is secure, scalable, and cost-efficient. Our DevOps practices ensure fast deployments, zero downtime, and automated pipelines so your team can ship with confidence.',
    features: [
      'AWS, GCP & Azure cloud setup',
      'CI/CD pipeline automation',
      'Docker & Kubernetes orchestration',
      'Infrastructure as Code (Terraform)',
      'Security audits & compliance',
      '24/7 monitoring & alerting',
    ],
    process: ['Audit', 'Architecture Design', 'Setup', 'Automation', 'Monitoring'],
  },
  {
    icon: <Headphones size={36} />,
    title: 'Support & Maintenance',
    tagline: 'We stay with you long after launch',
    color: '#b14cff',
    desc: 'Software needs continuous care. Our dedicated support team provides ongoing maintenance, bug fixes, security updates, and feature enhancements to keep your product running smoothly and evolving with your business needs.',
    features: [
      'Bug fixes & performance tuning',
      'Security patches & updates',
      'Feature enhancements & iterations',
      'Database optimization & backups',
      'Uptime monitoring & incident response',
      'Monthly reporting & consultations',
    ],
    process: ['Onboarding', 'Audit', 'SLA Setup', 'Ongoing Support', 'Reviews'],
  },
  {
    icon: <Brush size={36} />,
    title: 'Graphic Design & Branding',
    tagline: 'Visuals that make your brand unforgettable',
    color: '#f24e1e',
    desc: 'From logo design to complete brand identity, social media graphics, and marketing materials — we craft visuals that communicate your brand\'s personality and leave a lasting impression on your audience.',
    features: [
      'Logo design & brand identity',
      'Social media post & story design',
      'Business card & stationery design',
      'Marketing banners & flyers',
      'Brand guidelines document',
      'Canva, Figma & Photoshop deliverables',
    ],
    process: ['Brief & Research', 'Concept Design', 'Revisions', 'Final Delivery', 'Brand Guide'],
  },
  {
    icon: <Sparkles size={36} />,
    title: 'Motion Graphics & Animation',
    tagline: 'Bring your brand to life with motion',
    color: '#9999ff',
    desc: 'We create captivating animations and motion graphics that engage your audience — from logo animations and explainer videos to social media reels and product showcases. Every frame is crafted to tell your story.',
    features: [
      'Logo & intro animations',
      '2D explainer videos',
      'Social media reels & stories',
      'Product showcase animations',
      'Lottie / web animations',
      'After Effects & motion design',
    ],
    process: ['Storyboard', 'Design Assets', 'Animation', 'Sound Sync', 'Export & Delivery'],
  },
];

function ServiceCard({ service, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className="sp-card"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1 }}
      style={{ '--svc-color': service.color }}
    >
      {/* top accent line */}
      <div className="sp-card-accent" style={{ background: service.color }} />

      <div className="sp-card-inner">
        {/* left: info */}
        <div className="sp-card-left">
          <div className="sp-icon-box" style={{ boxShadow: `0 0 30px ${service.color}40` }}>
            <span style={{ color: service.color }}>{service.icon}</span>
          </div>
          <div className="sp-card-tag" style={{ color: service.color, borderColor: `${service.color}40`, background: `${service.color}12` }}>
            {service.tagline}
          </div>
          <h2 className="sp-card-title">{service.title}</h2>
          <p className="sp-card-desc">{service.desc}</p>

          {/* process steps */}
          <div className="sp-process">
            <span className="sp-process-label">Our Process</span>
            <div className="sp-process-steps">
              {service.process.map((step, i) => (
                <div key={i} className="sp-process-step">
                  <div className="sp-step-num" style={{ background: service.color }}>{i + 1}</div>
                  <span>{step}</span>
                  {i < service.process.length - 1 && <div className="sp-step-line" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* right: features */}
        <div className="sp-card-right">
          <h4 className="sp-features-title">What's Included</h4>
          <ul className="sp-features-list">
            {service.features.map((f, i) => (
              <motion.li key={i} className="sp-feature-item"
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <CheckCircle size={16} style={{ color: service.color, flexShrink: 0 }} />
                {f}
              </motion.li>
            ))}
          </ul>

          <Link href="/contact-page" className="sp-cta" style={{ background: `linear-gradient(135deg, ${service.color}, ${service.color}99)` }}>
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function ServicesPage() {
  return (
    <>
    <JsonLd />
    <ReusableNavbar/>
    <main className="sp-main pb-1">
      {/* full page particle bg */}
      <ParticleBg />
      <div className="sp-page-orb sp-page-orb-1" />
      <div className="sp-page-orb sp-page-orb-2" />
      <div className="sp-page-orb sp-page-orb-3" />

      {/* ── HERO BANNER ── */}
      <div className="sp-hero-banner mt-3">
        {/* back */}
        <div className="sp-back-wrap">
          <Link href="/" className="sp-back">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        <div className="sp-hero-content">
          <motion.div className="sp-hero-badge main-margin-top"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <span className="sp-badge-dot" /> What We Offer
          </motion.div>

          <motion.h1 className="sp-hero-title"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            Our <span className="sp-hero-purple">Services</span>
          </motion.h1>

          <motion.p className="sp-hero-sub"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            From idea to deployment — Codeverza delivers end-to-end digital solutions tailored to your goals.
          </motion.p>

          {/* stat pills */}
          <motion.div className="sp-hero-stats"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          >
            {[
              { val: '8+', label: 'Core Services' },
              { val: '100%', label: 'Client Focused' },
              { val: '24/7', label: 'Support' },
            ].map((s, i) => (
              <div key={i} className="sp-stat-pill">
                <span className="sp-stat-val">{s.val}</span>
                <span className="sp-stat-label">{s.label}</span>
              </div>
            ))}
          </motion.div>

          {/* floating tech labels */}
          {['Next.js', 'React', 'Node.js', 'AI', 'AWS', 'MongoDB'].map((t, i) => (
            <motion.span key={t} className="sp-float-tag"
              style={{ '--i': i }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.08, type: 'spring' }}
            >{t}</motion.span>
          ))}
        </div>
      </div>

      {/* service cards */}
      <div className="sp-cards sp-cards-section">
        {services.map((s, i) => (
          <ServiceCard key={i} service={s} index={i} />
        ))}
      </div>

      {/* bottom CTA */}
      <motion.div className="sp-bottom-cta"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h3>Ready to start your project?</h3>
        <p>Let's discuss your requirements and build something amazing together.</p>
        <Link href="/contact-page" className="sp-bottom-btn">
          Contact Us <ArrowRight size={18} />
        </Link>
      </motion.div>

    </main>
      <Footer/>
    </>
  );
}
