<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-013"
      title="Fonds anticipes"
      description="Vue d'analyse et de detail pour lire les fonds anticipes dans le bon perimetre local, organisationnel ou pedagogiquement delegue."
    >
      <template #actions>
        <RouterLink class="module-quick-access__pill module-quick-access__pill--action" to="/app/finances">
          <ArrowLeft />
          <span>Retour finances</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock
      title="Cadre analytique visible"
      description="La lecture des fonds anticipes reste strictement bornee au perimetre reel de l'acteur."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <PiggyBank />
          </div>
          <div>
            <p class="finance-hero-strip__label">Acteur visible</p>
            <strong>{{ session.actorLabel }}</strong>
          </div>
        </div>
        <div class="module-home-grid">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Organisation" :value="context.organizationName" />
          <ContextBadge label="Ecole" :value="context.schoolName" />
          <ContextBadge label="Fonds disponibles" :value="formatCurrency(model?.totalDisponible ?? 0)" />
        </div>
      </div>
      <div class="finance-info-banner">
        <ShieldCheck />
        <p class="finance-form-note">
          {{ perimeterMessage }}
        </p>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="PF-17">
      <template v-if="uiState === 'loading'">
        <LoadingState
          title="Chargement des fonds anticipes"
          message="Preparation de la synthese reelle des fonds anticipes dans le bon perimetre."
        />
      </template>

      <template v-else-if="uiState === 'technical-error'">
        <ErrorState
          title="Lecture technique indisponible"
          :message="technicalErrorMessage"
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Lecture non autorisee"
          message="Cette vue est reservee aux lecteurs financiers ou delegues officiellement dans leur perimetre."
        />

        <template v-else-if="model">
          <SectionBlock
            title="Filtres temporels"
            description="Le jeu de donnees peut etre restreint par fenetre de dates sans sortir du perimetre courant."
          >
            <div class="finance-form-stack">
              <div class="finance-filter-grid finance-filter-grid--wide">
                <label class="finance-field">
                  <span>Date debut</span>
                  <input v-model="dateDebut" type="date" />
                </label>

                <label class="finance-field">
                  <span>Date fin</span>
                  <input v-model="dateFin" type="date" />
                </label>
              </div>

              <div class="finance-guard-panel">
                <div class="finance-guard-panel__header">
                  <ShieldCheck />
                  <strong>Regles visibles</strong>
                </div>
                <ul>
                  <li>Les acteurs pedagogiques delegues ne voient que les eleves de leur perimetre effectif.</li>
                  <li>Le total expose vient uniquement des origines `ANTICIPE` et `LISSAGE` remontees par le backend.</li>
                  <li>Aucune lecture hors classe ou hors section ne doit etre ouverte aux delegues pedagogiques.</li>
                </ul>
              </div>
            </div>
          </SectionBlock>

          <div class="finance-kpi-grid finance-kpi-grid--detail">
            <div class="finance-kpi-card">
              <small>Total disponible</small>
              <strong>{{ formatCurrency(model.totalDisponible) }}</strong>
              <span>Montants anticipes visibles</span>
            </div>
            <div class="finance-kpi-card">
              <small>Lignes backend</small>
              <strong>{{ model.totalLignes }}</strong>
              <span>Origines d'affectation reelles</span>
            </div>
            <div class="finance-kpi-card">
              <small>Periode</small>
              <strong>{{ model.periodeLabel }}</strong>
              <span>Fenetre de lecture courante</span>
            </div>
          </div>

          <SectionBlock
            title="Synthese des origines"
            description="Le backend actuel expose une synthese des fonds anticipes par origine d'affectation."
          >
            <EmptyState
              v-if="model.rows.length === 0"
              title="Aucun fonds anticipe"
              message="Aucune ligne ne correspond aux filtres courants."
            />

            <div v-else class="finance-table-shell">
              <table class="finance-table">
                <thead>
                  <tr>
                    <th>Origine</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in model.rows" :key="row.id">
                    <td>{{ row.origineAffectation }}</td>
                    <td>{{ formatCurrency(row.total) }}</td>
                    <td>
                      <button class="finance-link-action" type="button" @click="selectedRowId = row.id">
                        Ouvrir detail
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="selectedRow" class="finance-status-strip finance-status-strip--neutral">
              <PiggyBank />
              <div>
                <strong>Detail origine</strong>
                <p>
                  {{ selectedRow.origineAffectation }} | {{ formatCurrency(selectedRow.total) }}
                  disponibles sur la fenetre courante.
                </p>
              </div>
            </div>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, PiggyBank, ShieldCheck } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { sessionStore } from '../../../shared/auth/session.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { useAnticipatedFundsStore } from '../stores/anticipated-funds.store';

const context = activeContextStore.state;
const session = sessionStore.state;
const fundsStore = useAnticipatedFundsStore();
const doctrineAccess = useDoctrineAccess();
const dateDebut = ref('2026-06-01');
const dateFin = ref('2026-06-30');
const selectedRowId = ref('');

const isAuthorized = computed(() => doctrineAccess.canAccessPage('PF-17'));
const model = computed(() => fundsStore.state.funds);
const technicalErrorMessage = computed(() =>
  fundsStore.state.errorMessage
  ?? 'Le backend n a pas pu restituer les fonds anticipes.',
);
const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
  if (fundsStore.state.status === 'loading') {
    return 'loading';
  }

  if (fundsStore.state.status === 'error') {
    return 'technical-error';
  }

  return 'idle';
});

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'GESTIONNAIRE_ORGANISATION':
    case 'PROMOTEUR_ORGANISATION':
      return `Lecture bornee a l organisation active: ${context.organizationName}.`;
    case 'TITULAIRE':
      return 'Lecture bornee a la classe titulaire effective si la delegation ecole est active.';
    case 'PREFET_ETUDES':
    case 'DIRECTEUR_ETUDES':
    case 'DIRECTEUR_PRIMAIRE':
    case 'DIRECTEUR_MATERNELLE':
      return 'Lecture bornee a la section de delegation et aux eleves visibles de ce perimetre.';
    case 'CAISSIER':
    case 'ADMINISTRATEUR_ECOLE':
      return `Lecture bornee a l ecole active: ${context.schoolName}.`;
    default:
      return `Session visible: ${session.actorLabel}. Cette vue n est pas ouverte a cet acteur.`;
  }
});

const selectedRow = computed(() => model.value?.rows.find((row) => row.id === selectedRowId.value) ?? null);

function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FC`;
}

watch(
  () => [dateDebut.value, dateFin.value, isAuthorized.value],
  async () => {
    selectedRowId.value = '';

    if (!isAuthorized.value) {
      fundsStore.reinitialiser();
      return;
    }

    await fundsStore.charger({
      dateDebut: dateDebut.value.trim() || undefined,
      dateFin: dateFin.value.trim() || undefined,
    });
  },
  { immediate: true },
);
</script>
