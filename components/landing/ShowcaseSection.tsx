'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    title: 'Waterfront Residence',
    tag: 'Photography & Virtual Tour',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=80',
    tall: true,
  },
  {
    title: 'Urban Penthouse',
    tag: '360° Panorama',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&q=80',
    tall: false,
  },
  {
    title: 'Heritage Renovation',
    tag: 'Photography & Editing',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80',
    tall: false,
  },
  {
    title: 'Coastal Villa',
    tag: '3D Virtual Tour',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=900&q=80',
    tall: true,
  },
  {
    title: 'Modern Apartment',
    tag: 'Photography',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80',
    tall: false,
  },
  {
    title: 'Luxury Estate',
    tag: 'Full Service Package',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=900&q=80',
    tall: false,
  },
];

export default function ShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('.landing-showcase-item');

      items.forEach((item, i) => {
        const img = item.querySelector('img');

        // Staggered scale-up reveal with clip-path
        gsap.fromTo(item,
          {
            clipPath: 'inset(15% 15% 15% 15%)',
            scale: 0.9,
          },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            scale: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              toggleActions: 'play reverse play reverse',
            },
            delay: (i % 2) * 0.15, // Stagger left vs right column
          }
        );

        // Inner image parallax
        if (img) {
          gsap.fromTo(img,
            { y: '-6%', scale: 1.1 },
            {
              y: '6%',
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: item,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="landing-showcase">
      <div className="landing-container">
        <div className="landing-showcase-label">Selected Work</div>
        <div className="landing-showcase-grid">
          {projects.map((p) => (
            <div
              key={p.title}
              className={`landing-showcase-item ${p.tall ? 'landing-showcase-item--tall' : ''}`}
            >
              <div className="landing-showcase-item-inner">
                <img src={p.image} alt={p.title} loading="lazy" />
                <div className="landing-showcase-item-overlay">
                  <div className="landing-showcase-item-title">{p.title}</div>
                  <div className="landing-showcase-item-tag">{p.tag}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
