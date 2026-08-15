'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, MapPin, Briefcase, Wifi, DollarSign,
  TrendingUp, Users, Star, CheckCircle, ChevronDown, ChevronUp,
  Send, Zap, Globe, Award, Clock, Target
} from 'lucide-react';
import ReusableNavbar from '../components/reusable-navbar';
import Footer from '../components/footer';
import JsonLd from './JsonLd';
import './career-page.css';

/* ── Particle Background ── */
function ParticleBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h, particles, raf;
    const init = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.5 + 0.4,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(177,76,255,0.75)'; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++)
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(177,76,255,${0.2 * (1 - d / 110)})`; ctx.lineWidth = 0.7; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    init(); draw();
    const ro = new ResizeObserver(init); ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="cp-canvas" />;
}

/* ── Animated Section Wrapper ── */
function Section({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65 }}
    >{children}</motion.div>
  );
}

/* ── Data ── */
const highlights = [
  { icon: <Wifi size={22} />,       title: '100% Remote',           desc: 'Work from anywhere in the world. No office required.' },
  { icon: <DollarSign size={22} />, title: 'Unlimited Earnings',     desc: 'No ceiling on what you can make — your effort defines your income.' },
  { icon: <TrendingUp size={22} />, title: 'Performance Incentives', desc: 'Top performers receive additional rewards on top of their earnings.' },
  { icon: <Globe size={22} />,      title: 'No Geo Restrictions',    desc: 'Open to candidates from any country or region.' },
  { icon: <Clock size={22} />,      title: 'Flexible Hours',         desc: 'Work on your own schedule — morning, afternoon, or night.' },
  { icon: <Award size={22} />,      title: 'Grow With Us',           desc: 'As Codeverza grows, so do your opportunities and rewards.' },
];

const responsibilities = [
  'Identify and approach potential clients who require software or digital services.',
  'Generate leads through your own network, social media, LinkedIn, freelancing platforms, referrals, or other suitable channels.',
  'Introduce clients to Codeverza\'s services in a professional manner.',
  'Understand the client\'s initial requirements and coordinate with the Codeverza team when technical assistance or project estimation is required.',
  'Assist in communication during the initial project discussion and deal-confirmation process.',
  'Maintain professional communication with prospective clients.',
  'Build and maintain strong relationships with potential and existing clients.',
  'Identify new markets and business opportunities that could generate projects for Codeverza.',
  'Focus on consistently generating quality leads and successful sales.',
  'Work independently in a 100% remote environment.',
];

const requirements = [
  'Strong communication and negotiation skills.',
  'Ability to identify, approach, and communicate with potential clients.',
  'Confidence in presenting services and converting opportunities into successful deals.',
  'Basic understanding of websites, software, ERP systems, mobile apps, or digital services is preferred.',
  'Self-motivated and target-oriented mindset.',
  'Ability to work independently without constant supervision.',
  'Professional attitude when communicating with clients.',
  'Strong networking and relationship-building abilities.',
  'Previous sales or business development experience is a plus, but not mandatory.',
  'A positive attitude and willingness to grow with the company.',
];

const perks = [
  { icon: '🏠', label: '100% Remote Work' },
  { icon: '⏰', label: 'Flexible Schedule' },
  { icon: '💰', label: 'Unlimited Commission' },
  { icon: '🎯', label: 'Performance Bonuses' },
  { icon: '🌍', label: 'Work From Anywhere' },
  { icon: '📈', label: 'Career Growth' },
  { icon: '🤝', label: 'Supportive Team' },
  { icon: '🚀', label: 'Growing Company' },
];

const commissionSteps = [
  { step: '01', icon: <Users size={20} />,     title: 'Bring a Client',          desc: 'Connect a potential client with Codeverza.' },
  { step: '02', icon: <CheckCircle size={20} />, title: 'Confirm the Project',   desc: 'Help finalize the project scope and confirm the deal.' },
  { step: '03', icon: <Zap size={20} />,       title: 'Project Completion',       desc: 'Codeverza delivers the project to the client.' },
  { step: '04', icon: <DollarSign size={20} />, title: 'Earn Your Commission',   desc: 'Receive your agreed commission once payment is received.' },
];

/* ── Main Component ── */
export default function CareerPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'How do I apply for a position at Codeverza?',
      a: 'Simply visit our Contact page and send us a message mentioning the position you are interested in. Our team will get back to you with the next steps.',
    },
    {
      q: 'Are all positions at Codeverza remote?',
      a: 'Yes. All current and future openings at Codeverza are fully remote. You can work from anywhere in the world with no geographical restrictions.',
    },
    {
      q: 'Do I need a formal degree or certification to apply?',
      a: 'Not necessarily. We value skills, attitude, and the ability to deliver results over formal qualifications. Each position has its own requirements, which are listed in the job description.',
    },
    {
      q: 'How does the earning structure work at Codeverza?',
      a: 'Earning structures vary by role. Some positions are performance-based where your income grows with your results, while future roles may have different arrangements. Details are always clearly mentioned in each job listing.',
    },
    {
      q: 'Will there be more job openings in the future?',
      a: 'Yes. As Codeverza grows, we will be adding new positions across different departments. Keep checking this page for the latest opportunities.',
    },
    {
      q: 'Can I apply even if there is no matching opening right now?',
      a: 'Absolutely. If you believe you can add value to Codeverza, reach out to us through the Contact page. We are always open to connecting with talented and motivated individuals.',
    },
    {
      q: 'What is the commission process — how and when do I get paid?',
      a: 'Once you bring a client and the project is confirmed, our team takes care of the development and delivery. After the project is successfully completed and the client payment has been received by Codeverza, your agreed commission for that project is paid to you. The commission percentage or amount is mutually discussed and agreed upon based on the project value and scope before the deal is finalized.',
    },
    {
      q: 'If I bring more sales, will I receive additional incentives?',
      a: 'Yes. At Codeverza, we recognize and reward consistent high performance. If you regularly bring valuable projects and demonstrate strong results, you may receive additional performance-based incentives and rewards on top of your regular earnings. The more you contribute to our growth, the more we want to give back to you.',
    },
  ];

  return (
    <>
      <JsonLd />
      <ReusableNavbar />
      <main className="cp-main">
        <ParticleBg />
        <div className="cp-orb cp-orb-1" />
        <div className="cp-orb cp-orb-2" />
        <div className="cp-orb cp-orb-3" />

        {/* ── HERO ── */}
        <div className="cp-hero">
          <div className="cp-back-wrap">
            <Link href="/" className="cp-back"><ArrowLeft size={16} /> Back to Home</Link>
          </div>

          <motion.div className="cp-hero-badge main-margin-top"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="cp-badge-dot" /> Careers at Codeverza
          </motion.div>

          <motion.h1 className="cp-hero-title"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            Grow With Us.<br /><span className="cp-purple">Build Your Future.</span>
          </motion.h1>

          <motion.p className="cp-hero-sub"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            Join a growing software company where your efforts are rewarded, your schedule is flexible, and your potential is unlimited.
          </motion.p>

          <motion.div className="cp-hero-tags"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}>
            <span className="cp-tag"><MapPin size={14} /> Remote / Work From Anywhere</span>
            <span className="cp-tag"><Wifi size={14} /> 100% Remote</span>
            <span className="cp-tag"><Clock size={14} /> Flexible Hours</span>
          </motion.div>
        </div>

        {/* ── WHY JOIN ── */}
        <Section className="cp-section">
          <div className="cp-section-label">Why Codeverza</div>
          <h2 className="cp-section-title cp-center">Why <span className="cp-purple">Work With Us?</span></h2>
          <div className="cp-highlights-grid">
            {highlights.map((h, i) => (
              <motion.div key={i} className="cp-highlight-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, borderColor: 'rgba(177,76,255,0.5)' }}
              >
                <div className="cp-highlight-icon">{h.icon}</div>
                <h4>{h.title}</h4>
                <p>{h.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ── JOB CARD ── */}
        <Section className="cp-section">
          <div className="cp-section-label">Open Position</div>
          <h2 className="cp-section-title cp-center">Available <span className="cp-purple">Opportunity</span></h2>

          <motion.div className="cp-job-card"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Job Header */}
            <div className="cp-job-header">
              <div className="cp-job-icon-wrap">
                <TrendingUp size={28} />
              </div>
              <div className="cp-job-title-block">
                <div className="cp-job-badge">Now Hiring</div>
                <h3 className="cp-job-title">Sales Representative</h3>
                <div className="cp-job-meta">
                  <span><MapPin size={13} /> Remote / Work From Anywhere</span>
                  <span><Briefcase size={13} /> Commission-Based</span>
                  <span><Wifi size={13} /> 100% Remote</span>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="cp-job-section">
              <h4 className="cp-job-sh">Job Description</h4>
              <p className="cp-job-p">
                Codeverza is looking for motivated and results-driven <strong>Sales Representatives</strong> who can identify potential clients, generate leads, and bring software and digital projects to the company.
              </p>
              <p className="cp-job-p">
                This is a <strong>fully remote opportunity</strong> with earnings based on the projects you successfully bring to Codeverza. We are looking for individuals who are confident in communication, passionate about sales, and capable of creating new business opportunities. You will have the flexibility to work remotely while our technical team handles the development and delivery.
              </p>
            </div>

            <div className="cp-job-divider" />

            {/* Commission Flow */}
            <div className="cp-job-section">
              <h4 className="cp-job-sh">How You Earn</h4>
              <p className="cp-job-p">
                Your earnings are tied directly to your results. Once you bring a project, our team handles everything — and once the client payment is received, your agreed share is paid to you.
              </p>
              <div className="cp-commission-flow">
                {commissionSteps.map((s, i) => (
                  <div key={i} className="cp-flow-step">
                    <div className="cp-flow-icon">{s.icon}</div>
                    <div className="cp-flow-num">{s.step}</div>
                    <h5>{s.title}</h5>
                    <p>{s.desc}</p>
                    {i < commissionSteps.length - 1 && <div className="cp-flow-arrow"><ArrowRight size={16} /></div>}
                  </div>
                ))}
              </div>
              <div className="cp-commission-note">
                <Target size={16} />
                <span>There is <strong>no fixed limit on your earning potential</strong> — the more successful projects you bring, the more you earn.</span>
              </div>
            </div>

            <div className="cp-job-divider" />

            {/* Incentives */}
            <div className="cp-job-section">
              <h4 className="cp-job-sh">Performance-Based Incentives</h4>
              <div className="cp-incentive-box">
                <div className="cp-incentive-icon"><Star size={22} /></div>
                <div>
                  <p className="cp-job-p">At Codeverza, exceptional performance deserves recognition. Sales Representatives who consistently perform well may receive <strong>additional performance-based incentives</strong> and rewards on top of their regular earnings.</p>
                  <div className="cp-incentive-chain">
                    <span>More Sales</span>
                    <ArrowRight size={14} />
                    <span>More Earnings</span>
                    <ArrowRight size={14} />
                    <span>More Opportunities</span>
                    <ArrowRight size={14} />
                    <span className="cp-chain-highlight">Additional Rewards</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="cp-job-divider" />

            {/* Two Column: Responsibilities + Requirements */}
            <div className="cp-job-two-col">
              <div className="cp-job-section">
                <h4 className="cp-job-sh">Key Responsibilities</h4>
                <ul className="cp-checklist">
                  {responsibilities.map((r, i) => (
                    <li key={i}><CheckCircle size={15} className="cp-check-icon" /><span>{r}</span></li>
                  ))}
                </ul>
              </div>
              <div className="cp-job-section">
                <h4 className="cp-job-sh">What We're Looking For</h4>
                <ul className="cp-checklist">
                  {requirements.map((r, i) => (
                    <li key={i}><CheckCircle size={15} className="cp-check-icon" /><span>{r}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="cp-job-divider" />

            {/* Perks */}
            <div className="cp-job-section">
              <h4 className="cp-job-sh">Perks & Benefits</h4>
              <div className="cp-perks-grid">
                {perks.map((p, i) => (
                  <div key={i} className="cp-perk">
                    <span className="cp-perk-icon">{p.icon}</span>
                    <span>{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply CTA */}
            <div className="cp-apply-wrap">
              <h4 className="cp-apply-title">Ready to Grow With Us?</h4>
              <p className="cp-apply-sub">
                Turn your connections into opportunities, your efforts into earnings, and your ambition into success — join Codeverza and let's build, grow, and succeed together.
              </p>
              <Link href="/career-form" className="cp-apply-btn">
                <Send size={18} /> Apply Now
              </Link>
            </div>
          </motion.div>
        </Section>

        {/* ── FAQ ── */}
        <Section className="cp-section">
          <div className="cp-section-label">Quick Answers</div>
          <h2 className="cp-section-title cp-center">Frequently Asked <span className="cp-purple">Questions</span></h2>
          <div className="cp-faq-list">
            {faqs.map((faq, i) => (
              <motion.div key={i} className={`cp-faq-item ${openFaq === i ? 'cp-faq-open' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <button className="cp-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div className="cp-faq-a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ── CTA ── */}
        <motion.div className="cp-cta-box"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="cp-cta-glow" />
          <h3>Ready to Start Your Journey?</h3>
          <p>If you have the confidence to connect with clients and the ambition to grow, we want you on our team.</p>
          <Link href="/contact-page" className="cp-cta-btn">
            Get In Touch <ArrowRight size={18} />
          </Link>
        </motion.div>

      </main>
      <Footer />
    </>
  );
}
