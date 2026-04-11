import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurProgrammeNiveauInvalide } from '../../../domain/exceptions/ErreurProgrammeNiveauInvalide';
import { DepotProgrammeNiveau } from '../../../domain/repositories/DepotProgrammeNiveau';
import { ProgrammeNiveauId } from '../../../domain/value-objects/ProgrammeNiveauId';
import { ConsulterProgrammeNiveauEntree } from '../../dto/input/ConsulterProgrammeNiveauEntree';
import { ProgrammeNiveauSortie } from '../../dto/output/ProgrammeNiveauSortie';
import { ProgrammeNiveauApplicationMapper } from '../../mappers/ProgrammeNiveauApplicationMapper';

// Cette interface represente la sortie du cas d'usage ConsulterProgrammeNiveau.
export interface SortieConsulterProgrammeNiveau {
  programmeNiveau: ProgrammeNiveauSortie;
}

// Ce cas d'usage orchestre la consultation d'un programme niveau.
export class ConsulterProgrammeNiveau
  implements UseCase<ConsulterProgrammeNiveauEntree, SortieConsulterProgrammeNiveau>
{
  private readonly depotProgrammeNiveau: DepotProgrammeNiveau;

  // Ce constructeur injecte les dependances applicatives necessaires a la consultation d'un programme niveau.
  constructor(depotProgrammeNiveau: DepotProgrammeNiveau) {
    this.depotProgrammeNiveau = depotProgrammeNiveau;
  }

  // Cette methode consulte un programme niveau existant a partir de son identifiant.
  public async executer(
    entree: ConsulterProgrammeNiveauEntree,
  ): Promise<SortieConsulterProgrammeNiveau> {
    const entreeValidee = this.validerEntree(entree);
    const programmeNiveau = await this.depotProgrammeNiveau.trouverParId(
      new ProgrammeNiveauId(entreeValidee.idProgrammeNiveau),
    );

    if (programmeNiveau === null) {
      throw new ErreurProgrammeNiveauInvalide(
        'Le programme niveau demande est introuvable.',
      );
    }

    return {
      programmeNiveau: ProgrammeNiveauApplicationMapper.versSortie(programmeNiveau),
    };
  }

  private validerEntree(
    entree: ConsulterProgrammeNiveauEntree,
  ): ConsulterProgrammeNiveauEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurProgrammeNiveauInvalide(
        "L'entree du cas d'usage ConsulterProgrammeNiveau est obligatoire.",
      );
    }

    return {
      idProgrammeNiveau: this.validerTexteObligatoire(entree.idProgrammeNiveau, 'idProgrammeNiveau'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurProgrammeNiveauInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurProgrammeNiveauInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }
}
