import { clientApi } from '../../../services/api';
import { sessionStore } from '../../../shared/auth/session.store';
import type {
  AcademiqueApiContext,
  AnalyseMigrationRequest,
  AnneeScolaireItem,
  ApplicationMigrationRequest,
  ApplicationMigrationResultItem,
  BasculeAnneeScolaireResponse,
  CalendrierAcademiqueItem,
  ClassePedagogiqueItem,
  ClasseAcademiqueItem,
  ComparaisonReferentielRequest,
  DetailResponse,
  EtatLocalProgrammeNiveauItem,
  GarantieAnneeActiveResponse,
  ListResponse,
  MigrationReferentielItem,
  OptionEtudeItem,
  PreparationAnneeScolaireResponse,
  ProgrammeNiveauItem,
  PublicationReferentielRequest,
  RapportComparaisonReferentielItem,
  RapportMigrationItem,
  ReglesFraisClasseItem,
  ReferentielProgrammeItem,
  ResponsabiliteClassePedagogiqueItem,
  SectionScolaireItem,
  VersionReferentielProgrammeItem,
} from '../models/academique.model';

function lireVariableEnvironnement(nom: string): string | null {
  const valeur = import.meta.env[nom];
  if (typeof valeur !== 'string') {
    return null;
  }

  const nettoyee = valeur.trim();
  return nettoyee.length > 0 ? nettoyee : null;
}

function construireQueryString(query: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([cle, valeur]) => {
    if (valeur !== undefined && String(valeur).trim().length > 0) {
      params.set(cle, String(valeur));
    }
  });

  const serialise = params.toString();
  return serialise.length > 0 ? `?${serialise}` : '';
}

function genererIdempotencyKey(prefixe: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefixe}-${crypto.randomUUID()}`;
  }

  return `${prefixe}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function construireEntetesContexte(contexte: AcademiqueApiContext): Record<string, string> {
  if (
    contexte.organisationId === null
    || contexte.ecoleId === null
    || contexte.utilisateurId === null
  ) {
    throw new Error(
      'Le contexte frontend academique est incomplet. Configurez VITE_REFERENTIEL_ORGANISATION_ID, VITE_REFERENTIEL_ECOLE_ID et VITE_REFERENTIEL_UTILISATEUR_ID.',
    );
  }

  return {
    'x-organisation-id': contexte.organisationId,
    'x-tenant-id': contexte.ecoleId,
    'x-user-id': contexte.utilisateurId,
    'x-role-actif': sessionStore.state.actorCode,
  };
}

function construireEntetesMutation(
  contexte: AcademiqueApiContext,
  prefixe: string,
): Record<string, string> {
  return {
    ...construireEntetesContexte(contexte),
    'idempotency-key': genererIdempotencyKey(prefixe),
  };
}

export function lireContexteApiAcademique(): AcademiqueApiContext {
  return {
    organisationId: lireVariableEnvironnement('VITE_REFERENTIEL_ORGANISATION_ID'),
    ecoleId: lireVariableEnvironnement('VITE_REFERENTIEL_ECOLE_ID'),
    utilisateurId: lireVariableEnvironnement('VITE_REFERENTIEL_UTILISATEUR_ID'),
  };
}

