<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-009"
      title="Exonérations"
      description="Mutation réelle pour accorder une exonération et annuler une exonération existante dans le bon périmètre."
    >
      <template #actions>
        <RouterLink class="module-quick-access__pill module-quick-access__pill--action" to="/app/finances">
          <ArrowLeft />
          <span>Retour finances</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock
      title="Cadre d'autorisation visible"
      description="Le frontend montre la doctrine d'acteurs réelle, mais la décision finale reste toujours contrôlée par le backend."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <BadgePercent />
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
          <ContextBadge label="Section active" :value="context.sectionName" />
        </div>
      </div>
      <div class="finance-info-banner">
        <ShieldCheck />
        <p class="finance-form-note">
          {{ perimeterMessage }}
        </p>
      </div>
    </SectionBlock>

    <AccessBoundary capability="module.finances.access">
      <template v-if="uiState === 'loading-student' || uiState === 'submitting'">
        <LoadingState
          :title="uiState === 'submitting' ? 'Mutation d exonération en cours' : 'Chargement de la cible d exonération'"
          :message="uiState === 'submitting'
            ? 'Application de la décision d exonération ou de son annulation.'
            : 'Lecture de l élève cible et de ses obligations financières restantes.'"
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Exonération non autorisée"
          message="Cette mutation est réservée aux acteurs réels d exonération dans leur bon périmètre."
        />

        <template v-else>
          <div class="finance-form-grid">
            <SectionBlock
              title="Sélection élève"
              description="Identifier l élève avant d ouvrir les obligations réellement exonérables."
            >
              <div class="finance-form-stack">
                <label class="finance-field">
                  <span>Id élève</span>
                  <input v-model="studentIdInput" type="text" placeholder="Ex: ELEVE-001" />
                </label>

                <div class="finance-form-actions">
                  <button class="finance-primary-action" type="button" @click="verifyStudent">
                    <Search />
                    <span>Vérifier l élève</span>
                  </button>
                </div>

                <ErrorState
                  v-if="uiState === 'missing-student'"
                  title="Elève cible manquant"
                  message="Renseignez un idEleve réel avant de préparer une exonération."
                />

                <ErrorState
                  v-else-if="uiState === 'technical-error'"
                  title="Lecture technique indisponible"
                  :message="technicalErrorMessage"
                />

                <div v-if="profile" class="finance-student-banner finance-student-banner--profile">
                  <div>
                    <small>Code élève</small>
                    <strong>{{ profile.matricule }}</strong>
                  </div>
                  <div>
                    <small>Elève</small>
                    <strong>{{ profile.fullName }}</strong>
                  </div>
                  <div>
                    <small>Classe</small>
                    <strong>{{ profile.classe }}</strong>
                  </div>
                  <div>
                    <small>Section</small>
                    <strong>{{ profile.section }}</strong>
                  </div>
                  <div>
                    <small>Année scolaire</small>
                    <strong>{{ profile.anneeScolaire }}</strong>
                  </div>
                  <div>
                    <small>Dette globale</small>
                    <strong>{{ formatCurrency(profile.totalDette) }}</strong>
                  </div>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Obligations éligibles"
              description="Le backend d exonération travaille par idObligation. Le frontend n affiche donc que les lignes réellement dues."
            >
              <template v-if="profile && eligibleObligations.length > 0">
                <div class="finance-obligation-list">
                  <button
                    v-for="obligation in eligibleObligations"
                    :key="obligation.id"
                    type="button"
                    class="finance-obligation-card"
                    :class="{ 'finance-obligation-card--active': selectedObligation?.id === obligation.id }"
                    @click="pickObligation(obligation.id)"
                  >
                    <div class="finance-obligation-card__body">
                      <div class="finance-obligation-card__marker">
                        <BadgePercent />
                      </div>
                      <strong>{{ obligation.libelle }}</strong>
                      <small>{{ obligation.typeFrais }} | {{ obligation.periode }}</small>
                    </div>
                    <div class="finance-obligation-card__meta">
                      <span>{{ formatCurrency(obligation.reste) }}</span>
                      <small>
                        exonéré actuel: {{ formatCurrency(obligation.montantAttendu - obligation.montantPaye - obligation.reste) }}
                      </small>
                    </div>
                  </button>
                </div>
              </template>

              <EmptyState
                v-else-if="profile && eligibleObligations.length === 0"
                title="Aucune obligation exonérable"
                message="Aucune obligation avec reste à payer n est actuellement visible pour cet élève."
              />

              <LoadingState
                v-else
                title="Contexte élève attendu"
                message="Vérifier un élève pour charger ses obligations financières."
              />
            </SectionBlock>
          </div>

          <div class="finance-form-grid">
            <SectionBlock
              title="Accorder une exonération"
              description="Cette action appelle directement POST /api/exonerations avec l id élève et l id obligation."
            >
              <div class="finance-form-stack">
                <label class="finance-field">
                  <span>Obligation cible</span>
                  <select v-model="selectedObligationId">
                    <option value="">Choisir une obligation</option>
                    <option
                      v-for="obligation in eligibleObligations"
                      :key="obligation.id"
                      :value="obligation.id"
                    >
                      {{ obligation.libelle }} | {{ formatCurrency(obligation.reste) }}
                    </option>
                  </select>
                </label>

                <label class="finance-field">
                  <span>Type d exonération</span>
                  <select v-model="typeExoneration">
                    <option value="">Choisir un type</option>
                    <option v-for="option in exonerationTypeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </label>

                <label class="finance-field">
                  <span>Montant à exonérer</span>
                  <input v-model="amountInput" type="number" min="0" step="1000" />
                </label>

                <label class="finance-field">
                  <span>Motif</span>
                  <input v-model="reasonInput" type="text" placeholder="Motif métier réel" />
                </label>

                <div class="finance-form-actions">
                  <button class="finance-primary-action" type="button" @click="grantExoneration">
                    <BadgePercent />
                    <span>Accorder l exonération</span>
                  </button>
                </div>

                <ErrorState
                  v-if="uiState === 'missing-form'"
                  title="Formulaire incomplet"
                  message="Sélectionnez une obligation, un type, un montant et un motif avant de soumettre."
                />

                <div v-else-if="result && result.statut !== 'ANNULEE'" class="finance-success-panel">
                  <div class="finance-success-panel__icon">
                    <CircleCheckBig />
                  </div>
                  <strong>Exonération enregistrée</strong>
                  <p>
                    Exonération {{ result.idExoneration }} accordée pour {{ formatCurrency(result.montantExonere) }}
                    sur l obligation {{ result.idObligation }}.
                  </p>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Annuler une exonération"
              description="Le backend annule par idExoneration. S il n existe pas encore de lecture dédiée, cet identifiant doit être fourni explicitement."
            >
              <div class="finance-form-stack">
                <label class="finance-field">
                  <span>Id exonération</span>
                  <input v-model="cancelExonerationIdInput" type="text" placeholder="Ex: EXO-001" />
                </label>

                <div class="finance-form-actions">
                  <button class="finance-secondary-action" type="button" @click="cancelExoneration">
                    <Undo2 />
                    <span>Annuler l exonération</span>
                  </button>
                </div>

                <div v-if="result && result.statut === 'ANNULEE'" class="finance-success-panel">
                  <div class="finance-success-panel__icon">
                    <CircleCheckBig />
                  </div>
                  <strong>Exonération annulée</strong>
                  <p>
                    Exonération {{ result.idExoneration }} annulée. L obligation {{ result.idObligation }}
                    a été restaurée côté backend.
                  </p>
                </div>

                <div class="finance-guard-panel">
                  <div class="finance-guard-panel__header">
                    <ShieldCheck />
                    <strong>Restrictions visibles</strong>
                  </div>
                  <ul>
                    <li>`ADMINISTRATEUR_ECOLE`, `GESTIONNAIRE_ORGANISATION` et `PROMOTEUR_ORGANISATION` sont des acteurs positifs réels.</li>
                    <li>`SECRETAIRE` n est acteur qu en cas de délégation locale explicite côté backend.</li>
                    <li>Le backend actuel ne fournit pas encore une route de journal d exonérations au frontend.</li>
                  </ul>
                </div>
              </div>
            </SectionBlock>
          </div>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import {
  ArrowLeft,
  BadgePercent,
  CircleCheckBig,
  Search,
  ShieldCheck,
  Undo2,
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
import { activeContextStore } from '../../../shared/session/active-context.store';
import { sessionStore } from '../../../shared/auth/session.store';
import {
  authorizedExonerationActors,
  exonerationTypeOptions,
} from '../models/exoneration.model';
import { useExonerationStore } from '../stores/exoneration.store';
import { useStudentFinancialSituationStore } from '../stores/student-financial-situation.store';

type ExonerationUiState =
  | 'idle'
  | 'loading-student'
  | 'submitting'
  | 'missing-student'
  | 'missing-form'
  | 'technical-error';

const route = useRoute();
const context = activeContextStore.state;
const session = sessionStore.state;
const studentSituationStore = useStudentFinancialSituationStore();
const exonerationStore = useExonerationStore();

const studentIdInput = ref(typeof route.query.idEleve === 'string' ? route.query.idEleve : '');
const selectedObligationId = ref('');
const typeExoneration = ref('');
const amountInput = ref('');
const reasonInput = ref('');
const cancelExonerationIdInput = ref('');
const uiState = ref<ExonerationUiState>('idle');

const isAuthorized = computed(() =>
  authorizedExonerationActors.includes(session.actorCode as never),
);
const profile = computed(() => studentSituationStore.state.profile);
const obligations = computed(() => studentSituationStore.state.profile?.obligations ?? []);
const eligibleObligations = computed(() =>
  obligations.value.filter((obligation) => obligation.reste > 0),
);
const selectedObligation = computed(() =>
  eligibleObligations.value.find((obligation) => obligation.id === selectedObligationId.value) ?? null,
);
const result = computed(() => exonerationStore.state.result);
const technicalErrorMessage = computed(() =>
  exonerationStore.state.errorMessage
  ?? studentSituationStore.state.errorMessage
  ?? 'Le backend n a pas pu terminer cette action d exonération.',
);

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'GESTIONNAIRE_ORGANISATION':
    case 'PROMOTEUR_ORGANISATION':
      return `Mutation bornée à l organisation active: ${context.organizationName}.`;
    case 'SECRETAIRE':
      return 'Mutation bornée par délégation locale explicite de l école, sans pouvoir global d exonération.';
    case 'ADMINISTRATEUR_ECOLE':
      return `Mutation bornée à l école active: ${context.schoolName}.`;
    default:
      return `Session visible: ${session.actorLabel}. Cette mutation n est pas ouverte à cet acteur.`;
  }
});

