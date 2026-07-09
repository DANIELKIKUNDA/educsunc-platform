import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotUtilisateurAuth } from '../../../../../shared/auth/domain/repositories/DepotUtilisateurAuth';
import { ErreurOrganisationDejaExistante } from '../../../domain/exceptions/ErreurOrganisationDejaExistante';
import { ErreurOrganisationInvalide } from '../../../domain/exceptions/ErreurOrganisationInvalide';
import { Organisation } from '../../../domain/aggregates/Organisation';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotOrganisation } from '../../../domain/repositories/DepotOrganisation';
import { OrganisationId } from '../../../domain/value-objects/OrganisationId';
import { TypeOrganisation } from '../../../domain/value-objects/TypeOrganisation';
import { MettreAJourOrganisationEntree } from '../../dto/input/MettreAJourOrganisationEntree';
import { OrganisationSortie } from '../../dto/output/OrganisationSortie';
import { OrganisationApplicationMapper } from '../../mappers/OrganisationApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';

export interface SortieMettreAJourOrganisation {
  organisation: OrganisationSortie;
}

// Ce cas d usage orchestre la mutation complete d une fiche organisation sans casser les invariants existants.
export class MettreAJourOrganisation
  implements UseCase<MettreAJourOrganisationEntree, SortieMettreAJourOrganisation>
{
  private readonly depotOrganisation: DepotOrganisation;
  private readonly depotUtilisateurAuth?: DepotUtilisateurAuth;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;

  constructor(
    depotOrganisation: DepotOrganisation,
    depotUtilisateurAuth?: DepotUtilisateurAuth,
    policyAudit: PolicyAudit = new PolicyAudit(),
    serviceJournalAudit: ServiceJournalAuditReferentielAcademique =
      new ServiceJournalAuditReferentielAcademiqueSansEffet(),
  ) {
    this.depotOrganisation = depotOrganisation;
    this.depotUtilisateurAuth = depotUtilisateurAuth;
    this.policyAudit = policyAudit;
    this.serviceJournalAudit = serviceJournalAudit;
  }

  public async executer(
    entree: MettreAJourOrganisationEntree,
  ): Promise<SortieMettreAJourOrganisation> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageModification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'METTRE_A_JOUR_ORGANISATION',
      entreeValidee.modifiePar,
      horodatageModification,
    );

    const organisation = await this.depotOrganisation.trouverParId(
      new OrganisationId(entreeValidee.idOrganisation),
    );

    if (organisation === null) {
      throw new ErreurOrganisationInvalide("L'organisation a modifier est introuvable.");
    }

    const organisationPortantCeNom = await this.depotOrganisation.trouverParNom(entreeValidee.nom);
    if (
      organisationPortantCeNom !== null
      && !organisationPortantCeNom.obtenirId().estEgal(organisation.obtenirId())
    ) {
      throw new ErreurOrganisationDejaExistante('Une organisation avec ce nom existe deja.');
    }

    const ancienEtat = {
      nom: organisation.obtenirNom(),
      typeOrganisation: organisation.obtenirTypeOrganisation(),
      description: organisation.obtenirDescription(),
      promoteurPrincipal: {
        utilisateurId: organisation.obtenirPromoteurPrincipalUtilisateurId(),
        nomComplet: organisation.obtenirPromoteurPrincipalNomComplet(),
        email: organisation.obtenirPromoteurPrincipalEmail(),
        telephone: organisation.obtenirPromoteurPrincipalTelephone(),
        identifiant: organisation.obtenirPromoteurPrincipalIdentifiant(),
      },
    };

    await this.mettreAJourComptePromoteurSiNecessaire(organisation, entreeValidee);

    organisation.mettreAJourFiche({
      nom: entreeValidee.nom,
      typeOrganisation: entreeValidee.typeOrganisation,
      description: entreeValidee.description,
      modifiePar: entreeValidee.modifiePar,
      promoteurPrincipal: entreeValidee.promoteurPrincipal
        ? {
          utilisateurId: organisation.obtenirPromoteurPrincipalUtilisateurId(),
          nomComplet: entreeValidee.promoteurPrincipal.nomComplet,
          email: entreeValidee.promoteurPrincipal.email,
          telephone: entreeValidee.promoteurPrincipal.telephone,
          identifiant: entreeValidee.promoteurPrincipal.identifiant,
        }
        : undefined,
    });

    await this.depotOrganisation.sauvegarder(organisation);
    await this.serviceJournalAudit.journaliser({
      action: 'METTRE_A_JOUR_ORGANISATION',
      acteur: entreeValidee.modifiePar,
      typeRessource: 'ORGANISATION',
      idRessource: organisation.obtenirId().obtenirValeur(),
      idOrganisation: organisation.obtenirId().obtenirValeur(),
      details: {
        avant: ancienEtat,
        apres: {
          nom: organisation.obtenirNom(),
          typeOrganisation: organisation.obtenirTypeOrganisation(),
          description: organisation.obtenirDescription(),
          promoteurPrincipal: {
            utilisateurId: organisation.obtenirPromoteurPrincipalUtilisateurId(),
            nomComplet: organisation.obtenirPromoteurPrincipalNomComplet(),
            email: organisation.obtenirPromoteurPrincipalEmail(),
            telephone: organisation.obtenirPromoteurPrincipalTelephone(),
            identifiant: organisation.obtenirPromoteurPrincipalIdentifiant(),
          },
        },
      },
      creeLe: horodatageModification,
    });

    return {
      organisation: OrganisationApplicationMapper.versSortie(organisation),
    };
  }

  private async mettreAJourComptePromoteurSiNecessaire(
    organisation: Organisation,
    entree: MettreAJourOrganisationEntree,
  ): Promise<void> {
    const promoteurEntree = entree.promoteurPrincipal;
    const idUtilisateur = organisation.obtenirPromoteurPrincipalUtilisateurId();

    if (!promoteurEntree || !idUtilisateur || this.depotUtilisateurAuth === undefined) {
      return;
    }

    const utilisateur = await this.depotUtilisateurAuth.trouverParId(idUtilisateur);
    if (utilisateur === null) {
      return;
    }

    const emailNormalise = promoteurEntree.email?.trim().toLowerCase();
    const emailActuel = utilisateur.obtenirEmail().obtenirValeur().trim().toLowerCase();

    if (emailNormalise && emailNormalise !== emailActuel) {
      const utilisateurPorteur = await this.depotUtilisateurAuth.trouverParEmail(emailNormalise);
      if (utilisateurPorteur !== null && utilisateurPorteur.obtenirId() !== utilisateur.obtenirId()) {
        throw new ErreurOrganisationDejaExistante(
          "Un utilisateur existe deja avec l'email du responsable principal.",
        );
      }
    }

    utilisateur.mettreAJourProfil({
      nomComplet: promoteurEntree.nomComplet,
      email: emailNormalise || emailActuel,
      telephone: promoteurEntree.telephone,
    });
    await this.depotUtilisateurAuth.sauvegarder(utilisateur);
  }

  private validerEntree(
    entree: MettreAJourOrganisationEntree,
  ): MettreAJourOrganisationEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurOrganisationInvalide(
        "L'entree du cas d'usage MettreAJourOrganisation est obligatoire.",
      );
    }

    return {
      idOrganisation: this.validerTexteObligatoire(entree.idOrganisation, 'idOrganisation'),
      nom: this.validerTexteObligatoire(entree.nom, 'nom'),
      typeOrganisation: this.validerTypeOrganisation(entree.typeOrganisation),
      description: this.validerTexteOptionnel(entree.description),
      modifiePar: this.validerTexteObligatoire(entree.modifiePar, 'modifiePar'),
      promoteurPrincipal: this.validerPromoteur(entree.promoteurPrincipal),
    };
  }

  private validerPromoteur(
    valeur?: MettreAJourOrganisationEntree['promoteurPrincipal'],
  ): MettreAJourOrganisationEntree['promoteurPrincipal'] {
    if (valeur === undefined) {
      return undefined;
    }

    return {
      nomComplet: this.validerTexteObligatoire(valeur.nomComplet, 'promoteurPrincipal.nomComplet'),
      email: this.validerTexteOptionnel(valeur.email)?.toLowerCase(),
      telephone: this.validerTexteOptionnel(valeur.telephone),
      identifiant: this.validerTexteOptionnel(valeur.identifiant),
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
      throw new ErreurOrganisationInvalide(`Le champ "${nomChamp}" est obligatoire.`);
    }

    return valeurNettoyee;
  }

  private validerTexteOptionnel(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (typeof valeur !== 'string') {
      throw new ErreurOrganisationInvalide('Une valeur textuelle optionnelle est invalide.');
    }

    const valeurNettoyee = valeur.trim();
    return valeurNettoyee.length > 0 ? valeurNettoyee : undefined;
  }

  private validerTypeOrganisation(valeur: TypeOrganisation): TypeOrganisation {
    if (!Object.values(TypeOrganisation).includes(valeur)) {
      throw new ErreurOrganisationInvalide("Le type d'organisation fourni est invalide.");
    }

    return valeur;
  }
}
