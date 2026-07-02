<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-002"
      title="Ouverture de caisse"
      description="Workflow strictement reserve au caissier local pour ouvrir la caisse du jour dans le bon perimetre."
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
      description="Le frontend montre clairement le bon acteur et le bon perimetre avant toute mutation caisse."
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

    <AccessBoundary page-code="PF-02">
      <template v-if="effectiveState === 'loading'">
        <LoadingState
          title="Preparation de la caisse"
          message="Verification du statut reel de la caisse du jour et du perimetre local."
        />
      </template>

      <template v-else-if="effectiveState === 'technical-error'">
        <ErrorState
          title="Lecture technique indisponible"
          :message="technicalErrorMessage"
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="effectiveState === 'not-authorized'"
          title="Ouverture interdite"
          message="Seul le caissier actif dans la meme organisation et la meme ecole peut ouvrir la caisse du jour."
        />

        <template v-else-if="cashRegister">
          <div class="finance-kpi-grid">
            <div class="finance-kpi-card">
              <small>Etat du jour</small>
              <strong>{{ cashRegister.status }}</strong>
              <span>{{ cashRegister.dateLabel }}</span>
            </div>
            <div class="finance-kpi-card">
              <small>Poste de caisse</small>
              <strong>{{ cashRegister.cashDeskLabel }}</strong>
              <span>{{ context.schoolName }}</span>
            </div>
            <div class="finance-kpi-card">
              <small>Disponible reel</small>
              <strong>{{ formatCurrency(cashRegister.disponibleReel) }}</strong>
              <span>Etat renvoye par le backend</span>
            </div>
          </div>

          <div class="finance-form-grid">
            <SectionBlock
              title="Etat de la caisse du jour"
              description="Lecture simple et immediate avant l'action d'ouverture."
            >
              <div class="finance-summary-grid">
                <div>
                  <small>Date du jour</small>
                  <strong>{{ cashRegister.dateLabel }}</strong>
                </div>
                <div>
                  <small>Statut</small>
                  <strong>{{ cashRegister.status }}</strong>
                </div>
                <div>
                  <small>Id caisse</small>
                  <strong>{{ cashRegister.id }}</strong>
                </div>
                <div>
                  <small>Total encaisse</small>
                  <strong>{{ formatCurrency(cashRegister.totalEncaisse) }}</strong>
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
              title="Confirmation d'ouverture"
              description="Une seule action visible, sans ambiguite, pour confirmer l'ouverture de la caisse."
            >
              <div class="finance-form-stack">
                <div class="finance-confirmation-card">
                  <div class="finance-confirmation-card__row">
                    <span>Acteur courant</span>
                    <strong>{{ session.displayName }} ({{ session.actorCode }})</strong>
                  </div>
                  <div class="finance-confirmation-card__row">
                    <span>Ecole cible</span>
                    <strong>{{ context.schoolName }}</strong>
                  </div>
                  <div class="finance-confirmation-card__row">
                    <span>Poste de caisse</span>
                    <strong>{{ cashRegister.cashDeskLabel }}</strong>
                  </div>
                  <div class="finance-confirmation-card__row">
                    <span>Date backend</span>
                    <strong>{{ cashRegister.date }}</strong>
                  </div>
                </div>

                <div class="finance-form-actions">
                  <button
                    v-if="canOpenCash"
                    class="finance-primary-action"
                    type="button"
                    :disabled="effectiveState === 'already-open'"
                    @click="openCashRegister"
                  >
                    <LockKeyholeOpen />
                    <span>Ouvrir la caisse</span>
                  </button>
                </div>

                <div v-if="effectiveState === 'success'" class="finance-success-panel">
                  <div class="finance-success-panel__icon">
                    <CircleCheckBig />
                  </div>
                  <strong>Ouverture enregistree</strong>
                  <p>
                    La caisse du {{ cashRegister.dateLabel }} est maintenant ouverte pour
                    {{ context.schoolName }}.
                  </p>
                </div>

                <div class="finance-guard-panel">
                  <div class="finance-guard-panel__header">
                    <ShieldCheck />
                    <strong>Restrictions visibles</strong>
                  </div>
                  <ul>
                    <li>Ouverture reservee au seul acteur `CAISSIER`.</li>
                    <li>Mutation limitee a la meme organisation et a la meme ecole.</li>
                    <li>`ADMINISTRATEUR_ECOLE` et acteurs pedagogiques ne voient aucune mutation caisse.</li>
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
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import {
  ArrowLeft,
  CircleCheckBig,
  CircleDollarSign,
  LockKeyhole,
  LockKeyholeOpen,
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
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { useCashOpeningStore } from '../stores/cash-opening.store';

const context = activeContextStore.state;
const session = sessionStore.state;
const cashOpeningStore = useCashOpeningStore();
const doctrineAccess = useDoctrineAccess();

const cashRegister = computed(() => cashOpeningStore.state.cashDay);
const isAuthorized = computed(() => doctrineAccess.canAccessPage('PF-02'));
const canOpenCash = computed(() => doctrineAccess.canUseAction('finances.cash.open', 'PF-02'));
const technicalErrorMessage = computed(() =>
  cashOpeningStore.state.errorMessage
  ?? 'L ouverture de caisse n a pas pu etre finalisee.',
);

const effectiveState = computed<'loading' | 'already-open' | 'not-authorized' | 'success' | 'technical-error' | 'idle'>(() => {
  if (cashOpeningStore.state.status === 'loading' || cashOpeningStore.state.status === 'opening') {
    return 'loading';
  }

  if (!isAuthorized.value) {
    return 'not-authorized';
  }

  if (cashOpeningStore.state.status === 'error') {
    return 'technical-error';
  }

  if (cashOpeningStore.state.status === 'opened') {
    return 'success';
  }

  if (cashRegister.value?.status === 'OUVERTE') {
    return 'already-open';
  }

  return 'idle';
});

const perimeterMessage = computed(() => {
  if (isAuthorized.value) {
    return `Session locale conforme: ${session.actorLabel} actif sur ${context.schoolName}, ${context.organizationName}.`;
  }

  return `Session visible: ${session.actorLabel}. Le workflow exige explicitement un CAISSIER actif dans la meme organisation et la meme ecole.`;
});

const financeStatusClass = computed(() => {
  switch (effectiveState.value) {
    case 'success':
    case 'already-open':
      return 'finance-status-strip--success';
    case 'technical-error':
      return 'finance-status-strip--error';
    default:
      return 'finance-status-strip--neutral';
  }
});

const financeStatusIcon = computed(() => {
  switch (effectiveState.value) {
    case 'success':
    case 'already-open':
      return CircleDollarSign;
    case 'technical-error':
      return LockKeyhole;
    default:
      return Vault;
  }
});

const financeStatusTitle = computed(() => {
  switch (effectiveState.value) {
    case 'already-open':
      return 'Caisse deja ouverte';
    case 'success':
      return 'Caisse ouverte avec succes';
    case 'technical-error':
      return 'Ouverture interrompue';
    default:
      return 'Caisse prete a etre ouverte';
  }
});

const financeStatusMessage = computed(() => {
  switch (effectiveState.value) {
    case 'already-open':
      return 'Aucune nouvelle ouverture ne doit etre creee tant que la caisse du jour reste ouverte.';
    case 'success':
      return `Ouverture enregistree sur la caisse ${cashRegister.value?.id}.`;
    case 'technical-error':
      return 'Le poste de caisse doit etre reverifie avant toute nouvelle tentative.';
    default:
      return 'Le statut du jour est ferme. Une seule confirmation suffit pour ouvrir la caisse.';
  }
});

function lireDateJourIso(): string {
  const maintenant = new Date();
  const annee = maintenant.getFullYear();
  const mois = String(maintenant.getMonth() + 1).padStart(2, '0');
  const jour = String(maintenant.getDate()).padStart(2, '0');
  return `${annee}-${mois}-${jour}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' FC';
}

async function openCashRegister(): Promise<void> {
  if (!isAuthorized.value) {
    return;
  }

  await cashOpeningStore.ouvrir(lireDateJourIso());
}

onMounted(async () => {
  if (!isAuthorized.value) {
    cashOpeningStore.reinitialiser();
    return;
  }

  await cashOpeningStore.charger(lireDateJourIso());
});
</script>
