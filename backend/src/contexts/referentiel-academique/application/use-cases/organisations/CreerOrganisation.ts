import { UseCase } from '../../../../../shared/application/UseCase';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotOrganisation } from '../../../domain/repositories/DepotOrganisation';
import { Organisation } from '../../../domain/aggregates/Organisation';
import { ErreurOrganisationDejaExistante } from '../../../domain/exceptions/ErreurOrganisationDejaExistante';
import { ErreurOrganisationInvalide } from '../../../domain/exceptions/ErreurOrganisationInvalide';
import { OrganisationId } from '../../../domain/value-objects/OrganisationId';
import { TypeOrganisation } from '../../../domain/value-objects/TypeOrganisation';
import { CreerOrganisationEntree } from '../../dto/input/CreerOrganisationEntree';
import { OrganisationSortie } from '../../dto/output/OrganisationSortie';
import { OrganisationApplicationMapper } from '../../mappers/OrganisationApplicationMapper';

// Cette interface represente la sortie du cas d'usage CreerOrganisation.
export interface SortieCreerOrganisation {
  organisation: OrganisationSortie;
}

// Ce cas d'usage orchestre la creation d'une organisation.
export class CreerOrganisation implements UseCase<CreerOrganisationEntree, SortieCreerOrganisation> {
  private readonly depotOrganisation: DepotOrganisation;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a la creation d'une organisation.
  constructor(
    depotOrganisation: DepotOrganisation,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotOrganisation = depotOrganisation;
    this.policyAudit = policyAudit;
  }

  // Cette methode cree une organisation apres validation de l'entree et controle d'unicite.
  public async executer(entree: CreerOrganisationEntree): Promise<SortieCreerOrganisation> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageCreation = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'CREER_ORGANISATION',
      entreeValidee.creePar,
      horodatageCreation,
    );

    await this.verifierUnicite(entreeValidee.code, entreeValidee.nom);

    const organisation = new Organisation(
      new OrganisationId(),
      entreeValidee.code,
      entreeValidee.nom,
      entreeValidee.typeOrganisation,
      entreeValidee.description,
      entreeValidee.creePar,
      true,
      horodatageCreation,
    );

    await this.depotOrganisation.sauvegarder(organisation);

    return {
      organisation: OrganisationApplicationMapper.versSortie(organisation),
    };
  }

  private async verifierUnicite(code: string, nom: string): Promise<void> {
    const organisationParCode = await this.depotOrganisation.trouverParCode(code);

    if (organisationParCode !== null) {
      throw new ErreurOrganisationDejaExistante(
        'Une organisation avec ce code existe deja.',
      );
    }

    const organisationParNom = await this.depotOrganisation.trouverParNom(nom);

    if (organisationParNom !== null) {
      throw new ErreurOrganisationDejaExistante(
        'Une organisation avec ce nom existe deja.',
      );
    }
  }

  private validerEntree(entree: CreerOrganisationEntree): CreerOrganisationEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurOrganisationInvalide(
        "L'entree du cas d'usage CreerOrganisation est obligatoire.",
      );
    }

    const code = this.validerTexteObligatoire(entree.code, 'code');
    const nom = this.validerTexteObligatoire(entree.nom, 'nom');
    const creePar = this.validerTexteObligatoire(entree.creePar, 'creePar');
    const typeOrganisation = this.validerTypeOrganisation(entree.typeOrganisation);
    const description = this.validerTexteOptionnel(entree.description);

    return {
      code,
      nom,
      creePar,
      typeOrganisation,
      description,
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

  private validerTexteOptionnel(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (typeof valeur !== 'string') {
      throw new ErreurOrganisationInvalide(
        'La description doit etre une chaine de caracteres si elle est fournie.',
      );
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length > 0 ? valeurNettoyee : undefined;
  }

  private validerTypeOrganisation(valeur: TypeOrganisation): TypeOrganisation {
    if (!Object.values(TypeOrganisation).includes(valeur)) {
      throw new ErreurOrganisationInvalide(
        "Le type d'organisation fourni est invalide.",
      );
    }

    return valeur;
  }
}
