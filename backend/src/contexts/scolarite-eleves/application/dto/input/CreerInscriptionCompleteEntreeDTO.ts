import { CreerEleveEntreeDTO } from './CreerEleveEntreeDTO';
import { CreerInscriptionScolaireEntreeDTO } from './CreerInscriptionScolaireEntreeDTO';
import { AffecterEleveAClasseEntreeDTO } from './AffecterEleveAClasseEntreeDTO';

// Ce fichier definit l'entree d'une inscription complete eleve + inscription + affectation optionnelle.
export interface CreerInscriptionCompleteEntreeDTO {
  eleve: CreerEleveEntreeDTO;
  inscription: CreerInscriptionScolaireEntreeDTO;
  affectation?: AffecterEleveAClasseEntreeDTO;
}
