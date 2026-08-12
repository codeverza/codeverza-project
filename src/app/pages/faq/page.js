'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, ArrowRight, Search } from 'lucide-react';
import ReusableNavbar from '../../components/reusable-navbar';
import Footer from '../../components/footer';
import './faq.css';

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
  return <canvas ref={canvasRef} className="faq-canvas" />;
}

const categories = [
  {
    label: 'General',
    faqs: [
      { q: 'What is Codeverza?',                        a: 'Codeverza is a full-service software house based in Pakistan. We build web apps, mobile apps, AI solutions, and stunning UI/UX designs for clients worldwide.' },
      { q: 'Where are you located?',                    a: 'We are based in Pakistan and work remotely with clients across the globe — UK, UAE, USA, and beyond. Distance is never a barrier.' },
      { q: 'Do you work with international clients?',   a: 'Absolutely. We have experience working with clients from multiple countries. All communication is handled professionally via email, WhatsApp, or video calls.' },
      { q: 'What industries do you serve?',             a: 'We work across all industries — e-commerce, healthcare, education, finance, real estate, food & delivery, and more. If you have a problem, we have a solution.' },
    ],
  },
  {
    label: 'Services',
    faqs: [
      { q: 'What services does Codeverza offer?',       a: 'We offer Web Development, Mobile App Development, UI/UX Design, AI Solutions, Cloud & DevOps, and ongoing Support & Maintenance.' },
      { q: 'Do you build mobile apps?',                 a: 'Yes. We build cross-platform mobile apps using React Native for both iOS and Android, as well as native apps when required.' },
      { q: 'Can you redesign my existing website?',     a: 'Definitely. We offer full redesign services — from UI/UX overhaul to complete rebuilds using modern tech stacks.' },
      { q: 'Do you offer AI integration services?',     a: 'Yes. We integrate AI capabilities like chatbots, recommendation engines, NLP, and OpenAI/LLM-powered features into your products.' },
    ],
  },
  {
    label: 'Process & Timeline',
    faqs: [
      { q: 'How long does a project take?',             a: 'It depends on the scope. A simple website takes 1–2 weeks. A full web app or mobile app typically takes 4–12 weeks. We always provide a clear timeline upfront.' },
      { q: 'What is your development process?',         a: 'We follow an agile approach: Discovery → Planning → Design → Development → Testing → Launch → Support. You\'re involved at every stage.' },
      { q: 'Will I get regular updates on my project?', a: 'Yes. We provide regular progress updates via your preferred channel — email, WhatsApp, or a project management tool like Trello or Notion.' },
      { q: 'Can I request changes during development?', a: 'Yes, within reason. Minor changes are accommodated. Significant scope changes may affect timeline and cost, which we\'ll discuss transparently.' },
    ],
  },
  {
    label: 'Pricing & Payment',
    faqs: [
      { q: 'How much does a project cost?',             a: 'Pricing depends on the project scope, complexity, and timeline. We offer competitive rates and provide a detailed quote after understanding your requirements.' },
      { q: 'What is your payment structure?',           a: 'We typically work with 50% upfront and 50% on delivery. For larger projects, milestone-based payments are available.' },
      { q: 'Do you offer fixed-price or hourly rates?', a: 'Both. We offer fixed-price packages for well-defined projects and hourly rates for ongoing work or consulting.' },
      { q: 'What payment methods do you accept?',       a: 'We accept bank transfers, PayPal, and other methods based on your location. We\'ll agree on the best option before starting.' },
    ],
  },
  {
    label: 'Ownership & Support',
    faqs: [
      { q: 'Will I own the source code?',               a: 'Yes. Once the project is complete and payment is settled, full ownership of the source code transfers to you. No strings attached.' },
      { q: 'Do you provide post-launch support?',       a: 'Yes. We offer ongoing maintenance and support packages to keep your product running smoothly after launch.' },
      { q: 'What if I find a bug after launch?',        a: 'We provide a free bug-fix period after launch. Any bugs related to our work are fixed at no extra cost within the agreed warranty period.' },
      { q: 'Can you host and manage my website?',       a: 'Yes. We can set up your project on reliable platforms like AWS, Vercel, or DigitalOcean and handle all the technical side for you. Hosting and ongoing management are available as part of a care plan — we\'ll discuss the best option for your needs and put together a package that works for your budget.' },
    ],
  },
];

