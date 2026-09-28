// Valmistelee renderöinnin:
//  1. lukee content/script.json
//  2. tarkistaa, mitkä kuvattavat tiedostot, ruutukaappaukset, äänet ja logo löytyvät assets/-kansiosta
//  3. laskee kohtausten kestot (äänitteen pituus, jos äänite on olemassa)
//  4. arvioi, missä kohdassa puhetta kukin "alkaa"-fraasi sanotaan
//  5. muodostaa tekstitykset ja kirjoittaa SRT-tiedoston
// Tulos: src/generated/manifest.json (luetaan videokoodissa) ja out/<nimi>.srt
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'assets');
const OUT = path.join(ROOT, 'out');
const GENERATED = path.join(ROOT, 'src', 'generated');

// Puheen sijoittuminen kohtauksen sisälle
const ILMAN_AANTA_ALKU = 0.6; // s, puhe alkaa arviolta tästä
const ILMAN_AANTA_LOPPU = 0.8; // s, puhe päättyy näin paljon ennen kohtauksen loppua
const AANITE_ALKU = 0.15;
const AANITE_LOPPU = 0.15;
const AANITTEEN_JALKEEN = 0.6; // s, hiljaisuutta äänitteen jälkeen ennen seuraavaa kohtausta

const varoitukset = [];
const varoita = (v) => varoitukset.push(v);

const script = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'script.json'), 'utf8'));
const theme = JSON.parse(fs.readFileSync(path.join(ROOT, 'theme', 'theme.json'), 'utf8'));
const fps = script.video.fps;

// --- Tiedostojen olemassaolo -------------------------------------------------
const tiedostot = {};
const merkitse = (rel) => {
  if (!rel) return;
  tiedostot[rel] = fs.existsSync(path.join(ASSETS, rel));
};
const kerraaTiedostot = (obj) => {
  if (Array.isArray(obj)) return obj.forEach(kerraaTiedostot);
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if ((k === 'tiedosto' || k === 'logo' || k === 'aani') && typeof v === 'string') merkitse(v);
      else kerraaTiedostot(v);
    }
  }
};
kerraaTiedostot(script);
merkitse(theme.fontit.tiedostoNormaali);
merkitse(theme.fontit.tiedostoLihavoitu);

// --- Äänitteen kesto ---------------------------------------------------------
const kesto = (rel) => {
  const out = execFileSync(
    'npx',
    ['remotion', 'ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(ASSETS, rel)],
    {cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']},
  );
  const s = parseFloat(out.trim());
  if (!Number.isFinite(s)) throw new Error(`Äänitteen kestoa ei saatu luettua: ${rel}`);
  return s;
};

// --- Puheen ajoitusarvio -----------------------------------------------------
// Merkkimäärään perustuva arvio: välimerkit lisäävät pienen tauon.
const paino = (teksti) => {
  let w = 0;
  for (const ch of teksti) {
    if ('.!?'.includes(ch)) w += 8;
    else if (',;:–'.includes(ch)) w += 3;
    else w += 1;
  }
  return w;
};

const fraasinAika = (puhe, fraasi, alku, loppu, kohtausId) => {
  if (typeof fraasi === 'number') return fraasi;
  if (!fraasi) return 0;
  const i = puhe.toLowerCase().indexOf(String(fraasi).toLowerCase());
  if (i < 0) {
    varoita(`${kohtausId}: "alkaa"-tekstiä "${fraasi}" ei löydy puheesta – näytetään kohtauksen alussa.`);
    return 0;
  }
  return alku + (loppu - alku) * (paino(puhe.slice(0, i)) / paino(puhe));
};

// --- Tekstitys ---------------------------------------------------------------
const {merkkejaRivilla: MAX, riveja: MAXRIVIT, vahimmaisKestoSek: MINKESTO} = script.tekstitys;

// Jakaa tekstin enintään kahdelle riville mahdollisimman tasaisesti. Palauttaa null, jos ei mahdu.
const rivita = (teksti) => {
  if (teksti.length <= MAX) return [teksti];
  if (MAXRIVIT < 2) return null;
  const sanat = teksti.split(' ');
  let paras = null;
  for (let i = 1; i < sanat.length; i++) {
    const a = sanat.slice(0, i).join(' ');
    const b = sanat.slice(i).join(' ');
    if (a.length > MAX || b.length > MAX) continue;
    // suosi tasapainoa ja katkaisua välimerkin jälkeen
    const pisteet = Math.abs(a.length - b.length) - (/[,;:]$/.test(a) ? 12 : 0);
    if (!paras || pisteet < paras.pisteet) paras = {pisteet, rivit: [a, b]};
  }
  return paras ? paras.rivit : null;
};

// Pilkkoo virkkeen tekstityspaloiksi, jotka mahtuvat kahdelle riville.
const pilko = (teksti) => {
  if (rivita(teksti)) return [teksti];
  const sanat = teksti.split(' ');
  let paras = null;
  for (let i = 1; i < sanat.length; i++) {
    const a = sanat.slice(0, i).join(' ');
    const b = sanat.slice(i).join(' ');
    const pisteet =
      Math.abs(a.length - b.length) -
      (/[,;:]$/.test(a) ? 40 : 0) -
      (/^(ja|vaan|koska|kun|jossa|eikä|tai)$/i.test(sanat[i]) ? 15 : 0);
    if (!paras || pisteet < paras.pisteet) paras = {pisteet, osat: [a, b]};
  }
  return paras.osat.flatMap(pilko);
};

const tekstitykset = (puhe, alku, loppu) => {
  const virkkeet = puhe.match(/[^.!?]+[.!?]+|[^.!?]+$/g).map((s) => s.trim()).filter(Boolean);
  let palat = virkkeet.flatMap(pilko);
  const kokonaispaino = paino(puhe);
  const ajoita = (p) => {
    let t = alku;
    return p.map((teksti) => {
      const d = ((loppu - alku) * (paino(teksti) + 1)) / kokonaispaino;
      const pala = {teksti, alku: t, loppu: t + d};
      t += d;
      return pala;
    });
  };
  // Yhdistä liian lyhyet palat naapuriin, jos yhdistelmä mahtuu kahdelle riville
  let muuttui = true;
  while (muuttui) {
    muuttui = false;
    const ajat = ajoita(palat);
    for (let i = 0; i < ajat.length; i++) {
      if (ajat[i].loppu - ajat[i].alku >= MINKESTO) continue;
      const naapurit = [i + 1, i - 1].filter((j) => j >= 0 && j < palat.length);
      for (const j of naapurit) {
        const [a, b] = j > i ? [i, j] : [j, i];
        const yhd = `${palat[a]} ${palat[b]}`;
        if (rivita(yhd)) {
          palat.splice(a, 2, yhd);
          muuttui = true;
          break;
        }
      }
      if (muuttui) break;
    }
  }
  const ajat = ajoita(palat);
  // Viimeinen varmistus: venytä lyhyttä palaa seuraavan kustannuksella
  for (let i = 0; i < ajat.length; i++) {
    const vaje = MINKESTO - (ajat[i].loppu - ajat[i].alku);
    if (vaje > 0) {
      ajat[i].loppu += vaje;
      if (ajat[i + 1]) ajat[i + 1].alku = ajat[i].loppu;
    }
  }
  return ajat.map((a) => ({...a, rivit: rivita(a.teksti)}));
};

// --- Kohtaukset --------------------------------------------------------------
const keraaFraasit = (obj, kerays = new Set()) => {
  if (Array.isArray(obj)) obj.forEach((o) => keraaFraasit(o, kerays));
  else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if ((k === 'alkaa' || k === 'jakoAlkaa') && (typeof v === 'string' || typeof v === 'number')) kerays.add(v);
      else keraaFraasit(v, kerays);
    }
  }
  return kerays;
};

