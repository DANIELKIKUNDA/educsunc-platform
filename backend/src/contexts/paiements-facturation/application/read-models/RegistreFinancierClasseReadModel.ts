import type { Money } from '../../domain/value-objects/Money';

export type RegistreFinancierClasseTypeColonne =
  | 'MOIS'
  | 'TRANCHE_ETAT'
  | 'INSCRIPTION'
  | 'SITUATION_FINANCIERE';

export type StatutAffichageRegistreFinancierClasse =
  | 'AG'
  | 'EX'
  | 'EX50'
  | 'FN'
  | 'PC'
  | 'AB'
  | 'TR'
  | 'DC';

export interface RegistreFinancierClasseColonneReadModel {
  code: string;
  type: RegistreFinancierClasseTypeColonne;
  libelle: string;
  ordre: number;
  moisScolaire?: string;
  trancheFraisEtat?: string;
  typeFrais?: string;
}

export interface RegistreFinancierClasseCelluleReadModel {
  colonneCode: string;
  montantAttendu: Money;
  montantPaye: Money;
  montantExonere: Money;
  resteARecouvrer: Money;
  estRedevable: boolean;
  estEnOrdre: boolean;
  statutAffiche?: StatutAffichageRegistreFinancierClasse;
}

export interface RegistreFinancierClasseSituationEleveReadModel {
  montantAttendu: Money;
  montantPaye: Money;
  montantExonere: Money;
  resteARecouvrer: Money;
  estEnOrdre: boolean;
}

export interface RegistreFinancierClasseLigneEleveReadModel {
  numeroOrdre: number;
  idEleve: string;
  matricule?: string;
  nom: string;
  postNom?: string;
  prenom?: string;
  sexe?: string;
  dateInscription?: string;
  statutScolaire: string;
  cellules: ReadonlyArray<RegistreFinancierClasseCelluleReadModel>;
  situationFinanciere: RegistreFinancierClasseSituationEleveReadModel;
}

export interface RegistreFinancierClasseStatistiquesColonneReadModel {
  colonneCode: string;
  elevesRedevables: number;
  montantAttendu: Money;
  montantPaye: Money;
  resteARecouvrer: Money;
  elevesEnOrdre: number;
  elevesNonEnOrdre: number;
  tauxRecouvrement: number;
}

export interface RegistreFinancierClasseReadModel {
  idOrganisation: string;
  idEcole: string;
  idAnneeScolaire: string;
  idClassePedagogique: string;
  moisAnalyseJusqua?: string;
  colonnes: ReadonlyArray<RegistreFinancierClasseColonneReadModel>;
  lignes: ReadonlyArray<RegistreFinancierClasseLigneEleveReadModel>;
  statistiquesParColonne: ReadonlyArray<RegistreFinancierClasseStatistiquesColonneReadModel>;
}
