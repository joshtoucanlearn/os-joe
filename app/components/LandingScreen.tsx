"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ATLAS_COLUMNS,
  BLINK_FRAME_INDEX,
  BREATHS,
  IDLE_FRAME_INDEX,
  type BreathPhase,
  type CatPhase,
} from "./welcomecatFrames";
import { InteractiveSky } from "./InteractiveSky";

type CatFrame = { frame: number; phase: CatPhase };
const IDLE_FRAME: CatFrame = { frame: IDLE_FRAME_INDEX, phase: "idle" };
const BLINK_FRAME: CatFrame = { frame: BLINK_FRAME_INDEX, phase: "blink" };
const EVENT_PAUSE = 5000;
const BLINK_DURATION = 95;
const ENTRY_GLOW_HOLD = 1500;

type SequenceEvent =
  | { kind: "blink" }
  | { kind: "breath"; phase: BreathPhase };

export type JumpFrame = {
  source?: "legacy" | "camera";
  spriteFrame: number;
  label: string;
  duration: number;
  left: number;
  top: number;
  size: number;
};

export const JUMP_COLUMNS = 5;
export const JUMP_ROWS = 4;
export const JUMP_FRAMES: JumpFrame[] = [
  { spriteFrame: 0, label: "wait", duration: 540, left: 70.8, top: 43, size: 27 },
  { spriteFrame: 1, label: "perk", duration: 150, left: 69.39, top: 38.92, size: 27 },
  { spriteFrame: 2, label: "rise", duration: 120, left: 72.98, top: 38.92, size: 27 },
  { spriteFrame: 3, label: "settle", duration: 100, left: 74.79, top: 38.92, size: 27 },
  { spriteFrame: 4, label: "crouch", duration: 130, left: 68.63, top: 41.53, size: 28 },
  { spriteFrame: 5, label: "compress", duration: 140, left: 70.86, top: 41.53, size: 28 },
  { spriteFrame: 6, label: "launch", duration: 100, left: 61, top: 36, size: 29 },
  { spriteFrame: 7, label: "full reach", duration: 90, left: 50.5, top: 26.3, size: 32 },
  { spriteFrame: 8, label: "eyes shift", duration: 80, left: 41.2, top: 22.45, size: 32 },
  { spriteFrame: 9, label: "gaze lock", duration: 80, left: 32.12, top: 15.55, size: 35 },
  { spriteFrame: 10, label: "head track", duration: 80, left: 23.05, top: 9.28, size: 39 },
  { spriteFrame: 11, label: "approach bridge", duration: 75, left: 12.57, top: 6.73, size: 43 },
  { spriteFrame: 12, label: "camera rush", duration: 75, left: 2, top: 4.64, size: 48 },
  { spriteFrame: 13, label: "near-lens bridge", duration: 70, left: -8.5, top: 3.77, size: 53 },
  { spriteFrame: 14, label: "head pass", duration: 65, left: -21, top: 2.05, size: 60 },
  { spriteFrame: 15, label: "hindquarter pass", duration: 60, left: -36, top: 0.65, size: 68 },
  { spriteFrame: 16, label: "tail-tip pass", duration: 55, left: -52.88, top: -1.16, size: 78 },
  { spriteFrame: 17, label: "clear", duration: 100, left: -60, top: -2, size: 80 },
];

// Geometry-only camera test. Frames 00–06 are deliberately identical to the
// approved grounded sequence. The cat then clears the ground, climbs, turns
// through the apex, and accelerates down past the viewer with increasingly
// aggressive perspective growth.
export const PERSPECTIVE_JUMP_FRAMES: JumpFrame[] = [
  ...JUMP_FRAMES.slice(0, 7),
  { spriteFrame: 7, label: "full reach", duration: 90, left: 51.02, top: 26.47, size: 33 },
  { spriteFrame: 8, label: "eyes shift", duration: 80, left: 41.62, top: 19.96, size: 35 },
  { spriteFrame: 9, label: "gaze lock", duration: 80, left: 32.56, top: 11.34, size: 40 },
  { spriteFrame: 10, label: "head track", duration: 80, left: 23.16, top: 3.56, size: 47 },
  { spriteFrame: 11, label: "approach bridge", duration: 75, left: 11.09, top: -0.62, size: 56 },
  { spriteFrame: 12, label: "camera rush", duration: 75, left: -2, top: -6.35, size: 68 },
  { spriteFrame: 13, label: "near-lens bridge", duration: 70, left: -13, top: -4.97, size: 74 },
  { spriteFrame: 14, label: "head pass", duration: 65, left: -32.5, top: -13.93, size: 95 },
  { spriteFrame: 15, label: "hindquarter pass", duration: 60, left: -55, top: -23.91, size: 120 },
  { spriteFrame: 16, label: "tail-tip pass", duration: 55, left: -81.77, top: -35.53, size: 150 },
  { spriteFrame: 17, label: "clear", duration: 100, left: -90, top: -40, size: 155 },
];

