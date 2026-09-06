"use client";

import { useEffect, useRef, useState } from "react";

type Reaction = "happy" | "startled" | "ruffled";

const reactions: Reaction[] = ["happy", "startled", "ruffled"];
const reactionMessages: Record<Reaction, string> = {
  happy: "purrr!",
  startled: "MRRP?!",
  ruffled: "*fluff!*",
};

export function PixelCatArt() {
  return (
    <span className="pixel-cat">
      <span className="cat-packet cat-packet-one" />
      <span className="cat-packet cat-packet-two" />
      <span className="cat-packet cat-packet-three" />
      <span className="cat-packet cat-packet-four" />
      <span className="cat-tail" />
      <span className="cat-body" />
      <span className="cat-paw cat-paw-left" />
      <span className="cat-paw cat-paw-right" />
      <span className="cat-head">
        <span className="cat-ear cat-ear-left" />
        <span className="cat-ear cat-ear-right" />
        <span className="cat-face" />
        <span className="cat-eye cat-eye-left" />
        <span className="cat-eye cat-eye-right" />
        <span className="cat-nose" />
      </span>
    </span>
  );
}

export function PetCat() {
  const [clicks, setClicks] = useState(0);
  const [isGlitched, setIsGlitched] = useState(false);
  const [idleMode, setIdleMode] = useState(0);
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const reactionTimer = useRef<number | null>(null);

  useEffect(() => {
    const idleTimer = window.setInterval(() => {
      setIdleMode((current) => (current + 1) % 3);
    }, 3600);
    return () => window.clearInterval(idleTimer);
  }, []);

  useEffect(() => () => {
    if (reactionTimer.current) window.clearTimeout(reactionTimer.current);
  }, []);

  const handleClick = () => {
    if (isGlitched) {
      setIsGlitched(false);
      setClicks(0);
      setReaction(null);
      return;
    }

    const nextClicks = clicks + 1;
    const nextReaction = reactions[(nextClicks - 1) % reactions.length];
    setClicks(nextClicks);
    setReaction(nextReaction);
    if (reactionTimer.current) window.clearTimeout(reactionTimer.current);
    reactionTimer.current = window.setTimeout(() => setReaction(null), 720);
    if (nextClicks === 10) setIsGlitched(true);
  };

  const message = isGlitched
    ? "SIGNAL LOST..."
    : reaction
      ? reactionMessages[reaction]
      : "pspsps…";

  const classes = [
    "pixel-pet",
    `idle-${idleMode}`,
    reaction ? `reaction-${reaction} has-reaction` : "",
    isGlitched ? "is-glitched" : "",
  ].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      className={classes}
      onClick={handleClick}
      aria-label={isGlitched ? "Glitching red-eyed pixel cat. Click to calm it." : "Pixel cat pet. Click to interact."}
    >
      <span className="pet-message">{message}</span>
      <span className="cat-scale" aria-hidden="true">
        <PixelCatArt />
      </span>
    </button>
  );
}
