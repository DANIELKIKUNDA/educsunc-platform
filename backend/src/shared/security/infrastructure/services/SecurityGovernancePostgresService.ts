import { randomUUID } from 'node:crypto';
import { PolicyMotDePasseInitial, UtilisateurAuth } from '../../../auth/domain';
import {
  PasswordInfrastructureService,
  PostgresRefreshTokenRepository,
  PostgresSessionUtilisateurRepository,
  PostgresUtilisateurAuthRepository,
  obtenirClientPostgresAuth,
} from '../../../auth/infrastructure';
import type { SqlQueryClient } from '../../../infrastructure/persistence/SqlQueryClient';
import { AffectationUtilisateur, Role } from '../../domain';
import { PostgresAffectationUtilisateurRepository, PostgresRoleRepository } from '../persistence/postgres/repositories';
import { SecurityAuditInfrastructureService } from './SecurityAuditInfrastructureService';

type NiveauGouvernance = 'PLATEFORME' | 'ORGANISATION' | 'ECOLE';
type ClientTransactionnel = SqlQueryClient & { dansTransaction<T>(operation: () => Promise<T>): Promise<T> };

export class SecurityGovernanceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statutHttp: number,
  ) {
    super(message);
    this.name = 'SecurityGovernanceError';
  }
}

export interface CreerCompteSecuriteInput {
  nomComplet: string;
  email: string;
  telephone?: string;
  motDePasseInitial: string;
  codeRole: string;
  niveau: NiveauGouvernance;
  organisationId?: string;
  ecoleId?: string;
  motif?: string;
}

interface ContexteMutation {
  auteurId: string;
  traceId?: string;
  motif?: string;
}

interface AffectationAdminRow {
  id_affectation_utilisateur: string;
  id_utilisateur: string;
  code_role: string;
  niveau_acces: NiveauGouvernance;
  id_organisation: string | null;
  id_ecole: string | null;
}

const ROLES_ADMIN_PAR_NIVEAU: Readonly<Record<NiveauGouvernance, string>> = {
  PLATEFORME: 'MANAGER_SYSTEME',
  ORGANISATION: 'ADMIN_SYSTEME_ORGANISATION',
  ECOLE: 'ADMIN_SYSTEME_ECOLE',
};

export class SecurityGovernancePostgresService {
  private readonly utilisateurs: PostgresUtilisateurAuthRepository;
  private readonly sessions: PostgresSessionUtilisateurRepository;
  private readonly refreshTokens: PostgresRefreshTokenRepository;
  private readonly roles: PostgresRoleRepository;
  private readonly affectations: PostgresAffectationUtilisateurRepository;
  private readonly motsDePasse = new PasswordInfrastructureService();
  private readonly audit: SecurityAuditInfrastructureService;

  constructor(private readonly client: ClientTransactionnel = obtenirClientPostgresAuth()) {
    this.utilisateurs = new PostgresUtilisateurAuthRepository(client);
    this.sessions = new PostgresSessionUtilisateurRepository(client);
    this.refreshTokens = new PostgresRefreshTokenRepository(client);
    this.roles = new PostgresRoleRepository(client);
    this.affectations = new PostgresAffectationUtilisateurRepository(client);
    this.audit = new SecurityAuditInfrastructureService(client);
  }

  public async obtenirVueEnsemble(): Promise<Record<string, number>> {
    const resultat = await this.client.executer<Record<string, string>>(`
      SELECT
        (SELECT COUNT(DISTINCT a.id_utilisateur) FROM security_affectations_utilisateurs a
          JOIN security_roles r ON r.id_role=a.id_role JOIN auth_utilisateurs u ON u.id_utilisateur=a.id_utilisateur
          WHERE r.niveau_acces='PLATEFORME' AND a.etat_affectation='ACTIVE' AND u.etat_compte='ACTIVE')::text AS comptes_plateforme_actifs,
        (SELECT COUNT(*) FROM auth_utilisateurs WHERE etat_compte='SUSPENDED' AND supprime_logiquement=FALSE)::text AS comptes_suspendus,
        (SELECT COUNT(*) FROM auth_utilisateurs WHERE compte_verrouille_jusqua>NOW() AND supprime_logiquement=FALSE)::text AS comptes_verrouilles,
        (SELECT COUNT(*) FROM auth_sessions_utilisateurs WHERE revoquee_le IS NULL)::text AS sessions_actives,
        (SELECT COUNT(*) FROM auth_tentatives_connexion WHERE date_tentative>NOW()-INTERVAL '24 hours' AND reussie=FALSE)::text AS tentatives_echouees_recentes,
        (SELECT COUNT(*) FROM organisations o WHERE NOT EXISTS (
          SELECT 1 FROM security_affectations_utilisateurs a JOIN security_roles r ON r.id_role=a.id_role
          JOIN auth_utilisateurs u ON u.id_utilisateur=a.id_utilisateur
          WHERE a.id_organisation=o.id::text AND r.code_role='ADMIN_SYSTEME_ORGANISATION'
            AND a.etat_affectation='ACTIVE' AND u.etat_compte='ACTIVE'))::text AS organisations_sans_administrateur,
        (SELECT COUNT(*) FROM ecoles e WHERE NOT EXISTS (
          SELECT 1 FROM security_affectations_utilisateurs a JOIN security_roles r ON r.id_role=a.id_role
          JOIN auth_utilisateurs u ON u.id_utilisateur=a.id_utilisateur
          WHERE a.id_ecole=e.id::text AND r.code_role='ADMIN_SYSTEME_ECOLE'
            AND a.etat_affectation='ACTIVE' AND u.etat_compte='ACTIVE'))::text AS ecoles_sans_administrateur
    `);
    return Object.fromEntries(Object.entries(resultat.lignes[0] ?? {}).map(([cle, valeur]) => [cle, Number(valeur)]));
  }

  public async listerCataloguePermissions(): Promise<readonly Record<string, unknown>[]> {
    const resultat = await this.client.executer<Record<string, unknown>>(`
      SELECT permission,
        split_part(permission,'.',1) AS domaine,
        COUNT(DISTINCT id_role)::int AS nombre_roles
      FROM security_permissions_roles
      GROUP BY permission ORDER BY split_part(permission,'.',1),permission`);
    return resultat.lignes;
  }

