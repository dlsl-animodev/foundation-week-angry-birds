import React, { useRef, useState, ReactNode } from "react";

type SoundManagerProps = {
  children: (soundProps: {
    playHover: () => void;
    playClick: () => void;
    muted: boolean;
    toggleMute: () => void;
  }) => ReactNode;
};

export default function SoundManager({ children }: SoundManagerProps) {
  const hoverSound = useRef<HTMLAudioElement | null>(null);
  const clickSound = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  const playHover = () => {
    if (!muted && hoverSound.current) {
      hoverSound.current.currentTime = 0;
      hoverSound.current.play();
    }
  };
  const playClick = () => {
    if (!muted && clickSound.current) {
      clickSound.current.currentTime = 0;
      clickSound.current.play();
    }
  };

  const toggleMute = () => setMuted((m) => !m);

  // Avoid accessing refs during render
  // Provide sound functions and mute state to children
  return (
    <>
      {/* Short, friendly, gentle sounds */}
      <audio ref={hoverSound} src="/hover.mp3" preload="auto" />
      <audio ref={clickSound} src="/click.mp3" preload="auto" />
      {typeof children === "function"
        ? // eslint-disable-next-line react-hooks/refs
          children({ playHover, playClick, muted, toggleMute })
        : null}
    </>
  );
}

// Child-UX: Gentle, soft, never startling, mute button always visible.
