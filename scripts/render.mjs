// Renderöi videon yhdellä komennolla.
//   npm run render                 → out/<nimi>.mp4, out/<nimi>_tekstitetty.mp4 ja out/<nimi>.srt
//   npm run render -- --kohtaus 5  → out/koeversio_kohtaus_5.mp4 (vain yksi kohtaus)
//   lisävalinta --tekstitys        → yhden kohtauksen renderöintiin poltettu tekstitys
//   lisävalinta --ilman-tekstitysta → koko videosta vain versio ilman poltettua tekstitystä (nopeampi)
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const kohtausIndeksi = args.indexOf('--kohtaus');
const kohtaus = kohtausIndeksi >= 0 ? args[kohtausIndeksi + 1] : null;
const tekstitys = args.includes('--tekstitys');

const aja = (cmd, cmdArgs) => execFileSync(cmd, cmdArgs, {cwd: ROOT, stdio: 'inherit'});

aja('node', ['scripts/prepare.mjs']);

const script = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'script.json'), 'utf8'));
const nimi = script.video.tiedostonimi;

// Remotion lataa oman selaimensa automaattisesti. Pilviympäristössä käytetään valmiiksi asennettua.
const selain = (() => {
  if (process.env.REMOTION_BROWSER) return process.env.REMOTION_BROWSER;
  const pw = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!pw || !fs.existsSync(pw)) return null;
  const kansio = fs.readdirSync(pw).find((d) => d.startsWith('chromium_headless_shell-'));
  const polku = kansio && path.join(pw, kansio, 'chrome-linux', 'headless_shell');
  return polku && fs.existsSync(polku) ? polku : null;
})();

const renderoi = (koostumus, tiedosto, props) => {
  console.log(`\nRenderöidään ${koostumus} → out/${tiedosto}`);
  aja('npx', [
    'remotion',
    'render',
    'src/index.ts',
    koostumus,
    path.join('out', tiedosto),
    '--codec=h264',
    '--audio-codec=aac',
    '--enforce-audio-track',
    `--props=${JSON.stringify(props)}`,
    ...(selain ? [`--browser-executable=${selain}`] : []),
  ]);
};

if (kohtaus) {
  renderoi(`Kohtaus-${kohtaus}`, `koeversio_kohtaus_${kohtaus}${tekstitys ? '_tekstitetty' : ''}.mp4`, {tekstitys});
} else {
  renderoi('Tenttiakvaario', `${nimi}.mp4`, {tekstitys: false});
  const tiedostot = [`${nimi}.mp4`];
  if (!args.includes('--ilman-tekstitysta')) {
    renderoi('Tenttiakvaario', `${nimi}_tekstitetty.mp4`, {tekstitys: true});
    tiedostot.push(`${nimi}_tekstitetty.mp4`);
  }
  console.log(`\nValmis: ${[...tiedostot, `${nimi}.srt`].map((t) => `out/${t}`).join(', ')}`);
}
