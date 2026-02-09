import React, { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-50 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Outer Ring */}
      <div
        className={`rounded-full border-4 border-white shadow-[0_0_15px_rgba(255,255,255,0.6)] flex items-center justify-center transition-all duration-150
          ${isClicking ? "w-16 h-16 opacity-80" : "w-20 h-20 opacity-100"}
        `}
      >
        {/* Crosshair Center */}
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>

        {/* Decorative "Scope" Lines */}
        <div className="absolute w-full h-0.5 bg-white/50"></div>
        <div className="absolute h-full w-0.5 bg-white/50"></div>
      </div>
    </div>
  );
}