  public async listerRoles(): Promise<readonly Record<string, unknown>[]> {
    const resultat = await this.client.executer<Record<string, unknown>>(`
      SELECT r.id_role AS "idRole",r.code_role AS "codeRole",r.nom_role AS "nomRole",
        r.description,r.niveau_acces AS "niveauAcces",r.est_actif AS "estActif",r.est_systeme AS "estSysteme",
        COUNT(DISTINCT p.id_permission_role)::int AS "nombrePermissions",
        COUNT(DISTINCT x.id_restriction_role)::int AS "nombreRestrictions",
        COUNT(DISTINCT a.id_affectation_utilisateur)::int AS "nombreAffectations"
      FROM security_roles r
      LEFT JOIN security_permissions_roles p ON p.id_role=r.id_role
      LEFT JOIN security_restrictions_roles x ON x.id_role=r.id_role
      LEFT JOIN security_affectations_utilisateurs a ON a.id_role=r.id_role
      GROUP BY r.id_role ORDER BY r.nom_role`);
    return resultat.lignes;
  }

  public async obtenirRole(codeRole: string): Promise<Record<string, unknown>> {
    const role = await this.roles.trouverParCode(codeRole);
    if (!role) throw new SecurityGovernanceError('SECURITY_ROLE_NOT_FOUND', 'Rôle introuvable.', 404);
    const affectations = await this.client.executer<{ total: number }>(
      'SELECT COUNT(*)::int AS total FROM security_affectations_utilisateurs WHERE id_role=$1',
      [role.obtenirId()],
    );
    return {
      idRole: role.obtenirId(), codeRole: role.obtenirCodeRole().obtenirValeur(),
      nomRole: role.obtenirNomRole(), description: role.obtenirDescription(),
      niveauAcces: role.obtenirNiveauAcces().obtenirValeur(), estSysteme: role.obtenirEstSysteme(),
      estActif: role.obtenirEstActif(), nombreAffectations: affectations.lignes[0]?.total ?? 0,
      permissions: role.obtenirPermissions().map((item) => item.obtenirPermission().obtenirValeur()),
      restrictions: role.obtenirRestrictions().map((item) => item.obtenirCodeRestriction().obtenirValeur()),
      version: role.obtenirVersion(), modifieLe: role.obtenirModifieLe()?.toISOString(),
    };
  }

  public async creerRolePersonnalise(input: {
    codeRole: string; nomRole: string; description?: string; niveauAcces: string; permissions: string[];
  }, contexte: ContexteMutation): Promise<Record<string, unknown>> {
    if (!input.permissions?.length) throw new SecurityGovernanceError('SECURITY_ROLE_PERMISSION_REQUIRED', 'Sélectionnez au moins une permission.', 422);
    return this.client.dansTransaction(async () => {
      if (await this.roles.trouverParCode(input.codeRole)) throw new SecurityGovernanceError('SECURITY_ROLE_CONFLICT', 'Un rôle utilise déjà ce code.', 409);
      const role = Role.creer({ ...input, estSysteme:false, creePar:contexte.auteurId });
      await this.roles.sauvegarder(role);
      await this.journaliser('ROLE_PERSONNALISE_CREE', role.obtenirId(), { niveau:'PLATEFORME' }, contexte,
        { codeRole:role.obtenirCodeRole().obtenirValeur(),permissions:input.permissions }, 'ROLE_SECURITE');
      return this.obtenirRole(role.obtenirCodeRole().obtenirValeur());
    });
  }

  public async changerEtatRole(codeRole: string, actif: boolean, contexte: ContexteMutation): Promise<Record<string, unknown>> {
    this.texte(contexte.motif, 'motif');
    return this.client.dansTransaction(async () => {
      const role = await this.roles.trouverParCode(codeRole);
      if (!role) throw new SecurityGovernanceError('SECURITY_ROLE_NOT_FOUND', 'Rôle introuvable.', 404);
      if (role.obtenirEstSysteme()) throw new SecurityGovernanceError('SECURITY_SYSTEM_ROLE_PROTECTED', 'Un rôle officiel ne peut pas être modifié.', 409);
      if (actif) role.activer(); else role.desactiver();
      await this.roles.sauvegarder(role);
      await this.journaliser(actif ? 'ROLE_ACTIVE' : 'ROLE_DESACTIVE', role.obtenirId(), { niveau:'PLATEFORME' }, contexte,
        { codeRole,actif }, 'ROLE_SECURITE');
      return this.obtenirRole(codeRole);
    });
  }

  public async modifierCapaciteRole(codeRole: string, type: 'PERMISSION'|'RESTRICTION', valeur: string,
    ajouter: boolean, contexte: ContexteMutation): Promise<Record<string, unknown>> {
    this.texte(contexte.motif, 'motif');
    return this.client.dansTransaction(async () => {
      const role = await this.roles.trouverParCode(codeRole);
      if (!role) throw new SecurityGovernanceError('SECURITY_ROLE_NOT_FOUND', 'Rôle introuvable.', 404);
      if (role.obtenirEstSysteme()) throw new SecurityGovernanceError('SECURITY_SYSTEM_ROLE_PROTECTED', 'Un rôle officiel ne peut pas être modifié.', 409);
      if (type === 'PERMISSION') {
        if (ajouter) role.ajouterPermission(valeur, contexte.auteurId); else role.retirerPermission(valeur);
      } else if (ajouter) role.ajouterRestriction(valeur); else role.retirerRestriction(valeur);
      await this.roles.sauvegarder(role);
      await this.journaliser(`${type}_${ajouter ? 'AJOUTEE' : 'RETIREE'}_ROLE`, role.obtenirId(), { niveau:'PLATEFORME' }, contexte,
        { codeRole,valeur }, 'ROLE_SECURITE');
      return this.obtenirRole(codeRole);
    });
  }

