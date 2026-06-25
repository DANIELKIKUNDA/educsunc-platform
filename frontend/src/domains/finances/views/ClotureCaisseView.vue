<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-003"
      title="Cloture de caisse"
      description="Workflow strictement reserve au caissier local pour cloturer la caisse du jour apres verification du resume d'encaissements."
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
      description="Le frontend rappelle clairement que la cloture de caisse reste un workflow local et strictement borne."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <Vault />
          </div>
          <div>
            <p class="finance-hero-strip__label">Acteur attendu</p>
            <strong>Caissier</strong>
          </div>
        </div>
        <div class="module-home-grid">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Organisation" :value="context.organizationName" />
          <ContextBadge label="Ecole" :value="context.schoolName" />
          <ContextBadge label="Annee scolaire" :value="context.schoolYearLabel" />
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
      <template v-if="effectiveState === 'loading'">
        <LoadingState
          title="Preparation de la cloture"
          message="Verification de l'etat de la caisse du jour et de la synthese d'encaissements."
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="effectiveState === 'not-authorized'"
          title="Cloture interdite"
          message="Seul le caissier actif dans la bonne ecole peut cloturer la caisse du jour."
        />

        <div class="finance-kpi-grid">
          <div class="finance-kpi-card">
            <small>Etat du jour</small>
            <strong>{{ cashClosing.status }}</strong>
            <span>{{ cashClosing.dateLabel }}</span>
          </div>
          <div class="finance-kpi-card">
            <small>Encaissements du jour</small>
            <strong>{{ formatCurrency(cashClosing.totalCollected) }}</strong>
            <span>{{ cashClosing.operationsCount }} operations</span>
          </div>
          <div class="finance-kpi-card">
            <small>Fenetre de cloture</small>
            <strong>{{ cashClosing.closingWindowLabel }}</strong>
            <span>Meme organisation, meme ecole</span>
          </div>
        </div>

        <div class="finance-form-grid">
          <SectionBlock
            title="Etat de la caisse du jour"
            description="La cloture ne doit partir que d'une caisse deja ouverte."
          >
            <div class="finance-summary-grid">
              <div>
                <small>Date du jour</small>
                <strong>{{ cashClosing.dateLabel }}</strong>
              </div>
              <div>
                <small>Statut</small>
                <strong>{{ cashClosing.status }}</strong>
              </div>
              <div>
                <small>Ouverte a</small>
                <strong>{{ cashClosing.openedAtLabel ?? 'Non disponible' }}</strong>
              </div>
              <div>
                <small>Ouverte par</small>
                <strong>{{ cashClosing.openedByLabel ?? 'Non disponible' }}</strong>
              </div>
            </div>

            <div class="finance-status-strip" :class="financeStatusClass">
              <component :is="financeStatusIcon" />
              <div>
                <strong>{{ financeStatusTitle }}</strong>
                <p>{{ financeStatusMessage }}</p>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock
            title="Resume des encaissements"
            description="Le caissier relit la synthese du jour avant de verrouiller la caisse."
          >
            <div class="finance-summary-grid">
              <div>
                <small>Operations</small>
                <strong>{{ cashClosing.operationsCount }}</strong>
              </div>
              <div>
                <small>Recus emis</small>
                <strong>{{ cashClosing.receiptsCount }}</strong>
              </div>
              <div>
                <small>Especes</small>
                <strong>{{ formatCurrency(cashClosing.cashAmount) }}</strong>
              </div>
              <div>
                <small>Mobile Money</small>
                <strong>{{ formatCurrency(cashClosing.mobileMoneyAmount) }}</strong>
              </div>
              <div>
                <small>Virement</small>
                <strong>{{ formatCurrency(cashClosing.transferAmount) }}</strong>
              </div>
              <div>
                <small>Total collecte</small>
                <strong>{{ formatCurrency(cashClosing.totalCollected) }}</strong>
              </div>
            </div>
          </SectionBlock>
        </div>

        <SectionBlock
          title="Confirmation de cloture"
          description="Une seule action visible pour cloturer la caisse du jour apres verification du resume."
        >
          <div class="finance-form-stack">
            <div class="finance-confirmation-card">
              <div class="finance-confirmation-card__row">
                <span>Acteur courant</span>
                <strong>{{ session.displayName }} ({{ session.actorCode }})</strong>
              </div>
              <div class="finance-confirmation-card__row">
                <span>Poste de caisse</span>
                <strong>{{ cashClosing.schoolCashDeskLabel }}</strong>
              </div>
              <div class="finance-confirmation-card__row">
                <span>Montant total du jour</span>
                <strong>{{ formatCurrency(cashClosing.totalCollected) }}</strong>
              </div>
              <div class="finance-confirmation-card__row">
                <span>Fenetre recommandee</span>
                <strong>{{ cashClosing.closingWindowLabel }}</strong>
              </div>
            </div>

            <div class="finance-form-actions">
              <button
                class="finance-primary-action"
                type="button"
                :disabled="effectiveState === 'cash-not-open' || effectiveState === 'not-authorized' || effectiveState === 'success'"
                @click="closeCashRegister"
              >
                <Lock />
                <span>Cloturer la caisse</span>
              </button>
            </div>

            <div v-if="effectiveState === 'success'" class="finance-success-panel">
              <div class="finance-success-panel__icon">
                <CircleCheckBig />
              </div>
              <strong>Cloture enregistree</strong>
              <p>
                La caisse du {{ cashClosing.dateLabel }} est maintenant cloturee pour
                {{ context.schoolName }}.
              </p>
            </div>

            <ErrorState
              v-else-if="effectiveState === 'technical-error'"
              title="Erreur technique"
              message="La cloture n'a pas pu etre finalisee dans cette simulation de socle."
            />

            <div class="finance-guard-panel">
              <div class="finance-guard-panel__header">
                <ShieldCheck />
                <strong>Restrictions visibles</strong>
              </div>
              <ul>
                <li>Cloture reservee au seul acteur `CAISSIER`.</li>
                <li>Cloture possible uniquement si la caisse du jour est deja ouverte.</li>
                <li>`ADMINISTRATEUR_ECOLE` ne peut jamais cloturer implicitement la caisse.</li>
              </ul>
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
import {
  ArrowLeft,
  CircleCheckBig,
  CircleDollarSign,
  Lock,
  LockKeyhole,
  ShieldCheck,
  Vault,
} from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { sessionStore } from '../../../shared/auth/session.store';
import { dailyCashClosingSummary } from '../data/cloture-caisse.demo';

