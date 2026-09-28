// Kohtaus 5: puhuja, jonka rinnalle tulevat sanat yksi kerrallaan puheen tahdissa.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {sekunteina, sisaan} from '../anim';
import {Ikoni} from '../components/Ikoni';
import {MediaNakyma} from '../components/MediaNakyma';
import {Alkaa, alkaaFrame, fonttiPerhe, Kohtaus, KohtausMeta, koot, Media, varit} from '../content';

type Sana = {sana: string; selite?: string; ikoni?: string; alkaa: Alkaa};

const LEVEYS = 1920;
const PUHUJAN_LEVEYS = 860; // puhujakuvan leveys jaetussa näkymässä

export const PuhujaJaSanat: React.FC<{kohtaus: Kohtaus; meta: KohtausMeta}> = ({kohtaus, meta}) => {
  const frame = useCurrentFrame();
  const puhuja = kohtaus.puhujakuva as Media;
  const sanat = kohtaus.sanat as Sana[];
  const jako = sisaan(frame, alkaaFrame(meta, kohtaus.jakoAlkaa as Alkaa) - sekunteina(0.6), 1.2);
  const puhujanLeveys = interpolate(jako, [0, 1], [LEVEYS, PUHUJAN_LEVEYS]);
  const alut = sanat.map((s) => alkaaFrame(meta, s.alkaa));
  const aktiivinen = alut.reduce((acc, a, i) => (frame >= a ? i : acc), -1);

  return (
    <AbsoluteFill style={{backgroundColor: varit.tausta, fontFamily: fonttiPerhe}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: puhujanLeveys, overflow: 'hidden'}}>
        <MediaNakyma tiedosto={puhuja.tiedosto} kuvaus={puhuja.kuvaus} tyyppi="puhuja" />
      </div>
      <div
        style={{
          position: 'absolute',
          left: PUHUJAN_LEVEYS + 110,
          right: 100,
          top: 60,
          bottom: 200, // alaosa jätetään vapaaksi tekstitykselle
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 52,
          opacity: jako,
        }}
      >
        {sanat.map((s, i) => {
          const p = sisaan(frame, alut[i]);
          const onAktiivinen = i === aktiivinen;
          const korostus = sisaan(frame, alut[i]) * (onAktiivinen ? 1 : 0);
          return (
            <div
              key={s.sana}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 36,
                opacity: p,
                transform: `translateY(${(1 - p) * 28}px)`,
              }}
            >
              <div
                style={{
                  width: 132,
                  height: 132,
                  flexShrink: 0,
                  borderRadius: 66,
                  backgroundColor: varit.korostusVaalea,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 0 ${korostus * 6}px ${varit.korostus}`,
                }}
              >
                <Ikoni nimi={s.ikoni} koko={68} vari={varit.korostus} />
              </div>
              <div>
                <div style={{fontSize: koot.sanaIso, fontWeight: 700, color: varit.teksti, lineHeight: 1.05}}>
                  {s.sana}
                </div>
                {s.selite ? (
                  <div style={{fontSize: koot.pieni + 2, color: varit.tekstiHaalea, marginTop: 10, lineHeight: 1.3}}>
                    {s.selite}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
