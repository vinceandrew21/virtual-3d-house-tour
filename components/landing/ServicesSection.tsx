'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    num: '01',
    title: 'Real Estate Photography',
    desc: 'Capturing properties at their finest. Professional HDR photography that highlights architectural details, natural light, and the true spatial flow of every room.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    alt: 'Modern living room interior',
  },
  {
    num: '02',
    title: 'Photo Editing',
    desc: 'Polished to perfection. Sky replacements, virtual staging, color correction, and retouching that transform good photos into exceptional marketing assets.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
    alt: 'Bright modern kitchen',
  },
  {
    num: '03',
    title: '360° Photos',
    desc: 'Immersive single-frame experiences. High-resolution 360-degree panoramas that let viewers look in every direction from a single vantage point.',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80',
    alt: 'Luxury home with pool at dusk',
  },
  {
    num: '04',
    title: '3D Virtual Tours',
    desc: 'Walk through properties remotely. Multi-room interactive virtual tours with navigation hotspots, room-to-room transitions, and guided exploration.',
    image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&q=80',
    alt: 'Spacious modern hallway interior',
  },
];

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // Animate each split section
      const splits = gsap.utils.toArray<HTMLElement>('.landing-split');

      splits.forEach((split) => {
        const img = split.querySelector('img');
        const content = split.querySelector('.landing-split-content');
        const number = split.querySelector('.landing-split-number');
        const title = split.querySelector('.landing-split-title');
        const desc = split.querySelector('.landing-split-desc');

        // Image parallax — slow vertical pan
        if (img) {
          gsap.fromTo(img,
            { y: '-8%' },
            {
              y: '8%',
              ease: 'none',
              scrollTrigger: {
                trigger: split,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
        }

        // Image container clip-path reveal
        const imageContainer = split.querySelector('.landing-split-image');
        if (imageContainer) {
          gsap.fromTo(imageContainer,
            { clipPath: 'inset(100% 0% 0% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.2,
              ease: 'power3.inOut',
              scrollTrigger: {
                trigger: split,
                start: 'top 75%',
                toggleActions: 'play none none none',
              },
            }
          );
        }

        // Text content staggered reveal
        if (content) {
          gsap.from([number, title, desc].filter(Boolean), {
            scrollTrigger: {
              trigger: content,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            y: 50,
            opacity: 0,
            duration: 0.9,
            stagger: 0.15,
            ease: 'power2.out',
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="services">
      <div className="landing-container" style={{ paddingBottom: 40 }}>
        <div className="landing-services-label">What We Do</div>
      </div>
      {services.map((s, i) => (
        <div key={s.num} className="landing-split">
          {i % 2 === 0 ? (
            <>
              <div className="landing-split-image">
                <img src={s.image} alt={s.alt} loading="lazy" />
              </div>
              <div className="landing-split-content">
                <div className="landing-split-number">{s.num}</div>
                <h3 className="landing-split-title">{s.title}</h3>
                <p className="landing-split-desc">{s.desc}</p>
              </div>
            </>
          ) : (
            <>
              <div className="landing-split-content">
                <div className="landing-split-number">{s.num}</div>
                <h3 className="landing-split-title">{s.title}</h3>
                <p className="landing-split-desc">{s.desc}</p>
              </div>
              <div className="landing-split-image">
                <img src={s.image} alt={s.alt} loading="lazy" />
              </div>
            </>
          )}
        </div>
      ))}
    </section>
  );
}
