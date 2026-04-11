import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurOrganisationInvalide } from '../../../domain/exceptions/ErreurOrganisationInvalide';
import { DepotOrganisation } from '../../../domain/repositories/DepotOrganisation';
import { OrganisationId } from '../../../domain/value-objects/OrganisationId';
import { ConsulterOrganisationEntree } from '../../dto/input/ConsulterOrganisationEntree';
import { OrganisationSortie } from '../../dto/output/OrganisationSortie';
import { OrganisationApplicationMapper } from '../../mappers/OrganisationApplicationMapper';

// Cette interface represente la sortie du cas d'usage ConsulterOrganisation.
export interface SortieConsulterOrganisation {
  organisation: OrganisationSortie;
}

// Ce cas d'usage orchestre la consultation d'une organisation.
export class ConsulterOrganisation implements UseCase<ConsulterOrganisationEntree, SortieConsulterOrganisation> {
  private readonly depotOrganisation: DepotOrganisation;

  // Ce constructeur injecte les dependances applicatives necessaires a la consultation d'une organisation.
  constructor(depotOrganisation: DepotOrganisation) {
    this.depotOrganisation = depotOrganisation;
  }

  // Cette methode consulte une organisation par son identifiant metier.
  public async executer(entree: ConsulterOrganisationEntree): Promise<SortieConsulterOrganisation> {
    const entreeValidee = this.validerEntree(entree);

    const organisation = await this.depotOrganisation.trouverParId(
      new OrganisationId(entreeValidee.idOrganisation),
    );

    if (organisation === null) {
      throw new ErreurOrganisationInvalide(
        "L'organisation consultee est introuvable.",
      );
    }

    return {
      organisation: OrganisationApplicationMapper.versSortie(organisation),
    };
  }

  private validerEntree(entree: ConsulterOrganisationEntree): ConsulterOrganisationEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurOrganisationInvalide(
        "L'entree du cas d'usage ConsulterOrganisation est obligatoire.",
      );
    }

    return {
      idOrganisation: this.validerTexteObligatoire(entree.idOrganisation, 'idOrganisation'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurOrganisationInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurOrganisationInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }
}
