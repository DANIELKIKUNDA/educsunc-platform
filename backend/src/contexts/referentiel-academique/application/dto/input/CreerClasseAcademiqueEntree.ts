import { TypeStructureEvaluation } from '../../../domain/value-objects/TypeStructureEvaluation';

// Ce DTO represente les donnees attendues pour creer une classe academique.
export interface CreerClasseAcademiqueEntree {
  idSectionScolaire: string;
  code: string;
  libelle: string;
  ordrePedagogique: number;
  cycle: string;
  accepteOptions: boolean;
  optionObligatoire: boolean;
  typeStructureEvaluation: TypeStructureEvaluation;
  idOptionEtude?: string;
  creePar: string;
}
