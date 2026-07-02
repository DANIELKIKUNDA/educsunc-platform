<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-007"
      title="Recu de paiement"
      description="Vue documentaire pour consulter, relire ou reimprimer un recu officiel dans le bon perimetre d'ecole."
    >
      <template #actions>
        <div class="module-home-actions">
          <RouterLink class="module-quick-access__pill module-quick-access__pill--action" to="/app/finances">
            <ArrowLeft />
            <span>Retour finances</span>
          </RouterLink>
          <button
            class="module-quick-access__pill"
            type="button"
            :disabled="!canExportPdf"
            @click="printReceipt"
          >
            <Printer />
            <span>Imprimer / Exporter</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Cadre documentaire visible"
      description="La relecture du recu reste locale a l'ecole et n'ouvre aucune reimpression implicite a d'autres acteurs."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <ReceiptText />
          </div>
          <div>
            <p class="finance-hero-strip__label">Acteur attendu</p>
            <strong>Caissier</strong>
          </div>
        </div>
        <div class="module-home-grid">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Ecole" :value="context.schoolName" />
          <ContextBadge label="Annee scolaire" :value="receipt?.student.anneeScolaire ?? context.schoolYearLabel" />
          <ContextBadge label="Recu" :value="receipt?.numeroRecu ?? 'A connecter'" />
        </div>
      </div>
      <div class="finance-info-banner">
        <ShieldCheck />
        <p class="finance-form-note">
          {{ perimeterMessage }}
        </p>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="PF-09">
      <template v-if="uiState === 'loading'">
        <LoadingState
          title="Chargement du recu"
          message="Preparation du recu officiel complet pour affichage et reimpression."
        />
      </template>

      <template v-else-if="uiState === 'missing-receipt'">
        <ErrorState
          title="Recu cible manquant"
          message="Ajoutez un idRecu dans la route pour ouvrir un recu officiel reel."
        />
      </template>

      <template v-else-if="uiState === 'render-error'">
        <ErrorState
          title="Lecture technique indisponible"
          :message="technicalErrorMessage"
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Recu non autorise"
          message="Cette vue documentaire reste reservee au caissier de l'ecole courante."
        />

        <template v-else-if="receipt">
          <SectionBlock
            title="Viewer document"
            description="Le recu est affiche comme un document officiel complet, avec son identite scolaire et ses lignes de paiement."
          >
            <article class="receipt-viewer">
              <header class="receipt-viewer__header">
                <div class="receipt-viewer__school">
                  <div v-if="receipt.school.logoUrl" class="receipt-viewer__logo receipt-viewer__logo--image">
                    <img :src="receipt.school.logoUrl" :alt="`Logo ${receipt.school.nom}`">
                  </div>
                  <div v-else class="receipt-viewer__logo">{{ receipt.school.sigle }}</div>
                  <div>
                    <p class="receipt-viewer__eyebrow">Etablissement scolaire</p>
                    <h2>{{ receipt.school.nom }}</h2>
                    <p>{{ receipt.school.adresse }}</p>
                    <p>Tel. {{ receipt.school.telephone }}</p>
                    <p>{{ receipt.school.email }}</p>
                  </div>
                </div>

                <div class="receipt-viewer__number">
                  <small>Recu no</small>
                  <strong>{{ receipt.numeroRecu }}</strong>
                </div>
              </header>

              <section class="receipt-viewer__meta-grid">
                <div class="receipt-viewer__meta-card">
                  <small>Annee scolaire</small>
                  <strong>{{ receipt.student.anneeScolaire }}</strong>
                </div>
                <div class="receipt-viewer__meta-card">
                  <small>Classe</small>
                  <strong>{{ receipt.student.classe }}</strong>
                </div>
                <div class="receipt-viewer__meta-card">
                  <small>Date</small>
                  <strong>{{ receipt.dateLabel }}</strong>
                </div>
                <div class="receipt-viewer__meta-card">
                  <small>Heure</small>
                  <strong>{{ receipt.heureLabel }}</strong>
                </div>
              </section>

              <section class="receipt-viewer__student">
                <h3>Recu de paiement</h3>
                <div class="receipt-viewer__student-grid">
                  <div><small>Code eleve</small><strong>{{ receipt.student.matricule }}</strong></div>
                  <div><small>Nom</small><strong>{{ receipt.student.nom }}</strong></div>
                  <div><small>Postnom</small><strong>{{ receipt.student.postnom }}</strong></div>
                  <div><small>Prenom</small><strong>{{ receipt.student.prenom }}</strong></div>
                  <div><small>Sexe</small><strong>{{ receipt.student.sexe }}</strong></div>
                </div>
              </section>

              <section class="receipt-viewer__table">
                <h4>Detail des paiements</h4>
                <table class="receipt-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Type de frais</th>
                      <th>Libelle / mois</th>
                      <th>Montant (FC)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="line in receipt.lines" :key="line.id">
                      <td>{{ line.numero }}</td>
                      <td>{{ line.typeFrais }}</td>
                      <td>{{ line.libelle }}</td>
                      <td>{{ formatCurrency(line.montant) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3">Total paye</td>
                      <td>{{ formatCurrency(receipt.montantTotal) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </section>

              <section class="receipt-viewer__footer-grid">
                <div class="receipt-viewer__footer-card">
                  <small>Montant en lettres</small>
                  <strong>{{ receipt.montantEnLettres }}</strong>
                </div>
                <div class="receipt-viewer__footer-card">
                  <small>Mode de paiement</small>
                  <strong>{{ receipt.modePaiement }}</strong>
                </div>
              </section>

              <section class="receipt-viewer__signatures">
                <div class="receipt-viewer__signature-block">
                  <small>Caissier</small>
                  <strong>{{ receipt.caissierNom }}</strong>
                  <img
                    v-if="receipt.signatureDisponible && receipt.signatureUrl"
                    class="receipt-viewer__signature-image"
                    :src="receipt.signatureUrl"
                    :alt="`Signature ${receipt.caissierNom}`"
                  >
                  <span v-else>Signature non disponible</span>
                </div>
                <div class="receipt-viewer__signature-block">
                  <small>Cachet ecole</small>
                  <img
                    v-if="receipt.cachetDisponible && receipt.school.cachetUrl"
                    class="receipt-viewer__signature-image"
                    :src="receipt.school.cachetUrl"
                    :alt="`Cachet ${receipt.school.nom}`"
                  >
                  <strong v-else>Cachet non disponible</strong>
                  <span>Perimetre documentaire local</span>
                </div>
              </section>

              <footer class="receipt-viewer__thanks">
                {{ receipt.messageFinal }}
              </footer>
            </article>
          </SectionBlock>

          <div class="finance-status-strip finance-status-strip--neutral">
            <ShieldCheck />
            <div>
              <strong>Restriction documentaire</strong>
              <p>
                `ADMINISTRATEUR_ECOLE` ne devient pas reimprimeur par heritage. La signature portee reste celle du percepteur reel autorise.
              </p>
            </div>
          </div>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ArrowLeft, Printer, ReceiptText, ShieldCheck } from 'lucide-vue-next';
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
import { usePaymentReceiptStore } from '../stores/payment-receipt.store';

const route = useRoute();
const context = activeContextStore.state;
const session = sessionStore.state;
const paymentReceiptStore = usePaymentReceiptStore();
const doctrineAccess = useDoctrineAccess();
const exportInProgress = ref(false);

const receipt = computed(() => paymentReceiptStore.state.receipt);
const isAuthorized = computed(() => doctrineAccess.canAccessPage('PF-09'));
const technicalErrorMessage = computed(() =>
  paymentReceiptStore.state.errorMessage
  ?? 'Le backend n a pas pu restituer ce recu officiel.',
);
const canExportPdf = computed(() =>
  doctrineAccess.canUseAction('finances.receipts.reprint', 'PF-09') && receipt.value !== null && !exportInProgress.value,
);
const uiState = computed<'loading' | 'idle' | 'missing-receipt' | 'render-error'>(() => {
  const idRecu = lireIdRecuRoute();

  if (!idRecu) {
    return 'missing-receipt';
  }

  if (paymentReceiptStore.state.status === 'loading') {
    return 'loading';
  }

  if (paymentReceiptStore.state.status === 'error') {
    return 'render-error';
  }

  return 'idle';
});

const perimeterMessage = computed(() => {
  if (isAuthorized.value) {
    return `Lecture documentaire bornee a l ecole active: ${context.schoolName}. La signature reste celle du percepteur reel autorise.`;
  }

  return `Session visible: ${session.actorLabel}. La consultation documentaire du recu reste reservee au CAISSIER de l ecole courante.`;
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}

function lireParametreTexte(valeur: unknown): string | undefined {
  return typeof valeur === 'string' && valeur.trim().length > 0 ? valeur.trim() : undefined;
}

function lireIdRecuRoute(): string | undefined {
  return lireParametreTexte(route.params.idRecu) ?? lireParametreTexte(route.query.idRecu);
}

async function printReceipt(): Promise<void> {
  const idRecu = lireIdRecuRoute();

  if (!idRecu || !canExportPdf.value) {
    return;
  }

  exportInProgress.value = true;

  try {
    await paymentReceiptStore.telechargerPdf(idRecu);
  } finally {
    exportInProgress.value = false;
  }
}

watch(
  () => route.fullPath,
  async () => {
    const idRecu = lireIdRecuRoute();

    if (!idRecu || !isAuthorized.value) {
      paymentReceiptStore.reinitialiser();
      return;
    }

    await paymentReceiptStore.charger(idRecu);
  },
  { immediate: true },
);
</script>
