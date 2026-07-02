<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-014"
      title="Arrieres d'un eleve"
      description="Vue detail pour consulter les obligations restees impayees d'un eleve dans le bon perimetre."
    >
      <template #actions>
        <div class="module-home-actions">
          <RouterLink class="module-quick-access__pill module-quick-access__pill--action" to="/app/finances">
            <ArrowLeft />
            <span>Retour finances</span>
          </RouterLink>
          <RouterLink class="module-quick-access__pill" to="/app/finances/dettes">
            <WalletCards />
            <span>Situation financiere</span>
          </RouterLink>
          <RouterLink class="module-quick-access__pill" to="/app/finances/historiques">
            <ReceiptText />
            <span>Historique</span>
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Cadre de lecture visible"
      description="Les arrieres restent une lecture ciblee bornee au meme perimetre que la situation financiere eleve."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <FileClock />
          </div>
          <div>
            <p class="finance-hero-strip__label">Acteur visible</p>
            <strong>{{ session.actorLabel }}</strong>
          </div>
        </div>
        <div class="module-home-grid">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Ecole" :value="context.schoolName" />
          <ContextBadge label="Eleve" :value="profile?.eleve ?? 'Eleve cible a charger'" />
          <ContextBadge label="Classe" :value="profile?.classe ?? 'Classe a connecter'" />
        </div>
      </div>
      <div class="finance-info-banner">
        <ShieldCheck />
        <p class="finance-form-note">{{ perimeterMessage }}</p>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="PF-15-ARR">
      <template v-if="uiState === 'loading'">
        <LoadingState
          title="Chargement des arrieres"
          message="Preparation des obligations restees impayees et du resume des montants."
        />
      </template>

      <template v-else-if="uiState === 'missing-student'">
        <ErrorState
          title="Eleve cible manquant"
          message="Ajoutez un idEleve dans la route pour ouvrir des arrieres reels."
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
          message="Cette vue est reservee aux lecteurs financiers ou delegues officiellement dans leur perimetre."
        />

        <template v-else-if="profile">
          <div class="finance-form-grid">
            <SectionBlock
              title="Resume montant"
              description="Vue immediate des arrieres et du contexte de l'eleve."
            >
              <div class="finance-student-banner finance-student-banner--profile">
                <div>
                  <small>Eleve</small>
                  <strong>{{ profile.eleve }}</strong>
                </div>
                <div>
                  <small>Code eleve</small>
                  <strong>{{ profile.matricule }}</strong>
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
                  <small>Nombre de lignes</small>
                  <strong>{{ profile.nombreLignes }}</strong>
                </div>
                <div>
                  <small>Total arrieres</small>
                  <strong>{{ formatCurrency(profile.totalArrieres) }}</strong>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Liens de navigation locale"
              description="La lecture detaillee des arrieres reste connectee aux autres vues financieres de l'eleve."
            >
              <div class="finance-list-card">
                <div class="finance-list-card__row">
                  <div>
                    <strong>Situation financiere</strong>
                    <small>Dette consolidee, frais exigibles, arrieres</small>
                  </div>
                  <RouterLink class="finance-link-action" :to="`/app/finances/dettes/${profile.id}`">
                    Ouvrir
                  </RouterLink>
                </div>
                <div class="finance-list-card__row">
                  <div>
                    <strong>Historique des paiements</strong>
                    <small>Chronologie des operations de paiement de l'eleve</small>
                  </div>
                  <RouterLink class="finance-link-action" :to="`/app/finances/historiques/${profile.id}`">
                    Ouvrir
                  </RouterLink>
                </div>
              </div>
            </SectionBlock>
          </div>

          <SectionBlock
            title="Tableau des arrieres"
            description="Chaque ligne represente une obligation ancienne restee impayee avec ses references utiles."
          >
            <EmptyState
              v-if="rows.length === 0"
              title="Aucun arriere"
              message="Aucune obligation impayee n'est visible pour cet eleve."
            />

            <div v-else class="finance-table-shell">
              <table class="finance-table">
                <thead>
                  <tr>
                    <th>Type de frais</th>
                    <th>Libelle</th>
                    <th>Periode</th>
                    <th>Montant initial</th>
                    <th>Paye</th>
                    <th>Restant</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in rows" :key="row.id">
                    <td>{{ row.typeFrais }}</td>
                    <td>{{ row.libelle }}</td>
                    <td>{{ row.periode }}</td>
                    <td>{{ formatCurrency(row.montantInitial) }}</td>
                    <td>{{ formatCurrency(row.montantPaye) }}</td>
                    <td>{{ formatCurrency(row.montantRestant) }}</td>
                    <td>
                      <button class="finance-link-action" type="button" @click="selectedRowId = row.id">
                        Ouvrir detail
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="selectedRow" class="finance-status-strip finance-status-strip--neutral">
              <FileClock />
              <div>
                <strong>Detail arriere</strong>
                <p>
                  {{ selectedRow.libelle }} | {{ selectedRow.periode }} | reste
                  {{ formatCurrency(selectedRow.montantRestant) }} apres
                  {{ formatCurrency(selectedRow.montantPaye) }} deja payes.
                </p>
              </div>
            </div>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ArrowLeft, FileClock, ReceiptText, ShieldCheck, WalletCards } from 'lucide-vue-next';
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
import { useStudentArrearsStore } from '../stores/student-arrears.store';

