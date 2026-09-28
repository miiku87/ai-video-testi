// Yhden kohtauksen runko: asettelu, puheäänite, häivytys ja (valinnainen) poltettu tekstitys.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {sekunteina, siirtyma} from '../anim';
import {Tekstitys} from '../components/Tekstitys';
import {Kohtaus, kohtausMeta, theme, varit} from '../content';
import {Kuvat} from './Kuvat';
import {Loppukortti} from './Loppukortti';
import {Prosessi} from './Prosessi';
import {PuhujaJaSanat} from './PuhujaJaSanat';

export const KohtausNakyma: React.FC<{kohtaus: Kohtaus; tekstitys: boolean}> = ({kohtaus, tekstitys}) => {
  const frame = useCurrentFrame();
  const meta = kohtausMeta(kohtaus.id);
  const haivytys = siirtyma(frame, 0, sekunteina(theme.animaatio.kohtauksenHaivytysSek));

  let sisalto: React.ReactNode;
  switch (kohtaus.asettelu) {
    case 'puhuja_ja_sanat':
      sisalto = <PuhujaJaSanat kohtaus={kohtaus} meta={meta} />;
      break;
    case 'prosessi':
      sisalto = <Prosessi kohtaus={kohtaus} meta={meta} />;
      break;
    case 'loppukortti':
      sisalto = <Loppukortti kohtaus={kohtaus} meta={meta} />;
      break;
    default:
      sisalto = <Kuvat kohtaus={kohtaus} meta={meta} />;
  }

  return (
    <AbsoluteFill style={{backgroundColor: varit.tausta}}>
      <AbsoluteFill style={{opacity: haivytys}}>{sisalto}</AbsoluteFill>
      {meta.onAani && kohtaus.aani ? <Audio src={staticFile(kohtaus.aani)} /> : null}
      {tekstitys ? <Tekstitys meta={meta} /> : null}
    </AbsoluteFill>
  );
};
