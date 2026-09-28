// Kohtaus 7: loppukortti, jossa logo ja yhteystiedot. Video häivytetään lopussa taustaväriin.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {sekunteina, siirtyma, sisaan} from '../anim';
import {Paikkamerkki} from '../components/Paikkamerkki';
import {fonttiPerhe, Kohtaus, KohtausMeta, koot, onTiedosto, varit} from '../content';

export const Loppukortti: React.FC<{kohtaus: Kohtaus; meta: KohtausMeta}> = ({kohtaus, meta}) => {
  const frame = useCurrentFrame();
  const logo = kohtaus.logo as string;
  const rivit = (kohtaus.rivit as string[]) ?? [];
  const pLogo = sisaan(frame, sekunteina(0.3));
  const pTeksti = sisaan(frame, sekunteina(0.9));
  const loppuhaivytys = 1 - siirtyma(frame, meta.kestoFrames - sekunteina(1), sekunteina(1));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: varit.tausta,
        fontFamily: fonttiPerhe,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 140, // tilaa tekstitykselle
        opacity: loppuhaivytys,
      }}
    >
      <div style={{opacity: pLogo, transform: `translateY(${(1 - pLogo) * 20}px)`, marginBottom: 72}}>
        {onTiedosto(logo) ? (
          <Img src={staticFile(logo)} style={{height: 170, width: 'auto'}} />
        ) : (
          <div style={{position: 'relative', width: 560, height: 190, borderRadius: 12, overflow: 'hidden'}}>
            <Paikkamerkki kuvaus="Laurean logo" tiedosto={logo} tyyppi="logo" kompakti />
          </div>
        )}
      </div>
      <div style={{opacity: pTeksti, transform: `translateY(${(1 - pTeksti) * 20}px)`, textAlign: 'center'}}>
        {kohtaus.otsikko ? (
          <div style={{fontSize: koot.otsikko + 8, fontWeight: 700, color: varit.teksti, marginBottom: 28}}>
            {kohtaus.otsikko as string}
          </div>
        ) : null}
        {rivit.map((r) => (
          <div key={r} style={{fontSize: koot.leipa + 4, color: varit.tekstiHaalea, fontWeight: 500, lineHeight: 1.5}}>
            {r}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
