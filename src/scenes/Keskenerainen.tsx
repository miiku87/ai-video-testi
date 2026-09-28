import React from 'react';
import {Kohtaus} from '../content';
import {Paikkamerkki} from '../components/Paikkamerkki';

/** Väliaikainen näkymä asetteluille, joita ei ole vielä toteutettu. */
export const Keskenerainen: React.FC<{kohtaus: Kohtaus}> = ({kohtaus}) => (
  <Paikkamerkki kuvaus={`${kohtaus.nimi} – asettelu "${kohtaus.asettelu}" tulossa`} tiedosto="" />
);
