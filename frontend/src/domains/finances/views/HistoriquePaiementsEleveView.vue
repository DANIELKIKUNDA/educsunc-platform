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
          message="Preparation de l'identite eleve et de l'historique des paiements."
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Lecture non autorisee"
          message="Cette vue est reservee aux acteurs financiers ou delegues officiellement dans le bon perimetre."
        />

        <div class="finance-form-grid">
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
              <div>
                <small>Responsable</small>
                <strong>{{ profile.responsable }}</strong>
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
                <strong>{{ formatCurrency(profile.totalPaye) }}</strong>
              </div>
              <div>
                <small>Nombre de paiements</small>
                <strong>{{ filteredEntries.length }}</strong>
              </div>
              <div>
                <small>Dernier paiement</small>
                <strong>{{ profile.dernierPaiementLabel }}</strong>
              </div>
              <div>
                <small>Annee scolaire</small>
                <strong>{{ profile.anneeScolaire }}</strong>
              </div>
            </div>
          </SectionBlock>
        </div>

        <SectionBlock
          title="Filtres de l'historique"
          description="La lecture peut etre affinee par type de frais, mode de paiement et percepteur."
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
                <span>Percepteur</span>
                <select v-model="selectedCollector">
                  <option value="">Tous les percepteurs</option>
                  <option v-for="collector in availableCollectors" :key="collector" :value="collector">
                    {{ collector }}
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
                  <th>Recu</th>
                  <th>Type de frais</th>
                  <th>Libelle</th>
                  <th>Mode</th>
                  <th>Montant</th>
                  <th>Percepteur</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in filteredEntries" :key="entry.id">
                  <td>{{ entry.date }}</td>
                  <td>{{ entry.heure }}</td>
                  <td>{{ entry.numeroRecu }}</td>
                  <td>{{ entry.typeFrais }}</td>
                  <td>{{ entry.libelle }}</td>
                  <td>{{ entry.modePaiement }}</td>
                  <td>{{ formatCurrency(entry.montant) }}</td>
                  <td>{{ entry.percepteur }}</td>
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
                {{ selectedEntry.numeroRecu }} · {{ selectedEntry.libelle }} ·
                {{ formatCurrency(selectedEntry.montant) }} · {{ selectedEntry.modePaiement }} ·
                percu par {{ selectedEntry.percepteur }}.
              </p>
            </div>
          </div>
        </SectionBlock>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
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
import { authorizedPaymentHistoryActors, studentPaymentHistoryProfile } from '../data/historique-paiements-eleve.demo';

const context = activeContextStore.state;
const session = sessionStore.state;
const profile = ref({ ...studentPaymentHistoryProfile });
const uiState = ref<'loading' | 'idle' | 'technical-error'>('idle');
const selectedType = ref('');
const selectedMode = ref('');
const selectedCollector = ref('');
const selectedEntryId = ref('');

const isAuthorized = computed(() => authorizedPaymentHistoryActors.includes(session.actorCode as never));

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

const availableTypes = computed(() => [...new Set(profile.value.entries.map((entry) => entry.typeFrais))]);
const availableModes = computed(() => [...new Set(profile.value.entries.map((entry) => entry.modePaiement))]);
const availableCollectors = computed(() => [...new Set(profile.value.entries.map((entry) => entry.percepteur))]);

const filteredEntries = computed(() =>
  profile.value.entries.filter((entry) => {
    const matchesType = selectedType.value === '' || entry.typeFrais === selectedType.value;
    const matchesMode = selectedMode.value === '' || entry.modePaiement === selectedMode.value;
    const matchesCollector = selectedCollector.value === '' || entry.percepteur === selectedCollector.value;
    return matchesType && matchesMode && matchesCollector;
  }),
);

const selectedEntry = computed(() =>
  filteredEntries.value.find((entry) => entry.id === selectedEntryId.value) ?? null,
);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' FC';
}

function selectEntry(entryId: string): void {
  selectedEntryId.value = entryId;
}
</script>
