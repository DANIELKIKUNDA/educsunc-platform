// Ce DTO porte les informations necessaires a la generation d'un bulletin eleve.
export interface GenererBulletinEleveInput {
  idEleve: string;
  idInscriptionScolaire: string;
  idAnneeScolaire: string;
  typeGeneration: 'BROUILLON' | 'PROGRESSIF' | 'FINALISATION';
  versionBulletin?: number;
  idUtilisateur: string;
  preparerPdf?: boolean;
}
