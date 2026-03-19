import { useEffect, useState } from "react";

export default function LoadingScreen({ onLoadingComplete }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const duration = 10000; // 10 seconds
    const interval = 50;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    // Start fade out at 9.5 seconds
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 9500);

    // Complete loading at 10 seconds
    const completeTimer = setTimeout(() => {
      onLoadingComplete();
    }, 10000);

    return () => {
      clearInterval(timer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onLoadingComplete]);

  return (
    <div className={`loading-screen ${fading ? "fading" : ""}`}>
      <div className="loading-content">
        {/* Floating pencils */}
        <div className="pencil pencil-1">
          <svg viewBox="0 0 24 80" width="24" height="80">
            <polygon points="12,0 18,10 6,10" fill="#FFD93D" />
            <rect x="6" y="10" width="12" height="50" fill="#FFD93D" />
            <rect x="6" y="10" width="12" height="8" fill="#7B5EA7" />
            <polygon points="6,60 18,60 12,75" fill="#FFC09F" />
            <polygon points="10,70 14,70 12,77" fill="#2D2D2D" />
          </svg>
        </div>

        <div className="pencil pencil-2">
          <svg viewBox="0 0 24 80" width="20" height="66">
            <polygon points="12,0 18,10 6,10" fill="#FF6B6B" />
            <rect x="6" y="10" width="12" height="50" fill="#FF6B6B" />
            <rect x="6" y="10" width="12" height="8" fill="#4ECDC4" />
            <polygon points="6,60 18,60 12,75" fill="#FFC09F" />
            <polygon points="10,70 14,70 12,77" fill="#2D2D2D" />
          </svg>
        </div>

        <div className="pencil pencil-3">
          <svg viewBox="0 0 24 80" width="18" height="60">
            <polygon points="12,0 18,10 6,10" fill="#6BCB77" />
            <rect x="6" y="10" width="12" height="50" fill="#6BCB77" />
            <rect x="6" y="10" width="12" height="8" fill="#FF6B6B" />
            <polygon points="6,60 18,60 12,75" fill="#FFC09F" />
            <polygon points="10,70 14,70 12,77" fill="#2D2D2D" />
          </svg>
        </div>

        {/* Cute notebook */}
        <div className="notebook">
          <svg viewBox="0 0 100 120" width="100" height="120">
            {/* Book cover */}
            <rect x="10" y="10" width="80" height="100" rx="4" fill="#FF9EAA" />
            {/* Spiral binding */}
            {[20, 35, 50, 65, 80, 95].map((y) => (
              <g key={y}>
                <circle cx="10" cy={y} r="4" fill="#666" />
                <circle cx="10" cy={y} r="2" fill="#999" />
              </g>
            ))}
            {/* Pages */}
            <rect x="15" y="15" width="70" height="90" rx="2" fill="#FFFDF7" />
            {/* Lines on page */}
            <line x1="20" y1="30" x2="80" y2="30" stroke="#E8E0D5" strokeWidth="1" />
            <line x1="20" y1="42" x2="80" y2="42" stroke="#E8E0D5" strokeWidth="1" />
            <line x1="20" y1="54" x2="80" y2="54" stroke="#E8E0D5" strokeWidth="1" />
            <line x1="20" y1="66" x2="80" y2="66" stroke="#E8E0D5" strokeWidth="1" />
            <line x1="20" y1="78" x2="80" y2="78" stroke="#E8E0D5" strokeWidth="1" />
            {/* Cute heart drawing */}
            <path d="M50 45 C50 38 40 35 40 42 C40 50 50 58 50 58 C50 58 60 50 60 42 C60 35 50 38 50 45" fill="#FF6B6B" className="heart-beat" />
            {/* Star */}
            <polygon points="70,25 72,30 77,30 73,34 75,39 70,36 65,39 67,34 63,30 68,30" fill="#FFD93D" className="star-twinkle" />
          </svg>
        </div>

        {/* Floating stars */}
        <div className="star star-1">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <polygon points="12,2 14,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 10,9" fill="#FFD93D" />
          </svg>
        </div>
        <div className="star star-2">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <polygon points="12,2 14,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 10,9" fill="#FF9EAA" />
          </svg>
        </div>
        <div className="star star-3">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <polygon points="12,2 14,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 10,9" fill="#6BCB77" />
          </svg>
        </div>

        {/* Cute eraser */}
        <div className="eraser">
          <svg viewBox="0 0 50 30" width="50" height="30">
            <rect x="0" y="0" width="50" height="30" rx="4" fill="#FFC4D6" />
            <rect x="0" y="0" width="15" height="30" rx="4" fill="#4ECDC4" />
            <text x="30" y="20" fontSize="8" fill="#FF6B9D" fontWeight="bold">UwU</text>
          </svg>
        </div>

        {/* Drawing doodles */}
        <div className="doodle doodle-1">
          <svg viewBox="0 0 40 40" width="40" height="40">
            <circle cx="20" cy="20" r="15" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeDasharray="5,3" />
          </svg>
        </div>
        <div className="doodle doodle-2">
          <svg viewBox="0 0 40 40" width="30" height="30">
            <path d="M5 20 Q20 5 35 20 Q20 35 5 20" fill="none" stroke="#6BCB77" strokeWidth="2" />
          </svg>
        </div>

        {/* Main title */}
        <div className="loading-title">
          <span className="letter l1">P</span>
          <span className="letter l2">o</span>
          <span className="letter l3">m</span>
          <span className="letter l4">o</span>
          <span className="letter l5">d</span>
          <span className="letter l6">o</span>
          <span className="letter l7">r</span>
          <span className="letter l8">o</span>
        </div>

        {/* Progress bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-text">{Math.round(progress)}%</div>
        </div>

        {/* Bouncing dots */}
        <div className="bouncing-dots">
          <div className="bounce-dot bd1" />
          <div className="bounce-dot bd2" />
          <div className="bounce-dot bd3" />
        </div>

        <div className="loading-subtitle">Getting ready to focus...</div>
      </div>
    </div>
  );
}
