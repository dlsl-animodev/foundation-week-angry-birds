/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

/**
 * AUDIO ENGINE
 * Uses Web Audio API to generate pleasant, non-startling sounds
 * without requiring external file assets.
 */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playSound = (type) => {
  if (audioCtx.state === "suspended") audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  switch (type) {
    case "grab":
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(400, now + 0.1);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    case "stretch":
      // A subtle rubber-band sound
      osc.type = "triangle";
      osc.frequency.setValueAtTime(150, now);
      gainNode.gain.setValueAtTime(0.05, now); // Very quiet
      gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case "launch":
      osc.type = "triangle";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    case "bounce":
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    case "pop":
      osc.type = "square";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case "win":
      // Simple major chord arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C major
      notes.forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = "sine";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.2, now + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.5);
        o.start(now + i * 0.1);
        o.stop(now + i * 0.1 + 0.5);
      });
      break;
    default:
      break;
  }
};

/**
 * UTILITIES
 */
// Simple vector math
const getDistance = (p1, p2) =>
  Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * GAME CONFIGURATION
 */
const CONFIG = {
  gravity: 0.25,
  friction: 0.99,
  bounceDamping: 0.7,
  dragMaxDistance: 200,
  powerMultiplier: 0.2,
  groundHeight: 100, // px from bottom
  ballRadius: 25,
};

const LEVELS = [
  { targets: [{ x: 600, y: 300, r: 30 }] }, // Easy: Just one straight shot
  {
    targets: [
      { x: 600, y: 100, r: 30 },
      { x: 600, y: 400, r: 30 },
    ],
  }, // High and low
  {
    targets: [
      { x: 500, y: 200, r: 30 },
      { x: 700, y: 200, r: 30 },
      { x: 600, y: 350, r: 30 },
    ],
  }, // Triangle
  {
    targets: [
      { x: 400, y: 100, r: 25 },
      { x: 500, y: 150, r: 25 },
      { x: 600, y: 100, r: 25 },
      { x: 700, y: 150, r: 25 },
    ],
  }, // Wave
];

