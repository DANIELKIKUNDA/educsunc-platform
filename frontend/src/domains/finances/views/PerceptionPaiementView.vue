<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-001"
      title="Perception de paiement"
      description="Ecran de caisse prioritaire pour enregistrer un paiement autorise dans le bon perimetre."
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
      description="Le frontend montre le bon acteur et son perimetre. Il ne remplace jamais la securite backend."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <WalletCards />
          </div>
          <div>
            <p class="finance-hero-strip__label">Poste de caisse</p>
            <strong>{{ session.actorLabel }}</strong>
          </div>
        </div>
        <div class="module-home-grid">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Ecole" :value="context.schoolName" />
          <ContextBadge label="Section active" :value="context.sectionName" />
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

    <AccessBoundary page-code="PF-01">
      <template v-if="uiState === 'loading-student' || uiState === 'submitting'">
        <LoadingState
          :title="uiState === 'submitting' ? 'Enregistrement du paiement' : 'Verification de l eleve'"
          :message="uiState === 'submitting'
            ? 'Application de la perception autorisee et generation des recus.'
            : 'Lecture de l eleve cible et de ses frais exigibles.'"
        />
      </template>

      <template v-else>
        <div class="finance-kpi-grid">
          <div class="finance-kpi-card">
            <small>Acteur visible</small>
            <strong>{{ session.actorCode }}</strong>
            <span>Priorite au percepteur reel</span>
          </div>
          <div class="finance-kpi-card">
            <small>Perimetre actif</small>
            <strong>{{ context.schoolName }}</strong>
            <span>{{ context.sectionName }} | {{ context.schoolYearLabel }}</span>
          </div>
          <div class="finance-kpi-card">
            <small>Mode d'ecran</small>
            <strong>Action de caisse</strong>
            <span>SCR-PF-001</span>
          </div>
        </div>

        <div class="finance-form-grid">
          <SectionBlock
            title="Verification eleve"
            description="Identifier l'eleve cible avant toute perception."
          >
            <div class="finance-form-stack">
              <label class="finance-field">
                <span>Id eleve</span>
                <input v-model="studentIdInput" type="text" placeholder="Ex: ELEVE-001" />
              </label>

              <div class="finance-form-actions">
                <button class="finance-primary-action" type="button" @click="verifyStudent">
                  <Search />
                  <span>Verifier l'eleve</span>
                </button>
              </div>

              <ErrorState
                v-if="uiState === 'missing-student'"
                title="Eleve cible manquant"
                message="Renseignez un idEleve reel avant de preparer la perception."
              />

              <ErrorState
                v-else-if="uiState === 'technical-error'"
                title="Lecture technique indisponible"
                :message="technicalErrorMessage"
              />

              <div v-if="profile" class="finance-student-banner">
                <div>
                  <small>Code eleve</small>
                  <strong>
                    <BadgeCheck />
                    <span>{{ profile.matricule }}</span>
                  </strong>
                </div>
                <div>
                  <small>Eleve</small>
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
              </div>
            </div>
          </SectionBlock>

          <SectionBlock
            title="Frais exigibles"
            description="Le frontend n'affiche que les frais encore exigibles pour l'eleve cible."
          >
            <template v-if="profile && availableObligations.length > 0">
              <div class="finance-obligation-list">
                <button
                  v-for="obligation in availableObligations"
                  :key="obligation.id"
                  type="button"
                  class="finance-obligation-card"
                  :class="{ 'finance-obligation-card--active': selectedObligation?.id === obligation.id }"
                  @click="pickObligation(obligation.id)"
                >
                  <div class="finance-obligation-card__body">
                    <div class="finance-obligation-card__marker">
                      <ReceiptText />
                    </div>
                    <strong>{{ obligation.libelle }}</strong>
                    <small>{{ obligation.typeFrais }}</small>
                  </div>
                  <div class="finance-obligation-card__meta">
                    <span>{{ formatCurrency(obligation.montantExigible) }}</span>
                    <small>
                      {{ obligation.paiementPartielAutorise ? 'Paiement partiel autorise' : 'Paiement integral attendu' }}
                    </small>
                  </div>
                </button>
              </div>
            </template>

            <EmptyState
              v-else-if="profile && availableObligations.length === 0"
              title="Aucun frais exigible"
              message="Cet eleve n'a actuellement aucun frais exigible dans le perimetre visible."
            />

            <LoadingState
              v-else
              title="Contexte eleve attendu"
              message="Verifier l'eleve pour charger ses obligations financieres exigibles."
            />
          </SectionBlock>
        </div>

        <div class="finance-form-grid">
          <SectionBlock
            title="Formulaire de perception"
            description="Saisir uniquement une operation autorisee dans le bon perimetre."
          >
            <div class="finance-form-stack">
              <label class="finance-field">
                <span>Type de frais</span>
                <select v-model="selectedObligationId">
                  <option value="">Choisir un frais</option>
                  <option
                    v-for="obligation in availableObligations"
                    :key="obligation.id"
                    :value="obligation.id"
                  >
                    {{ obligation.libelle }}
                  </option>
                </select>
              </label>

              <label class="finance-field">
                <span>Montant</span>
                <input v-model="amountInput" type="number" min="0" step="1000" />
              </label>

              <label class="finance-field">
                <span>Mode de paiement</span>
                <select v-model="paymentMode">
                  <option value="">Choisir un mode</option>
                  <option v-for="mode in paymentRegistrationModeOptions" :key="mode.value" :value="mode.value">
                    {{ mode.label }}
                  </option>
                </select>
              </label>

              <div class="finance-form-actions">
                <button
                  v-if="canRecordPayment"
                  class="finance-primary-action"
                  type="button"
                  @click="submitPayment"
                >
                  <CheckCircle2 />
                  <span>Enregistrer le paiement</span>
                </button>
              </div>

              <ErrorState
                v-if="uiState === 'missing-form'"
                title="Formulaire incomplet"
                message="Selectionner un frais reel, un montant et un mode de paiement avant de soumettre."
              />

              <div v-else-if="result" class="finance-success-panel">
                <div class="finance-success-panel__icon">
                  <CircleCheckBig />
                </div>
                <strong>Paiement enregistre</strong>
                <p>
                  Paiement {{ result.idPaiement }} enregistre pour {{ profile?.fullName }}
                  sur {{ result.typeFraisDeclare }}.
                </p>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock
            title="Recapitulatif d'operation"
            description="Le percepteur doit pouvoir relire clairement l'operation avant validation."
          >
            <div class="finance-summary-grid">
              <div>
                <small>Eleve</small>
                <strong>{{ profile?.fullName ?? '-' }}</strong>
              </div>
              <div>
                <small>Frais</small>
                <strong>{{ selectedObligation?.libelle ?? '-' }}</strong>
              </div>
              <div>
                <small>Montant saisi</small>
                <strong>{{ amountInput ? formatCurrency(Number(amountInput)) : '-' }}</strong>
              </div>
              <div>
                <small>Mode</small>
                <strong>{{ selectedModeLabel }}</strong>
              </div>
            </div>

            <div class="finance-guard-panel">
              <div class="finance-guard-panel__header">
                <ShieldCheck />
                <strong>Controles visibles</strong>
              </div>
              <ul>
                <li>Perception restreinte a l'ecole active.</li>
                <li>Les acteurs delegues ne voient pas un statut de caissier universel.</li>
                <li>Le backend garde la verite sur les types de frais autorises et la delegation reelle.</li>
              </ul>
            </div>
          </SectionBlock>
        </div>

        <SectionBlock
          v-if="result"
          title="Sortie backend"
          description="Le backend retourne le paiement enregistre, ses recus et une restitution eventuelle."
        >
          <div class="finance-list-card">
            <div class="finance-list-card__row">
              <div>
                <strong>Paiement</strong>
                <small>{{ result.statutPaiement }} | {{ result.modePaiement }}</small>
              </div>
              <strong>{{ formatCurrency(result.montantTotal) }}</strong>
            </div>
            <div
              v-for="receipt in result.receipts"
              :key="receipt.id"
              class="finance-list-card__row"
            >
              <div>
                <strong>{{ receipt.numeroRecu }}</strong>
                <small>{{ receipt.libelle }} | {{ receipt.dateEmission }}</small>
              </div>
              <strong>{{ formatCurrency(receipt.montant) }}</strong>
            </div>
            <div
              v-if="result.restitution"
              class="finance-list-card__row"
            >
              <div>
                <strong>Restitution</strong>
                <small>{{ result.restitution.raison }}</small>
              </div>
              <strong>{{ formatCurrency(result.restitution.montant) }}</strong>
            </div>
          </div>
        </SectionBlock>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  CircleCheckBig,
  ReceiptText,
  Search,
  ShieldCheck,
  WalletCards,
} from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { paymentRegistrationModeOptions } from '../models/payment-registration.model';
import { usePaymentRegistrationStore } from '../stores/payment-registration.store';

