import { EleveListeReadModel } from './EleveListeReadModel';

// Ce fichier definit la lecture des eleves d'une classe.
export interface ClasseElevesReadModel {
  idClassePedagogique: string;
  libelleClassePedagogique?: string;
  eleves: EleveListeReadModel[];
}
