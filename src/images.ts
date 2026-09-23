import type { ImageMetadata } from 'astro';

const alle = import.meta.glob<{ default: ImageMetadata }>(
  // webp staat erbij omdat het beheerformulier foto's omzet naar webp.
  '/src/assets/**/*.{jpg,jpeg,png,webp,avif}',
  { eager: true }
);

/**
 * Pad uit `src/data/*.json` naar een sleutel in de lijst hierboven. Accepteert
 * zowel `projecten/overkapping/01.jpg` als `/src/assets/projecten/overkapping/01.jpg`,
 * zodat het niet uitmaakt welke van de twee het beheerformulier wegschrijft.
 */
function sleutel(pad: string): string {
  return `/src/assets/${pad.replace(/^\/?src\/assets\//, '').replace(/^\/+/, '')}`;
}

/** Eén foto op pad, relatief aan `src/assets/`. Faalt bij bouwen als hij ontbreekt. */
export function foto(pad: string): ImageMetadata {
  const m = alle[sleutel(pad)];
  if (!m) {
    throw new Error(
      `Foto niet gevonden: src/assets/${pad}\n` +
        `Staat de foto in die map, en klopt het pad in src/data/?`
    );
  }
  return m.default;
}
