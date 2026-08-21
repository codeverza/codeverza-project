'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaGithub, FaLinkedin, FaInstagram,
  FaFacebook,
} from 'react-icons/fa';
import { Mail, Phone, MapPin, ChevronRight, Heart } from 'lucide-react';
import { db } from '../../../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Swal from 'sweetalert2';
import '../css/footer.css';

const links = {
  Company: [
    { label: 'About Us',    href: '/about-page'     },
    { label: 'Services',    href: '/services-page'  },
    { label: 'Technologies',href: '/#technologies'        },
    { label: 'How It Works',href: '/#how-it-works'        },
    { label: 'Contact',     href: '/contact-page'   },
  ],
  Services: [
    { label: 'Web Development', href: '/services-page#web-development' },
    { label: 'Mobile Apps',     href: '/services-page#mobile-apps'     },
    { label: 'UI/UX Design',    href: '/services-page#ui-ux-design'    },
    { label: 'AI Solutions',    href: '/services-page#ai-solutions'    },
    { label: 'Cloud & DevOps',  href: '/services-page#cloud-devops'    },
  ],
  Support: [
    { label: 'FAQ',                href: '/faq'                    },
    { label: 'Portfolio',          href: '/portfolio-page'         },
    { label: 'Privacy Policy',     href: '/privacy-policy'         },
    { label: 'Terms & Conditions', href: '/terms-conditions'            },
    { label: 'Contact Us',         href: '/contact-page'           },
  ],
};

const socials = [
  { icon: <FaGithub size={18} />,   href: 'https://github.com/codeverza02',                label: 'GitHub'   },
  { icon: <FaLinkedin size={18} />, href: 'https://www.linkedin.com/feed/',       label: 'LinkedIn' },
  // { icon: <FaTwitter size={18} />,  href: '#',                label: 'Twitter'  },
  { icon: <FaInstagram size={18} />,href: 'https://www.instagram.com/codeverza?igsh=Z2NkOW84ejE1cXQ3',              label: 'Instagram'},
  { icon: <FaFacebook size={18} />,href: 'https://www.facebook.com/share/19AgBVfZht/',  label: 'Facebook'},
];

const contact = [
  { icon: <Mail size={15} />,    text: 'info@codeverza.com', href: 'mailto:info@codeverza.com'  },
  { icon: <Phone size={15} />,   text: '+92 325 1507557',        href: 'https://wa.me/923251507557'    },
  { icon: <MapPin size={15} />,  text: 'Karachi, Pakistan 🇵🇰',            href: null                            },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: 'easeOut' },
});

export default function Footer() {
  const year = new Date().getFullYear();
  const [subEmail, setSubEmail] = useState('');
  const [subLoading, setSubLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!subEmail.trim()) return;
    setSubLoading(true);

    Swal.fire({
      title: 'Subscribing...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
      background: '#0d0d0d',
      color: '#fff',
    });

    try {
      const emailKey = subEmail.trim().toLowerCase().replace(/[.#$[\]]/g, '_');
      const ref = doc(db, 'subscribers', emailKey);

      await setDoc(ref, {
        email: subEmail.trim(),
        subscribedAt: serverTimestamp(),
        source: 'footer',
      }, { merge: true });
      Swal.fire({
        title: 'Subscribed! 🎉',
        text: "You'll receive the latest updates from Codeverza.",
        icon: 'success',
        confirmButtonText: 'Great!',
        background: '#0d0d0d',
        color: '#fff',
        confirmButtonColor: '#b14cff',
        iconColor: '#b14cff',
      });
      setSubEmail('');
    } catch {
      Swal.fire({ title: 'Error', text: 'Something went wrong. Try again.', icon: 'error', background: '#0d0d0d', color: '#fff', confirmButtonColor: '#b14cff' });
    }
    setSubLoading(false);
  };

  return (
    <footer className="footer">
      {/* top divider glow */}
      <div className="footer-divider" />

      {/* background orbs */}
      <div className="footer-orb footer-orb-1" />
      <div className="footer-orb footer-orb-2" />

      <div className="footer-inner">

        {/* ── COL 1: brand ── */}
        <motion.div className="footer-brand" {...fadeUp(0)}>
          <div className="footer-logo">
            Code<span>Verza</span>
          </div>
          <p className="footer-tagline">
            Building digital experiences that actually matter. From idea to deployment — we've got you covered.
          </p>

          <div className="footer-contact-list">
            {contact.map((c, i) => (
              c.href ? (
                <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" className="footer-contact-item footer-contact-link">
                  <span className="footer-contact-icon">{c.icon}</span>
                  {c.text}
                </a>
              ) : (
                <div key={i} className="footer-contact-item">
                  <span className="footer-contact-icon">{c.icon}</span>
                  {c.text}
                </div>
              )
            ))}
          </div>

          <div className="footer-socials">
            {socials.map((s, i) => (
              <motion.a key={i} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer"
                className="footer-social-btn"
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                {s.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* ── COL 2-4: nav links ── */}
        {Object.entries(links).map(([title, items], gi) => (
          <motion.div key={title} className="footer-col" {...fadeUp(0.1 + gi * 0.1)}>
            <h4 className="footer-col-title">{title}</h4>
            <ul className="footer-col-list">
              {items.map((item, i) => (
                <li key={i}>
                  <a href={item.href} className="footer-link">
                    <ChevronRight size={14} className="footer-link-arrow" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        {/* ── COL 5: newsletter ── */}
        <motion.div className="footer-col footer-newsletter" {...fadeUp(0.4)}>
          <h4 className="footer-col-title">Stay Updated</h4>
          <p className="footer-newsletter-desc">
            Get the latest updates on tech, projects, and insights from Codeverza.
          </p>
          <div className="footer-newsletter-form">
            <input type="email" placeholder="your@email.com" className="footer-newsletter-input"
              value={subEmail} onChange={e => setSubEmail(e.target.value)} />
            <motion.button className="footer-newsletter-btn" onClick={handleSubscribe}
              disabled={subLoading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              {subLoading ? '...' : 'Subscribe'}
            </motion.button>
          </div>
          <div className="footer-badge-row">
            <span className="footer-badge">⚡ Fast Delivery</span>
            <span className="footer-badge">🔒 Secure</span>
            <span className="footer-badge">✨ Quality</span>
          </div>
        </motion.div>

      </div>

      {/* ── bottom bar ── */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span className="footer-copy">
            © {year} <strong>Codeverza</strong>. All rights reserved.
          </span>
          <span className="footer-made">
            Made with <Heart size={13} className="footer-heart" /> in Pakistan
          </span>
        </div>
      </div>
    </footer>
  );
}
