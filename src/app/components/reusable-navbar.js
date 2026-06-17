'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import '../css/navbar2.css'

const navLinks = [
  { name: "Home",      href: "/"                    },
  { name: "About",     href: "/pages/about-page"    },
  { name: "Services",  href: "/pages/services-page",
    //  hasDropdown: true
     },
  { name: "Portfolio", href: "/pages/portfolio-page" },
  { name: "Contact",   href: "/pages/contact-page"  },
];

const dropdownItems = [
  { label: "Web Development", href: "/pages/services-page#web-development" },
  { label: "Mobile Apps",     href: "/pages/services-page#mobile-apps"     },
  { label: "UI/UX Design",    href: "/pages/services-page#ui-ux-design"    },
  { label: "AI Solutions",    href: "/pages/services-page#ai-solutions"    },
];

export default function ReusableNavbar() {
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileOpen) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  return (
    <>
      <nav className="flex items-center justify-between px-6 sm:px-12 py-5 bg-black/60 backdrop-blur-xl fixed top-0 left-0 w-full z-50 border-b border-white/10">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/img/cc-logo-new.png"
            alt="CodeCoves"
            width={100}
            height={100}
            className="cc-logo"
            // style={{ filter: 'brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(240deg)', objectFit: 'contain', width: '52px', height: '52px' }}
          />
          <span className="text-white font-bold text-2xl tracking-tight">
            Code<span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Coves</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center space-x-10 text-white font-medium">
          {navLinks.map((link) => (
            <li key={link.name} className="relative"
              onMouseEnter={() => link.hasDropdown && setDropdownOpen(true)}
              onMouseLeave={() => link.hasDropdown && setDropdownOpen(false)}
            >
              <Link href={link.href} className="hover:text-purple-400 transition duration-300">
                {link.name}
              </Link>

              {link.hasDropdown && dropdownOpen && (
                <ul className="absolute top-10 left-0 bg-black/90 backdrop-blur-md border border-purple-500/30 text-white rounded-lg shadow-2xl min-w-[200px] py-3 mt-2">
                  {dropdownItems.map((d) => (
                    <li key={d.label}>
                      <Link href={d.href} className="block px-6 py-3 hover:bg-purple-600/30 transition">
                        {d.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link href="/pages/contact-page" className="hidden lg:block bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
          Get Started
        </Link>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-white z-50" aria-label="Toggle menu">
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu-overlay ${mobileOpen ? 'mobile-menu-open' : ''}`}>
        <ul className="space-y-6 text-left mt-5 text-white text-xl font-medium">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link href={link.href} onClick={() => setMobileOpen(false)} className="block py-3 hover:text-purple-400 transition">
                {link.name}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/pages/contact-page" onClick={() => setMobileOpen(false)} className="inline-block mt-8 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-10 py-4 rounded-full font-bold transition-all">
              Get Started
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
