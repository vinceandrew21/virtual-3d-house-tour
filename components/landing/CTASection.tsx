'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('.landing-cta-inner', {
        scrollTrigger: {
          trigger: '.landing-cta-inner',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="contact" className="landing-cta">
      <div className="landing-container">
        <div className="landing-cta-inner">
          <h2 className="landing-cta-heading">
            Ready to Elevate<br />Your Listings?
          </h2>
          <div className="landing-cta-buttons">
            <a href="mailto:hello@virtualtoursstudio.com" className="landing-btn-primary">
              Get in Touch
            </a>
            <Link href="/tour/demo" className="landing-btn-secondary">
              View Demo Tour
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
