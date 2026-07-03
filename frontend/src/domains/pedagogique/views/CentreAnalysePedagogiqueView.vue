<template>
  <PageContainer>
    <PageHeader
      eyebrow="MP-07"
      title="Centre d analyse pedagogique"
      description="Ecran pilote de lecture ResultatBulletinEleve, sans reinvention de regles metier en frontend."
    >
      <template #actions>
        <div class="pedagogique-actions">
          <RouterLink class="pedagogique-pill" to="/app/pedagogique">
            <ArrowLeft />
            <span>Retour pedagogique</span>
          </RouterLink>
          <button class="pedagogique-pill" type="button" :disabled="!center" @click="exporterVueActive">
            <Sheet />
            <span>Excel</span>
          </button>
          <button class="pedagogique-pill" type="button" :disabled="!center" @click="ouvrirVersionPdf">
            <FileText />
            <span>PDF</span>
          </button>
          <button class="pedagogique-pill pedagogique-pill--action" type="button" :disabled="!center" @click="imprimerPage">
            <Printer />
            <span>Impression</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Perimetre pedagogique"
      description="La lecture reste strictement bornee par permission + perimetre. Le frontend rend ce cadrage visible."
    >
      <div class="pedagogique-hero">
        <div class="pedagogique-hero__lead">
          <div class="pedagogique-hero__icon">
            <Microscope />
          </div>
          <div>
            <p class="pedagogique-label">Acteur visible</p>
            <strong>{{ session.actorLabel }}</strong>
          </div>
        </div>
        <div class="pedagogique-badges">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Organisation" :value="context.organizationName" />
          <ContextBadge label="Ecole" :value="context.schoolName" />
          <ContextBadge label="Portee" :value="center?.scopeLabel ?? fallbackScopeLabel" />
        </div>
      </div>
      <div class="pedagogique-callout">
        <ShieldCheck />
        <p>{{ center?.actorScopeMessage ?? perimeterMessage }}</p>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="PED-008">
      <template v-if="uiState === 'loading'">
        <LoadingState
          title="Chargement du centre d analyse"
          message="Lecture des echecs, comparatifs, non classes et pistes analytiques en cours."
        />
      </template>

      <template v-else-if="uiState === 'technical-error'">
        <ErrorState
          title="Centre d analyse indisponible"
          :message="technicalErrorMessage"
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Centre d analyse non autorise"
          message="Cette vue reste reservee au titulaire, au prefet des etudes et au directeur des etudes dans leur vrai perimetre."
        />

        <template v-else>
          <div class="analysis-kpi-grid">
            <div class="analysis-kpi-card">
              <small>Acteur</small>
              <strong>{{ session.actorCode }}</strong>
              <span>{{ perimeterMessage }}</span>
            </div>
            <div class="analysis-kpi-card">
              <small>Portee</small>
              <strong>{{ center?.scopeLabel ?? fallbackScopeLabel }}</strong>
              <span>{{ center?.activeColumnLabel ?? codeColonneInput }}</span>
            </div>
            <div class="analysis-kpi-card">
              <small>Precontrole</small>
              <strong>{{ canLoad ? 'Pret' : 'Incomplet' }}</strong>
              <span>{{ missingFieldsLabel }}</span>
            </div>
          </div>

          <SectionBlock
            title="Filtres reels"
            description="Le backend porte les calculs. Le frontend choisit la bonne classe, la bonne colonne et le bon eleve si un detail est souhaite."
          >
            <div class="pedagogique-form-stack">
              <div class="pedagogique-filter-grid">
                <label class="pedagogique-field">
                  <span>Annee scolaire</span>
                  <input v-model="anneeScolaireLabelInput" type="text" placeholder="2025-2026" />
                </label>
                <div class="pedagogique-context-card">
                  <small>Id annee scolaire active</small>
                  <strong>{{ context.schoolYearId || 'Non resolu' }}</strong>
                  <span>Contexte shell actif</span>
                </div>

                <label class="pedagogique-field">
                  <span>Section</span>
                  <input v-model="sectionLabelInput" type="text" placeholder="Secondaire" />
                </label>

                <label class="pedagogique-field">
                  <span>Classe</span>
                  <input v-model="classeLabelInput" type="text" placeholder="4e CG" />
                </label>

                <label class="pedagogique-field">
                  <span>Id classe pedagogique</span>
                  <input v-model="idClassePedagogiqueInput" type="text" placeholder="uuid-classe" />
                </label>

                <label class="pedagogique-field">
                  <span>Colonne d analyse</span>
                  <select v-model="codeColonneInput">
                    <option v-for="column in columnOptions" :key="column" :value="column">
                      {{ column }}
                    </option>
                  </select>
                </label>

                <label class="pedagogique-field">
                  <span>Eleve detaille</span>
                  <input v-model="eleveLabelInput" type="text" placeholder="Nom eleve" />
                </label>

                <label class="pedagogique-field">
                  <span>Id eleve</span>
                  <input v-model="idEleveInput" type="text" placeholder="uuid-eleve" />
                </label>

                <label class="pedagogique-field pedagogique-field--full">
                  <span>Classes comparatives</span>
                  <input
                    v-model="idClassesPedagogiquesInput"
                    type="text"
                    placeholder="uuid-classe-a,uuid-classe-b,uuid-classe-c"
                  />
                </label>
              </div>

              <div class="analysis-checklist">
                <div :class="['analysis-check', context.schoolYearId.trim() ? 'is-ready' : 'is-missing']">
                  <strong>Annee scolaire</strong>
                  <span>{{ context.schoolYearId.trim() ? 'Renseignee' : 'Manquante' }}</span>
                </div>
                <div :class="['analysis-check', idClassePedagogiqueInput.trim() ? 'is-ready' : 'is-missing']">
                  <strong>Classe</strong>
                  <span>{{ idClassePedagogiqueInput.trim() ? 'Renseignee' : 'Manquante' }}</span>
                </div>
                <div :class="['analysis-check', codeColonneInput.trim() ? 'is-ready' : 'is-missing']">
                  <strong>Colonne</strong>
                  <span>{{ codeColonneInput.trim() || 'Manquante' }}</span>
                </div>
              </div>

              <div class="pedagogique-actions-row">
                <button class="pedagogique-primary-action" type="button" :disabled="!canLoad" @click="chargerCentre">
                  <Search />
                  <span>Charger les analyses</span>
                </button>
                <button class="pedagogique-secondary-action" type="button" @click="synchroniserDepuisRoute">
                  Reprendre la route
                </button>
                <button class="pedagogique-secondary-action" type="button" @click="reinitialiserFiltres">
                  Reinitialiser
                </button>
              </div>

              <div class="pedagogique-guard-panel">
                <div class="pedagogique-guard-panel__header">
                  <ShieldCheck />
                  <strong>Rappels backend PED-08</strong>
                </div>
                <ul>
                  <li>Le centre d analyse lit ResultatBulletinEleve et ses projections, il ne delibere pas a la place du backend.</li>
                  <li>Perequation, repechage, deliberation et seconde session restent bornees au secondaire.</li>
                  <li>Les non classes, echecs et comparatifs restent des lectures analytiques reelles, pas des cartes marketing.</li>
                </ul>
              </div>
            </div>
          </SectionBlock>

          <EmptyState
            v-if="!center"
            title="Centre d analyse en attente"
            message="Chargez une classe, une annee et une colonne reelle pour ouvrir les analyses pedagogiques."
          />

          <template v-else>
            <div class="pedagogique-kpi-grid">
              <div class="pedagogique-kpi-card">
                <small>Colonne active</small>
                <strong>{{ center.activeColumnLabel }}</strong>
                <span>Lecture officielle du backend</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Echecs</small>
                <strong>{{ center.echecs.length }}</strong>
                <span>Eleves exposes par la projection echecs</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Echecs profonds</small>
                <strong>{{ center.echecsProfonds.length }}</strong>
                <span>Dossiers critiques a surveiller</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Non classes</small>
                <strong>{{ center.nonClasses.length }}</strong>
                <span>Sorties hors classement exposees</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Perequation</small>
                <strong>{{ center.perequation.length }}</strong>
                <span>Eligibilites lues sans recalcul frontend</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Deliberation</small>
                <strong>{{ center.deliberation.length }}</strong>
                <span>Dossiers prets a la lecture collegiale</span>
              </div>
            </div>

            <SectionBlock
              v-if="center.studentDetail"
              title="Resume resultat eleve"
              description="Le detail eleve reste visible en tete du centre lorsqu un eleve cible est fourni."
            >
              <div class="analysis-student-grid">
                <div class="analysis-student-card">
                  <small>Eleve</small>
                  <strong>{{ center.studentDetail.eleveLabel }}</strong>
                  <span>{{ center.studentDetail.eleveId }}</span>
                </div>
                <div class="analysis-student-card">
                  <small>Pourcentage resume</small>
                  <strong>{{ center.studentDetail.resumePourcentage }}</strong>
                  <span>Rang {{ center.studentDetail.resumeRang }}</span>
                </div>
                <div class="analysis-student-card">
                  <small>Diagnostics</small>
                  <strong>{{ center.studentDetail.nombreDiagnostics }}</strong>
                  <span>Colonnes et diagnostics consolides</span>
                </div>
              </div>
              <div class="pedagogique-actions-row">
                <RouterLink
                  class="pedagogique-inline-link"
                  :to="{
                    path: '/app/pedagogique/resultats/detail',
                    query: {
                      idEleve: center.studentDetail.eleveId,
                      idAnneeScolaire: context.schoolYearId,
                      idClassePedagogique: idClassePedagogiqueInput,
                      codeColonne: codeColonneInput,
                      anneeScolaire: anneeScolaireLabelInput,
                      classe: classeLabelInput,
                      section: sectionLabelInput,
                      eleve: eleveLabelInput,
                    },
                  }"
                >
                  Ouvrir la fiche eleve
                </RouterLink>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Sous-analyses"
              description="Chaque onglet correspond a une projection backend reelle du centre d analyse pedagogique."
            >
              <div class="pedagogique-tabs">
                <button
                  v-for="tab in tabs"
                  :key="tab.code"
                  class="pedagogique-tab"
                  :class="{ 'pedagogique-tab--active': activeTab === tab.code }"
                  type="button"
                  @click="activeTab = tab.code"
                >
                  <span>{{ tab.label }}</span>
                  <small>{{ tabCount(tab.code) }}</small>
                </button>
              </div>
            </SectionBlock>

            <SectionBlock :title="activeTabLabel" :description="activeTabDescription">
              <div v-if="activeRows.length === 0" class="pedagogique-empty-inline">
                Aucune ligne exposee pour cet onglet dans le perimetre courant.
              </div>
              <div v-else class="pedagogique-table-shell">
                <table class="pedagogique-table">
                  <thead>
                    <tr>
                      <th v-for="header in activeHeaders" :key="header">{{ header }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in activeRows" :key="`${activeTab}-${index}`">
                      <td v-for="header in activeHeaders" :key="`${activeTab}-${index}-${header}`">
                        {{ row[header] ?? '-' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionBlock>
          </template>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  FileText,
  Microscope,
  Printer,
  Search,
  Sheet,
  ShieldCheck,
} from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import {
  type PedagogicalAnalysisFilters,
} from '../models/pedagogical-analysis.model';
import { usePedagogicalAnalysisStore } from '../stores/pedagogical-analysis.store';

const route = useRoute();
const router = useRouter();
const session = sessionStore.state;
const context = activeContextStore.state;
const analysisStore = usePedagogicalAnalysisStore();
const doctrineAccess = useDoctrineAccess();

const anneeScolaireLabelInput = ref('');
const idClassePedagogiqueInput = ref('');
const classeLabelInput = ref('');
const sectionLabelInput = ref('');
const codeColonneInput = ref('TOTAL_GENERAL');
const idEleveInput = ref('');
const eleveLabelInput = ref('');
const idClassesPedagogiquesInput = ref('');
const activeTab = ref('echecs');

const columnOptions = [
  'P1',
  'P2',
  'EX1',
  'TOTAL_S1',
  'P3',
  'P4',
  'EX2',
  'TOTAL_S2',
  'TOTAL_GENERAL',
  'TOTAL_T1',
  'TOTAL_T2',
  'P5',
  'P6',
  'EX3',
  'TOTAL_T3',
];

const tabs = [
  { code: 'echecs', label: 'Echecs' },
  { code: 'echecsProfonds', label: 'Echecs profonds' },
  { code: 'coursProblematiques', label: 'Cours problematiques' },
  { code: 'comparatifClasses', label: 'Comparatif classes' },
  { code: 'perequation', label: 'Perequation' },
  { code: 'repechage', label: 'Repechage' },
  { code: 'deliberation', label: 'Deliberation' },
  { code: 'secondeSession', label: 'Seconde session' },
  { code: 'nonClasses', label: 'Non classes' },
];

const isAuthorized = computed(() => doctrineAccess.canAccessPage('PED-008'));
const center = computed(() => analysisStore.state.center);
const technicalErrorMessage = computed(() =>
  analysisStore.state.errorMessage
  ?? 'Le backend n a pas pu restituer les analyses pedagogiques attendues.',
);
const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
  if (analysisStore.state.status === 'loading') {
    return 'loading';
  }

  if (analysisStore.state.status === 'error') {
    return 'technical-error';
  }

  return 'idle';
});
const missingFields = computed(() => {
  const manquants: string[] = [];

  if (!context.schoolYearId.trim()) {
    manquants.push('annee');
  }
  if (!idClassePedagogiqueInput.value.trim()) {
    manquants.push('classe');
  }
  if (!codeColonneInput.value.trim()) {
    manquants.push('colonne');
  }

  return manquants;
});
const canLoad = computed(() => missingFields.value.length === 0);
const missingFieldsLabel = computed(() =>
  canLoad.value ? 'Toutes les donnees minimales sont presentes.' : `Manque: ${missingFields.value.join(', ')}`,
);

