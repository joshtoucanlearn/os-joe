export const RIPPLE_SPEED = 0.32;
export const RIPPLE_TAIL = 0.08;
export const MAX_RIPPLES = 64;
export type Ripple = { x: number; y: number; born: number };

export function rippleReach(ripple: Ripple, aspect: number) {
  return Math.hypot(Math.max(ripple.x, 1 - ripple.x) * aspect, Math.max(ripple.y, 1 - ripple.y));
}

export function rippleOpacity(ripple: Ripple, now: number, aspect: number) {
  const radius = (now - ripple.born) * RIPPLE_SPEED;
  const fade = Math.max(0, Math.min(1, (radius - rippleReach(ripple, aspect)) / RIPPLE_TAIL));
  return 1 - fade * fade * (3 - 2 * fade);
}

export class RipplePool {
  active: Ripple[] = [];
  aspect: number;

  constructor(aspect = 1) {
    this.aspect = aspect;
  }

  expire(now: number) {
    this.active = this.active.filter(
      (ripple) =>
        (now - ripple.born) * RIPPLE_SPEED < rippleReach(ripple, this.aspect) + RIPPLE_TAIL,
    );
  }

  add(x: number, y: number, now: number) {
    this.expire(now);
    // Keep existing rings alive even when input exceeds the GPU's burst budget.
    if (this.active.length < MAX_RIPPLES) this.active.push({ x, y, born: now });
  }

  clear() {
    this.active = [];
  }
}
