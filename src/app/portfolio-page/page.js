'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, ArrowRight, Star, Eye, ShoppingBag, Globe, Smartphone, Palette, Package, Heart, Tag, Truck, Code2, Brush, Sparkles } from 'lucide-react';
import ReusableNavbar from '../components/reusable-navbar';
import Footer from '../components/footer';
import JsonLd from './JsonLd';
import './portfolio-page.css';

const CATEGORIES = [
  { id: 'development', label: 'Development', icon: <Code2 size={15} /> },
  { id: 'design',      label: 'Graphic Design', icon: <Brush size={15} /> },
  { id: 'animation',   label: 'Animation',  icon: <Sparkles size={15} /> },
];

const moreProjects = [
  {
    id: 3, title: 'Ayaz Ahmad Academy — Education Platform', category: 'Educational Website',
    tags: ['Next.js', 'Firebase', 'Email.js', 'Framer Motion'],
    desc: 'A fully animated, responsive 5-page educational website for Ayaz Ahmad Academy. Students and teachers can register, triggering automated confirmation emails to users and instant admin notifications.',
    fullDesc: 'Ayaz Ahmad Academy is a fully designed and animated 5-page educational website built to handle both student and teacher registrations. The platform includes a Home page, About page, Courses page, Faculty page, and a smart Register page where visitors can sign up as either a student or a teacher.\n\nUpon registration, the system automatically sends a confirmation email to the registrant and a real-time notification email to the admin — alerting them whether a new student or teacher has signed up. The admin can then follow up and get in touch.\n\nThe website is built with Next.js and Firebase, fully animated using Framer Motion, and designed to be completely responsive across all devices. Every section is crafted with a modern, polished aesthetic aligned with an educational brand identity.',
    features: [
      'Home, About, Courses, Faculty & Register pages',
      'Register as Student or Teacher',
      'Automated confirmation email to registrant',
      'Instant admin notification email on signup',
      'Firebase Firestore — registration data storage',
      'Framer Motion — fully animated UI',
      'Fully responsive across all devices',
      'Modern, professional educational design',
    ],
    color: '#00c4ff', gradient: 'linear-gradient(135deg, #001428, #002244, #001428)', emoji: '🎓', liveUrl: 'https://www.ayazahmadacademy.com',
  },
  {
    id: 2, title: 'VoltrixStation — EV Charging Platform', category: 'Web App',
    tags: ['Next.js', 'Firebase', 'Admin Panel', 'Real-time'],
    desc: 'A full-featured electric vehicle charging platform. Users buy time-based plans, get a unique code, and charge at any station. Real-time session tracking shows remaining time. Includes a complete admin panel to manage stations, users, and plans.',
    fullDesc: 'VoltrixStation is a complete EV charging management platform built with Next.js and Firebase. The platform allows users to register, browse available charging plans (e.g. 130 PKR for 2 hours), and make payments. Upon successful payment, a unique session code is generated. The user visits any VoltrixStation charging station, enters the code, and begins charging. The platform tracks the session in real-time — if a user charges for 10 minutes and disconnects, the remaining 1 hour 50 minutes is displayed on their dashboard and can be used later. The admin panel gives full control over station management, user accounts, plan configuration, session monitoring, and revenue analytics.',
    features: ['User authentication & profiles', 'Multiple charging plans with pricing', 'Unique session code generation', 'Real-time session tracking & timer', 'Multi-station support', 'Session history & usage logs', 'Admin panel — full management', 'Revenue & analytics dashboard'],
    color: '#00d4aa', gradient: 'linear-gradient(135deg, #001a14, #003328)', emoji: '⚡', liveUrl: 'https://voltrixstation.com',
  },
  {
    id: 8, title: 'DFTL — Dawood Family Takaful', category: 'Corporate Website',
    tags: ['Next.js', 'SQL', 'Bootstrap', 'Custom CSS'],
    desc: 'Official corporate website for Dawood Family Takaful Ltd. — a leading takaful (Islamic insurance) company. Contributed to the project as part of a collaborative effort with the DFTL IT team.',
    fullDesc: `This is an official project of Dawood Family Takaful Ltd. (DFTL). All intellectual property, content, branding, and rights belong exclusively to DFTL.\n\nAs a contributor on this project, I worked collaboratively with the DFTL IT team on the development and modernization of their official corporate website. My specific contribution involved converting the existing website architecture to Next.js, significantly improving performance, SEO, and overall user experience through modern web standards.\n\nThe frontend was built using Bootstrap and custom CSS for a fully responsive, professional corporate look. Backend logic including user authentication and data management was handled using SQL-based infrastructure provided and maintained by the DFTL IT team.\n\nThe website features a complete corporate presence including takaful plan information, online plan purchase (Buy Now), payment integration, customer portal, and detailed product pages — all aligned with DFTL's brand identity and compliance requirements.`,
    features: [
      'Full corporate website — DFTL brand',
      'Takaful plan listings & details',
      'Online plan purchase (Buy Now)',
      'Payment integration',
      'Customer login portal (SQL backend by DFTL IT)',
      'Next.js migration for performance',
      'Bootstrap + custom CSS — fully responsive',
      'SEO optimized with Next.js SSR',
    ],
    color: '#1e88e5', gradient: 'linear-gradient(135deg, #001428, #002244)', emoji: '🛡️', liveUrl: '#',
    disclaimer: true,
  },
];