const fallbackScopeLabel = computed(() => {
  const classe = classeLabelInput.value.trim() || 'Classe cible';
  const section = sectionLabelInput.value.trim() || context.sectionName;
  const annee = anneeScolaireLabelInput.value.trim() || context.schoolYearLabel;
  return `${classe} | ${section} | ${annee}`;
});

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'TITULAIRE':
      return 'Lecture bornee a la classe titulaire et a la bonne annee scolaire.';
    case 'PREFET_ETUDES':
    case 'DIRECTEUR_ETUDES':
      return 'Lecture bornee a la section secondaire autorisee dans l ecole active.';
    default:
      return `Session visible ${session.actorLabel}. Aucun perimetre analytique officiel n est ouvert pour cet acteur.`;
  }
});

const activeTabLabel = computed(() =>
  tabs.find((tab) => tab.code === activeTab.value)?.label ?? 'Analyse',
);

const activeTabDescription = computed(() => {
  switch (activeTab.value) {
    case 'coursProblematiques':
      return 'Lecture des cours qui concentrent des echecs ou des echecs profonds.';
    case 'comparatifClasses':
      return 'Lecture comparative des classes de reference sur la colonne active.';
    case 'perequation':
      return 'Lecture des eligibilites a la perequation, secondaire uniquement.';
    case 'repechage':
      return 'Lecture des dossiers eligibles au repechage, sans moteur de decision final frontend.';
    case 'deliberation':
      return 'Lecture des dossiers de deliberation exposes par le backend.';
    case 'secondeSession':
      return 'Lecture analytique des dossiers de seconde session.';
    case 'nonClasses':
      return 'Lecture des eleves exclus du classement avec motifs exposes.';
    default:
      return 'Lecture tabulaire directe des projections backend du centre d analyse.';
  }
});

