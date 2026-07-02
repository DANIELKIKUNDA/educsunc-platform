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
          <ContextBadge label="Parametres" :value="profile?.id ?? 'A configurer'" />
        </div>
      </div>
      <div class="finance-info-banner">
        <ShieldCheck />
        <p class="finance-form-note">{{ perimeterMessage }}</p>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="PF-19">
      <template v-if="uiState === 'loading' || uiState === 'saving'">
        <LoadingState
          :title="uiState === 'saving' ? 'Sauvegarde des parametres' : 'Chargement des parametres'"
          :message="uiState === 'saving'
            ? 'Application des regles locales de paiement de l ecole.'
            : 'Preparation des regles locales de paiement de l ecole.'"
        />
      </template>

      <template v-else-if="uiState === 'technical-error'">
        <ErrorState
          title="Parametres indisponibles"
          :message="technicalErrorMessage"
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Parametrage non autorise"
          message="Cette vue de configuration reste reservee a l'ADMIN_SYSTEME_ECOLE de l'ecole courante."
        />

        <template v-else-if="uiState === 'empty'">
          <EmptyState
            title="Aucun parametre actif"
            message="Aucun parametrage de paiement n'est encore actif pour cette ecole. Le formulaire ci-dessous peut initialiser le profil officiel."
          />

          <SectionBlock
            title="Formulaire d'initialisation"
            description="Premier parametrage officiel de l'ecole."
          >
            <div class="finance-form-actions">
              <button v-if="canManagePaymentSettings" class="finance-primary-action" type="button" @click="saveSettings">
                <Save />
                <span>Creer les parametres</span>
              </button>
            </div>
          </SectionBlock>
        </template>

        <template v-else>
          <div class="finance-form-grid">
            <SectionBlock
              title="Resume de configuration"
              description="Lecture immediate des regles actives avant mutation."
            >
              <div class="finance-list-card">
                <div class="finance-list-card__row">
                  <div>
                    <strong>Modes de paiement</strong>
                    <small>{{ profile?.modesPaiementAutorises.map(labelModePaiement).join(', ') || 'Aucun' }}</small>
                  </div>
                </div>
                <div class="finance-list-card__row">
                  <div>
                    <strong>Politique d'arrieres</strong>
                    <small>{{ profile ? labelPolitiqueArrieres(profile.politiqueArrieres) : 'Non definie' }}</small>
                  </div>
                </div>
                <div class="finance-list-card__row">
                  <div>
                    <strong>Paiement partiel</strong>
                    <small>{{ profile?.paiementPartielAutorise ? 'Autorise' : 'Interdit' }}</small>
                  </div>
                </div>
                <div class="finance-list-card__row">
                  <div>
                    <strong>Inscription avec dette</strong>
                    <small>{{ profile?.autoriserInscriptionAvecDette ? 'Autorisee' : 'Interdite' }}</small>
                  </div>
                </div>
                <div class="finance-list-card__row">
                  <div>
                    <strong>Retrait de documents</strong>
                    <small>{{ profile?.bloquerRetraitDocumentsSiDette ? 'Bloque si dette' : 'Non bloque' }}</small>
                  </div>
                </div>
                <div class="finance-list-card__row">
                  <div>
                    <strong>Famille nombreuse</strong>
                    <small>
                      {{
                        profile?.appliquerFamilleNombreuse
                          ? `Activee${profile.nombreEnfantsSeuilFamilleNombreuse !== undefined ? ` a partir de ${profile.nombreEnfantsSeuilFamilleNombreuse} enfants` : ''}`
                          : 'Inactive'
                      }}
                    </small>
                  </div>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Delegations et regles visibles"
              description="Lecture courte des ouvertures delegationnelles portees par le backend."
            >
              <div class="finance-list-card">
                <div class="finance-list-card__row">
                  <div>
                    <strong>Historique paiements delegue</strong>
                    <small>{{ delegatedHistorySummary }}</small>
                  </div>
                </div>
                <div class="finance-list-card__row">
                  <div>
                    <strong>Exoneration deleguee</strong>
                    <small>{{ delegatedExonerationSummary }}</small>
                  </div>
                </div>
                <div class="finance-list-card__row">
                  <div>
                    <strong>Mois obligatoire inscription</strong>
                    <small>{{ profile?.moisObligatoireInscription ? labelSchoolMonth(profile.moisObligatoireInscription) : 'Aucun' }}</small>
                  </div>
                </div>
                <div class="finance-list-card__row">
                  <div>
                    <strong>Frais inscription obligatoires</strong>
                    <small>{{ profile?.exigerFraisInscription ? 'Oui' : 'Non' }}</small>
                  </div>
                </div>
              </div>
            </SectionBlock>
          </div>

          <SectionBlock
            title="Formulaire de parametres"
            description="La mutation reste locale a l'ecole et doit produire une confirmation claire."
          >
            <div class="finance-form-stack">
              <div class="finance-filter-grid finance-filter-grid--wide">
                <label class="finance-field">
                  <span>Politique d'arrieres</span>
                  <select v-model="form.politiqueArrieres">
                    <option
                      v-for="option in paymentArrearsPolicyOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </label>

                <label class="finance-field">
                  <span>Mois obligatoire inscription</span>
                  <select v-model="form.moisObligatoireInscription">
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
                  <span>Seuil famille nombreuse</span>
                  <input
                    v-model="form.nombreEnfantsSeuilFamilleNombreuse"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ex: 3"
                  />
                </label>
              </div>

              <div class="finance-toggle-grid">
                <label class="finance-toggle-row">
                  <input v-model="form.paiementPartielAutorise" type="checkbox" />
                  <span>Autoriser le paiement partiel</span>
                </label>

                <label class="finance-toggle-row">
                  <input v-model="form.autoriserInscriptionAvecDette" type="checkbox" />
                  <span>Autoriser l'inscription avec dette</span>
                </label>

                <label class="finance-toggle-row">
                  <input v-model="form.bloquerRetraitDocumentsSiDette" type="checkbox" />
                  <span>Bloquer le retrait des documents si dette</span>
                </label>

                <label class="finance-toggle-row">
                  <input v-model="form.appliquerFamilleNombreuse" type="checkbox" />
                  <span>Activer la logique famille nombreuse</span>
                </label>

                <label class="finance-toggle-row">
                  <input v-model="form.exigerFraisInscription" type="checkbox" />
                  <span>Exiger les frais d'inscription</span>
                </label>
              </div>

              <SectionBlock
                title="Modes de paiement"
                description="Au moins un mode doit rester autorise."
              >
                <div class="finance-toggle-grid">
                  <label
                    v-for="option in paymentModeOptions"
                    :key="option.value"
                    class="finance-toggle-row"
                  >
                    <input
                      :checked="form.modesPaiementAutorises.includes(option.value)"
                      type="checkbox"
                      @change="toggleMode(option.value)"
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </SectionBlock>

              <SectionBlock
                title="Delegation consultation historique"
                description="Roles pedagogiques explicitement autorises par l'ecole."
              >
                <div class="finance-toggle-grid">
                  <label
                    v-for="option in paymentDelegatedHistoryRoleOptions"
                    :key="option.value"
                    class="finance-toggle-row"
                  >
                    <input
                      :checked="form.consultationHistoriquePaiementsDeleguee.includes(option.value)"
                      type="checkbox"
                      @change="toggleHistoryRole(option.value)"
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </SectionBlock>

              <SectionBlock
                title="Delegation exoneration"
                description="Delegation supplementaire exposee par le backend."
              >
                <div class="finance-toggle-grid">
                  <label
                    v-for="option in paymentDelegatedExonerationRoleOptions"
                    :key="option.value"
                    class="finance-toggle-row"
                  >
                    <input
                      :checked="form.exonerationDeleguee.includes(option.value)"
                      type="checkbox"
                      @change="toggleExonerationRole(option.value)"
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </SectionBlock>

              <SectionBlock
                title="Tables par type de frais"
                description="Les regles fines par type de frais restent porteuses de la doctrine officielle."
              >
                <div class="finance-table-shell">
                  <table class="finance-table">
                    <thead>
                      <tr>
                        <th>Type de frais</th>
                        <th>Paiement partiel</th>
                        <th>Perception deleguee</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="option in paymentFeeTypeOptions" :key="option.value">
                        <td>{{ option.label }}</td>
                        <td>
                          <label class="finance-toggle-row">
                            <input
                              :checked="form.paiementPartielParTypeFrais[option.value] ?? false"
                              type="checkbox"
                              @change="setPartialFeeRule(option.value, ($event.target as HTMLInputElement).checked)"
                            />
                            <span>Actif</span>
                          </label>
                        </td>
                        <td>
                          <div class="finance-inline-options">
                            <label
                              v-for="roleOption in paymentDelegatedPerceptionRoleOptions"
                              :key="`${option.value}-${roleOption.value}`"
                              class="finance-toggle-row"
                            >
                              <input
                                :checked="(form.perceptionDelegueeParTypeFrais[option.value] ?? []).includes(roleOption.value)"
                                type="checkbox"
                                @change="togglePerceptionRole(option.value, roleOption.value)"
                              />
                              <span>{{ roleOption.label }}</span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </SectionBlock>

              <div class="finance-form-actions">
                <button v-if="canManagePaymentSettings" class="finance-primary-action" type="button" @click="saveSettings">
                  <Save />
                  <span>Modifier</span>
                </button>
              </div>

              <div v-if="uiState === 'saved'" class="finance-success-panel">
                <div class="finance-success-panel__icon">
                  <CircleCheckBig />
                </div>
                <strong>Configuration enregistree</strong>
                <p>Les parametres de paiement viennent d'etre relus depuis le backend officiel.</p>
              </div>
            </div>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
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
import EmptyState from '../../../shared/ui/EmptyState.vue';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { sessionStore } from '../../../shared/auth/session.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import {
  paymentArrearsPolicyOptions,
  paymentDelegatedExonerationRoleOptions,
  paymentDelegatedHistoryRoleOptions,
  paymentDelegatedPerceptionRoleOptions,
  paymentFeeTypeOptions,
  paymentModeOptions,
  paymentSchoolMonthOptions,
  type PaymentArrearsPolicyCode,
  type PaymentDelegatedExonerationRoleCode,
  type PaymentDelegatedHistoryRoleCode,
  type PaymentDelegatedPerceptionRoleCode,
  type PaymentModeCode,
  type PaymentSchoolMonthCode,
} from '../models/payment-settings.model';
import { usePaymentSettingsStore } from '../stores/payment-settings.store';

