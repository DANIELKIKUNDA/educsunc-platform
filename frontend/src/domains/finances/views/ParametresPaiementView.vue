<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-015"
      title="Parametres de paiement"
      description="Vue de parametrage pour consulter puis modifier les regles locales de paiement de l'ecole."
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
      description="La configuration des paiements reste reservee a l'acteur systeme d'ecole explicitement retenu."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <SlidersHorizontal />
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
          <ContextBadge label="Mise a jour" :value="settings.updatedAt" />
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
          title="Chargement des parametres"
          message="Preparation des regles locales de paiement de l'ecole."
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Parametrage non autorise"
          message="Cette vue de configuration reste reservee a l'ADMIN_SYSTEME_ECOLE de l'ecole courante."
        />

        <div class="finance-form-grid">
          <SectionBlock
            title="Resume de configuration"
            description="Lecture immediate des regles actives avant mutation."
          >
            <div class="finance-list-card">
              <div class="finance-list-card__row">
                <div>
                  <strong>Modes de paiement</strong>
                  <small>{{ settings.modesPaiementAutorises.join(', ') }}</small>
                </div>
              </div>
              <div class="finance-list-card__row">
                <div>
                  <strong>Paiement partiel</strong>
                  <small>{{ settings.paiementPartielAutorise ? 'Autorise' : 'Interdit' }}</small>
                </div>
              </div>
              <div class="finance-list-card__row">
                <div>
                  <strong>Inscription avec dette</strong>
                  <small>{{ settings.inscriptionAvecDetteAutorisee ? 'Autorisee' : 'Interdite' }}</small>
                </div>
              </div>
              <div class="finance-list-card__row">
                <div>
                  <strong>Retrait de documents</strong>
                  <small>{{ settings.retraitDocumentBloqueSiDette ? 'Bloque si dette' : 'Non bloque' }}</small>
                </div>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock
            title="Formulaire de parametres"
            description="La mutation reste locale a l'ecole et doit produire une confirmation claire."
          >
            <div class="finance-form-stack">
              <label class="finance-field">
                <span>Modes de paiement autorises</span>
                <input v-model="modesInput" type="text" />
              </label>

              <label class="finance-field">
                <span>Politique d'arrieres</span>
                <input v-model="politiqueArrieresInput" type="text" />
              </label>

              <label class="finance-toggle-row">
                <input v-model="paiementPartiel" type="checkbox" />
                <span>Autoriser le paiement partiel</span>
              </label>

              <label class="finance-toggle-row">
                <input v-model="inscriptionAvecDette" type="checkbox" />
                <span>Autoriser l'inscription avec dette</span>
              </label>

              <label class="finance-toggle-row">
                <input v-model="blocageDocuments" type="checkbox" />
                <span>Bloquer le retrait des documents si dette</span>
              </label>

              <div class="finance-form-actions">
                <button class="finance-primary-action" type="button" @click="saveSettings">
                  <Save />
                  <span>Modifier</span>
                </button>
              </div>

              <div v-if="uiState === 'success'" class="finance-success-panel">
                <div class="finance-success-panel__icon">
                  <CircleCheckBig />
                </div>
                <strong>Configuration preparee</strong>
                <p>La simulation frontend a enregistre une mise a jour locale des parametres de paiement.</p>
              </div>
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
import { ArrowLeft, CircleCheckBig, Save, ShieldCheck, SlidersHorizontal } from 'lucide-vue-next';
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
import { paymentSettingsViewModel } from '../data/parametres-paiement.demo';

type SettingsUiState = 'idle' | 'loading' | 'success';

const context = activeContextStore.state;
const session = sessionStore.state;
const settings = ref({ ...paymentSettingsViewModel });
const uiState = ref<SettingsUiState>('idle');

const modesInput = ref(settings.value.modesPaiementAutorises.join(', '));
const politiqueArrieresInput = ref(settings.value.politiqueArrieres);
const paiementPartiel = ref(settings.value.paiementPartielAutorise);
const inscriptionAvecDette = ref(settings.value.inscriptionAvecDetteAutorisee);
const blocageDocuments = ref(settings.value.retraitDocumentBloqueSiDette);

const isAuthorized = computed(() => session.actorCode === 'ADMIN_SYSTEME_ECOLE');

const perimeterMessage = computed(() => {
  if (isAuthorized.value) {
    return `Configuration bornee a l ecole active: ${context.schoolName}. ADMINISTRATEUR_ECOLE ne devient pas configureur implicite.`;
  }

  return `Session visible: ${session.actorLabel}. Cette vue de parametrage reste reservee a l ADMIN_SYSTEME_ECOLE.`;
});

function saveSettings(): void {
  uiState.value = 'success';
}
</script>