  public async listerComptes(params: {
    niveau?: NiveauGouvernance; organisationId?: string; ecoleId?: string;
    recherche?: string; etat?: string; limite?: number; curseur?: string;
  } = {}): Promise<{ elements: readonly Record<string, unknown>[]; curseurSuivant?: string }> {
    const limite = Math.min(Math.max(params.limite ?? 30, 1), 100);
    const valeurs: unknown[] = [];
    const clauses = ['u.supprime_logiquement=FALSE'];
    const ajouter = (sql: string, valeur: unknown) => { valeurs.push(valeur); clauses.push(sql.replace('?', `$${valeurs.length}`)); };
    if (params.niveau) ajouter('a.niveau_acces=?', params.niveau);
    if (params.organisationId) ajouter('a.id_organisation=?', params.organisationId);
    if (params.ecoleId) ajouter('a.id_ecole=?', params.ecoleId);
    if (params.etat) ajouter('u.etat_compte=?', params.etat);
    if (params.recherche) {
      valeurs.push(params.recherche.trim());
      clauses.push(`(u.nom_complet ILIKE '%'||$${valeurs.length}||'%' OR u.email ILIKE '%'||$${valeurs.length}||'%')`);
    }
    if (params.curseur) ajouter('u.cree_le<?::timestamptz', params.curseur);
    valeurs.push(limite + 1);
    const resultat = await this.client.executer<Record<string, unknown>>(`
      SELECT u.id_utilisateur,u.nom_complet,u.email,u.telephone,u.etat_compte,
        u.dernier_login_le,u.dernier_acces_le,u.compte_verrouille_jusqua,u.cree_le,u.modifie_le,
        COALESCE(jsonb_agg(DISTINCT jsonb_build_object(
          'idAffectation',a.id_affectation_utilisateur,'role',r.code_role,'roleLibelle',r.nom_role,
          'niveau',a.niveau_acces,'organisationId',a.id_organisation,'ecoleId',a.id_ecole,
          'etat',a.etat_affectation)) FILTER (WHERE a.id_affectation_utilisateur IS NOT NULL),'[]'::jsonb) AS affectations,
        COUNT(DISTINCT s.id_session_utilisateur) FILTER (WHERE s.revoquee_le IS NULL)::int AS sessions_actives
      FROM auth_utilisateurs u
      LEFT JOIN security_affectations_utilisateurs a ON a.id_utilisateur=u.id_utilisateur
      LEFT JOIN security_roles r ON r.id_role=a.id_role
      LEFT JOIN auth_sessions_utilisateurs s ON s.id_utilisateur=u.id_utilisateur
      WHERE ${clauses.join(' AND ')}
      GROUP BY u.id_utilisateur ORDER BY u.cree_le DESC LIMIT $${valeurs.length}`, valeurs);
    const lignes = [...resultat.lignes];
    const aSuivant = lignes.length > limite;
    const elements = aSuivant ? lignes.slice(0, limite) : lignes;
    const dernier = elements.at(-1)?.cree_le;
    return { elements, curseurSuivant: aSuivant && dernier ? String(dernier) : undefined };
  }

  public async obtenirCompte(idUtilisateur: string): Promise<Record<string, unknown>> {
    const liste = await this.client.executer<Record<string, unknown>>(`
      SELECT u.id_utilisateur,u.nom_complet,u.email,u.telephone,u.etat_compte,u.token_version,
        u.dernier_login_le,u.dernier_acces_le,u.nombre_tentatives_connexion,
        u.compte_verrouille_jusqua,u.cree_le,u.modifie_le,u.version
      FROM auth_utilisateurs u WHERE u.id_utilisateur=$1 AND u.supprime_logiquement=FALSE`, [idUtilisateur]);
    const compte = liste.lignes[0];
    if (!compte) throw new SecurityGovernanceError('SECURITY_ACCOUNT_NOT_FOUND', 'Compte introuvable.', 404);
    // Une transaction PostgreSQL utilise une connexion unique : ses lectures doivent
    // rester séquentielles pour éviter plusieurs requêtes simultanées sur le même client.
    const affectations = await this.listerAffectations(idUtilisateur);
    const sessions = await this.listerSessions({ utilisateurId: idUtilisateur });
    const historique = await this.audit.lister({ limite: 100 });
    return {
      ...compte,
      affectations,
      sessions,
      historique: historique.filter((entree) => entree.auteur_id === idUtilisateur || entree.cible_id === idUtilisateur),
    };
  }

  public async creerCompteAvecAffectation(input: CreerCompteSecuriteInput, contexte: ContexteMutation): Promise<Record<string, unknown>> {
    this.validerCreation(input);
    return this.client.dansTransaction(async () => {
      await this.verifierContexte(input.niveau, input.organisationId, input.ecoleId);
      if (await this.utilisateurs.existeEmail(input.email)) {
        throw new SecurityGovernanceError('SECURITY_EMAIL_CONFLICT', 'Un compte utilise déjà cette adresse e-mail.', 409);
      }
      const role = await this.roles.trouverParCode(input.codeRole);
      if (!role || !role.obtenirEstActif()) throw new SecurityGovernanceError('SECURITY_ROLE_NOT_FOUND', 'Le rôle sélectionné est indisponible.', 422);
      if (role.obtenirNiveauAcces().obtenirValeur() !== input.niveau) {
        throw new SecurityGovernanceError('SECURITY_ROLE_SCOPE_MISMATCH', "Le rôle sélectionné ne correspond pas au niveau d'administration.", 422);
      }
      PolicyMotDePasseInitial.verifier(input.motDePasseInitial);
      const utilisateur = UtilisateurAuth.creer({
        nomComplet: this.texte(input.nomComplet, 'nom complet'),
        email: this.texte(input.email, 'adresse e-mail').toLowerCase(),
        telephone: input.telephone,
        motDePasseHash: await this.motsDePasse.hacherMotDePasse(input.motDePasseInitial),
      });
      await this.utilisateurs.sauvegarder(utilisateur);
      const affectation = await this.creerAffectation(utilisateur.obtenirId(), role.obtenirId(), input, contexte.auteurId);
      await this.journaliser('COMPTE_CREE', utilisateur.obtenirId(), input, contexte, {
        etat: 'ACTIVE', role: input.codeRole, affectationId: affectation.obtenirId(),
      });
      return this.obtenirCompte(utilisateur.obtenirId());
    });
  }

