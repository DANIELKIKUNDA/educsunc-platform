import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurOrganisationInvalide } from '../../../domain/exceptions/ErreurOrganisationInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotOrganisation } from '../../../domain/repositories/DepotOrganisation';
import { OrganisationId } from '../../../domain/value-objects/OrganisationId';
import { DesactiverOrganisationEntree } from '../../dto/input/DesactiverOrganisationEntree';
import { OrganisationSortie } from '../../dto/output/OrganisationSortie';
import { OrganisationApplicationMapper } from '../../mappers/OrganisationApplicationMapper';

// Cette interface represente la sortie du cas d'usage DesactiverOrganisation.
export interface SortieDesactiverOrganisation {
  organisation: OrganisationSortie;
}

// Ce cas d'usage orchestre la desactivation d'une organisation.
export class DesactiverOrganisation implements UseCase<DesactiverOrganisationEntree, SortieDesactiverOrganisation> {
  private readonly depotOrganisation: DepotOrganisation;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a la desactivation d'une organisation.
  constructor(
    depotOrganisation: DepotOrganisation,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotOrganisation = depotOrganisation;
    this.policyAudit = policyAudit;
  }

  // Cette methode desactive une organisation existante si elle est encore active.
  public async executer(entree: DesactiverOrganisationEntree): Promise<SortieDesactiverOrganisation> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageModification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'DESACTIVER_ORGANISATION',
      entreeValidee.modifiePar,
      horodatageModification,
    );

    const organisation = await this.depotOrganisation.trouverParId(
      new OrganisationId(entreeValidee.idOrganisation),
    );

    if (organisation === null) {
      throw new ErreurOrganisationInvalide(
        "L'organisation a desactiver est introuvable.",
      );
    }

    if (organisation.estActif()) {
      organisation.desactiver(entreeValidee.modifiePar);
      await this.depotOrganisation.sauvegarder(organisation);
    }

    return {
      organisation: OrganisationApplicationMapper.versSortie(organisation),
    };
  }

  private validerEntree(entree: DesactiverOrganisationEntree): DesactiverOrganisationEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurOrganisationInvalide(
        "L'entree du cas d'usage DesactiverOrganisation est obligatoire.",
      );
    }

    return {
      idOrganisation: this.validerTexteObligatoire(entree.idOrganisation, 'idOrganisation'),
      modifiePar: this.validerTexteObligatoire(entree.modifiePar, 'modifiePar'),
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
