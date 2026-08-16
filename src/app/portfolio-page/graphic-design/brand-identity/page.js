'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, ArrowRight, Sparkles, ZoomIn, X, Eye } from 'lucide-react';
import ReusableNavbar from '@/app/components/reusable-navbar';
import Footer from '@/app/components/footer';
import '../graphic-design.css';
import './brand-identity.css';

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
        ctx.fillStyle = 'rgba(242,78,30,0.65)'; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(242,78,30,${0.16 * (1 - d / 120)})`; ctx.lineWidth = 0.8; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    init(); draw();
    const ro = new ResizeObserver(init); ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="gd-canvas" />;
}

/* ─────────────────────────────────────────
   Brand work data
   • image: put real image path here (e.g. '/img/brand/logo.jpg')
     when no image is provided the emoji fallback is shown instead
───────────────────────────────────────── */
const brandWork = [
  {
    id: 1,
    label: 'Primary Logo',
    emoji: '🏷️',
    gradient: 'linear-gradient(135deg, #2a0a00, #5a1e00)',
    shortDesc: 'Main brand mark — wordmark + icon variant crafted for instant recognition across every medium.',
    fullDesc: `The primary logo is the cornerstone of the entire brand identity. We design both a wordmark and an icon variant so the brand works everywhere — from business cards to billboards.

Every curve, weight, and spacing decision is intentional. The icon is built on a geometric grid so it scales perfectly from a 16×16 favicon all the way up to a 3-metre signage print without losing clarity.

Deliverables include:
• Primary full-colour logo
• Reversed / white version for dark backgrounds
• Monochrome single-colour version
• Favicon-optimised icon crop
• All source files in AI + SVG formats`,
    tags: ['Illustrator', 'Logo Design'],
    image: null,
  },
  {
    id: 2,
    label: 'Color Palette',
    emoji: '🎨',
    gradient: 'linear-gradient(135deg, #1a0030, #3d0060)',
    shortDesc: 'Primary, secondary & accent color system — HEX, RGB, and CMYK values for every use case.',
    fullDesc: `Color is the first thing people feel about a brand — before they read a single word. The palette system we build is deliberate and consistent.

We define:
• 1–2 primary brand colors
• 1–2 secondary supporting colors
• 1 accent / CTA color
• Neutral tones (backgrounds, text, borders)

Every color ships with HEX, RGB, CMYK, and Pantone references so the palette looks identical whether it's on screen, in print, or on a product.

We also document contrast ratios to make sure text remains accessible on every background color.`,
    tags: ['Brand System', 'Figma'],
    image: null,
  },
  {
    id: 3,
    label: 'Typography',
    emoji: '🔤',
    gradient: 'linear-gradient(135deg, #001a2a, #003a5a)',
    shortDesc: 'Heading + body typeface selection & pairing — with sizing scale and usage guidelines.',
    fullDesc: `Typography shapes the personality and tone of a brand just as much as color does. The wrong font pairing makes even a great logo feel off.

We select and pair:
• A display / heading typeface — bold, expressive, memorable
• A body / paragraph typeface — legible, clean, versatile
• An optional accent / caption typeface where needed

The type system includes a full size scale (H1 through body and caption), line-height & letter-spacing specs, and clear do's & don'ts for usage.

All selected typefaces are confirmed for commercial licensing and web embedding.`,
    tags: ['Typography', 'Brand Design'],
    image: null,
  },
  {
    id: 4,
    label: 'Business Card',
    emoji: '💼',
    gradient: 'linear-gradient(135deg, #0a1a00, #1a3a00)',
    shortDesc: 'Front & back business card design — print-ready at 300 DPI with bleed and crop marks.',
    fullDesc: `A business card is often the first physical touchpoint of a brand. We design both sides with care — it should feel premium in someone's hand.

The design uses the brand's colors, typography, and logo marks in a layout that's clean, legible, and visually striking at the standard 3.5" × 2" size.

Every card is delivered:
• 300 DPI resolution
• With 3mm bleed on all sides
• Crop marks and safe zone guides included
• PDF/X-1a print-ready export
• Editable Illustrator source file

We also provide a digital version optimised for email signatures and virtual backgrounds.`,
    tags: ['Print Design', 'Illustrator'],
    image: null,
  },
  {
    id: 5,
    label: 'Letterhead',
    emoji: '📄',
    gradient: 'linear-gradient(135deg, #2a1500, #4a2800)',
    shortDesc: 'Official letterhead & stationery — A4 / Letter size, print-ready and editable Word template.',
    fullDesc: `Professional stationery signals that a brand is established and trustworthy. The letterhead design brings the visual identity into every formal communication.

We design:
• A4 letterhead (and US Letter size on request)
• Matching envelope design (DL / C4)
• Compliment slip

Each piece is delivered as a print-ready PDF and also as an editable Microsoft Word / Google Docs template so the client can fill in content themselves.

