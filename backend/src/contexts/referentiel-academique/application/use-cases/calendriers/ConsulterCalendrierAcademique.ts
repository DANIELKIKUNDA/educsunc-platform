import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurCalendrierInvalide } from '../../../domain/exceptions/ErreurCalendrierInvalide';
import { DepotCalendrierAcademique } from '../../../domain/repositories/DepotCalendrierAcademique';
import { CalendrierAcademiqueId } from '../../../domain/value-objects/CalendrierAcademiqueId';
import { ConsulterCalendrierAcademiqueEntree } from '../../dto/input/ConsulterCalendrierAcademiqueEntree';
import { CalendrierAcademiqueSortie } from '../../dto/output/CalendrierAcademiqueSortie';
import { CalendrierAcademiqueApplicationMapper } from '../../mappers/CalendrierAcademiqueApplicationMapper';

// Cette interface represente la sortie du cas d'usage ConsulterCalendrierAcademique.
export interface SortieConsulterCalendrierAcademique {
  calendrierAcademique: CalendrierAcademiqueSortie;
}

// Ce cas d'usage orchestre la consultation d'un calendrier academique.
export class ConsulterCalendrierAcademique
  implements UseCase<ConsulterCalendrierAcademiqueEntree, SortieConsulterCalendrierAcademique>
{
  private readonly depotCalendrierAcademique: DepotCalendrierAcademique;

  // Ce constructeur injecte les dependances applicatives necessaires a la consultation d'un calendrier academique.
  constructor(depotCalendrierAcademique: DepotCalendrierAcademique) {
    this.depotCalendrierAcademique = depotCalendrierAcademique;
  }

  // Cette methode consulte un calendrier academique existant a partir de son identifiant.
  public async executer(
    entree: ConsulterCalendrierAcademiqueEntree,
  ): Promise<SortieConsulterCalendrierAcademique> {
    const entreeValidee = this.validerEntree(entree);
    const calendrierAcademique = await this.depotCalendrierAcademique.trouverParId(
      new CalendrierAcademiqueId(entreeValidee.idCalendrierAcademique),
    );

    if (calendrierAcademique === null) {
      throw new ErreurCalendrierInvalide(
        'Le calendrier academique demande est introuvable.',
      );
    }

    return {
      calendrierAcademique: CalendrierAcademiqueApplicationMapper.versSortie(calendrierAcademique),
    };
  }

  private validerEntree(
    entree: ConsulterCalendrierAcademiqueEntree,
  ): ConsulterCalendrierAcademiqueEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurCalendrierInvalide(
        "L'entree du cas d'usage ConsulterCalendrierAcademique est obligatoire.",
      );
    }

    return {
      idCalendrierAcademique: this.validerTexteObligatoire(
        entree.idCalendrierAcademique,
        'idCalendrierAcademique',
      ),
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
      throw new ErreurCalendrierInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }
}