function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FC`;
}

async function verifyStudent(): Promise<void> {
  exonerationStore.reinitialiser();

  if (studentIdInput.value.trim().length === 0) {
    uiState.value = 'missing-student';
    studentSituationStore.reinitialiser();
    return;
  }

  uiState.value = 'loading-student';

  await studentSituationStore.charger({
    idEleve: studentIdInput.value.trim(),
    anneeScolaire: context.schoolYearLabel,
    section: context.sectionName,
  });

  if (studentSituationStore.state.status === 'error') {
    uiState.value = 'technical-error';
    return;
  }

  selectedObligationId.value = '';
  uiState.value = 'idle';
}

function pickObligation(idObligation: string): void {
  selectedObligationId.value = idObligation;
}

async function grantExoneration(): Promise<void> {
  exonerationStore.reinitialiser();

  if (
    studentIdInput.value.trim().length === 0
    || selectedObligationId.value.trim().length === 0
    || typeExoneration.value.trim().length === 0
    || amountInput.value.trim().length === 0
    || reasonInput.value.trim().length === 0
  ) {
    uiState.value = 'missing-form';
    return;
  }

  uiState.value = 'submitting';

  await exonerationStore.accorder({
    idEleve: studentIdInput.value.trim(),
    idObligation: selectedObligationId.value,
    typeExoneration: typeExoneration.value as never,
    montantExonere: {
      montant: Number(amountInput.value),
      devise: 'CDF',
    },
    raison: reasonInput.value.trim(),
  });

  if (exonerationStore.state.status === 'error') {
    uiState.value = 'technical-error';
    return;
  }

  cancelExonerationIdInput.value = exonerationStore.state.result?.idExoneration ?? cancelExonerationIdInput.value;
  await verifyStudent();
}

async function cancelExoneration(): Promise<void> {
  exonerationStore.reinitialiser();

  if (cancelExonerationIdInput.value.trim().length === 0) {
    uiState.value = 'missing-form';
    return;
  }

  uiState.value = 'submitting';

  await exonerationStore.annuler({
    idExoneration: cancelExonerationIdInput.value.trim(),
  });

  if (exonerationStore.state.status === 'error') {
    uiState.value = 'technical-error';
    return;
  }

  if (studentIdInput.value.trim().length > 0) {
    await verifyStudent();
    return;
  }

  uiState.value = 'idle';
}
</script>
