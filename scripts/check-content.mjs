/**
 * Controleert de inhoud in `src/data/` en `public/admin/config.yml` vóór het
 * bouwen. De site zelf faalt ook zonder dit script — Astro gooit een fout bij
 * een ontbrekende foto — maar dan is de melding Engels en staat er geen
 * bestandsnaam bij. Dit script vertelt in één keer wat er mis is.
 *
 * Draaien: node scripts/check-content.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

const fouten = [];
const lees = (pad) => JSON.parse(readFileSync(pad, 'utf8'));

/** Leest een databestand en meldt kapotte JSON als fout in plaats van te crashen. */
const leesOfMeld = (pad) => {
  try {
    return lees(pad);
  } catch (fout) {
    fouten.push(`${pad}: geen geldige JSON — ${fout.message}`);
    return undefined;
  }
};

// 1. Alle foto's die in de data genoemd worden moeten bestaan.
const dataBestanden = readdirSync('src/data')
  .filter((f) => f.endsWith('.json'))
  .map((f) => join('src/data', f))
  .concat(
    readdirSync('src/data/projecten').map((f) => join('src/data/projecten', f))
  );

const scanPad = (pad) => pad.replace(/^\/?src\/assets\//, '').replace(/^\/+/, '');

const fotoPaden = [];
const verzamel = (waarde) => {
  if (Array.isArray(waarde)) return waarde.forEach(verzamel);
  if (waarde && typeof waarde === 'object') {
    for (const [sleutel, v] of Object.entries(waarde)) {
      // `foto` en `cover` zijn paden; `alt` is tekst.
      if ((sleutel === 'foto' || sleutel === 'cover') && typeof v === 'string') fotoPaden.push(v);
      else verzamel(v);
    }
  }
};

for (const bestand of dataBestanden) {
  if (!existsSync(bestand)) {
    fouten.push(`${bestand}: bestand ontbreekt`);
    continue;
  }
  const data = leesOfMeld(bestand);
  if (data) verzamel(data);
}

for (const pad of fotoPaden) {
  if (!existsSync(`src/assets/${scanPad(pad)}`)) {
    fouten.push(`foto ontbreekt: src/assets/${scanPad(pad)}`);
  }
}

// 2. Elk project moet een eigen fotomap én een eigen CMS-blok hebben, en de
//    slugs in de data moeten uniek zijn (de projectpagina's hangen eraan).
const slugs = [];
for (const bestand of readdirSync('src/data/projecten')) {
  const project = leesOfMeld(join('src/data/projecten', bestand));
  if (!project) continue;
  for (const veld of ['slug', 'label', 'tekst', 'cover', 'alt', 'volgorde', 'fotos']) {
    if (project[veld] === undefined) {
      fouten.push(`${bestand}: veld "${veld}" ontbreekt`);
    }
  }
  if (project.fotos?.length === 0) {
    fouten.push(`${bestand}: geen foto's; de projectpagina zou leeg zijn`);
  }
  if (!existsSync(`src/assets/projecten/${project.slug}`)) {
    fouten.push(`${bestand}: map src/assets/projecten/${project.slug}/ ontbreekt`);
  }
  slugs.push(project.slug);
}

const dubbel = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (dubbel.length) fouten.push(`dubbele project-slug: ${[...new Set(dubbel)].join(', ')}`);

// 3. Het CMS en de databestanden moeten precies bij elkaar passen: elk veld dat
//    het formulier bewerkt moet in de JSON bestaan en omgekeerd. Zonder deze
//    controle zie je een fout pas als iemand in het formulier opslaat.
const config = yaml.load(readFileSync('public/admin/config.yml', 'utf8'));

/**
 * Vergelijkt de velden uit het formulier met de JSON. Loopt de boom in, zodat
 * een veld binnen een object of lijst ook echt daar gezocht wordt — en niet
 * overal. Een lege lijst levert geen fouten op: de subvelden bestaan dan
 * eenvoudigweg nog niet.
 */
const vergelijk = (velden, data, pad) => {
  for (const veld of velden ?? []) {
    const waarde = data?.[veld.name];
    if (waarde === undefined) {
      fouten.push(`public/admin/config.yml: veld "${veld.name}" van ${pad} staat niet in het bestand`);
      continue;
    }
    if (Array.isArray(veld.fields)) {
      if (Array.isArray(waarde)) {
        waarde.forEach((item, i) => vergelijk(veld.fields, item, `${pad} → ${veld.name}[${i}]`));
      } else if (waarde && typeof waarde === 'object') {
        vergelijk(veld.fields, waarde, `${pad} → ${veld.name}`);
      }
    }
  }
};

const cms = new Map();
for (const file of (config.collections ?? []).flatMap((c) => c.files ?? [])) {
  cms.set(file.file, file.fields);
}
for (const bestand of dataBestanden) {
  if (!cms.has(bestand)) fouten.push(`public/admin/config.yml mist een blok voor ${bestand}`);
}
for (const [bestand, velden] of cms) {
  if (!existsSync(bestand)) {
    fouten.push(`public/admin/config.yml noemt een bestand dat niet bestaat: ${bestand}`);
    continue;
  }
  const data = leesOfMeld(bestand);
  if (!data) continue;
  vergelijk(velden, data, bestand);
}

// 4. Veldtypes die Sveltia niet kent. Onbekende *opties* meldt Sveltia zelf al
//    in de browserconsole (via zijn eigen JSON-schema), maar een typefout in
//    `widget` slikt het stil: dat veld verdwijnt dan uit het formulier zonder
//    melding. Vandaar alleen deze controle, niet de hele optielijst.
const widgets = [
  'string', 'text', 'number', 'boolean', 'select', 'datetime', 'image', 'file',
  'object', 'list', 'hidden', 'markdown', 'richtext', 'code', 'color', 'map',
  'relation', 'uuid', 'keyvalue', 'compute',
];
const loopVelden = (fields, waar) => {
  for (const veld of fields ?? []) {
    if (veld.widget !== undefined && !widgets.includes(veld.widget)) {
      fouten.push(
        `public/admin/config.yml: onbekend veldtype "${veld.widget}" bij veld "${veld.name}" (${waar})`
      );
    }
    loopVelden(veld.fields, waar);
  }
};
for (const file of (config.collections ?? []).flatMap((c) => c.files ?? [])) {
  loopVelden(file.fields, file.label);
}

if (fouten.length) {
  console.error('Inhoud is niet in orde:\n' + fouten.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(`Inhoud in orde: ${dataBestanden.length} bestanden, ${fotoPaden.length} foto's.`);
