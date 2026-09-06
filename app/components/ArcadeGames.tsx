"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DoorChoiceGame } from "./DoorChoiceGame";

type Point = { x: number; y: number };
type Direction = "up" | "down" | "left" | "right";

const directionVectors: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const keyDirections: Record<string, Direction | undefined> = {
  ArrowUp: "up", w: "up", W: "up",
  ArrowDown: "down", s: "down", S: "down",
  ArrowLeft: "left", a: "left", A: "left",
  ArrowRight: "right", d: "right", D: "right",
};

function DirectionPad({ onMove }: { onMove: (direction: Direction) => void }) {
  return (
    <div className="arcade-dpad" aria-label="Game controls">
      <button type="button" className="dpad-up" onClick={() => onMove("up")} aria-label="Move up">▲</button>
      <button type="button" className="dpad-left" onClick={() => onMove("left")} aria-label="Move left">◀</button>
      <button type="button" className="dpad-down" onClick={() => onMove("down")} aria-label="Move down">▼</button>
      <button type="button" className="dpad-right" onClick={() => onMove("right")} aria-label="Move right">▶</button>
    </div>
  );
}

function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snake = useRef<Point[]>([{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }]);
  const food = useRef<Point>({ x: 13, y: 9 });
  const direction = useRef<Direction>("right");
  const nextDirection = useRef<Direction>("right");
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("PRESS START");

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const cell = canvas.width / 18;

    context.fillStyle = "#020811";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(16,199,181,.08)";
    context.lineWidth = 1;
    for (let line = 0; line <= 18; line += 1) {
      context.beginPath(); context.moveTo(line * cell, 0); context.lineTo(line * cell, canvas.height); context.stroke();
      context.beginPath(); context.moveTo(0, line * cell); context.lineTo(canvas.width, line * cell); context.stroke();
    }

    context.fillStyle = "#f4bf4f";
    context.fillRect(food.current.x * cell + 4, food.current.y * cell + 4, cell - 8, cell - 8);
    snake.current.forEach((part, index) => {
      context.fillStyle = index === 0 ? "#25f2db" : "#10c7b5";
      context.fillRect(part.x * cell + 2, part.y * cell + 2, cell - 4, cell - 4);
    });
  }, []);

  const reset = useCallback(() => {
    snake.current = [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }];
    food.current = { x: 13, y: 9 };
    direction.current = "right";
    nextDirection.current = "right";
    setScore(0);
    setStatus("RUNNING");
    setRunning(true);
    window.setTimeout(draw, 0);
  }, [draw]);

  const steer = useCallback((requested: Direction) => {
    const opposites: Record<Direction, Direction> = { up: "down", down: "up", left: "right", right: "left" };
    if (requested !== opposites[direction.current]) nextDirection.current = requested;
  }, []);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const requested = keyDirections[event.key];
      if (!requested) return;
      event.preventDefault();
      steer(requested);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [steer]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      direction.current = nextDirection.current;
      const vector = directionVectors[direction.current];
      const head = snake.current[0];
      const next = { x: head.x + vector.x, y: head.y + vector.y };
      const hitWall = next.x < 0 || next.x >= 18 || next.y < 0 || next.y >= 18;
      const hitSelf = snake.current.some((part) => part.x === next.x && part.y === next.y);

      if (hitWall || hitSelf) {
        setRunning(false);
        setStatus("GAME OVER");
        return;
      }

      snake.current = [next, ...snake.current];
      if (next.x === food.current.x && next.y === food.current.y) {
        setScore((current) => current + 10);
        let candidate: Point;
        do {
          candidate = { x: Math.floor(Math.random() * 18), y: Math.floor(Math.random() * 18) };
        } while (snake.current.some((part) => part.x === candidate.x && part.y === candidate.y));
        food.current = candidate;
      } else {
        snake.current.pop();
      }
      draw();
    }, 120);
    return () => window.clearInterval(timer);
  }, [draw, running]);

  return (
    <div className="arcade-machine">
      <div className="arcade-readout"><span>SCORE {String(score).padStart(4, "0")}</span><strong>{status}</strong></div>
      <canvas ref={canvasRef} width="360" height="360" aria-label="Playable Snake game" />
      <div className="arcade-controls">
        <button type="button" className="game-button" onClick={reset}>{running ? "RESTART" : "START GAME"}</button>
        <DirectionPad onMove={steer} />
      </div>
      <p>Use arrow keys, WASD or the controls. Eat the gold pixels. Do not bite yourself.</p>
    </div>
  );
}

type Car = { x: number; y: number; speed: number; length: number; colour: string };

function FroggerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frog = useRef<Point>({ x: 8, y: 18 });
  const cars = useRef<Car[]>([
    { x: 1, y: 15, speed: .035, length: 2, colour: "#ff3153" },
    { x: 11, y: 13, speed: -.052, length: 3, colour: "#f4bf4f" },
    { x: 5, y: 10, speed: .066, length: 2, colour: "#8d75ff" },
    { x: 14, y: 7, speed: -.043, length: 2, colour: "#ff7d4d" },
    { x: 2, y: 4, speed: .058, length: 3, colour: "#5db7ff" },
  ]);
  const livesRef = useRef(3);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [status, setStatus] = useState("PRESS START");

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const cell = canvas.width / 18;

    context.fillStyle = "#06111f";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#0a513f";
    context.fillRect(0, 0, canvas.width, cell * 2);
    context.fillRect(0, cell * 17, canvas.width, cell * 3);
    context.fillStyle = "rgba(238,247,248,.16)";
    [4, 7, 10, 13, 15].forEach((row) => {
      for (let x = 0; x < 18; x += 2) context.fillRect(x * cell, row * cell - 1, cell, 2);
    });

    cars.current.forEach((car) => {
      context.fillStyle = car.colour;
      context.fillRect(car.x * cell, car.y * cell + 3, car.length * cell, cell - 6);
      context.fillStyle = "#020811";
      context.fillRect((car.x + .35) * cell, car.y * cell + 6, cell * .45, cell * .35);
    });

    context.fillStyle = "#aeea6d";
    context.fillRect(frog.current.x * cell + 2, frog.current.y * cell + 2, cell - 4, cell - 4);
    context.fillStyle = "#020811";
    context.fillRect(frog.current.x * cell + 5, frog.current.y * cell + 5, 3, 3);
    context.fillRect(frog.current.x * cell + cell - 8, frog.current.y * cell + 5, 3, 3);
  }, []);

  const reset = useCallback(() => {
    frog.current = { x: 8, y: 18 };
    livesRef.current = 3;
    setLives(3);
    setScore(0);
    setStatus("CROSS THE ROAD");
    setRunning(true);
    window.setTimeout(draw, 0);
  }, [draw]);

  const move = useCallback((requested: Direction) => {
    if (!running) return;
    const vector = directionVectors[requested];
    frog.current = {
      x: Math.max(0, Math.min(17, frog.current.x + vector.x)),
      y: Math.max(0, Math.min(19, frog.current.y + vector.y)),
    };
    if (frog.current.y <= 1) {
      setScore((current) => current + 100);
      setStatus("HOME! +100");
      frog.current = { x: 8, y: 18 };
    }
    draw();
  }, [draw, running]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const requested = keyDirections[event.key];
      if (!requested) return;
      event.preventDefault();
      move(requested);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [move]);

  useEffect(() => {
    if (!running) return;
    let animationFrame = 0;
    let lastTime = 0;
    const animate = (time: number) => {
      if (time - lastTime > 22) {
        lastTime = time;
        cars.current.forEach((car) => {
          car.x += car.speed;
          if (car.speed > 0 && car.x > 19) car.x = -car.length;
          if (car.speed < 0 && car.x < -car.length) car.x = 19;
        });

        const hit = cars.current.some((car) =>
          frog.current.y === car.y && frog.current.x + .75 > car.x && frog.current.x < car.x + car.length
        );
        if (hit) {
          livesRef.current -= 1;
          setLives(livesRef.current);
          frog.current = { x: 8, y: 18 };
          if (livesRef.current <= 0) {
            setStatus("GAME OVER");
            setRunning(false);
          } else {
            setStatus("SPLAT! KEEP GOING");
          }
        }
        draw();
      }
      animationFrame = window.requestAnimationFrame(animate);
    };
    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [draw, running]);

  return (
    <div className="arcade-machine">
      <div className="arcade-readout"><span>SCORE {String(score).padStart(4, "0")} · LIVES {lives}</span><strong>{status}</strong></div>
      <canvas ref={canvasRef} width="360" height="400" aria-label="Playable Frogger game" />
      <div className="arcade-controls">
        <button type="button" className="game-button" onClick={reset}>{running ? "RESTART" : "START GAME"}</button>
        <DirectionPad onMove={move} />
      </div>
      <p>Use arrow keys, WASD or the controls. Reach the green safety zone without getting splatted.</p>
    </div>
  );
}

export function ArcadeGames() {
  const [selectedGame, setSelectedGame] = useState<"doors" | "snake" | "frogger">("doors");

  return (
    <section className="arcade-library" aria-label="OS Joe arcade">
      <div className="arcade-selector" role="tablist" aria-label="Choose a game">
        <button type="button" role="tab" aria-selected={selectedGame === "frogger"} className={selectedGame === "frogger" ? "active" : ""} onClick={() => setSelectedGame("frogger")}>
          <span>GAME_01</span><strong>FROGGER</strong><small>Cross the traffic lanes</small>
        </button>
        <button type="button" role="tab" aria-selected={selectedGame === "snake"} className={selectedGame === "snake" ? "active" : ""} onClick={() => setSelectedGame("snake")}>
          <span>GAME_02</span><strong>SNAKE</strong><small>Eat pixels, grow longer</small>
        </button>
        <button type="button" role="tab" aria-selected={selectedGame === "doors"} className={selectedGame === "doors" ? "active" : ""} onClick={() => setSelectedGame("doors")}>
          <span>GAME_03 // NEW</span><strong>THREE DOORS</strong><small>Choose what happens next</small>
        </button>
      </div>
      {selectedGame === "doors" ? <DoorChoiceGame /> : selectedGame === "frogger" ? <FroggerGame /> : <SnakeGame />}
    </section>
  );
}
