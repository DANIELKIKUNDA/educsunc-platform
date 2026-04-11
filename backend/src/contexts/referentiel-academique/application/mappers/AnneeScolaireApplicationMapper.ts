import { AnneeScolaire } from '../../domain/aggregates/AnneeScolaire';
import { AnneeScolaireSortie } from '../dto/output/AnneeScolaireSortie';

// Ce mapper transforme l'agregat AnneeScolaire en DTO de sortie applicatif.
export class AnneeScolaireApplicationMapper {
  // Cette methode projette une annee scolaire de domaine vers un contrat de sortie stable.
  public static versSortie(anneeScolaire: AnneeScolaire): AnneeScolaireSortie {
    return {
      id: anneeScolaire.obtenirId().obtenirValeur(),
      idEcole: anneeScolaire.obtenirEcoleId().obtenirValeur(),
      code: anneeScolaire.obtenirCode(),
      libelle: anneeScolaire.obtenirLibelle(),
      dateDebut: anneeScolaire.obtenirDateDebut().toISOString(),
      dateFin: anneeScolaire.obtenirDateFin().toISOString(),
      statut: anneeScolaire.obtenirStatut(),
      active: anneeScolaire.estActive(),
      creeLe: anneeScolaire.obtenirCreeLe().toISOString(),
      version: anneeScolaire.obtenirVersion(),
      creePar: anneeScolaire.obtenirCreePar(),
      dateActivation: anneeScolaire.obtenirDateActivation()?.toISOString(),
      dateCloture: anneeScolaire.obtenirDateCloture()?.toISOString(),
      dateArchivage: anneeScolaire.obtenirDateArchivage()?.toISOString(),
      modifieLe: anneeScolaire.obtenirModifieLe()?.toISOString(),
      modifiePar: anneeScolaire.obtenirModifiePar(),
    };
  }
}
