export type BreathPhase = "smallBreath" | "slightlyAnnoyedBreath" | "huffyPuffy";
export type CatPhase = "idle" | "blink" | BreathPhase;
export type FrameStep = { frame: number; duration: number };

export const ATLAS_COLUMNS = 8;
export const IDLE_FRAME_INDEX = 60;
export const BLINK_FRAME_INDEX = 61;

export const SMALL_BREATH_FRAMES: FrameStep[] = [
  ...Array.from({ length: 8 }, (_, index) => ({ frame: index + 1, duration: 70 })),
  { frame: 9, duration: 780 },
  { frame: 13, duration: 450 },
  ...Array.from({ length: 5 }, (_, index) => ({ frame: index + 14, duration: 70 })),
];

const SLIGHTLY_ANNOYED_BREATH_FRAMES: FrameStep[] = [
  { frame: 1, duration: 100 },
  { frame: 2, duration: 100 },
  { frame: 3, duration: 100 },
  { frame: 4, duration: 100 },
  { frame: 5, duration: 250 },
  { frame: 6, duration: 90 },
  { frame: 7, duration: 90 },
  { frame: 8, duration: 120 },
  { frame: 9, duration: 120 },
];

const HUFFY_PUFFY_FRAMES: FrameStep[] = [
  ...Array.from({ length: 6 }, (_, index) => ({ frame: index + 1, duration: 70 })),
  { frame: 7, duration: 120 },
  { frame: 8, duration: 70 },
  { frame: 9, duration: 70 },
  { frame: 10, duration: 70 },
  { frame: 11, duration: 90 },
  { frame: 12, duration: 90 },
];

export const BREATHS: Record<BreathPhase, { offset: number; steps: FrameStep[] }> = {
  smallBreath: { offset: 0, steps: SMALL_BREATH_FRAMES },
  slightlyAnnoyedBreath: { offset: 24, steps: SLIGHTLY_ANNOYED_BREATH_FRAMES },
  huffyPuffy: { offset: 46, steps: HUFFY_PUFFY_FRAMES },
};
