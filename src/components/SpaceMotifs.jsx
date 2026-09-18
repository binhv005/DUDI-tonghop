import React from 'react';

export const SpaceMotifs = () => {
  return (
    <div className="space-motifs-layer" aria-hidden="true">
      {/* 1. Backdrop Cosmic Clouds / Curvy Shapes matching the sample */}
      <div className="cosmic-backdrop-waves">
        {/* Deep purple silhouette with tech chart line */}
        <svg className="wave-svg-backdrop" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          {/* Organic Purple Flow Wave Behind Robot */}
          <path
            d="M0 280C160 210 320 230 450 310C580 390 620 540 540 680C480 780 360 850 200 890L0 900V280Z"
            fill="#3b0764"
            opacity="0.7"
          />
          {/* Mid Purple Curve */}
          <path
            d="M0 420C120 360 260 380 360 460C450 530 490 650 430 760C380 840 280 890 120 900L0 900V420Z"
            fill="#581c87"
            opacity="0.65"
          />
          {/* Tech Line Chart / City Grid Silhouette in backdrop */}
          <path
            d="M60 480L130 430L210 470L290 390L370 440L440 370"
            stroke="#c084fc"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            opacity="0.45"
          />
          <circle cx="130" cy="430" r="4.5" fill="#f472b6" opacity="0.85" />
          <circle cx="210" cy="470" r="4.5" fill="#a855f7" opacity="0.85" />
          <circle cx="290" cy="390" r="5" fill="#38bdf8" opacity="0.9" />
          <circle cx="370" cy="440" r="4.5" fill="#f472b6" opacity="0.85" />
          <circle cx="440" cy="370" r="5" fill="#ffffff" opacity="0.95" />
        </svg>

        {/* Soft Puffy Cloud Base (Bottom Left / Under Character) */}
        <div className="cosmic-clouds-base">
          <div className="cloud-puff puff-1"></div>
          <div className="cloud-puff puff-2"></div>
          <div className="cloud-puff puff-3"></div>
          <div className="cloud-puff puff-4"></div>
          <div className="cloud-puff puff-5"></div>
        </div>
      </div>

      {/* 2. Large Purple / Violet Planet (Top Right) */}
      <div className="space-motif-item motif-planet-large">
        <svg viewBox="0 0 160 160" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="76" fill="#7c3aed" />
          <path d="M80 4C121.974 4 156 38.026 156 80C156 121.974 121.974 156 80 156C68.4 156 57.5 153.4 47.7 148.8C75.2 142.1 95.8 117.4 95.8 87.8C95.8 58.2 75.2 33.5 47.7 26.8C57.5 22.2 68.4 19.6 80 19.6V4Z" fill="#581c87" />
          <circle cx="50" cy="55" r="14" fill="#4c1d95" opacity="0.8" />
          <circle cx="48" cy="53" r="12" fill="#3b0764" opacity="0.95" />
          <circle cx="108" cy="115" r="18" fill="#4c1d95" opacity="0.8" />
          <circle cx="105" cy="112" r="15" fill="#2e1065" opacity="0.95" />
          <circle cx="118" cy="45" r="10" fill="#6d28d9" opacity="0.6" />
        </svg>
      </div>

      {/* 3. Main Floating Purple Asteroid (Center Right) */}
      <div className="space-motif-item motif-asteroid-main">
        <svg viewBox="0 0 140 120" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M32 20C48 8 95 10 115 28C132 44 136 78 120 98C104 116 62 118 38 108C16 98 6 78 12 52C16 34 22 28 32 20Z"
            fill="#a78bfa"
          />
          <path
            d="M20 72C28 92 62 118 98 108C120 102 128 85 120 98C104 116 62 118 38 108C16 98 6 78 12 52C14 60 17 66 20 72Z"
            fill="#7c3aed"
          />
          <ellipse cx="52" cy="48" rx="14" ry="12" fill="#6d28d9" opacity="0.85" />
          <ellipse cx="50" cy="46" rx="11" ry="9" fill="#4c1d95" opacity="0.95" />
          <ellipse cx="88" cy="65" rx="16" ry="14" fill="#6d28d9" opacity="0.85" />
          <ellipse cx="85" cy="62" rx="13" ry="11" fill="#4c1d95" opacity="0.95" />
          <circle cx="82" cy="32" r="7" fill="#6d28d9" opacity="0.7" />
          <circle cx="36" cy="78" r="8" fill="#4c1d95" opacity="0.8" />
        </svg>
      </div>

      {/* 4. Top Left Asteroid */}
      <div className="space-motif-item motif-asteroid-topleft">
        <svg viewBox="0 0 100 85" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22 14C38 6 76 8 88 22C98 34 96 60 84 72C70 84 38 82 22 74C8 66 4 48 8 32C12 20 15 18 22 14Z"
            fill="#c4b5fd"
          />
          <path
            d="M12 48C18 64 42 82 72 74C84 70 90 58 84 72C70 84 38 82 22 74C8 66 4 48 8 32C9 38 10 43 12 48Z"
            fill="#8b5cf6"
          />
          <circle cx="38" cy="36" r="9" fill="#7c3aed" opacity="0.85" />
          <circle cx="36" cy="34" r="7" fill="#581c87" opacity="0.95" />
          <circle cx="66" cy="48" r="10" fill="#7c3aed" opacity="0.85" />
          <circle cx="64" cy="46" r="8" fill="#581c87" opacity="0.95" />
        </svg>
      </div>

      {/* 5. Bottom Left Asteroid */}
      <div className="space-motif-item motif-asteroid-bottomleft">
        <svg viewBox="0 0 70 60" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 10C28 4 54 6 62 16C68 25 66 44 58 52C48 60 26 58 16 52C6 46 3 34 6 22C8 14 11 12 16 10Z"
            fill="#d8b4fe"
          />
          <path
            d="M8 34C13 46 30 58 52 52C60 49 64 41 58 52C48 60 26 58 16 52C6 46 3 34 6 22C7 26 7 30 8 34Z"
            fill="#a855f7"
          />
          <circle cx="28" cy="26" r="6" fill="#7e22ce" opacity="0.9" />
          <circle cx="46" cy="34" r="7" fill="#7e22ce" opacity="0.9" />
        </svg>
      </div>

      {/* 6. Mini Pink / Coral Planet with Ring (matching sample) */}
      <div className="space-motif-item motif-planet-mini">
        <svg viewBox="0 0 75 75" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Planet body */}
          <circle cx="37.5" cy="37.5" r="24" fill="#f472b6" />
          <path d="M37.5 13.5C49.5 13.5 60 24 60 37.5C60 49.5 49.5 60 37.5 60C34 60 30.5 59.2 27.5 57.8C35.5 55.8 41.5 48.4 41.5 39.5C41.5 30.6 35.5 23.2 27.5 21.2C30.5 19.8 34 13.5 37.5 13.5Z" fill="#db2777" />
          <circle cx="29" cy="32" r="4.5" fill="#be185d" opacity="0.8" />
          <circle cx="44" cy="46" r="5" fill="#9d174d" opacity="0.85" />
          {/* Ring */}
          <ellipse cx="37.5" cy="37.5" rx="34" ry="10" stroke="#fbcfe8" strokeWidth="2.5" strokeOpacity="0.85" transform="rotate(-25 37.5 37.5)" />
        </svg>
      </div>

      {/* 7. Scattered Asteroid Pebbles */}
      <div className="space-motif-item motif-pebble p-1"></div>
      <div className="space-motif-item motif-pebble p-2"></div>
      <div className="space-motif-item motif-pebble p-3"></div>
      <div className="space-motif-item motif-pebble p-4"></div>
      <div className="space-motif-item motif-pebble p-5"></div>

      {/* 8. Twinkling 4-point Stars / Sparkles (White & Pink matching sample) */}
      <div className="space-motif-item motif-star s-1">
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>
      <div className="space-motif-item motif-star s-2">
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>
      <div className="space-motif-item motif-star s-3">
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>
      <div className="space-motif-item motif-star s-4">
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>
      <div className="space-motif-item motif-star s-5">
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>
      <div className="space-motif-item motif-star s-6">
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>

      {/* 9. Star Dust / Glowing Tiny Circles */}
      <div className="space-motif-item motif-dust d-1"></div>
      <div className="space-motif-item motif-dust d-2"></div>
      <div className="space-motif-item motif-dust d-3"></div>
      <div className="space-motif-item motif-dust d-4"></div>
      <div className="space-motif-item motif-dust d-5"></div>
      <div className="space-motif-item motif-dust d-6"></div>
      <div className="space-motif-item motif-dust d-7"></div>
    </div>
  );
};
