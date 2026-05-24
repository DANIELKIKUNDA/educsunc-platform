import { randomUUID } from 'node:crypto';
import { RacineAgregat } from '../../../domain/AggregateRoot';
import {
  ActionAudit,
  AuditTimestamp,
  GraviteAudit,
  NiveauAudit,
  ResultatAudit,
  TypeAudit,
} from '../value-objects';
import {
  AuditInvalidClassificationException,
  AuditOfflineStateInvalidException,
  AuditPermissionHistoryMissingException,
  AuditSnapshotForbiddenException,
  AuditTenantMissingException,
} from '../exceptions';
import { AUDIT_ACTION_MATRIX } from '../invariants';
import {
  ActeurAudit,
  AuditCorrelation,
  AuditExecutionContext,
  AuditMetadata,
  AuditOfflineMetadata,
  AuditPermissionContext,
  AuditSnapshot,
  ContexteAudit,
  RessourceAudit,
  TenantAudit,
} from '../entities';
import { AuditEntryCreated } from '../events';

export interface ProprietesAuditEntry {
  idAuditEntry: string;
  typeAuditPrincipal: TypeAudit;
  categoriesAudit: TypeAudit[];
  niveauAudit: NiveauAudit;
  graviteAudit: GraviteAudit;
  actionAudit: ActionAudit;
  acteurAudit: ActeurAudit;
  contexteAudit: ContexteAudit;
  tenantAudit: TenantAudit;
  ressourceAudit: RessourceAudit;
  resultatAudit: ResultatAudit;
  auditSnapshot?: AuditSnapshot;
  auditOfflineMetadata?: AuditOfflineMetadata;
  auditMetadata?: AuditMetadata;
  auditCorrelation?: AuditCorrelation;
  auditPermissionContext?: AuditPermissionContext;
  auditExecutionContext?: AuditExecutionContext;
  horodatageAudit: AuditTimestamp;
}

export type CommandeCreationAuditEntry = Omit<ProprietesAuditEntry, 'idAuditEntry'> & {
  idAuditEntry?: string;
};

// Cet agrégat append-only représente l'unité officielle d'historisation d'EducSync.
export class AuditEntry extends RacineAgregat<string> {
  private readonly typeAuditPrincipal: TypeAudit;
  private readonly categoriesAudit: TypeAudit[];
  private readonly niveauAudit: NiveauAudit;
  private readonly graviteAudit: GraviteAudit;
  private readonly actionAudit: ActionAudit;
  private readonly acteurAudit: ActeurAudit;
  private readonly contexteAudit: ContexteAudit;
  private readonly tenantAudit: TenantAudit;
  private readonly ressourceAudit: RessourceAudit;
  private readonly resultatAudit: ResultatAudit;
  private readonly auditSnapshot?: AuditSnapshot;
  private readonly auditOfflineMetadata?: AuditOfflineMetadata;
  private readonly auditMetadata?: AuditMetadata;
  private readonly auditCorrelation?: AuditCorrelation;
  private readonly auditPermissionContext?: AuditPermissionContext;
  private readonly auditExecutionContext?: AuditExecutionContext;
  private readonly horodatageAudit: AuditTimestamp;

  constructor(proprietes: ProprietesAuditEntry) {
    super(AuditEntry.validerTexte(proprietes.idAuditEntry, 'idAuditEntry'));
    this.typeAuditPrincipal = proprietes.typeAuditPrincipal;
    this.categoriesAudit = [...proprietes.categoriesAudit];
    this.niveauAudit = proprietes.niveauAudit;
    this.graviteAudit = proprietes.graviteAudit;
    this.actionAudit = proprietes.actionAudit;
    this.acteurAudit = proprietes.acteurAudit;
    this.contexteAudit = proprietes.contexteAudit;
    this.tenantAudit = proprietes.tenantAudit;
    this.ressourceAudit = proprietes.ressourceAudit;
    this.resultatAudit = proprietes.resultatAudit;
    this.auditSnapshot = proprietes.auditSnapshot;
    this.auditOfflineMetadata = proprietes.auditOfflineMetadata;
    this.auditMetadata = proprietes.auditMetadata;
    this.auditCorrelation = proprietes.auditCorrelation;
    this.auditPermissionContext = proprietes.auditPermissionContext;
    this.auditExecutionContext = proprietes.auditExecutionContext;
    this.horodatageAudit = proprietes.horodatageAudit;

    this.validerClassificationOfficielle();
    this.validerTenant();
    this.validerOffline();
    this.validerPermissionsHistoriques();
    this.validerSnapshots();
    this.validerCorrelation();
  }

  // Cette fabrique crée une entrée audit complète et émet l'événement central du BC.
  public static creer(proprietes: CommandeCreationAuditEntry): AuditEntry {
    const entree = new AuditEntry({
      ...proprietes,
      idAuditEntry: proprietes.idAuditEntry ?? randomUUID(),
    });
    entree.ajouterEvenement(new AuditEntryCreated(
      entree.obtenirId(),
      entree.typeAuditPrincipal.obtenirValeur(),
      entree.categoriesAudit.map((categorie) => categorie.obtenirValeur()),
      entree.actionAudit.obtenirValeur(),
      entree.acteurAudit.obtenirId(),
      entree.tenantAudit.obtenirScope().obtenirValeur(),
      entree.graviteAudit.obtenirValeur(),
      entree.resultatAudit.obtenirValeur(),
      entree.auditCorrelation?.obtenirCorrelationId()?.obtenirValeur(),
    ));
    return entree;
  }

