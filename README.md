# Northern House — northernhouse.nl

Website voor een Nederlands timmer- en houtbewerkingsbedrijf. Statische site,
gehost op GitHub Pages, bereikbaar op **https://northernhouse.nl**.

De site staat live. De teksten en foto's zijn nog niet aangeleverd: overal
staan placeholders tussen `[ ]`, en de fotoplekken zijn zichtbaar gearceerde
vlakken met een label dat zegt welke foto er hoort.

## Status

| Onderdeel | Status |
| --- | --- |
| Structuur (`src/data/`, `src/assets/`) | ✅ inhoud staat buiten de code |
| Teksten | ✅ in `src/data/*.json`, te bewerken via `/admin` |
| Foto's | ✅ in `src/assets/`, te beheren via `/admin` |
| Beheerpagina (`/admin`) | ✅ ingericht, wacht op de Cloudflare Worker-URL |
| Inhoudscontrole vóór builds | ✅ `scripts/check-content.mjs`, draait in `npm run build` |
| Astro-project (code) | ✅ opgezet |
| Contactformulier | ✅ werkt, wacht op de Web3Forms key |
| Repository op GitHub | ✅ https://github.com/robreim/northernhouse |
| DNS naar GitHub Pages | ✅ omgezet, gecontroleerd via `dig` |
| Pages-site + custom domein | ✅ gekoppeld |
| HTTPS-certificaat | ✅ goedgekeurd (dekt apex én www) |
| Enforce HTTPS | ✅ aan |
| Workflowbestand | ✅ `.github/workflows/deploy.yml`, deployt bij push naar `main` |
| Live | ✅ https://northernhouse.nl (200), `www` en `http` redirecten |
| Domeinverificatie (TXT) | nog niet gedaan; beveiliging, geen voorwaarde |

## Structuur

```
src/data/                     alle teksten, één JSON-bestand per pagina/sectie
src/data/projecten/           één bestand per project (tekst + fotolijst)
src/assets/projecten/<slug>/  foto's per project
src/assets/site/              hero en de foto bij "Over"
src/assets/pim/               foto's op de Pim-pagina
src/config.ts                 leest src/data/ in; hier komt de rest van de code bijeen
public/admin/                 het beheerformulier (/admin)
scripts/check-content.mjs     controleert de inhoud vóór het bouwen
```

De inhoud staat bewust **buiten** de code, in `src/data/*.json`, zodat het
beheerformulier erbij kan zonder Astro-code aan te raken. Een tekst wijzigen
kan dus ook door het JSON-bestand aan te passen.

Foto's worden niet in de JSON opgeslagen maar erin *genoemd*, als pad vanaf
`src/assets/` (bijvoorbeeld `projecten/pergola/01.jpg`). Een projectpagina
toont precies de foto's uit de lijst `fotos` in dat bestand: een foto die daar
niet in staat, staat ook niet op de site. Dat is wat het mogelijk maakt om via
het formulier een foto weg te halen, en om per foto een omschrijving en een
volgorde te bewaren.