const context = activeContextStore.state;
const session = sessionStore.state;
const paymentSettingsStore = usePaymentSettingsStore();
const doctrineAccess = useDoctrineAccess();

const isAuthorized = computed(() => doctrineAccess.canAccessPage('PF-19'));
const canManagePaymentSettings = computed(() => doctrineAccess.canUseAction('finances.settings.manage', 'PF-19'));
const profile = computed(() => paymentSettingsStore.state.profile);
const form = computed(() => paymentSettingsStore.state.form);
const technicalErrorMessage = computed(() =>
  paymentSettingsStore.state.errorMessage
  ?? 'Le backend n a pas pu restituer les parametres de paiement.',
);

const uiState = computed<'loading' | 'saving' | 'empty' | 'ready' | 'saved' | 'technical-error'>(() => {
  switch (paymentSettingsStore.state.status) {
    case 'loading':
      return 'loading';
    case 'saving':
      return 'saving';
    case 'empty':
      return 'empty';
    case 'saved':
      return 'saved';
    case 'error':
      return 'technical-error';
    default:
      return 'ready';
  }
});

const perimeterMessage = computed(() => {
  if (isAuthorized.value) {
    return `Configuration bornee a l ecole active: ${context.schoolName}. ADMINISTRATEUR_ECOLE ne devient pas configureur implicite.`;
  }

  return `Session visible: ${session.actorLabel}. Cette vue de parametrage reste reservee a l ADMIN_SYSTEME_ECOLE.`;
});

