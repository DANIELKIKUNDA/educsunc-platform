<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-005"
      title="Historique des paiements"
      description="Lecture detaillee de l'historique des paiements d'un eleve dans le bon perimetre et selon les delegations officielles."
    >
      <template #actions>
        <RouterLink class="module-quick-access__pill module-quick-access__pill--action" to="/app/finances">
          <ArrowLeft />
          <span>Retour finances</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock
      title="Cadre d'acces visible"
      description="Le frontend rend explicite le perimetre de lecture pour chaque acteur sans etendre la consultation au-dela des delegations officielles."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <ReceiptText />
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

    <AccessBoundary capability="module.finances.access">
      <template v-if="uiState === 'loading'">
        <LoadingState
          title="Chargement de l'historique"
          message="Preparation de l'identite eleve et de l'historique reel des paiements."
        />
      </template>

      <template v-else-if="uiState === 'missing-student'">
        <ErrorState
          title="Eleve cible manquant"
          message="Ajoutez un idEleve dans la route pour ouvrir un historique reel de paiements."
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
          message="Cette vue est reservee aux acteurs financiers ou delegues officiellement dans le bon perimetre."
        />

        <div v-else-if="profile" class="finance-form-grid">
          <SectionBlock
            title="Bandeau eleve"
            description="L'identite de l'eleve et son contexte scolaire restent visibles pendant toute la lecture."
          >
            <div class="finance-student-banner finance-student-banner--profile">
              <div>
                <small>Code eleve</small>
                <strong>{{ profile.matricule }}</strong>
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
              <div>
                <small>Sexe</small>
                <strong>{{ profile.sexe }}</strong>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock
            title="Indicateurs historiques"
            description="Les totaux utiles restent visibles avant la lecture detaillee des operations."
          >
            <div class="finance-summary-grid finance-summary-grid--kpi">
              <div>
                <small>Total paye</small>
                <strong>{{ formatCurrency(totalPaye) }}</strong>
              </div>
              <div>
                <small>Nombre de paiements</small>
                <strong>{{ filteredEntries.length }}</strong>
              </div>
              <div>
                <small>Dernier paiement</small>
                <strong>{{ dernierPaiementLabel }}</strong>
              </div>
              <div>
                <small>Annee scolaire</small>
                <strong>{{ profile.anneeScolaire }}</strong>
              </div>
            </div>
          </SectionBlock>
        </div>

        <SectionBlock
          v-if="profile"
          title="Filtres de l'historique"
          description="La lecture peut etre affinee par type de frais, mode de paiement et statut reel du backend."
        >
          <div class="finance-form-stack">
            <div class="finance-filter-grid">
              <label class="finance-field">
                <span>Type de frais</span>
                <select v-model="selectedType">
                  <option value="">Tous les types</option>
                  <option v-for="type in availableTypes" :key="type" :value="type">
                    {{ type }}
                  </option>
                </select>
              </label>

              <label class="finance-field">
                <span>Mode de paiement</span>
                <select v-model="selectedMode">
                  <option value="">Tous les modes</option>
                  <option v-for="mode in availableModes" :key="mode" :value="mode">
                    {{ mode }}
                  </option>
                </select>
              </label>

              <label class="finance-field">
                <span>Statut</span>
                <select v-model="selectedStatus">
                  <option value="">Tous les statuts</option>
                  <option v-for="status in availableStatuses" :key="status" :value="status">
                    {{ status }}
                  </option>
                </select>
              </label>
            </div>

            <div class="finance-guard-panel">
              <div class="finance-guard-panel__header">
                <ShieldCheck />
                <strong>Regles visibles</strong>
              </div>
              <ul>
                <li>`TITULAIRE` reste limite a sa classe titulaire et a la bonne annee scolaire.</li>
                <li>`PARENT` ne peut voir que ses enfants autorises.</li>
                <li>Les acteurs pedagogiques delegues restent bornes par section et parametrage ecole.</li>
              </ul>
            </div>
          </div>
        </SectionBlock>

        <SectionBlock
          v-if="profile"
          title="Historique des paiements"
          description="La table garde une lecture chronologique claire avec acces au detail de chaque paiement."
        >
          <EmptyState
            v-if="filteredEntries.length === 0"
            title="Historique vide"
            message="Aucun paiement ne correspond aux filtres courants pour cet eleve."
          />

          <div v-else class="finance-table-shell">
            <table class="finance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Paiement</th>
                  <th>Type de frais</th>
                  <th>Mode</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in filteredEntries" :key="entry.id">
                  <td>{{ entry.date }}</td>
                  <td>{{ entry.heure }}</td>
                  <td>{{ entry.id }}</td>
                  <td>{{ entry.typeFrais }}</td>
                  <td>{{ entry.modePaiement }}</td>
                  <td>{{ formatCurrency(entry.montant) }}</td>
                  <td>
                    <span class="finance-status-badge" :class="entry.statut === 'VALIDE' ? 'finance-status-badge--success' : 'finance-status-badge--error'">
                      {{ entry.statut }}
                    </span>
                  </td>
                  <td>
                    <button class="finance-link-action" type="button" @click="selectEntry(entry.id)">
                      Consulter
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="selectedEntry" class="finance-status-strip finance-status-strip--neutral">
            <ReceiptText />
            <div>
              <strong>Detail paiement</strong>
              <p>
                {{ selectedEntry.id }} | {{ selectedEntry.typeFrais }} |
                {{ formatCurrency(selectedEntry.montant) }} | {{ selectedEntry.modePaiement }} |
                statut {{ selectedEntry.statut }}.
              </p>
            </div>
          </div>
        </SectionBlock>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ArrowLeft, ReceiptText, ShieldCheck } from 'lucide-vue-next';
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
import { authorizedPaymentHistoryActors } from '../models/payment-history.model';
import { usePaymentHistoryStore } from '../stores/payment-history.store';

