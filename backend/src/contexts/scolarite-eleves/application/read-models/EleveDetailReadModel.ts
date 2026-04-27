import { EleveDetailSortieDTO } from '../dto/output/EleveDetailSortieDTO';

// Ce fichier definit le read model detaille d'un eleve.
export interface EleveDetailReadModel extends EleveDetailSortieDTO {
  libelleClassePedagogique?: string;
  nomFamille?: string;
}