  public async affecterCompteExistant(input: Omit<CreerCompteSecuriteInput, 'nomComplet'|'email'|'telephone'|'motDePasseInitial'> & { idUtilisateur: string }, contexte: ContexteMutation): Promise<Record<string, unknown>> {
    return this.client.dansTransaction(async () => {
      await this.verifierContexte(input.niveau, input.organisationId, input.ecoleId);
      const utilisateur = await this.utilisateurs.trouverParId(input.idUtilisateur);
      if (!utilisateur) throw new SecurityGovernanceError('SECURITY_ACCOUNT_NOT_FOUND', 'Compte introuvable.', 404);
      const role = await this.roles.trouverParCode(input.codeRole);
      if (!role || !role.obtenirEstActif()) throw new SecurityGovernanceError('SECURITY_ROLE_NOT_FOUND', 'Le rôle sélectionné est indisponible.', 422);
      if (role.obtenirNiveauAcces().obtenirValeur() !== input.niveau) throw new SecurityGovernanceError('SECURITY_ROLE_SCOPE_MISMATCH', 'Le rôle ne correspond pas au périmètre.', 422);
      const affectation = await this.creerAffectation(input.idUtilisateur, role.obtenirId(), input, contexte.auteurId);
      await this.journaliser('AFFECTATION_CREEE', input.idUtilisateur, input, contexte, { affectationId: affectation.obtenirId(), role: input.codeRole });
      return this.obtenirCompte(input.idUtilisateur);
    });
  }

  public async creerAffectationGouvernance(input: {
    idUtilisateur: string;
    codeRole: string;
    niveau: NiveauGouvernance;
    organisationId?: string;
    ecoleId?: string;
    motif: string;
  }, contexte: ContexteMutation): Promise<Record<string, unknown>> {
    this.texte(input.motif, 'motif');
    return this.affecterCompteExistant(input, { ...contexte, motif: input.motif });
  }

  public async activerAffectation(idAffectation: string, contexte: ContexteMutation): Promise<void> {
    this.texte(contexte.motif, 'motif');
    await this.client.dansTransaction(async () => {
      const affectation = await this.chargerAffectationAdmin(idAffectation);
      if (!affectation) throw new SecurityGovernanceError('SECURITY_ASSIGNMENT_NOT_FOUND', 'Affectation introuvable.', 404);
      const conflit = await this.client.executer<{ existe: boolean }>(`
        SELECT EXISTS(
          SELECT 1 FROM security_affectations_utilisateurs
          WHERE id_affectation_utilisateur<>$1 AND id_utilisateur=$2
            AND id_role=(SELECT id_role FROM security_roles WHERE code_role=$3)
            AND COALESCE(id_organisation,'')=COALESCE($4,'')
            AND COALESCE(id_ecole,'')=COALESCE($5,'') AND etat_affectation='ACTIVE'
        ) AS existe`, [idAffectation,affectation.id_utilisateur,affectation.code_role,affectation.id_organisation,affectation.id_ecole]);
      if (conflit.lignes[0]?.existe) {
        throw new SecurityGovernanceError('SECURITY_ASSIGNMENT_CONFLICT', 'Une affectation active identique existe déjà.', 409);
      }
      await this.client.executer(`UPDATE security_affectations_utilisateurs
        SET etat_affectation='ACTIVE',date_fin=NULL,version=version+1
        WHERE id_affectation_utilisateur=$1 AND etat_affectation<>'ACTIVE'`, [idAffectation]);
      await this.journaliser('AFFECTATION_REACTIVEE', affectation.id_utilisateur, {
        niveau: affectation.niveau_acces, organisationId: affectation.id_organisation ?? undefined,
        ecoleId: affectation.id_ecole ?? undefined,
      }, contexte, { affectationId: idAffectation, role: affectation.code_role });
    });
  }

  public async changerEtatCompte(idUtilisateur: string, nouvelEtat: 'ACTIVE'|'SUSPENDED'|'DISABLED', contexte: ContexteMutation): Promise<Record<string, unknown>> {
    if (nouvelEtat !== 'ACTIVE') this.texte(contexte.motif, 'motif');
    return this.client.dansTransaction(async () => {
      const utilisateur = await this.utilisateurs.trouverParId(idUtilisateur);
      if (!utilisateur) throw new SecurityGovernanceError('SECURITY_ACCOUNT_NOT_FOUND', 'Compte introuvable.', 404);
      const avant = utilisateur.obtenirEtatCompte();
      if (avant === nouvelEtat) return this.obtenirCompte(idUtilisateur);
      if (nouvelEtat !== 'ACTIVE') await this.protegerDerniersAdministrateurs(idUtilisateur);
      if (nouvelEtat === 'ACTIVE') utilisateur.activerCompte();
      if (nouvelEtat === 'SUSPENDED') utilisateur.suspendreCompte();
      if (nouvelEtat === 'DISABLED') utilisateur.desactiverCompte();
      await this.utilisateurs.sauvegarder(utilisateur);
      if (nouvelEtat !== 'ACTIVE') {
        await this.sessions.revoquerSessionsUtilisateur(idUtilisateur, nouvelEtat === 'SUSPENDED' ? 'compte-suspendu' : 'compte-desactive');
        await this.refreshTokens.revoquerParUtilisateur(idUtilisateur);
      }
      await this.journaliser(
        nouvelEtat === 'ACTIVE' ? 'COMPTE_REACTIVE' : nouvelEtat === 'SUSPENDED' ? 'COMPTE_SUSPENDU' : 'COMPTE_DESACTIVE',
        idUtilisateur, { niveau: 'PLATEFORME' }, contexte, { avant, apres: nouvelEtat },
      );
      return this.obtenirCompte(idUtilisateur);
    });
  }

