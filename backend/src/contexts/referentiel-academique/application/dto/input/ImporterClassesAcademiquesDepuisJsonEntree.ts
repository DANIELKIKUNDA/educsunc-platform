import { TypeStructureEvaluation } from '../../../domain/value-objects/TypeStructureEvaluation';

// Cette interface represente une classe academique brute importee depuis un contenu JSON deja parse.
export interface EnregistrementClasseAcademiqueJson {
  idSectionScolaire: string;
  idOptionEtude?: string;
  code: string;
  libelle: string;
  ordrePedagogique: number;
  cycle: string;
  accepteOptions: boolean;
  optionObligatoire: boolean;
  typeStructureEvaluation: TypeStructureEvaluation;
}

// Ce DTO represente les donnees attendues pour importer les classes academiques depuis un JSON.
export interface ImporterClassesAcademiquesDepuisJsonEntree {
  classesAcademiques: EnregistrementClasseAcademiqueJson[];
  importePar: string;
}
