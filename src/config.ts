/**
 * Sitebrede gegevens. Pas hier aan; de rest van de site leest het hier vandaan.
 * Foto's staan in `src/assets/`; hier verwijzen we er met een pad naartoe.
 */
export const SITE = {
  naam: 'Northern House',
  tagline: 'Timmerman & houtbewerking',
  beschrijving:
    'Northern House maakt houtbouwconstructies en houten elementen voor gebouwen en buitenplaatsen, en verzorgt restauratietimmerwerk op de Veluwe.',
  regio: 'Grofweg de Veluwe',
} as const;

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

export const DIENSTEN = [
  {
    titel: 'Houtbouwconstructies',
    tekst:
      "Constructies van hout voor gebouwen en buitenplaatsen, zoals overkappingen en pergola's, met traditionele houtverbindingen.",
    foto: 'projecten/overkapping/02.jpg',
    alt: 'Houten hoekverbinding van een overkapping met pen-en-gatverbindingen',
  },
  {
    titel: 'Houten elementen',
    tekst:
      "Houten elementen voor gebouwen en buitenplaatsen, zoals schuttingen, poorten en pergola's, gemaakt voor de plek waar ze komen.",
    foto: 'projecten/pergola/04.jpg',
    alt: 'Hoekverbinding van een houten pergola tegen een blauwe lucht',
  },
  {
    titel: 'Restauratietimmerwerk',
    tekst:
      'Bij restauratietimmerwerk volgen we de restauratieladder en de uitvoeringsrichtlijnen voor monumentenzorg.',
    foto: 'projecten/houtrotreparatie/02.jpg',
    alt: 'Hersteld stuk hout onder een kozijn',
  },
  {
    titel: 'Houtrotreparatie en vernieuwen',
    tekst:
      'Houtrotreparatie en het vernieuwen van raamluiken, deuren en houten (constructie)delen, zodat wat goed is behouden blijft.',
    foto: 'projecten/vensterluik/01.jpg',
    alt: 'Raamluik met rood-wit motief naast een raam',
  },
] as const;

/**
 * Projecten per type werk. De foto's staan in `src/assets/projecten/<slug>/`;
 * elk project krijgt een eigen pagina met alle foto's uit die map.
 */
export const PROJECTEN = [
  {
    slug: 'overkapping',
    label: 'Overkapping',
    tekst:
      'Houten overkapping tegen de gevel, met korbeel-schoren en pen-en-gatverbindingen.',
    cover: 'projecten/overkapping/08.jpg',
    alt: 'Houten overkapping tegen een baksteengevel met zonnepanelen op het dak',
  },
  {
    slug: 'pergola',
    label: 'Pergola',
    tekst: 'Pergola als hoekconstructie in de tuin, met klimplanten tegen de schutting.',
    cover: 'projecten/pergola/01.jpg',
    alt: 'Houten pergola in een tuinhoek met bankje',
  },
  {
    slug: 'schutting',
    label: 'Schutting en poort',
    tekst: 'Zwart geschilderde schutting met bijpassende poort.',
    cover: 'projecten/schutting/02.jpg',
    alt: 'Zwarte houten poort naast een bakstenen muur',
  },
  {
    slug: 'vensterluik',
    label: 'Raamluiken',
    tekst: 'Raamluiken met een klassiek rood-wit motief.',
    cover: 'projecten/vensterluik/02.jpg',
    alt: 'Raam met twee luiken met rood-wit motief in een bakstenen gevel',
  },
  {
    slug: 'houtrotreparatie',
    label: 'Houtrotreparatie',
    tekst: 'Houtrot in een kozijn hersteld: het aangetaste hout is vervangen.',
    cover: 'projecten/houtrotreparatie/01.jpg',
    alt: 'Raamkozijn met een hersteld stuk hout onderin',
  },
] as const;