  public async deverrouillerCompte(idUtilisateur: string, contexte: ContexteMutation): Promise<Record<string, unknown>> {
    this.texte(contexte.motif, 'motif');
    return this.client.dansTransaction(async () => {
      const utilisateur = await this.utilisateurs.trouverParId(idUtilisateur);
      if (!utilisateur) throw new SecurityGovernanceError('SECURITY_ACCOUNT_NOT_FOUND', 'Compte introuvable.', 404);
      utilisateur.deverrouillerCompte();
      await this.utilisateurs.sauvegarder(utilisateur);
      await this.journaliser('COMPTE_DEVERROUILLE', idUtilisateur, { niveau: 'PLATEFORME' }, contexte, { tentativesReinitialisees: true });
      return this.obtenirCompte(idUtilisateur);
    });
  }

  public async reinitialiserMotDePasse(
    idUtilisateur: string,
    nouveauMotDePasse: string,
    contexte: ContexteMutation,
  ): Promise<Record<string, unknown>> {
    this.texte(contexte.motif, 'motif');
    PolicyMotDePasseInitial.verifier(nouveauMotDePasse);
    return this.client.dansTransaction(async () => {
      const utilisateur = await this.utilisateurs.trouverParId(idUtilisateur);
      if (!utilisateur) throw new SecurityGovernanceError('SECURITY_ACCOUNT_NOT_FOUND', 'Compte introuvable.', 404);
      utilisateur.changerMotDePasse(await this.motsDePasse.hacherMotDePasse(nouveauMotDePasse));
      await this.utilisateurs.sauvegarder(utilisateur);
      await this.sessions.revoquerSessionsUtilisateur(idUtilisateur, 'mot-de-passe-reinitialise');
      await this.refreshTokens.revoquerParUtilisateur(idUtilisateur);
      await this.journaliser('MOT_DE_PASSE_REINITIALISE', idUtilisateur, { niveau: 'PLATEFORME' }, contexte, {
        sessionsRevoquees: true,
        nouvelleConnexionRequise: true,
      });
      return this.obtenirCompte(idUtilisateur);
    });
  }

  public async listerAffectations(idUtilisateur?: string): Promise<readonly Record<string, unknown>[]> {
    const resultat = await this.client.executer<Record<string, unknown>>(`
      SELECT a.id_affectation_utilisateur,a.id_utilisateur,u.nom_complet,u.email,
        r.code_role,r.nom_role,r.est_systeme,a.niveau_acces,a.id_organisation,a.id_ecole,
        a.id_section,a.id_classe,a.id_cours,a.etat_affectation,a.date_debut,a.date_fin,
        a.cree_le,a.cree_par,
        COALESCE(jsonb_agg(jsonb_build_object('type',s.type_scope,'valeur',s.valeur_scope,
          'lectureSeule',s.est_lecture_seule)) FILTER (WHERE s.id_scope_acces IS NOT NULL),'[]'::jsonb) AS scopes
      FROM security_affectations_utilisateurs a JOIN security_roles r ON r.id_role=a.id_role
      JOIN auth_utilisateurs u ON u.id_utilisateur=a.id_utilisateur
      LEFT JOIN security_scopes_acces s ON s.id_affectation_utilisateur=a.id_affectation_utilisateur
      WHERE ($1::text IS NULL OR a.id_utilisateur=$1)
      GROUP BY a.id_affectation_utilisateur,u.id_utilisateur,r.id_role ORDER BY a.cree_le DESC`, [idUtilisateur ?? null]);
    return resultat.lignes;
  }

  public async desactiverAffectation(idAffectation: string, contexte: ContexteMutation): Promise<void> {
    this.texte(contexte.motif, 'motif');
    await this.client.dansTransaction(async () => {
      const affectation = await this.chargerAffectationAdmin(idAffectation);
      if (!affectation) throw new SecurityGovernanceError('SECURITY_ASSIGNMENT_NOT_FOUND', 'Affectation introuvable.', 404);
      if (this.estRoleAdministrateur(affectation.code_role)) await this.protegerDernierAdminPourAffectation(affectation);
      await this.client.executer(`UPDATE security_affectations_utilisateurs SET etat_affectation='INACTIVE',date_fin=COALESCE(date_fin,NOW()),version=version+1 WHERE id_affectation_utilisateur=$1 AND etat_affectation='ACTIVE'`, [idAffectation]);
      await this.journaliser('AFFECTATION_DESACTIVEE', affectation.id_utilisateur, {
        niveau: affectation.niveau_acces, organisationId: affectation.id_organisation ?? undefined,
        ecoleId: affectation.id_ecole ?? undefined,
      }, contexte, { affectationId: idAffectation, role: affectation.code_role });
    });
  }

  public async retirerScope(idAffectation: string, typeScope: string, valeurScope: string, contexte: ContexteMutation): Promise<void> {
    this.texte(contexte.motif, 'motif');
    await this.client.dansTransaction(async () => {
      const affectation = await this.chargerAffectationAdmin(idAffectation);
      if (!affectation) throw new SecurityGovernanceError('SECURITY_ASSIGNMENT_NOT_FOUND', 'Affectation introuvable.', 404);
      if (this.estRoleAdministrateur(affectation.code_role)) await this.protegerDernierAdminPourAffectation(affectation);
      const resultat = await this.client.executer(
        'DELETE FROM security_scopes_acces WHERE id_affectation_utilisateur=$1 AND type_scope=$2 AND valeur_scope=$3',
        [idAffectation,typeScope,valeurScope],
      );
      if (!resultat.nombreLignesAffectees) throw new SecurityGovernanceError('SECURITY_SCOPE_NOT_FOUND', 'Périmètre introuvable.', 404);
      await this.journaliser('SCOPE_RETIRE', affectation.id_utilisateur, {
        niveau: affectation.niveau_acces, organisationId: affectation.id_organisation ?? undefined,
        ecoleId: affectation.id_ecole ?? undefined,
      }, contexte, { affectationId: idAffectation, typeScope, valeurScope });
    });
  }

