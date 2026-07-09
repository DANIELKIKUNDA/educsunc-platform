import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurOrganisationDejaExistante } from '../../../domain/exceptions/ErreurOrganisationDejaExistante';
import { ErreurOrganisationInvalide } from '../../../domain/exceptions/ErreurOrganisationInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotOrganisation } from '../../../domain/repositories/DepotOrganisation';
import { OrganisationId } from '../../../domain/value-objects/OrganisationId';
import { RenommerOrganisationEntree } from '../../dto/input/RenommerOrganisationEntree';
import { OrganisationSortie } from '../../dto/output/OrganisationSortie';
import { OrganisationApplicationMapper } from '../../mappers/OrganisationApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';

// Cette interface represente la sortie du cas d'usage RenommerOrganisation.
export interface SortieRenommerOrganisation {
  organisation: OrganisationSortie;
}

// Ce cas d'usage orchestre le renommage d'une organisation.
export class RenommerOrganisation implements UseCase<RenommerOrganisationEntree, SortieRenommerOrganisation> {
  private readonly depotOrganisation: DepotOrganisation;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;

  // Ce constructeur injecte les dependances applicatives necessaires au renommage d'une organisation.
  constructor(
    depotOrganisation: DepotOrganisation,
    policyAudit: PolicyAudit = new PolicyAudit(),
    serviceJournalAudit: ServiceJournalAuditReferentielAcademique =
      new ServiceJournalAuditReferentielAcademiqueSansEffet(),
  ) {
    this.depotOrganisation = depotOrganisation;
    this.policyAudit = policyAudit;
    this.serviceJournalAudit = serviceJournalAudit;
  }

  // Cette methode renomme une organisation existante apres validation et controle d'unicite.
  public async executer(entree: RenommerOrganisationEntree): Promise<SortieRenommerOrganisation> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageModification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'RENOMMER_ORGANISATION',
      entreeValidee.modifiePar,
      horodatageModification,
    );

    const organisation = await this.depotOrganisation.trouverParId(
      new OrganisationId(entreeValidee.idOrganisation),
    );

    if (organisation === null) {
      throw new ErreurOrganisationInvalide(
        "L'organisation a renommer est introuvable.",
      );
    }

    const organisationPortantCeNom = await this.depotOrganisation.trouverParNom(
      entreeValidee.nouveauNom,
    );

    if (
      organisationPortantCeNom !== null
      && !organisationPortantCeNom.obtenirId().estEgal(organisation.obtenirId())
    ) {
      throw new ErreurOrganisationDejaExistante(
        'Une organisation avec ce nom existe deja.',
      );
    }

    const ancienNom = organisation.obtenirNom();
    organisation.renommer(entreeValidee.nouveauNom, entreeValidee.modifiePar);

    await this.depotOrganisation.sauvegarder(organisation);
    await this.serviceJournalAudit.journaliser({
      action: 'RENOMMER_ORGANISATION',
      acteur: entreeValidee.modifiePar,
      typeRessource: 'ORGANISATION',
      idRessource: organisation.obtenirId().obtenirValeur(),
      idOrganisation: organisation.obtenirId().obtenirValeur(),
      details: {
        ancienNom,
        nouveauNom: organisation.obtenirNom(),
      },
      creeLe: horodatageModification,
    });

    return {
      organisation: OrganisationApplicationMapper.versSortie(organisation),
    };
  }

  private validerEntree(entree: RenommerOrganisationEntree): RenommerOrganisationEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurOrganisationInvalide(
        "L'entree du cas d'usage RenommerOrganisation est obligatoire.",
      );
    }

    return {
      idOrganisation: this.validerTexteObligatoire(entree.idOrganisation, 'idOrganisation'),
      nouveauNom: this.validerTexteObligatoire(entree.nouveauNom, 'nouveauNom'),
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
