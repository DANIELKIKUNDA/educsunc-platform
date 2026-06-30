import { QualificationFinanciereEleve } from '../../domain/aggregates/QualificationFinanciereEleve';
import { QualificationFinanciereEleveOutput } from '../dto/output/QualificationsFinancieresSortieDTO';

export const versQualificationFinanciereEleveOutput = (
  qualification: QualificationFinanciereEleve,
): QualificationFinanciereEleveOutput => ({
  idQualification: qualification.obtenirId(),
  idOrganisation: qualification.obtenirIdOrganisation(),
  idEcole: qualification.obtenirIdEcole(),
  idEleve: qualification.obtenirIdEleve(),
  codeQualification: qualification.obtenirCodeQualification(),
  statut: qualification.obtenirStatut(),
  raison: qualification.obtenirRaison(),
  dateDebutEffet: qualification.obtenirDateDebutEffet(),
  dateFinEffet: qualification.obtenirDateFinEffet(),
  details: qualification.obtenirDetails(),
  creePar: qualification.obtenirCreePar(),
  creeLe: qualification.obtenirCreeLe().toISOString(),
  version: qualification.obtenirVersion(),
});