`assets/` in de root is een verzameling ruwe originelen die de site niet
gebruikt en die ook niet in git zitten; die kun je weggooien of bewaren als
archief. Zie verder [Beheer (/admin)](#beheer-admin).

## Uitgangspunten

- **Taal:** alleen Nederlands. Geen i18n; later toe te voegen als het echt
  nodig is (patroon daarvoor staat in `rob-reimert-me`).
- **Stack:** Astro (statische output) + Tailwind CSS v4 via
  `@tailwindcss/vite`. Zelfde opzet als `rob-reimert-me`, dus bekend terrein.
- **Opzet v1:** één lange pagina — hero, diensten, projecten, over, contact.
  Uitbreiden naar losse pagina's kan later zonder de opzet om te gooien.
- **Vormgeving:** full-bleed fotografie, warme houttinten, royale witruimte,
  rustige typografie. Inspiratie:
  [gelderschehoutbouw.nl](https://www.gelderschehoutbouw.nl/) (hero + tegelgrid
  per categorie) en
  [derestauratietimmerman.nl](https://www.derestauratietimmerman.nl/) (ambacht,
  restauratie, verhalende fotografie).
- **Contact:** géén telefoonnummer, e-mailadres, KVK- of btw-nummer op de
  site. Bezoekers gebruiken het contactformulier (Web3Forms). Zie de sectie
  [Contactformulier](#contactformulier).

## Development

```bash
npm install
npm run dev      # http://localhost:4321 (wijkt af als het poortnummer bezet is)
npm run build    # statische output in dist/
npm run preview  # productiebuild lokaal bekijken
```

`astro.config.mjs` moet voor GitHub Pages twee dingen goed hebben:

```js
export default defineConfig({
  site: 'https://northernhouse.nl',
  // geen `base`: bij een eigen domein staat de site op de root
});
```

## Hosten op GitHub Pages

### 1. Repository aanmaken en pushen

De repo heet `northernhouse` (de naam van de repo bepaalt alleen het
GitHub-adres, niet het uiteindelijke domein — bij een eigen domein is `base`
niet nodig).

```bash
git init
git add .
git commit -m "Start Northern House site"
gh repo create robreim/northernhouse --public --source=. --push
```

### 2. Pages inschakelen via GitHub Actions

In de repo: **Settings → Pages → Build and deployment → Source: GitHub
Actions**. Klik daarna op **Configure** bij de Astro-starterworkflow; die
bouwt met `npm run build` en publiceert `dist/`. Handmatig hetzelfde bestand
neerzetten kan ook:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: withastro/action@v6

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

### 3. CNAME-bestand toevoegen

Zet een bestand `public/CNAME` met één regel:

```
northernhouse.nl
```

Astro kopieert alles uit `public/` naar `dist/`, dus dit bestand komt
automatisch in de gepubliceerde output. Zonder dit bestand vergeet GitHub
Pages het eigen domein bij elke deploy.

### 4. Eigen domein koppelen ✅ gedaan

**Settings → Pages → Custom domain** → `northernhouse.nl` → **Save**.

Dit is al gebeurd: de Pages-site bestaat, het custom domein staat op
`northernhouse.nl`, en het HTTPS-certificaat is goedgekeurd. Zet in dezelfde
sectie nog **Enforce HTTPS** aan.

Let op: dit is **iets anders** dan domeinverificatie. Verificatie zit *niet*
hier, maar op profielniveau — zie hieronder.

### 4b. Domein verifiëren (apart, op profielniveau)

Verificatie staat **niet** in de repo-instellingen. GitHub zegt letterlijk:
"Domain verification happens at the profile level" en "Domain verification
doesn't take place in repository settings." Daarom is er in **Settings →
Pages** van de repo geen TXT-record te zien.

Waar wel:

1. Ga naar **https://github.com/settings/pages**
   (of: profielfoto → **Settings** → in de zijbalk onder "Code, planning and
   automation" → **Pages**).
2. Klik op **Add a domain**.
3. Vul `northernhouse.nl` in → **Add domain**.
4. Nu verschijnt het TXT-record: naam
   `_github-pages-challenge-robreim.northernhouse.nl` met een lange
   hexadecimale waarde. Neem die **exact** over bij mijndomein.
5. Wachten (direct tot 24 uur), dan op **Verify** klikken.

Waarom dit los staat: verificatie voorkomt dat iemand anders jouw domein aan
*zijn* GitHub-account koppelt en er een eigen site op publiceert. Het is
beveiliging, **geen voorwaarde** voor het werken van de site. Laat het
TXT-record daarna staan, anders vervalt de verificatie.

Bij een organisatie-account is de recordnaam
`_github-pages-challenge-<organisatie>` in plaats van `-robreim`.

### 5. DNS omzetten bij mijndomein.nl

`northernhouse.nl` gebruikt de nameservers `nsn1.mijndomein.nl` en
`nsn2.mijndomein.nl`, dus de DNS beheer je in het mijndomein/TransIP-paneel
onder **Domeinen → northernhouse.nl → DNS**.

Huidige situatie (gecontroleerd via `dig`):

| Type | Naam | Huidige waarde | Actie |
| --- | --- | --- | --- |
| A | `@` | `213.249.67.10` | vervangen |
| AAAA | `@` | `2a01:448:2001::10` | vervangen |
| A | `www` | `213.249.67.10` + AAAA | verwijderen, wordt CNAME |
| MX | `@` | *geen* | niets doen |
| TXT | `@` | `v=spf1 a mx include:spf.mijndomeinhosting.nl -all` | laten staan |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; ...` | laten staan |

Gewenste situatie:

| Type | Naam | Waarde | TTL |
| --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | 300 |
| A | `@` | `185.199.109.153` | 300 |
| A | `@` | `185.199.110.153` | 300 |
| A | `@` | `185.199.111.153` | 300 |
| AAAA | `@` | `2606:50c0:8000::153` | 300 |
| AAAA | `@` | `2606:50c0:8001::153` | 300 |
| AAAA | `@` | `2606:50c0:8002::153` | 300 |
| AAAA | `@` | `2606:50c0:8003::153` | 300 |
| CNAME | `www` | `robreim.github.io` | 300 |
| TXT | `_github-pages-challenge-robreim` | *waarde uit https://github.com/settings/pages* | 300 |

Let op:

- De CNAME voor `www` wijst naar `robreim.github.io`, **zonder** repositorynaam
  erachter.
- Alle vier de A-records en alle vier de AAAA-records toevoegen, niet één.
- Zet de TTL vóór een volgende omzetting een dag vooraf op 300 seconden, dan
  is de overgang snel.
- Zet je het CNAME-record voor `www` neer terwijl daar nog A-records staan,
  dan werkt het niet: eerst de oude `www`-records verwijderen.

### 6. Controleren

```bash
dig +short A northernhouse.nl        # moet de vier 185.199.x.153 adressen geven
dig +short AAAA northernhouse.nl     # moet de vier 2606:50c0:800x::153 adressen geven
dig +short CNAME www.northernhouse.nl
curl -sI https://northernhouse.nl | head -1   # verwacht: HTTP/2 200
```

### E-mail

Er staat op dit moment **geen MX-record** op het domein, dus er wordt geen
e-mail ontvangen op `@northernhouse.nl`. Het omzetten van de A-records breekt
dus geen mail.

Wil je later wel mail, regel dat dan als aparte dienst en zet de MX op de
mailserver van die dienst — niet op het hoofddomein, want dat A-record wijst
naar GitHub Pages. Laat de SPF- en DMARC-TXT-records staan; die beschermen het
domein tegen misbruik en zijn zo weer bruikbaar.

## Contactformulier

Het formulier post naar Web3Forms, dat het bericht doorstuurt naar het
e-mailadres dat bij de access key hoort. Geen eigen backend nodig, en het
adres staat nergens in de HTML.

### Verplicht invullen

In `src/config.ts` staat nog een placeholder:

```ts
export const FORM_ACCESS_KEY = '[web3forms-access-key]';
```

**Zolang die placeholder er staat, komt er geen enkel bericht aan.** Web3Forms
geeft een fout terug en de bezoeker ziet "Versturen lukte niet. Probeer het
later nog eens." Het formulier lijkt dan te werken, maar er verdwijnt een
bericht. Vraag een key aan op https://web3forms.com met het adres waar de
berichten naartoe moeten, en plak hem hier.

### Hoe het werkt

- `src/components/ContactForm.astro` — het formulier zelf, met een
  spamblok-veld (`botcheck`) dat voor mensen onzichtbaar is.
- Werkt **zonder JavaScript**: gewone POST, waarna de bezoeker op `/bedankt`
  landt (`src/pages/bedankt.astro`). Met JavaScript blijft hij op de pagina en
  ziet de status inline.
- De key is bedoeld om publiek te zijn: hij bepaalt alleen waar het bericht
  heen gaat. Niet in een env var stoppen, dan werkt de statische build niet.
- Gratis tot 250 berichten per maand.

### Let op: wettelijke informatieplicht

De ACM noemt een **e-mailadres en telefoonnummer** verplichte gegevens op een
bedrijfswebsite (art. 3:15d BW), en noemt een contactformulier **niet** als
geldig alternatief. Verkoop of lever je diensten via internet, dan komen
**KVK-nummer en btw-id** er ook bij. Een colofon op `/colofon` — niet gelinkt
in menu of footer, op `noindex` — is de gangbare oplossing. Nog niet gedaan.

## Beheer (/admin)

Op **https://northernhouse.nl/admin** staat een formulier waarmee de
beheerder teksten kan wijzigen en foto's kan toevoegen en weghalen. Er is geen
database en geen server: het formulier schrijft rechtstreeks in de bestanden
van deze repo, GitHub bouwt de site opnieuw, en binnen ongeveer een minuut staat
de wijziging live. Zonder op **Opslaan** te drukken verandert er niets.

De beheerder kan alleen de inhoud aanraken — teksten en foto's. De opbouw van
de pagina's, de vormgeving en de navigatie zitten in de Astro-code en zijn via
het formulier niet te wijzigen. Dat is bewust: er is geen knop die de site kan
slopen.

### Eenmalig opzetten (alleen de websitebouwer)

Het formulier gebruikt [Sveltia CMS](https://sveltiacms.app) (MIT, één
JavaScript-bestand, geen dependency in `package.json`). De login loopt via een
kleine Cloudflare Worker die de GitHub-login afhandelt.

1. **Worker deployen.** Ga naar
   https://github.com/sveltia/sveltia-cms-auth en klik op *Deploy to Cloudflare
   Workers*. (Alternatief: clonen en `wrangler deploy`.)
2. **Worker-URL noteren**, bijvoorbeeld
   `https://sveltia-cms-auth.jouwnaam.workers.dev`.
3. **GitHub OAuth-app registreren** op https://github.com/settings/applications/new:
   - Application name: `Sveltia CMS Authenticator`
   - Homepage URL: `https://northernhouse.nl`
   - Authorization callback URL: `<WORKER-URL>/callback`
   Klik daarna op *Generate a new client secret*.
4. **Worker instellen.** Cloudflare → de worker → *Settings* → *Variables*:
   - `GITHUB_CLIENT_ID` = de Client ID
   - `GITHUB_CLIENT_SECRET` = de Client Secret (op *Encrypt* klikken)
   - `ALLOWED_DOMAINS` = `northernhouse.nl, *.northernhouse.nl`, zodat alleen
     deze site de worker kan gebruiken.
5. **`base_url` invullen** in `public/admin/config.yml`, bij `backend`:

   ```yaml
   base_url: https://sveltia-cms-auth.jouwnaam.workers.dev
   ```

   Nu staat er nog een placeholder met `<JOUW-SUBDOMEIN>`; die moet weg.
   Committen en pushen, daarna is `/admin` bruikbaar.

### Wat de beheerder ziet

- **Teksten** — Algemeen, Homepage, Diensten, Over Pim, Bedankt.
- **Projecten** — één blok per project met titel, omschrijving, de foto op de
  homepage en de fotolijst van dat project. Foto's toevoegen, weghalen en
  slepen om de volgorde te bepalen.
- **Fotomappen** (in het foto-venster) — Alle projectfoto's, Algemene foto's,
  Foto's Over Pim: om een map op te ruimen zonder een projecttekst te openen.

Alle invoervelden zijn in het Nederlands; de opmaak van het formulier komt van
Sveltia zelf.

### Twee dingen om te weten

- **Foto's worden automatisch verkleind.** Bij het uploaden zet het formulier
  foto's om naar webp en verkleint ze tot maximaal 2048 px (kwaliteit 82). Dat
  staat in `config.yml` onder `media_libraries`. Zonder dat loopt de repo vol:
  een foto van een moderne telefoon is zo 5 MB, en GitHub Pages bouwt elke
  deploy opnieuw.
- **De repo is publiek, `/admin` dus ook.** Er staat niets geheims in: alleen de
  repo-naam en veldnamen. Zonder GitHub-account met schrijftoegang kom je niet
  verder dan het inlogscherm. `/admin/` staat op `noindex` en in `robots.txt`.

### Als er iets misgaat

- **Wijziging niet zichtbaar?** Kijk bij *Actions* in de repo. Een gebroken
  build laat de vorige versie van de site staan; de wijziging komt dan niet
  online. Draai `npm run check-content` voor de reden.
- **Iets verkeerd aangepast?** Alles is git: `git revert <commit>` of het
  bestand terughalen uit de geschiedenis. Zeg het tegen de websitebouwer.
- **Foto per ongeluk weg?** Zelfde: de foto staat nog in de git-geschiedenis.
- **Formulier helemaal leeg of foutmelding bij inloggen?** Meestal de worker of
  `base_url`. Test de worker-URL in de browser; die hoort een klein bericht te
  geven, geen foutpagina.
- **Formulier mist een veld of een veld doet niets?** Meestal een typefout in
  `public/admin/config.yml`. `npm run check-content` controleert dat, en in
  VS Code met de YAML-extensie zie je het al bij het typen (via de
  schema-regel bovenaan het bestand).

### Een nieuw project toevoegen

Dat is nog een klein klusje voor de websitebouwer, geen knop in het formulier:

1. Maak `src/assets/projecten/<slug>/` aan en zet de foto's erin.
2. Kopieer een bestaand `src/data/projecten/*.json` naar `<slug>.json` en vul
   `slug`, `label`, `tekst`, `cover`, `alt`, `volgorde` en de fotolijst in.
3. Zet in `public/admin/config.yml` onder *Projecten* een blok bij, met
   `media_folder: /src/assets/projecten/<slug>`. Het makkelijkst is een
   bestaand blok kopiëren en de naam, het label en het pad aanpassen.
4. `npm run check-content` — dat script controleert of de bestanden, de foto's
   en de CMS-blokken bij elkaar passen en zegt precies wat er ontbreekt.

## Nog te doen

- [ ] **Web3Forms access key invullen** in `src/config.ts` (zie hierboven)
- [ ] **Beheerformulier activeren:** Cloudflare Worker opzetten en de URL in
      `public/admin/config.yml` zetten (zie [Beheer (/admin)](#beheer-admin))
- [ ] Beheerder laten inloggen, samen één foto toevoegen en één weghalen
- [ ] Overwegen: colofon op `/colofon` wegens de wettelijke informatieplicht
- [ ] Domein verifiëren via https://github.com/settings/pages (beveiliging)
- [ ] Social-preview-afbeelding (og:image) toevoegen
- [ ] Favicon vervangen door het echte logo
- [ ] `assets/` in de root bekijken: 62 ongebruikte originelen (73 MB), niet in git
- [ ] `@astrojs/sitemap` toevoegen zodra er meerdere pagina's zijn
