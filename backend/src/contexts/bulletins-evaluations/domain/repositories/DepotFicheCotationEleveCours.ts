import { FicheCotationEleveCours } from '../aggregates/FicheCotationEleveCours';
import { HistoriqueModificationCote } from '../entities/HistoriqueModificationCote';

// Ce contrat abstrait la persistence des fiches de cotation d'un eleve pour un cours.
export interface DepotFicheCotationEleveCours {
  sauvegarder(ficheCotationEleveCours: FicheCotationEleveCours): Promise<void>;
  trouverParId(idFicheCotationEleveCours: string): Promise<FicheCotationEleveCours | null>;
  trouverParEleveCoursEtAnnee(idEleve: string, idReferentielCours: string, idAnneeScolaire: string): Promise<FicheCotationEleveCours | null>;
  listerParEleve(idEleve: string, idAnneeScolaire: string): Promise<FicheCotationEleveCours[]>;
  listerParClasseEtCours(idClassePedagogique: string, idReferentielCours: string, idAnneeScolaire: string): Promise<FicheCotationEleveCours[]>;
  listerParClasseEtColonne(idClassePedagogique: string, codeColonne: string, idAnneeScolaire: string): Promise<FicheCotationEleveCours[]>;
  existeFichePourEleveCoursAnnee(idEleve: string, idReferentielCours: string, idAnneeScolaire: string): Promise<boolean>;
  ajouterHistoriqueModificationCote(historiqueModificationCote: HistoriqueModificationCote): Promise<void>;
  listerHistoriqueModifications(idFicheCotationEleveCours: string): Promise<HistoriqueModificationCote[]>;
}