const route = useRoute();
const context = activeContextStore.state;
const session = sessionStore.state;
const studentArrearsStore = useStudentArrearsStore();
const doctrineAccess = useDoctrineAccess();
const selectedRowId = ref('');

const isAuthorized = computed(() => doctrineAccess.canAccessPage('PF-15-ARR'));
const profile = computed(() => studentArrearsStore.state.profile);
const rows = computed(() => studentArrearsStore.state.rows);
const technicalErrorMessage = computed(() =>
  studentArrearsStore.state.errorMessage
  ?? 'Le backend n a pas pu restituer les arrieres de cet eleve.',
);
const uiState = computed<'loading' | 'idle' | 'missing-student' | 'technical-error'>(() => {
  const idEleve = lireIdEleveRoute();

  if (!idEleve) {
    return 'missing-student';
  }

  if (studentArrearsStore.state.status === 'loading') {
    return 'loading';
  }

  if (studentArrearsStore.state.status === 'error') {
    return 'technical-error';
  }

  return 'idle';
});

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'GESTIONNAIRE_ORGANISATION':
    case 'PROMOTEUR_ORGANISATION':
      return `Lecture bornee a l organisation active: ${context.organizationName}.`;
    case 'TITULAIRE':
      return 'Lecture bornee a l eleve visible dans la classe titulaire effective si la delegation ecole est active.';
    case 'PREFET_ETUDES':
    case 'DIRECTEUR_ETUDES':
    case 'DIRECTEUR_PRIMAIRE':
    case 'DIRECTEUR_MATERNELLE':
      return 'Lecture bornee a l eleve visible dans la section de delegation.';
    case 'CAISSIER':
    case 'ADMINISTRATEUR_ECOLE':
      return `Lecture bornee a l ecole active: ${context.schoolName}.`;
    default:
      return `Session visible: ${session.actorLabel}. Cette vue n est pas ouverte a cet acteur.`;
  }
});

const selectedRow = computed(() => rows.value.find((row) => row.id === selectedRowId.value) ?? null);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' FC';
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

    selectedRowId.value = '';

    if (!idEleve || !isAuthorized.value) {
      studentArrearsStore.reinitialiser();
      return;
    }

    await studentArrearsStore.charger({
      idEleve,
      classe: lireParametreTexte(route.query.classe),
      section: lireParametreTexte(route.query.section),
    });
  },
  { immediate: true },
);
</script>