The layout follows typographic grid principles — generous margins, correct hierarchy, and enough white space to keep documents readable.`,
    tags: ['Stationery', 'Print Design'],
    image: null,
  },
  {
    id: 6,
    label: 'Social Media Kit',
    emoji: '📲',
    gradient: 'linear-gradient(135deg, #00101a, #002a3a)',
    shortDesc: 'Profile picture, cover photo & post templates — sized perfectly for every major platform.',
    fullDesc: `Consistency across social media builds brand recognition fast. The social media kit ensures every platform feels like the same brand.

The kit includes:
• Profile picture — optimised for circular crop (Instagram, Facebook, LinkedIn, Twitter/X)
• Cover / banner photos — sized for Facebook, LinkedIn, YouTube, and Twitter/X
• 3–5 post templates (square 1:1 and portrait 4:5) in Canva and Figma
• Story template (9:16) with animated version available on request
• Highlight cover icon set (12 icons)

Templates are fully editable — the client can swap text and images without touching the design structure.`,
    tags: ['Social Media', 'Canva'],
    image: null,
  },
  {
    id: 7,
    label: 'Brand Guidelines',
    emoji: '📋',
    gradient: 'linear-gradient(135deg, #1a001a, #3a0040)',
    shortDesc: "Full brand guidelines document — logo rules, color codes, typography specs, and do's & don'ts.",
    fullDesc: `The brand guidelines document is the rulebook that keeps the brand consistent no matter who is working with it — designers, marketers, or external agencies.

The document covers:
• Brand story and values (one paragraph overview)
• Logo — all variants, minimum sizes, clear space rules, and misuse examples
• Color palette — with all code references and accessibility notes
• Typography — scale, pairing rules, and forbidden combinations
• Imagery style — photo direction, tone, and filters
• Tone of voice — short description of how the brand speaks
• Do's & Don'ts — visual examples of correct and incorrect usage

Delivered as a polished PDF (typically 20–30 pages) and a shareable Figma file.`,
    tags: ['Documentation', 'Figma'],
    image: null,
  },
  {
    id: 8,
    label: 'Icon Set',
    emoji: '✳️',
    gradient: 'linear-gradient(135deg, #001a10, #003a20)',
    shortDesc: 'Custom icon set aligned to brand identity — consistent stroke weight and geometric style.',
    fullDesc: `Generic icons break brand consistency. A custom icon set keeps every visual touchpoint — from website to app to presentation — feeling intentionally on-brand.

We design 16–24 custom icons covering the core concepts of the business (e.g. services, navigation, features, UI actions). Each icon is:

