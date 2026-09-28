import {interpolate, spring} from 'remotion';
import {script, theme} from './content';

const fps = script.video.fps;

/** Rauhallinen sisääntulo 0 → 1 alkaen framesta `alku`. Ei ylitystä eikä vilkkumista. */
export const sisaan = (frame: number, alku: number, kestoSek = theme.animaatio.sisaantuloSek) =>
  spring({frame: frame - alku, fps, config: {damping: 200}, durationInFrames: Math.round(kestoSek * fps)});

/** Lineaarinen siirtymä 0 → 1 välillä [alku, alku + kesto]. */
export const siirtyma = (frame: number, alku: number, kestoFrames: number) =>
  interpolate(frame, [alku, alku + kestoFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

export const sekunteina = (s: number) => Math.round(s * fps);