  public async listerAdministrateurs(niveau: 'ORGANISATION'|'ECOLE', params: { organisationId?: string; ecoleId?: string } = {}): Promise<readonly Record<string, unknown>[]> {
    const role = ROLES_ADMIN_PAR_NIVEAU[niveau];
    const resultat = await this.client.executer<Record<string, unknown>>(`
      SELECT a.id_affectation_utilisateur,a.id_utilisateur,u.nom_complet,u.email,u.telephone,
        u.etat_compte,u.dernier_login_le,u.compte_verrouille_jusqua,a.id_organisation,a.id_ecole,
        o.nom AS organisation_nom,e.nom AS ecole_nom,a.etat_affectation,a.date_debut,
        COUNT(s.id_session_utilisateur) FILTER (WHERE s.revoquee_le IS NULL)::int AS sessions_actives
      FROM security_affectations_utilisateurs a JOIN security_roles r ON r.id_role=a.id_role
      JOIN auth_utilisateurs u ON u.id_utilisateur=a.id_utilisateur
      LEFT JOIN organisations o ON o.id::text=a.id_organisation
      LEFT JOIN ecoles e ON e.id::text=a.id_ecole
      LEFT JOIN auth_sessions_utilisateurs s ON s.id_utilisateur=u.id_utilisateur
      WHERE r.code_role=$1 AND ($2::text IS NULL OR a.id_organisation=$2)
        AND ($3::text IS NULL OR a.id_ecole=$3)
      GROUP BY a.id_affectation_utilisateur,u.id_utilisateur,o.nom,e.nom ORDER BY u.nom_complet`,
      [role,params.organisationId ?? null,params.ecoleId ?? null]);
    return resultat.lignes;
  }

  public async listerPerimetresAdministratifs(): Promise<readonly Record<string, unknown>[]> {
    const resultat = await this.client.executer<Record<string, unknown>>(`
      SELECT o.id::text AS organisation_id,o.nom AS organisation_nom,
        e.id::text AS ecole_id,e.nom AS ecole_nom,
        COUNT(DISTINCT ao.id_affectation_utilisateur) FILTER (
          WHERE ro.code_role='ADMIN_SYSTEME_ORGANISATION' AND ao.etat_affectation='ACTIVE' AND uo.etat_compte='ACTIVE'
        )::int AS administrateurs_organisation_actifs,
        COUNT(DISTINCT ae.id_affectation_utilisateur) FILTER (
          WHERE re.code_role='ADMIN_SYSTEME_ECOLE' AND ae.etat_affectation='ACTIVE' AND ue.etat_compte='ACTIVE'
        )::int AS administrateurs_ecole_actifs
      FROM organisations o
      LEFT JOIN ecoles e ON e.id_organisation=o.id
      LEFT JOIN security_affectations_utilisateurs ao ON ao.id_organisation=o.id::text AND ao.id_ecole IS NULL
      LEFT JOIN security_roles ro ON ro.id_role=ao.id_role
      LEFT JOIN auth_utilisateurs uo ON uo.id_utilisateur=ao.id_utilisateur
      LEFT JOIN security_affectations_utilisateurs ae ON ae.id_ecole=e.id::text
      LEFT JOIN security_roles re ON re.id_role=ae.id_role
      LEFT JOIN auth_utilisateurs ue ON ue.id_utilisateur=ae.id_utilisateur
      GROUP BY o.id,o.nom,e.id,e.nom ORDER BY o.nom,e.nom NULLS FIRST
    `);
    return resultat.lignes;
  }

  public async remplacerAdministrateur(
    idAffectationActuelle: string,
    remplacement: { idUtilisateur?: string; nomComplet?: string; email?: string; telephone?: string; motDePasseInitial?: string },
    contexte: ContexteMutation,
    porteeAttendue?: { organisationId?: string; ecoleId?: string },
  ): Promise<Record<string, unknown>> {
    this.texte(contexte.motif, 'motif');
    return this.client.dansTransaction(async () => {
      const actuelle = await this.chargerAffectationAdmin(idAffectationActuelle);
      if (!actuelle || !this.estRoleAdministrateur(actuelle.code_role)) {
        throw new SecurityGovernanceError('SECURITY_ADMIN_ASSIGNMENT_NOT_FOUND', 'Affectation administrative introuvable.', 404);
      }
      if ((porteeAttendue?.organisationId && actuelle.id_organisation !== porteeAttendue.organisationId)
        || (porteeAttendue?.ecoleId && actuelle.id_ecole !== porteeAttendue.ecoleId)) {
        throw new SecurityGovernanceError('SECURITY_ASSIGNMENT_OUT_OF_SCOPE', 'Affectation administrative introuvable dans ce périmètre.', 404);
      }
      const portee = {
        codeRole: actuelle.code_role,
        niveau: actuelle.niveau_acces,
        organisationId: actuelle.id_organisation ?? undefined,
        ecoleId: actuelle.id_ecole ?? undefined,
        motif: contexte.motif,
      };
      let nouveauCompte: Record<string, unknown>;
      if (remplacement.idUtilisateur) {
        if (remplacement.idUtilisateur === actuelle.id_utilisateur) {
          throw new SecurityGovernanceError('SECURITY_REPLACEMENT_SAME_ACCOUNT', 'Sélectionnez un autre compte comme remplaçant.', 409);
        }
        nouveauCompte = await this.affecterCompteExistant({ ...portee, idUtilisateur: remplacement.idUtilisateur }, contexte);
      } else {
        nouveauCompte = await this.creerCompteAvecAffectation({
          ...portee,
          nomComplet: remplacement.nomComplet ?? '',
          email: remplacement.email ?? '',
          telephone: remplacement.telephone,
          motDePasseInitial: remplacement.motDePasseInitial ?? '',
        }, contexte);
      }
      await this.desactiverAffectation(idAffectationActuelle, contexte);
      await this.journaliser('ADMINISTRATEUR_REMPLACE', actuelle.id_utilisateur, {
        niveau: actuelle.niveau_acces,
        organisationId: actuelle.id_organisation ?? undefined,
        ecoleId: actuelle.id_ecole ?? undefined,
      }, contexte, {
        ancienneAffectationId: idAffectationActuelle,
        nouveauCompteId: nouveauCompte.id_utilisateur,
      });
      return nouveauCompte;
    });
  }

