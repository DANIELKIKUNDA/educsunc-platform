<template>
  <PageContainer>
    <PageHeader
      eyebrow="MP-08"
      title="Detail resultat eleve"
      description="Fiche analytique d un eleve branchee sur ResultatBulletinEleve, ses diagnostics et son evolution reelle."
    >
      <template #actions>
        <div class="pedagogique-actions">
          <RouterLink class="pedagogique-pill" to="/app/pedagogique/resultats/analyses">
            <ArrowLeft />
            <span>Retour analyses</span>
          </RouterLink>
          <button class="pedagogique-pill" type="button" :disabled="!detail" @click="exporterCsv">
            <Sheet />
            <span>Excel</span>
          </button>
          <button class="pedagogique-pill" type="button" :disabled="!detail" @click="ouvrirVersionPdf">
            <FileText />
            <span>PDF</span>
          </button>
          <button class="pedagogique-pill pedagogique-pill--action" type="button" :disabled="!detail" @click="imprimerPage">
            <Printer />
            <span>Impression</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock title="Perimetre pedagogique" description="La fiche lit uniquement le resultat consolide accessible a l acteur courant dans son vrai perimetre.">
      <div class="pedagogique-hero">
        <div class="pedagogique-hero__lead">
          <div class="pedagogique-hero__icon">
            <BadgeCheck />
          </div>
          <div>
            <h3>{{ detail?.eleveLabel ?? (eleveLabelInput || 'Eleve cible') }}</h3>
            <p>{{ detail?.classeLabel ?? (classeLabelInput || 'Classe cible') }} | {{ detail?.anneeScolaireLabel ?? (anneeScolaireLabelInput || context.schoolYearLabel) }}</p>
            <p>{{ actorScopeMessage }}</p>
          </div>
        </div>
        <div class="pedagogique-badges">
          <PermissionTag capability="module.pedagogique.access" label="Module pedagogique" />
          <ContextBadge label="Acteur" :value="session.actorLabel" />
          <ContextBadge label="Section" :value="detail?.sectionLabel ?? (sectionLabelInput || context.sectionName || 'Section active')" />
          <ContextBadge label="Colonne" :value="activeColumnLabel" />
        </div>
      </div>
    </SectionBlock>

    <AccessBoundary capability="module.pedagogique.access">
      <template v-if="uiState === 'loading'">
        <LoadingState
          title="Chargement du detail resultat"
          message="Lecture du resultat consolide, des diagnostics et de l evolution en cours."
        />
      </template>

      <template v-else-if="uiState === 'technical-error'">
        <ErrorState
          title="Detail resultat indisponible"
          :message="technicalErrorMessage"
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Detail resultat non autorise"
          message="Cette fiche est reservee au titulaire, au prefet des etudes et au directeur des etudes dans leur perimetre."
        />

        <template v-else>
          <SectionBlock
            title="Chargement de la fiche"
            description="Le detail eleve reste pilote par l annee scolaire, l eleve cible et la colonne d observation."
          >
            <div class="pedagogique-kpi-grid">
              <div class="pedagogique-kpi-card">
                <small>Acteur</small>
                <strong>{{ session.actorLabel }}</strong>
                <span>{{ detail ? 'Lecture ouverte' : 'Lecture en attente' }}</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Perimetre</small>
                <strong>{{ detail?.sectionLabel ?? (sectionLabelInput || context.sectionName || 'Section active') }}</strong>
                <span>{{ detail?.classeLabel ?? (classeLabelInput || 'Classe non renseignee') }}</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Colonne active</small>
                <strong>{{ activeColumnLabel }}</strong>
                <span>{{ detail?.resumePourcentage ?? 'Aucune lecture courante' }}</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Eligibilite</small>
                <strong>{{ canLoad ? 'Prete' : 'Incomplete' }}</strong>
                <span>Eleve + annee obligatoires</span>
              </div>
            </div>

            <div class="pedagogique-form-stack">
              <div class="pedagogique-filter-grid">
                <label class="pedagogique-field">
                  <span>Annee scolaire</span>
                  <input v-model="anneeScolaireLabelInput" type="text" placeholder="2025-2026" />
                </label>
                <label class="pedagogique-field">
                  <span>Id annee scolaire</span>
                  <input v-model="idAnneeScolaireInput" type="text" placeholder="uuid-annee" />
                </label>
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
                  <span>Eleve</span>
                  <input v-model="eleveLabelInput" type="text" placeholder="Nom complet eleve" />
                </label>
                <label class="pedagogique-field">
                  <span>Id eleve</span>
                  <input v-model="idEleveInput" type="text" placeholder="uuid-eleve" />
                </label>
                <label class="pedagogique-field">
                  <span>Colonne d observation</span>
                  <select v-model="codeColonneInput">
                    <option v-for="column in columnOptions" :key="column" :value="column">
                      {{ column }}
                    </option>
                  </select>
                </label>
              </div>

              <div class="pedagogique-guard-panel">
                <div class="pedagogique-guard-panel__header">
                  <ShieldCheck />
                  <strong>Garde-fous MP-08</strong>
                </div>
                <ul>
                  <li>Le frontend ne recalcule aucun rang ni pourcentage.</li>
                  <li>Les diagnostics viennent directement de `ResultatBulletinEleve`.</li>
                  <li>La meme doctrine permission + perimetre que `MP-07` reste appliquee.</li>
                </ul>
              </div>

              <div class="pedagogique-actions-row">
                <button class="pedagogique-primary-action" type="button" :disabled="!canLoad" @click="chargerDetail">
                  <Search />
                  <span>Charger la fiche</span>
                </button>
                <button class="pedagogique-secondary-action" type="button" @click="synchroniserDepuisRoute">
                  Reprendre la route
                </button>
                <button class="pedagogique-secondary-action" type="button" @click="reinitialiserFiltres">
                  Reinitialiser
                </button>
              </div>
            </div>
          </SectionBlock>

          <EmptyState
            v-if="!detail"
            title="Fiche eleve en attente"
            message="Renseignez l eleve et l annee scolaire pour consulter le detail resultat."
          />

          <template v-else>
            <SectionBlock title="Resume analytique" description="Lecture rapide du resultat global, des diagnostics et de l evolution exposee.">
              <div class="analysis-kpi-grid">
                <div class="analysis-kpi-card">
                  <small>Pourcentage global</small>
                  <strong>{{ detail.resumePourcentage }}</strong>
                  <span>Lecture consolidee</span>
                </div>
                <div class="analysis-kpi-card">
                  <small>Rang</small>
                  <strong>{{ detail.resumeRang }}</strong>
                  <span>Classement officiel</span>
                </div>
                <div class="analysis-kpi-card">
                  <small>Diagnostics</small>
                  <strong>{{ detail.nombreDiagnostics }}</strong>
                  <span>Colonnes avec diagnostic</span>
                </div>
                <div class="analysis-kpi-card">
                  <small>Colonnes resultat</small>
                  <strong>{{ detail.resultColumns.length }}</strong>
                  <span>Vue consolidee</span>
                </div>
                <div class="analysis-kpi-card">
                  <small>Applications / conduite</small>
                  <strong>{{ detail.applications.length }}</strong>
                  <span>Blocs periodises exposes</span>
                </div>
                <div class="analysis-kpi-card">
                  <small>Evolution</small>
                  <strong>{{ detail.evolution.length }}</strong>
                  <span>Observations historisees</span>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock title="Identite et contexte" description="La fiche garde visibles les informations de contexte utilisees pour la lecture.">
              <div class="analysis-student-grid">
                <div class="analysis-student-card">
                  <p class="pedagogique-label">Eleve</p>
                  <strong>{{ detail.eleveLabel }}</strong>
                  <span>{{ detail.eleveId }}</span>
                </div>
                <div class="analysis-student-card">
                  <p class="pedagogique-label">Classe</p>
                  <strong>{{ detail.classeLabel }}</strong>
                  <span>{{ detail.classeId }}</span>
                </div>
                <div class="analysis-student-card">
                  <p class="pedagogique-label">Section</p>
                  <strong>{{ detail.sectionLabel }}</strong>
                  <span>{{ detail.anneeScolaireLabel }}</span>
                </div>
                <div class="analysis-student-card">
                  <p class="pedagogique-label">Observation active</p>
                  <strong>{{ activeColumnLabel }}</strong>
                  <span>{{ actorScopeMessage }}</span>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Colonnes de resultat"
              description="Tableau principal des colonnes consolidees exposees par ResultatBulletinEleve."
            >
              <div class="pedagogique-table-shell">
                <table class="pedagogique-table">
                  <thead>
                    <tr>
                      <th>Colonne</th>
                      <th>Total obtenu</th>
                      <th>Maximum</th>
                      <th>Pourcentage</th>
                      <th>Rang</th>
                      <th>Classable</th>
                      <th>Non classe</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="column in detail.resultColumns" :key="column.code">
                      <td>
                        <strong>{{ column.label }}</strong>
                        <div class="pedagogique-muted">{{ column.code }}</div>
                      </td>
                      <td>{{ column.totalObtenu }}</td>
                      <td>{{ column.maximumGeneral }}</td>
                      <td>{{ column.pourcentage }}</td>
                      <td>{{ column.rang }}</td>
                      <td>
                        <span :class="column.estClassable ? 'status-chip status-chip--ok' : 'status-chip status-chip--neutral'">
                          {{ column.estClassable ? 'Oui' : 'Non' }}
                        </span>
                      </td>
                      <td>
                        <span :class="column.estNonClasse ? 'status-chip status-chip--warn' : 'status-chip status-chip--ok'">
                          {{ column.estNonClasse ? 'Oui' : 'Non' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Diagnostics"
              description="Lecture directe des diagnostics exposes, sans commentaire invente par le frontend."
            >
              <div v-if="detail.diagnostics.length === 0" class="pedagogique-empty-inline">
                Aucun diagnostic expose pour cette fiche.
              </div>
              <div v-else class="pedagogique-table-shell">
                <table class="pedagogique-table">
                  <thead>
                    <tr>
                      <th>Colonne</th>
                      <th>Echecs</th>
                      <th>Echecs legers</th>
                      <th>Echecs profonds</th>
                      <th>Perequation</th>
                      <th>Repechage</th>
                      <th>Commentaire technique</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="diagnostic in detail.diagnostics" :key="diagnostic.code">
                      <td>{{ diagnostic.label }}</td>
                      <td>{{ diagnostic.nombreEchecs }}</td>
                      <td>{{ diagnostic.nombreEchecsLegers }}</td>
                      <td>{{ diagnostic.nombreEchecsProfonds }}</td>
                      <td>{{ diagnostic.eligiblePerequation ? 'Oui' : 'Non' }}</td>
                      <td>{{ diagnostic.eligibleRepechage ? 'Oui' : 'Non' }}</td>
                      <td>{{ diagnostic.commentaireTechnique }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Application et conduite"
              description="Lecture periodisee de l application et de la conduite lorsqu elles sont exposees."
            >
              <div v-if="detail.applications.length === 0" class="pedagogique-empty-inline">
                Aucun bloc application / conduite n est expose pour cette fiche.
              </div>
              <div v-else class="pedagogique-table-shell">
                <table class="pedagogique-table">
                  <thead>
                    <tr>
                      <th>Periode</th>
                      <th>Application</th>
                      <th>Conduite</th>
                      <th>Points conduite</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="application in detail.applications" :key="application.codePeriode">
                      <td>{{ application.codePeriode }}</td>
                      <td>{{ application.application }}</td>
                      <td>{{ application.conduite }}</td>
                      <td>{{ application.pointsConduite }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Evolution du resultat"
              description="Historique d observation backend pour la colonne ciblee."
            >
              <div v-if="detail.evolution.length === 0" class="pedagogique-empty-inline">
                Aucune evolution n est exposee pour cette combinaison eleve / colonne.
              </div>
              <div v-else class="pedagogique-table-shell">
                <table class="pedagogique-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Colonne</th>
                      <th>Total</th>
                      <th>Maximum</th>
                      <th>Pourcentage</th>
                      <th>Rang</th>
                      <th>Etat courant</th>
                      <th>Motif</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="entry in detail.evolution" :key="`${entry.dateObservation}-${entry.motifObservation}`">
                      <td>{{ formatDate(entry.dateObservation) }}</td>
                      <td>{{ entry.codeColonne }}</td>
                      <td>{{ entry.totalObtenu ?? '-' }}</td>
                      <td>{{ entry.maximumGeneral ?? '-' }}</td>
                      <td>{{ entry.pourcentage ?? '-' }}</td>
                      <td>{{ entry.rang ?? '-' }}</td>
                      <td>
                        <span :class="entry.estEtatCourant ? 'status-chip status-chip--ok' : 'status-chip status-chip--neutral'">
                          {{ entry.estEtatCourant ? 'Oui' : 'Non' }}
                        </span>
                      </td>
                      <td>{{ entry.motifObservation }}</td>
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
  BadgeCheck,
  FileText,
  Printer,
  Search,
  Sheet,
  ShieldCheck,
} from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { sessionStore } from '../../../shared/auth/session.store';
import {
  authorizedPedagogicalAnalysisActors,
  type PedagogicalAnalysisFilters,
} from '../models/pedagogical-analysis.model';
import { useStudentResultDetailStore } from '../stores/student-result-detail.store';

const route = useRoute();
const router = useRouter();
const context = activeContextStore.state;
const session = sessionStore.state;
const detailStore = useStudentResultDetailStore();

const idAnneeScolaireInput = ref('');
const anneeScolaireLabelInput = ref('');
const idClassePedagogiqueInput = ref('');
const classeLabelInput = ref('');
const sectionLabelInput = ref('');
const idEleveInput = ref('');
const eleveLabelInput = ref('');
const codeColonneInput = ref('TOTAL_GENERAL');

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

const columnLabels: Record<string, string> = {
  P1: 'Periode 1',
  P2: 'Periode 2',
  EX1: 'Examen 1',
  TOTAL_S1: 'Total semestre 1',
  P3: 'Periode 3',
  P4: 'Periode 4',
  EX2: 'Examen 2',
  TOTAL_S2: 'Total semestre 2',
  TOTAL_GENERAL: 'Total general',
  TOTAL_T1: 'Total trimestre 1',
  TOTAL_T2: 'Total trimestre 2',
  P5: 'Periode 5',
  P6: 'Periode 6',
  EX3: 'Examen 3',
  TOTAL_T3: 'Total trimestre 3',
};

const isAuthorized = computed(() =>
  authorizedPedagogicalAnalysisActors.includes(session.actorCode as never),
);
const detail = computed(() => detailStore.state.detail);
const canLoad = computed(() =>
  idAnneeScolaireInput.value.trim().length > 0 && idEleveInput.value.trim().length > 0,
);
const activeColumnLabel = computed(() => columnLabels[codeColonneInput.value] ?? codeColonneInput.value);
const actorScopeMessage = computed(() => {
  if (detail.value) {
    return `Lecture analytiquement bornee a ${detail.value.classeLabel} / ${detail.value.sectionLabel}.`;
  }

  switch (session.actorCode) {
    case 'TITULAIRE':
      return 'Lecture analytiquement bornee a la classe titulaire et a l annee scolaire active.';
    case 'PREFET_ETUDES':
    case 'DIRECTEUR_ETUDES':
      return 'Lecture analytiquement bornee a la section secondaire autorisee de l ecole active.';
    default:
      return 'Aucun perimetre pedagogique officiel n est ouvert pour cet acteur.';
  }
});
const technicalErrorMessage = computed(() =>
  detailStore.state.errorMessage
  ?? 'Le backend n a pas pu restituer le detail resultat eleve.',
);
const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
  if (detailStore.state.status === 'loading') {
    return 'loading';
  }

  if (detailStore.state.status === 'error') {
    return 'technical-error';
  }

  return 'idle';
});

function lireQueryString(name: string): string {
  const value = route.query[name];
  return typeof value === 'string' ? value : '';
}

function synchroniserDepuisRoute(): void {
  idAnneeScolaireInput.value = lireQueryString('idAnneeScolaire');
  anneeScolaireLabelInput.value = lireQueryString('anneeScolaire') || context.schoolYearLabel;
  idClassePedagogiqueInput.value = lireQueryString('idClassePedagogique');
  classeLabelInput.value = lireQueryString('classe');
  sectionLabelInput.value = lireQueryString('section') || context.sectionName;
  idEleveInput.value = lireQueryString('idEleve');
  eleveLabelInput.value = lireQueryString('eleve');
  codeColonneInput.value = lireQueryString('codeColonne') || 'TOTAL_GENERAL';
}

function reinitialiserFiltres(): void {
  idAnneeScolaireInput.value = '';
  anneeScolaireLabelInput.value = context.schoolYearLabel;
  idClassePedagogiqueInput.value = '';
  classeLabelInput.value = '';
  sectionLabelInput.value = context.sectionName;
  idEleveInput.value = '';
  eleveLabelInput.value = '';
  codeColonneInput.value = 'TOTAL_GENERAL';
  detailStore.reinitialiser();
  void router.replace({ query: {} });
}

function construireFiltres(): PedagogicalAnalysisFilters {
  return {
    idAnneeScolaire: idAnneeScolaireInput.value.trim(),
    idClassePedagogique: idClassePedagogiqueInput.value.trim(),
    codeColonne: codeColonneInput.value.trim(),
    idEleve: idEleveInput.value.trim() || undefined,
    anneeScolaireLabel: anneeScolaireLabelInput.value.trim() || undefined,
    classeLabel: classeLabelInput.value.trim() || undefined,
    sectionLabel: sectionLabelInput.value.trim() || undefined,
    eleveLabel: eleveLabelInput.value.trim() || undefined,
  };
}

async function chargerDetail(): Promise<void> {
  if (!isAuthorized.value) {
    detailStore.reinitialiser();
    return;
  }

  const filtres = construireFiltres();

  if (
    filtres.idAnneeScolaire.length === 0
    || !filtres.idEleve
    || filtres.idEleve.length === 0
  ) {
    detailStore.reinitialiser();
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
      idEleve: filtres.idEleve,
      eleve: filtres.eleveLabel,
      codeColonne: filtres.codeColonne,
    },
  });

  await detailStore.charger(filtres);
}

