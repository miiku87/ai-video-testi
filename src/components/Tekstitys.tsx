import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonttiPerhe, koot, KohtausMeta, varit} from '../content';

/** Kuvaan poltettava tekstitys (vain tekstitetyssä versiossa). */
export const Tekstitys: React.FC<{meta: KohtausMeta}> = ({meta}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const nyt = meta.tekstitykset.find((c) => t >= c.alku && t < c.loppu);
  if (!nyt) return null;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 64}}>
      <div
        style={{
          fontFamily: fonttiPerhe,
          fontSize: koot.tekstitys,
          fontWeight: 500,
          lineHeight: 1.3,
          color: varit.tekstitysTeksti,
          backgroundColor: varit.tekstitysTausta,
          padding: '10px 28px',
          borderRadius: 8,
          textAlign: 'center',
        }}
      >
        {nyt.rivit.map((r, i) => (
          <div key={i}>{r}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