export const academiqueApi = {
  async listerSectionsScolaires(contexte: AcademiqueApiContext) {
    return clientApi.envoyer<ListResponse<SectionScolaireItem>>({
      chemin: '/api/sections-scolaires',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async listerClassesAcademiques(contexte: AcademiqueApiContext) {
    return clientApi.envoyer<ListResponse<ClasseAcademiqueItem>>({
      chemin: '/api/classes-academiques',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async listerOptionsEtudes(contexte: AcademiqueApiContext) {
    return clientApi.envoyer<ListResponse<OptionEtudeItem>>({
      chemin: '/api/options-etudes',
      entetes: construireEntetesContexte(contexte),
    });
  },

  async listerReferentielsProgrammes(idClasseAcademique: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<ListResponse<ReferentielProgrammeItem>>({
      chemin: `/api/referentiels/programmes${construireQueryString({ idClasseAcademique })}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterReferentielProgramme(idReferentielProgramme: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<ReferentielProgrammeItem>>({
      chemin: `/api/referentiels/programmes/${idReferentielProgramme}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async publierVersionReferentiel(demande: PublicationReferentielRequest, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<VersionReferentielProgrammeItem>>({
      chemin: '/api/referentiels/versions',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'publication-referentiel'),
    });
  },

  async activerVersionReferentiel(idVersionReferentielProgramme: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<VersionReferentielProgrammeItem>>({
      chemin: `/api/referentiels/versions/${idVersionReferentielProgramme}/activer`,
      methode: 'POST',
      corps: {},
      entetes: construireEntetesMutation(contexte, 'activation-referentiel'),
    });
  },

  async importerReferentiel(
    chemin: string,
    corps: Record<string, unknown>,
    contexte: AcademiqueApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<Record<string, unknown>>>({
      chemin,
      methode: 'POST',
      corps,
      entetes: construireEntetesMutation(contexte, 'import-referentiel'),
    });
  },

  async comparerVersionsReferentiel(demande: ComparaisonReferentielRequest, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<RapportComparaisonReferentielItem>>({
      chemin: '/api/referentiels/comparer',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async listerMigrationsReferentiel(idProgrammeNiveau: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<ListResponse<MigrationReferentielItem>>({
      chemin: `/api/migrations-referentiel${construireQueryString({ idProgrammeNiveau })}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterMigrationReferentiel(idMigrationReferentielProgramme: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<RapportMigrationItem>>({
      chemin: `/api/migrations-referentiel/${idMigrationReferentielProgramme}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async analyserMigrationReferentiel(demande: AnalyseMigrationRequest, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<RapportMigrationItem>>({
      chemin: '/api/migrations-referentiel/analyser',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'analyse-migration-referentiel'),
    });
  },

  async appliquerMigrationReferentiel(
    demande: ApplicationMigrationRequest,
    contexte: AcademiqueApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<ApplicationMigrationResultItem>>({
      chemin: '/api/migrations-referentiel/appliquer',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'application-migration-referentiel'),
    });
  },

  async annulerMigrationReferentiel(idMigrationReferentielProgramme: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<MigrationReferentielItem>>({
      chemin: `/api/migrations-referentiel/${idMigrationReferentielProgramme}/annuler`,
      methode: 'POST',
      corps: {},
      entetes: construireEntetesMutation(contexte, 'annulation-migration-referentiel'),
    });
  },

  async relancerRecalculMigration(idMigrationReferentielProgramme: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<MigrationReferentielItem>>({
      chemin: `/api/migrations-referentiel/${idMigrationReferentielProgramme}/relancer-recalcul`,
      methode: 'POST',
      corps: {},
      entetes: construireEntetesMutation(contexte, 'relance-migration-referentiel'),
    });
  },

  async creerAnneeScolaire(
    demande: {
      idEcole: string;
      code: string;
      libelle: string;
      dateDebut: string;
      dateFin: string;
      creePar: string;
    },
    contexte: AcademiqueApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<AnneeScolaireItem>>({
      chemin: '/api/annees-scolaires',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'creation-annee-scolaire'),
    });
  },

  async listerAnneesScolaires(idEcole: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<ListResponse<AnneeScolaireItem>>({
      chemin: `/api/annees-scolaires${construireQueryString({ idEcole })}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAnneeActive(idEcole: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<AnneeScolaireItem | null>>({
      chemin: `/api/annees-scolaires/active${construireQueryString({ idEcole })}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterAnneeScolaire(idAnneeScolaire: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<AnneeScolaireItem>>({
      chemin: `/api/annees-scolaires/${idAnneeScolaire}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async modifierAnneeScolaire(
    idAnneeScolaire: string,
    demande: {
      code: string;
      libelle: string;
      dateDebut: string;
      dateFin: string;
      modifiePar: string;
    },
    contexte: AcademiqueApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<AnneeScolaireItem>>({
      chemin: `/api/annees-scolaires/${idAnneeScolaire}`,
      methode: 'PATCH',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'modification-annee-scolaire'),
    });
  },

  async preparerAnneeScolaireSuivante(
    demande: {
      idEcole: string;
      creePar: string;
      dateDebut?: string;
      dateFin?: string;
    },
    contexte: AcademiqueApiContext,
  ) {
    return clientApi.envoyer<PreparationAnneeScolaireResponse>({
      chemin: '/api/annees-scolaires/preparer-suivante',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'preparer-annee-scolaire'),
    });
  },

  async garantirAnneeActive(
    demande: {
      idEcole: string;
      modifiePar: string;
      dateReference?: string;
      dateDebut?: string;
      dateFin?: string;
    },
    contexte: AcademiqueApiContext,
  ) {
    return clientApi.envoyer<GarantieAnneeActiveResponse>({
      chemin: '/api/annees-scolaires/garantir-active',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'garantir-annee-active'),
    });
  },

  async basculerAnneeScolaire(
    demande: {
      idEcole: string;
      modifiePar: string;
      creerSuivanteSiAbsente?: boolean;
      dateDebutSuivante?: string;
      dateFinSuivante?: string;
    },
    contexte: AcademiqueApiContext,
  ) {
    return clientApi.envoyer<BasculeAnneeScolaireResponse>({
      chemin: '/api/annees-scolaires/basculer',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'bascule-annee-scolaire'),
    });
  },

  async activerAnneeScolaire(idAnneeScolaire: string, modifiePar: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<AnneeScolaireItem>>({
      chemin: `/api/annees-scolaires/${idAnneeScolaire}/activer`,
      methode: 'POST',
      corps: { modifiePar },
      entetes: construireEntetesMutation(contexte, 'activation-annee-scolaire'),
    });
  },

  async cloturerAnneeScolaire(idAnneeScolaire: string, modifiePar: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<AnneeScolaireItem>>({
      chemin: `/api/annees-scolaires/${idAnneeScolaire}/cloturer`,
      methode: 'POST',
      corps: { modifiePar },
      entetes: construireEntetesMutation(contexte, 'cloture-annee-scolaire'),
    });
  },

  async archiverAnneeScolaire(idAnneeScolaire: string, modifiePar: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<AnneeScolaireItem>>({
      chemin: `/api/annees-scolaires/${idAnneeScolaire}/archiver`,
      methode: 'POST',
      corps: { modifiePar },
      entetes: construireEntetesMutation(contexte, 'archivage-annee-scolaire'),
    });
  },

  async creerClassePedagogique(
    demande: {
      idEcole: string;
      idAnneeScolaire: string;
      idClasseAcademique: string;
      code: string;
      libelle: string;
      suffixeParallele?: string;
      capaciteAccueil?: number;
      creePar: string;
    },
    contexte: AcademiqueApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<ClassePedagogiqueItem>>({
      chemin: '/api/classes-pedagogiques',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'creation-classe-pedagogique'),
    });
  },

  async listerClassesPedagogiques(idEcole: string, idAnneeScolaire: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<ListResponse<ClassePedagogiqueItem>>({
      chemin: `/api/classes-pedagogiques${construireQueryString({ idEcole, idAnneeScolaire })}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterReglesFraisClasse(idClassePedagogique: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<ReglesFraisClasseItem>>({
      chemin: `/api/classes-pedagogiques/${idClassePedagogique}/regles-frais`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async renommerClassePedagogique(
    idClassePedagogique: string,
    nouveauLibelle: string,
    modifiePar: string,
    contexte: AcademiqueApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<ClassePedagogiqueItem>>({
      chemin: `/api/classes-pedagogiques/${idClassePedagogique}/renommer`,
      methode: 'PATCH',
      corps: { nouveauLibelle, modifiePar },
      entetes: construireEntetesMutation(contexte, 'renommage-classe-pedagogique'),
    });
  },

  async desactiverClassePedagogique(idClassePedagogique: string, modifiePar: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<ClassePedagogiqueItem>>({
      chemin: `/api/classes-pedagogiques/${idClassePedagogique}/desactiver`,
      methode: 'POST',
      corps: { modifiePar },
      entetes: construireEntetesMutation(contexte, 'desactivation-classe-pedagogique'),
    });
  },

  async archiverClassePedagogique(idClassePedagogique: string, modifiePar: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<ClassePedagogiqueItem>>({
      chemin: `/api/classes-pedagogiques/${idClassePedagogique}/archiver`,
      methode: 'POST',
      corps: { modifiePar },
      entetes: construireEntetesMutation(contexte, 'archivage-classe-pedagogique'),
    });
  },

  async attribuerResponsableClassePedagogique(
    idClassePedagogique: string,
    demande: {
      idUtilisateurEnseignant: string;
      creePar: string;
    },
    contexte: AcademiqueApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<ResponsabiliteClassePedagogiqueItem | null>>({
      chemin: `/api/classes-pedagogiques/${idClassePedagogique}/responsable`,
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'attribution-responsable-classe'),
    });
  },

  async consulterResponsableClassePedagogique(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    contexte: AcademiqueApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<ResponsabiliteClassePedagogiqueItem | null>>({
      chemin: `/api/classes-pedagogiques/${idClassePedagogique}/responsable/annee/${idAnneeScolaire}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async retirerResponsableClassePedagogique(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    contexte: AcademiqueApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<ResponsabiliteClassePedagogiqueItem | null>>({
      chemin: `/api/classes-pedagogiques/${idClassePedagogique}/responsable/annee/${idAnneeScolaire}`,
      methode: 'DELETE',
      entetes: construireEntetesMutation(contexte, 'retrait-responsable-classe'),
    });
  },

  async creerCalendrierAcademique(
    demande: {
      idEcole: string;
      idAnneeScolaire: string;
      typeStructureEvaluation: string;
      dateDebutAnnee: string;
      dateFinAnnee: string;
      periodes: Array<{
        code: string;
        libelle: string;
        ordre: number;
        typePeriode: string;
        dateDebut: string;
        dateFin: string;
      }>;
      creePar: string;
    },
    contexte: AcademiqueApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<CalendrierAcademiqueItem>>({
      chemin: '/api/calendriers-academiques',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'creation-calendrier-academique'),
    });
  },

  async consulterCalendrierParEcoleEtAnnee(idEcole: string, idAnneeScolaire: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<CalendrierAcademiqueItem | null>>({
      chemin: `/api/calendriers-academiques${construireQueryString({ idEcole, idAnneeScolaire })}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterCalendrierAcademique(idCalendrierAcademique: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<CalendrierAcademiqueItem>>({
      chemin: `/api/calendriers-academiques/${idCalendrierAcademique}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async modifierPeriodeCalendrier(
    idCalendrierAcademique: string,
    codePeriode: string,
    demande: {
      code?: string;
      libelle: string;
      ordre: number;
      typePeriode: string;
      dateDebut: string;
      dateFin: string;
      modifiePar: string;
    },
    contexte: AcademiqueApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<CalendrierAcademiqueItem>>({
      chemin: `/api/calendriers-academiques/${idCalendrierAcademique}/periodes/${codePeriode}`,
      methode: 'PATCH',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'modification-periode-calendrier'),
    });
  },

  async validerCalendrierAcademique(idCalendrierAcademique: string, validePar: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<CalendrierAcademiqueItem>>({
      chemin: `/api/calendriers-academiques/${idCalendrierAcademique}/valider`,
      methode: 'POST',
      corps: { validePar },
      entetes: construireEntetesMutation(contexte, 'validation-calendrier'),
    });
  },

  async verrouillerCalendrierAcademique(
    idCalendrierAcademique: string,
    verrouillePar: string,
    contexte: AcademiqueApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<CalendrierAcademiqueItem>>({
      chemin: `/api/calendriers-academiques/${idCalendrierAcademique}/verrouiller`,
      methode: 'POST',
      corps: { verrouillePar },
      entetes: construireEntetesMutation(contexte, 'verrouillage-calendrier'),
    });
  },

  async initialiserProgrammeNiveau(
    demande: {
      idEcole: string;
      idAnneeScolaire: string;
      idClasseAcademique: string;
      idReferentielProgramme: string;
      idVersionReferentielProgramme: string;
      creePar: string;
    },
    contexte: AcademiqueApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<ProgrammeNiveauItem>>({
      chemin: '/api/programmes-niveau/initialiser',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutation(contexte, 'initialisation-programme-niveau'),
    });
  },

  async listerProgrammesNiveau(idEcole: string, idAnneeScolaire: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<ListResponse<ProgrammeNiveauItem>>({
      chemin: `/api/programmes-niveau${construireQueryString({ idEcole, idAnneeScolaire })}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async consulterProgrammeNiveau(idProgrammeNiveau: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<ProgrammeNiveauItem>>({
      chemin: `/api/programmes-niveau/${idProgrammeNiveau}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async produireEtatLocalProgramme(idProgrammeNiveau: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<EtatLocalProgrammeNiveauItem>>({
      chemin: `/api/programmes-niveau/${idProgrammeNiveau}/etat-local`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async validerProgrammeNiveau(idProgrammeNiveau: string, validePar: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<ProgrammeNiveauItem>>({
      chemin: `/api/programmes-niveau/${idProgrammeNiveau}/valider`,
      methode: 'POST',
      corps: { validePar },
      entetes: construireEntetesMutation(contexte, 'validation-programme-niveau'),
    });
  },

  async archiverProgrammeNiveau(idProgrammeNiveau: string, archivePar: string, contexte: AcademiqueApiContext) {
    return clientApi.envoyer<DetailResponse<ProgrammeNiveauItem>>({
      chemin: `/api/programmes-niveau/${idProgrammeNiveau}/archiver`,
      methode: 'POST',
      corps: { archivePar },
      entetes: construireEntetesMutation(contexte, 'archivage-programme-niveau'),
    });
  },
};
