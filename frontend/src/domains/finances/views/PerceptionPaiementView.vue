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

    <AccessBoundary capability="module.finances.access">
      <div class="finance-kpi-grid">
        <div class="finance-kpi-card">
          <small>Acteur visible</small>
          <strong>{{ session.actorCode }}</strong>
          <span>Priorite au percepteur reel</span>
        </div>
        <div class="finance-kpi-card">
          <small>Perimetre actif</small>
          <strong>{{ context.schoolName }}</strong>
          <span>{{ context.sectionName }} · {{ context.schoolYearLabel }}</span>
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
              <span>Eleve cible</span>
              <select v-model="selectedStudentId">
                <option value="">Choisir un eleve</option>
                <option
                  v-for="student in students"
                  :key="student.id"
                  :value="student.id"
                >
                  {{ student.fullName }} - {{ student.classe }}
                </option>
              </select>
            </label>

            <button class="finance-primary-action" type="button" @click="verifyStudent">
              <Search />
              <span>Verifier l'eleve</span>
            </button>

            <ErrorState
              v-if="uiState === 'student-not-found'"
              title="Eleve introuvable"
              message="Selectionner un eleve valide avant de preparer la perception."
            />

            <div v-if="selectedStudent" class="finance-student-banner">
              <div>
                <small>Code eleve</small>
                <strong>
                  <BadgeCheck />
                  <span>{{ selectedStudent.matricule }}</span>
                </strong>
              </div>
              <div>
                <small>Eleve</small>
                <strong>{{ selectedStudent.fullName }}</strong>
              </div>
              <div>
                <small>Classe</small>
                <strong>{{ selectedStudent.classe }}</strong>
              </div>
              <div>
                <small>Section</small>
                <strong>{{ selectedStudent.section }}</strong>
              </div>
            </div>
          </div>
        </SectionBlock>

        <SectionBlock
          title="Frais exigibles"
          description="Le frontend n'affiche que les frais encore exigibles pour l'eleve cible."
        >
          <template v-if="selectedStudent && availableObligations.length > 0">
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
                    {{ obligation.delegationAutorisee ? 'Delegation locale possible' : 'Naturel caisse uniquement' }}
                  </small>
                </div>
              </button>
            </div>
          </template>

          <EmptyState
            v-else-if="selectedStudent && availableObligations.length === 0"
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
                <option v-for="mode in paymentModes" :key="mode" :value="mode">
                  {{ mode }}
                </option>
              </select>
            </label>

            <div class="finance-form-actions">
              <button class="finance-primary-action" type="button" @click="submitPayment">
                <CheckCircle2 />
                <span>Enregistrer le paiement</span>
              </button>
            </div>

            <ErrorState
              v-if="uiState === 'type-forbidden'"
              title="Type de frais interdit"
              message="Ce type de frais n'est pas percevable dans le perimetre visible ou par l'acteur courant."
            />

            <ErrorState
              v-else-if="uiState === 'technical-error'"
              title="Erreur technique"
              message="La perception n'a pas pu etre finalisee dans cette simulation de socle."
            />

            <div v-else-if="uiState === 'success'" class="finance-success-panel">
              <div class="finance-success-panel__icon">
                <CircleCheckBig />
              </div>
              <strong>Succes d'enregistrement</strong>
              <p>
                Paiement prepare pour {{ selectedStudent?.fullName }} sur
                {{ selectedObligation?.libelle }}.
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
              <strong>{{ selectedStudent?.fullName ?? '-' }}</strong>
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
              <strong>{{ paymentMode || '-' }}</strong>
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
              <li>`FRAIS_MINERVAL` reste reserve au percepteur naturel quand requis.</li>
            </ul>
          </div>
        </SectionBlock>
      </div>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
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
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { paymentModes, studentPaymentContexts } from '../data/perception-paiement.demo';

type UiState =
  | 'idle'
  | 'student-not-found'
  | 'type-forbidden'
  | 'technical-error'
  | 'success';

const session = sessionStore.state;
const context = activeContextStore.state;
const students = studentPaymentContexts;

const selectedStudentId = ref('');
const selectedObligationId = ref('');
const amountInput = ref('');
const paymentMode = ref('');
const uiState = ref<UiState>('idle');

const selectedStudent = computed(() =>
  students.find((student) => student.id === selectedStudentId.value),
);

const availableObligations = computed(() => selectedStudent.value?.obligations ?? []);

const selectedObligation = computed(() =>
  availableObligations.value.find((obligation) => obligation.id === selectedObligationId.value),
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

function verifyStudent(): void {
  if (selectedStudent.value === undefined) {
    uiState.value = 'student-not-found';
    return;
  }

  uiState.value = 'idle';
  selectedObligationId.value = '';
  amountInput.value = '';
  paymentMode.value = '';
}

function pickObligation(obligationId: string): void {
  selectedObligationId.value = obligationId;
  const obligation = availableObligations.value.find((item) => item.id === obligationId);
  amountInput.value = obligation !== undefined ? String(obligation.montantExigible) : '';
  uiState.value = 'idle';
}

function submitPayment(): void {
  if (selectedStudent.value === undefined) {
    uiState.value = 'student-not-found';
    return;
  }

  if (selectedObligation.value === undefined || paymentMode.value.length === 0 || amountInput.value.length === 0) {
    uiState.value = 'technical-error';
    return;
  }

  if (selectedObligation.value.minervalNaturelOnly === true && session.actorCode !== 'CAISSIER') {
    uiState.value = 'type-forbidden';
    return;
  }

  uiState.value = 'success';
}

function formatCurrency(amount: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(amount)} FC`;
}
</script>
