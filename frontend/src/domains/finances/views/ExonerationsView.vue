<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-009"
      title="Exonerations"
      description="Vue de mutation controlee pour accorder puis annuler une exoneration dans le bon perimetre local."
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
      description="Le frontend expose clairement que l'exoneration est un pouvoir borne, jamais un droit global implicite."
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
          <ContextBadge label="Obligation" :value="obligation.typeFrais" />
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
      <template v-if="uiState === 'loading'">
        <LoadingState
          title="Chargement de l'exoneration"
          message="Preparation de l'obligation cible et de l'historique de decision."
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Exoneration non autorisee"
          message="Cette mutation est reservee aux acteurs reels d'exoneration dans leur bon perimetre."
        />

        <div class="finance-form-grid">
          <SectionBlock
            title="Detail obligation"
            description="La cible de l'exoneration reste lisible avant toute decision."
          >
            <div class="finance-student-banner finance-student-banner--profile">
              <div>
                <small>Eleve</small>
                <strong>{{ obligation.eleveNom }}</strong>
              </div>
              <div>
                <small>Code eleve</small>
                <strong>{{ obligation.matricule }}</strong>
              </div>
              <div>
                <small>Classe</small>
                <strong>{{ obligation.classe }}</strong>
              </div>
              <div>
                <small>Type de frais</small>
                <strong>{{ obligation.typeFrais }}</strong>
              </div>
              <div>
                <small>Libelle</small>
                <strong>{{ obligation.libelle }}</strong>
              </div>
              <div>
                <small>Etat</small>
                <strong>{{ obligation.dejaExoneree ? 'Exoneration existante' : 'Aucune exoneration' }}</strong>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock
            title="Etat financier"
            description="Lecture directe du montant initial, deja exonere et restant du."
          >
            <div class="finance-kpi-grid finance-kpi-grid--detail">
              <div class="finance-kpi-card">
                <small>Montant initial</small>
                <strong>{{ formatCurrency(obligation.montantInitial) }}</strong>
                <span>Base de l'obligation</span>
              </div>
              <div class="finance-kpi-card">
                <small>Montant exonere</small>
                <strong>{{ formatCurrency(obligation.montantExonere) }}</strong>
                <span>Decision actuellement portee</span>
              </div>
              <div class="finance-kpi-card">
                <small>Solde restant</small>
                <strong>{{ formatCurrency(obligation.soldeRestant) }}</strong>
                <span>Montant encore redevable</span>
              </div>
            </div>
          </SectionBlock>
        </div>

        <div class="finance-form-grid">
          <SectionBlock
            title="Bloc decision exoneration"
            description="Une zone simple pour accorder ou annuler, sans masquer les restrictions metier."
          >
            <div class="finance-form-stack">
              <label class="finance-field">
                <span>Montant a exonerer</span>
                <input v-model="amountInput" type="number" min="0" step="1000" />
              </label>

              <label class="finance-field">
                <span>Motif de decision</span>
                <input v-model="reasonInput" type="text" />
              </label>

              <div class="finance-form-actions">
                <button class="finance-primary-action" type="button" @click="grantExoneration">
                  <BadgePercent />
                  <span>Accorder une exoneration</span>
                </button>
              </div>

              <div class="finance-form-actions">
                <button class="finance-secondary-action" type="button" @click="cancelExoneration">
                  <Undo2 />
                  <span>Annuler une exoneration</span>
                </button>
              </div>

              <div v-if="uiState === 'success-grant'" class="finance-success-panel">
                <div class="finance-success-panel__icon">
                  <CircleCheckBig />
                </div>
                <strong>Exoneration preparee</strong>
                <p>La simulation frontend a enregistre une nouvelle decision d'exoneration sur cette obligation.</p>
              </div>

              <div v-else-if="uiState === 'success-cancel'" class="finance-success-panel">
                <div class="finance-success-panel__icon">
                  <CircleCheckBig />
                </div>
                <strong>Annulation preparee</strong>
                <p>La simulation frontend a enregistre une annulation d'exoneration sur cette obligation.</p>
              </div>

              <ErrorState
                v-else-if="uiState === 'already-exonerated'"
                title="Deja exonere"
                message="Cette obligation porte deja une exoneration active. Verifier le journal avant une nouvelle mutation."
              />

              <ErrorState
                v-else-if="uiState === 'technical-error'"
                title="Erreur technique"
                message="La mutation n'a pas pu etre finalisee dans cette simulation de socle."
              />

              <div class="finance-guard-panel">
                <div class="finance-guard-panel__header">
                  <ShieldCheck />
                  <strong>Restrictions visibles</strong>
                </div>
                <ul>
                  <li>`SECRETAIRE` ne devient acteur positif que si la delegation locale est explicitement active.</li>
                  <li>La mutation reste bornee a l'organisation et a l'ecole cibles.</li>
                  <li>L'annulation doit restaurer correctement l'obligation associee.</li>
                </ul>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock
            title="Journal des mutations"
            description="Historique visible des decisions d'exoneration et de leurs annulations."
          >
            <div class="finance-table-shell">
              <table class="finance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Action</th>
                    <th>Montant</th>
                    <th>Motif</th>
                    <th>Acteur</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in obligation.logs" :key="log.id">
                    <td>{{ log.date }}</td>
                    <td>{{ log.action }}</td>
                    <td>{{ formatCurrency(log.montant) }}</td>
                    <td>{{ log.motif }}</td>
                    <td>{{ log.acteur }}</td>
                    <td>
                      <span class="finance-status-badge" :class="log.statut === 'VALIDE' ? 'finance-status-badge--success' : 'finance-status-badge--warning'">
                        {{ log.statut }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionBlock>
        </div>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import {
  ArrowLeft,
  BadgePercent,
  CircleCheckBig,
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
import { activeContextStore } from '../../../shared/session/active-context.store';
import { sessionStore } from '../../../shared/auth/session.store';
import { authorizedExonerationActors, exonerationTargetObligation } from '../data/exonerations.demo';

type ExonerationUiState =
  | 'idle'
  | 'loading'
  | 'already-exonerated'
  | 'success-grant'
  | 'success-cancel'
  | 'technical-error';

const context = activeContextStore.state;
const session = sessionStore.state;
const obligation = ref({ ...exonerationTargetObligation });
const uiState = ref<ExonerationUiState>('idle');
const amountInput = ref('5000');
const reasonInput = ref('Ajustement exceptionnel');

const isAuthorized = computed(() =>
  authorizedExonerationActors.includes(session.actorCode as never),
);

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'GESTIONNAIRE_ORGANISATION':
    case 'PROMOTEUR_ORGANISATION':
      return `Mutation bornee a l organisation active: ${context.organizationName}.`;
    case 'SECRETAIRE':
      return 'Mutation bornee par delegation locale explicite de l ecole, sans pouvoir global d exoneration.';
    case 'ADMINISTRATEUR_ECOLE':
      return `Mutation bornee a l ecole active: ${context.schoolName}.`;
    default:
      return `Session visible: ${session.actorLabel}. Cette mutation n est pas ouverte a cet acteur.`;
  }
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' FC';
}

function grantExoneration(): void {
  if (!isAuthorized.value) {
    uiState.value = 'technical-error';
    return;
  }

  if (obligation.value.dejaExoneree) {
    uiState.value = 'already-exonerated';
    return;
  }

  uiState.value = 'success-grant';
}

function cancelExoneration(): void {
  if (!isAuthorized.value) {
    uiState.value = 'technical-error';
    return;
  }

  uiState.value = 'success-cancel';
}
</script>
