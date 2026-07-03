<template>
  <PageContainer>
    <PageHeader eyebrow="ORG-01" title="Detail ecole organisation" description="Lecture detaillee d une ecole rattachee a une organisation, sans mutation locale cachee.">
      <template #actions>
        <RouterLink class="gov-link" to="/app/organisation/ecoles">
          <ArrowLeft />
          <span>Retour registre</span>
        </RouterLink>
      </template>
    </PageHeader>

    <LoadingState v-if="store.state.status === 'loading'" title="Chargement ecole" message="Le backend relit l ecole cible." />
    <ErrorState v-else-if="store.state.status === 'error'" title="Ecole indisponible" :message="store.state.errorMessage ?? 'Le detail ecole ne peut pas etre ouvert.'" />

    <template v-else-if="store.state.selectedEcole">
      <SectionBlock title="Identite ecole" description="Projection brute et fiable de la fiche ecole cote backend.">
        <div class="gov-kpi-grid">
          <div class="gov-kpi-card"><small>Code</small><strong>{{ store.state.selectedEcole.code }}</strong></div>
          <div class="gov-kpi-card"><small>Nom</small><strong>{{ store.state.selectedEcole.nom }}</strong></div>
          <div class="gov-kpi-card"><small>Mode</small><strong>{{ store.state.selectedEcole.modeExploitation }}</strong></div>
          <div class="gov-kpi-card"><small>Etat</small><strong>{{ store.state.selectedEcole.actif ? 'Active' : 'Inactive' }}</strong></div>
        </div>
      </SectionBlock>

      <SectionBlock title="Promotion du contexte" description="Permet de faire descendre cette ecole dans le contexte actif global du Shell.">
        <div class="gov-actions">
          <button class="gov-link gov-link--button" type="button" @click="activerOrganisationDansContexte">
            Activer organisation
          </button>
          <button class="gov-link gov-link--button" type="button" @click="activerEcoleDansContexte">
            Activer ecole
          </button>
          <RouterLink class="gov-link" :to="`/app/administration-ecole/ecoles/${store.state.selectedEcole.id}`">
            Administrer cette ecole
          </RouterLink>
        </div>
      </SectionBlock>

      <SectionBlock title="Coordonnees et contexte" description="Bloc utile pour verifier que l ecole a bien ete institutionnalisee avant ouverture d exploitation.">
        <div class="gov-kpi-grid">
          <div class="gov-kpi-card"><small>Organisation</small><strong>{{ store.state.selectedEcole.idOrganisation }}</strong></div>
          <div class="gov-kpi-card"><small>Sigle</small><strong>{{ store.state.selectedEcole.sigle || '-' }}</strong></div>
          <div class="gov-kpi-card"><small>Telephone</small><strong>{{ store.state.selectedEcole.telephone || '-' }}</strong></div>
          <div class="gov-kpi-card"><small>Email</small><strong>{{ store.state.selectedEcole.email || '-' }}</strong></div>
          <div class="gov-kpi-card"><small>Adresse</small><strong>{{ store.state.selectedEcole.adresse || '-' }}</strong></div>
          <div class="gov-kpi-card"><small>Province educationnelle</small><strong>{{ store.state.selectedEcole.provinceEducationnelle || '-' }}</strong></div>
          <div class="gov-kpi-card"><small>Ville</small><strong>{{ store.state.selectedEcole.ville || '-' }}</strong></div>
          <div class="gov-kpi-card"><small>Commune / territoire</small><strong>{{ store.state.selectedEcole.communeOuTerritoire || '-' }}</strong></div>
        </div>
      </SectionBlock>
    </template>

    <EmptyState v-else title="Aucune ecole chargee" message="Le parametre route ou la lecture backend n a retourne aucune ecole." />
  </PageContainer>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { changerEcoleActiveFrontend, changerOrganisationActiveFrontend } from '../../../shared/auth/session.bootstrap';
import { activeContextStore } from '../../../shared/session/active-context.store';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import { useOrganizationGovernanceStore } from '../stores/organization-governance.store';

const route = useRoute();
const store = useOrganizationGovernanceStore();

onMounted(async () => {
  const idEcole = typeof route.params.idEcole === 'string' ? route.params.idEcole : '';
  if (idEcole) {
    await store.chargerEcole(idEcole);
  }
});

async function activerOrganisationDansContexte(): Promise<void> {
  const idOrganisation = store.state.selectedEcole?.idOrganisation;
  if (!idOrganisation) return;
  await changerOrganisationActiveFrontend(idOrganisation);
  activeContextStore.setGovernanceLevel('ORGANISATION');
}

async function activerEcoleDansContexte(): Promise<void> {
  const idOrganisation = store.state.selectedEcole?.idOrganisation;
  const idEcole = store.state.selectedEcole?.id;
  if (!idOrganisation || !idEcole) return;
  await changerOrganisationActiveFrontend(idOrganisation);
  await changerEcoleActiveFrontend(idEcole);
  activeContextStore.setGovernanceLevel('ECOLE');
}
</script>

<style scoped>
.gov-actions{display:flex;flex-wrap:wrap;gap:.9rem}
.gov-link{border:1px solid rgba(17,40,63,.14);border-radius:999px;padding:.75rem 1rem;background:#fff;color:#11283f;text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:.45rem}
.gov-link--button{cursor:pointer}
.gov-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem}
.gov-kpi-card{border-radius:22px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
</style>
