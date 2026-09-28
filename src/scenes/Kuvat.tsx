// Kohtaukset 1, 2 ja 6: kuvattujen pätkien sarja, valinnainen tekstigrafiikka ja puhujan nimiplanssi.
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {sekunteina, siirtyma, sisaan} from '../anim';
import {MediaNakyma} from '../components/MediaNakyma';
import {Nimiplanssi} from '../components/Nimiplanssi';
import {Alkaa, alkaaFrame, fonttiPerhe, Kohtaus, KohtausMeta, koot, Media, script, varit} from '../content';

type Kuva = Media & {alkaa?: Alkaa};
const RISTIHAIVYTYS = sekunteina(0.5);

const Tekstigrafiikka: React.FC<{teksti: string; alku: number}> = ({teksti, alku}) => {
  const frame = useCurrentFrame();
  const p = sisaan(frame, alku);
  return (
    <div
      style={{
        position: 'absolute',
        left: 96,
        bottom: 240,
        maxWidth: 1600,
        opacity: p,
        transform: `translateY(${(1 - p) * 24}px)`,
        backgroundColor: varit.pinta,
        borderLeft: `10px solid ${varit.korostus}`,
        borderRadius: 6,
        padding: '28px 40px',
        fontFamily: fonttiPerhe,
        fontSize: koot.otsikko - 8,
        fontWeight: 700,
        lineHeight: 1.15,
        color: varit.teksti,
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
      }}
    >
      {teksti}
    </div>
  );
};

export const Kuvat: React.FC<{kohtaus: Kohtaus; meta: KohtausMeta}> = ({kohtaus, meta}) => {
  const kuvat = kohtaus.kuvat as Kuva[];
  const alut = kuvat.map((k, i) => (i === 0 ? 0 : alkaaFrame(meta, k.alkaa)));
  const grafiikka = kohtaus.tekstigrafiikka as {teksti: string; alkaa: Alkaa} | undefined;

  return (
    <AbsoluteFill style={{backgroundColor: varit.tausta}}>
      {kuvat.map((k, i) => {
        const alku = alut[i];
        const loppu = i + 1 < kuvat.length ? alut[i + 1] + RISTIHAIVYTYS : meta.kestoFrames;
        return (
          <Sequence key={k.tiedosto + i} from={alku} durationInFrames={Math.max(1, loppu - alku)} name={k.kuvaus}>
            <Haivytys paalla={i > 0}>
              <MediaNakyma tiedosto={k.tiedosto} kuvaus={k.kuvaus} tyyppi={k.tyyppi} aloitaKohdasta={k.aloitaKohdasta} />
            </Haivytys>
            {k.nimiplanssi ? (
              <Nimiplanssi alku={sekunteina(0.6)} kestoSek={Math.min(5, (loppu - alku) / script.video.fps - 1.2)} />
            ) : null}
          </Sequence>
        );
      })}
      {grafiikka ? <Tekstigrafiikka teksti={grafiikka.teksti} alku={alkaaFrame(meta, grafiikka.alkaa)} /> : null}
    </AbsoluteFill>
  );
};

const Haivytys: React.FC<{paalla: boolean; children: React.ReactNode}> = ({paalla, children}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{opacity: paalla ? siirtyma(frame, 0, RISTIHAIVYTYS) : 1}}>{children}</AbsoluteFill>;
};
