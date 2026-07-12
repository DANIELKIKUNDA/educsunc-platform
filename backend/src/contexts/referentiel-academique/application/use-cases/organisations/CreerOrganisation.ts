import { UseCase } from '../../../../../shared/application/UseCase';
import { UtilisateurAuth } from '../../../../../shared/auth/domain/aggregates/UtilisateurAuth';
import { PasswordHashPort } from '../../../../../shared/auth/application/ports/crypto/PasswordHashPort';
import { DepotUtilisateurAuth } from '../../../../../shared/auth/domain/repositories/DepotUtilisateurAuth';
import { AffectationUtilisateur } from '../../../../../shared/security/domain/aggregates/AffectationUtilisateur';
import { Role } from '../../../../../shared/security/domain/aggregates/Role';
import { RoleRepositoryPort } from '../../../../../shared/security/application/ports/repositories/RoleRepositoryPort';
import { AffectationUtilisateurRepositoryPort } from '../../../../../shared/security/application/ports/repositories/AffectationUtilisateurRepositoryPort';
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
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';

interface PromoteurProvisionne {
  utilisateurId: string;
  nomComplet: string;
  email: string;
  telephone?: string;
  identifiant?: string;
  utilisateur: UtilisateurAuth;
  affectation: AffectationUtilisateur;
}

interface InitialisationConfigurationOrganisationPort {
  amorcerOrganisation(params: {
    readonly organisationId: string;
    readonly actorId?: string;
  }): Promise<unknown>;
}

const PERMISSIONS_PAR_DEFAUT_PROMOTEUR_ORGANISATION = [
  'referentiel.read',
  'eleves.read',
  'paiements.read',
  'utilisateurs.read',
  'audit.monitoring.read',
  'audit.analytics.read',
  'audit.security.read',
  'configuration.read',
  'configuration.create',
  'configuration.update',
  'configuration.delete',
  'configuration.lock',
  'configuration.unlock',
  'configuration.override',
  'configuration.effective.read',
  'configuration.snapshots.create',
  'configuration.snapshots.compare',
  'configuration.propagate',
  'configuration.reload',
  'configuration.validate',
  'configuration.modules.read',
  'configuration.modules.organization.write',
  'notifications.admin.archives.read',
  'notifications.admin.tenant.read',
  'notifications.admin.escalation.read',
  'notifications.realtime.read',
  'notifications.realtime.publish',
] as const;

// Cette interface represente la sortie du cas d'usage CreerOrganisation.
export interface SortieCreerOrganisation {
  organisation: OrganisationSortie;
}

// Ce cas d'usage orchestre la creation d'une organisation.
export class CreerOrganisation implements UseCase<CreerOrganisationEntree, SortieCreerOrganisation> {
  private readonly depotOrganisation: DepotOrganisation;
  private readonly policyAudit: PolicyAudit;
  private readonly depotUtilisateurAuth?: DepotUtilisateurAuth;
  private readonly roleRepository?: RoleRepositoryPort;
  private readonly affectationRepository?: AffectationUtilisateurRepositoryPort;
  private readonly passwordHashPort?: PasswordHashPort;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;

  // Ce constructeur injecte les dependances applicatives necessaires a la creation d'une organisation.
  constructor(
    depotOrganisation: DepotOrganisation,
    policyAudit: PolicyAudit = new PolicyAudit(),
    dependances?: {
      depotUtilisateurAuth?: DepotUtilisateurAuth;
      roleRepository?: RoleRepositoryPort;
      affectationRepository?: AffectationUtilisateurRepositoryPort;
      passwordHashPort?: PasswordHashPort;
      serviceJournalAudit?: ServiceJournalAuditReferentielAcademique;
      initialisationConfiguration?: InitialisationConfigurationOrganisationPort;
    },
  ) {
    this.depotOrganisation = depotOrganisation;
    this.policyAudit = policyAudit;
    this.depotUtilisateurAuth = dependances?.depotUtilisateurAuth;
    this.roleRepository = dependances?.roleRepository;
    this.affectationRepository = dependances?.affectationRepository;
    this.passwordHashPort = dependances?.passwordHashPort;
    this.serviceJournalAudit =
      dependances?.serviceJournalAudit
      ?? new ServiceJournalAuditReferentielAcademiqueSansEffet();
    this.initialisationConfiguration = dependances?.initialisationConfiguration;
  }

  private readonly initialisationConfiguration?: InitialisationConfigurationOrganisationPort;

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
    const organisationId = new OrganisationId();
    const promoteurProvisionne = await this.provisionnerPromoteurPrincipal(
      entreeValidee,
      organisationId.obtenirValeur(),
      horodatageCreation,
    );

    const organisation = new Organisation(
      organisationId,
      entreeValidee.code,
      entreeValidee.nom,
      entreeValidee.typeOrganisation,
      entreeValidee.description,
      entreeValidee.creePar,
      promoteurProvisionne?.utilisateurId,
      promoteurProvisionne?.nomComplet,
      promoteurProvisionne?.email,
      promoteurProvisionne?.telephone,
      promoteurProvisionne?.identifiant,
      true,
      horodatageCreation,
    );

