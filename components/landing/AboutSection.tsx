'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('.landing-about-content', {
        scrollTrigger: {
          trigger: '.landing-about-content',
          start: 'top 80%',
          toggleActions: 'play none play reverse',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="landing-about">
      <div className="landing-container">
        <div className="landing-about-content">
          <div className="landing-about-label">Our Approach</div>
          <h2 className="landing-about-heading">
            We believe every property has a story worth telling — and the right visuals make all the difference.
          </h2>
          <p className="landing-about-text">
            Our studio combines technical precision with creative vision. From the initial photography to the final virtual tour, every step is crafted to present properties in their best light — literally and figuratively.
          </p>
          <p className="landing-about-text">
            We work with real estate agents, property developers, and architects who understand that exceptional visual marketing isn&apos;t an expense — it&apos;s an investment that drives faster sales and higher valuations.
          </p>
        </div>
      </div>
    </section>
  );
}
