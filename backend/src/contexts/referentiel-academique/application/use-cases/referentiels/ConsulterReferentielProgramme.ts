import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurProgrammeInvalide } from '../../../domain/exceptions/ErreurProgrammeInvalide';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import { ReferentielProgrammeId } from '../../../domain/value-objects/ReferentielProgrammeId';
import { ConsulterReferentielProgrammeEntree } from '../../dto/input/ConsulterReferentielProgrammeEntree';
import { ReferentielProgrammeSortie } from '../../dto/output/ReferentielProgrammeSortie';
import { ReferentielProgrammeApplicationMapper } from '../../mappers/ReferentielProgrammeApplicationMapper';

// Cette interface represente la sortie du cas d'usage ConsulterReferentielProgramme.
export interface SortieConsulterReferentielProgramme {
  referentielProgramme: ReferentielProgrammeSortie;
}

// Ce cas d'usage orchestre la consultation d'un referentiel programme.
export class ConsulterReferentielProgramme
  implements UseCase<ConsulterReferentielProgrammeEntree, SortieConsulterReferentielProgramme>
{
  private readonly depotReferentielProgramme: DepotReferentielProgramme;

  // Ce constructeur injecte les dependances applicatives necessaires a la consultation d'un referentiel programme.
  constructor(depotReferentielProgramme: DepotReferentielProgramme) {
    this.depotReferentielProgramme = depotReferentielProgramme;
  }

  // Cette methode consulte un referentiel programme a partir de son identifiant.
  public async executer(
    entree: ConsulterReferentielProgrammeEntree,
  ): Promise<SortieConsulterReferentielProgramme> {
    const entreeValidee = this.validerEntree(entree);
    const referentielProgramme = await this.depotReferentielProgramme.trouverParId(
      new ReferentielProgrammeId(entreeValidee.idReferentielProgramme),
    );

    if (referentielProgramme === null) {
      throw new ErreurProgrammeInvalide(
        'Le referentiel programme demande est introuvable.',
      );
    }

    return {
      referentielProgramme: ReferentielProgrammeApplicationMapper.versSortie(referentielProgramme),
    };
  }

  private validerEntree(
    entree: ConsulterReferentielProgrammeEntree,
  ): ConsulterReferentielProgrammeEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurProgrammeInvalide(
        "L'entree du cas d'usage ConsulterReferentielProgramme est obligatoire.",
      );
    }

    return {
      idReferentielProgramme: this.validerTexteObligatoire(
        entree.idReferentielProgramme,
        'idReferentielProgramme',
      ),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurProgrammeInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurProgrammeInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }
}
