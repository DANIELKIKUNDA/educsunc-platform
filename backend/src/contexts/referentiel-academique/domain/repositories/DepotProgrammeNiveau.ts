import { Pagination, ResultatPagine } from '../../../../shared/application/Pagination';
import { ProgrammeNiveau } from '../aggregates/ProgrammeNiveau';
import { AnneeScolaireId } from '../value-objects/AnneeScolaireId';
import { ClasseAcademiqueId } from '../value-objects/ClasseAcademiqueId';
import { EcoleId } from '../value-objects/EcoleId';
import { ProgrammeNiveauId } from '../value-objects/ProgrammeNiveauId';

// Ce depot definit le contrat de persistance des programmes locaux d'exploitation.
export interface DepotProgrammeNiveau {
  // Cette methode recherche un programme niveau par son identifiant metier.
  trouverParId(idProgrammeNiveau: ProgrammeNiveauId): Promise<ProgrammeNiveau | null>;

  // Cette methode retrouve le programme niveau valide pour une ecole, une annee et une classe.
  trouverValideParContexte(
    idEcole: EcoleId,
    idAnneeScolaire: AnneeScolaireId,
    idClasseAcademique: ClasseAcademiqueId,
  ): Promise<ProgrammeNiveau | null>;

  // Cette methode liste les programmes niveau d'une ecole pour une annee donnee.
  listerParEcoleEtAnnee(
    idEcole: EcoleId,
    idAnneeScolaire: AnneeScolaireId,
    pagination: Pagination,
  ): Promise<ResultatPagine<ProgrammeNiveau>>;

  // Cette methode persiste l'etat courant d'un programme niveau.
  sauvegarder(programmeNiveau: ProgrammeNiveau): Promise<void>;
}