const activeRows = computed<Record<string, string>[]>(() => {
  if (!center.value) {
    return [];
  }

  switch (activeTab.value) {
    case 'echecs':
      return center.value.echecs.map((item) => ({
        Eleve: item.nomComplet,
        Sexe: item.sexe ?? '-',
        Colonne: item.codeColonne,
        Pourcentage: item.pourcentage?.toString() ?? '-',
        Rang: item.rang?.toString() ?? '-',
        Echecs: item.nombreEchecs.toString(),
        'Echecs profonds': item.nombreEchecsProfonds.toString(),
        Perequation: item.eligiblePerequation ? 'Oui' : 'Non',
        Repechage: item.eligibleRepechage ? 'Oui' : 'Non',
      }));
    case 'echecsProfonds':
      return center.value.echecsProfonds.map((item) => ({
        Eleve: item.nomComplet,
        Sexe: item.sexe ?? '-',
        Colonne: item.codeColonne,
        Pourcentage: item.pourcentage?.toString() ?? '-',
        Rang: item.rang?.toString() ?? '-',
        'Echecs profonds': item.nombreEchecsProfonds.toString(),
        Perequation: item.eligiblePerequation ? 'Oui' : 'Non',
        Repechage: item.eligibleRepechage ? 'Oui' : 'Non',
      }));
    case 'coursProblematiques':
      return center.value.coursProblematiques.map((item) => ({
        'Cours reference': item.idReferentielCours,
        Colonne: item.codeColonne,
        'Effectif echecs': item.effectifEchecs.toString(),
        'Effectif echecs profonds': item.effectifEchecsProfonds.toString(),
        'Moyenne %': item.moyennePourcentage.toString(),
        'Eleves concernes': item.idsElevesConcernes.join(', '),
      }));
    case 'comparatifClasses':
      return center.value.comparatifClasses.map((item) => ({
        Classe: item.libelleClasse,
        Colonne: item.codeColonne,
        Participants: item.participantsTotal.toString(),
        Classes: item.classesTotal.toString(),
        'Non classes': item.nonClassesTotal.toString(),
        Abandons: item.abandonsTotal.toString(),
        'Taux reussite': `${item.tauxReussite} %`,
        'Taux echec': `${item.tauxEchec} %`,
      }));
    case 'perequation':
      return center.value.perequation.map((item) => ({
        Eleve: item.nomComplet,
        Sexe: item.sexe ?? '-',
        Colonne: item.codeColonne,
        Pourcentage: item.pourcentage?.toString() ?? '-',
        Rang: item.rang?.toString() ?? '-',
        Echecs: item.nombreEchecs.toString(),
        'Echecs legers': item.nombreEchecsLegers.toString(),
        'Echecs profonds': item.nombreEchecsProfonds.toString(),
      }));
    case 'repechage':
      return center.value.repechage.map((item) => dossierRow(item));
    case 'deliberation':
      return center.value.deliberation.map((item) => dossierRow(item));
    case 'secondeSession':
      return center.value.secondeSession.map((item) => dossierRow(item));
    case 'nonClasses':
      return center.value.nonClasses.map((item) => ({
        Eleve: item.nomComplet,
        Sexe: item.sexe,
        Motifs: item.motifs.join(', '),
        'Cours manquants': item.coursManquants.join(', ') || '-',
        'Colonnes manquantes': item.colonnesManquantes.join(', ') || '-',
      }));
    default:
      return [];
  }
});