const ANIMATION_SEQUENCE: SequenceEvent[] = [
  { kind: "blink" },
  { kind: "breath", phase: "smallBreath" },
  { kind: "blink" },
  { kind: "blink" },
  { kind: "breath", phase: "slightlyAnnoyedBreath" },
  { kind: "blink" },
  { kind: "breath", phase: "huffyPuffy" },
];

export function LandingScreen({
  previewOnly = false,
  jumpFrames = JUMP_FRAMES,
}: {
  previewOnly?: boolean;
  jumpFrames?: JumpFrame[];
}) {
  const [catFrame, setCatFrame] = useState<CatFrame>(IDLE_FRAME);
  const [atlasReady, setAtlasReady] = useState(false);
  const [jumpReady, setJumpReady] = useState(false);
  const [jumpFrame, setJumpFrame] = useState(0);
  const [jumpActive, setJumpActive] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const entering = useRef(false);
  const landingPage = useRef<HTMLElement>(null);

  const enterSite = () => {
    if (entering.current) return;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){window.location.assign("/os-joe/home/");return;}
    entering.current = true;
    setCatFrame(IDLE_FRAME);
    setJumpFrame(0);
    setJumpActive(false);
    setIsEntering(true);
  };

  useEffect(() => {
    landingPage.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "c") enterSite();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    let stopped = false;
    let loaded = 0;
    const atlases = [
      "/os-joe/welcomecat-jump-atlas.png?v=9",
      "/os-joe/welcomecat-camera-keyframes-v1-atlas.png?v=4",
    ].map((src) => {
      const atlas = new Image();
      atlas.onload = () => {
        loaded += 1;
        if (!stopped && loaded === 2) setJumpReady(true);
      };
      atlas.src = src;
      return atlas;
    });
    return () => {
      stopped = true;
      atlases.forEach((atlas) => {
        atlas.onload = null;
      });
    };
  }, []);

  useEffect(() => {
    if (!isEntering) return;

    let stopped = false;
    let position = 1;
    let timer = 0;
    let activationTimer = 0;

    const finish = () => {
      if (stopped) return;
      if (previewOnly) {
        entering.current = false;
        setIsEntering(false);
        setJumpActive(false);
        setJumpFrame(0);
        setCatFrame(IDLE_FRAME);
        return;
      }
      window.location.assign("/os-joe/home/");
    };

    const showNextFrame = () => {
      if (stopped) return;
      setJumpFrame(position);
      const duration = jumpFrames[position].duration;
      if (position === jumpFrames.length - 1) {
        timer = window.setTimeout(finish, duration);
        return;
      }
      position += 1;
      timer = window.setTimeout(showNextFrame, duration);
    };

    // Hold the activated blue glow on the rooted idle cat for a full beat,
    // then begin on the first visible movement frame. Frame zero is the
    // stationary bridge pose and is already represented by the idle sprite.
    activationTimer = window.setTimeout(() => {
      if (stopped) return;
      setJumpActive(true);
      showNextFrame();
    }, ENTRY_GLOW_HOLD);

    return () => {
      stopped = true;
      window.clearTimeout(activationTimer);
      window.clearTimeout(timer);
    };
  }, [isEntering, jumpFrames, previewOnly]);

  useEffect(() => {
    let stopped = false;
    let sequenceIndex = 0;
    let eventTimer = 0;
    let blinkResetTimer = 0;
    let frameTimer = 0;

    const clearTimers = () => {
      window.clearTimeout(eventTimer);
      window.clearTimeout(blinkResetTimer);
      window.clearTimeout(frameTimer);
    };

    const playBlink = (onComplete?: () => void) => {
      if (stopped) return;
      setCatFrame(BLINK_FRAME);
      blinkResetTimer = window.setTimeout(() => {
        if (stopped) return;
        setCatFrame(IDLE_FRAME);
        onComplete?.();
      }, BLINK_DURATION);
    };

    const scheduleNextEvent = () => {
      setCatFrame(IDLE_FRAME);

      eventTimer = window.setTimeout(() => {
        if (stopped || entering.current) return;
        const event = ANIMATION_SEQUENCE[sequenceIndex];
        sequenceIndex = (sequenceIndex + 1) % ANIMATION_SEQUENCE.length;

        if (event.kind === "blink") {
          playBlink(scheduleNextEvent);
          return;
        }

        playBreath(event.phase);
      }, EVENT_PAUSE);
    };

    const playBreath = (phase: BreathPhase) => {
      const breath = BREATHS[phase];
      let position = 0;

      const showNextFrame = () => {
        if (stopped) return;
        const next = breath.steps[position];
        if (!next) {
          scheduleNextEvent();
          return;
        }

        setCatFrame({ frame: breath.offset + next.frame, phase });
        position += 1;
        frameTimer = window.setTimeout(showNextFrame, next.duration);
      };

      showNextFrame();
    };

    const atlas = new Image();
    atlas.onload = () => {
      if (stopped) return;
      setAtlasReady(true);
      scheduleNextEvent();
    };
    atlas.src = "/os-joe/welcomecat-animation-atlas.png";

    return () => {
      stopped = true;
      clearTimers();
    };
  }, []);

  const column = catFrame.frame % ATLAS_COLUMNS;
  const row = Math.floor(catFrame.frame / ATLAS_COLUMNS);
  const frameStyle = {
    "--cat-x": `${(column / (ATLAS_COLUMNS - 1)) * 100}%`,
    "--cat-y": `${(row / (ATLAS_COLUMNS - 1)) * 100}%`,
  } as CSSProperties;

  const jumpMotion = jumpFrames[jumpFrame];
  const jumpColumns = jumpMotion.source === "camera" ? 3 : JUMP_COLUMNS;
  const jumpRows = jumpMotion.source === "camera" ? 2 : JUMP_ROWS;
  const jumpColumn = jumpMotion.spriteFrame % jumpColumns;
  const jumpRow = Math.floor(jumpMotion.spriteFrame / jumpColumns);
  const jumpStyle = {
    "--jump-cat-x": `${(jumpColumn / (jumpColumns - 1)) * 100}%`,
    "--jump-cat-y": `${(jumpRow / (jumpRows - 1)) * 100}%`,
    "--jump-left": `${jumpMotion.left}%`,
    "--jump-top": `${jumpMotion.top}%`,
    "--jump-size": `${jumpMotion.size}%`,
  } as CSSProperties;

  return (
    <main
      ref={landingPage}
      className={`landing-page${isEntering ? " is-entering" : ""}${jumpActive ? " is-jump-active" : ""}`}
      aria-label="Enter OS Joe"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key.toLowerCase() === "c") enterSite();
      }}
    >
      <InteractiveSky
        owner="Joe's"
        storageKey="os-joe-sky-preset"
        assetPrefix="/os-joe"
        placement="landing"
      />
      <span className="landing-canvas">
        <div className="joe-entry-art">
          <span className="joe-entry-kicker">WELCOME TO</span>
          <strong>OS_JOE</strong>
          <span className="joe-entry-subtitle">MAKE · CREATE · PLAY</span>
        </div>
        <span
          className={`landing-cat-sprite cat-phase-${catFrame.phase}${atlasReady ? " is-atlas-ready" : ""}`}
          data-cat-phase={catFrame.phase}
          data-cat-frame={catFrame.frame}
          data-cat-ready={atlasReady ? "true" : "false"}
          style={frameStyle}
          aria-hidden="true"
        />
        <span
          className={`landing-jump-sprite${jumpReady ? " is-ready" : ""}`}
          data-jump-frame={jumpFrame}
          data-jump-sprite-frame={jumpMotion.spriteFrame}
          data-jump-source={jumpMotion.source ?? "legacy"}
          data-jump-airborne={jumpFrame >= 6 ? "true" : "false"}
          style={jumpStyle}
          aria-hidden="true"
        />
      </span>
      <button type="button" className="continue-prompt" onClick={enterSite} disabled={isEntering}>
        <span className="prompt-caret" aria-hidden="true">▶</span>
        ENTER · PRESS C
      </button>
      <span className="entry-flash" aria-hidden="true" />
    </main>
  );
}
