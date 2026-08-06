export interface TitulariatEffectifReadModel {
  idOrganisation: string;
  idEcole: string;
  idClasse: string;
  idAnneeScolaire: string;
  idSectionScolaire: string;
  source: 'AFFECTATION_TITULARIAT' | 'RESPONSABILITE_CLASSE';
}
