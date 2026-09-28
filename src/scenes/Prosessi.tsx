// Kohtaukset 3 ja 4: viisivaiheinen polku, joka etenee puheen tahdissa.
// Vasemmalla vaiheet, oikealla vaiheen ruutukaappaus (tai paikkamerkki) tai vaiheen ikoni.
import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import {sekunteina, siirtyma, sisaan} from '../anim';
import {Ikoni} from '../components/Ikoni';
import {MediaNakyma} from '../components/MediaNakyma';
import {Alkaa, alkaaFrame, fonttiPerhe, Kohtaus, KohtausMeta, koot, varit} from '../content';

type Vaihe = {teksti: string; lisateksti?: string; ikoni?: string; alkaa: Alkaa; kuva?: {tiedosto: string; kuvaus: string}};
type Huomio = {teksti: string; ikoni?: string; alkaa: Alkaa};

// Asettelu (px, 1920×1080). Alimmat ~200 px jätetään tekstitykselle.
const VASEN = 96;
const YLA = 196;
const RIVIVALI = 128;
const IKONI = 84;
const PANEELI = {left: 800, top: 170, width: 1024, height: 576};
const HAIVYTYS = sekunteina(0.5);

const Otsikko: React.FC<{teksti: string}> = ({teksti}) => {
  const frame = useCurrentFrame();
  const p = sisaan(frame, 0);
  return (
    <div
      style={{
        position: 'absolute',
        left: VASEN,
        top: 64,
        opacity: p,
        fontSize: koot.otsikko - 8,
        fontWeight: 700,
        color: varit.teksti,
      }}
    >
      {teksti}
    </div>
  );
};