    await this.depotOrganisation.sauvegarder(organisation);
    if (promoteurProvisionne !== undefined) {
      await this.depotUtilisateurAuth?.sauvegarder(promoteurProvisionne.utilisateur);
      await this.affectationRepository?.sauvegarder(promoteurProvisionne.affectation);
    }
    await this.initialisationConfiguration?.amorcerOrganisation({
      organisationId: organisation.obtenirId().obtenirValeur(),
      actorId: entreeValidee.creePar,
    });
    await this.serviceJournalAudit.journaliser({
      action: 'CREER_ORGANISATION',
      acteur: entreeValidee.creePar,
      typeRessource: 'ORGANISATION',
      idRessource: organisation.obtenirId().obtenirValeur(),
      idOrganisation: organisation.obtenirId().obtenirValeur(),
      details: {
        code: organisation.obtenirCode(),
        nom: organisation.obtenirNom(),
        typeOrganisation: organisation.obtenirTypeOrganisation(),
        responsablePrincipal: promoteurProvisionne?.nomComplet,
      },
      creeLe: horodatageCreation,
    });

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
      promoteurPrincipal: this.validerPromoteurPrincipal(entree.promoteurPrincipal),
    };
  }

  private async provisionnerPromoteurPrincipal(
    entree: CreerOrganisationEntree,
    idOrganisation: string,
    horodatageCreation: Date,
  ): Promise<PromoteurProvisionne | undefined> {
    if (entree.promoteurPrincipal === undefined) {
      return undefined;
    }

    if (
      this.depotUtilisateurAuth === undefined
      || this.roleRepository === undefined
      || this.affectationRepository === undefined
      || this.passwordHashPort === undefined
    ) {
      throw new ErreurOrganisationInvalide(
        'Le backend ne peut pas encore provisionner un promoteur principal sur cette instance.',
      );
    }

    const emailDejaPris = await this.depotUtilisateurAuth.existeEmail(
      entree.promoteurPrincipal.email,
    );

    if (emailDejaPris) {
      throw new ErreurOrganisationDejaExistante(
        "Un utilisateur existe deja avec l'email du promoteur principal.",
      );
    }

    const rolePromoteur = await this.assurerRolePromoteurOrganisation(entree.creePar);

    const motDePasseHash = await this.passwordHashPort.hacherMotDePasse(
      entree.promoteurPrincipal.motDePasseInitial,
    );
    const utilisateur = UtilisateurAuth.creer({
      nomComplet: entree.promoteurPrincipal.nomComplet,
      email: entree.promoteurPrincipal.email,
      telephone: entree.promoteurPrincipal.telephone,
      motDePasseHash,
      creeLe: horodatageCreation,
    });
    const affectation = AffectationUtilisateur.creer({
      idUtilisateur: utilisateur.obtenirId(),
      idRole: rolePromoteur.obtenirId(),
      niveauAcces: rolePromoteur.obtenirNiveauAcces().obtenirValeur(),
      idOrganisation,
      creePar: entree.creePar,
    });
    affectation.ajouterScope('ORGANISATION', idOrganisation);

    return {
      utilisateurId: utilisateur.obtenirId(),
      nomComplet: entree.promoteurPrincipal.nomComplet,
      email: entree.promoteurPrincipal.email,
      telephone: entree.promoteurPrincipal.telephone,
      identifiant: entree.promoteurPrincipal.identifiant,
      utilisateur,
      affectation,
    };
  }

  private async assurerRolePromoteurOrganisation(creePar: string): Promise<Role> {
    const roleExistant = await this.roleRepository?.trouverParCode('PROMOTEUR_ORGANISATION');
    if (roleExistant !== null && roleExistant !== undefined) {
      return roleExistant;
    }

    if (this.roleRepository === undefined) {
      throw new ErreurOrganisationInvalide(
        'Le backend ne peut pas encore initialiser le role PROMOTEUR_ORGANISATION sur cette instance.',
      );
    }

    const role = Role.creer({
      codeRole: 'PROMOTEUR_ORGANISATION',
      nomRole: 'Promoteur organisation',
      niveauAcces: 'ORGANISATION',
      permissions: [...PERMISSIONS_PAR_DEFAUT_PROMOTEUR_ORGANISATION],
      estSysteme: true,
      creePar,
    });
    await this.roleRepository.sauvegarder(role);
    return role;
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

  private validerPromoteurPrincipal(
    valeur?: CreerOrganisationEntree['promoteurPrincipal'],
  ): CreerOrganisationEntree['promoteurPrincipal'] {
    if (valeur === undefined) {
      return undefined;
    }

    return {
      nomComplet: this.validerTexteObligatoire(valeur.nomComplet, 'promoteurPrincipal.nomComplet'),
      email: this.validerTexteObligatoire(valeur.email, 'promoteurPrincipal.email').toLowerCase(),
      telephone: this.validerTexteOptionnel(valeur.telephone),
      identifiant: this.validerTexteOptionnel(valeur.identifiant),
      motDePasseInitial: this.validerTexteObligatoire(
        valeur.motDePasseInitial,
        'promoteurPrincipal.motDePasseInitial',
      ),
    };
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
