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
import { RouterLink } from 'vue-router';
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
import { usePedagogicalAnalysisCenterViewModel } from '../viewmodels/usePedagogicalAnalysisCenterViewModel';

const {
  session,
  context,
  analysisStore,
  anneeScolaireLabelInput,
  idClassePedagogiqueInput,
  classeLabelInput,
  sectionLabelInput,
  codeColonneInput,
  idEleveInput,
  eleveLabelInput,
  idClassesPedagogiquesInput,
  activeTab,
  columnOptions,
  tabs,
  isAuthorized,
  center,
  technicalErrorMessage,
  uiState,
  missingFields,
  canLoad,
  missingFieldsLabel,
  fallbackScopeLabel,
  perimeterMessage,
  activeTabLabel,
  activeTabDescription,
  activeRows,
  activeHeaders,
  tabCount,
  synchroniserDepuisRoute,
  reinitialiserFiltres,
  chargerCentre,
  exporterVueActive,
  ouvrirVersionPdf,
  imprimerPage,
} = usePedagogicalAnalysisCenterViewModel();
</script>

<style src="./CentreAnalysePedagogiqueView.css" scoped></style>
