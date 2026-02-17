'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fade in after loading intro finishes
  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 3.7 }
    );
  }, []);

  return (
    <header
      ref={headerRef}
      className={`landing-header ${scrolled ? 'landing-header--scrolled' : ''}`}
      style={{ opacity: 0 }}
    >
      <Link href="/" className="landing-logo">
        Virtual Tours Studio
      </Link>
      <nav className="landing-nav">
        <a href="#services" className="landing-nav-link">Services</a>
        <a href="#about" className="landing-nav-link">About</a>
        <a href="#contact" className="landing-nav-link">Contact</a>
        <Link href="/tour/demo" className="landing-nav-link landing-nav-link--cta">
          View Demo
        </Link>
      </nav>
    </header>
  );
}
