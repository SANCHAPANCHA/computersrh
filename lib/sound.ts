"use client";

// Tiny WebAudio blips — no audio files, muted by default.
type Sfx = "click" | "select" | "error" | "boot" | "success" | "like";

const KEY = "rhpclab:sfx";
let ctx: AudioContext | null = null;
const listeners = new Set<(on: boolean) => void>();

export function isSoundOn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "on";
}

export function setSoundOn(on: boolean) {
  localStorage.setItem(KEY, on ? "on" : "off");
  listeners.forEach((l) => l(on));
  if (on) play("select");
}

export function onSoundChange(fn: (on: boolean) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const PATTERNS: Record<Sfx, [number, number][]> = {
  click: [[660, 0.03]],
  select: [[520, 0.04], [880, 0.05]],
  error: [[220, 0.08], [160, 0.12]],
  boot: [[330, 0.05], [440, 0.05], [660, 0.08]],
  success: [[523, 0.07], [659, 0.07], [784, 0.07], [1046, 0.14]],
  like: [[880, 0.04], [1320, 0.06]],
};

export function play(sfx: Sfx) {
  if (!isSoundOn()) return;
  try {
    ctx ??= new AudioContext();
    let t = ctx.currentTime;
    for (const [freq, dur] of PATTERNS[sfx]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.035, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    }
  } catch {
    // Audio unavailable — stay silent.
  }
}
