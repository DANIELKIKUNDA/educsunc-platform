<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-004"
      title="Caisse du jour"
      description="Centre de travail de lecture pour consulter la caisse du jour dans le bon perimetre local ou organisationnel."
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
      description="La lecture de caisse est autorisee a certains acteurs, mais aucune mutation locale n'est exposee aux simples lecteurs."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <WalletCards />
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
          title="Chargement de la caisse du jour"
          message="Preparation du resume de caisse, des KPIs et de la liste des operations."
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Lecture non autorisee"
          message="Cette vue est reservee au caissier, a l'administrateur ecole ou aux acteurs organisationnels autorises."
        />

        <div class="finance-kpi-grid">
          <div class="finance-kpi-card">
            <small>Statut caisse</small>
            <strong>{{ workbench.status }}</strong>
            <span>{{ workbench.dateLabel }}</span>
          </div>
          <div class="finance-kpi-card">
            <small>Total collecte</small>
            <strong>{{ formatCurrency(workbench.totalCollected) }}</strong>
            <span>{{ filteredOperations.length }} operations visibles</span>
          </div>
          <div class="finance-kpi-card">
            <small>Poste de caisse</small>
            <strong>{{ workbench.schoolCashDeskLabel }}</strong>
            <span>{{ accessScopeLabel }}</span>
          </div>
        </div>

        <div class="finance-form-grid">
          <SectionBlock
            title="Filtres de lecture"
            description="La lecture peut etre restreinte par jour, acteur et type de frais sans ouvrir de mutation de caisse."
          >
            <div class="finance-form-stack">
              <div class="finance-filter-grid">
                <label class="finance-field">
                  <span>Jour</span>
                  <select v-model="selectedDay">
                    <option v-for="day in availableDays" :key="day" :value="day">
                      {{ day }}
                    </option>
                  </select>
                </label>

                <label class="finance-field">
                  <span>Acteur</span>
                  <select v-model="selectedActor">
                    <option value="">Tous les acteurs</option>
                    <option v-for="actor in availableActors" :key="actor" :value="actor">
                      {{ actor }}
                    </option>
                  </select>
                </label>

                <label class="finance-field">
                  <span>Type de frais</span>
                  <select v-model="selectedType">
                    <option value="">Tous les types</option>
                    <option v-for="type in availableTypes" :key="type" :value="type">
                      {{ type }}
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
                  <li>Les lecteurs non caissiers ne voient aucune action de mutation locale.</li>
                  <li>`CAISSIER` et `ADMINISTRATEUR_ECOLE` restent limites a la meme ecole.</li>
                  <li>`GESTIONNAIRE_ORGANISATION` et `PROMOTEUR_ORGANISATION` lisent dans la meme organisation.</li>
                </ul>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock
            title="Indicateurs de caisse"
            description="Lecture rapide de la repartition du jour avant l'analyse detaillee des operations."
          >
            <div class="finance-summary-grid">
              <div>
                <small>Recus emis</small>
                <strong>{{ workbench.receiptsCount }}</strong>
              </div>
              <div>
                <small>Especes</small>
                <strong>{{ formatCurrency(workbench.cashAmount) }}</strong>
              </div>
              <div>
                <small>Mobile Money</small>
                <strong>{{ formatCurrency(workbench.mobileMoneyAmount) }}</strong>
              </div>
              <div>
                <small>Virement</small>
                <strong>{{ formatCurrency(workbench.transferAmount) }}</strong>
              </div>
            </div>
          </SectionBlock>
        </div>

        <SectionBlock
          title="Operations du jour"
          description="Chaque ligne reste consultative et permet la relecture precise d'une operation de caisse."
        >
          <EmptyState
            v-if="filteredOperations.length === 0"
            title="Aucune operation visible"
            message="Aucune operation ne correspond aux filtres courants pour la caisse du jour."
          />

          <div v-else class="finance-table-shell">
            <table class="finance-table">
              <thead>
                <tr>
                  <th>Heure</th>
                  <th>Recu</th>
                  <th>Eleve</th>
                  <th>Classe</th>
                  <th>Type de frais</th>
                  <th>Mode</th>
                  <th>Montant</th>
                  <th>Acteur</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="operation in filteredOperations" :key="operation.id">
                  <td>{{ operation.heure }}</td>
                  <td>{{ operation.numeroRecu }}</td>
                  <td>{{ operation.eleve }}</td>
                  <td>{{ operation.classe }}</td>
                  <td>{{ operation.typeFrais }}</td>
                  <td>{{ operation.modePaiement }}</td>
                  <td>{{ formatCurrency(operation.montant) }}</td>
                  <td>{{ operation.acteur }}</td>
                  <td>
                    <button class="finance-link-action" type="button" @click="selectOperation(operation.id)">
                      Consulter
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="selectedOperation" class="finance-status-strip finance-status-strip--neutral">
            <ReceiptText />
            <div>
              <strong>Detail operation</strong>
              <p>
                {{ selectedOperation.numeroRecu }} · {{ selectedOperation.eleve }} ·
                {{ selectedOperation.typeFrais }} · {{ formatCurrency(selectedOperation.montant) }}.
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
import { ArrowLeft, ReceiptText, ShieldCheck, WalletCards } from 'lucide-vue-next';
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
import { authorizedCashWorkbenchActors, dailyCashWorkbench } from '../data/caisse-du-jour.demo';

const context = activeContextStore.state;
const session = sessionStore.state;
const workbench = ref({ ...dailyCashWorkbench });
const uiState = ref<'loading' | 'idle' | 'technical-error'>('idle');
const selectedDay = ref(workbench.value.dateLabel);
const selectedActor = ref('');
const selectedType = ref('');
const selectedOperationId = ref('');

const isAuthorized = computed(() => authorizedCashWorkbenchActors.includes(session.actorCode as never));

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'CAISSIER':
    case 'ADMINISTRATEUR_ECOLE':
      return `Lecture de caisse bornee a l ecole active: ${context.schoolName}.`;
    case 'GESTIONNAIRE_ORGANISATION':
    case 'PROMOTEUR_ORGANISATION':
      return `Lecture de caisse bornee a l organisation active: ${context.organizationName}.`;
    default:
      return `Session visible: ${session.actorLabel}. Cette vue n est pas ouverte a cet acteur.`;
  }
});

const accessScopeLabel = computed(() => {
  if (session.actorCode === 'GESTIONNAIRE_ORGANISATION' || session.actorCode === 'PROMOTEUR_ORGANISATION') {
    return 'Lecture organisationnelle';
  }

  return 'Lecture ecole active';
});

const availableDays = computed(() => [workbench.value.dateLabel]);
const availableActors = computed(() => [...new Set(workbench.value.operations.map((operation) => operation.acteur))]);
const availableTypes = computed(() => [...new Set(workbench.value.operations.map((operation) => operation.typeFrais))]);

const filteredOperations = computed(() =>
  workbench.value.operations.filter((operation) => {
    const matchesDay = selectedDay.value === workbench.value.dateLabel;
    const matchesActor = selectedActor.value === '' || operation.acteur === selectedActor.value;
    const matchesType = selectedType.value === '' || operation.typeFrais === selectedType.value;
    return matchesDay && matchesActor && matchesType;
  }),
);

const selectedOperation = computed(() =>
  filteredOperations.value.find((operation) => operation.id === selectedOperationId.value) ?? null,
);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' FC';
}

function selectOperation(operationId: string): void {
  selectedOperationId.value = operationId;
}
</script>
