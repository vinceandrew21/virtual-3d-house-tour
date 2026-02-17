'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

function SplitHeading({ text }: { text: string }) {
  return (
    <h1 className="landing-hero-heading">
      {text.split(' ').map((word, i) => (
        <span className="word" key={i}>
          <span className="word-inner">{word}</span>
          {i < text.split(' ').length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </h1>
  );
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 3.5 });

      tl.from('.word-inner', {
        y: '110%',
        duration: 1,
        stagger: 0.04,
      })
      .from('.landing-hero-subtitle', {
        y: 24,
        opacity: 0,
        duration: 0.8,
      }, '-=0.4')
      .from('.landing-scroll-indicator', {
        opacity: 0,
        duration: 0.6,
      }, '-=0.2');
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="landing-hero">
      <SplitHeading text="Elevating Real Estate Through Visual Excellence" />
      <p className="landing-hero-subtitle">
        Professional photography, immersive 360° tours, and cutting-edge 3D experiences that showcase properties at their absolute best.
      </p>
      <div className="landing-scroll-indicator">
        <span>Scroll</span>
        <div className="landing-scroll-line" />
      </div>
    </section>
  );
}
