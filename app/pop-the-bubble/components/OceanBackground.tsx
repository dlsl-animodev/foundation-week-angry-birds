import React from "react";

// Decorative SVG Seaweed
const Seaweed: React.FC<{
  delay: string;
  left: string;
  scale: number;
  color: string;
}> = ({ delay, left, scale, color }) => (
  <svg
    viewBox="0 0 100 200"
    className="absolute bottom-0 seaweed-sway opacity-80 pointer-events-none"
    style={{
      left,
      height: `${200 * scale}px`,
      width: `${100 * scale}px`,
      animationDelay: delay,
      fill: color,
      zIndex: 5,
    }}
  >
    <path
      d="M50,200 Q20,150 50,100 T50,0"
      strokeWidth="20"
      strokeLinecap="round"
      fill="none"
      stroke={color}
    />
  </svg>
);

// New Varied Fish Components
const FishBody: React.FC<{ type: number; color: string }> = ({
  type,
  color,
}) => {
  if (type === 1) {
    // Round puffer-ish fish
    return (
      <svg width="60" height="40" viewBox="0 0 60 40">
        <path
          d="M45,20 Q35,0 15,10 L0,20 L15,30 Q35,40 45,20 Z M45,20 L60,10 L60,30 Z"
          fill={color}
        />
        <circle cx="35" cy="15" r="3" fill="white" />
        <circle cx="36" cy="15" r="1.5" fill="black" />
      </svg>
    );
  } else if (type === 2) {
    // Long fast fish
    return (
      <svg width="100" height="40" viewBox="0 0 100 40">
        <path
          d="M80,20 Q70,0 20,10 L0,20 L20,30 Q70,40 80,20 Z M80,20 L100,5 L100,35 Z"
          fill={color}
        />
        <circle cx="70" cy="15" r="3" fill="white" />
        <circle cx="71" cy="15" r="1.5" fill="black" />
      </svg>
    );
  } else {
    // Classic fish
    return (
      <svg width="70" height="50" viewBox="0 0 70 50">
        <ellipse cx="35" cy="25" rx="25" ry="15" fill={color} />
        <path d="M10,25 L0,10 L0,40 Z" fill={color} />
        <circle cx="50" cy="20" r="3" fill="white" />
        <circle cx="51" cy="20" r="1.5" fill="black" />
      </svg>
    );
  }
};

const SwimmingFish: React.FC<{
  top: string;
  duration: string;
  delay: string;
  type: number;
  color: string;
  direction?: "left" | "right";
}> = ({ top, duration, delay, type, color, direction = "left" }) => (
  <div
    className="fish-swim absolute pointer-events-none opacity-80"
    style={{
      top,
      animationDuration: duration,
      animationDelay: delay,
      zIndex: 2,
    }}
  >
    <FishBody type={type} color={color} />
  </div>
);

const Submarine: React.FC = () => (
  <div
    className="absolute pointer-events-none opacity-90"
    style={{
      top: "20%",
      animation: "swim 40s linear infinite",
      zIndex: 1,
    }}
  >
    <svg width="150" height="80" viewBox="0 0 150 80">
      <path
        d="M30,30 Q30,10 70,10 L110,10 Q140,10 140,40 Q140,70 110,70 L40,70 Q30,70 30,50 L10,60 L10,20 Z"
        fill="#FBBF24"
        stroke="#D97706"
        strokeWidth="2"
      />
      <circle
        cx="80"
        cy="40"
        r="10"
        fill="#93C5FD"
        stroke="#60A5FA"
        strokeWidth="2"
      />
      <circle
        cx="110"
        cy="40"
        r="10"
        fill="#93C5FD"
        stroke="#60A5FA"
        strokeWidth="2"
      />
      <rect x="70" y="0" width="10" height="10" fill="#D97706" />
      <rect x="65" y="-10" width="40" height="10" rx="5" fill="#D97706" />
      {/* Propeller */}
      <path
        d="M10,40 L0,20 L0,60 Z"
        fill="#9CA3AF"
        className="origin-center animate-spin"
        style={{ transformBox: "fill-box" }}
      />
    </svg>
  </div>
);

export const OceanBackground: React.FC = () => {
  const newLocal =
    "absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-200 via-blue-500 to-indigo-900";
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Gradient Water - Deeper Look */}
      <div className={newLocal}></div>

      {/* Bubbles in background */}
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] mask-[linear-gradient(to_bottom,transparent,black)]"></div>

      {/* Sun rays effect */}
      <div className="absolute top-0 left-0 right-0 h-3/4 bg-gradient-to-b from-white/10 to-transparent transform -skew-y-6 origin-top-left"></div>
      <div className="absolute top-0 left-1/4 right-0 h-3/4 bg-gradient-to-b from-white/10 to-transparent transform skew-y-6 origin-top-right"></div>

      {/* Creatures */}
      <div className="absolute inset-0 overflow-hidden">
        <Submarine />

        <SwimmingFish
          top="15%"
          duration="25s"
          delay="0s"
          type={1}
          color="#F87171"
        />
        <SwimmingFish
          top="35%"
          duration="18s"
          delay="5s"
          type={2}
          color="#FCD34D"
        />
        <SwimmingFish
          top="55%"
          duration="30s"
          delay="2s"
          type={3}
          color="#A78BFA"
        />
        <SwimmingFish
          top="75%"
          duration="22s"
          delay="8s"
          type={1}
          color="#34D399"
        />
        <SwimmingFish
          top="45%"
          duration="28s"
          delay="12s"
          type={2}
          color="#FB923C"
        />
        <SwimmingFish
          top="85%"
          duration="35s"
          delay="15s"
          type={3}
          color="#60A5FA"
        />
      </div>

      {/* Sand / Seabed */}
      <div
        className="absolute bottom-0 w-full h-32 bg-[#E2B36D]"
        style={{
          clipPath:
            "polygon(0% 100%, 0% 30%, 20% 40%, 40% 20%, 60% 35%, 80% 25%, 100% 40%, 100% 100%)",
          background: "linear-gradient(180deg, #FDE68A 0%, #D97706 100%)",
        }}
      ></div>

      {/* Decor */}
      <div className="absolute bottom-5 left-10 text-4xl opacity-80">🦀</div>
      <div className="absolute bottom-8 right-20 text-4xl opacity-80">🐚</div>
      <div className="absolute bottom-4 left-1/4 text-4xl opacity-60">⭐</div>

      {/* Seaweed Layers */}
      <Seaweed left="2%" delay="0s" scale={1.2} color="#059669" />
      <Seaweed left="8%" delay="1.5s" scale={0.9} color="#10B981" />
      <Seaweed left="15%" delay="0.5s" scale={1.4} color="#065F46" />

      <Seaweed left="82%" delay="2s" scale={1.1} color="#059669" />
      <Seaweed left="90%" delay="1s" scale={1.3} color="#34D399" />
      <Seaweed left="95%" delay="0.2s" scale={0.8} color="#064E3B" />
    </div>
  );
};