  public async listerSessions(params: { utilisateurId?: string; organisationId?: string; ecoleId?: string } = {}): Promise<readonly Record<string, unknown>[]> {
    const resultat = await this.client.executer<Record<string, unknown>>(`
      SELECT s.id_session_utilisateur,s.id_utilisateur,u.nom_complet,u.email,s.device_id,
        s.user_agent,s.adresse_ip,s.est_offline,s.organisation_active_id,s.ecole_active_id,
        s.cree_le,s.dernier_refresh_le,s.revoquee_le,s.raison_revocation,
        CASE WHEN s.revoquee_le IS NULL THEN 'ACTIVE' ELSE 'REVOQUEE' END AS statut
      FROM auth_sessions_utilisateurs s JOIN auth_utilisateurs u ON u.id_utilisateur=s.id_utilisateur
      WHERE ($1::text IS NULL OR s.id_utilisateur=$1)
        AND ($2::text IS NULL OR s.organisation_active_id=$2)
        AND ($3::text IS NULL OR s.ecole_active_id=$3)
      ORDER BY COALESCE(s.dernier_refresh_le,s.cree_le) DESC`,
      [params.utilisateurId ?? null,params.organisationId ?? null,params.ecoleId ?? null]);
    return resultat.lignes;
  }

  public async revoquerSession(idSession: string, contexte: ContexteMutation): Promise<void> {
    this.texte(contexte.motif, 'motif');
    await this.client.dansTransaction(async () => {
      const session = await this.client.executer<{ id_utilisateur: string; refresh_token_id: string }>(
        'SELECT id_utilisateur,refresh_token_id FROM auth_sessions_utilisateurs WHERE id_session_utilisateur=$1', [idSession]);
      const ligne = session.lignes[0];
      if (!ligne) throw new SecurityGovernanceError('SECURITY_SESSION_NOT_FOUND', 'Session introuvable.', 404);
      await this.client.executer(`UPDATE auth_sessions_utilisateurs SET revoquee_le=COALESCE(revoquee_le,NOW()),raison_revocation=COALESCE(raison_revocation,$2),version=CASE WHEN revoquee_le IS NULL THEN version+1 ELSE version END WHERE id_session_utilisateur=$1`, [idSession,contexte.motif]);
      await this.refreshTokens.revoquer(ligne.refresh_token_id);
      await this.journaliser('SESSION_REVOQUEE', ligne.id_utilisateur, { niveau: 'PLATEFORME' }, contexte, { sessionId: idSession });
    });
  }

  public async revoquerToutesSessions(idUtilisateur: string, contexte: ContexteMutation): Promise<void> {
    this.texte(contexte.motif, 'motif');
    await this.client.dansTransaction(async () => {
      if (!(await this.utilisateurs.trouverParId(idUtilisateur))) throw new SecurityGovernanceError('SECURITY_ACCOUNT_NOT_FOUND', 'Compte introuvable.', 404);
      await this.sessions.revoquerSessionsUtilisateur(idUtilisateur, contexte.motif);
      await this.refreshTokens.revoquerParUtilisateur(idUtilisateur);
      await this.journaliser('SESSIONS_REVOQUEES_GLOBALEMENT', idUtilisateur, { niveau: 'PLATEFORME' }, contexte, {});
    });
  }

  public async listerTentatives(params: { recherche?: string; reussie?: boolean; limite?: number } = {}): Promise<readonly Record<string, unknown>[]> {
    const limite = Math.min(Math.max(params.limite ?? 100,1),500);
    const resultat = await this.client.executer<Record<string, unknown>>(`
      SELECT t.id_tentative_connexion,t.email,t.adresse_ip,t.user_agent,t.reussie,
        CASE WHEN t.reussie THEN NULL ELSE 'Connexion refusée' END AS resultat_humain,
        t.date_tentative,u.id_utilisateur,u.nom_complet,u.etat_compte,
        u.compte_verrouille_jusqua,u.nombre_tentatives_connexion
      FROM auth_tentatives_connexion t LEFT JOIN auth_utilisateurs u ON u.email=t.email
      WHERE ($1::text IS NULL OR t.email ILIKE '%'||$1||'%' OR u.nom_complet ILIKE '%'||$1||'%')
        AND ($2::boolean IS NULL OR t.reussie=$2)
      ORDER BY t.date_tentative DESC LIMIT $3`, [params.recherche ?? null,params.reussie ?? null,limite]);
    return resultat.lignes;
  }

  private async creerAffectation(idUtilisateur: string, idRole: string, input: {
    niveau: NiveauGouvernance; organisationId?: string; ecoleId?: string;
  }, auteurId: string): Promise<AffectationUtilisateur> {
    const existante = await this.client.executer<{ id: string }>(`
      SELECT id_affectation_utilisateur AS id FROM security_affectations_utilisateurs
      WHERE id_utilisateur=$1 AND id_role=$2 AND COALESCE(id_organisation,'')=COALESCE($3,'')
        AND COALESCE(id_ecole,'')=COALESCE($4,'') AND etat_affectation='ACTIVE'`,
      [idUtilisateur,idRole,input.organisationId ?? null,input.ecoleId ?? null]);
    if (existante.lignes[0]) throw new SecurityGovernanceError('SECURITY_ASSIGNMENT_CONFLICT', 'Ce compte possède déjà cette affectation active.', 409);
    const affectation = AffectationUtilisateur.creer({
      idUtilisateur,idRole,niveauAcces:input.niveau,idOrganisation:input.organisationId,
      idEcole:input.ecoleId,creePar:auteurId,
    });
    const valeurScope = input.niveau === 'PLATEFORME' ? 'system' : input.niveau === 'ORGANISATION' ? input.organisationId! : input.ecoleId!;
    affectation.ajouterScope(input.niveau, valeurScope);
    await this.affectations.sauvegarder(affectation);
    return affectation;
  }

