import { LandingScreen, type JumpFrame } from "./components/LandingScreen";

// Keep the production sequence on the server side. Importing a runtime array
// from a client component is represented as a client reference in production,
// so it cannot be sliced while this page is rendered.
const APPROVED_LAUNCH_FRAMES: JumpFrame[] = [
  { spriteFrame: 0, label: "wait", duration: 540, left: 70.8, top: 43, size: 27 },
  { spriteFrame: 1, label: "perk", duration: 150, left: 69.39, top: 38.92, size: 27 },
  { spriteFrame: 2, label: "rise", duration: 120, left: 72.98, top: 38.92, size: 27 },
  { spriteFrame: 3, label: "settle", duration: 100, left: 74.79, top: 38.92, size: 27 },
  { spriteFrame: 4, label: "crouch", duration: 130, left: 68.63, top: 41.53, size: 28 },
  { spriteFrame: 5, label: "compress", duration: 140, left: 70.86, top: 41.53, size: 28 },
  { spriteFrame: 6, label: "launch", duration: 100, left: 61, top: 36, size: 29 },
];

const FINAL_JUMP_FRAMES: JumpFrame[] = [
  ...APPROVED_LAUNCH_FRAMES,
  {
    source: "camera",
    spriteFrame: 1,
    label: "first turn",
    duration: 110,
    left: 46,
    top: 18.6,
    size: 46,
  },
  {
    source: "camera",
    spriteFrame: 2,
    label: "committed approach",
    duration: 95,
    left: 29,
    top: 1,
    size: 58,
  },
  {
    source: "camera",
    spriteFrame: 3,
    label: "lens rush",
    duration: 85,
    left: -4,
    top: -12,
    size: 85,
  },
  {
    source: "camera",
    spriteFrame: 4,
    label: "camera pass",
    duration: 75,
    left: -55,
    top: -45,
    size: 130,
  },
  {
    source: "camera",
    spriteFrame: 5,
    label: "behind camera",
    duration: 90,
    left: -95,
    top: -56,
    size: 160,
  },
];

export default function Home() {
  return <LandingScreen jumpFrames={FINAL_JUMP_FRAMES} />;
}
