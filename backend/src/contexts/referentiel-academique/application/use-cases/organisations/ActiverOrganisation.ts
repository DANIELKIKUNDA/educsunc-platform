import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurOrganisationInvalide } from '../../../domain/exceptions/ErreurOrganisationInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotOrganisation } from '../../../domain/repositories/DepotOrganisation';
import { OrganisationId } from '../../../domain/value-objects/OrganisationId';
import { ActiverOrganisationEntree } from '../../dto/input/ActiverOrganisationEntree';
import { OrganisationSortie } from '../../dto/output/OrganisationSortie';
import { OrganisationApplicationMapper } from '../../mappers/OrganisationApplicationMapper';

// Cette interface represente la sortie du cas d'usage ActiverOrganisation.
export interface SortieActiverOrganisation {
  organisation: OrganisationSortie;
}

// Ce cas d'usage orchestre l'activation d'une organisation.
export class ActiverOrganisation implements UseCase<ActiverOrganisationEntree, SortieActiverOrganisation> {
  private readonly depotOrganisation: DepotOrganisation;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a l'activation d'une organisation.
  constructor(
    depotOrganisation: DepotOrganisation,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotOrganisation = depotOrganisation;
    this.policyAudit = policyAudit;
  }

  // Cette methode active une organisation existante si elle ne l'est pas deja.
  public async executer(entree: ActiverOrganisationEntree): Promise<SortieActiverOrganisation> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageModification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'ACTIVER_ORGANISATION',
      entreeValidee.modifiePar,
      horodatageModification,
    );

    const organisation = await this.depotOrganisation.trouverParId(
      new OrganisationId(entreeValidee.idOrganisation),
    );

    if (organisation === null) {
      throw new ErreurOrganisationInvalide(
        "L'organisation a activer est introuvable.",
      );
    }

    if (!organisation.estActif()) {
      organisation.activer(entreeValidee.modifiePar);
      await this.depotOrganisation.sauvegarder(organisation);
    }

    return {
      organisation: OrganisationApplicationMapper.versSortie(organisation),
    };
  }

  private validerEntree(entree: ActiverOrganisationEntree): ActiverOrganisationEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurOrganisationInvalide(
        "L'entree du cas d'usage ActiverOrganisation est obligatoire.",
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
