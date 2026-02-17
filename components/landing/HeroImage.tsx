'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HeroImage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!containerRef.current || !imageRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // Image starts scaled up and pans down with parallax as you scroll
      gsap.fromTo(imageRef.current,
        { scale: 1.15, y: '-5%' },
        {
          scale: 1,
          y: '5%',
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      // Container reveals with a clip-path from center outward
      gsap.fromTo(containerRef.current,
        { clipPath: 'inset(8% 4% 8% 4%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 90%',
            end: 'top 40%',
            scrub: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="landing-image-full">
      <img
        ref={imageRef}
        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
        alt="Modern luxury home exterior"
        loading="eager"
      />
    </div>
  );
}
