# Northern House — northernhouse.nl

Website voor een Nederlands timmer- en houtbewerkingsbedrijf. Statische site,
gehost op GitHub Pages, bereikbaar op **https://northernhouse.nl**.

De teksten en foto's zijn Nederlandstalig en nog niet aangeleverd; deze repo
bevat op dit moment alleen de mapstructuur daarvoor.

## Status

| Onderdeel | Status |
| --- | --- |
| Structuur (`assets/`, `texts/`) | aanwezig |
| Teksten | nog niet aangeleverd |
| Foto's | nog niet aangeleverd |
| Astro-project (code) | nog niet opgezet |
| Repository op GitHub | ✅ https://github.com/robreim/northernhouse |
| DNS naar GitHub Pages | ✅ omgezet, gecontroleerd via `dig` |
| Pages-site + custom domein | ✅ gekoppeld |
| HTTPS-certificaat | ✅ goedgekeurd (dekt apex én www) |
| Enforce HTTPS | nog aanzetten |
| Workflowbestand | nog niet aanwezig — dus nog geen deploy |
| Domeinverificatie (TXT) | nog niet gedaan; beveiliging, geen voorwaarde |

## Structuur

```
assets/gallery/   projectfoto's (worden de projectgalerij)
assets/other/     overige beelden (hero, portret, detail, logo)
texts/            Nederlandstalige copy, één bestand per pagina/sectie
```

Zodra het Astro-project staat, verhuizen `assets/` en `texts/` naar de
gebruikelijke plekken (`src/assets/`, `src/content/`) en wordt de inhoud via
content collections ingelezen: één markdownbestand per project, zodat een
project toevoegen één bestand toevoegen is.

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
- **Contact:** telefoon en e-mail als `tel:`/`mailto:` links. Een echt
  formulier vereist een externe dienst en is voor v1 niet nodig.

## Development

```bash
npm install
npm run dev      # http://localhost:4321
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

## Nog te doen

- [ ] Astro-project opzetten (config, Tailwind, layout, componenten)
- [ ] Workflowbestand toevoegen (zonder `package.json` kan de build niet lopen)
- [ ] **Enforce HTTPS** aanzetten in Settings → Pages
- [ ] Domein verifiëren via https://github.com/settings/pages (beveiliging)
- [ ] Teksten aanleveren in `texts/` en verwerken
- [ ] Foto's aanleveren in `assets/` en verwerken
- [ ] Content collections voor projecten opzetten
- [ ] Favicon en social-preview-afbeelding (og:image) toevoegen
- [ ] `robots.txt` + sitemap
- [ ] Repo aanmaken, Pages aanzetten, DNS omzetten
