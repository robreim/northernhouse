/**
 * Sitebrede gegevens. Pas hier aan; de rest van de site leest het hier vandaan.
 * Alles met [ ] erin is een placeholder.
 */
export const SITE = {
  naam: 'Northern House',
  tagline: 'Timmerman & houtbewerking',
  beschrijving:
    '[Korte omschrijving van het bedrijf in één zin — verschijnt in Google en bij delen.]',
  regio: '[werkgebied, bijv. regio Northern House]',
} as const;

/**
 * Web3Forms access key — vraag hem aan op https://web3forms.com met het
 * e-mailadres waar de berichten naartoe moeten. De key is bedoeld om publiek
 * in de HTML te staan; hij bepaalt alleen waar het bericht heen gaat.
 */
export const FORM_ACCESS_KEY = '[web3forms-access-key]';

export const NAV = [
  { href: '#projecten', label: 'Projecten' },
  { href: '#diensten', label: 'Diensten' },
  { href: '#over', label: 'Over' },
] as const;

export const DIENSTEN = [
  {
    titel: '[Dienst 1]',
    tekst:
      '[Beschrijf deze dienst in twee tot drie zinnen. Wat u doet, voor wie, en wat de klant ervan merkt.]',
    foto: 'Foto dienst 1',
  },
  {
    titel: '[Dienst 2]',
    tekst: '[Beschrijf deze dienst in twee tot drie zinnen.]',
    foto: 'Foto dienst 2',
  },
  {
    titel: '[Dienst 3]',
    tekst: '[Beschrijf deze dienst in twee tot drie zinnen.]',
    foto: 'Foto dienst 3',
  },
  {
    titel: '[Dienst 4]',
    tekst: '[Beschrijf deze dienst in twee tot drie zinnen.]',
    foto: 'Foto dienst 4',
  },
] as const;

/**
 * Projecten zijn nog niet bekend, dus 6 lege plekken met voorbeeldlabels.
 * Vervang label + tekst, en later `foto` door het echte beeld.
 */
export const PROJECTEN = [
  { label: 'Project 1', tekst: '[omschrijving]', jaar: '[jaar]' },
  { label: 'Project 2', tekst: '[omschrijving]', jaar: '[jaar]' },
  { label: 'Project 3', tekst: '[omschrijving]', jaar: '[jaar]' },
  { label: 'Project 4', tekst: '[omschrijving]', jaar: '[jaar]' },
  { label: 'Project 5', tekst: '[omschrijving]', jaar: '[jaar]' },
  { label: 'Project 6', tekst: '[omschrijving]', jaar: '[jaar]' },
] as const;
