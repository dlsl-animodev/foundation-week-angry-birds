import React, { useState } from "react";

type GameCardProps = {
  icon: React.ReactNode;
  onSelect: () => void;
  bgColor: string;
  visualCue: React.ReactNode;
  ariaLabel?: string;
  highContrast?: boolean;
  games?: Array<{
    name: string;
    icon: React.ReactNode;
    bgColor: string;
    visualCue: React.ReactNode;
    ariaLabel?: string;
    highContrast?: boolean;
    onSelect: () => void;
  }>;
  // Allow passing other props, but avoid any
  [key: string]: unknown;
};

export default function GameCard({
  icon,
  onSelect,
  bgColor,
  visualCue,
  ariaLabel = "Select game",
  highContrast = false,
  ...rest
}: GameCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  const cardStyle: React.CSSProperties = {
    background: bgColor,
    borderRadius: "2.5rem",
    boxShadow: isPressed
      ? "0 0 32px 8px #fff6, 0 2px 8px #0002"
      : "0 0 32px 8px #fff8, 0 2px 8px #0002",
    transition:
      "transform 0.25s cubic-bezier(.68,-0.55,.27,1.55), box-shadow 0.2s",
    transform: isPressed ? "scale(0.96)" : "scale(1)",
    cursor: "pointer",
    width: "340px",
    height: "420px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    margin: "0 1vw",
    outline: highContrast ? "4px solid #222" : "none",
    userSelect: "none",
    position: "relative",
    color: highContrast ? "#222" : undefined,
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <div
      style={cardStyle}
      tabIndex={0}
      onClick={onSelect}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      aria-label={ariaLabel}
      {...rest}
    >
      <div
        style={{
          fontSize: "7rem",
          marginBottom: "1rem",
          color: highContrast ? "#222" : undefined,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: "2.5rem",
          color: highContrast ? "#222" : "#fff",
          filter: "drop-shadow(0 0 8px #fff)",
        }}
      >
        {visualCue}
      </div>
    </div>
  );
}
