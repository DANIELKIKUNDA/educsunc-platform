<template>
  <PageContainer>
    <PageHeader
      eyebrow="ORG-HOME"
      title="Centre organisation"
      description="Point d'entree organisationnel pour relire le contexte actif, ouvrir le registre et descendre proprement vers les ecoles rattachees."
    >
      <template #actions>
        <div class="org-home-actions">
          <RouterLink v-if="canAccessRegistry" class="org-home-pill org-home-pill--primary" to="/app/organisation/ecoles">
            Registre organisations
          </RouterLink>
          <RouterLink class="org-home-pill" to="/app/organisation/configuration">
            Configuration organisationnelle
          </RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Contexte actif"
      description="Le shell et les routes se recalculent a partir de cette organisation et du niveau courant."
    >
      <div class="org-home-grid">
        <StatChip label="Acteur" :value="session.actorLabel" />
        <StatChip label="Niveau" :value="context.governanceLevel" />
        <StatChip label="Organisation" :value="context.organizationName" />
        <StatChip label="Ecole active" :value="context.governanceLevel === 'ECOLE' ? context.schoolName : 'Aucune'" />
      </div>
    </SectionBlock>

    <LoadingState
      v-if="canAccessRegistry && store.state.status === 'loading' && store.state.organisations.length === 0"
      title="Chargement organisationnel"
      message="Lecture du registre et des ecoles rattachees."
    />
    <ErrorState
      v-else-if="canAccessRegistry && store.state.status === 'error' && store.state.organisations.length === 0"
      title="Organisation indisponible"
      :message="store.state.errorMessage ?? 'Le centre organisation ne peut pas etre charge.'"
    />

    <template v-else>
      <SectionBlock
        title="Organisation courante"
        description="Resume immediat du perimetre de gouvernance actuellement ouvert."
      >
        <div v-if="currentOrganization" class="org-home-panel">
          <div class="org-home-panel__head">
            <div>
              <small>Organisation active</small>
              <strong>{{ currentOrganization.nom }}</strong>
            </div>
            <span class="org-home-badge">{{ currentOrganization.code }}</span>
          </div>

          <div class="org-home-grid">
            <StatChip label="Type" :value="currentOrganization.typeOrganisation" />
            <StatChip label="Etat" :value="currentOrganization.actif ? 'Active' : 'Inactive'" />
            <StatChip label="Version" :value="String(currentOrganization.version)" />
            <StatChip label="Ecoles chargees" :value="String(store.state.ecoles.length)" />
          </div>

          <div class="org-home-actions">
            <button v-if="canAccessRegistry" class="org-home-pill" type="button" @click="relireOrganisationCourante">
              Relire les ecoles rattachees
            </button>
            <button class="org-home-pill" type="button" @click="promouvoirContexteOrganisation">
              Rebasculer sur le niveau organisation
            </button>
          </div>
        </div>
        <EmptyState
          v-else
          title="Aucune organisation resolue"
          message="Ouvrez le registre des organisations pour choisir le perimetre courant."
        />
      </SectionBlock>

      <SectionBlock
        title="Descente vers les ecoles"
        description="Chaque ecole peut etre lue en detail, administree ou promue dans le contexte actif."
      >
        <EmptyState
          v-if="!canAccessRegistry"
          title="Registre systeme non ouvert"
          message="Cette vue reste disponible pour le contexte organisationnel et la configuration. La lecture structurelle des organisations et des ecoles rattachees via ORG-01 et ADM-01 reste reservee aux acteurs systeme preuves."
        />
        <EmptyState
          v-else-if="store.state.ecoles.length === 0"
          title="Aucune ecole chargee"
          message="Relancez la lecture des ecoles rattachees a l'organisation courante."
        />
        <div v-else class="org-home-school-grid">
          <article v-for="ecole in store.state.ecoles" :key="ecole.id" class="org-home-school-card">
            <div class="org-home-school-card__head">
              <div>
                <small>{{ ecole.code }}</small>
                <strong>{{ ecole.nom }}</strong>
              </div>
              <span class="org-home-badge">{{ ecole.modeExploitation }}</span>
            </div>

            <p>
              {{ ecole.actif ? 'Ecole active' : 'Ecole inactive' }}
              · perimetre organisationnel lisible sans ouvrir un autre module.
            </p>

            <div class="org-home-actions">
              <button class="org-home-pill" type="button" @click="activerEcoleDansContexte(ecole.id)">
                Activer contexte ecole
              </button>
              <RouterLink class="org-home-pill" :to="`/app/organisation/ecoles/${ecole.id}`">
                Ouvrir detail
              </RouterLink>
              <RouterLink class="org-home-pill" :to="`/app/administration-ecole/ecoles/${ecole.id}`">
                Administrer
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
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import StatChip from '../../../shared/ui/StatChip.vue';
import { useOrganizationGovernanceStore } from '../stores/organization-governance.store';

const store = useOrganizationGovernanceStore();
const { canAccessPage } = useDoctrineAccess();
const context = activeContextStore.state;
const session = sessionStore.state;
const canAccessRegistry = computed(() => canAccessPage('ORG-001'));

const currentOrganization = computed(
  () =>
    store.state.organisations.find((organisation) => organisation.id === context.organizationId)
    ?? (context.organizationId
      ? {
        id: context.organizationId,
        code: context.organizationId,
        nom: context.organizationName,
        typeOrganisation: 'Organisation active',
        actif: true,
        creeLe: '',
        version: 1,
      }
      : null),
);

async function chargerCentreOrganisation(): Promise<void> {
  if (!canAccessRegistry.value) {
    return;
  }

  await store.chargerOrganisations();
  if (context.organizationId) {
    await store.chargerEcolesParOrganisation(context.organizationId);
  }
}

async function relireOrganisationCourante(): Promise<void> {
  if (!canAccessRegistry.value || !context.organizationId) {
    return;
  }

  await store.chargerEcolesParOrganisation(context.organizationId);
}

async function promouvoirContexteOrganisation(): Promise<void> {
  if (!context.organizationId) {
    return;
  }

  await changerOrganisationActiveFrontend(context.organizationId);
  activeContextStore.setGovernanceLevel('ORGANISATION');
}

async function activerEcoleDansContexte(idEcole: string): Promise<void> {
  if (!context.organizationId) {
    return;
  }

  await changerOrganisationActiveFrontend(context.organizationId);
  await changerEcoleActiveFrontend(idEcole);
  activeContextStore.setGovernanceLevel('ECOLE');
}

onMounted(() => {
  void chargerCentreOrganisation();
});
</script>

<style scoped>
.org-home-actions{display:flex;flex-wrap:wrap;gap:.85rem}
.org-home-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.45rem;font-weight:600;text-decoration:none}
.org-home-pill--primary{background:linear-gradient(135deg,#0c5a6b,#167b91);border-color:transparent;color:#fff}
.org-home-grid,.org-home-school-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.org-home-panel,.org-home-school-card{display:grid;gap:1rem;padding:1.1rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08)}
.org-home-panel__head,.org-home-school-card__head{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}
.org-home-panel__head small,.org-home-school-card__head small{display:block;color:#61788a}
.org-home-panel__head strong,.org-home-school-card__head strong{font-size:1.05rem;color:#11283f}
.org-home-school-card p{margin:0;color:#587083;line-height:1.55}
.org-home-badge{display:inline-flex;align-items:center;border-radius:999px;padding:.28rem .72rem;background:#eef8fb;color:#17485d;font-size:.82rem;font-weight:700}
</style>