const Vaiheet: React.FC<{vaiheet: Vaihe[]; alut: number[]; aktiivinen: number}> = ({vaiheet, alut, aktiivinen}) => {
  const frame = useCurrentFrame();
  const ensin = sisaan(frame, sekunteina(0.2));
  // Yhdysviiva täyttyy vaihe kerrallaan
  const edistys = vaiheet.reduce(
    (acc, _, i) => (i === 0 ? acc : acc + sisaan(frame, alut[i], 0.9)),
    0,
  );
  const viivanPituus = (vaiheet.length - 1) * RIVIVALI;
  return (
    <div style={{position: 'absolute', left: VASEN, top: YLA, opacity: ensin}}>
      <div
        style={{
          position: 'absolute',
          left: IKONI / 2 - 2,
          top: IKONI / 2,
          width: 4,
          height: viivanPituus,
          backgroundColor: varit.viiva,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: IKONI / 2 - 2,
          top: IKONI / 2,
          width: 4,
          height: edistys * RIVIVALI,
          backgroundColor: varit.korostus,
        }}
      />
      {vaiheet.map((v, i) => {
        const p = sisaan(frame, alut[i]);
        const onAktiivinen = i === aktiivinen;
        const aktiivisuus = onAktiivinen ? p : 0;
        return (
          <div
            key={v.teksti}
            style={{
              position: 'absolute',
              top: i * RIVIVALI,
              left: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              width: 660,
              opacity: interpolate(p, [0, 1], [0.38, 1]),
            }}
          >
            <div
              style={{
                width: IKONI,
                height: IKONI,
                flexShrink: 0,
                borderRadius: IKONI / 2,
                backgroundColor: interpolateColors(p, [0, 1], [varit.pinta, varit.korostus]),
                border: `3px solid ${interpolateColors(p, [0, 1], [varit.viiva, varit.korostus])}`,
                boxShadow: `0 0 0 ${aktiivisuus * 8}px ${varit.korostusVaalea}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ikoni nimi={v.ikoni} koko={40} vari={interpolateColors(p, [0, 1], [varit.tekstiHaalea, varit.pinta])} />
            </div>
            <div>
              <div
                style={{
                  fontSize: koot.leipa,
                  fontWeight: onAktiivinen ? 700 : 600,
                  color: onAktiivinen ? varit.korostus : varit.teksti,
                  lineHeight: 1.15,
                }}
              >
                {v.teksti}
              </div>
              {v.lisateksti ? (
                <div style={{fontSize: koot.pieni - 2, color: varit.tekstiHaalea, marginTop: 4}}>{v.lisateksti}</div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Oikean puolen paneeli: vaiheen ruutukaappaus tai iso ikonikortti. Ristihäivytys vaiheiden välillä. */
const Paneeli: React.FC<{vaiheet: Vaihe[]; alut: number[]}> = ({vaiheet, alut}) => {
  const frame = useCurrentFrame();
  const ensin = sisaan(frame, sekunteina(0.3));
  return (
    <div
      style={{
        position: 'absolute',
        ...PANEELI,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: varit.pinta,
        boxShadow: '0 12px 48px rgba(0,0,0,0.10)',
        opacity: ensin,
      }}
    >
      {vaiheet.map((v, i) => {
        const alku = i === 0 ? 0 : alut[i];
        const seuraava = i + 1 < vaiheet.length ? alut[i + 1] : Infinity;
        if (frame < alku || frame >= seuraava + HAIVYTYS) return null;
        const o = i === 0 ? 1 : siirtyma(frame, alku, HAIVYTYS);
        return (
          <AbsoluteFill key={v.teksti} style={{opacity: o}}>
            {v.kuva ? (
              <MediaNakyma tiedosto={v.kuva.tiedosto} kuvaus={v.kuva.kuvaus} tyyppi="kuva" />
            ) : (
              <AbsoluteFill
                style={{
                  backgroundColor: varit.korostusVaalea,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 32,
                }}
              >
                <Ikoni nimi={v.ikoni} koko={200} vari={varit.korostus} paksuus={1.25} />
                <div style={{fontSize: koot.otsikko - 8, fontWeight: 700, color: varit.teksti}}>{v.teksti}</div>
              </AbsoluteFill>
            )}
          </AbsoluteFill>
        );
      })}
    </div>
  );
};

const HuomioLaatikko: React.FC<{huomio: Huomio; alku: number; korostettu: boolean}> = ({huomio, alku, korostettu}) => {
  const frame = useCurrentFrame();
  const p = sisaan(frame, alku);
  return (
    <div
      style={{
        position: 'absolute',
        left: PANEELI.left,
        width: PANEELI.width,
        top: PANEELI.top + PANEELI.height + 28,
        opacity: p,
        transform: `translateY(${(1 - p) * 16}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '18px 28px',
        borderRadius: 12,
        backgroundColor: korostettu ? varit.korostus : varit.pinta,
        border: korostettu ? 'none' : `2px solid ${varit.viiva}`,
        color: korostettu ? varit.pinta : varit.teksti,
        fontSize: koot.pieni,
        fontWeight: korostettu ? 700 : 500,
        lineHeight: 1.3,
      }}
    >
      <Ikoni nimi={huomio.ikoni ?? (korostettu ? 'Sparkles' : 'Info')} koko={36} vari={korostettu ? varit.pinta : varit.korostus} />
      <div>{huomio.teksti}</div>
    </div>
  );
};

export const Prosessi: React.FC<{kohtaus: Kohtaus; meta: KohtausMeta}> = ({kohtaus, meta}) => {
  const frame = useCurrentFrame();
  const vaiheet = kohtaus.vaiheet as Vaihe[];
  const alut = vaiheet.map((v) => alkaaFrame(meta, v.alkaa));
  const aktiivinen = alut.reduce((acc, a, i) => (frame >= a ? i : acc), -1);
  const nosto = kohtaus.nosto as Huomio | undefined;
  const sivuhuomio = kohtaus.sivuhuomio as Huomio | undefined;

  return (
    <AbsoluteFill style={{backgroundColor: varit.tausta, fontFamily: fonttiPerhe}}>
      {kohtaus.otsikko ? <Otsikko teksti={kohtaus.otsikko as string} /> : null}
      <Vaiheet vaiheet={vaiheet} alut={alut} aktiivinen={aktiivinen} />
      <Paneeli vaiheet={vaiheet} alut={alut} />
      {nosto ? <HuomioLaatikko huomio={nosto} alku={alkaaFrame(meta, nosto.alkaa)} korostettu /> : null}
      {sivuhuomio ? <HuomioLaatikko huomio={sivuhuomio} alku={alkaaFrame(meta, sivuhuomio.alkaa)} korostettu={false} /> : null}
    </AbsoluteFill>
  );
};
