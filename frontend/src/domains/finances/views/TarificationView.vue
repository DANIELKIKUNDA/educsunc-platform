<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-016"
      title="Grilles de tarification"
      description="Vue liste et mutation pour consulter, creer, modifier et desactiver les grilles de tarification de l'ecole."
    >
      <template #actions>
        <div class="module-home-actions">
          <RouterLink class="module-quick-access__pill module-quick-access__pill--action" to="/app/finances">
            <ArrowLeft />
            <span>Retour finances</span>
          </RouterLink>
          <button class="module-quick-access__pill" type="button" @click="prepareCreate">
            <Plus />
            <span>Nouvelle grille</span>
          </button>
        </div>
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
          <ContextBadge label="Id annee" :value="schoolYearId ?? 'A renseigner'" />
        </div>
      </div>
      <div class="finance-info-banner">
        <ShieldCheck />
        <p class="finance-form-note">{{ perimeterMessage }}</p>
      </div>
    </SectionBlock>

    <AccessBoundary capability="module.finances.access">
      <template v-if="uiState === 'loading' || uiState === 'saving'">
        <LoadingState
          :title="uiState === 'saving' ? 'Sauvegarde des grilles' : 'Chargement des grilles'"
          :message="uiState === 'saving'
            ? 'Application de la mutation sur la grille de tarification.'
            : 'Preparation des grilles de tarification et des regles locales associees.'"
        />
      </template>

      <template v-else-if="uiState === 'missing-school-year'">
        <ErrorState
          title="Annee scolaire backend manquante"
          message="Ajoutez idAnneeScolaire dans l'URL ou configurez VITE_REFERENTIEL_ANNEE_SCOLAIRE_ID pour ouvrir une vue de tarification reelle."
        />
      </template>

      <template v-else-if="uiState === 'technical-error'">
        <ErrorState
          title="Tarification indisponible"
          :message="technicalErrorMessage"
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Tarification non autorisee"
          message="Cette vue de gestion reste reservee a l'ADMIN_SYSTEME_ECOLE de l'ecole courante."
        />

        <template v-else>
          <SectionBlock
            title="Filtres de lecture"
            description="La liste peut etre reduite sans casser le perimetre local."
          >
            <div class="finance-filter-grid finance-filter-grid--wide">
              <label class="finance-field">
                <span>Type de frais</span>
                <select v-model="selectedTypeFrais">
                  <option value="">Tous les types</option>
                  <option
                    v-for="option in tarificationFeeTypeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </label>

              <label class="finance-field">
                <span>Statut</span>
                <select v-model="selectedActif">
                  <option value="">Tous</option>
                  <option value="true">Actives</option>
                  <option value="false">Inactives</option>
                </select>
              </label>

              <div class="finance-form-actions">
                <button class="finance-secondary-action" type="button" @click="reload">
                  Recharger
                </button>
              </div>
            </div>
          </SectionBlock>

          <div class="finance-form-grid">
            <SectionBlock
              title="Tableau des grilles"
              description="La liste centrale des grilles actives ou inactives avec leurs criteres utiles."
            >
              <EmptyState
                v-if="rows.length === 0"
                title="Aucune grille visible"
                message="Aucune grille ne correspond aux filtres courants pour cette annee scolaire."
              />

              <div v-else class="finance-table-shell">
                <table class="finance-table">
                  <thead>
                    <tr>
                      <th>Libelle</th>
                      <th>Type de frais</th>
                      <th>Section</th>
                      <th>Montant</th>
                      <th>Regle</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in rows" :key="row.id">
                      <td>{{ row.libelle }}</td>
                      <td>{{ labelTypeFrais(row.typeFrais) }}</td>
                      <td>{{ row.section }}</td>
                      <td>{{ formatCurrency(row.montant, row.devise) }}</td>
                      <td>{{ row.regle }}</td>
                      <td>
                        <span
                          class="finance-status-badge"
                          :class="row.statut === 'ACTIVE' ? 'finance-status-badge--success' : 'finance-status-badge--warning'"
                        >
                          {{ row.statut }}
                        </span>
                      </td>
                      <td>
                        <button class="finance-link-action" type="button" @click="selectGrid(row.id)">
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
                    <small>{{ labelTypeFrais(selectedGrid.typeFrais) }} | {{ selectedGrid.section }}</small>
                  </div>
                  <strong>{{ formatCurrency(selectedGrid.montant, selectedGrid.devise) }}</strong>
                </div>
                <div class="finance-list-card__row">
                  <div>
                    <strong>Regle de tarification</strong>
                    <small>{{ selectedGrid.regle }}</small>
                  </div>
                </div>
                <div class="finance-list-card__row">
                  <div>
                    <strong>Validite</strong>
                    <small>{{ selectedGrid.dateDebutValidite ?? 'Debut libre' }} | {{ selectedGrid.dateFinValidite ?? 'Fin libre' }}</small>
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
                message="Choisir une grille dans le tableau ou preparer une creation."
              />
            </SectionBlock>
          </div>

          <SectionBlock
            title="Formulaire de mutation"
            description="Zone unique pour creer, modifier ou desactiver une grille dans le bon perimetre."
          >
            <div v-if="form" class="finance-form-stack">
              <div class="finance-filter-grid finance-filter-grid--wide">
                <label class="finance-field">
                  <span>Libelle</span>
                  <input v-model="form.libelle" type="text" />
                </label>

                <label class="finance-field">
                  <span>Type de frais</span>
                  <select v-model="form.typeFrais">
                    <option
                      v-for="option in tarificationFeeTypeOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </label>

                <label class="finance-field">
                  <span>Section</span>
                  <input v-model="form.section" type="text" placeholder="Ex: Secondaire" />
                </label>

                <label class="finance-field">
                  <span>Montant</span>
                  <input v-model="form.montant" type="number" min="0" step="1000" />
                </label>

                <label class="finance-field">
                  <span>Devise</span>
                  <select v-model="form.devise">
                    <option
                      v-for="option in tarificationCurrencyOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </label>

                <label class="finance-field">
                  <span>Mois scolaire</span>
                  <select v-model="form.moisScolaire">
                    <option value="">Aucun</option>
                    <option
                      v-for="option in paymentSchoolMonthOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </label>

                <label class="finance-field">
                  <span>Categorie frais Etat</span>
                  <select v-model="form.categorieFraisEtat">
                    <option value="">Aucune</option>
                    <option
                      v-for="option in tarificationCategorieFraisEtatOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </label>

                <label class="finance-field">
                  <span>Categorie technique</span>
                  <select v-model="form.categorieTechnique">
                    <option value="">Aucune</option>
                    <option
                      v-for="option in tarificationCategorieTechniqueOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </label>

                <label class="finance-field">
                  <span>Tranche frais Etat</span>
                  <select v-model="form.trancheFraisEtat">
                    <option value="">Aucune</option>
                    <option
                      v-for="option in tarificationTrancheOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </label>

                <label class="finance-field">
                  <span>Date debut validite</span>
                  <input v-model="form.dateDebutValidite" type="date" />
                </label>

                <label class="finance-field">
                  <span>Date fin validite</span>
                  <input v-model="form.dateFinValidite" type="date" />
                </label>
              </div>

              <div class="finance-toggle-grid">
                <label class="finance-toggle-row">
                  <input v-model="form.obligatoire" type="checkbox" />
                  <span>Grille obligatoire</span>
                </label>
                <label class="finance-toggle-row">
                  <input v-model="form.actif" type="checkbox" />
                  <span>Grille active</span>
                </label>
                <label class="finance-toggle-row">
                  <input v-model="form.estClasseTENASOSP" type="checkbox" />
                  <span>Classe TENASOSP</span>
                </label>
                <label class="finance-toggle-row">
                  <input v-model="form.estClasseEXETAT" type="checkbox" />
                  <span>Classe EXETAT</span>
                </label>
                <label class="finance-toggle-row">
                  <input v-model="form.estClasseFinaliste" type="checkbox" />
                  <span>Classe finaliste</span>
                </label>
              </div>

              <div class="finance-form-actions">
                <button class="finance-primary-action" type="button" @click="saveGrid">
                  <Save />
                  <span>{{ form.id ? 'Modifier' : 'Creer' }}</span>
                </button>
                <button
                  class="finance-secondary-action"
                  type="button"
                  :disabled="form.id === null"
                  @click="disableGrid"
                >
                  <Ban />
                  <span>Desactiver</span>
                </button>
              </div>

              <div v-if="uiState === 'saved'" class="finance-success-panel">
                <div class="finance-success-panel__icon">
                  <CircleCheckBig />
                </div>
                <strong>Grille enregistree</strong>
                <p>La liste et le detail ont ete relus depuis le backend officiel de tarification.</p>
              </div>
            </div>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ArrowLeft, Ban, CircleCheckBig, ListTree, Plus, Save, ShieldCheck } from 'lucide-vue-next';
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
import { paymentSchoolMonthOptions } from '../models/payment-settings.model';
import {
  tarificationCategorieFraisEtatOptions,
  tarificationCategorieTechniqueOptions,
  tarificationCurrencyOptions,
  tarificationFeeTypeOptions,
  tarificationTrancheOptions,
  type TarificationListFilters,
} from '../models/tarification.model';
import { useTarificationStore } from '../stores/tarification.store';

