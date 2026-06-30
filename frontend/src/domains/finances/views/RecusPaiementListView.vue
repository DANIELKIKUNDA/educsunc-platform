<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-010"
      title="Consultation des recus emis"
      description="Vue liste pour relire les recus emis dans l'ecole courante, avec recherche simple et ouverture du detail."
    >
      <template #actions>
        <RouterLink class="module-quick-access__pill module-quick-access__pill--action" to="/app/finances">
          <ArrowLeft />
          <span>Retour finances</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock
      title="Cadre de lecture visible"
      description="La consultation des recus emis reste strictement reservee au caissier de l'ecole courante."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <ScrollText />
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
          <ContextBadge label="Volume" :value="String(receipts?.totalRecus ?? 0)" />
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
          title="Chargement des recus"
          message="Preparation de la liste des recus emis et de leurs filtres de recherche."
        />
      </template>

      <template v-else-if="uiState === 'technical-error'">
        <ErrorState
          title="Lecture technique indisponible"
          :message="technicalErrorMessage"
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Lecture non autorisee"
          message="Cette vue est reservee au caissier actif de l'ecole courante."
        />

        <template v-else-if="receipts">
          <SectionBlock
            title="Barre de filtres"
            description="Recherche simple par numero de recu, eleve et plage de dates."
          >
            <div class="finance-form-stack">
              <div class="finance-filter-grid finance-filter-grid--wide">
                <label class="finance-field">
                  <span>Numero recu</span>
                  <input v-model="numeroRecuInput" type="text" />
                </label>

                <label class="finance-field">
                  <span>Eleve</span>
                  <input v-model="eleveInput" type="text" />
                </label>

                <label class="finance-field">
                  <span>Date debut</span>
                  <input v-model="dateDebutInput" type="date" />
                </label>

                <label class="finance-field">
                  <span>Date fin</span>
                  <input v-model="dateFinInput" type="date" />
                </label>
              </div>

              <div class="finance-guard-panel">
                <div class="finance-guard-panel__header">
                  <ShieldCheck />
                  <strong>Regles visibles</strong>
                </div>
                <ul>
                  <li>La lecture des recus reste strictement locale a l'organisation et a l'ecole courantes.</li>
                  <li>`ADMINISTRATEUR_ECOLE` ne devient pas lecteur des recus par heritage.</li>
                  <li>Le detail d'un recu ouvre la vue documentaire dediee PF-007.</li>
                </ul>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock
            title="Tableau des recus"
            description="Lecture dense et rapide des recus emis avec pagination visible."
          >
            <EmptyState
              v-if="filteredReceipts.length === 0"
              title="Aucun recu"
              message="Aucun recu ne correspond aux filtres courants."
            />

            <div v-else class="finance-table-shell">
              <table class="finance-table">
                <thead>
                  <tr>
                    <th>Numero recu</th>
                    <th>Eleve</th>
                    <th>Montant</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Mode de paiement</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="receipt in paginatedReceipts" :key="receipt.idRecu">
                    <td>{{ receipt.numeroRecu }}</td>
                    <td>{{ receipt.eleveNom }}</td>
                    <td>{{ formatCurrency(receipt.totalPaye) }}</td>
                    <td>{{ receipt.dateEmission }}</td>
                    <td>{{ receipt.heureEmission }}</td>
                    <td>{{ receipt.modePaiement }}</td>
                    <td>
                      <span class="finance-status-badge" :class="receipt.statutRecu === 'VALIDE' ? 'finance-status-badge--success' : 'finance-status-badge--warning'">
                        {{ receipt.statutRecu }}
                      </span>
                    </td>
                    <td>
                      <RouterLink class="finance-link-action" :to="`/app/finances/recus/${receipt.idRecu}`">
                        Ouvrir detail
                      </RouterLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="finance-pagination">
              <button class="finance-pagination__button" type="button" :disabled="pageCourante === 1" @click="pageCourante -= 1">
                Precedent
              </button>
              <strong>Page {{ pageCourante }}</strong>
              <button class="finance-pagination__button" type="button" :disabled="pageCourante >= totalPages" @click="pageCourante += 1">
                Suivant
              </button>
            </div>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, ScrollText, ShieldCheck } from 'lucide-vue-next';
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
import { usePaymentReceiptListStore } from '../stores/payment-receipt-list.store';

const context = activeContextStore.state;
const session = sessionStore.state;
const paymentReceiptListStore = usePaymentReceiptListStore();
const numeroRecuInput = ref('');
const eleveInput = ref('');
const dateDebutInput = ref('');
const dateFinInput = ref('');
const pageCourante = ref(1);

const receipts = computed(() => paymentReceiptListStore.state.receipts);
const isAuthorized = computed(() => session.actorCode === 'CAISSIER');
const technicalErrorMessage = computed(() =>
  paymentReceiptListStore.state.errorMessage
  ?? 'Le backend n a pas pu restituer la liste des recus.',
);
const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
  if (paymentReceiptListStore.state.status === 'loading') {
    return 'loading';
  }

  if (paymentReceiptListStore.state.status === 'error') {
    return 'technical-error';
  }

  return 'idle';
});

const perimeterMessage = computed(() => {
  if (isAuthorized.value) {
    return `Lecture des recus bornee a l organisation et a l ecole courantes: ${context.schoolName}.`;
  }

  return `Session visible: ${session.actorLabel}. Cette vue liste reste reservee au CAISSIER.`;
});

const filteredReceipts = computed(() =>
  (receipts.value?.rows ?? []).filter((receipt) => {
    const matchesNumero =
      numeroRecuInput.value.trim() === ''
      || receipt.numeroRecu.toLowerCase().includes(numeroRecuInput.value.trim().toLowerCase());
    const matchesEleve =
      eleveInput.value.trim() === ''
      || receipt.eleveNom.toLowerCase().includes(eleveInput.value.trim().toLowerCase());
    const matchesDateDebut =
      dateDebutInput.value.trim() === '' || convertirDateAffichageEnIso(receipt.dateEmission) >= dateDebutInput.value.trim();
    const matchesDateFin =
      dateFinInput.value.trim() === '' || convertirDateAffichageEnIso(receipt.dateEmission) <= dateFinInput.value.trim();

    return matchesNumero && matchesEleve && matchesDateDebut && matchesDateFin;
  }),
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredReceipts.value.length / 10)),
);

const paginatedReceipts = computed(() => {
  const start = (pageCourante.value - 1) * 10;
  return filteredReceipts.value.slice(start, start + 10);
});

function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FC`;
}

function convertirDateAffichageEnIso(dateFr: string): string {
  const segments = dateFr.split('/');

  if (segments.length !== 3) {
    return dateFr;
  }

  const [jour, mois, annee] = segments;
  return `${annee}-${mois}-${jour}`;
}

watch(
  () => [numeroRecuInput.value, dateDebutInput.value, dateFinInput.value],
  async () => {
    if (!isAuthorized.value) {
      paymentReceiptListStore.reinitialiser();
      return;
    }

    pageCourante.value = 1;

    await paymentReceiptListStore.charger({
      numeroRecu: numeroRecuInput.value.trim() || undefined,
      dateDebut: dateDebutInput.value.trim() || undefined,
      dateFin: dateFinInput.value.trim() || undefined,
    });
  },
  { immediate: true },
);

watch(
  () => eleveInput.value,
  () => {
    pageCourante.value = 1;
  },
);
</script>
