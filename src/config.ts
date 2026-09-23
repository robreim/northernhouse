/**
 * Sitebrede gegevens. De inhoud staat in `src/data/` en is te bewerken via
 * `/admin` (Sveltia CMS). Dit bestand is alleen het doorgeefluik.
 */
import bedanktData from './data/bedankt.json';
import dienstenData from './data/diensten.json';
import homeData from './data/home.json';
import pimData from './data/pim.json';
import siteData from './data/site.json';

export const SITE = siteData;
export const HOME = homeData;
export const DIENSTEN = dienstenData.teksten;
export const PIM = pimData;
export const BEDANKT = bedanktData.teksten;

export interface Project {
  slug: string;
  /** Volgorde op de homepage; lager getal staat vooraan. */
  volgorde: number;
  label: string;
  tekst: string;
  cover: string;
  alt: string;
  /** Alle foto's van de projectpagina, in deze volgorde. */
  fotos: { foto: string; alt: string }[];
}

// Elk project heeft een eigen bestand in `src/data/projecten/`. De volgorde op
// de homepage komt uit het veld `volgorde`, niet uit de bestandsnaam.
const projectBestanden = import.meta.glob<Project>('./data/projecten/*.json', {
  eager: true,
  import: 'default',
});

export const PROJECTEN: Project[] = Object.values(projectBestanden).sort(
  (a, b) => a.volgorde - b.volgorde
);

/**
 * Web3Forms access key — vraag hem aan op https://web3forms.com met het
 * e-mailadres waar de berichten naartoe moeten. De key is bedoeld om publiek
 * in de HTML te staan; hij bepaalt alleen waar het bericht heen gaat.
 */
export const FORM_ACCESS_KEY = '[web3forms-access-key]';

/** Ankers beginnen met `/` zodat ze ook vanaf andere pagina's werken. */
export const NAV = [
  { href: '/#projecten', label: 'Projecten' },
  { href: '/#diensten', label: 'Diensten' },
  { href: '/#over', label: 'Over' },
  { href: '/pim', label: 'Over Pim' },
] as const;
