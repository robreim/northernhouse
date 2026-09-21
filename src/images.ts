import type { ImageMetadata } from 'astro';

const alle = import.meta.glob<{ default: ImageMetadata }>('/src/assets/**/*.jpg', {
  eager: true,
});

/** Eén foto op pad, relatief aan `src/assets/`. Faalt bij bouwen als hij ontbreekt. */
export function foto(pad: string): ImageMetadata {
  const m = alle[`/src/assets/${pad}`];
  if (!m) throw new Error(`Foto niet gevonden: src/assets/${pad}`);
  return m.default;
}

/** Alle foto's van een project, op bestandsnaam gesorteerd. */
export function projectFotos(slug: string): ImageMetadata[] {
  const voorvoegsel = `/src/assets/projecten/${slug}/`;
  return Object.keys(alle)
    .filter((k) => k.startsWith(voorvoegsel))
    .sort()
    .map((k) => alle[k].default);
}
