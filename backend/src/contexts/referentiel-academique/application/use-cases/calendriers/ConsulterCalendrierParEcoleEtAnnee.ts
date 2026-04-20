import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurCalendrierInvalide } from '../../../domain/exceptions/ErreurCalendrierInvalide';
import { DepotCalendrierAcademique } from '../../../domain/repositories/DepotCalendrierAcademique';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { ConsulterCalendrierParEcoleEtAnneeEntree } from '../../dto/input/ConsulterCalendrierParEcoleEtAnneeEntree';
import { CalendrierAcademiqueSortie } from '../../dto/output/CalendrierAcademiqueSortie';
import { CalendrierAcademiqueApplicationMapper } from '../../mappers/CalendrierAcademiqueApplicationMapper';

export interface SortieConsulterCalendrierParEcoleEtAnnee {
  calendrierAcademique: CalendrierAcademiqueSortie | null;
}

// Ce cas d'usage retrouve le calendrier academique local d'une ecole pour une annee scolaire.
export class ConsulterCalendrierParEcoleEtAnnee
  implements UseCase<ConsulterCalendrierParEcoleEtAnneeEntree, SortieConsulterCalendrierParEcoleEtAnnee>
{
  private readonly depotCalendrierAcademique: DepotCalendrierAcademique;

  // Ce constructeur injecte le depot local des calendriers academiques.
  constructor(depotCalendrierAcademique: DepotCalendrierAcademique) {
    this.depotCalendrierAcademique = depotCalendrierAcademique;
  }

  // Cette methode retourne le calendrier local s'il existe pour l'ecole et l'annee.
  public async executer(
    entree: ConsulterCalendrierParEcoleEtAnneeEntree,
  ): Promise<SortieConsulterCalendrierParEcoleEtAnnee> {
    const entreeValidee = this.validerEntree(entree);
    const calendrierAcademique = await this.depotCalendrierAcademique.trouverParEcoleEtAnnee(
      new EcoleId(entreeValidee.idEcole),
      new AnneeScolaireId(entreeValidee.idAnneeScolaire),
    );

    return {
      calendrierAcademique: calendrierAcademique === null
        ? null
        : CalendrierAcademiqueApplicationMapper.versSortie(calendrierAcademique),
    };
  }

  private validerEntree(
    entree: ConsulterCalendrierParEcoleEtAnneeEntree,
  ): ConsulterCalendrierParEcoleEtAnneeEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurCalendrierInvalide(
        "L'entree du cas d'usage ConsulterCalendrierParEcoleEtAnnee est obligatoire.",
      );
    }

    return {
      idEcole: this.validerTexteObligatoire(entree.idEcole, 'idEcole'),
      idAnneeScolaire: this.validerTexteObligatoire(entree.idAnneeScolaire, 'idAnneeScolaire'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurCalendrierInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurCalendrierInvalide(`Le champ "${nomChamp}" est obligatoire.`);
    }

    return valeurNettoyee;
  }
}
