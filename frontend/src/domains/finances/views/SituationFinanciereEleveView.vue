<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-006"
      title="Situation financiere d'un eleve"
      description="Lecture synthetique de la dette, des frais exigibles et des arrieres d'un eleve dans le bon perimetre."
    >
      <template #actions>
        <div class="module-home-actions">
          <RouterLink class="module-quick-access__pill module-quick-access__pill--action" to="/app/finances">
            <ArrowLeft />
            <span>Retour finances</span>
          </RouterLink>
          <RouterLink
            class="module-quick-access__pill"
            :to="historiqueLink"
          >
            <ReceiptText />
            <span>Basculer vers historique</span>
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Cadre d'acces visible"
      description="La situation financiere reste une lecture bornee par le meme perimetre officiel que l'historique des paiements."
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
          title="Chargement de la situation financiere"
          message="Preparation de la dette consolidee et des frais exigibles de l'eleve cible."
        />
      </template>

      <template v-else-if="uiState === 'missing-student'">
        <ErrorState
          title="Eleve cible manquant"
          message="Ajoutez un idEleve dans la route pour ouvrir une situation financiere reelle."
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

        <template v-else-if="profile">
          <div class="finance-form-grid">
            <SectionBlock
              title="Identite eleve"
              description="L'eleve cible et son contexte scolaire restent visibles durant toute la lecture."
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
                  <small>Annee scolaire</small>
                  <strong>{{ profile.anneeScolaire }}</strong>
                </div>
                <div>
                  <small>Lecture</small>
                  <strong>Purement consultative</strong>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Carte situation financiere"
              description="Lecture immediate du niveau de dette, des frais exigibles et des arrieres."
            >
              <div class="finance-kpi-grid finance-kpi-grid--detail">
                <div class="finance-kpi-card">
                  <small>Dette consolidee</small>
                  <strong>{{ formatCurrency(profile.totalDette) }}</strong>
                  <span>Total restant a couvrir</span>
                </div>
                <div class="finance-kpi-card">
                  <small>Frais exigibles</small>
                  <strong>{{ formatCurrency(profile.totalExigible) }}</strong>
                  <span>Obligations actuellement exigibles</span>
                </div>
                <div class="finance-kpi-card">
                  <small>Arrieres</small>
                  <strong>{{ formatCurrency(profile.totalArrieres) }}</strong>
                  <span>Restes lies aux annees anterieures</span>
                </div>
              </div>

              <div class="finance-status-strip" :class="alertClass">
                <TriangleAlert v-if="profile.totalDette > 0" />
                <CircleCheckBig v-else />
                <div>
                  <strong>{{ alertTitle }}</strong>
                  <p>{{ alertMessage }}</p>
                </div>
              </div>
            </SectionBlock>
          </div>

          <SectionBlock
            title="Filtres d'obligations"
            description="La lecture peut etre affinee par type de frais et par statut sans transformer l'ecran en saisie."
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
                  <span>Statut</span>
                  <select v-model="selectedStatus">
                    <option value="">Tous les statuts</option>
                    <option v-for="status in availableStatuses" :key="status" :value="status">
                      {{ status }}
                    </option>
                  </select>
                </label>

                <label class="finance-field">
                  <span>Segment</span>
                  <select v-model="selectedSegment">
                    <option value="">Toutes les lignes</option>
                    <option value="EXIGIBLE">Exigibles</option>
                    <option value="ARRIERE">Arrieres</option>
                  </select>
                </label>
              </div>

              <div class="finance-guard-panel">
                <div class="finance-guard-panel__header">
                  <ShieldCheck />
                  <strong>Regles visibles</strong>
                </div>
                <ul>
                  <li>La situation financiere reprend exactement la doctrine d'acteurs de PF-05.</li>
                  <li>`TITULAIRE` reste borne a sa classe titulaire effective et a la bonne annee scolaire.</li>
                  <li>`PARENT` ne peut voir que les enfants autorises relies a son compte.</li>
                </ul>
              </div>
            </div>
          </SectionBlock>

          <div class="finance-form-grid">
            <SectionBlock
              title="Liste des obligations"
              description="Chaque ligne montre ce qui est attendu, paye et encore du."
            >
              <EmptyState
                v-if="filteredObligations.length === 0"
                title="Aucune obligation visible"
                message="Aucune obligation ne correspond aux filtres courants pour cet eleve."
              />

              <div v-else class="finance-table-shell">
                <table class="finance-table">
                  <thead>
                    <tr>
                      <th>Type de frais</th>
                      <th>Libelle</th>
                      <th>Periode</th>
                      <th>Attendu</th>
                      <th>Paye</th>
                      <th>Reste</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="obligation in filteredObligations" :key="obligation.id">
                      <td>{{ obligation.typeFrais }}</td>
                      <td>{{ obligation.libelle }}</td>
                      <td>{{ obligation.periode }}</td>
                      <td>{{ formatCurrency(obligation.montantAttendu) }}</td>
                      <td>{{ formatCurrency(obligation.montantPaye) }}</td>
                      <td>{{ formatCurrency(obligation.reste) }}</td>
                      <td>
                        <span class="finance-status-badge" :class="statusClass(obligation.statut)">
                          {{ obligation.statut }}
                        </span>
                      </td>
                      <td>
                        <button class="finance-link-action" type="button" @click="selectObligation(obligation.id)">
                          Consulter
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="selectedObligation" class="finance-status-strip finance-status-strip--neutral">
                <WalletCards />
                <div>
                  <strong>Detail obligation</strong>
                  <p>
                    {{ selectedObligation.libelle }} | attendu {{ formatCurrency(selectedObligation.montantAttendu) }}
                    | paye {{ formatCurrency(selectedObligation.montantPaye) }} | reste
                    {{ formatCurrency(selectedObligation.reste) }}.
                  </p>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Bloc frais exigibles"
              description="Synthese courte des lignes immediatement actionnables par les workflows financiers reels."
            >
              <div class="finance-list-card">
                <div
                  v-for="obligation in exigibleObligations"
                  :key="obligation.id"
                  class="finance-list-card__row"
                >
                  <div>
                    <strong>{{ obligation.libelle }}</strong>
                    <small>{{ obligation.typeFrais }} | {{ obligation.periode }}</small>
                  </div>
                  <strong>{{ formatCurrency(obligation.reste) }}</strong>
                </div>
              </div>

              <div class="finance-list-card finance-list-card--warning">
                <div class="finance-list-card__row">
                  <div>
                    <strong>Arrieres identifies</strong>
                    <small>Montant cumule des lignes anciennes restant dues</small>
                  </div>
                  <strong>{{ formatCurrency(profile.totalArrieres) }}</strong>
                </div>
              </div>
            </SectionBlock>
          </div>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import {
  ArrowLeft,
  CircleCheckBig,
  ReceiptText,
  ShieldCheck,
  TriangleAlert,
  WalletCards,
} from 'lucide-vue-next';
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
import { useStudentFinancialSituationStore } from '../stores/student-financial-situation.store';

