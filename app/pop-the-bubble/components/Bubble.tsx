import React from "react";
import { Bubble as BubbleType } from "../types";

interface BubbleProps {
  bubble: BubbleType;
  onPop: (id: string, variant: string) => void;
}

export const Bubble: React.FC<BubbleProps> = ({ bubble, onPop }) => {
  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onPop(bubble.id, bubble.variant);
  };

  // Variant styling
  const isStar = bubble.variant === "star";
  const isHeart = bubble.variant === "heart";
  const isClock = bubble.variant === "clock";
  const isRainbow = bubble.variant === "rainbow";

  // Custom wobble animation based on ID to desync bubbles
  const wobbleDelay = parseInt(bubble.id.slice(-1), 36) % 5;

  return (
    <div
      className={`absolute rounded-full cursor-none transform transition-transform duration-200 ease-out`}
      style={{
        left: `${bubble.x}%`,
        top: `${bubble.y}%`,
        width: `${bubble.size}px`,
        height: `${bubble.size}px`,
        opacity: bubble.isPopping ? 0 : 0.95,
        transform: bubble.isPopping ? "scale(2.2)" : "scale(1)",
        zIndex: isRainbow ? 30 : isStar || isHeart || isClock ? 20 : 10,
        animation: !bubble.isPopping ? `float 3s ease-in-out infinite` : "none",
        animationDelay: `-${wobbleDelay}s`,
      }}
      onMouseDown={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* The Bubble Visual */}
      <div
        className={`w-full h-full rounded-full border-2 relative shadow-[0_0_20px_rgba(255,255,255,0.4)] overflow-hidden
          ${
            isStar
              ? "border-yellow-200 bg-yellow-500/20"
              : isHeart
                ? "border-pink-200 bg-pink-500/20"
                : isClock
                  ? "border-green-200 bg-green-500/20"
                  : isRainbow
                    ? "border-white/60"
                    : "border-white/40 bg-white/10"
          }
        `}
        style={{
          background: isStar
            ? `radial-gradient(circle at 30% 30%, rgba(255, 255, 200, 0.9) 0%, rgba(255, 215, 0, 0.3) 40%, rgba(255, 255, 255, 0.1) 100%)`
            : isHeart
              ? `radial-gradient(circle at 30% 30%, rgba(255, 200, 200, 0.9) 0%, rgba(255, 105, 180, 0.3) 40%, rgba(255, 255, 255, 0.1) 100%)`
              : isClock
                ? `radial-gradient(circle at 30% 30%, rgba(200, 255, 200, 0.9) 0%, rgba(50, 205, 50, 0.3) 40%, rgba(255, 255, 255, 0.1) 100%)`
                : isRainbow
                  ? `conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #8000ff, #ff0000)`
                  : `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 0%, ${bubble.color} 30%, rgba(255, 255, 255, 0.05) 100%)`,
          boxShadow: isRainbow
            ? `0 0 30px rgba(255,255,255,0.8), inset 0 0 20px rgba(255,255,255,0.5)`
            : `inset 0 0 20px rgba(255, 255, 255, 0.4), 0 4px 10px rgba(0,0,0,0.1)`,
        }}
      >
        {/* Rainbow inner spin effect */}
        {isRainbow && (
          <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
        )}

        {/* Inner Icon for Special Bubbles */}
        {isStar && (
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <span className="text-5xl filter drop-shadow-lg select-none">
              ⭐
            </span>
          </div>
        )}
        {isHeart && (
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <span className="text-5xl filter drop-shadow-lg select-none">
              💖
            </span>
          </div>
        )}
        {isClock && (
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <span className="text-5xl filter drop-shadow-lg select-none">
              ⏰
            </span>
          </div>
        )}
        {isRainbow && (
          <div
            className="absolute inset-0 flex items-center justify-center animate-spin"
            style={{ animationDuration: "3s" }}
          >
            <span className="text-5xl filter drop-shadow-lg select-none">
              🌈
            </span>
          </div>
        )}

        {/* Highlight (Reflection) */}
        <div className="absolute top-[15%] left-[15%] w-[20%] h-[12%] bg-white rounded-full blur-[2px] opacity-70 rotate-[-45deg]"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[10%] h-[10%] bg-white rounded-full blur-[3px] opacity-30"></div>
      </div>
    </div>
  );
};