type CashClosingUiState =
  | 'idle'
  | 'loading'
  | 'cash-not-open'
  | 'not-authorized'
  | 'success'
  | 'technical-error';

const context = activeContextStore.state;
const session = sessionStore.state;
const cashClosing = ref({ ...dailyCashClosingSummary });
const uiState = ref<CashClosingUiState>('idle');

const isAuthorized = computed(() => session.actorCode === 'CAISSIER');

const effectiveState = computed<CashClosingUiState>(() => {
  if (uiState.value === 'loading') {
    return 'loading';
  }

  if (!isAuthorized.value) {
    return 'not-authorized';
  }

  if (uiState.value === 'success') {
    return 'success';
  }

  if (uiState.value === 'technical-error') {
    return 'technical-error';
  }

  if (cashClosing.value.status !== 'OUVERTE') {
    return 'cash-not-open';
  }

  return 'idle';
});

const perimeterMessage = computed(() => {
  if (isAuthorized.value) {
    return `Session locale conforme: ${session.actorLabel} actif sur ${context.schoolName}, ${context.organizationName}.`;
  }

  return `Session visible: ${session.actorLabel}. Le workflow exige explicitement un CAISSIER actif dans la bonne ecole avant toute cloture.`;
});

const financeStatusClass = computed(() => {
  switch (effectiveState.value) {
    case 'success':
      return 'finance-status-strip--success';
    case 'cash-not-open':
    case 'technical-error':
      return 'finance-status-strip--error';
    default:
      return 'finance-status-strip--neutral';
  }
});

const financeStatusIcon = computed(() => {
  switch (effectiveState.value) {
    case 'success':
      return CircleDollarSign;
    case 'cash-not-open':
    case 'technical-error':
      return LockKeyhole;
    default:
      return Vault;
  }
});

const financeStatusTitle = computed(() => {
  switch (effectiveState.value) {
    case 'cash-not-open':
      return 'Caisse non ouverte';
    case 'success':
      return 'Caisse cloturee avec succes';
    case 'technical-error':
      return 'Cloture interrompue';
    default:
      return 'Caisse prete a etre cloturee';
  }
});

const financeStatusMessage = computed(() => {
  switch (effectiveState.value) {
    case 'cash-not-open':
      return 'La cloture reste impossible tant que la caisse du jour n a pas ete ouverte.';
    case 'success':
      return `Cloture enregistree pour ${cashClosing.value.schoolCashDeskLabel} avec un total de ${formatCurrency(cashClosing.value.totalCollected)}.`;
    case 'technical-error':
      return 'Le poste de caisse doit etre reverifie avant toute nouvelle tentative de cloture.';
    default:
      return 'Le resume du jour est disponible. Une seule confirmation suffit pour cloturer la caisse.';
  }
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' FC';
}

async function closeCashRegister(): Promise<void> {
  if (!isAuthorized.value) {
    uiState.value = 'not-authorized';
    return;
  }

  if (cashClosing.value.status !== 'OUVERTE') {
    uiState.value = 'cash-not-open';
    return;
  }

  uiState.value = 'loading';

  await new Promise((resolve) => window.setTimeout(resolve, 450));

  cashClosing.value = {
    ...cashClosing.value,
    status: 'FERMEE',
  };
  uiState.value = 'success';
}
</script>
