<template>
  <PageContainer>
    <PageHeader
      eyebrow="ADM-HOME"
      title="Centre administration ecole"
      description="Pilotage structurel des ecoles avant exploitation locale: registre, detail, activation de contexte et passage vers les modules ecole."
    >
      <template #actions>
        <div class="adm-home-actions">
          <RouterLink class="adm-home-pill adm-home-pill--primary" to="/app/administration-ecole/ecoles">
            Registre des ecoles
          </RouterLink>
          <RouterLink class="adm-home-pill" to="/app/organisation/ecoles">
            Retour registre organisationnel
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Perimetre courant"
      description="Le centre reprend l'organisation active et les ecoles rattachees pour ouvrir rapidement le bon perimetre."
    >
      <div class="adm-home-grid">
        <StatChip label="Acteur" :value="session.actorLabel" />
        <StatChip label="Niveau" :value="context.governanceLevel" />
        <StatChip label="Organisation" :value="context.organizationName" />
        <StatChip label="Ecole active" :value="context.schoolName" />
      </div>
    </SectionBlock>

    <LoadingState
      v-if="store.state.status === 'loading' && store.state.organisations.length === 0"
      title="Chargement structurel"
      message="Lecture des organisations et des ecoles en cours."
    />
    <ErrorState
      v-else-if="store.state.status === 'error' && store.state.organisations.length === 0"
      title="Administration indisponible"
      :message="store.state.errorMessage ?? 'Le centre administration ecole ne peut pas etre charge.'"
    />

    <template v-else>
      <SectionBlock
        title="Parcours prioritaire"
        description="Une fois l organisation active, ce centre doit faire descendre vers l ecole puis ouvrir les premiers workflows locaux."
      >
        <div class="adm-home-journey-grid">
          <RouterLink
            v-for="step in journeySteps"
            :key="step.code"
            class="adm-home-journey-card"
            :to="step.route"
          >
            <span class="adm-home-badge">{{ step.code }}</span>
            <strong>{{ step.label }}</strong>
            <small>{{ step.hint }}</small>
          </RouterLink>
        </div>
      </SectionBlock>

      <SectionBlock
        title="Organisation pilotee"
        description="L'administration ecole reste declenchee depuis une organisation explicite."
      >
        <div v-if="currentOrganization" class="adm-home-panel">
          <div class="adm-home-panel__head">
            <div>
              <small>Organisation source</small>
              <strong>{{ currentOrganization.nom }}</strong>
            </div>
            <span class="adm-home-badge">{{ currentOrganization.code }}</span>
          </div>

          <div class="adm-home-actions">
            <button class="adm-home-pill" type="button" @click="relireEcolesOrganisation">
              Relire les ecoles
            </button>
            <RouterLink class="adm-home-pill" :to="`/app/administration-ecole/ecoles?idOrganisation=${context.organizationId}`">
              Ouvrir le registre cible
            </RouterLink>
          </div>
        </div>
        <EmptyState
          v-else
          title="Organisation manquante"
          message="Le centre administration ecole attend une organisation active ou une lecture depuis le registre organisationnel."
        />
      </SectionBlock>

      <SectionBlock
        title="Ecoles chargees"
        description="Depuis ici, on peut promouvoir une ecole dans le shell ou ouvrir sa fiche structurelle."
      >
        <EmptyState
          v-if="store.state.ecoles.length === 0"
          title="Aucune ecole chargee"
          message="Relancez la lecture des ecoles de l'organisation courante."
        />
        <div v-else class="adm-home-school-grid">
          <article v-for="ecole in store.state.ecoles" :key="ecole.id" class="adm-home-school-card">
            <div class="adm-home-school-card__head">
              <div>
                <small>{{ ecole.code }}</small>
                <strong>{{ ecole.nom }}</strong>
              </div>
              <span class="adm-home-badge">{{ ecole.actif ? 'Active' : 'Inactive' }}</span>
            </div>

            <p>
              Mode {{ ecole.modeExploitation }}.
              Utilisez ce point pour basculer le shell avant d'ouvrir un workflow local.
            </p>

            <div class="adm-home-actions">
              <button class="adm-home-pill" type="button" @click="activerContexteEcole(ecole.id)">
                Activer contexte ecole
              </button>
              <RouterLink class="adm-home-pill" :to="`/app/administration-ecole/ecoles/${ecole.id}`">
                Ouvrir detail
              </RouterLink>
              <RouterLink class="adm-home-pill" :to="`/app/academique/annees-scolaires`">
                Ouvrir modules ecole
              </RouterLink>
            </div>
          </article>
        </div>
      </SectionBlock>
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { changerEcoleActiveFrontend, changerOrganisationActiveFrontend } from '../../../shared/auth/session.bootstrap';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import StatChip from '../../../shared/ui/StatChip.vue';
import { useOrganizationGovernanceStore } from '../../organisation/stores/organization-governance.store';

