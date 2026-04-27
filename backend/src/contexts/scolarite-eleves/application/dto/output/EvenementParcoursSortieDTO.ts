import { TypeEvenementParcours } from '../../../domain/value-objects/TypeEvenementParcours';

// Ce fichier definit la sortie applicative d'un evenement de parcours.
export interface EvenementParcoursSortieDTO {
  idEvenementParcours: string;
  typeEvenement: TypeEvenementParcours;
  dateEvenement: string;
  idAnneeScolaire?: string;
  idClassePedagogique?: string;
  referenceMetier?: string;
  description?: string;
  declenchePar: string;
}
