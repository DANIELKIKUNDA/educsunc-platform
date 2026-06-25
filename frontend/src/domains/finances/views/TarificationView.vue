<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-016"
      title="Grilles de tarification"
      description="Vue liste et mutation pour consulter, creer, modifier et desactiver les grilles de tarification de l'ecole."
    >
      <template #actions>
        <RouterLink class="module-quick-access__pill module-quick-access__pill--action" to="/app/finances">
          <ArrowLeft />
          <span>Retour finances</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock
      title="Cadre de gouvernance visible"
      description="La gestion des grilles de tarification reste reservee a l'acteur systeme d'ecole retenu."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <ListTree />
          </div>
          <div>
            <p class="finance-hero-strip__label">Acteur attendu</p>
            <strong>Admin systeme ecole</strong>
          </div>
        </div>
        <div class="module-home-grid">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Ecole" :value="context.schoolName" />
          <ContextBadge label="Annee scolaire" :value="context.schoolYearLabel" />
          <ContextBadge label="Grilles" :value="String(model.rows.length)" />
        </div>
      </div>
      <div class="finance-info-banner">
        <ShieldCheck />
        <p class="finance-form-note">{{ perimeterMessage }}</p>
      </div>
    </SectionBlock>

    <AccessBoundary capability="module.finances.access">
      <template v-if="uiState === 'loading'">
        <LoadingState
          title="Chargement des grilles"
          message="Preparation des grilles de tarification et des regles locales associees."
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Tarification non autorisee"
          message="Cette vue de gestion reste reservee a l'ADMIN_SYSTEME_ECOLE de l'ecole courante."
        />

        <div class="finance-form-grid">
          <SectionBlock
            title="Tableau des grilles"
            description="La liste centrale des grilles actives ou inactives avec leurs criteres utiles."
          >
            <div class="finance-table-shell">
              <table class="finance-table">
                <thead>
                  <tr>
                    <th>Libelle</th>
                    <th>Type de frais</th>
                    <th>Section</th>
                    <th>Montant</th>
                    <th>Annee</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in model.rows" :key="row.id">
                    <td>{{ row.libelle }}</td>
                    <td>{{ row.typeFrais }}</td>
                    <td>{{ row.section }}</td>
                    <td>{{ formatCurrency(row.montant) }}</td>
                    <td>{{ row.anneeScolaire }}</td>
                    <td>
                      <span class="finance-status-badge" :class="row.statut === 'ACTIVE' ? 'finance-status-badge--success' : 'finance-status-badge--warning'">
                        {{ row.statut }}
                      </span>
                    </td>
                    <td>
                      <button class="finance-link-action" type="button" @click="selectedGridId = row.id">
                        Consulter
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionBlock>

          <SectionBlock
            title="Panneau detail"
            description="Lecture detaillee de la grille selectionnee avant toute mutation."
          >
            <div v-if="selectedGrid" class="finance-list-card">
              <div class="finance-list-card__row">
                <div>
                  <strong>{{ selectedGrid.libelle }}</strong>
                  <small>{{ selectedGrid.typeFrais }} · {{ selectedGrid.section }}</small>
                </div>
                <strong>{{ formatCurrency(selectedGrid.montant) }}</strong>
              </div>
              <div class="finance-list-card__row">
                <div>
                  <strong>Regle de tarification</strong>
                  <small>{{ selectedGrid.regle }}</small>
                </div>
              </div>
              <div class="finance-list-card__row">
                <div>
                  <strong>Statut</strong>
                  <small>{{ selectedGrid.statut }}</small>
                </div>
              </div>
            </div>

            <EmptyState
              v-else
              title="Aucune grille selectionnee"
              message="Choisir une grille dans le tableau pour afficher son detail."
            />
          </SectionBlock>
        </div>

        <SectionBlock
          title="Formulaire de mutation"
          description="Zone unique pour creer, modifier ou desactiver une grille dans le bon perimetre."
        >
          <div class="finance-form-stack">
            <div class="finance-filter-grid finance-filter-grid--wide">
              <label class="finance-field">
                <span>Libelle</span>
                <input v-model="libelleInput" type="text" />
              </label>
              <label class="finance-field">
                <span>Type de frais</span>
                <input v-model="typeFraisInput" type="text" />
              </label>
              <label class="finance-field">
                <span>Section</span>
                <input v-model="sectionInput" type="text" />
              </label>
              <label class="finance-field">
                <span>Montant</span>
                <input v-model="montantInput" type="number" min="0" step="1000" />
              </label>
            </div>

            <div class="finance-form-actions">
              <button class="finance-primary-action" type="button" @click="saveGrid">
                <Save />
                <span>Modifier</span>
              </button>
            </div>

            <div class="finance-form-actions">
              <button class="finance-secondary-action" type="button" @click="disableGrid">
                <Ban />
                <span>Desactiver</span>
              </button>
            </div>

            <div v-if="uiState === 'success-save'" class="finance-success-panel">
              <div class="finance-success-panel__icon">
                <CircleCheckBig />
              </div>
              <strong>Grille preparee</strong>
              <p>La simulation frontend a enregistre une mutation de grille de tarification.</p>
            </div>

            <div v-else-if="uiState === 'success-disable'" class="finance-success-panel">
              <div class="finance-success-panel__icon">
                <CircleCheckBig />
              </div>
              <strong>Grille desactivee</strong>
              <p>La simulation frontend a enregistre une desactivation locale de grille.</p>
            </div>
          </div>
        </SectionBlock>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, Ban, CircleCheckBig, ListTree, Save, ShieldCheck } from 'lucide-vue-next';
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
import { tarificationViewModel } from '../data/tarification.demo';

type TarificationUiState = 'idle' | 'loading' | 'success-save' | 'success-disable';

const context = activeContextStore.state;
const session = sessionStore.state;
const model = ref({ ...tarificationViewModel });
const uiState = ref<TarificationUiState>('idle');
const selectedGridId = ref(model.value.rows[0]?.id ?? '');

const libelleInput = ref(model.value.rows[0]?.libelle ?? '');
const typeFraisInput = ref(model.value.rows[0]?.typeFrais ?? '');
const sectionInput = ref(model.value.rows[0]?.section ?? '');
const montantInput = ref(String(model.value.rows[0]?.montant ?? 0));

const isAuthorized = computed(() => session.actorCode === 'ADMIN_SYSTEME_ECOLE');

const selectedGrid = computed(() => model.value.rows.find((row) => row.id === selectedGridId.value) ?? null);

const perimeterMessage = computed(() => {
  if (isAuthorized.value) {
    return `Gestion bornee a l ecole active: ${context.schoolName}. ADMINISTRATEUR_ECOLE ne devient pas gestionnaire implicite des grilles.`;
  }

  return `Session visible: ${session.actorLabel}. Cette vue de tarification reste reservee a l ADMIN_SYSTEME_ECOLE.`;
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' FC';
}

function saveGrid(): void {
  uiState.value = 'success-save';
}

function disableGrid(): void {
  uiState.value = 'success-disable';
}
</script>
