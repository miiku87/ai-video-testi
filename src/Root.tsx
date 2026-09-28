import './fonts';
import React from 'react';
import {Audio, Composition, Series, staticFile} from 'remotion';
import {kohtausMeta, kokonaisFrames, onTiedosto, script} from './content';
import {KohtausNakyma} from './scenes/KohtausNakyma';

type Props = {tekstitys: boolean};
const {fps, leveys, korkeus} = script.video;

const KokoVideo: React.FC<Props> = ({tekstitys}) => {
  const {musiikki} = script;
  return (
    <>
      <Series>
        {script.kohtaukset.map((k) => (
          <Series.Sequence key={k.id} durationInFrames={kohtausMeta(k.id).kestoFrames} name={k.nimi}>
            <KohtausNakyma kohtaus={k} tekstitys={tekstitys} />
          </Series.Sequence>
        ))}
      </Series>
      {musiikki.kayta && onTiedosto(musiikki.tiedosto) ? (
        <Audio src={staticFile(musiikki.tiedosto)} volume={musiikki.voimakkuus} loop />
      ) : null}
    </>
  );
};

export const Root: React.FC = () => (
  <>
    <Composition
      id="Tenttiakvaario"
      component={KokoVideo}
      durationInFrames={kokonaisFrames}
      fps={fps}
      width={leveys}
      height={korkeus}
      defaultProps={{tekstitys: false} as Props}
    />
    {script.kohtaukset.map((k, i) => (
      <Composition
        key={k.id}
        id={`Kohtaus-${i + 1}`}
        component={({tekstitys}: Props) => <KohtausNakyma kohtaus={k} tekstitys={tekstitys} />}
        durationInFrames={kohtausMeta(k.id).kestoFrames}
        fps={fps}
        width={leveys}
        height={korkeus}
        defaultProps={{tekstitys: false} as Props}
      />
    ))}
  </>
);
