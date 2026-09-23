# Het beheerformulier aanzetten (`/admin`)

Eenmalige opzet, ongeveer een kwartier. Daarna kan de beheerder van de site via
**https://northernhouse.nl/admin** teksten wijzigen en foto's toevoegen en
weghalen, zonder ontwikkelaar.

Zonder deze stappen is `/admin` wel bereikbaar, maar werkt de knop *Inloggen met
GitHub* niet: GitHub staat geen login toe vanuit een statische pagina. Daarvoor
is een klein tussenstukje nodig (een Cloudflare Worker).

Nodig: een gratis Cloudflare-account en toegang tot de GitHub-repo.

## 1. De OAuth-worker deployen

1. Ga naar **https://github.com/sveltia/sveltia-cms-auth**
2. Klik op **Deploy to Cloudflare Workers**
3. Doorloop de stappen; Cloudflare maakt de worker aan

Alternatief via de terminal: de repo clonen en `wrangler deploy`.

Open daarna in Cloudflare het dashboard → **Workers & Pages** → `sveltia-cms-auth`.
De URL staat bovenaan en ziet er zo uit:

```
https://sveltia-cms-auth.jouwnaam.workers.dev
```

Bewaar die URL; hij is in stap 3 en 4 nodig.

## 2. Een GitHub OAuth-app registreren

Ga naar **https://github.com/settings/applications/new** en vul in:

| Veld | Waarde |
| --- | --- |
| Application name | `Sveltia CMS Authenticator` |
| Homepage URL | `https://northernhouse.nl` |
| Authorization callback URL | `<worker-url>/callback` |

De callback is de worker-URL **plus `/callback`**, bijvoorbeeld
`https://sveltia-cms-auth.jouwnaam.workers.dev/callback`. Let op: zonder
`/callback` geeft GitHub later `redirect_uri_mismatch`.

Klik op **Register application** en daarna op **Generate a new client secret**.
Je hebt nu een **Client ID** en een **Client Secret** nodig voor de volgende stap.

## 3. De worker instellen

Cloudflare → de worker → **Settings** → **Variables and Secrets**:

| Naam | Waarde | Let op |
| --- | --- | --- |
| `GITHUB_CLIENT_ID` | uit stap 2 | |
| `GITHUB_CLIENT_SECRET` | uit stap 2 | op **Encrypt** klikken |
| `ALLOWED_DOMAINS` | `northernhouse.nl, *.northernhouse.nl` | zie hieronder |

`ALLOWED_DOMAINS` is technisch optioneel, maar **niet overslaan**: het voorkomt
dat een andere site jouw worker als gratis GitHub-login gebruikt, en dat iemand
via die weg een toegangstoken krijgt. Meerdere waarden mogen, gescheiden door
komma's; `*.` dekt ook `www`.

Daarna de worker opslaan/deployen.

## 4. Het formulier naar de worker laten wijzen

In `public/admin/config.yml`, bij `backend` (regel 14) staat nog een
placeholder. Vervang die door de worker-URL:

```yaml
backend:
  name: github
  repo: robreim/northernhouse
  base_url: https://sveltia-cms-auth.jouwnaam.workers.dev
```

Committen en pushen:

```bash
git add public/admin/config.yml
git commit -m "chore: point the CMS at the OAuth worker"
git push
```

Na de deploy (ongeveer een minuut) is `/admin` bruikbaar.

## 5. De beheerder toegang geven

De beheerder heeft een **GitHub-account met schrijftoegang** tot
`robreim/northernhouse` nodig:

Repo → **Settings** → **Collaborators** → **Add people** → gebruikersnaam, rol
**Write**.

Let op: bij een publieke repo geeft Write ook toegang tot de code, niet alleen
tot de inhoud. Het formulier zelf toont alleen tekst- en fotovelden, maar via
GitHub kan deze persoon meer. Is dat niet gewenst, dan zijn de opties: de repo
privé maken (GitHub Pages vereist dan een betaald plan) of accepteren.

## 6. Testen

