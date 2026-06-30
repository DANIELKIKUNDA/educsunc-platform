<template>
  <PageContainer>
    <PageHeader
      eyebrow="WF-PF-08"
      title="Restitution d'excedent"
      description="Workflow metier pour restituer un excedent de paiement dans le bon perimetre organisation, ecole et section si la delegation l'exige."
    >
      <template #actions>
        <div class="module-home-actions">
          <RouterLink class="module-quick-access__pill module-quick-access__pill--action" to="/app/finances">
            <ArrowLeft />
            <span>Retour finances</span>
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Cadre de restitution visible"
      description="La restitution n'est jamais un droit global. Le frontend expose la doctrine permission plus perimetre avant toute tentative."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <Undo2 />
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
          <ContextBadge label="Execution" :value="executionLabel" />
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
      <template v-if="!isAuthorized">
        <ErrorState
          title="Workflow non autorise"
          message="Cette restitution est reservee aux acteurs reels de perception autorises dans leur perimetre."
        />
      </template>

      <template v-else>
        <SectionBlock
          title="Demande de restitution"
          description="La restitution exige un paiement reel, un eleve reel, une caisse active et refuse toute double restitution."
        >
          <div class="finance-form-stack">
            <div class="finance-filter-grid finance-filter-grid--wide">
              <label class="finance-field">
                <span>Id paiement</span>
                <input v-model="idPaiement" type="text" placeholder="pay-..." />
              </label>

              <label class="finance-field">
                <span>Id eleve</span>
                <input v-model="idEleve" type="text" placeholder="eleve-..." />
              </label>

              <label class="finance-field">
                <span>Effectue par</span>
                <input :value="effectuePar" type="text" disabled />
              </label>
            </div>

            <div class="finance-guard-panel">
              <div class="finance-guard-panel__header">
                <ShieldCheck />
                <strong>Regles visibles</strong>
              </div>
              <ul>
                <li>`CAISSIER` et `ADMINISTRATEUR_ECOLE` interviennent dans le perimetre de leur ecole.</li>
                <li>`PREFET_ETUDES`, `DIRECTEUR_PRIMAIRE` et `DIRECTEUR_MATERNELLE` restent bornes par section et parametrage ecole.</li>
                <li>`FRAIS_MINERVAL` reste hors delegation pedagogique, meme si la perception d'autres frais est autorisee.</li>
              </ul>
            </div>

            <div class="finance-summary-grid finance-summary-grid--kpi">
              <div>
                <small>Caisse active requise</small>
                <strong>Oui</strong>
              </div>
              <div>
                <small>Double restitution</small>
                <strong>Refusee</strong>
              </div>
              <div>
                <small>Effet backend</small>
                <strong>REMBOURSE</strong>
              </div>
              <div>
                <small>Contre-operation</small>
                <strong>RESTITUTION</strong>
              </div>
            </div>

            <div class="module-home-actions">
              <button
                class="module-quick-access__pill module-quick-access__pill--action"
                type="button"
                :disabled="submitDisabled"
                @click="submitRefund"
              >
                <Undo2 />
                <span>{{ submitLabel }}</span>
              </button>
            </div>
          </div>
        </SectionBlock>

        <div
          v-if="refundStore.state.status === 'success' && refundStore.state.result"
          class="finance-status-strip finance-status-strip--success"
        >
          <BadgeCheck />
          <div>
            <strong>Restitution enregistree</strong>
            <p>
              {{ refundStore.state.result.idRestitution }} | {{ formatCurrency(refundStore.state.result.montant) }}
              | raison {{ refundStore.state.result.raison }}.
            </p>
          </div>
        </div>

        <div
          v-if="refundStore.state.status === 'error' && refundStore.state.errorMessage"
          class="finance-status-strip finance-status-strip--error"
        >
          <TriangleAlert />
          <div>
            <strong>Restitution refusee</strong>
            <p>{{ refundStore.state.errorMessage }}</p>
          </div>
        </div>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ArrowLeft, BadgeCheck, ShieldCheck, TriangleAlert, Undo2 } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { tenantContextStore } from '../../../shared/session/tenant-context.store';
import { sessionStore } from '../../../shared/auth/session.store';
import { authorizedPaymentRefundActors } from '../models/payment-refund.model';
import { usePaymentRefundStore } from '../stores/payment-refund.store';

const route = useRoute();
const context = activeContextStore.state;
const session = sessionStore.state;
const refundStore = usePaymentRefundStore();
const tenantContext = tenantContextStore.state;
const idPaiement = ref('');
const idEleve = ref('');

const isAuthorized = computed(() =>
  authorizedPaymentRefundActors.includes(session.actorCode as never),
);
const effectuePar = computed(() => tenantContext.userId || 'Utilisateur a configurer');
const executionLabel = computed(() =>
  refundStore.state.status === 'submitting' ? 'En cours' : refundStore.state.status === 'success' ? 'Terminee' : 'Prete',
);
const submitDisabled = computed(() =>
  refundStore.state.status === 'submitting'
  || idPaiement.value.trim().length === 0
  || idEleve.value.trim().length === 0
  || effectuePar.value.trim().length === 0
  || effectuePar.value === 'Utilisateur a configurer',
);
const submitLabel = computed(() =>
  refundStore.state.status === 'submitting' ? 'Restitution en cours' : 'Lancer la restitution',
);

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'CAISSIER':
    case 'ADMINISTRATEUR_ECOLE':
      return `Restitution bornee a l ecole active: ${context.schoolName}.`;
    case 'PREFET_ETUDES':
      return 'Restitution bornee a la section secondaire et aux types de frais delegues, hors minerval.';
    case 'DIRECTEUR_PRIMAIRE':
      return 'Restitution bornee a la section primaire et aux types de frais delegues, hors minerval.';
    case 'DIRECTEUR_MATERNELLE':
      return 'Restitution bornee a la section maternelle et aux types de frais delegues, hors minerval.';
    default:
      return `Session visible: ${session.actorLabel}. Cette restitution n est pas ouverte a cet acteur.`;
  }
});

function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FC`;
}

function lireParametreTexte(valeur: unknown): string {
  return typeof valeur === 'string' ? valeur.trim() : '';
}

async function submitRefund(): Promise<void> {
  if (submitDisabled.value) {
    return;
  }

  await refundStore.restituer({
    idPaiement: idPaiement.value.trim(),
    idEleve: idEleve.value.trim(),
    effectuePar: effectuePar.value,
  });
}

watch(
  () => route.fullPath,
  () => {
    idPaiement.value = lireParametreTexte(route.query.idPaiement);
    idEleve.value = lireParametreTexte(route.query.idEleve);
    refundStore.reinitialiser();
  },
  { immediate: true },
);
</script>
