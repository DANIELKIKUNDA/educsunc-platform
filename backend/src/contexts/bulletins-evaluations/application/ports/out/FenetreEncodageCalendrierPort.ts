import type { CodeColonneBulletin } from '../../../domain/value-objects/CodeColonneBulletin';

// Ce read model expose la fenetre temporelle utile au BC bulletins pour l'encodage des cotes.
export interface FenetreEncodageCalendrierReadModel {
  idCalendrierAcademique: string;
  idEcole: string;
  idAnneeScolaire: string;
  verrouille: boolean;
  dateReference: string;
  periodeCouranteCode: string | null;
  examenCourantCode: string | null;
}

// Ce port relit la verite temporelle du calendrier sans exposer les fiches de cotation au BC referentiel.
export interface FenetreEncodageCalendrierPort {
  determinerFenetreEncodage(params: {
    idEcole: string;
    idAnneeScolaire: string;
    codeColonne: CodeColonneBulletin;
    dateReference: Date;
  }): Promise<FenetreEncodageCalendrierReadModel | null>;
}
