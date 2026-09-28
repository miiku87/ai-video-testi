// Fonttien lataus. Oletuksena Inter (SIL OFL), brändifontti theme.json-tiedostosta.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import {continueRender, delayRender, staticFile} from 'remotion';
import {onTiedosto, theme} from './content';

const odota = delayRender('Ladataan fontteja');
const lataukset: Promise<unknown>[] = [];
const {perhe, tiedostoNormaali, tiedostoLihavoitu} = theme.fontit;

for (const [tiedosto, paksuus] of [
  [tiedostoNormaali, '400'],
  [tiedostoLihavoitu, '700'],
] as const) {
  if (tiedosto && onTiedosto(tiedosto)) {
    const f = new FontFace(perhe, `url(${staticFile(tiedosto)})`, {weight: paksuus});
    document.fonts.add(f);
    lataukset.push(f.load());
  }
}
for (const w of ['400', '500', '600', '700']) lataukset.push(document.fonts.load(`${w} 40px "Inter"`));

Promise.all(lataukset)
  .then(() => continueRender(odota))
  .catch((e) => {
    console.error(e);
    continueRender(odota);
  });