const route = useRoute();
const context = activeContextStore.state;
const session = sessionStore.state;
const tarificationStore = useTarificationStore();
const selectedTypeFrais = ref('');
const selectedActif = ref('');

const isAuthorized = computed(() => session.actorCode === 'ADMIN_SYSTEME_ECOLE');
const rows = computed(() => tarificationStore.state.rows);
const form = computed(() => tarificationStore.state.form);
const selectedGrid = computed(() =>
  rows.value.find((row) => row.id === tarificationStore.state.selectedGridId) ?? null,
);
const technicalErrorMessage = computed(() =>
  tarificationStore.state.errorMessage
  ?? 'Le backend n a pas pu restituer les grilles de tarification.',
);
const schoolYearId = computed(() => lireIdAnneeScolaire());

const uiState = computed<'loading' | 'saving' | 'ready' | 'saved' | 'missing-school-year' | 'technical-error'>(() => {
  if (!schoolYearId.value) {
    return 'missing-school-year';
  }

  switch (tarificationStore.state.status) {
    case 'loading':
      return 'loading';
    case 'saving':
      return 'saving';
    case 'error':
      return 'technical-error';
    case 'saved':
      return 'saved';
    default:
      return 'ready';
  }
});

const perimeterMessage = computed(() => {
  if (isAuthorized.value) {
    return `Gestion bornee a l ecole active: ${context.schoolName}. ADMINISTRATEUR_ECOLE ne devient pas gestionnaire implicite des grilles.`;
  }

  return `Session visible: ${session.actorLabel}. Cette vue de tarification reste reservee a l ADMIN_SYSTEME_ECOLE.`;
});

