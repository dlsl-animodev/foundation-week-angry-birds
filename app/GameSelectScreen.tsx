"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import GameCard from "./GameCard";
import Icon from "./Icon";
import SoundManager from "./SoundManager";

export default function GameSelectScreen() {
  const router = useRouter();
  const handleSelect = (game: "slingshot" | "pop-the-bubble") => {
    if (game === "slingshot") {
      router.push("/angry-birds");
    } else if (game === "pop-the-bubble") {
      router.push("/pop-the-bubble");
    }
  };

  useEffect(() => {
    const cursor = document.createElement("style");
    cursor.innerHTML = `
      body, * { cursor: url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'48\'><circle cx=\'24\' cy=\'24\' r=\'20\' fill=\'%23fffde4\' stroke=\'%23ffb6b9\' stroke-width=\'4\'/></svg>') 24 24, pointer !important; }
    `;
    document.head.appendChild(cursor);
    return () => {
      document.head.removeChild(cursor);
    };
  }, []);

  // Child-UX: Full-screen, centered, bright gradient, no text, no scroll, safe margins, playful colors
  return (
    <SoundManager>
      {({
        playHover,
        playClick,
        muted,
        toggleMute,
      }: {
        playHover: () => void;
        playClick: () => void;
        muted: boolean;
        toggleMute: () => void;
      }) => (
        <div
          style={{
            minHeight: "100vh",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Mute button: always visible, top right, large, friendly */}
          <button
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            style={{
              position: "absolute",
              top: "2.5vw",
              right: "2.5vw",
              zIndex: 10,
              background: "#fffde4",
              border: "none",
              borderRadius: "50%",
              width: "64px",
              height: "64px",
              boxShadow: "0 2px 12px #ffb6b9",
              fontSize: "2.2rem",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
          >
            {muted ? "🔇" : "🔊"}
          </button>

          {/* Game cards: centered, spaced, oversized, safe margins */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: "6vw",
              width: "100%",
              maxWidth: "900px",
              margin: "auto",
              padding: "2vw",
            }}
            role="group"
            aria-label="Game selection"
          >
            {/* Pop the Bubble game card */}
            <GameCard
              icon={<Icon type="pop-the-bubble" size={112} />}
              bgColor="#a8edea"
              visualCue="✨"
              onSelect={() => {
                playClick();
                handleSelect("pop-the-bubble");
              }}
              onMouseEnter={playHover}
              ariaLabel="Pop the Bubble game"
              highContrast
            />
            {/* Slingshot game card */}
            <GameCard
              icon={<Icon type="slingshot" size={112} />}
              bgColor="#fed6e3"
              visualCue="⭐"
              onSelect={() => {
                playClick();
                handleSelect("slingshot");
              }}
              onMouseEnter={playHover}
              ariaLabel="Slingshot game"
              highContrast
            />
          </div>
        </div>
      )}
    </SoundManager>
  );
}
