import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface MoviePosterCardProps {
  id: string;
  title: string;
  year: number;
  poster: string;
  slangCount: number;
  index?: number;
}

export default function MoviePosterCard({
  id,
  title,
  year,
  poster,
  slangCount,
  index = 0,
}: MoviePosterCardProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  useGSAP(
    () => {
      if (!cardRef.current) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            delay: index * 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
      mm.add('(max-width: 767px)', () => {
        gsap.set(cardRef.current, { opacity: 1, y: 0, scale: 1 });
      });
      return () => mm.revert();
    },
    { scope: cardRef, dependencies: [index] }
  );

  const handleClick = () => {
    navigate(`/slang/${id}`);
  };

  return (
    <div
      ref={cardRef}
      className="cursor-pointer group"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Poster container */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: '2/3',
          borderRadius: '8px',
          border: hovered ? '1px solid #E50914' : '1px solid #222222',
          boxShadow: hovered ? '0 0 30px #E5091480' : 'none',
          transition: 'border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <img
          src={poster}
          alt={title}
          className="w-full h-full object-cover"
          style={{
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{
            background: 'rgba(5,5,5,0.75)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <span
            className="font-medium text-[0.75rem] text-white px-3 py-1 rounded"
            style={{ backgroundColor: '#E50914' }}
          >
            {slangCount} slang{slangCount !== 1 ? 's' : ''}
          </span>
          <span
            className="font-semibold text-[0.875rem] uppercase tracking-[0.05em]"
            style={{ color: '#E50914' }}
          >
            View Slangs
          </span>
        </div>
      </div>

      {/* Title below poster */}
      <div className="mt-3">
        <p
          className="font-semibold text-[0.9375rem] text-white truncate"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {title}
        </p>
        <p
          className="font-mono text-[0.75rem] mt-0.5"
          style={{ color: '#666666' }}
        >
          {year}
        </p>
      </div>
    </div>
  );
}