const designProjects = [
  {
    id: 'd1', title: 'Brand Identity — TechStart',
    tags: ['Figma', 'Illustrator', 'Brand Design'],
    desc: 'Complete brand identity design including logo, color palette, typography, and brand guidelines for a tech startup.',
    fullDesc: 'A full brand identity package for TechStart — a technology startup. The project included logo design, color system, typography selection, business card design, letterhead, social media kit, and a comprehensive brand guidelines document. Designed in Figma and Adobe Illustrator.',
    features: ['Logo design (primary + variants)', 'Color palette & typography', 'Business card & stationery', 'Social media kit', 'Brand guidelines document', 'Figma design system'],
    color: '#f24e1e', gradient: 'linear-gradient(135deg, #2a0a00, #4a1500)', emoji: '🎨', liveUrl: '#',
    detailPage: '/portfolio-page/graphic-design/brand-identity',
  },
  {
    id: 'd2', title: 'Social Media Design — E-Commerce',
    tags: ['Canva', 'Photoshop', 'Social Media'],
    desc: 'Complete social media design package — posts, stories, banners, and promotional graphics for an e-commerce brand.',
    fullDesc: 'A complete social media design package for an e-commerce brand. Includes Instagram posts, stories, Facebook banners, promotional sale graphics, product highlight templates, and seasonal campaign designs. Created using Canva Pro and Adobe Photoshop with a consistent brand aesthetic.',
    features: ['Instagram post templates', 'Story & reel covers', 'Facebook banners', 'Promotional graphics', 'Product highlight designs', 'Seasonal campaign assets'],
    color: '#00c4cc', gradient: 'linear-gradient(135deg, #001a1a, #003333)', emoji: '📱', liveUrl: '#',
    detailPage: '/portfolio-page/graphic-design/social-media',
  },
  {
    id: 'd3', title: 'UI/UX Design — Mobile App',
    tags: ['Figma', 'Adobe XD', 'Prototyping'],
    desc: 'Full UI/UX design for a mobile food delivery app — wireframes, high-fidelity screens, and interactive prototype.',
    fullDesc: 'Complete UI/UX design for a mobile food delivery application. The project covered user research, wireframing, high-fidelity screen design, component library creation, and an interactive clickable prototype. Designed in Figma with a clean, modern aesthetic focused on usability and conversion.',
    features: ['User research & personas', 'Wireframes & user flows', '40+ high-fidelity screens', 'Component library', 'Interactive prototype', 'Design handoff documentation'],
    color: '#ff9a00', gradient: 'linear-gradient(135deg, #2a1500, #4a2800)', emoji: '🖌️', liveUrl: '#',
    detailPage: '/portfolio-page/graphic-design/ui-ux',
  },
];