function exporterCsv(): void {
  if (!detail.value) {
    return;
  }

  const headers = ['Colonne', 'Total obtenu', 'Maximum', 'Pourcentage', 'Rang', 'Classable', 'Non classe'];
  const lines = detail.value.resultColumns.map((column) => [
    column.label,
    column.totalObtenu,
    column.maximumGeneral,
    column.pourcentage,
    column.rang,
    column.estClassable ? 'Oui' : 'Non',
    column.estNonClasse ? 'Oui' : 'Non',
  ]);

  const csv = [headers, ...lines]
    .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `detail-resultat-${detail.value.eleveId}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function construireHtmlImprimable(): string {
  if (!detail.value) {
    return '';
  }

  const rows = detail.value.resultColumns
    .map((column) => `
      <tr>
        <td>${column.label}</td>
        <td>${column.totalObtenu}</td>
        <td>${column.maximumGeneral}</td>
        <td>${column.pourcentage}</td>
        <td>${column.rang}</td>
        <td>${column.estClassable ? 'Oui' : 'Non'}</td>
        <td>${column.estNonClasse ? 'Oui' : 'Non'}</td>
      </tr>
    `)
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Detail resultat eleve</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #11283f; }
          h1, p { margin: 0 0 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th, td { border: 1px solid #c4d1df; padding: 8px; text-align: left; }
          th { background: #edf4f8; }
        </style>
      </head>
      <body>
        <h1>Detail resultat eleve</h1>
        <p>${detail.value.eleveLabel}</p>
        <p>${detail.value.classeLabel} | ${detail.value.anneeScolaireLabel}</p>
        <table>
          <thead>
            <tr>
              <th>Colonne</th>
              <th>Total obtenu</th>
              <th>Maximum</th>
              <th>Pourcentage</th>
              <th>Rang</th>
              <th>Classable</th>
              <th>Non classe</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;
}

function ouvrirVersionPdf(): void {
  const html = construireHtmlImprimable();

  if (html.length === 0) {
    return;
  }

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

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('fr-FR');
}

synchroniserDepuisRoute();

if (idAnneeScolaireInput.value && idEleveInput.value && isAuthorized.value) {
  void chargerDetail();
}
</script>

<style scoped>
.pedagogique-actions,.pedagogique-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.pedagogique-pill,.pedagogique-primary-action,.pedagogique-secondary-action{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;text-decoration:none;font-weight:600}
.pedagogique-pill--action,.pedagogique-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.pedagogique-primary-action:disabled{opacity:.55;cursor:not-allowed}
.pedagogique-hero{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.pedagogique-hero__lead{display:flex;align-items:center;gap:1rem}
.pedagogique-hero__icon{width:56px;height:56px;border-radius:18px;display:grid;place-items:center;background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff}
.pedagogique-badges{display:flex;flex-wrap:wrap;gap:.75rem;align-items:flex-start}
.pedagogique-form-stack{display:grid;gap:1rem}
.pedagogique-filter-grid,.pedagogique-kpi-grid,.analysis-kpi-grid,.analysis-student-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem}
.pedagogique-field{display:grid;gap:.45rem}
.pedagogique-field input,.pedagogique-field select{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.pedagogique-guard-panel{border-radius:22px;border:1px solid rgba(17,40,63,.08);background:#f7fbfd;padding:1rem}
.pedagogique-guard-panel__header{display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem}
.pedagogique-guard-panel ul{margin:0;padding-left:1.1rem;display:grid;gap:.35rem}
.pedagogique-kpi-card,.analysis-kpi-card,.analysis-student-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
.pedagogique-label{margin:0 0 .25rem;color:#5d7385;font-size:.82rem;text-transform:uppercase;letter-spacing:.08em}
.pedagogique-muted{color:#5d7385;font-size:.82rem}
.pedagogique-empty-inline{border-radius:20px;background:#f7fbfd;padding:1rem;color:#4d6678}
.pedagogique-table-shell{overflow:auto;border-radius:22px;border:1px solid rgba(17,40,63,.08);background:#fff}
.pedagogique-table{width:100%;border-collapse:collapse;min-width:820px}
.pedagogique-table th,.pedagogique-table td{padding:.9rem 1rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left;vertical-align:top}
.pedagogique-table th{background:#edf4f8;font-size:.85rem;letter-spacing:.03em;text-transform:uppercase}
.status-chip{display:inline-flex;align-items:center;border-radius:999px;padding:.2rem .65rem;font-size:.82rem;font-weight:600}
.status-chip--ok{background:#e7f6ee;color:#166534}
.status-chip--warn{background:#fff3df;color:#9a6700}
.status-chip--neutral{background:#edf4f8;color:#365066}
@media (max-width: 900px){
  .pedagogique-hero{flex-direction:column}
  .pedagogique-hero__lead{align-items:flex-start}
}
</style>