const delegatedHistorySummary = computed(() =>
  profile.value?.consultationHistoriquePaiementsDeleguee.length
    ? profile.value.consultationHistoriquePaiementsDeleguee.map(labelHistoryRole).join(', ')
    : 'Aucune delegation active'
);

const delegatedExonerationSummary = computed(() =>
  profile.value?.exonerationDeleguee.length
    ? profile.value.exonerationDeleguee.map(labelExonerationRole).join(', ')
    : 'Aucune delegation active'
);

function labelModePaiement(mode: PaymentModeCode): string {
  return paymentModeOptions.find((option) => option.value === mode)?.label ?? mode;
}

function labelPolitiqueArrieres(policy: PaymentArrearsPolicyCode): string {
  return paymentArrearsPolicyOptions.find((option) => option.value === policy)?.label ?? policy;
}

function labelSchoolMonth(month: PaymentSchoolMonthCode): string {
  return paymentSchoolMonthOptions.find((option) => option.value === month)?.label ?? month;
}

function labelHistoryRole(role: PaymentDelegatedHistoryRoleCode): string {
  return paymentDelegatedHistoryRoleOptions.find((option) => option.value === role)?.label ?? role;
}

function labelExonerationRole(role: PaymentDelegatedExonerationRoleCode): string {
  return paymentDelegatedExonerationRoleOptions.find((option) => option.value === role)?.label ?? role;
}

function toggleMode(mode: PaymentModeCode): void {
  paymentSettingsStore.basculerModePaiement(mode);
}

function toggleHistoryRole(role: PaymentDelegatedHistoryRoleCode): void {
  paymentSettingsStore.basculerRoleHistorique(role);
}

function toggleExonerationRole(role: PaymentDelegatedExonerationRoleCode): void {
  paymentSettingsStore.basculerRoleExoneration(role);
}

function setPartialFeeRule(typeFrais: string, actif: boolean): void {
  paymentSettingsStore.definirPaiementPartielTypeFrais(typeFrais, actif);
}

function togglePerceptionRole(typeFrais: string, role: PaymentDelegatedPerceptionRoleCode): void {
  paymentSettingsStore.basculerRolePerception(typeFrais, role);
}

async function saveSettings(): Promise<void> {
  await paymentSettingsStore.enregistrer();
}

onMounted(async () => {
  if (!isAuthorized.value) {
    paymentSettingsStore.reinitialiser();
    return;
  }

  await paymentSettingsStore.charger();
});
</script>