  public obtenirTypeAuditPrincipal(): TypeAudit { return this.typeAuditPrincipal; }
  public obtenirCategoriesAudit(): TypeAudit[] { return [...this.categoriesAudit]; }
  public obtenirNiveauAudit(): NiveauAudit { return this.niveauAudit; }
  public obtenirGraviteAudit(): GraviteAudit { return this.graviteAudit; }
  public obtenirActionAudit(): ActionAudit { return this.actionAudit; }
  public obtenirActeurAudit(): ActeurAudit { return this.acteurAudit; }
  public obtenirContexteAudit(): ContexteAudit { return this.contexteAudit; }
  public obtenirTenantAudit(): TenantAudit { return this.tenantAudit; }
  public obtenirRessourceAudit(): RessourceAudit { return this.ressourceAudit; }
  public obtenirResultatAudit(): ResultatAudit { return this.resultatAudit; }
  public obtenirAuditSnapshot(): AuditSnapshot | undefined { return this.auditSnapshot; }
  public obtenirAuditOfflineMetadata(): AuditOfflineMetadata | undefined { return this.auditOfflineMetadata; }
  public obtenirAuditMetadata(): AuditMetadata | undefined { return this.auditMetadata; }
  public obtenirAuditCorrelation(): AuditCorrelation | undefined { return this.auditCorrelation; }
  public obtenirAuditPermissionContext(): AuditPermissionContext | undefined { return this.auditPermissionContext; }
  public obtenirAuditExecutionContext(): AuditExecutionContext | undefined { return this.auditExecutionContext; }
  public obtenirHorodatageAudit(): AuditTimestamp { return this.horodatageAudit; }

  private validerClassificationOfficielle(): void {
    const definition = AUDIT_ACTION_MATRIX[this.actionAudit.obtenirValeur()];
    if (!definition) {
      throw new AuditInvalidClassificationException(
        `Aucune matrice officielle ne couvre l'action ${this.actionAudit.obtenirValeur()}.`,
      );
    }

    if (this.typeAuditPrincipal.obtenirValeur() !== definition.typeAuditPrincipal) {
      throw new AuditInvalidClassificationException(
        `Le type principal ${this.typeAuditPrincipal.obtenirValeur()} ne correspond pas a la matrice officielle de ${this.actionAudit.obtenirValeur()}.`,
      );
    }

    const categories = this.categoriesAudit.map((categorie) => categorie.obtenirValeur());
    for (const categorie of definition.categoriesAudit) {
      if (!categories.includes(categorie)) {
        throw new AuditInvalidClassificationException(
          `La categorie ${categorie} est obligatoire pour l'action ${this.actionAudit.obtenirValeur()}.`,
        );
      }
    }

    if (!definition.gravitesAutorisees.includes(this.graviteAudit.obtenirValeur())) {
      throw new AuditInvalidClassificationException(
        `La gravite ${this.graviteAudit.obtenirValeur()} n'est pas autorisee pour l'action ${this.actionAudit.obtenirValeur()}.`,
      );
    }

    if (definition.resultatsAutorises && !definition.resultatsAutorises.includes(this.resultatAudit.obtenirValeur())) {
      throw new AuditInvalidClassificationException(
        `Le resultat ${this.resultatAudit.obtenirValeur()} n'est pas autorise pour l'action ${this.actionAudit.obtenirValeur()}.`,
      );
    }
  }

  private validerTenant(): void {
    const scope = this.tenantAudit.obtenirScope().obtenirValeur();
    if (scope === 'ORGANISATION' && !this.tenantAudit.obtenirOrganisationId()) {
      throw new AuditTenantMissingException('Un audit au scope ORGANISATION doit contenir organisationId.');
    }
    if (scope === 'ECOLE') {
      if (!this.tenantAudit.obtenirOrganisationId()) {
        throw new AuditTenantMissingException('Un audit au scope ECOLE doit contenir organisationId.');
      }
      if (!this.tenantAudit.obtenirEcoleId()) {
        throw new AuditTenantMissingException('Un audit au scope ECOLE doit contenir ecoleId.');
      }
    }
  }

  private validerOffline(): void {
    if (this.contexteAudit.estOffline() && !this.auditOfflineMetadata) {
      throw new AuditOfflineStateInvalidException(
        'Toute action offline doit porter ses metadonnees offline.',
      );
    }
  }

  private validerPermissionsHistoriques(): void {
    if (this.acteurAudit.obtenirTypeActeur() === 'UTILISATEUR' && !this.auditPermissionContext) {
      throw new AuditPermissionHistoryMissingException(
        'Toute action utilisateur doit conserver les permissions historiques.',
      );
    }
  }

  private validerSnapshots(): void {
    const definition = AUDIT_ACTION_MATRIX[this.actionAudit.obtenirValeur()];
    if (!definition.snapshotsAutorises && this.auditSnapshot) {
      throw new AuditSnapshotForbiddenException(
        `L'action ${this.actionAudit.obtenirValeur()} ne doit pas embarquer de snapshot selon la matrice officielle.`,
      );
    }
  }

  private validerCorrelation(): void {
    const actionsComplexes = new Set([
      'PAIEMENT_ANNULE',
      'CAISSE_CLOTUREE',
      'EXPORT_MASSIF',
      'CONFLIT_SYNCHRONISATION_DETECTE',
    ]);

    if (actionsComplexes.has(this.actionAudit.obtenirValeur()) && !this.auditCorrelation?.obtenirCorrelationId()) {
      throw new AuditInvalidClassificationException(
        `L'action complexe ${this.actionAudit.obtenirValeur()} doit porter un correlationId.`,
      );
    }
  }

  private static validerTexte(valeur: string, champ: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${champ} est obligatoire.`);
    }
    return valeur.trim();
  }
}
