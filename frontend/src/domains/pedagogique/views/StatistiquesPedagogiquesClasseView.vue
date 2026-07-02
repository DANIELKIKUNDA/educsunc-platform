<template>
  <PageContainer>
    <PageHeader
      eyebrow="MP-04"
      title="Statistiques pedagogiques de classe"
      description="Vue analytique dense des statistiques de proclamation d une classe, sans dashboard decoratif."
    >
      <template #actions>
        <div class="pedagogique-actions">
          <RouterLink class="pedagogique-pill" to="/app/pedagogique">
            <ArrowLeft />
            <span>Retour pedagogique</span>
          </RouterLink>
          <button class="pedagogique-pill" type="button" :disabled="!statistics" @click="exporterCsv">
            <Sheet />
            <span>Excel</span>
          </button>
          <button class="pedagogique-pill" type="button" :disabled="!statistics" @click="ouvrirVersionPdf">
            <FileText />
            <span>PDF</span>
          </button>
          <button class="pedagogique-pill pedagogique-pill--action" type="button" :disabled="!statistics" @click="imprimerPage">
            <Printer />
            <span>Impression</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock title="Perimetre pedagogique" description="Lecture de classe strictement bornee au bon acteur et a la bonne colonne.">
      <div class="pedagogique-callout">
        <ShieldCheck />
        <p>{{ statistics?.actorScopeMessage ?? perimeterMessage }}</p>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="PED-STAT-001">
      <template v-if="uiState === 'loading'">
        <LoadingState title="Chargement des statistiques" message="Lecture des indicateurs de classe en cours." />
      </template>

      <template v-else-if="uiState === 'technical-error'">
        <ErrorState title="Statistiques indisponibles" :message="technicalErrorMessage" />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Statistiques non autorisees"
          message="Cette vue reste reservee au titulaire et aux acteurs sectionnels autorises."
        />

        <template v-else>
          <div class="statistics-kpi-grid">
            <div class="statistics-kpi-card">
              <small>Acteur</small>
              <strong>{{ session.actorCode }}</strong>
              <span>{{ perimeterMessage }}</span>
            </div>
            <div class="statistics-kpi-card">
              <small>Perimetre</small>
              <strong>{{ scopeLabel }}</strong>
              <span>Classe, section et annee de lecture</span>
            </div>
            <div class="statistics-kpi-card">
              <small>Precontrole</small>
              <strong>{{ canLoad ? 'Pret' : 'Incomplet' }}</strong>
              <span>{{ missingFieldsLabel }}</span>
            </div>
          </div>

          <SectionBlock title="Filtres" description="Le backend calcule; le frontend cadre la bonne classe et la bonne colonne.">
            <div class="pedagogique-form-grid">
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
                <span>Colonne d analyse</span>
                <select v-model="codeColonneInput">
                  <option v-for="column in columnOptions" :key="column" :value="column">
                    {{ column }}
                  </option>
                </select>
              </label>
            </div>

            <div class="statistics-checklist">
              <div :class="['statistics-check', idAnneeScolaireInput.trim() ? 'is-ready' : 'is-missing']">
                <strong>Annee scolaire</strong>
                <span>{{ idAnneeScolaireInput.trim() ? 'Renseignee' : 'Manquante' }}</span>
              </div>
              <div :class="['statistics-check', idClassePedagogiqueInput.trim() ? 'is-ready' : 'is-missing']">
                <strong>Classe</strong>
                <span>{{ idClassePedagogiqueInput.trim() ? 'Renseignee' : 'Manquante' }}</span>
              </div>
              <div :class="['statistics-check', codeColonneInput.trim() ? 'is-ready' : 'is-missing']">
                <strong>Colonne</strong>
                <span>{{ codeColonneInput.trim() || 'Manquante' }}</span>
              </div>
            </div>

            <div class="pedagogique-actions-row">
              <button class="pedagogique-primary-action" type="button" :disabled="!canLoad" @click="chargerStatistiques">
                <Search />
                <span>Charger les statistiques</span>
              </button>
              <button class="pedagogique-secondary-action" type="button" @click="synchroniserDepuisRoute">
                Reprendre la route
              </button>
            </div>
          </SectionBlock>

          <EmptyState
            v-if="!statistics"
            title="Statistiques en attente"
            message="Renseignez une classe, une annee et une colonne reelle pour ouvrir la lecture analytique."
          />

          <template v-else>
            <div class="pedagogique-kpi-grid">
              <div class="pedagogique-kpi-card">
                <small>Portee</small>
                <strong>{{ statistics.scopeLabel }}</strong>
                <span>{{ statistics.activeColumnLabel }}</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Taux participation</small>
                <strong>{{ statistics.tauxParticipation }}</strong>
                <span>Lecture backend</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Taux reussite</small>
                <strong>{{ statistics.tauxReussite }}</strong>
                <span>Lecture backend</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Taux echec</small>
                <strong>{{ statistics.tauxEchec }}</strong>
                <span>Lecture backend</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Taux abandon</small>
                <strong>{{ statistics.tauxAbandon }}</strong>
                <span>Lecture backend</span>
              </div>
            </div>

            <SectionBlock title="Tableau analytique principal" description="Une ligne par mesure, avec detail garcons / filles / total.">
              <div class="pedagogique-table-shell">
                <table class="pedagogique-table">
                  <thead>
                    <tr>
                      <th>Mesure</th>
                      <th>Garcons</th>
                      <th>Filles</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="metric in statistics.metrics" :key="metric.code">
                      <td>{{ metric.label }}</td>
                      <td>{{ metric.garcons }}</td>
                      <td>{{ metric.filles }}</td>
                      <td>{{ metric.total }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionBlock>

            <SectionBlock title="Lecture secondaire" description="Les KPI n ajoutent aucun calcul parallele. Ils recadrent seulement la lecture de la classe active.">
              <div class="statistics-secondary-grid">
                <div class="statistics-secondary-card">
                  <small>Export</small>
                  <strong>Excel / PDF / impression</strong>
                  <span>Sorties construites a partir du meme tableau backend.</span>
                </div>
                <div class="statistics-secondary-card">
                  <small>Colonne active</small>
                  <strong>{{ statistics.activeColumnLabel }}</strong>
                  <span>Changement de colonne sans changer le moteur metier.</span>
                </div>
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
import { ArrowLeft, FileText, Printer, Search, Sheet, ShieldCheck } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { type ClassStatisticsFilters } from '../models/class-statistics.model';
import { useClassStatisticsStore } from '../stores/class-statistics.store';

const route = useRoute();
const router = useRouter();
const session = sessionStore.state;
const context = activeContextStore.state;
const statisticsStore = useClassStatisticsStore();
const doctrineAccess = useDoctrineAccess();

const idAnneeScolaireInput = ref('');
const anneeScolaireLabelInput = ref('');
const idClassePedagogiqueInput = ref('');
const classeLabelInput = ref('');
const sectionLabelInput = ref('');
const codeColonneInput = ref('TOTAL_GENERAL');

const columnOptions = ['P1', 'P2', 'EX1', 'TOTAL_S1', 'P3', 'P4', 'EX2', 'TOTAL_S2', 'TOTAL_GENERAL', 'TOTAL_T1', 'TOTAL_T2', 'P5', 'P6', 'EX3', 'TOTAL_T3'];

const isAuthorized = computed(() => doctrineAccess.canAccessPage('PED-STAT-001'));
const statistics = computed(() => statisticsStore.state.statistics);
const technicalErrorMessage = computed(() =>
  statisticsStore.state.errorMessage ?? 'Le backend n a pas pu restituer les statistiques attendues.',
);
const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
  if (statisticsStore.state.status === 'loading') {
    return 'loading';
  }
  if (statisticsStore.state.status === 'error') {
    return 'technical-error';
  }
  return 'idle';
});
const missingFields = computed(() => {
  const manquants: string[] = [];

  if (!idAnneeScolaireInput.value.trim()) {
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
const scopeLabel = computed(() =>
  [anneeScolaireLabelInput.value.trim(), classeLabelInput.value.trim(), sectionLabelInput.value.trim(), codeColonneInput.value.trim()].filter(Boolean).join(' / ')
  || [idAnneeScolaireInput.value.trim(), idClassePedagogiqueInput.value.trim()].filter(Boolean).join(' / ')
  || 'Perimetre a renseigner',
);

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'TITULAIRE':
      return 'Lecture bornee a la classe titulaire et a la bonne annee scolaire.';
    case 'PREFET_ETUDES':
    case 'DIRECTEUR_ETUDES':
    case 'DIRECTEUR_DISCIPLINE':
      return 'Lecture bornee aux classes de la section autorisee.';
    default:
      return `Session visible ${session.actorLabel}. Aucun perimetre statistique officiel n est ouvert pour cet acteur.`;
  }
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
  codeColonneInput.value = lireQueryString('codeColonne') || 'TOTAL_GENERAL';
}

function buildFilters(): ClassStatisticsFilters {
  return {
    idAnneeScolaire: idAnneeScolaireInput.value.trim(),
    idClassePedagogique: idClassePedagogiqueInput.value.trim(),
    codeColonne: codeColonneInput.value.trim(),
    anneeScolaireLabel: anneeScolaireLabelInput.value.trim() || undefined,
    classeLabel: classeLabelInput.value.trim() || undefined,
    sectionLabel: sectionLabelInput.value.trim() || undefined,
  };
}

async function chargerStatistiques(): Promise<void> {
  if (!isAuthorized.value) {
    statisticsStore.reinitialiser();
    return;
  }

  const filters = buildFilters();
  if (!filters.idAnneeScolaire || !filters.idClassePedagogique || !filters.codeColonne) {
    statisticsStore.reinitialiser();
    return;
  }

  await router.replace({
    query: {
      ...route.query,
      idAnneeScolaire: filters.idAnneeScolaire,
      anneeScolaire: filters.anneeScolaireLabel,
      idClassePedagogique: filters.idClassePedagogique,
      classe: filters.classeLabel,
      section: filters.sectionLabel,
      codeColonne: filters.codeColonne,
    },
  });

  await statisticsStore.charger(filters);
}

function exporterCsv(): void {
  if (!statistics.value) {
    return;
  }

  const headers = ['Mesure', 'Garcons', 'Filles', 'Total'];
  const lines = statistics.value.metrics.map((metric) => [metric.label, metric.garcons, metric.filles, metric.total]);
  const csv = [headers, ...lines]
    .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `statistiques-classe-${idClassePedagogiqueInput.value || 'classe'}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function ouvrirVersionPdf(): void {
  if (!statistics.value) {
    return;
  }

  const rows = statistics.value.metrics
    .map((metric) => `<tr><td>${metric.label}</td><td>${metric.garcons}</td><td>${metric.filles}</td><td>${metric.total}</td></tr>`)
    .join('');
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8" /><title>Statistiques de classe</title><style>body{font-family:Arial,sans-serif;margin:24px;color:#11283f}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #c4d1df;padding:8px;text-align:left}th{background:#edf4f8}</style></head><body><h1>Statistiques pedagogiques de classe</h1><p>${statistics.value.scopeLabel}</p><p>${statistics.value.activeColumnLabel}</p><table><thead><tr><th>Mesure</th><th>Garcons</th><th>Filles</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
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
if (idAnneeScolaireInput.value && idClassePedagogiqueInput.value && isAuthorized.value) {
  void chargerStatistiques();
}
</script>

<style scoped>
.pedagogique-actions,.pedagogique-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.pedagogique-pill,.pedagogique-primary-action,.pedagogique-secondary-action{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;text-decoration:none;font-weight:600}
.pedagogique-pill--action,.pedagogique-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.pedagogique-primary-action:disabled{opacity:.55;cursor:not-allowed}
.pedagogique-callout{display:flex;gap:.75rem;align-items:flex-start;border:1px solid rgba(17,40,63,.08);background:linear-gradient(180deg,rgba(238,246,251,.96),rgba(255,255,255,.98));border-radius:24px;padding:1rem 1.1rem}
.pedagogique-form-grid,.pedagogique-kpi-grid,.statistics-kpi-grid,.statistics-secondary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem}
.pedagogique-field{display:grid;gap:.45rem}
.pedagogique-field input,.pedagogique-field select{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.pedagogique-kpi-card,.statistics-kpi-card,.statistics-secondary-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
.statistics-checklist{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem}
.statistics-check{border-radius:20px;padding:1rem;border:1px solid rgba(17,40,63,.08);display:grid;gap:.35rem;background:#fff}
.statistics-check.is-ready{background:linear-gradient(180deg,rgba(237,248,242,.98),rgba(255,255,255,.98));border-color:rgba(45,125,76,.18)}
.statistics-check.is-missing{background:linear-gradient(180deg,rgba(254,245,239,.98),rgba(255,255,255,.98));border-color:rgba(184,88,37,.15)}
.pedagogique-table-shell{overflow:auto;border-radius:22px;border:1px solid rgba(17,40,63,.08);background:#fff}
.pedagogique-table{width:100%;border-collapse:collapse;min-width:680px}
.pedagogique-table th,.pedagogique-table td{padding:.9rem 1rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left;vertical-align:top}
.pedagogique-table th{background:#edf4f8;font-size:.85rem;letter-spacing:.03em;text-transform:uppercase}
</style>
