import { clientApi } from '../../../services/api';
import {
  construireEntetesPilotageActif,
  lireContexteApiPlateformeGlobal,
} from '../../../shared/session/api-context';
import type {
  AcademiqueApiContext,
  AjouterLigneVersionReferentielRequest,
  AnalyseMigrationRequest,
  ApplicationMigrationRequest,
  ApplicationMigrationResultItem,
  ClasseAcademiqueItem,
  ComparaisonReferentielRequest,
  CreerVersionTravailReferentielRequest,
  DetailResponse,
  ListResponse,
  MigrationReferentielItem,
  ModifierLigneVersionReferentielRequest,
  ModifierPonderationLigneVersionReferentielRequest,
  OptionEtudeItem,
  PublicationReferentielRequest,
  ReordonnerLignesVersionReferentielRequest,
  RapportComparaisonReferentielItem,
  RapportMigrationItem,
  ReferentielCoursItem,
  ReferentielProgrammeItem,
  SectionScolaireItem,
  VerificationCoherenceVersionReferentielItem,
  VersionReferentielProgrammeItem,
} from '../../academique/models/academique.model';

type PlatformReferenceApiContext = AcademiqueApiContext;

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

interface PaginationQuery {
  page?: number;
  taillePage?: number;
}

function genererIdempotencyKey(prefixe: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefixe}-${crypto.randomUUID()}`;
  }

  return `${prefixe}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function construireEntetesContextePlateforme(contexte: PlatformReferenceApiContext): Record<string, string> {
  if (contexte.utilisateurId === null) {
    throw new Error('Le contexte frontend plateforme est incomplet.');
  }

  return construireEntetesPilotageActif(contexte, {
    organisationId: contexte.organisationId ?? undefined,
  });
}

function construireEntetesMutationPlateforme(
  contexte: PlatformReferenceApiContext,
  prefixe: string,
): Record<string, string> {
  return {
    ...construireEntetesContextePlateforme(contexte),
    'idempotency-key': genererIdempotencyKey(prefixe),
  };
}

export function lireContexteApiReferentielOfficielPlateforme(): PlatformReferenceApiContext {
  return lireContexteApiPlateformeGlobal();
}

