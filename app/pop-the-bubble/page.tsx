"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { OceanBackground } from "./components/OceanBackground";
import { Bubble as BubbleComponent } from "./components/Bubble";
import CustomCursor from "./components/CustomCursor";
import { Bubble, BubbleVariant } from "./types";
import {
  playPopSound,
  playStartSound,
  playLevelUpSound,
  playTimeBonusSound,
  playRainbowSound,
} from "./utils/audio";

const COLORS = [
  "rgba(255, 99, 132, 0.5)",
  "rgba(54, 162, 235, 0.5)",
  "rgba(255, 206, 86, 0.5)",
  "rgba(75, 192, 192, 0.5)",
  "rgba(153, 102, 255, 0.5)",
  "rgba(255, 159, 64, 0.5)",
];

const MIN_SIZE = 90;
const MAX_SIZE = 160;
const SPAWN_RATE = 45;
const GAME_DURATION = 60; // Seconds

export default function App() {
  const [gameState, setGameState] = useState<"START" | "PLAYING" | "FINISHED">(
    "START",
  );
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [showCelebration, setShowCelebration] = useState(false);
  const [addedTime, setAddedTime] = useState(false); // For visual feedback

  const frameRef = useRef<number>(0);
  const spawnTimer = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const createBubble = (): Bubble => {
    const size =
      Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE + 1)) + MIN_SIZE;

    // Spawn Probabilities
    const rand = Math.random();
    let variant: BubbleVariant = "normal";

    // 5% Rainbow, 10% Clock, 15% Star, 15% Heart, 55% Normal
    if (rand > 0.95) variant = "rainbow";
    else if (rand > 0.85) variant = "clock";
    else if (rand > 0.7) variant = "star";
    else if (rand > 0.55) variant = "heart";

    // Special bubbles move slightly differently
    const speed =
      variant !== "normal"
        ? Math.random() * 0.08 + 0.04
        : Math.random() * 0.15 + 0.05;

    return {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * 80 + 10,
      y: 110,
      size,
      speed,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      isPopping: false,
      variant,
    };
  };

  const handleStart = () => {
    playStartSound();
    setGameState("PLAYING");
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setBubbles([]);
  };

  // Timer Effect
  useEffect(() => {
    if (gameState === "PLAYING") {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState("FINISHED");
            playLevelUpSound(); // End game sound
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const popBubbleLogic = (
    id: string,
    variant: string,
    currentBubbles: Bubble[],
  ) => {
    // Return updated bubbles
    return currentBubbles.map((b) =>
      b.id === id ? { ...b, isPopping: true } : b,
    );
  };

  const handlePop = useCallback((id: string, variant: string) => {
    // Determine visuals and logic based on variant
    if (variant === "rainbow") {
      playRainbowSound();
      // Pop ALL bubbles
      setBubbles((prev) => {
        const allCount = prev.filter((b) => !b.isPopping).length;
        setScore((s) => s + allCount * 2); // 2 points per bubble in rainbow blast
        return prev.map((b) => ({ ...b, isPopping: true }));
      });

      // Clear all after animation
      setTimeout(() => {
        setBubbles([]);
      }, 300);
      return;
    }

    if (variant === "clock") {
      playTimeBonusSound();
      setTimeLeft((t) => Math.min(t + 5, 99)); // Add 5s, cap at 99
      setAddedTime(true);
      setTimeout(() => setAddedTime(false), 1000);
    } else {
      playPopSound();
    }

    setBubbles((prev) => {
      const target = prev.find((b) => b.id === id);
      if (!target || target.isPopping) return prev; // Prevent double pop

      const points =
        variant === "star"
          ? 5
          : variant === "heart"
            ? 3
            : variant === "clock"
              ? 2
              : 1;

      setScore((s) => {
        const newScore = s + points;
        if (Math.floor(newScore / 20) > Math.floor(s / 20)) {
          triggerCelebration();
        }
        return newScore;
      });

      return popBubbleLogic(id, variant, prev);
    });

    setTimeout(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== id));
    }, 200);
  }, []);

  const triggerCelebration = () => {
    playLevelUpSound();
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  // Animation Loop
  useEffect(() => {
    if (gameState !== "PLAYING") {
      cancelAnimationFrame(frameRef.current);
      return;
    }

    const loop = () => {
      setBubbles((currentBubbles) => {
        const movedBubbles = currentBubbles
          .map((b) => ({
            ...b,
            y: b.isPopping ? b.y : b.y - b.speed,
          }))
          .filter((b) => b.y > -30);

        spawnTimer.current++;
        const currentSpawnRate = Math.max(
          25,
          SPAWN_RATE - Math.floor(score / 10),
        );

        if (spawnTimer.current > currentSpawnRate) {
          spawnTimer.current = 0;
          if (movedBubbles.length < 15) {
            return [...movedBubbles, createBubble()];
          }
        }

        return movedBubbles;
      });

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState, score]);

  return (
    <>
      <style>
        {`
                body {
                    cursor: none;
                    overflow: hidden;
                    user-select: none;
                    background: black;
                }
                @keyframes swim {
                    0% { transform: translateX(100vw); }
                    100% { transform: translateX(-20vw); }
                }
                @keyframes sway {
                    0%, 100% { transform: rotate(-5deg); }
                    50% { transform: rotate(5deg); }
                }
                .fish-swim {
                    animation: swim 15s linear infinite;
                }
                .seaweed-sway {
                    transform-origin: bottom center;
                    animation: sway 3s ease-in-out infinite;
                }
            `}
      </style>

      <div className="relative w-screen h-screen overflow-hidden select-none font-sans cursor-none">
        <CustomCursor />
        <OceanBackground />

        {/* HUD */}
        {gameState === "PLAYING" && (
          <>
            <div className="absolute top-4 left-4 z-20 flex gap-4">
              <div className="bg-white/40 backdrop-blur-md rounded-full px-6 py-2 border-4 border-white shadow-xl flex items-center gap-3">
                <span className="text-4xl">⭐</span>
                <span
                  className="text-4xl font-black text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] stroke-black"
                  style={{ WebkitTextStroke: "2px #B45309" }}
                >
                  {score}
                </span>
              </div>
            </div>

            <div className="absolute top-4 right-4 z-20">
              <div
                className={`bg-white/40 backdrop-blur-md rounded-full px-6 py-2 border-4 border-white shadow-xl flex items-center gap-3 transition-transform ${addedTime ? "scale-125 bg-green-200/60" : ""}`}
              >
                <span className="text-4xl">⏰</span>
                <span
                  className={`text-4xl font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] ${timeLeft < 10 ? "text-red-500" : "text-white"}`}
                  style={{ WebkitTextStroke: "2px #059669" }}
                >
                  {timeLeft}
                </span>
              </div>
            </div>
          </>
        )}

        {/* In-Game Messages */}
        {showCelebration && (
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none animate-bounce">
            <div
              className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-400 drop-shadow-2xl filter"
              style={{ WebkitTextStroke: "2px white" }}
            >
              AMAZING!
            </div>
          </div>
        )}

        {/* Game Area */}
        <div className="relative w-full h-full z-10 touch-none">
          {bubbles.map((bubble) => (
            <BubbleComponent
              key={bubble.id}
              bubble={bubble}
              onPop={handlePop}
            />
          ))}
        </div>

        {/* Start Screen */}
        {gameState === "START" && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-blue-900/70 backdrop-blur-sm">
            <div className="bg-white p-10 rounded-[3rem] shadow-[0_0_80px_rgba(255,255,255,0.6)] max-w-2xl w-full text-center border-8 border-cyan-400 transform transition-transform hover:scale-105">
              <h1 className="text-7xl font-black text-cyan-500 mb-6 drop-shadow-md tracking-tight">
                Ocean Pop
              </h1>
              <p className="text-2xl text-gray-500 mb-8 font-bold">
                Pop as many bubbles as you can in 60 seconds!
              </p>

              <div className="flex justify-center gap-6 mb-8">
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-2">⭐</div>
                  <span className="text-sm font-bold text-gray-400">
                    Points
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-2">⏰</div>
                  <span className="text-sm font-bold text-gray-400">
                    +5 Sec
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-2">🌈</div>
                  <span className="text-sm font-bold text-gray-400">
                    Pop All!
                  </span>
                </div>
              </div>

              <button
                onClick={handleStart}
                className="group relative inline-flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-green-500 rounded-full blur opacity-40 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative text-5xl font-black text-white bg-gradient-to-r from-green-400 to-emerald-600 px-16 py-6 rounded-full shadow-2xl border-4 border-white active:scale-95 transition-transform">
                  PLAY ▶
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Game Over / Win Screen */}
        {gameState === "FINISHED" && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="bg-white p-12 rounded-[3rem] border-8 border-yellow-400 text-center max-w-3xl w-full shadow-2xl animate-bounce-in">
              <div className="text-8xl mb-4">🏆</div>
              <h2 className="text-6xl font-black text-yellow-500 mb-4 drop-shadow-sm">
                TIME'S UP!
              </h2>
              <div className="text-8xl font-black text-blue-600 mb-8 drop-shadow-md">
                {score} <span className="text-4xl text-gray-400">PTS</span>
              </div>

              <p className="text-2xl text-gray-500 font-bold mb-10">
                {score > 100
                  ? "You are a Bubble Master!"
                  : score > 50
                    ? "Super Popping!"
                    : "Great Try!"}
              </p>

              <button
                onClick={handleStart}
                className="text-4xl font-black text-white bg-gradient-to-r from-blue-400 to-indigo-600 px-14 py-6 rounded-full shadow-xl border-4 border-white hover:scale-110 transition-transform"
              >
                PLAY AGAIN ↺
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
