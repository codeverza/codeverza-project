'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import '../css/navbar2.css'

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showText, setShowText] = useState(true);

    const navLinks = [
        { name: "Home", href: "#" },
        { name: "About", href: "/about-page" },
        {
            name: "Services", href: "/services-page",
            // hasDropdown: true
        },
        { name: "Portfolio", href: "/portfolio-page" },
        { name: "Careers", href: "/career-page" },
        { name: "Contact", href: "/contact-page" },
    ];

    const heroData = [
        {
            main: "Leading Innovative",
            sub: "Software Solutions",
            para: "We craft cutting-edge web applications, mobile experiences, and AI-powered solutions that drive growth, efficiency, and digital transformation for businesses worldwide.",
        },
        {
            main: "Creative Digital Solutions",
            sub: "Web & Mobile Apps",
            para: "Our team delivers creative software, mobile apps, and AI solutions that empower businesses to innovate and grow faster.",
        },
        {
            main: "Transforming Businesses Globally",
            sub: "AI-Powered Platforms",
            para: "We design and develop digital solutions that streamline processes, boost efficiency, and help companies achieve their goals.",
        },
    ];

    // Letter animation variants
    const letterVariants = {
        initial: { opacity: 0, x: -50, y: 20, filter: "blur(4px)" },
        animate: { opacity: 1, x: 0, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: "easeOut" } },
        exit: { opacity: 0, x: 50, y: -20, filter: "blur(6px)", transition: { duration: 0.8, ease: "easeIn" } },
    };

    const container = { animate: { transition: { staggerChildren: 0.05 } } };

    // Close mobile menu when screen size changes to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024 && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mobileMenuOpen]);

    // Auto-change text
    useEffect(() => {
        if (!showText) return;

        const totalLetters =
            heroData[currentIndex].main.length +
            heroData[currentIndex].sub.length +
            heroData[currentIndex].para.length;

        const duration = totalLetters * 50 + 2000;

        const timer = setTimeout(() => {
            setShowText(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % heroData.length);
                setShowText(true);
            }, 1000);
        }, duration);

        return () => clearTimeout(timer);
    }, [currentIndex, showText]);

    return (
        <header className="relative w-full h-screen flex flex-col">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 sm:px-12 py-3 bg-black/50 backdrop-blur-xl fixed w-full z-50 border-b border-white/10">
                <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/img/codeverza-logo.png"
                        alt="Codeverza"
                        width={80}
                        height={80}
                        className="cc-logo"
                    // style={{ filter: 'brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(240deg)', objectFit: 'contain', width: '52px', height: '52px' }}
                    />
                    <span className="text-white font-bold text-2xl tracking-tight ml-2">
                        Code<span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Verza</span>
                    </span>
                </Link>
                <ul className="hidden lg:flex items-center space-x-10 text-white font-medium">
                    {navLinks.map((link) => (
                        <li key={link.name} className="relative"
                            onMouseEnter={() => link.hasDropdown && setDropdownOpen(true)}
                            onMouseLeave={() => link.hasDropdown && setDropdownOpen(false)}
                        >
                            <a href={link.href} className="hover:text-purple-400 transition duration-300">{link.name}</a>
                            {link.hasDropdown && dropdownOpen && (
                                <ul className="absolute top-10 left-0 bg-black/90 backdrop-blur-md border border-purple-500/30 text-white rounded-lg shadow-2xl min-w-[200px] py-3 mt-2">
                                    <li><a href="#web-dev" className="block px-6 py-3 hover:bg-purple-600/30 transition">Web Development</a></li>
                                    <li><a href="#mobile" className="block px-6 py-3 hover:bg-purple-600/30 transition">Mobile Apps</a></li>
                                    <li><a href="#ui-ux" className="block px-6 py-3 hover:bg-purple-600/30 transition">UI/UX Design</a></li>
                                    <li><a href="#ai" className="block px-6 py-3 hover:bg-purple-600/30 transition">AI & Machine Learning</a></li>
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
                <a href="/contact-page" className="hidden lg:block bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/25">Get Started</a>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-white z-50">
                    {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </nav>

            {/* Mobile menu */}
            <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
                <ul className="space-y-6 text-left text-white text-xl font-medium">
                    {navLinks.map((link) => (
                        <li key={link.name}>
                            <a href={link.href} onClick={() => setMobileMenuOpen(false)} className="block py-3 hover:text-purple-400 transition">{link.name}</a>
                        </li>
                    ))}
                    <li>
                        <a href="/contact-page" onClick={() => setMobileMenuOpen(false)} className="inline-block mt-8 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-10 py-4 rounded-full font-bold transition-all">Get Started</a>
                    </li>
                </ul>
            </div>

            {/* Hero Section */}
            <section className="relative w-full h-screen flex items-center justify-start">
                <Image
                    src="/img/first-section-bg-img.jpg"
                    alt="Innovative digital waves"
                    fill
                    className="object-cover"
                    priority
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

                <div className="relative z-10 ml-6 sm:ml-12 lg:ml-20 max-w-xl sm:max-w-2xl lg:max-w-4xl text-left pr-6 sm:pr-12 w-[calc(100%-48px)] sm:w-auto">

                    {/* TEXT WRAPPER — FIXED HEIGHT */}
                    <div className="min-h-[260px] sm:min-h-[320px] lg:min-h-[420px] mt-10 nav-slide-text">

                        {/* Main Heading */}
                        <AnimatePresence mode="wait">
                            {showText && (
                                <motion.h1
                                    key={`main-${currentIndex}`}
                                    variants={container}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-2"
                                >
                                    {heroData[currentIndex].main.split("").map((char, i) => (
                                        <motion.span key={`main-char-${i}`} variants={letterVariants} className="inline-block">
                                            {char === " " ? "\u00A0" : char}
                                        </motion.span>
                                    ))}
                                </motion.h1>
                            )}
                        </AnimatePresence>

                        {/* Subheading */}
                        <AnimatePresence mode="wait">
                            {showText && (
                                <motion.h3
                                    key={`sub-${currentIndex}`}
                                    variants={container}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6"
                                >
                                    {heroData[currentIndex].sub.split("").map((char, i) => (
                                        <motion.span key={`sub-char-${i}`} variants={letterVariants} className="inline-block bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                                            {char === " " ? "\u00A0" : char}
                                        </motion.span>
                                    ))}
                                </motion.h3>
                            )}
                        </AnimatePresence>

                        {/* Paragraph */}
                        <AnimatePresence mode="wait">
                            {showText && (
                                <motion.p
                                    key={`para-${currentIndex}`}
                                    variants={container}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className="text-sm sm:text-lg lg:text-2xl text-gray-200 mb-8 max-w-xs sm:max-w-xl lg:max-w-2xl leading-relaxed"
                                >
                                    {heroData[currentIndex].para.split(" ").map((word, wi) => (
                                        <span key={`para-word-${wi}`} className="inline-block mr-[0.28em]">
                                            {word.split("").map((char, ci) => (
                                                <motion.span key={`para-${wi}-${ci}`} variants={letterVariants} className="inline-block">
                                                    {char}
                                                </motion.span>
                                            ))}
                                        </span>
                                    ))}
                                </motion.p>
                            )}
                        </AnimatePresence>

                    </div>

                    {/* BUTTONS */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 nav-slide-btns">
                        <a href="/services-page" className="inline-block bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg transition-all duration-300 shadow-xl hover:shadow-purple-500/40 text-center">
                            Explore Services
                        </a>
                        <a href="/contact-page" className="inline-block border-2 border-purple-500 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg hover:bg-purple-600/20 transition-all duration-300 text-center">
                            Contact Us
                        </a>
                    </div>
                </div>
            </section>
        </header>
    );
};

export default Navbar;