• Built on a consistent 24×24px grid
• Uniform stroke weight (matches the logo's visual weight)
• Delivered as individual SVG files + a combined sprite sheet
• Available in outlined, filled, and two-tone variants
• Figma component library included for easy handoff to developers`,
    tags: ['Icons', 'Illustrator'],
    image: null,
  },
  {
    id: 9,
    label: 'Brand Mockups',
    emoji: '🖼️',
    gradient: 'linear-gradient(135deg, #1a0800, #3a1800)',
    shortDesc: 'Real-world mockups — t-shirt, mug, signage, packaging — showing the brand in context.',
    fullDesc: `Mockups bring a brand identity to life before anything is physically produced. They answer the question every client asks: "What will this actually look like in the real world?"

We create high-quality Photoshop mockups across relevant surfaces:
• Apparel — t-shirt, hoodie, cap
• Merchandise — mug, tote bag, pen
• Signage — building fascia, roller banner, vehicle wrap
• Packaging — box, bag, label (where applicable)
• Digital — device mockups (phone, laptop, tablet)

Each mockup is rendered with realistic lighting and shadows so it looks like a professional product photograph. Delivered as high-resolution JPG and editable PSD files.`,
    tags: ['Mockups', 'Photoshop'],
    image: null,
  },
];

export default function BrandIdentityPage() {
  const [modalItem, setModalItem]       = useState(null); // description popup
  const [lightboxItem, setLightboxItem] = useState(null); // full image zoom

  /* close on Escape key */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setModalItem(null); setLightboxItem(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* lock body scroll when any overlay is open */
  useEffect(() => {
    document.body.style.overflow = (modalItem || lightboxItem) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalItem, lightboxItem]);

  return (
    <>
      <ReusableNavbar />
      <main className="gd-main pb-1">
        <ParticleBg />
        <div className="gd-orb gd-orb-1" />
        <div className="gd-orb gd-orb-2" />
        <div className="gd-orb gd-orb-3" />

        {/* ── BACK BUTTON ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '90px 6% 0' }}>
          <Link href="/portfolio-page?tab=design" className="gd-back mt-[30px]">
            <ArrowLeft size={16} /> Back to Portfolio
          </Link>
        </div>

        {/* ── HERO ── */}
        <div className="gd-hero">
          <motion.div className="gd-hero-badge"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <span className="gd-badge-dot" /> Brand Design
          </motion.div>

          <motion.h1 className="gd-hero-title"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            Brand <span className="gd-orange">Identity</span>
          </motion.h1>

          <motion.p className="gd-hero-sub"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            A complete brand identity system — from logo to guidelines. Every element crafted to make your brand unforgettable.
          </motion.p>

          <motion.div className="gd-hero-pills"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            {['Figma', 'Illustrator', 'Photoshop', 'Brand System'].map((t, i) => (
              <span key={i} className="gd-pill"><Sparkles size={12} /> {t}</span>
            ))}
          </motion.div>
        </div>

        {/* ── POSTER LIST ── */}
        <div className="gd-content">
          <div className="bi-section-label">What We Create</div>
          <h2 className="bi-section-title">Brand Identity <span className="gd-orange">Deliverables</span></h2>

          <div className="bi-poster-list">
            {brandWork.map((item, i) => (
              <motion.div
                key={item.id}
                className="bi-poster-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                {/* ── VISUAL / POSTER IMAGE ── */}
                <div
                  className="bi-poster-visual"
                  style={!item.image ? { background: item.gradient } : {}}
                  onClick={() => setLightboxItem(item)}
                  title="Click to zoom"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.label} />
                  ) : (
                    <div className="bi-poster-emoji-wrap">
                      <span className="bi-poster-emoji">{item.emoji}</span>
                    </div>
                  )}

                  {/* zoom overlay */}
                  <div className="bi-poster-zoom-overlay">
                    <div className="bi-zoom-icon">
                      <ZoomIn size={22} />
                    </div>
                  </div>

                  <div className="bi-poster-shine" />
                </div>

                {/* ── BODY ROW ── */}
                <div className="bi-poster-body">
                  <div className="bi-poster-body-left">
                    <div className="bi-poster-number">0{item.id}</div>
                    <div className="bi-poster-label">{item.label}</div>
                    <p className="bi-poster-short-desc">{item.shortDesc}</p>
                    <div className="bi-poster-tags">
                      {item.tags.map(t => <span key={t} className="gd-tag">{t}</span>)}
                    </div>
                  </div>

                  <button
                    className="bi-view-full-btn"
                    onClick={() => setModalItem(item)}
                  >
                    <Eye size={14} /> View Full
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── WHAT WE DELIVER ── */}
        <motion.div className="gd-offer"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="gd-section-label">Package Includes</div>
          <h2 className="gd-section-title">Every Brand Package <span className="gd-orange">Includes</span></h2>
          <div className="gd-offer-grid">
            {[
              'Primary + secondary logo variants',
              'Full color palette system',
              'Typography selection & pairing',
              'Business card design (print-ready)',
              'Letterhead & stationery',
              'Social media kit (profile + cover)',
              'Brand guidelines document',
              'All source files (AI / Figma)',
            ].map((item, i) => (
              <motion.div key={i} className="gd-offer-item"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <CheckCircle size={16} color="#f24e1e" style={{ flexShrink: 0 }} />
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div className="gd-cta"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="gd-cta-glow" />
          <h3>Need a brand identity?</h3>
          <p>Let&apos;s build a brand that people remember.</p>
          <Link href="/contact-page" className="gd-cta-btn">
            Get Started <ArrowRight size={16} />
          </Link>
        </motion.div>

      </main>
      <Footer />

      {/* ════════════════════════════════════
          DESCRIPTION MODAL (View Full popup)
      ════════════════════════════════════ */}
      <AnimatePresence>
        {modalItem && (
          <motion.div
            className="bi-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setModalItem(null)}
          >
            <motion.div
              className="bi-modal"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
            >
              {/* close button */}
              <button className="bi-modal-close" onClick={() => setModalItem(null)}>
                <X size={16} />
              </button>

              {/* poster image / emoji at top of modal */}
              <div
                className="bi-modal-visual"
                style={!modalItem.image ? { background: modalItem.gradient } : {}}
                onClick={() => { setLightboxItem(modalItem); setModalItem(null); }}
                title="Click to zoom full screen"
              >
                {modalItem.image ? (
                  <img src={modalItem.image} alt={modalItem.label} />
                ) : (
                  <div className="bi-modal-visual-emoji">{modalItem.emoji}</div>
                )}
              </div>

              {/* body */}
              <div className="bi-modal-body">
                <div className="bi-modal-num">0{modalItem.id}</div>
                <h3 className="bi-modal-title">{modalItem.label}</h3>
                <div className="bi-modal-tags">
                  {modalItem.tags.map(t => <span key={t} className="gd-tag">{t}</span>)}
                </div>
                <p className="bi-modal-desc">{modalItem.fullDesc}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════
          LIGHTBOX (full-screen poster zoom)
      ════════════════════════════════════ */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            className="bi-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxItem(null)}
          >
            <button className="bi-lightbox-close" onClick={() => setLightboxItem(null)}>
              <X size={18} />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
            >
              {lightboxItem.image ? (
                <img className="bi-lightbox-img" src={lightboxItem.image} alt={lightboxItem.label} />
              ) : (
                <span className="bi-lightbox-emoji">{lightboxItem.emoji}</span>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
