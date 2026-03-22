import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  color: string;
  left: number;
  delay: number;
  size: number;
  isSquare: boolean;
  speed: number;
}

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#fbbf24', '#34d399'];

let uid = 0;

function make(): Particle[] {
  return Array.from({ length: 40 }, () => ({
    id: uid++,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    size: 6 + Math.random() * 8,
    isSquare: Math.random() > 0.5,
    speed: 1.5 + Math.random() * 1.5,
  }));
}

interface Props {
  active: boolean;
  /** Durée d'affichage en ms (défaut 2500) */
  duration?: number;
}

export function Confetti({ active, duration = 2500 }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    setParticles(make());
    const t = setTimeout(() => setParticles([]), duration);
    return () => clearTimeout(t);
  }, [active, duration]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.speed}s`,
            borderRadius: p.isSquare ? '2px' : '50%',
          }}
        />
      ))}
    </div>
  );
}