const activeHeaders = computed(() => Object.keys(activeRows.value[0] ?? {}));

function tabCount(code: string): number {
  if (!center.value) {
    return 0;
  }

  switch (code) {
    case 'echecs':
      return center.value.echecs.length;
    case 'echecsProfonds':
      return center.value.echecsProfonds.length;
    case 'coursProblematiques':
      return center.value.coursProblematiques.length;
    case 'comparatifClasses':
      return center.value.comparatifClasses.length;
    case 'perequation':
      return center.value.perequation.length;
    case 'repechage':
      return center.value.repechage.length;
    case 'deliberation':
      return center.value.deliberation.length;
    case 'secondeSession':
      return center.value.secondeSession.length;
    case 'nonClasses':
      return center.value.nonClasses.length;
    default:
      return 0;
  }
}

function dossierRow(item: {
  nomComplet: string;
  sexe?: string;
  codeColonne: string;
  pourcentage?: number;
  rang?: number;
  nombreEchecs: number;
  nombreEchecsLegers: number;
  nombreEchecsProfonds: number;
  eligiblePerequation: boolean;
  eligibleRepechage: boolean;
  commentaireTechnique?: string;
}): Record<string, string> {
  return {
    Eleve: item.nomComplet,
    Sexe: item.sexe ?? '-',
    Colonne: item.codeColonne,
    Pourcentage: item.pourcentage?.toString() ?? '-',
    Rang: item.rang?.toString() ?? '-',
    Echecs: item.nombreEchecs.toString(),
    'Echecs legers': item.nombreEchecsLegers.toString(),
    'Echecs profonds': item.nombreEchecsProfonds.toString(),
    Perequation: item.eligiblePerequation ? 'Oui' : 'Non',
    Repechage: item.eligibleRepechage ? 'Oui' : 'Non',
    Commentaire: item.commentaireTechnique ?? '-',
  };
}

