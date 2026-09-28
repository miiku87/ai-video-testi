// Sisällön, teeman ja valmisteluskriptin tuottaman manifestin lataus.
// Tekstejä ei muokata täällä vaan tiedostossa content/script.json.
import scriptJson from '../content/script.json';
import themeJson from '../theme/theme.json';
import manifestJson from './generated/manifest.json';

export type Media = {
  tiedosto: string;
  kuvaus: string;
  tyyppi?: 'video' | 'puhuja' | 'kuva';
  nimiplanssi?: boolean;
  /** Kuinka monen sekunnin kohdalta kuvattu pätkä aloitetaan (oletus 0). */
  aloitaKohdasta?: number;
};
export type Alkaa = string | number | undefined;

export type Kohtaus = {
  id: string;
  nimi: string;
  kestoSek: number;
  aani?: string;
  puhe: string;
  asettelu: 'kuvat' | 'prosessi' | 'puhuja_ja_sanat' | 'loppukortti';
  [avain: string]: unknown;
};

export type Tekstitys = {teksti: string; alku: number; loppu: number; rivit: string[]};

export type KohtausMeta = {
  id: string;
  kestoFrames: number;
  alkuFrames: number;
  onAani: boolean;
  puheAlku: number;
  puheLoppu: number;
  ajat: Record<string, number>;
  tekstitykset: Tekstitys[];
};

export const script = scriptJson as unknown as {
  video: {otsikko: string; tiedostonimi: string; fps: number; leveys: number; korkeus: number};
  henkilot: {puhuja: {nimi: string; titteli: string}};
  musiikki: {kayta: boolean; tiedosto: string; voimakkuus: number};
  kohtaukset: Kohtaus[];
};

export const theme = themeJson;
export const varit = theme.varit;
export const koot = theme.koot;

const manifest = manifestJson as unknown as {
  tiedostot: Record<string, boolean>;
  kohtaukset: KohtausMeta[];
  kokonaisFrames: number;
};

export const kokonaisFrames = manifest.kokonaisFrames;
export const kohtausMeta = (id: string): KohtausMeta => {
  const m = manifest.kohtaukset.find((k) => k.id === id);
  if (!m) throw new Error(`Kohtausta ${id} ei löydy manifestista. Aja: npm run prepare-content`);
  return m;
};

/** Onko tiedosto olemassa assets/-kansiossa (tarkistettu valmisteluvaiheessa). */
export const onTiedosto = (rel?: string) => Boolean(rel && manifest.tiedostot[rel]);

/** Muuttaa "alkaa"-arvon (fraasi puheesta tai sekunnit) kohtauksen sisäiseksi framenumeroksi. */
export const alkaaFrame = (meta: KohtausMeta, alkaa: Alkaa): number => {
  if (alkaa === undefined) return 0;
  const s = typeof alkaa === 'number' ? alkaa : meta.ajat[alkaa] ?? 0;
  return Math.round(s * script.video.fps);
};

export const fonttiPerhe = `"${theme.fontit.perhe}", "Inter", system-ui, sans-serif`;