const route = useRoute();
const context = activeContextStore.state;
const session = sessionStore.state;
const paymentHistoryStore = usePaymentHistoryStore();
const selectedType = ref('');
const selectedMode = ref('');
const selectedStatus = ref('');
const selectedEntryId = ref('');

const isAuthorized = computed(() => authorizedPaymentHistoryActors.includes(session.actorCode as never));
const profile = computed(() => paymentHistoryStore.state.profile);
const entries = computed(() => paymentHistoryStore.state.entries);
const technicalErrorMessage = computed(() =>
  paymentHistoryStore.state.errorMessage
  ?? 'Le backend n a pas pu restituer l historique des paiements pour cet eleve.',
);

const uiState = computed<'loading' | 'idle' | 'missing-student' | 'technical-error'>(() => {
  const idEleve = lireIdEleveRoute();

  if (!idEleve) {
    return 'missing-student';
  }

  if (paymentHistoryStore.state.status === 'loading') {
    return 'loading';
  }

  if (paymentHistoryStore.state.status === 'error') {
    return 'technical-error';
  }

  return 'idle';
});

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'TITULAIRE':
      return 'Lecture financiere bornee a la classe titulaire effective et a la bonne annee scolaire.';
    case 'PARENT':
      return 'Lecture financiere bornee aux enfants autorises rattaches a ce parent.';
    case 'PREFET_ETUDES':
    case 'DIRECTEUR_ETUDES':
    case 'DIRECTEUR_PRIMAIRE':
    case 'DIRECTEUR_MATERNELLE':
      return 'Lecture financiere bornee par section et delegation active de l ecole.';
    case 'GESTIONNAIRE_ORGANISATION':
    case 'PROMOTEUR_ORGANISATION':
      return `Lecture financiere bornee a l organisation active: ${context.organizationName}.`;
    case 'CAISSIER':
    case 'ADMINISTRATEUR_ECOLE':
      return `Lecture financiere bornee a l ecole active: ${context.schoolName}.`;
    default:
      return `Session visible: ${session.actorLabel}. Cette vue n est pas ouverte a cet acteur.`;
  }
});

const availableTypes = computed(() => [...new Set(entries.value.map((entry) => entry.typeFrais))]);
const availableModes = computed(() => [...new Set(entries.value.map((entry) => entry.modePaiement))]);
const availableStatuses = computed(() => [...new Set(entries.value.map((entry) => entry.statut))]);

const filteredEntries = computed(() =>
  entries.value.filter((entry) => {
    const matchesType = selectedType.value === '' || entry.typeFrais === selectedType.value;
    const matchesMode = selectedMode.value === '' || entry.modePaiement === selectedMode.value;
    const matchesStatus = selectedStatus.value === '' || entry.statut === selectedStatus.value;

    return matchesType && matchesMode && matchesStatus;
  }),
);

const totalPaye = computed(() =>
  filteredEntries.value.reduce((total, entry) => total + entry.montant, 0),
);

const dernierPaiementLabel = computed(() => {
  const premier = filteredEntries.value[0];

  if (!premier) {
    return 'Aucun paiement';
  }

  return `${premier.date} a ${premier.heure}`;
});

const selectedEntry = computed(() =>
  filteredEntries.value.find((entry) => entry.id === selectedEntryId.value) ?? null,
);

function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FC`;
}

function selectEntry(entryId: string): void {
  selectedEntryId.value = entryId;
}

function lireParametreTexte(valeur: unknown): string | undefined {
  return typeof valeur === 'string' && valeur.trim().length > 0 ? valeur.trim() : undefined;
}

function lireIdEleveRoute(): string | undefined {
  return lireParametreTexte(route.params.idEleve) ?? lireParametreTexte(route.query.idEleve);
}

watch(
  () => route.fullPath,
  async () => {
    const idEleve = lireIdEleveRoute();

    selectedEntryId.value = '';
    selectedType.value = '';
    selectedMode.value = '';
    selectedStatus.value = '';

    if (!idEleve || !isAuthorized.value) {
      paymentHistoryStore.reinitialiser();
      return;
    }

    await paymentHistoryStore.charger({
      idEleve,
      anneeScolaire: lireParametreTexte(route.query.anneeScolaire),
      classe: lireParametreTexte(route.query.classe),
      section: lireParametreTexte(route.query.section),
    });
  },
  { immediate: true },
);
</script>
