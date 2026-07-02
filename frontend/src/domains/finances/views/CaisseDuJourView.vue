<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-004"
      title="Caisse du jour"
      description="Lecture synthétique de la caisse journalière réellement exposée par le backend, dans le bon périmètre."
    >
      <template #actions>
        <RouterLink class="module-quick-access__pill module-quick-access__pill--action" to="/app/finances">
          <ArrowLeft />
          <span>Retour finances</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock
      title="Cadre d'accès visible"
      description="Cet écran reste purement consultatif. Les ouvertures, clôtures et paiements restent sur leurs workflows dédiés."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <WalletCards />
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

    <AccessBoundary page-code="PF-05">
      <template v-if="uiState === 'loading'">
        <LoadingState
          title="Chargement de la caisse du jour"
          message="Lecture de la synthèse journalière réelle pour la date choisie."
        />
      </template>

      <template v-else-if="uiState === 'technical-error'">
        <ErrorState
          title="Caisse du jour indisponible"
          :message="technicalErrorMessage"
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Lecture non autorisée"
          message="Cette vue est réservée au caissier, à l'administrateur école et aux acteurs organisationnels autorisés."
        />

        <template v-else-if="cashDay">
          <SectionBlock
            title="Filtre journalier"
            description="La date pilote la lecture. Le backend restitue une synthèse consolidée de la caisse demandée."
          >
            <div class="finance-form-stack">
              <div class="finance-filter-grid finance-filter-grid--wide">
                <label class="finance-field">
                  <span>Date</span>
                  <input v-model="selectedDate" type="date" />
                </label>
              </div>

              <div class="finance-guard-panel">
                <div class="finance-guard-panel__header">
                  <ShieldCheck />
                  <strong>Règles visibles</strong>
                </div>
                <ul>
                  <li>`CAISSIER` et `ADMINISTRATEUR_ECOLE` lisent dans la même école.</li>
                  <li>`GESTIONNAIRE_ORGANISATION` et `PROMOTEUR_ORGANISATION` lisent dans la même organisation.</li>
                  <li>Cette route expose une synthèse de caisse, pas la liste détaillée des opérations individuelles.</li>
                </ul>
              </div>
            </div>
          </SectionBlock>

          <div class="finance-kpi-grid finance-kpi-grid--detail">
            <div class="finance-kpi-card">
              <small>Statut</small>
              <strong>{{ cashDay.status }}</strong>
              <span>{{ cashDay.dateLabel }}</span>
            </div>
            <div class="finance-kpi-card">
              <small>Total encaissé</small>
              <strong>{{ formatCurrency(cashDay.totalEncaisse) }}</strong>
              <span>Montant consolidé du jour</span>
            </div>
            <div class="finance-kpi-card">
              <small>Disponible réel</small>
              <strong>{{ formatCurrency(cashDay.disponibleReel) }}</strong>
              <span>Solde journalier exploitable</span>
            </div>
            <div class="finance-kpi-card">
              <small>Poste de caisse</small>
              <strong>{{ cashDay.cashDeskLabel }}</strong>
              <span>{{ accessScopeLabel }}</span>
            </div>
          </div>

          <div class="finance-summary-grid finance-summary-grid--quad">
            <div>
              <small>Espèces</small>
              <strong>{{ formatCurrency(cashDay.totalCash) }}</strong>
            </div>
            <div>
              <small>Mobile Money</small>
              <strong>{{ formatCurrency(cashDay.totalMobileMoney) }}</strong>
            </div>
            <div>
              <small>Fonds anticipés</small>
              <strong>{{ formatCurrency(cashDay.totalFondsAnticipes) }}</strong>
            </div>
            <div>
              <small>Fonds consommés</small>
              <strong>{{ formatCurrency(cashDay.totalFondsConsommes) }}</strong>
            </div>
          </div>

          <div class="finance-form-grid">
            <SectionBlock
              title="Ventilation par caissier"
              description="Répartition journalière réellement fournie par le backend."
            >
              <EmptyState
                v-if="cashDay.totalsByCashier.length === 0"
                title="Aucune ventilation caissier"
                message="Le backend n'a retourné aucune ligne de répartition par caissier pour cette date."
              />

              <div v-else class="finance-list-card">
                <div
                  v-for="line in cashDay.totalsByCashier"
                  :key="line.cashierId"
                  class="finance-list-card__row"
                >
                  <div>
                    <strong>{{ line.cashierLabel }}</strong>
                    <small>{{ line.cashierId }}</small>
                  </div>
                  <strong>{{ formatCurrency(line.total) }}</strong>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Ventilation par type de frais"
              description="Répartition des encaissements selon les types réellement exposés par la route de caisse."
            >
              <EmptyState
                v-if="cashDay.totalsByFeeType.length === 0"
                title="Aucune ventilation type de frais"
                message="Le backend n'a retourné aucune ligne de répartition par type de frais pour cette date."
              />

              <div v-else class="finance-list-card">
                <div
                  v-for="line in cashDay.totalsByFeeType"
                  :key="line.feeType"
                  class="finance-list-card__row"
                >
                  <div>
                    <strong>{{ line.feeType }}</strong>
                    <small>Encaissement consolidé</small>
                  </div>
                  <strong>{{ formatCurrency(line.total) }}</strong>
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
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, ShieldCheck, WalletCards } from 'lucide-vue-next';
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
import { useCashDayStore } from '../stores/cash-day.store';

const context = activeContextStore.state;
const session = sessionStore.state;
const cashDayStore = useCashDayStore();
const doctrineAccess = useDoctrineAccess();
const selectedDate = ref(new Date().toISOString().slice(0, 10));

const isAuthorized = computed(() => doctrineAccess.canAccessPage('PF-05'));
const cashDay = computed(() => cashDayStore.state.cashDay);
const technicalErrorMessage = computed(() =>
  cashDayStore.state.errorMessage
  ?? 'Le backend n a pas pu restituer la caisse du jour.',
);
const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
  if (cashDayStore.state.status === 'loading') {
    return 'loading';
  }

  if (cashDayStore.state.status === 'error') {
    return 'technical-error';
  }

  return 'idle';
});

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'CAISSIER':
    case 'ADMINISTRATEUR_ECOLE':
      return `Lecture de caisse bornée à l école active: ${context.schoolName}.`;
    case 'GESTIONNAIRE_ORGANISATION':
    case 'PROMOTEUR_ORGANISATION':
      return `Lecture de caisse bornée à l organisation active: ${context.organizationName}.`;
    default:
      return `Session visible: ${session.actorLabel}. Cette vue n est pas ouverte à cet acteur.`;
  }
});

const accessScopeLabel = computed(() => {
  if (session.actorCode === 'GESTIONNAIRE_ORGANISATION' || session.actorCode === 'PROMOTEUR_ORGANISATION') {
    return 'Lecture organisationnelle';
  }

  return 'Lecture école active';
});

function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FC`;
}

watch(
  () => [selectedDate.value, isAuthorized.value],
  async () => {
    if (!isAuthorized.value) {
      cashDayStore.reinitialiser();
      return;
    }

    await cashDayStore.charger(selectedDate.value);
  },
  { immediate: true },
);
</script>