const store = useOrganizationGovernanceStore();
const context = activeContextStore.state;
const session = sessionStore.state;

const currentOrganization = computed(
  () => store.state.organisations.find((organisation) => organisation.id === context.organizationId) ?? null,
);
const journeySteps = computed(() => [
  {
    code: 'STEP-01',
    label: 'Relire le registre des ecoles',
    hint: 'Choisir ou creer l ecole rattachee a l organisation courante.',
    route: context.organizationId ? `/app/administration-ecole/ecoles?idOrganisation=${context.organizationId}` : '/app/administration-ecole/ecoles',
  },
  {
    code: 'STEP-02',
    label: 'Ouvrir la scolarite',
    hint: 'Passer au flux familles, eleves, inscriptions et affectations.',
    route: '/app/scolarite',
  },
  {
    code: 'STEP-03',
    label: 'Ouvrir la finance',
    hint: 'Continuer ensuite vers la perception de paiement dans la meme ecole.',
    route: '/app/finances',
  },
]);

async function chargerCentreAdministration(): Promise<void> {
  await store.chargerOrganisations();
  if (context.organizationId) {
    await store.chargerEcolesParOrganisation(context.organizationId);
  }
}

async function relireEcolesOrganisation(): Promise<void> {
  if (!context.organizationId) {
    return;
  }

  await store.chargerEcolesParOrganisation(context.organizationId);
}

async function activerContexteEcole(idEcole: string): Promise<void> {
  if (!context.organizationId) {
    return;
  }

  await changerOrganisationActiveFrontend(context.organizationId);
  await changerEcoleActiveFrontend(idEcole);
  activeContextStore.setGovernanceLevel('ECOLE');
}

onMounted(() => {
  void chargerCentreAdministration();
});
</script>

<style scoped>
.adm-home-actions{display:flex;flex-wrap:wrap;gap:.85rem}
.adm-home-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.45rem;font-weight:600;text-decoration:none}
.adm-home-pill--primary{background:linear-gradient(135deg,#113f67,#1a6aa0);border-color:transparent;color:#fff}
.adm-home-grid,.adm-home-school-grid,.adm-home-journey-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.adm-home-panel,.adm-home-school-card{display:grid;gap:1rem;padding:1.1rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08)}
.adm-home-journey-card{display:grid;gap:.7rem;padding:1.1rem;border-radius:24px;background:linear-gradient(180deg,#f7fbfd,#ffffff);border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.adm-home-journey-card small{color:#587083;line-height:1.55}
.adm-home-panel__head,.adm-home-school-card__head{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}
.adm-home-panel__head small,.adm-home-school-card__head small{display:block;color:#61788a}
.adm-home-panel__head strong,.adm-home-school-card__head strong{font-size:1.05rem;color:#11283f}
.adm-home-school-card p{margin:0;color:#587083;line-height:1.55}
.adm-home-badge{display:inline-flex;align-items:center;border-radius:999px;padding:.28rem .72rem;background:#eef4ff;color:#19456b;font-size:.82rem;font-weight:700}
</style>