export const platformOfficialReferenceApi = {
  async listerSectionsScolaires(contexte: PlatformReferenceApiContext, pagination?: PaginationQuery) {
    return clientApi.envoyer<ListResponse<SectionScolaireItem>>({
      chemin: `/api/sections-scolaires${construireQueryString({
        page: pagination?.page,
        taillePage: pagination?.taillePage,
      })}`,
      entetes: construireEntetesContextePlateforme(contexte),
    });
  },

  async listerClassesAcademiques(contexte: PlatformReferenceApiContext, pagination?: PaginationQuery) {
    return clientApi.envoyer<ListResponse<ClasseAcademiqueItem>>({
      chemin: `/api/classes-academiques${construireQueryString({
        page: pagination?.page,
        taillePage: pagination?.taillePage,
      })}`,
      entetes: construireEntetesContextePlateforme(contexte),
    });
  },

  async listerOptionsEtudes(contexte: PlatformReferenceApiContext, pagination?: PaginationQuery) {
    return clientApi.envoyer<ListResponse<OptionEtudeItem>>({
      chemin: `/api/options-etudes${construireQueryString({
        page: pagination?.page,
        taillePage: pagination?.taillePage,
      })}`,
      entetes: construireEntetesContextePlateforme(contexte),
    });
  },

  async creerSectionScolaire(
    demande: {
      code: string;
      libelle: string;
      ordreAffichage: number;
      creePar: string;
    },
    contexte: PlatformReferenceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<SectionScolaireItem>>({
      chemin: '/api/sections-scolaires',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutationPlateforme(contexte, 'creation-section-scolaire'),
    });
  },

  async creerClasseAcademique(
    demande: {
      idSectionScolaire: string;
      code: string;
      libelle: string;
      ordrePedagogique: number;
      cycle: string;
      accepteOptions: boolean;
      optionObligatoire: boolean;
      typeStructureEvaluation: string;
      idOptionEtude?: string;
      estClasseTENASOSP?: boolean;
      estClasseEXETAT?: boolean;
      estClasseFinaliste?: boolean;
      creePar: string;
    },
    contexte: PlatformReferenceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<ClasseAcademiqueItem>>({
      chemin: '/api/classes-academiques',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutationPlateforme(contexte, 'creation-classe-academique'),
    });
  },

  async creerOptionEtude(
    demande: {
      code: number;
      libelle: string;
      typeOption?: string;
      estTechnique: boolean;
      categorieTechnique?: 'GROUPE_1' | 'GROUPE_2' | null;
      abreviation?: string;
      ordreAffichage?: number;
      creePar: string;
    },
    contexte: PlatformReferenceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<OptionEtudeItem>>({
      chemin: '/api/options-etudes',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutationPlateforme(contexte, 'creation-option-etude'),
    });
  },

  async listerReferentielsCours(contexte: PlatformReferenceApiContext, pagination?: PaginationQuery) {
    return clientApi.envoyer<ListResponse<ReferentielCoursItem>>({
      chemin: `/api/referentiels/cours${construireQueryString({
        page: pagination?.page,
        taillePage: pagination?.taillePage,
      })}`,
      entetes: construireEntetesContextePlateforme(contexte),
    });
  },

  async listerReferentielsProgrammes(
    idClasseAcademique: string,
    contexte: PlatformReferenceApiContext,
    pagination?: PaginationQuery,
  ) {
    return clientApi.envoyer<ListResponse<ReferentielProgrammeItem>>({
      chemin: `/api/referentiels/programmes${construireQueryString({
        idClasseAcademique,
        page: pagination?.page,
        taillePage: pagination?.taillePage,
      })}`,
      entetes: construireEntetesContextePlateforme(contexte),
    });
  },

  async consulterReferentielProgramme(idReferentielProgramme: string, contexte: PlatformReferenceApiContext) {
    return clientApi.envoyer<DetailResponse<ReferentielProgrammeItem>>({
      chemin: `/api/referentiels/programmes/${idReferentielProgramme}`,
      entetes: construireEntetesContextePlateforme(contexte),
    });
  },

  async creerVersionTravailReferentiel(
    idReferentielProgramme: string,
    demande: CreerVersionTravailReferentielRequest,
    contexte: PlatformReferenceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<VersionReferentielProgrammeItem>>({
      chemin: `/api/referentiels/programmes/${idReferentielProgramme}/versions-travail`,
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutationPlateforme(contexte, 'creation-version-travail-referentiel'),
    });
  },

  async ajouterLigneVersionReferentiel(
    idVersionReferentielProgramme: string,
    demande: AjouterLigneVersionReferentielRequest,
    contexte: PlatformReferenceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<VersionReferentielProgrammeItem>>({
      chemin: `/api/referentiels/versions/${idVersionReferentielProgramme}/lignes`,
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutationPlateforme(contexte, 'ajout-ligne-version-referentiel'),
    });
  },

  async modifierLigneVersionReferentiel(
    idVersionReferentielProgramme: string,
    idLigneReferentielProgramme: string,
    demande: ModifierLigneVersionReferentielRequest,
    contexte: PlatformReferenceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<VersionReferentielProgrammeItem>>({
      chemin: `/api/referentiels/versions/${idVersionReferentielProgramme}/lignes/${idLigneReferentielProgramme}`,
      methode: 'PATCH',
      corps: demande,
      entetes: construireEntetesMutationPlateforme(contexte, 'modification-ligne-version-referentiel'),
    });
  },

  async retirerLigneVersionReferentiel(
    idVersionReferentielProgramme: string,
    idLigneReferentielProgramme: string,
    contexte: PlatformReferenceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<VersionReferentielProgrammeItem>>({
      chemin: `/api/referentiels/versions/${idVersionReferentielProgramme}/lignes/${idLigneReferentielProgramme}`,
      methode: 'DELETE',
      corps: {},
      entetes: construireEntetesMutationPlateforme(contexte, 'retrait-ligne-version-referentiel'),
    });
  },

  async reordonnerLignesVersionReferentiel(
    idVersionReferentielProgramme: string,
    demande: ReordonnerLignesVersionReferentielRequest,
    contexte: PlatformReferenceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<VersionReferentielProgrammeItem>>({
      chemin: `/api/referentiels/versions/${idVersionReferentielProgramme}/lignes/reordonner`,
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutationPlateforme(contexte, 'reordonnancement-version-referentiel'),
    });
  },

  async modifierPonderationLigneVersionReferentiel(
    idVersionReferentielProgramme: string,
    idLigneReferentielProgramme: string,
    demande: ModifierPonderationLigneVersionReferentielRequest,
    contexte: PlatformReferenceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<VersionReferentielProgrammeItem>>({
      chemin: `/api/referentiels/versions/${idVersionReferentielProgramme}/lignes/${idLigneReferentielProgramme}/ponderation`,
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutationPlateforme(contexte, 'ponderation-ligne-version-referentiel'),
    });
  },

  async verifierCoherenceVersionReferentiel(
    idVersionReferentielProgramme: string,
    contexte: PlatformReferenceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<VerificationCoherenceVersionReferentielItem>>({
      chemin: `/api/referentiels/versions/${idVersionReferentielProgramme}/verifier-coherence`,
      methode: 'POST',
      corps: {},
      entetes: construireEntetesMutationPlateforme(contexte, 'verification-coherence-version-referentiel'),
    });
  },

  async publierVersionReferentiel(demande: PublicationReferentielRequest, contexte: PlatformReferenceApiContext) {
    return clientApi.envoyer<DetailResponse<VersionReferentielProgrammeItem>>({
      chemin: '/api/referentiels/versions',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutationPlateforme(contexte, 'publication-referentiel'),
    });
  },

  async activerVersionReferentiel(idVersionReferentielProgramme: string, contexte: PlatformReferenceApiContext) {
    return clientApi.envoyer<DetailResponse<VersionReferentielProgrammeItem>>({
      chemin: `/api/referentiels/versions/${idVersionReferentielProgramme}/activer`,
      methode: 'POST',
      corps: {},
      entetes: construireEntetesMutationPlateforme(contexte, 'activation-referentiel'),
    });
  },

  async importerReferentiel(
    chemin: string,
    corps: Record<string, unknown>,
    contexte: PlatformReferenceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<Record<string, unknown>>>({
      chemin,
      methode: 'POST',
      corps,
      entetes: construireEntetesMutationPlateforme(contexte, 'import-referentiel'),
    });
  },

  async comparerVersionsReferentiel(demande: ComparaisonReferentielRequest, contexte: PlatformReferenceApiContext) {
    return clientApi.envoyer<DetailResponse<RapportComparaisonReferentielItem>>({
      chemin: '/api/referentiels/comparer',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesContextePlateforme(contexte),
    });
  },

  async listerMigrationsReferentiel(
    idProgrammeNiveau: string,
    contexte: PlatformReferenceApiContext,
    pagination?: PaginationQuery,
  ) {
    return clientApi.envoyer<ListResponse<MigrationReferentielItem>>({
      chemin: `/api/migrations-referentiel${construireQueryString({
        idProgrammeNiveau,
        page: pagination?.page,
        taillePage: pagination?.taillePage,
      })}`,
      entetes: construireEntetesContextePlateforme(contexte),
    });
  },

  async consulterMigrationReferentiel(idMigrationReferentielProgramme: string, contexte: PlatformReferenceApiContext) {
    return clientApi.envoyer<DetailResponse<RapportMigrationItem>>({
      chemin: `/api/migrations-referentiel/${idMigrationReferentielProgramme}`,
      entetes: construireEntetesContextePlateforme(contexte),
    });
  },

  async analyserMigrationReferentiel(demande: AnalyseMigrationRequest, contexte: PlatformReferenceApiContext) {
    return clientApi.envoyer<DetailResponse<RapportMigrationItem>>({
      chemin: '/api/migrations-referentiel/analyser',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutationPlateforme(contexte, 'analyse-migration-referentiel'),
    });
  },

  async appliquerMigrationReferentiel(
    demande: ApplicationMigrationRequest,
    contexte: PlatformReferenceApiContext,
  ) {
    return clientApi.envoyer<DetailResponse<ApplicationMigrationResultItem>>({
      chemin: '/api/migrations-referentiel/appliquer',
      methode: 'POST',
      corps: demande,
      entetes: construireEntetesMutationPlateforme(contexte, 'application-migration-referentiel'),
    });
  },

  async annulerMigrationReferentiel(idMigrationReferentielProgramme: string, contexte: PlatformReferenceApiContext) {
    return clientApi.envoyer<DetailResponse<MigrationReferentielItem>>({
      chemin: `/api/migrations-referentiel/${idMigrationReferentielProgramme}/annuler`,
      methode: 'POST',
      corps: {},
      entetes: construireEntetesMutationPlateforme(contexte, 'annulation-migration-referentiel'),
    });
  },

  async relancerRecalculMigration(idMigrationReferentielProgramme: string, contexte: PlatformReferenceApiContext) {
    return clientApi.envoyer<DetailResponse<MigrationReferentielItem>>({
      chemin: `/api/migrations-referentiel/${idMigrationReferentielProgramme}/relancer-recalcul`,
      methode: 'POST',
      corps: {},
      entetes: construireEntetesMutationPlateforme(contexte, 'relance-migration-referentiel'),
    });
  },
};
