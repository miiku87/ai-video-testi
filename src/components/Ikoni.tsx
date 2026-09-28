import {icons} from 'lucide-react';
import React from 'react';

/** Lucide-ikoni nimen perusteella (esim. "ShieldCheck"). Nimet: https://lucide.dev/icons */
export const Ikoni: React.FC<{nimi?: string; koko: number; vari: string; paksuus?: number}> = ({
  nimi,
  koko,
  vari,
  paksuus = 1.75,
}) => {
  const Komponentti = (nimi && icons[nimi as keyof typeof icons]) || icons.Circle;
  return <Komponentti size={koko} color={vari} strokeWidth={paksuus} />;
};
