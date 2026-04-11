import { TypeStructureEvaluation } from '../../../domain/value-objects/TypeStructureEvaluation';
import { PeriodeCalendrierEntree } from './PeriodeCalendrierEntree';

// Ce DTO represente les donnees attendues pour creer un calendrier academique.
export interface CreerCalendrierAcademiqueEntree {
  idEcole: string;
  idAnneeScolaire: string;
  typeStructureEvaluation: TypeStructureEvaluation;
  dateDebutAnnee: Date;
  dateFinAnnee: Date;
  periodes: PeriodeCalendrierEntree[];
  creePar: string;
}
