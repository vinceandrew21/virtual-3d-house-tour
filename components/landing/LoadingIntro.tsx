'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const brandName = 'Virtual Tours';

export default function LoadingIntro() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!overlayRef.current || !counterRef.current) return;

    const counter = { value: 0 };
    const counterEl = counterRef.current;
    const overlay = overlayRef.current;

    // Disable scroll during loading
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        setDone(true);
      },
    });

    // Phase 1: Brand name letters stagger in from below
    tl.from('.loading-intro-letter', {
      y: '120%',
      rotateX: 90,
      opacity: 0,
      duration: 0.8,
      stagger: 0.03,
      ease: 'power3.out',
    });

    // Phase 2: Counter + line fade in and count up
    tl.from('.loading-intro-bottom', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: 'power2.out',
    }, '-=0.2');

    tl.to(counter, {
      value: 100,
      duration: 1.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        counterEl.textContent = `${Math.round(counter.value)}`;
      },
    }, '-=0.3');

    // Phase 3: Brief hold
    tl.to({}, { duration: 0.2 });

    // Phase 4: Everything animates out — letters scatter up, content fades
    tl.to('.loading-intro-letter', {
      y: '-120%',
      rotateX: -90,
      opacity: 0,
      duration: 0.5,
      stagger: 0.015,
      ease: 'power3.in',
    });

    tl.to('.loading-intro-bottom', {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in',
    }, '-=0.4');

    // Phase 5: Overlay slides up
    tl.to(overlay, {
      yPercent: -100,
      duration: 0.9,
      ease: 'power3.inOut',
    }, '-=0.1');

    return () => {
      document.body.style.overflow = '';
      tl.kill();
    };
  }, []);

  if (done) return null;

  return (
    <div ref={overlayRef} className="loading-intro">
      <div className="loading-intro-content">
        {/* Brand name — letter by letter */}
        <div className="loading-intro-brand" aria-label={brandName}>
          {brandName.split('').map((char, i) => (
            <span
              key={i}
              className="loading-intro-letter-wrap"
            >
              <span className="loading-intro-letter">
                {char === ' ' ? '\u00A0' : char}
              </span>
            </span>
          ))}
        </div>

        {/* Counter + progress line */}
        <div className="loading-intro-bottom">
          <div className="loading-intro-counter">
            <span ref={counterRef}>0</span>
            <span className="loading-intro-percent">%</span>
          </div>
          <div className="loading-intro-line">
            <div className="loading-intro-line-fill" />
          </div>
        </div>
      </div>
    </div>
  );
}