export default function App() {
  // Game State
  const [levelIndex, setLevelIndex] = useState(0);
  const [targets, setTargets] = useState<any[]>([]);
  const [gameState, setGameState] = useState("aiming"); // 'aiming', 'flying', 'won'

  // Physics State (using Refs for smooth animation loop)
  const ballPos = useRef({ x: 50, y: 400 });
  const ballVel = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 150, y: 400 }); // The anchor point of the slingshot
  const requestRef = useRef(null);

  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [dragCurrent, setDragCurrent] = useState({ x: 150, y: 400 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [showWinScreen, setShowWinScreen] = useState(false);

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const svgRef = useRef(null);

  const loadLevel = (idx: number) => {
    ballPos.current = { x: 150, y: dimensions.height };
    dragStart.current = { ...ballPos.current };
    ballVel.current = { x: 0, y: 0 };
    setDragCurrent({ ...ballPos.current });

    // Load targets adapted to screen size
    const baseTargets = LEVELS[idx % LEVELS.length].targets;
    setTargets(
      baseTargets.map((t) => ({ ...t, id: Math.random(), active: true })),
    );

    setGameState("aiming");
    setShowWinScreen(false);
  };

  useEffect(() => {
    loadLevel(levelIndex);
  }, [levelIndex]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const { clientWidth, clientHeight } = svgRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
        // Reset ball anchor to be responsive
        const newY = clientHeight - 200;
        if (gameState === "aiming") {
          ballPos.current = { x: 150, y: newY };
          dragStart.current = { x: 150, y: newY };
          setDragCurrent({ x: 150, y: newY });
        }
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [gameState]);

  // Trajectory Prediction Calculation
  const trajectoryPoints = useMemo(() => {
    if (!isDragging) return [];

    const points = [];
    let simX = dragCurrent.x;
    let simY = dragCurrent.y;

    // Initial velocity calculation (must match handleMouseUp logic)
    let vx = (dragStart.current.x - simX) * CONFIG.powerMultiplier;
    let vy = (dragStart.current.y - simY) * CONFIG.powerMultiplier;

    const floorY = dimensions.height - CONFIG.groundHeight - CONFIG.ballRadius;

    // Simulate 20 steps for the prediction line
    for (let i = 0; i < 20; i++) {
      vy += CONFIG.gravity;
      vx *= CONFIG.friction;
      vy *= CONFIG.friction;

      simX += vx;
      simY += vy;

      if (simY > floorY) break;

      // Add point every other step to keep it clean
      if (i % 2 === 0) {
        points.push({ x: simX, y: simY });
      }
    }
    return points;
  }, [isDragging, dragCurrent, dimensions]);

  // Main Game Loop
  const updatePhysics = useCallback(() => {
    if (gameState === "flying") {
      let { x, y } = ballPos.current;
      let { x: vx, y: vy } = ballVel.current;

      // Apply Gravity
      vy += CONFIG.gravity;

      // Apply Friction (Air resistance)
      vx *= CONFIG.friction;
      vy *= CONFIG.friction;

      // Move
      x += vx;
      y += vy;

      // Floor Collision
      const floorY =
        dimensions.height - CONFIG.groundHeight - CONFIG.ballRadius;
      if (y > floorY) {
        y = floorY;
        vy *= -CONFIG.bounceDamping;

        // Stop if moving very slowly on floor
        if (Math.abs(vy) < 1 && Math.abs(vx) < 0.5) {
          setGameState("aiming");
          // Reset position to anchor for next shot smoothly?
          // For this game, let's teleport back to start after a delay or stop.
          // Better UX: Let it roll to a stop, then reset.
          vx = 0;
          vy = 0;
          setTimeout(() => resetBall(), 500);
        } else if (Math.abs(vy) > 2) {
          playSound("bounce");
        }
      }

      // Wall Collisions
      if (x < CONFIG.ballRadius) {
        x = CONFIG.ballRadius;
        vx *= -CONFIG.bounceDamping;
        playSound("bounce");
      }
      if (x > dimensions.width - CONFIG.ballRadius) {
        x = dimensions.width - CONFIG.ballRadius;
        vx *= -CONFIG.bounceDamping;
        playSound("bounce");
      }
      if (y < CONFIG.ballRadius) {
        y = CONFIG.ballRadius;
        vy *= -CONFIG.bounceDamping;
        playSound("bounce");
      }

      // Target Collision Check
      setTargets((prevTargets) => {
        const newTargets = prevTargets.map((t) => {
          if (!t.active) return t;
          const dist = getDistance({ x, y }, t);
          if (dist < CONFIG.ballRadius + t.r) {
            playSound("pop");
            // Slight bounce off target
            ballVel.current.x *= 0.8;
            ballVel.current.y *= -0.5;
            return { ...t, active: false };
          }
          return t;
        });

        // Check Win Condition
        const remaining = newTargets.filter((t) => t.active).length;
        if (remaining === 0 && !showWinScreen) {
          handleWin();
        }
        return newTargets;
      });

      ballPos.current = { x, y };
      ballVel.current = { x: vx, y: vy };
    }

    requestRef.current = requestAnimationFrame(updatePhysics);
  }, [gameState, dimensions, showWinScreen]);

  const resetBall = () => {
    if (showWinScreen) return; // Don't reset if we won
    setGameState("aiming");
    ballVel.current = { x: 0, y: 0 };
    ballPos.current = { ...dragStart.current };
    setDragCurrent({ ...dragStart.current });
  };

  const handleWin = () => {
    setGameState("won");
    setShowWinScreen(true);
    playSound("win");
    // Auto next level after delay
    setTimeout(() => {
      setLevelIndex((prev) => prev + 1);
    }, 3000);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(requestRef.current);
  }, [updatePhysics]);

  // Input Handlers
  const handleMouseDown = (e) => {
    setIsMouseDown(true);

    // Only allow grab if aiming and near the ball
    if (gameState !== "aiming") return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;

    const dist = getDistance({ x, y }, ballPos.current);

    // Generous hit area (2x radius) for kids
    if (dist < CONFIG.ballRadius * 3) {
      setIsDragging(true);
      playSound("grab");
    }
  };

  const handleMouseMove = (e) => {
    // Update Custom Cursor
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (svgRect) {
      setCursorPos({
        x: e.clientX - svgRect.left,
        y: e.clientY - svgRect.top,
      });
    }

    if (!isDragging) return;

    // Calculate drag position constrained by max distance
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    const angle = Math.atan2(
      mouseY - dragStart.current.y,
      mouseX - dragStart.current.x,
    );
    const dist = Math.min(
      getDistance({ x: mouseX, y: mouseY }, dragStart.current),
      CONFIG.dragMaxDistance,
    );

    const constrainedX = dragStart.current.x + Math.cos(angle) * dist;
    const constrainedY = dragStart.current.y + Math.sin(angle) * dist;

    setDragCurrent({ x: constrainedX, y: constrainedY });

    // Update visual ball position to follow drag
    ballPos.current = { x: constrainedX, y: constrainedY };

    // Throttle sound effect for dragging could go here
    if (Math.random() > 0.9) playSound("stretch");
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    if (!isDragging) return;

    setIsDragging(false);

    // Calculate Launch Vector
    // In slingshots, pulling back (positive x/y relative to origin) shoots forward (negative relative to pull)
    // Here, we pull the ball away from the anchor. The force is Anchor - BallPos.
    const dx = dragStart.current.x - ballPos.current.x;
    const dy = dragStart.current.y - ballPos.current.y;

    // Small deadzone to prevent accidental drops
    if (Math.sqrt(dx * dx + dy * dy) < 10) {
      ballPos.current = { ...dragStart.current };
      return;
    }

    ballVel.current = {
      x: dx * CONFIG.powerMultiplier,
      y: dy * CONFIG.powerMultiplier,
    };

    setGameState("flying");
    playSound("launch");
  };

  return (
    <div
      className="w-full h-screen bg-sky-200 overflow-hidden relative cursor-none select-none touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Release if leaving window
    >
      {/* Game Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full block"
        width={dimensions.width}
        height={dimensions.height}
      >
        {/* Background Elements */}
        {/* Sun */}
        <circle
          cx={dimensions.width - 80}
          cy={80}
          r={50}
          fill="#FDE047"
          className="animate-pulse"
        />

        {/* Clouds */}
        <Cloud x={200} y={100} scale={1.2} />
        <Cloud x={600} y={150} scale={0.8} />

        {/* Ground */}
        <rect
          x={0}
          y={dimensions.height - CONFIG.groundHeight}
          width={dimensions.width}
          height={CONFIG.groundHeight}
          fill="#4ADE80"
        />
        <rect
          x={0}
          y={dimensions.height - CONFIG.groundHeight}
          width={dimensions.width}
          height={10}
          fill="#22C55E"
        />

        {/* Trajectory Prediction Dots */}
        {isDragging &&
          trajectoryPoints.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={6 - i * 0.2} // Dots get slightly smaller
              fill="white"
              opacity={0.6 - i * 0.02}
            />
          ))}

        {/* Trajectory Line (Visible when dragging) */}
        {isDragging && (
          <line
            x1={dragStart.current.x}
            y1={dragStart.current.y}
            x2={ballPos.current.x}
            y2={ballPos.current.y}
            stroke="white"
            strokeWidth="4"
            strokeDasharray="8"
            opacity="0.6"
          />
        )}

        {/* Slingshot Base (Anchor) - Visual only */}
        <circle
          cx={dragStart.current.x}
          cy={dragStart.current.y + CONFIG.ballRadius}
          r={10}
          fill="rgba(0,0,0,0.1)"
        />

        {/* Targets */}
        {targets.map((target) => (
          <Target key={target.id} target={target} />
        ))}

        {/* The Player/Ball */}
        <g transform={`translate(${ballPos.current.x}, ${ballPos.current.y})`}>
          {/* Shadow */}
          {gameState !== "flying" && (
            <ellipse
              cx="0"
              cy={CONFIG.ballRadius + 5}
              rx={CONFIG.ballRadius}
              ry={CONFIG.ballRadius / 3}
              fill="rgba(0,0,0,0.2)"
            />
          )}

          {/* Body */}
          <circle
            r={CONFIG.ballRadius}
            fill={isDragging ? "#FF5F5F" : "#EF4444"}
          />

          {/* Face */}
          <circle cx={-8} cy={-5} r={3} fill="white" />
          <circle cx={8} cy={-5} r={3} fill="white" />
          <circle cx={-8} cy={-5} r={1} fill="black" />
          <circle cx={8} cy={-5} r={1} fill="black" />

          {/* Mouth - changes based on state */}
          {isDragging ? (
            <circle cx={0} cy={8} r={3} fill="black" /> // O face
          ) : gameState === "flying" ? (
            <path
              d="M -5 8 Q 0 12 5 8"
              stroke="white"
              strokeWidth="2"
              fill="none"
            /> // Smile
          ) : (
            <path
              d="M -5 8 Q 0 12 5 8"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
          )}
        </g>

        {/* Custom Large Cursor */}
        <g
          transform={`translate(${cursorPos.x}, ${cursorPos.y})`}
          style={{ pointerEvents: "none" }}
        >
          {/* Outer Ring */}
          <circle
            r={20}
            fill="none"
            stroke={isMouseDown ? "#FBBF24" : "white"}
            strokeWidth="3"
            className="drop-shadow-md"
            opacity={0.8}
          />
          {/* Inner Dot */}
          <circle
            r={8}
            fill={isMouseDown ? "#FBBF24" : "white"}
            className="drop-shadow-sm transition-colors duration-100"
          />
        </g>
      </svg>

      {/* Win Screen Overlay */}
      {showWinScreen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-3xl p-10 flex flex-col items-center animate-bounce shadow-2xl border-4 border-yellow-400">
            <div className="text-8xl mb-4">⭐</div>
            <h1 className="text-4xl font-bold text-sky-600 mb-2">Good Job!</h1>
          </div>
        </div>
      )}

      {/* Tutorial Hint (if idle at start) */}
      {gameState === "aiming" && !isDragging && !showWinScreen && (
        <div
          className="absolute pointer-events-none flex flex-col items-center animate-bounce"
          style={{
            left: dragStart.current.x - 50,
            top: dragStart.current.y - 120,
          }}
        >
          <span className="text-4xl">👇</span>
          <span className="text-white font-bold text-xl drop-shadow-md bg-sky-500/50 px-3 py-1 rounded-full mt-2">
            Drag Me!
          </span>
        </div>
      )}
    </div>
  );
}

