<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-001"
      title="Perception de paiement"
      description="Ecran de caisse prioritaire pour enregistrer un paiement autorise dans le bon perimetre."
    >
      <template #actions>
        <div class="module-home-actions">
          <RouterLink class="module-quick-access__pill module-quick-access__pill--action" to="/app/finances">
            <ArrowLeft />
            <span>Retour finances</span>
          </RouterLink>
          <RouterLink
            class="module-quick-access__pill"
            :to="studentFinancialSituationLink"
          >
            <WalletCards />
            <span>Situation eleve</span>
          </RouterLink>
          <RouterLink
            class="module-quick-access__pill"
            :to="studentPaymentHistoryLink"
          >
            <ReceiptText />
            <span>Historique eleve</span>
          </RouterLink>
        </div>
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
                <button
                  v-if="profile"
                  class="finance-secondary-action"
                  type="button"
                  @click="resetOperation"
                >
                  Reinitialiser l operation
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
          v-if="profile"
          title="Etapes suivantes"
          description="Une fois l eleve verifie ou le paiement pose, le flux financier doit ouvrir directement les lectures utiles sans ressaisie."
        >
          <div class="finance-next-grid">
            <button class="finance-next-card" type="button" @click="ouvrirSituationFinanciere">
              <strong>Situation financiere</strong>
              <small>Relire dette, exigibles et arrieres de cet eleve.</small>
            </button>
            <button class="finance-next-card" type="button" @click="ouvrirHistoriquePaiements">
              <strong>Historique des paiements</strong>
              <small>Verifier les operations deja enregistrees pour cet eleve.</small>
            </button>
            <button
              class="finance-next-card"
              type="button"
              :disabled="result?.receipts.length === 0"
              @click="ouvrirDernierRecu"
            >
              <strong>Ouvrir le dernier recu</strong>
              <small>Basculer directement vers le recu emis par l operation courante.</small>
            </button>
          </div>
        </SectionBlock>

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
import { usePaymentRegistrationViewModel } from '../viewmodels/usePaymentRegistrationViewModel';

const {
  session,
  context,
  paymentRegistrationStore,
  studentIdInput,
  selectedObligationId,
  amountInput,
  paymentMode,
  uiState,
  isAuthorized,
  canRecordPayment,
  profile,
  availableObligations,
  result,
  technicalErrorMessage,
  studentPaymentHistoryLink,
  studentFinancialSituationLink,
  selectedObligation,
  selectedModeLabel,
  perimeterMessage,
  paymentRegistrationModeOptions,
  verifyStudent,
  verifyStudentFromRoute,
  pickObligation,
  submitPayment,
  resetOperation,
  ouvrirHistoriquePaiements,
  ouvrirSituationFinanciere,
  ouvrirDernierRecu,
  formatCurrency,
} = usePaymentRegistrationViewModel();
</script>