function FAQItem({ q, a, index, isOpen, onToggle }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });

  return (
    <motion.div
      ref={ref}
      className={`faq-item ${isOpen ? 'faq-item-open' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.06 }}
    >
      <button className="faq-q" onClick={onToggle}>
        <span>{q}</span>
        <motion.span
          className="faq-icon"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
        >+</motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="faq-a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [openIndex, setOpenIndex] = useState(0);

  const allFaqs = categories.flatMap(c => c.faqs.map(f => ({ ...f, cat: c.label })));

  const filtered = allFaqs.filter(f =>
    (activeTab === 'All' || f.cat === activeTab) &&
    (search === '' || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
  );

  const handleToggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <>
      <ReusableNavbar />
      <main className="faq-main pb-1">
        <ParticleBg />
        <div className="faq-orb faq-orb-1" />
        <div className="faq-orb faq-orb-2" />

        {/* ── HERO ── */}
        <div className="faq-hero">
          <div className="faq-back-wrap">
            <Link href="/" className="faq-back"><ArrowLeft size={16} /> Back to Home</Link>
          </div>

          <motion.div className="faq-hero-icon"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
          >
            <HelpCircle size={40} color="#b14cff" />
            <motion.div className="faq-hero-ring"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </motion.div>

          <motion.div className="faq-hero-badge"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            <span className="faq-badge-dot" /> Help Center
          </motion.div>

          <motion.h1 className="faq-hero-title"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            Frequently Asked <span className="faq-purple">Questions</span>
          </motion.h1>

          <motion.p className="faq-hero-sub"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            Everything you need to know about working with Codeverza. Can't find your answer? Just reach out.
          </motion.p>

          {/* search */}
          <motion.div className="faq-search-wrap"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          >
            <Search size={16} className="faq-search-icon" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="faq-search"
            />
          </motion.div>
        </div>

        {/* ── TABS ── */}
        <div className="faq-content">
          <motion.div className="faq-tabs"
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {['All', ...categories.map(c => c.label)].map(tab => (
              <button key={tab}
                className={`faq-tab ${activeTab === tab ? 'faq-tab-active' : ''}`}
                onClick={() => { setActiveTab(tab); setOpenIndex(0); }}
              >{tab}</button>
            ))}
          </motion.div>

          {/* count */}
          <motion.p className="faq-count"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            {filtered.length} question{filtered.length !== 1 ? 's' : ''} found
          </motion.p>

          {/* list */}
          <div className="faq-list">
            {filtered.length > 0 ? (
              filtered.map((f, i) => (
                <FAQItem
                  key={i} q={f.q} a={f.a} index={i}
                  isOpen={openIndex === i}
                  onToggle={() => handleToggle(i)}
                />
              ))
            ) : (
              <div className="faq-empty">No results found. Try a different search term.</div>
            )}
          </div>
        </div>

        {/* ── BOTTOM CTA ── */}
        <motion.div className="faq-cta"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="faq-cta-glow" />
          <HelpCircle size={28} color="#b14cff" style={{ position: 'relative' }} />
          <h3>Still have questions?</h3>
          <p>Our team is happy to help. Reach out and we'll get back to you within 24 hours.</p>
          <Link href="/pages/contact-page" className="faq-cta-btn">
            Contact Us <ArrowRight size={16} />
          </Link>
        </motion.div>

      </main>
      <Footer />
    </>
  );
}