// Simple Components for Visuals

const Cloud = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity="0.8">
    <circle cx="0" cy="0" r="30" fill="white" />
    <circle cx="25" cy="-10" r="35" fill="white" />
    <circle cx="50" cy="0" r="30" fill="white" />
  </g>
);

const Target = ({ target }) => {
  if (!target.active) {
    // Explosion particles could go here
    return (
      <g transform={`translate(${target.x}, ${target.y})`}>
        <circle
          r={target.r}
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity="0.5"
          className="animate-ping"
        />
      </g>
    );
  }

  return (
    <g transform={`translate(${target.x}, ${target.y})`}>
      {/* Star Shape */}
      <path
        d="M0,-25 L6,-8 L24,-8 L10,2 L15,20 L0,10 L-15,20 L-10,2 L-24,-8 L-6,-8 Z"
        fill="#FBBF24"
        stroke="#D97706"
        strokeWidth="2"
        className="animate-pulse" // Subtle pulse
      />
      {/* Cute face on the star */}
      <circle cx="-5" cy="-2" r="2" fill="#78350F" />
      <circle cx="5" cy="-2" r="2" fill="#78350F" />
      <path d="M-3 5 Q 0 7 3 5" stroke="#78350F" strokeWidth="1" fill="none" />
    </g>
  );
};