type UiState =
  | 'idle'
  | 'loading-student'
  | 'submitting'
  | 'missing-student'
  | 'missing-form'
  | 'technical-error';

const route = useRoute();
const session = sessionStore.state;
const context = activeContextStore.state;
const paymentRegistrationStore = usePaymentRegistrationStore();
const doctrineAccess = useDoctrineAccess();

const studentIdInput = ref(lireParametreTexte(route.query.idEleve) ?? '');
const selectedObligationId = ref('');
const amountInput = ref('');
const paymentMode = ref('');
const uiState = ref<UiState>('idle');

const isAuthorized = computed(() => doctrineAccess.canAccessPage('PF-01'));
const canRecordPayment = computed(() => doctrineAccess.canUseAction('finances.payments.record', 'PF-01'));
const profile = computed(() => paymentRegistrationStore.state.profile);
const availableObligations = computed(() => paymentRegistrationStore.state.obligations);
const result = computed(() => paymentRegistrationStore.state.result);
const technicalErrorMessage = computed(() =>
  paymentRegistrationStore.state.errorMessage
  ?? 'La perception n a pas pu etre finalisee.',
);

const selectedObligation = computed(() =>
  availableObligations.value.find((obligation) => obligation.id === selectedObligationId.value),
);

const selectedModeLabel = computed(() =>
  paymentRegistrationModeOptions.find((mode) => mode.value === paymentMode.value)?.label ?? '-',
);

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'PREFET_ETUDES':
      return 'Perimetre visible: section secondaire uniquement, selon delegation locale sur le type de frais.';
    case 'DIRECTEUR_PRIMAIRE':
      return 'Perimetre visible: section primaire uniquement, selon delegation locale sur le type de frais.';
    case 'DIRECTEUR_MATERNELLE':
      return 'Perimetre visible: section maternelle uniquement, selon delegation locale sur le type de frais.';
    case 'ADMINISTRATEUR_ECOLE':
      return 'Perimetre visible: ecole active uniquement. Le frontend ne donne pas un statut de caissier universel.';
    default:
      return 'Perimetre visible: meme ecole, avec priorite au percepteur reel de caisse.';
  }
});

