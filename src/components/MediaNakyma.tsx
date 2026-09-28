import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile} from 'remotion';
import {onTiedosto, script, varit} from '../content';
import {Paikkamerkki} from './Paikkamerkki';

const onKuva = (tiedosto: string) => /\.(png|jpe?g|webp|svg)$/i.test(tiedosto);

/** Näyttää kuvatun videon tai ruutukaappauksen – tai paikkamerkin, jos tiedostoa ei vielä ole. */
export const MediaNakyma: React.FC<{tiedosto: string; kuvaus: string; tyyppi?: string; aloitaKohdasta?: number}> = ({
  tiedosto,
  kuvaus,
  tyyppi,
  aloitaKohdasta = 0,
}) => {
  const kuva = onKuva(tiedosto);
  if (!onTiedosto(tiedosto)) {
    return <Paikkamerkki kuvaus={kuvaus} tiedosto={tiedosto} tyyppi={kuva ? 'kuva' : tyyppi} />;
  }
  if (kuva) {
    return (
      <AbsoluteFill style={{backgroundColor: varit.pinta}}>
        <Img src={staticFile(tiedosto)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <OffthreadVideo
        muted
        src={staticFile(tiedosto)}
        startFrom={Math.round(aloitaKohdasta * script.video.fps)}
        style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};