let offset = 0;
const kohtaukset = script.kohtaukset.map((k) => {
  const onAani = Boolean(k.aani && tiedostot[k.aani]);
  let kestoSek;
  let puheAlku;
  let puheLoppu;
  if (onAani) {
    const a = kesto(k.aani);
    kestoSek = a + AANITTEEN_JALKEEN;
    puheAlku = AANITE_ALKU;
    puheLoppu = a - AANITE_LOPPU;
  } else {
    kestoSek = k.kestoSek;
    puheAlku = ILMAN_AANTA_ALKU;
    puheLoppu = k.kestoSek - ILMAN_AANTA_LOPPU;
  }
  const kestoFrames = Math.round(kestoSek * fps);
  const ajat = {};
  for (const f of keraaFraasit(k)) ajat[String(f)] = fraasinAika(k.puhe, f, puheAlku, puheLoppu, k.id);
  const tekstit = tekstitykset(k.puhe, puheAlku, puheLoppu).map((t) => ({
    ...t,
    loppu: Math.min(t.loppu, kestoSek),
  }));
  const tulos = {id: k.id, kestoFrames, alkuFrames: offset, onAani, puheAlku, puheLoppu, ajat, tekstitykset: tekstit};
  offset += kestoFrames;
  return tulos;
});

// --- SRT ---------------------------------------------------------------------
const aikaleima = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, l = 2) => String(n).padStart(l, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
let n = 0;
const srt = kohtaukset
  .flatMap((k) =>
    k.tekstitykset.map((t) => {
      n++;
      const alku = k.alkuFrames / fps + t.alku;
      const loppu = k.alkuFrames / fps + t.loppu;
      return `${n}\n${aikaleima(alku)} --> ${aikaleima(loppu)}\n${t.rivit.join('\n')}\n`;
    }),
  )
  .join('\n');

fs.mkdirSync(GENERATED, {recursive: true});
fs.mkdirSync(OUT, {recursive: true});
const manifest = {tiedostot, kohtaukset, kokonaisFrames: offset};
fs.writeFileSync(path.join(GENERATED, 'manifest.json'), JSON.stringify(manifest, null, 2));
fs.writeFileSync(path.join(OUT, `${script.video.tiedostonimi}.srt`), srt);

// --- Yhteenveto --------------------------------------------------------------
const puuttuvat = Object.entries(tiedostot).filter(([, on]) => !on).map(([f]) => f);
const loytyvat = Object.entries(tiedostot).filter(([, on]) => on).map(([f]) => f);
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
console.log(`\nVideon kesto: ${mmss(offset / fps)} (${kohtaukset.length} kohtausta)`);
for (const k of kohtaukset) {
  console.log(`  ${k.id}: ${(k.kestoFrames / fps).toFixed(1)} s ${k.onAani ? '(äänitteen mukaan)' : '(käsikirjoituksen mukaan)'}`);
}
console.log(`Löytyneet tiedostot: ${loytyvat.length ? loytyvat.join(', ') : 'ei yhtään'}`);
console.log(`Paikkamerkkinä näytetään: ${puuttuvat.length} tiedostoa`);
for (const v of varoitukset) console.warn(`HUOM: ${v}`);
