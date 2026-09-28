import React from 'react';
import {useCurrentFrame} from 'remotion';
import {sekunteina, sisaan} from '../anim';
import {fonttiPerhe, koot, script, varit} from '../content';

/** Puhujan nimiplanssi: tulee esiin rauhallisesti ja poistuu muutaman sekunnin kuluttua. */
export const Nimiplanssi: React.FC<{alku: number; kestoSek?: number}> = ({alku, kestoSek = 5}) => {
  const frame = useCurrentFrame();
  const {nimi, titteli} = script.henkilot.puhuja;
  const loppu = alku + sekunteina(kestoSek);
  const p = Math.min(sisaan(frame, alku), 1 - sisaan(frame, loppu));
  if (p <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 96,
        bottom: 230,
        opacity: p,
        transform: `translateX(${(1 - p) * -24}px)`,
        fontFamily: fonttiPerhe,
        backgroundColor: varit.pinta,
        borderLeft: `8px solid ${varit.korostus}`,
        padding: '20px 32px',
        borderRadius: 6,
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      }}
    >
      <div style={{fontSize: koot.leipa + 4, fontWeight: 700, color: varit.teksti}}>{nimi}</div>
      <div style={{fontSize: koot.pieni, fontWeight: 500, color: varit.tekstiHaalea, marginTop: 4}}>{titteli}</div>
    </div>
  );
};