const animationProjects = [
  {
    id: 'a1', title: 'Motion Graphics — Product Launch',
    tags: ['After Effects', 'Motion Design', 'Video'],
    desc: 'Animated product launch video with motion graphics, transitions, and brand-aligned visual effects.',
    fullDesc: 'A dynamic product launch animation created for a tech product reveal. The video features smooth motion graphics, kinetic typography, particle effects, and brand-aligned color transitions. Designed to be used across social media, website hero sections, and presentations.',
    features: ['Kinetic typography animation', 'Particle & visual effects', 'Brand-aligned color grading', 'Social media format exports', 'Website hero video', 'Presentation-ready version'],
    color: '#b14cff', gradient: 'linear-gradient(135deg, #1a0030, #2d0050)', emoji: '🎬', liveUrl: '#',
    detailPage: '/portfolio-page/motion-graphics',
  },
  {
    id: 'a2', title: 'Logo Animation — SaaS Brand',
    tags: ['After Effects', 'Lottie', 'SVG Animation'],
    desc: 'Smooth, professional logo animation exported as Lottie JSON for seamless web and app integration.',
    fullDesc: 'A professional logo animation for a SaaS brand, designed to be used as a loading screen, splash screen, and website intro. The animation was created in Adobe After Effects and exported as a Lottie JSON file for lightweight, scalable web and mobile integration. Multiple variants were created for different use cases.',
    features: ['After Effects animation', 'Lottie JSON export', 'SVG-based (scalable)', 'Loading screen variant', 'Splash screen variant', 'Multiple speed versions'],
    color: '#ff61f6', gradient: 'linear-gradient(135deg, #2a0028, #4a0045)', emoji: '✨', liveUrl: '#',
    detailPage: '/portfolio-page/logo-animation',
  },
  {
    id: 'a3', title: 'Explainer Animation — FinTech App',
    tags: ['After Effects', '2D Animation', 'Explainer'],
    desc: 'A 60-second 2D explainer animation explaining how a fintech app works — clean, engaging, and conversion-focused.',
    fullDesc: 'A 60-second 2D explainer animation for a fintech mobile application. The animation walks users through the app\'s key features using character animation, icon animations, and smooth scene transitions. Designed to increase user understanding and boost app downloads from landing pages.',
    features: ['60-second explainer video', '2D character animation', 'Icon & UI animations', 'Voiceover-ready timing', 'Multiple language versions', 'Web & social exports'],
    color: '#ffd43b', gradient: 'linear-gradient(135deg, #2a1f00, #3d2e00)', emoji: '🎥', liveUrl: '#',
    detailPage: '/portfolio-page/explainer-animation',
  },
];

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
      pts = Array.from({ length: 60 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.4,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(177,76,255,0.8)'; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(177,76,255,${0.2 * (1 - d / 120)})`; ctx.lineWidth = 0.8; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    init(); draw();
    const ro = new ResizeObserver(init); ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="pp-canvas" />;
}

const project = {
  title: 'A.H Garments — Premium Lingerie Store',
  category: 'E-Commerce',
  tags: ['Next.js', 'Firebase', 'Tailwind CSS'],
  color: '#e535ab',
  gradient: 'linear-gradient(135deg, #1a0010, #3d0030, #1a0010)',
  liveUrl: 'https://ahgarments.pk',
  desc: 'A fully custom e-commerce platform built for A.H Garments — a premium lingerie brand. Designed with elegance, performance, and conversion in mind — every pixel crafted to reflect the brand\'s luxury identity.',
  highlights: [
    { icon: <ShoppingBag size={18} />, title: 'Full E-Commerce',    desc: 'Product catalog, cart, wishlist, checkout, and order management.' },
    { icon: <Smartphone size={18} />,  title: 'Mobile First',       desc: 'Fully responsive design optimized for mobile shoppers.' },
    { icon: <Palette size={18} />,     title: 'Luxury UI/UX',       desc: 'Elegant, brand-aligned design with smooth animations.' },
    { icon: <Package size={18} />,     title: 'Admin Dashboard',    desc: 'Full product, order, and inventory management panel.' },
    { icon: <Heart size={18} />,       title: 'Wishlist & Reviews', desc: 'Save favorites and leave product reviews with ratings.' },
    { icon: <Tag size={18} />,         title: 'Promo & Discounts',  desc: 'Coupon codes, seasonal sales, and bundle offers.' },
    { icon: <Truck size={18} />,       title: 'Order Tracking',     desc: 'Real-time order status updates and delivery tracking.' },
    { icon: <Globe size={18} />,       title: 'SEO Optimized',      desc: 'Built with Next.js SSR for top search engine rankings.' },
  ],
  screens: [
    { label: 'Homepage',        emoji: '🏠', bg: 'linear-gradient(135deg, #1a0010, #4a0030)' },
    { label: 'Product Listing', emoji: '👗', bg: 'linear-gradient(135deg, #0d0020, #2d0050)' },
    { label: 'Product Detail',  emoji: '🛍️', bg: 'linear-gradient(135deg, #1a0010, #3d0030)' },
    { label: 'Cart & Checkout', emoji: '💳', bg: 'linear-gradient(135deg, #0a0020, #200040)' },
    { label: 'Admin Panel',     emoji: '⚙️', bg: 'linear-gradient(135deg, #0d0d0d, #1a0030)' },
  ],
};

export default function PortfolioPage() {
  const router  = useRouter();
  const heroRef  = useRef(null);
  const detailRef = useRef(null);
  const inView   = useInView(detailRef, { once: true, margin: '-60px' });
  const [hovered, setHovered] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [activeCategory, setActiveCategory] = useState('development');

  return (
    <>
      <JsonLd />
      <ReusableNavbar />
      <main className="pp-main pb-1">
        <ParticleBg />
        <div className="pp-orb pp-orb-1" />
        <div className="pp-orb pp-orb-2" />
        <div className="pp-orb pp-orb-3" />

        {/* ── HERO ── */}
        <div className="pp-hero" ref={heroRef}>
          <div className="pp-back-wrap">
            <Link href="/" className="pp-back"><ArrowLeft size={16} /> Back to Home</Link>
          </div>
          <motion.div className="pp-hero-badge main-margin-top" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="pp-badge-dot" /> Our Work
          </motion.div>
          <motion.h1 className="pp-hero-title" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            Projects That <span className="pp-purple">Speak</span><br />For Themselves
          </motion.h1>
          <motion.p className="pp-hero-sub" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            Real work. Real results. Here's what we've built.
          </motion.p>
        </div>

        {/* ── CATEGORY TABS ── */}
        <div className="pp-cat-tabs">
          {CATEGORIES.map(c => (
            <motion.button key={c.id}
              className={`pp-cat-tab ${activeCategory === c.id ? 'pp-cat-active' : ''}`}
              onClick={() => { setActiveCategory(c.id); setActiveProject(null); }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            >
              {c.icon} {c.label}
            </motion.button>
          ))}
        </div>

        {/* ── PROJECT DETAIL ── */}
        <AnimatePresence mode="wait">
        <motion.div key={activeCategory} className="pp-content" ref={detailRef}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}
        >

          {/* project hero card */}
          {activeCategory === 'development' && (<>
          <motion.div className="pp-project-hero"
            initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            {/* visual */}
            <div className="pp-project-visual" style={{ background: project.gradient }}>
              <motion.div className="pp-project-visual-inner"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="pp-project-icon-big">👗</div>
                <div className="pp-project-brand">A.H Garments</div>
                <div className="pp-project-brand-sub">Premium Lingerie</div>
              </motion.div>

              {/* floating badges */}
              {['Next.js', 'Stripe', 'MongoDB'].map((t, i) => (
                <motion.div key={t} className="pp-float-tag"
                  style={{ '--i': i }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                >{t}</motion.div>
              ))}

              <div className="pp-featured-badge"><Star size={11} fill="currentColor" /> Featured Project</div>
            </div>

            {/* info */}
            <div className="pp-project-info">
              <div className="pp-project-cat" style={{ color: project.color }}>{project.category}</div>
              <h2 className="pp-project-title">{project.title}</h2>
              <p className="pp-project-desc">{project.desc}</p>

              <div className="pp-project-tags">
                {project.tags.map(t => <span key={t} className="pp-tag">{t}</span>)}
              </div>

              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="pp-live-btn" style={{ background: `linear-gradient(135deg, ${project.color}, #6a00ff)` }}>
                <Eye size={16} /> View Live Project <ExternalLink size={14} />
              </a>
            </div>
          </motion.div>

          {/* screens */}
          <motion.div className="pp-screens-section"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <div className="pp-section-label">App Screens</div>
            <h3 className="pp-section-title">What It <span className="pp-purple">Looks Like</span></h3>
            <div className="pp-screens-grid">
              {project.screens.map((s, i) => (
                <motion.div key={i} className="pp-screen-card"
                  style={{ background: s.bg }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.04, y: -4 }}
                >
                  <div className="pp-screen-emoji">{s.emoji}</div>
                  <div className="pp-screen-label">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* highlights */}
          <motion.div className="pp-highlights-section"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <div className="pp-section-label">Features</div>
            <h3 className="pp-section-title">What We <span className="pp-purple">Built</span></h3>
            <div className="pp-highlights-grid">
              {project.highlights.map((h, i) => (
                <motion.div key={i} className="pp-highlight-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="pp-highlight-icon" style={{ color: project.color }}>{h.icon}</div>
                  <h4>{h.title}</h4>
                  <p>{h.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* more projects grid */}
          <motion.div className="pp-more-section"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <div className="pp-section-label">More Work</div>
            <h3 className="pp-section-title">Other <span className="pp-purple">Projects</span></h3>
            <div className="pp-more-grid">
              {moreProjects.map((p, i) => (
                <motion.div key={p.id} className="pp-more-card"
                  style={{ '--mc': p.color }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  onClick={() => setActiveProject(p)}
                >
                  <div className="pp-more-visual" style={{ background: p.gradient }}>
                    <span className="pp-more-emoji">{p.emoji}</span>
                  </div>
                  <div className="pp-more-body">
                    <div className="pp-more-cat" style={{ color: p.color }}>{p.category}</div>
                    <h4 className="pp-more-title">{p.title}</h4>
                    <p className="pp-more-desc">{p.desc}</p>
                    <div className="pp-more-tags">
                      {p.tags.map(t => <span key={t} className="pp-tag">{t}</span>)}
                    </div>
                    <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="pp-more-link" style={{ color: p.color }}>
                      <Eye size={13} /> View Project <ExternalLink size={12} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          </>) /* end development */}

          {/* ── DESIGN PROJECTS ── */}
          {activeCategory === 'design' && (
            <div className="pp-other-grid">
              {designProjects.map((p, i) => (
                <motion.div key={p.id} className="pp-more-card"
                  style={{ '--mc': p.color }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                  onClick={() => router.push(p.detailPage)}
                >
                  <div className="pp-more-visual" style={{ background: p.gradient }}>
                    <span className="pp-more-emoji">{p.emoji}</span>
                  </div>
                  <div className="pp-more-body">
                    <div className="pp-more-cat" style={{ color: p.color }}>Graphic Design</div>
                    <h4 className="pp-more-title">{p.title}</h4>
                    <p className="pp-more-desc">{p.desc}</p>
                    <div className="pp-more-tags">
                      {p.tags.map(t => <span key={t} className="pp-tag">{t}</span>)}
                    </div>
                    <button className="pp-more-link" style={{ color: p.color, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                      <Eye size={13} /> View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── ANIMATION PROJECTS ── */}
          {activeCategory === 'animation' && (
            <div className="pp-other-grid">
              {animationProjects.map((p, i) => (
                <motion.div key={p.id} className="pp-more-card"
                  style={{ '--mc': p.color }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                  onClick={() => p.detailPage ? router.push(p.detailPage) : setActiveProject(p)}
                >
                  <div className="pp-more-visual" style={{ background: p.gradient }}>
                    <span className="pp-more-emoji">{p.emoji}</span>
                  </div>
                  <div className="pp-more-body">
                    <div className="pp-more-cat" style={{ color: p.color }}>Animation</div>
                    <h4 className="pp-more-title">{p.title}</h4>
                    <p className="pp-more-desc">{p.desc}</p>
                    <div className="pp-more-tags">
                      {p.tags.map(t => <span key={t} className="pp-tag">{t}</span>)}
                    </div>
                    <button className="pp-more-link" style={{ color: p.color, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                      <Eye size={13} /> View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </motion.div>
        </AnimatePresence>

        {/* ── CTA ── */}
        <motion.div className="pp-cta"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="pp-cta-glow" />
          <h3>Want something like this?</h3>
          <p>Let's build your next big project together.</p>
          <Link href="/contact-page" className="pp-cta-btn">
            Start a Project <ArrowRight size={18} />
          </Link>
        </motion.div>

      </main>

      {/* ── PROJECT DETAIL MODAL ── */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            className="pp-modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActiveProject(null)}
          >
            <motion.div
              className="pp-modal"
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              onClick={e => e.stopPropagation()}
              style={{ '--mc': activeProject.color }}
            >
              {/* modal header */}
              <div className="pp-modal-header" style={{ background: activeProject.gradient }}>
                <div className="pp-modal-emoji">{activeProject.emoji}</div>
                <button className="pp-modal-close" onClick={() => setActiveProject(null)}>✕</button>
              </div>

              {/* modal body */}
              <div className="pp-modal-body">
                <div className="pp-modal-cat" style={{ color: activeProject.color }}>{activeProject.category}</div>
                <h2 className="pp-modal-title">{activeProject.title}</h2>

                <div className="pp-modal-tags">
                  {activeProject.tags.map(t => <span key={t} className="pp-tag">{t}</span>)}
                </div>

                <p className="pp-modal-desc">{activeProject.fullDesc || activeProject.desc}</p>

                {activeProject.disclaimer && (
                  <div className="pp-modal-disclaimer">
                    ⚠️ <strong>Note:</strong> This project was developed in collaboration with the DFTL IT team. All rights, content, and intellectual property belong exclusively to Dawood Family Takaful Ltd. (DFTL). This entry reflects only the contributor's technical involvement in the project.
                  </div>
                )}

                {activeProject.features && (
                  <div className="pp-modal-features">
                    <div className="pp-modal-features-title">Key Features</div>
                    <div className="pp-modal-features-grid">
                      {activeProject.features.map((f, i) => (
                        <div key={i} className="pp-modal-feature-item">
                          <span className="pp-modal-bullet" style={{ background: activeProject.color }} />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeProject.liveUrl !== '#' && (
                  <a href={activeProject.liveUrl} target="_blank" rel="noopener noreferrer"
                    className="pp-modal-btn" style={{ background: `linear-gradient(135deg, ${activeProject.color}, ${activeProject.color}99)` }}>
                    <Eye size={16} /> View Live Project <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
