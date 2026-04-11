import { CalendrierAcademique } from '../aggregates/CalendrierAcademique';
import { AnneeScolaireId } from '../value-objects/AnneeScolaireId';
import { CalendrierAcademiqueId } from '../value-objects/CalendrierAcademiqueId';
import { EcoleId } from '../value-objects/EcoleId';

// Ce depot definit le contrat de persistance des calendriers academiques locaux.
export interface DepotCalendrierAcademique {
  // Cette methode recherche un calendrier academique par son identifiant metier.
  trouverParId(
    idCalendrierAcademique: CalendrierAcademiqueId,
  ): Promise<CalendrierAcademique | null>;

  // Cette methode retrouve le calendrier d'une ecole pour une annee donnee.
  trouverParEcoleEtAnnee(
    idEcole: EcoleId,
    idAnneeScolaire: AnneeScolaireId,
  ): Promise<CalendrierAcademique | null>;

  // Cette methode persiste l'etat courant d'un calendrier academique.
  sauvegarder(calendrierAcademique: CalendrierAcademique): Promise<void>;
}