function lireQueryString(name: string): string {
  const value = route.query[name];
  return typeof value === 'string' ? value : '';
}

function synchroniserDepuisRoute(): void {
  anneeScolaireLabelInput.value = lireQueryString('anneeScolaire') || context.schoolYearLabel;
  idClassePedagogiqueInput.value = lireQueryString('idClassePedagogique');
  classeLabelInput.value = lireQueryString('classe');
  sectionLabelInput.value = lireQueryString('section') || context.sectionName;
  codeColonneInput.value = lireQueryString('codeColonne') || 'TOTAL_GENERAL';
  idEleveInput.value = lireQueryString('idEleve');
  eleveLabelInput.value = lireQueryString('eleve');
  idClassesPedagogiquesInput.value = lireQueryString('idClassesPedagogiques');
  activeTab.value = lireQueryString('onglet') || 'echecs';
}

function reinitialiserFiltres(): void {
  anneeScolaireLabelInput.value = context.schoolYearLabel;
  idClassePedagogiqueInput.value = '';
  classeLabelInput.value = '';
  sectionLabelInput.value = context.sectionName;
  codeColonneInput.value = 'TOTAL_GENERAL';
  idEleveInput.value = '';
  eleveLabelInput.value = '';
  idClassesPedagogiquesInput.value = '';
  activeTab.value = 'echecs';
  analysisStore.reinitialiser();
}

