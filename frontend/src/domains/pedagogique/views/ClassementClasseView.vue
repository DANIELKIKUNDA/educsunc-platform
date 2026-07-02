<template>
  <PageContainer>
    <PageHeader
      eyebrow="MP-05"
      title="Classement de classe"
      description="Lecture du classement reel d une classe sur une colonne donnee, sans document PDF metier autonome suppose."
    >
      <template #actions>
        <div class="pedagogique-actions">
          <RouterLink class="pedagogique-pill" to="/app/pedagogique">
            <ArrowLeft />
            <span>Retour pedagogique</span>
          </RouterLink>
          <button class="pedagogique-pill" type="button" :disabled="!ranking" @click="exporterCsv">
            <Sheet />
            <span>Excel</span>
          </button>
          <button class="pedagogique-pill pedagogique-pill--action" type="button" :disabled="!ranking" @click="imprimerPage">
            <Printer />
            <span>Impression</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock title="Perimetre pedagogique" description="Le classement reste borne par permission + perimetre, jamais global.">
      <div class="pedagogique-callout">
        <ShieldCheck />
        <p>{{ ranking?.actorScopeMessage ?? perimeterMessage }}</p>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="PED-006">
      <template v-if="uiState === 'loading'">
        <LoadingState title="Chargement du classement" message="Lecture du classement de classe en cours." />
      </template>

      <template v-else-if="uiState === 'technical-error'">
        <ErrorState title="Classement indisponible" :message="technicalErrorMessage" />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Classement non autorise"
          message="Cette vue reste reservee au titulaire, au prefet des etudes et au directeur des etudes."
        />

        <template v-else>
          <div class="ranking-kpi-grid">
            <div class="ranking-kpi-card">
              <small>Acteur</small>
              <strong>{{ session.actorCode }}</strong>
              <span>{{ perimeterMessage }}</span>
            </div>
            <div class="ranking-kpi-card">
              <small>Perimetre</small>
              <strong>{{ scopeLabel }}</strong>
              <span>Classe, section et annee de lecture</span>
            </div>
            <div class="ranking-kpi-card">
              <small>Precontrole</small>
              <strong>{{ canLoad ? 'Pret' : 'Incomplet' }}</strong>
              <span>{{ missingFieldsLabel }}</span>
            </div>
          </div>

          <SectionBlock title="Filtres" description="Le backend fournit le classement deja consolide pour la classe cible.">
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
                <span>Colonne de classement</span>
                <select v-model="codeColonneInput">
                  <option v-for="column in columnOptions" :key="column" :value="column">
                    {{ column }}
                  </option>
                </select>
              </label>
            </div>

            <div class="ranking-checklist">
              <div :class="['ranking-check', idAnneeScolaireInput.trim() ? 'is-ready' : 'is-missing']">
                <strong>Annee scolaire</strong>
                <span>{{ idAnneeScolaireInput.trim() ? 'Renseignee' : 'Manquante' }}</span>
              </div>
              <div :class="['ranking-check', idClassePedagogiqueInput.trim() ? 'is-ready' : 'is-missing']">
                <strong>Classe</strong>
                <span>{{ idClassePedagogiqueInput.trim() ? 'Renseignee' : 'Manquante' }}</span>
              </div>
              <div :class="['ranking-check', codeColonneInput.trim() ? 'is-ready' : 'is-missing']">
                <strong>Colonne</strong>
                <span>{{ codeColonneInput.trim() || 'Manquante' }}</span>
              </div>
            </div>

            <div class="pedagogique-actions-row">
              <button class="pedagogique-primary-action" type="button" :disabled="!canLoad" @click="chargerClassement">
                <Search />
                <span>Charger le classement</span>
              </button>
              <button class="pedagogique-secondary-action" type="button" @click="synchroniserDepuisRoute">
                Reprendre la route
              </button>
            </div>
          </SectionBlock>

          <EmptyState
            v-if="!ranking"
            title="Classement en attente"
            message="Renseignez une classe, une annee et une colonne reelle pour consulter le classement."
          />

          <template v-else>
            <div class="pedagogique-kpi-grid">
              <div class="pedagogique-kpi-card">
                <small>Portee</small>
                <strong>{{ ranking.scopeLabel }}</strong>
                <span>{{ ranking.activeColumnLabel }}</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Lignes</small>
                <strong>{{ ranking.lineCount }}</strong>
                <span>Effectif retourne par le backend</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Non classes</small>
                <strong>{{ ranking.nonClassesCount }}</strong>
                <span>Sorties hors classement</span>
              </div>
              <div class="pedagogique-kpi-card">
                <small>Meilleur pourcentage</small>
                <strong>{{ ranking.bestPercentage }}</strong>
                <span>Lecture backend consolidee</span>
              </div>
            </div>

            <SectionBlock title="Tableau principal" description="Le backend porte maintenant le nom complet, le sexe et les valeurs reelles de classement.">
              <div class="pedagogique-table-shell">
                <table class="pedagogique-table">
                  <thead>
                    <tr>
                      <th>Rang</th>
                      <th>Eleve</th>
                      <th>Sexe</th>
                      <th>Total obtenu</th>
                      <th>Maximum</th>
                      <th>Pourcentage</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="line in ranking.lines"
                      :key="line.idEleve"
                      :class="line.estNonClasse ? 'is-non-classe' : ''"
                    >
                      <td>
                        <span class="ranking-rank">{{ line.rang }}</span>
                      </td>
                      <td>
                        <div class="ranking-student">
                          <strong>{{ line.displayLabel }}</strong>
                          <small>{{ line.idEleve }}</small>
                        </div>
                      </td>
                      <td>{{ line.sexe }}</td>
                      <td>{{ line.totalObtenu }}</td>
                      <td>{{ line.maximumGeneral }}</td>
                      <td>{{ line.pourcentage }}</td>
                      <td>
                        <span :class="['ranking-badge', line.estNonClasse ? 'is-non-classe' : 'is-classe']">
                          {{ line.estNonClasse ? 'Non classe' : 'Classe' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionBlock>

            <SectionBlock title="Lecture secondaire" description="Le classement reste un outil de pilotage de classe, pas un moteur de decision parallele.">
              <div class="ranking-secondary-grid">
                <div class="ranking-secondary-card">
                  <small>Colonne active</small>
                  <strong>{{ ranking.activeColumnLabel }}</strong>
                  <span>Le changement de colonne relit un classement backend distinct.</span>
                </div>
                <div class="ranking-secondary-card">
                  <small>Statut de classabilite</small>
                  <strong>{{ ranking.nonClassesCount }} non classes</strong>
                  <span>Le frontend n invente aucune raison de non classement.</span>
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
import { ArrowLeft, Printer, Search, Sheet, ShieldCheck } from 'lucide-vue-next';
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
import { type ClassRankingFilters } from '../models/class-ranking.model';
import { useClassRankingStore } from '../stores/class-ranking.store';

const route = useRoute();
const router = useRouter();
const session = sessionStore.state;
const context = activeContextStore.state;
const rankingStore = useClassRankingStore();
const doctrineAccess = useDoctrineAccess();

const idAnneeScolaireInput = ref('');
const anneeScolaireLabelInput = ref('');
const idClassePedagogiqueInput = ref('');
const classeLabelInput = ref('');
const sectionLabelInput = ref('');
const codeColonneInput = ref('TOTAL_GENERAL');

const columnOptions = ['P1', 'P2', 'EX1', 'TOTAL_S1', 'P3', 'P4', 'EX2', 'TOTAL_S2', 'TOTAL_GENERAL', 'TOTAL_T1', 'TOTAL_T2', 'P5', 'P6', 'EX3', 'TOTAL_T3'];

const isAuthorized = computed(() => doctrineAccess.canAccessPage('PED-006'));
const ranking = computed(() => rankingStore.state.ranking);
const technicalErrorMessage = computed(() =>
  rankingStore.state.errorMessage ?? 'Le backend n a pas pu restituer le classement attendu.',
);
const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
  if (rankingStore.state.status === 'loading') {
    return 'loading';
  }
  if (rankingStore.state.status === 'error') {
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
      return 'Lecture bornee a la section secondaire autorisee.';
    default:
      return `Session visible ${session.actorLabel}. Aucun perimetre de classement officiel n est ouvert pour cet acteur.`;
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

function buildFilters(): ClassRankingFilters {
  return {
    idAnneeScolaire: idAnneeScolaireInput.value.trim(),
    idClassePedagogique: idClassePedagogiqueInput.value.trim(),
    codeColonne: codeColonneInput.value.trim(),
    anneeScolaireLabel: anneeScolaireLabelInput.value.trim() || undefined,
    classeLabel: classeLabelInput.value.trim() || undefined,
    sectionLabel: sectionLabelInput.value.trim() || undefined,
  };
}

async function chargerClassement(): Promise<void> {
  if (!isAuthorized.value) {
    rankingStore.reinitialiser();
    return;
  }

  const filters = buildFilters();
  if (!filters.idAnneeScolaire || !filters.idClassePedagogique || !filters.codeColonne) {
    rankingStore.reinitialiser();
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

  await rankingStore.charger(filters);
}

function exporterCsv(): void {
  if (!ranking.value) {
    return;
  }

  const headers = ['Rang', 'Nom complet', 'Sexe', 'Total obtenu', 'Maximum', 'Pourcentage', 'Statut'];
  const lines = ranking.value.lines.map((line) => [
    line.rang,
    line.displayLabel,
    line.sexe,
    line.totalObtenu,
    line.maximumGeneral,
    line.pourcentage,
    line.estNonClasse ? 'Non classe' : 'Classe',
  ]);
  const csv = [headers, ...lines]
    .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `classement-classe-${idClassePedagogiqueInput.value || 'classe'}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function imprimerPage(): void {
  window.print();
}

synchroniserDepuisRoute();
if (idAnneeScolaireInput.value && idClassePedagogiqueInput.value && isAuthorized.value) {
  void chargerClassement();
}
</script>

<style scoped>
.pedagogique-actions,.pedagogique-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.pedagogique-pill,.pedagogique-primary-action,.pedagogique-secondary-action{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;text-decoration:none;font-weight:600}
.pedagogique-pill--action,.pedagogique-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.pedagogique-primary-action:disabled{opacity:.55;cursor:not-allowed}
.pedagogique-callout{display:flex;gap:.75rem;align-items:flex-start;border:1px solid rgba(17,40,63,.08);background:linear-gradient(180deg,rgba(238,246,251,.96),rgba(255,255,255,.98));border-radius:24px;padding:1rem 1.1rem}
.pedagogique-form-grid,.pedagogique-kpi-grid,.ranking-kpi-grid,.ranking-secondary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem}
.pedagogique-field{display:grid;gap:.45rem}
.pedagogique-field input,.pedagogique-field select{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.pedagogique-kpi-card,.ranking-kpi-card,.ranking-secondary-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
.ranking-checklist{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem}
.ranking-check{border-radius:20px;padding:1rem;border:1px solid rgba(17,40,63,.08);display:grid;gap:.35rem;background:#fff}
.ranking-check.is-ready{background:linear-gradient(180deg,rgba(237,248,242,.98),rgba(255,255,255,.98));border-color:rgba(45,125,76,.18)}
.ranking-check.is-missing{background:linear-gradient(180deg,rgba(254,245,239,.98),rgba(255,255,255,.98));border-color:rgba(184,88,37,.15)}
.pedagogique-table-shell{overflow:auto;border-radius:22px;border:1px solid rgba(17,40,63,.08);background:#fff}
.pedagogique-table{width:100%;border-collapse:collapse;min-width:780px}
.pedagogique-table th,.pedagogique-table td{padding:.9rem 1rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left;vertical-align:top}
.pedagogique-table th{background:#edf4f8;font-size:.85rem;letter-spacing:.03em;text-transform:uppercase}
.pedagogique-table tbody tr.is-non-classe{background:rgba(184,88,37,.06)}
.ranking-rank{display:inline-flex;min-width:40px;justify-content:center;padding:.25rem .5rem;border-radius:999px;background:#edf4f8;color:#17324a;font-weight:700}
.ranking-student{display:grid;gap:.15rem}
.ranking-student small{color:#61778a}
.ranking-badge{display:inline-flex;align-items:center;border-radius:999px;padding:.25rem .6rem;font-size:.82rem;font-weight:600}
.ranking-badge.is-classe{background:#e8f5ec;color:#24613b}
.ranking-badge.is-non-classe{background:#fff1e8;color:#a3521d}
</style>
