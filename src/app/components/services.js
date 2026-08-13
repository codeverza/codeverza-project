'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import '../css/services.css';
import {
  Code,
  Smartphone,
  Palette,
  Brain,
  Cloud,
  Headphones,
  Brush,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const services = [
  { title: 'Web Development',          desc: 'Modern & scalable websites.',          icon: <Code /> },
  { title: 'Mobile Apps',              desc: 'iOS & Android applications.',           icon: <Smartphone /> },
  { title: 'UI / UX Design',           desc: 'Clean and user-focused designs.',       icon: <Palette /> },
  { title: 'AI Solutions',             desc: 'AI-powered smart systems.',             icon: <Brain /> },
  { title: 'Cloud & DevOps',           desc: 'Secure cloud infrastructure.',          icon: <Cloud /> },
  { title: 'Graphic Design',           desc: 'Logos, branding & social media.',       icon: <Brush /> },
  { title: 'Motion & Animation',       desc: 'Engaging animations & motion graphics.',icon: <Sparkles /> },
  { title: 'Support & Maintenance',    desc: 'Reliable long-term support.',           icon: <Headphones /> },
];

export default function Services() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let width, height;
    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const count = 70;
    const maxDist = 130;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(177,76,255,0.8)';
        ctx.fill();
      });

      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(177,76,255,${1 - dist / maxDist})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section className="services-section">
      {/* 🧠 Particle Network */}
      <canvas ref={canvasRef} className="particle-canvas"></canvas>

      <h2 className="services-title">
        Our <span>Services</span>
      </h2>

      <div className="services-grid">
        {services.map((service, i) => (
          <div className="service-card" key={i}>
            <div className="icon-box">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.desc}</p>
          </div>
        ))}
      </div>

      <div className="services-btn-wrap">
        <Link href="/services-page" className="about-cta">
          See All Services <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}