function construireFiltres(): PedagogicalAnalysisFilters {
  return {
    idAnneeScolaire: context.schoolYearId.trim(),
    idClassePedagogique: idClassePedagogiqueInput.value.trim(),
    codeColonne: codeColonneInput.value.trim(),
    idEleve: idEleveInput.value.trim() || undefined,
    idClassesPedagogiques: idClassesPedagogiquesInput.value.trim() || undefined,
    anneeScolaireLabel: anneeScolaireLabelInput.value.trim() || undefined,
    classeLabel: classeLabelInput.value.trim() || undefined,
    sectionLabel: sectionLabelInput.value.trim() || undefined,
    eleveLabel: eleveLabelInput.value.trim() || undefined,
  };
}

async function chargerCentre(): Promise<void> {
  if (!isAuthorized.value) {
    analysisStore.reinitialiser();
    return;
  }

  const filtres = construireFiltres();

  if (
    filtres.idAnneeScolaire.length === 0
    || filtres.idClassePedagogique.length === 0
    || filtres.codeColonne.length === 0
  ) {
    analysisStore.reinitialiser();
    return;
  }

  await router.replace({
    query: {
      ...route.query,
      idAnneeScolaire: filtres.idAnneeScolaire,
      anneeScolaire: filtres.anneeScolaireLabel,
      idClassePedagogique: filtres.idClassePedagogique,
      classe: filtres.classeLabel,
      section: filtres.sectionLabel,
      codeColonne: filtres.codeColonne,
      idEleve: filtres.idEleve,
      eleve: filtres.eleveLabel,
      idClassesPedagogiques: filtres.idClassesPedagogiques,
      onglet: activeTab.value,
    },
  });

  await analysisStore.charger(filtres);
}