function lireParametreTexte(valeur: unknown): string | undefined {
  return typeof valeur === 'string' && valeur.trim().length > 0 ? valeur.trim() : undefined;
}

async function verifyStudent(): Promise<void> {
  if (studentIdInput.value.trim().length === 0) {
    uiState.value = 'missing-student';
    return;
  }

  uiState.value = 'loading-student';
  selectedObligationId.value = '';
  amountInput.value = '';
  paymentMode.value = '';

  await paymentRegistrationStore.chargerEleve({
    idEleve: studentIdInput.value.trim(),
    classe: lireParametreTexte(route.query.classe),
    section: lireParametreTexte(route.query.section),
    anneeScolaire: lireParametreTexte(route.query.anneeScolaire),
  });

  uiState.value = paymentRegistrationStore.state.status === 'error'
    ? 'technical-error'
    : 'idle';
}

function pickObligation(obligationId: string): void {
  selectedObligationId.value = obligationId;
  const obligation = availableObligations.value.find((item) => item.id === obligationId);
  amountInput.value = obligation !== undefined ? String(obligation.montantExigible) : '';
  uiState.value = 'idle';
}

async function submitPayment(): Promise<void> {
  if (profile.value === null) {
    uiState.value = 'missing-student';
    return;
  }

  if (
    selectedObligation.value === undefined
    || paymentMode.value.length === 0
    || amountInput.value.length === 0
  ) {
    uiState.value = 'missing-form';
    return;
  }

  uiState.value = 'submitting';

  await paymentRegistrationStore.soumettrePaiement({
    idEleve: profile.value.id,
    typeFraisDeclare: selectedObligation.value.typeFrais,
    montant: amountInput.value,
    modePaiement: paymentMode.value as 'CASH' | 'MOBILE_MONEY' | 'BANQUE',
  });

  uiState.value = paymentRegistrationStore.state.status === 'error'
    ? 'technical-error'
    : 'idle';
}

function formatCurrency(amount: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(amount)} FC`;
}
</script>
