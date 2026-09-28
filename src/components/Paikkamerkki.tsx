import React from 'react';
import {AbsoluteFill} from 'remotion';
import {fonttiPerhe, varit} from '../content';
import {Ikoni} from './Ikoni';

/** Harmaa ruutu, joka kertoo mitä tähän kohtaan tulee. Korvautuu automaattisesti, kun tiedosto lisätään. */
export const Paikkamerkki: React.FC<{kuvaus: string; tiedosto: string; tyyppi?: string}> = ({
  kuvaus,
  tiedosto,
  tyyppi,
}) => {
  const ikoni = tyyppi === 'kuva' ? 'Image' : tyyppi === 'logo' ? 'BadgeCheck' : tyyppi === 'puhuja' ? 'User' : 'Clapperboard';
  return (
    <AbsoluteFill
      style={{
        backgroundColor: varit.paikkamerkkiTausta,
        color: varit.paikkamerkkiTeksti,
        fontFamily: fonttiPerhe,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 48,
        gap: 18,
      }}
    >
      <Ikoni nimi={ikoni} koko={72} vari={varit.paikkamerkkiTeksti} paksuus={1.5} />
      <div style={{fontSize: 22, fontWeight: 600, letterSpacing: 3, opacity: 0.7}}>PAIKKAMERKKI</div>
      <div style={{fontSize: 40, fontWeight: 600, maxWidth: 1100, lineHeight: 1.2}}>{kuvaus}</div>
      <div style={{fontSize: 24, opacity: 0.8, fontFamily: 'monospace'}}>assets/{tiedosto}</div>
    </AbsoluteFill>
  );
};
