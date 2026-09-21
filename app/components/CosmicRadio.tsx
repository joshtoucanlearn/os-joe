"use client";

import { useEffect, useRef, useState } from "react";
import library from "../data/cosmic-radio-tracks.json";

const MIXES = {
  takanaka: { title: "Masayoshi Takanaka", tracks: library.filter((track) => track.mix === "takanaka") },
  "paul-allen": { title: "Paul Allen’s 8-bit mix", tracks: library.filter((track) => track.mix === "paul-allen") },
};
type MixId = keyof typeof MIXES;

type Status = "idle" | "loading" | "playing" | "paused" | "error";
const MUSIC_ROOT = "https://toucan-learn.github.io/evansworld/";

export function CosmicRadio({ owner, storageKey, petSrc }: { owner: string; storageKey: string; petSrc: string }) {
  const [mixId, setMixId] = useState<MixId>("takanaka");
  const mixRef = useRef<MixId>("takanaka");
  const tracks = MIXES[mixId].tracks;
  const audioRef = useRef<HTMLAudioElement>(null);
  const graph = useRef<{ context: AudioContext; gain: GainNode } | null>(null);
  const request = useRef(0), wanted = useRef(false), indexRef = useRef(0), volumeRef = useRef(0.2);
  const [index, setIndex] = useState(0), [volume, setVolume] = useState(0.2), [status, setStatus] = useState<Status>("idle");
  const track = tracks[index], active = status === "playing" || status === "loading";

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey), next = saved === null ? 0.2 : Number(saved);
      if (Number.isFinite(next) && next >= 0 && next <= 1) { volumeRef.current = next; setVolume(next); }
    } catch {}
    const audio = audioRef.current;
    return () => { request.current += 1; wanted.current = false; audio?.pause(); audio?.removeAttribute("src"); const current = graph.current; graph.current = null; void current?.context.close().catch(() => {}); };
  }, [storageKey]);

  const changeVolume = (next: number) => {
    volumeRef.current = next; setVolume(next);
    if (graph.current) graph.current.gain.gain.setTargetAtTime(next, graph.current.context.currentTime, 0.025);
    else if (audioRef.current) audioRef.current.volume = next;
    try { window.localStorage.setItem(storageKey, String(next)); } catch {}
  };
  const pause = () => { request.current += 1; wanted.current = false; audioRef.current?.pause(); setStatus("paused"); };
  const play = (next = indexRef.current, mix: MixId = mixRef.current) => {
    const playlist = MIXES[mix].tracks;
    mixRef.current = mix;
    setMixId(mix);
    const audio = audioRef.current; if (!audio) return;
    const id = ++request.current; wanted.current = true; indexRef.current = next; setIndex(next); setStatus("loading");
    if (!graph.current && typeof AudioContext !== "undefined") {
      try { const context = new AudioContext(), source = context.createMediaElementSource(audio), gain = context.createGain(); gain.gain.value = volumeRef.current; source.connect(gain).connect(context.destination); graph.current = { context, gain }; } catch {}
    }
    audio.volume = graph.current ? 1 : volumeRef.current;
    const src = new URL(playlist[next].src, MUSIC_ROOT).href;
    if (audio.src !== src) audio.src = src; else if (audio.error) audio.load();
    void Promise.all([graph.current?.context.resume(), audio.play()]).then(() => { if (id === request.current && wanted.current) setStatus("playing"); }).catch(() => { if (id !== request.current) return; wanted.current = false; audio.pause(); setStatus("error"); });
  };
  const skip = (direction: number) => play((indexRef.current + direction + MIXES[mixRef.current].tracks.length) % MIXES[mixRef.current].tracks.length);

  return (
    <aside className={`cosmic-radio${status === "playing" ? " is-playing" : ""}`} aria-label={`${owner}'s cosmic radio`}>
      <audio ref={audioRef} crossOrigin="anonymous" preload="none" onEnded={() => wanted.current && skip(1)} onPlaying={() => wanted.current && setStatus("playing")} onWaiting={() => wanted.current && setStatus("loading")} onError={() => { if (audioRef.current?.error) { wanted.current = false; setStatus("error"); } }} />
      <div className="cosmic-radio-top">
        <button type="button" className="cosmic-radio-pet" onClick={() => (active ? pause() : play())} aria-label={active ? "Pause radio" : "Play radio"}><img src={petSrc} alt="" width="64" height="64" /></button>
        <div><p><i /> COSMIC RADIO</p><strong>{track.title}</strong><small>{track.artist}</small></div>
      </div>
      <label className="cosmic-radio-track">
        <span className="sr-only">Choose a mix</span>
        <select value={mixId} onChange={(event) => play(0, event.target.value as MixId)} aria-label="Choose a radio mix">
          {Object.entries(MIXES).map(([id, mix]) => <option key={id} value={id}>{mix.title}</option>)}
        </select>
      </label>
      <label className="cosmic-radio-track"><span className="sr-only">Choose a track</span><select value={index} onChange={(event) => play(Number(event.target.value))} aria-label="Choose a radio track">{tracks.map((item, itemIndex) => <option key={item.number} value={itemIndex}>{String(itemIndex + 1).padStart(2, "0")} · {item.title}</option>)}</select></label>
      <div className="cosmic-radio-controls">
        <button type="button" onClick={() => skip(-1)} aria-label="Previous track">◀</button>
        <button type="button" className="cosmic-radio-play" onClick={() => (active ? pause() : play())} aria-label={active ? "Pause music" : "Play music"}>{active ? "Ⅱ" : "▶"}</button>
        <button type="button" onClick={() => skip(1)} aria-label="Next track">▶</button>
        <label className="cosmic-radio-volume"><span aria-hidden="true">VOL</span><input type="range" min="0" max="100" step="1" value={Math.round(volume * 100)} onChange={(event) => changeVolume(Number(event.target.value) / 100)} aria-label="Radio volume" /></label>
      </div>
      <p className={`cosmic-radio-status${status === "error" ? " is-error" : ""}`} role="status">{status === "error" ? "Couldn’t tune in — press play to retry." : status === "loading" ? "Tuning in…" : status === "playing" ? `Playing ${String(index + 1).padStart(2, "0")} / ${tracks.length}` : status === "paused" ? "Paused." : "Pick a track or press play."}</p>
    </aside>
  );
}