function exporterVueActive(): void {
  if (activeRows.value.length === 0) {
    return;
  }

  const headers = activeHeaders.value;
  const csv = [headers, ...activeRows.value.map((row) => headers.map((header) => row[header] ?? ''))]
    .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `analyse-pedagogique-${activeTab.value}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function construireHtmlImprimable(): string {
  const headers = activeHeaders.value;
  const rows = activeRows.value
    .map((row) => `<tr>${headers.map((header) => `<td>${row[header] ?? '-'}</td>`).join('')}</tr>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Centre d analyse pedagogique</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #11283f; }
          h1, h2, p { margin: 0 0 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #c4d1df; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #edf3f8; }
        </style>
      </head>
      <body>
        <h1>Centre d analyse pedagogique</h1>
        <p>${center.value?.scopeLabel ?? fallbackScopeLabel.value}</p>
        <p>Onglet actif : ${activeTabLabel.value}</p>
        <table>
          <thead>
            <tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;
}

function ouvrirVersionPdf(): void {
  const html = construireHtmlImprimable();
  const popup = window.open('', '_blank', 'noopener,noreferrer,width=1280,height=900');

  if (!popup) {
    return;
  }

  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  popup.print();
}

function imprimerPage(): void {
  window.print();
}

synchroniserDepuisRoute();

if (context.schoolYearId && idClassePedagogiqueInput.value && isAuthorized.value) {
  void chargerCentre();
}
</script>

<style scoped>
.pedagogique-actions,.pedagogique-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.pedagogique-pill,.pedagogique-primary-action,.pedagogique-secondary-action,.pedagogique-inline-link{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;text-decoration:none;font-weight:600}
.pedagogique-pill--action,.pedagogique-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.pedagogique-primary-action:disabled{opacity:.55;cursor:not-allowed}
.pedagogique-hero{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.pedagogique-hero__lead{display:flex;align-items:center;gap:1rem}
.pedagogique-hero__icon{width:56px;height:56px;border-radius:18px;display:grid;place-items:center;background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff}
.pedagogique-badges{display:flex;flex-wrap:wrap;gap:.75rem;align-items:flex-start}
.pedagogique-callout{display:flex;gap:.75rem;align-items:flex-start;border:1px solid rgba(17,40,63,.08);background:linear-gradient(180deg,rgba(238,246,251,.96),rgba(255,255,255,.98));border-radius:24px;padding:1rem 1.1rem}
.pedagogique-form-stack{display:grid;gap:1rem}
.pedagogique-filter-grid,.pedagogique-kpi-grid,.analysis-kpi-grid,.analysis-student-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem}
.pedagogique-context-card{border-radius:20px;padding:1rem 1.1rem;background:#f4f8fb;border:1px solid rgba(17,40,63,.08);display:grid;gap:.35rem;align-content:start}
.pedagogique-field{display:grid;gap:.45rem}
.pedagogique-field--full{grid-column:1/-1}
.pedagogique-field input,.pedagogique-field select{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.pedagogique-guard-panel{border-radius:22px;border:1px solid rgba(17,40,63,.08);background:#f7fbfd;padding:1rem}
.pedagogique-guard-panel__header{display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem}
.pedagogique-guard-panel ul{margin:0;padding-left:1.1rem;display:grid;gap:.35rem}
.pedagogique-kpi-card,.analysis-kpi-card,.analysis-student-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
.analysis-checklist{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem}
.analysis-check{border-radius:20px;padding:1rem;border:1px solid rgba(17,40,63,.08);display:grid;gap:.35rem;background:#fff}
.analysis-check.is-ready{background:linear-gradient(180deg,rgba(237,248,242,.98),rgba(255,255,255,.98));border-color:rgba(45,125,76,.18)}
.analysis-check.is-missing{background:linear-gradient(180deg,rgba(254,245,239,.98),rgba(255,255,255,.98));border-color:rgba(184,88,37,.15)}
.pedagogique-student-summary{display:grid;gap:1rem}
.pedagogique-label{margin:0 0 .25rem;color:#5d7385;font-size:.82rem;text-transform:uppercase;letter-spacing:.08em}
.pedagogique-tabs{display:flex;flex-wrap:wrap;gap:.75rem}
.pedagogique-tab{border:1px solid rgba(17,40,63,.12);background:#fff;border-radius:18px;padding:.7rem .9rem;display:grid;gap:.2rem;text-align:left}
.pedagogique-tab--active{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.pedagogique-empty-inline{border-radius:20px;background:#f7fbfd;padding:1rem;color:#4d6678}
.pedagogique-table-shell{overflow:auto;border-radius:22px;border:1px solid rgba(17,40,63,.08);background:#fff}
.pedagogique-table{width:100%;border-collapse:collapse;min-width:820px}
.pedagogique-table th,.pedagogique-table td{padding:.9rem 1rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left;vertical-align:top}
.pedagogique-table th{background:#edf4f8;font-size:.85rem;letter-spacing:.03em;text-transform:uppercase}
@media (max-width: 960px){
  .pedagogique-hero{flex-direction:column}
}
</style>