function lireParametreTexte(valeur: unknown): string | undefined {
  return typeof valeur === 'string' && valeur.trim().length > 0 ? valeur.trim() : undefined;
}

function lireIdAnneeScolaire(): string | undefined {
  return lireParametreTexte(route.query.idAnneeScolaire)
    ?? lireParametreTexte(import.meta.env.VITE_REFERENTIEL_ANNEE_SCOLAIRE_ID);
}

function lireFiltres(): TarificationListFilters | null {
  const idAnneeScolaire = schoolYearId.value;

  if (!idAnneeScolaire) {
    return null;
  }

  return {
    idAnneeScolaire,
    typeFrais: selectedTypeFrais.value === '' ? undefined : selectedTypeFrais.value as TarificationListFilters['typeFrais'],
    actif:
      selectedActif.value === ''
        ? undefined
        : selectedActif.value === 'true',
  };
}

function labelTypeFrais(typeFrais: string): string {
  return tarificationFeeTypeOptions.find((option) => option.value === typeFrais)?.label ?? typeFrais;
}

function formatCurrency(value: number, devise: string): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} ${devise}`;
}

async function chargerDepuisFiltres(): Promise<void> {
  const filtres = lireFiltres();

  if (!filtres || !isAuthorized.value) {
    tarificationStore.reinitialiser();
    return;
  }

  await tarificationStore.charger(filtres);
}

function selectGrid(idGrille: string): void {
  if (!schoolYearId.value) {
    return;
  }
  tarificationStore.selectionner(idGrille, schoolYearId.value);
}

function prepareCreate(): void {
  if (!schoolYearId.value) {
    return;
  }
  tarificationStore.preparerCreation(schoolYearId.value);
}

async function saveGrid(): Promise<void> {
  await tarificationStore.enregistrer();
}

async function disableGrid(): Promise<void> {
  await tarificationStore.desactiver();
}

async function reload(): Promise<void> {
  await chargerDepuisFiltres();
}

watch(
  () => [route.fullPath, selectedTypeFrais.value, selectedActif.value],
  async () => {
    await chargerDepuisFiltres();
  },
  { immediate: false },
);

onMounted(async () => {
  await chargerDepuisFiltres();
});
</script>