  private async verifierContexte(niveau: NiveauGouvernance, organisationId?: string, ecoleId?: string): Promise<void> {
    if (niveau === 'PLATEFORME') {
      if (organisationId || ecoleId) throw new SecurityGovernanceError('SECURITY_PLATFORM_CONTEXT_INVALID', 'Une affectation Plateforme ne dépend pas d’une organisation ou d’une école.', 422);
      return;
    }
    if (!organisationId) throw new SecurityGovernanceError('SECURITY_ORGANIZATION_REQUIRED', 'Sélectionnez une organisation.', 422);
    const organisation = await this.client.executer<{ existe: boolean }>('SELECT EXISTS(SELECT 1 FROM organisations WHERE id::text=$1) AS existe',[organisationId]);
    if (!organisation.lignes[0]?.existe) throw new SecurityGovernanceError('SECURITY_ORGANIZATION_NOT_FOUND', 'Organisation introuvable.', 404);
    if (niveau === 'ECOLE') {
      if (!ecoleId) throw new SecurityGovernanceError('SECURITY_SCHOOL_REQUIRED', 'Sélectionnez une école.', 422);
      const ecole = await this.client.executer<{ existe: boolean }>('SELECT EXISTS(SELECT 1 FROM ecoles WHERE id::text=$1 AND id_organisation::text=$2) AS existe',[ecoleId,organisationId]);
      if (!ecole.lignes[0]?.existe) throw new SecurityGovernanceError('SECURITY_SCHOOL_SCOPE_INVALID', 'Cette école n’appartient pas à l’organisation sélectionnée.', 404);
    } else if (ecoleId) {
      throw new SecurityGovernanceError('SECURITY_ORGANIZATION_CONTEXT_INVALID', 'Une affectation Organisation ne doit pas recevoir de périmètre École.', 422);
    }
  }

  private async protegerDerniersAdministrateurs(idUtilisateur: string): Promise<void> {
    const affectations = await this.client.executer<AffectationAdminRow>(`
      SELECT a.id_affectation_utilisateur,a.id_utilisateur,r.code_role,a.niveau_acces,a.id_organisation,a.id_ecole
      FROM security_affectations_utilisateurs a JOIN security_roles r ON r.id_role=a.id_role
      WHERE a.id_utilisateur=$1 AND a.etat_affectation='ACTIVE'
        AND r.code_role IN ('MANAGER_SYSTEME','ADMIN_SYSTEME_ORGANISATION','ADMIN_SYSTEME_ECOLE')`, [idUtilisateur]);
    for (const affectation of affectations.lignes) await this.protegerDernierAdminPourAffectation(affectation);
  }

  private async protegerDernierAdminPourAffectation(affectation: AffectationAdminRow): Promise<void> {
    const cle = `security-last-admin:${affectation.niveau_acces}:${affectation.id_organisation ?? 'platform'}:${affectation.id_ecole ?? ''}`;
    await this.client.executer('SELECT pg_advisory_xact_lock(hashtext($1))', [cle]);
    const resultat = await this.client.executer<{ total: string }>(`
      SELECT COUNT(DISTINCT a.id_utilisateur)::text AS total
      FROM security_affectations_utilisateurs a JOIN security_roles r ON r.id_role=a.id_role
      JOIN auth_utilisateurs u ON u.id_utilisateur=a.id_utilisateur
      WHERE r.code_role=$1 AND a.etat_affectation='ACTIVE' AND u.etat_compte='ACTIVE'
        AND ($2::text IS NULL OR a.id_organisation=$2)
        AND ($3::text IS NULL OR a.id_ecole=$3)`,
      [affectation.code_role,affectation.id_organisation,affectation.id_ecole]);
    if (Number(resultat.lignes[0]?.total ?? 0) <= 1) {
      throw new SecurityGovernanceError('SECURITY_LAST_ADMIN_PROTECTED', 'Cette action laisserait ce périmètre sans administrateur système actif. Ajoutez d’abord un remplaçant.', 409);
    }
  }

  private async chargerAffectationAdmin(idAffectation: string): Promise<AffectationAdminRow | null> {
    const resultat = await this.client.executer<AffectationAdminRow>(`
      SELECT a.id_affectation_utilisateur,a.id_utilisateur,r.code_role,a.niveau_acces,a.id_organisation,a.id_ecole
      FROM security_affectations_utilisateurs a JOIN security_roles r ON r.id_role=a.id_role
      WHERE a.id_affectation_utilisateur=$1`, [idAffectation]);
    return resultat.lignes[0] ?? null;
  }

  private estRoleAdministrateur(codeRole: string): boolean {
    return (Object.values(ROLES_ADMIN_PAR_NIVEAU) as readonly string[]).includes(codeRole);
  }

  private validerCreation(input: CreerCompteSecuriteInput): void {
    this.texte(input.nomComplet, 'nom complet');
    this.texte(input.email, 'adresse e-mail');
    this.texte(input.codeRole, 'rôle');
    if (!['PLATEFORME','ORGANISATION','ECOLE'].includes(input.niveau)) throw new SecurityGovernanceError('SECURITY_LEVEL_INVALID', 'Le niveau sélectionné est invalide.', 400);
  }

  private texte(valeur: unknown, libelle: string): string {
    const texte = typeof valeur === 'string' ? valeur.trim() : '';
    if (!texte) throw new SecurityGovernanceError('SECURITY_REQUIRED_FIELD', `Le champ ${libelle} est obligatoire.`, 400);
    return texte;
  }

  private async journaliser(action: string, cibleId: string, portee: {
    niveau: NiveauGouvernance; organisationId?: string; ecoleId?: string;
  }, contexte: ContexteMutation, apres: Record<string, unknown>, typeCible = 'COMPTE_SECURITE'): Promise<void> {
    await this.audit.journaliser({
      action,idUtilisateur:contexte.auteurId,succes:true,
      details:{ cibleId,typeCible,niveauScope:portee.niveau,
        organisationId:portee.organisationId,ecoleId:portee.ecoleId,motif:contexte.motif,
        traceId:contexte.traceId,apres },
    });
  }
}