const route = useRoute();
const context = activeContextStore.state;
const session = sessionStore.state;
const studentFinancialSituationStore = useStudentFinancialSituationStore();
const selectedType = ref('');
const selectedStatus = ref('');
const selectedSegment = ref('');
const selectedObligationId = ref('');

const isAuthorized = computed(() =>
  authorizedPaymentHistoryActors.includes(session.actorCode as never),
);
const profile = computed(() => studentFinancialSituationStore.state.profile);
const exigibleObligations = computed(() => studentFinancialSituationStore.state.exigibleObligations);
const technicalErrorMessage = computed(() =>
  studentFinancialSituationStore.state.errorMessage
  ?? 'Le backend n a pas pu restituer la situation financiere de cet eleve.',
);
const historiqueLink = computed(() => {
  const idEleve = lireIdEleveRoute();

  return idEleve ? `/app/finances/historiques/${idEleve}` : '/app/finances/historiques';
});

const uiState = computed<'loading' | 'idle' | 'missing-student' | 'technical-error'>(() => {
  const idEleve = lireIdEleveRoute();

  if (!idEleve) {
    return 'missing-student';
  }

  if (studentFinancialSituationStore.state.status === 'loading') {
    return 'loading';
  }

  if (studentFinancialSituationStore.state.status === 'error') {
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

const obligations = computed(() => profile.value?.obligations ?? []);
const availableTypes = computed(() => [...new Set(obligations.value.map((item) => item.typeFrais))]);
const availableStatuses = computed(() => [...new Set(obligations.value.map((item) => item.statut))]);

const filteredObligations = computed(() =>
  obligations.value.filter((item) => {
    const matchesType = selectedType.value === '' || item.typeFrais === selectedType.value;
    const matchesStatus = selectedStatus.value === '' || item.statut === selectedStatus.value;
    const matchesSegment = selectedSegment.value === '' || item.segment === selectedSegment.value;

    return matchesType && matchesStatus && matchesSegment;
  }),
);

const selectedObligation = computed(
  () => filteredObligations.value.find((item) => item.id === selectedObligationId.value) ?? null,
);

const alertClass = computed(() =>
  (profile.value?.totalDette ?? 0) > 0 ? 'finance-status-strip--error' : 'finance-status-strip--success',
);

const alertTitle = computed(() =>
  (profile.value?.totalDette ?? 0) > 0 ? 'Situation avec dette restante' : 'Situation financiere en ordre',
);

const alertMessage = computed(() => {
  if (!profile.value) {
    return 'La situation financiere sera visible des qu un eleve reel sera charge.';
  }

  return profile.value.totalDette > 0
    ? `Des frais restent dus pour ${profile.value.fullName}. La lecture combine dette consolidee, frais exigibles et arrieres.`
    : `Aucune dette restante n est visible pour ${profile.value.fullName}.`;
});

function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FC`;
}

function statusClass(status: string): string {
  switch (status) {
    case 'EN_ORDRE':
      return 'finance-status-badge--success';
    case 'PARTIEL':
      return 'finance-status-badge--warning';
    default:
      return 'finance-status-badge--error';
  }
}

function selectObligation(obligationId: string): void {
  selectedObligationId.value = obligationId;
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

    selectedType.value = '';
    selectedStatus.value = '';
    selectedSegment.value = '';
    selectedObligationId.value = '';

    if (!idEleve || !isAuthorized.value) {
      studentFinancialSituationStore.reinitialiser();
      return;
    }

    await studentFinancialSituationStore.charger({
      idEleve,
      anneeScolaire: lireParametreTexte(route.query.anneeScolaire),
      classe: lireParametreTexte(route.query.classe),
      section: lireParametreTexte(route.query.section),
    });
  },
  { immediate: true },
);
</script>