1. Ga naar **https://northernhouse.nl/admin/**
2. **Inloggen met GitHub** → goedkeuren
3. Open een project, wijzig een woord, klik **Opslaan**
4. Kijk in de repo bij **Actions**: er start meteen een deploy. Na ongeveer
   een minuut staat de wijziging online
5. Test daarna een foto: voeg er een toe, controleer of hij in de juiste map
   `src/assets/projecten/<project>/` belandt, en of hij op de site staat

## Eerst zelf droog oefenen (aanbevolen)

Test het formulier één keer lokaal, dan raak je de live site niet:

```bash
npm run dev
```

Open **http://localhost:4321/admin/index.html** in Chrome (of Edge/Brave) →
**Werken met een lokale repository** → kies de projectmap → pas iets aan.
Bekijk daarna `git diff` en gooi de wijziging weg met `git checkout .`

Dit werkt alleen in Chromium-browsers (Chrome, Edge, Brave); Firefox en Safari
ondersteunen de benodigde bestandstoegang niet.

## Wat de beheerder wel en niet kan

Wel: alle teksten, foto's toevoegen en weghalen, de volgorde van foto's en van
projecten op de homepage.

Niet: de opbouw van de pagina's, de vormgeving, de navigatie. Die staan in de
Astro-code. Er is dus geen knop die de site kan slopen.

Een nieuw project toevoegen blijft handwerk voor de websitebouwer; zie de README,
sectie *Beheer (/admin) → Een nieuw project toevoegen*.

## Als er iets misgaat

| Klacht | Oorzaak |
| --- | --- |
| Inlogknop doet niets, of fout na goedkeuren | `base_url` komt niet exact overeen met de worker-URL, of `/callback` ontbreekt in de GitHub-app |
| GitHub meldt `redirect_uri_mismatch` | De callback-URL in de GitHub-app is niet `<worker-url>/callback` |
| `/admin` geeft een lege pagina of 404 | De map `public/admin/` zat niet in de deploy; kijk in de Actions-log of `dist/admin/` bestaat |
| Opslaan lukt, maar de site verandert niet | De build is mislukt. Kijk bij **Actions**; draai `npm run check-content` voor de reden |
| Beheerder ziet geen projecten | Geen Write-toegang op de repo (stap 5) |

Een mislukte build laat de vorige versie van de site staan: de wijziging komt
dan niet online, maar er breekt ook niets. Alles staat in git, dus een verkeerde
wijziging is terug te draaien met `git revert <commit>`.

## Beveiliging, kort

- `/admin` is openbaar op te vragen. Er staat niets geheims in: alleen de
  repo-naam en veldnamen. Zonder GitHub-account met schrijftoegang kom je niet
  verder dan het inlogscherm.
- De pagina staat op `noindex` en `/admin/` staat in `robots.txt`.
- De CMS-configuratie is per definitie publiek; zet er nooit sleutels in. De
  Web3Forms-key staat daarom in `src/config.ts` en niet hier.
- De Cloudflare Worker is het enige onderdeel dat geheimen bevat
  (`GITHUB_CLIENT_SECRET`), en die staat versleuteld in Cloudflare.

## Technisch, voor de websitebouwer

- Het formulier is **Sveltia CMS** (MIT, één JavaScript-bestand via unpkg). Het
  is geen dependency in `package.json` en er is geen server of database.
- Opslaan = een commit naar `main` = een nieuwe deploy via GitHub Actions.
  `publish_mode: simple`, dus geen concepten of pull requests.
- Bij het uploaden verkleint het formulier foto's in de browser, zet ze om naar
  webp (kwaliteit 82, max 2048 px) en slaat ze op in de map van dat project.
  Zonder dat loopt de repo vol met telefoonfoto's van enkele MB's per stuk.
- Bij het laden van `/admin` controleert Sveltia de configuratie tegen zijn eigen
  JSON-schema en meldt fouten in de browserconsole. Zet in VS Code de
  YAML-extensie aan; dan zie je die fouten al bij het typen (via de
  `$schema`-regel bovenaan `config.yml`).
- Vóór elke build draait `scripts/check-content.mjs`. Dat controleert of de
  databestanden, de foto's en de CMS-configuratie bij elkaar passen en stopt de
  build met een leesbare melding als er iets ontbreekt.
