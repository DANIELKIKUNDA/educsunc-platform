<template>
  <PageContainer>
    <PageHeader
      eyebrow="ORG-01"
      title="Registre des organisations"
      description="Pilotage structurel des organisations et lecture des ecoles rattachees, sans bricolage manuel entre niveaux."
    >
      <template #actions>
        <RouterLink class="gov-link" to="/app/organisation">
          <ArrowLeft />
          <span>Retour organisation</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock title="Creation organisation" description="Le backend reste source de verite sur le cycle de vie organisationnel.">
      <div class="gov-grid">
        <label class="gov-field">
          <span>Code</span>
          <input v-model="organisationForm.code" type="text" placeholder="ORG-CAT" />
        </label>
        <label class="gov-field">
          <span>Nom</span>
          <input v-model="organisationForm.nom" type="text" placeholder="Organisation educative" />
        </label>
        <label class="gov-field">
          <span>Type</span>
          <input v-model="organisationForm.typeOrganisation" type="text" placeholder="SCOLAIRE" />
        </label>
        <label class="gov-field gov-field--wide">
          <span>Description</span>
          <input v-model="organisationForm.description" type="text" placeholder="Description optionnelle" />
        </label>
      </div>

      <div class="gov-actions">
        <button
          v-if="canMutateOrganisation"
          class="gov-pill gov-pill--primary"
          type="button"
          @click="creerOrganisation"
        >
          Creer organisation
        </button>
        <button class="gov-pill" type="button" @click="chargerOrganisations">Relire le registre</button>
      </div>
    </SectionBlock>

    <SectionBlock title="Lecture et projection" description="Une organisation selectionnee ouvre directement la liste backend de ses ecoles.">
      <div class="gov-actions">
        <label class="gov-field">
          <span>Organisation cible</span>
          <select v-model="selectedOrganisationId">
            <option value="">Selectionner</option>
            <option v-for="organisation in store.state.organisations" :key="organisation.id" :value="organisation.id">
              {{ organisation.code }} - {{ organisation.nom }}
            </option>
          </select>
        </label>
          <button class="gov-pill" type="button" :disabled="!selectedOrganisationId" @click="chargerEcoles">Lire les ecoles</button>
        <RouterLink
          class="gov-pill"
          :class="{ 'gov-pill--disabled': !selectedOrganisationId }"
          :to="selectedOrganisationId ? `/app/administration-ecole/ecoles?idOrganisation=${selectedOrganisationId}` : '/app/administration-ecole/ecoles'"
        >
          Administrer les ecoles
        </RouterLink>
        <button
          v-if="canMutateOrganisation"
          class="gov-pill"
          type="button"
          :disabled="!selectedOrganisationId || !renameOrganisationTarget"
          @click="renommerOrganisation"
        >
          Renommer
        </button>
        <button
          v-if="canMutateOrganisation"
          class="gov-pill"
          type="button"
          :disabled="!selectedOrganisationId"
          @click="activerOrganisation"
        >
          Activer
        </button>
        <button
          v-if="canMutateOrganisation"
          class="gov-pill"
          type="button"
          :disabled="!selectedOrganisationId"
          @click="desactiverOrganisation"
        >
          Desactiver
        </button>
      </div>

      <label v-if="canMutateOrganisation" class="gov-field gov-field--wide">
        <span>Nouveau nom organisation</span>
        <input v-model="renameOrganisationTarget" type="text" placeholder="Nouveau libelle" />
      </label>
    </SectionBlock>

    <LoadingState v-if="store.state.status === 'loading'" title="Pilotage organisationnel en cours" message="Lecture ou mutation du registre en cours." />
    <ErrorState v-else-if="store.state.status === 'error'" title="Organisation indisponible" :message="store.state.errorMessage ?? 'Le registre n a pas pu etre charge.'" />

    <template v-else>
      <SectionBlock v-if="store.state.lastMutationMessage" title="Derniere mutation" description="Retour immediat du backend de gouvernance.">
        <div class="gov-banner">{{ store.state.lastMutationMessage }}</div>
      </SectionBlock>

      <SectionBlock
        v-if="!canMutateOrganisation"
        title="Lecture seule"
        description="Le registre reste visible, mais les mutations ORG-01 ne sont pas ouvertes dans ce profil."
      >
        <div class="gov-banner gov-banner--muted">
          Cet acteur peut relire les organisations et leurs ecoles rattachees, sans creer, renommer, activer ni desactiver une organisation.
        </div>
      </SectionBlock>

      <SectionBlock title="Organisations" description="Liste paginee reelle du backend structurel.">
        <EmptyState
          v-if="store.state.organisations.length === 0"
          title="Aucune organisation"
          message="Creer une organisation pour ouvrir la suite du pilotage."
        />
        <div v-else class="gov-table-shell">
          <table class="gov-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Nom</th>
                <th>Type</th>
                <th>Etat</th>
                <th>Version</th>
                <th>Contexte</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="organisation in store.state.organisations" :key="organisation.id">
                <td>{{ organisation.code }}</td>
                <td>{{ organisation.nom }}</td>
                <td>{{ organisation.typeOrganisation }}</td>
                <td>{{ organisation.actif ? 'Active' : 'Inactive' }}</td>
                <td>{{ organisation.version }}</td>
                <td>
                  <button class="gov-inline-link gov-inline-link--button" type="button" @click="activerOrganisationDansContexte(organisation.id)">
                    Activer contexte
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionBlock>

      <SectionBlock title="Ecoles rattachees" description="Lecture declenchee uniquement depuis l organisation selectionnee.">
        <EmptyState
          v-if="store.state.ecoles.length === 0"
          title="Aucune ecole visible"
          message="Selectionnez une organisation puis relancez la lecture des ecoles."
        />
        <div v-else class="gov-table-shell">
          <table class="gov-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Nom</th>
                <th>Mode</th>
                <th>Etat</th>
                <th>Action</th>
                <th>Pilotage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ecole in store.state.ecoles" :key="ecole.id">
                <td>{{ ecole.code }}</td>
                <td>{{ ecole.nom }}</td>
                <td>{{ ecole.modeExploitation }}</td>
                <td>{{ ecole.actif ? 'Active' : 'Inactive' }}</td>
                <td>
                  <RouterLink class="gov-inline-link" :to="`/app/organisation/ecoles/${ecole.id}`">Ouvrir</RouterLink>
                </td>
                <td>
                  <RouterLink class="gov-inline-link" :to="`/app/administration-ecole/ecoles/${ecole.id}`">Administrer</RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionBlock>
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { changerOrganisationActiveFrontend } from '../../../shared/auth/session.bootstrap';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { useOrganizationGovernanceStore } from '../stores/organization-governance.store';

const store = useOrganizationGovernanceStore();
const { canUseAction } = useDoctrineAccess();
const route = useRoute();
const selectedOrganisationId = ref('');
const renameOrganisationTarget = ref('');
const organisationForm = reactive({
  code: '',
  nom: '',
  typeOrganisation: 'SCOLAIRE',
  description: '',
});
const canMutateOrganisation = computed(() => canUseAction('organization.write', 'ORG-001'));

async function chargerOrganisations(): Promise<void> {
  await store.chargerOrganisations();
}

async function creerOrganisation(): Promise<void> {
  if (!organisationForm.code.trim() || !organisationForm.nom.trim() || !organisationForm.typeOrganisation.trim()) {
    return;
  }

  await store.creerOrganisation({
    code: organisationForm.code.trim(),
    nom: organisationForm.nom.trim(),
    typeOrganisation: organisationForm.typeOrganisation.trim(),
    description: organisationForm.description.trim() || undefined,
  });
  organisationForm.code = '';
  organisationForm.nom = '';
  organisationForm.description = '';
}

async function chargerEcoles(): Promise<void> {
  if (!selectedOrganisationId.value) return;
  await store.chargerEcolesParOrganisation(selectedOrganisationId.value);
}

async function renommerOrganisation(): Promise<void> {
  if (!selectedOrganisationId.value || !renameOrganisationTarget.value.trim()) return;
  await store.renommerOrganisation(selectedOrganisationId.value, renameOrganisationTarget.value.trim());
  renameOrganisationTarget.value = '';
}

async function activerOrganisation(): Promise<void> {
  if (!selectedOrganisationId.value) return;
  await store.activerOrganisation(selectedOrganisationId.value);
}

async function desactiverOrganisation(): Promise<void> {
  if (!selectedOrganisationId.value) return;
  await store.desactiverOrganisation(selectedOrganisationId.value);
}

async function activerOrganisationDansContexte(idOrganisation: string): Promise<void> {
  await changerOrganisationActiveFrontend(idOrganisation);
  activeContextStore.setGovernanceLevel('ORGANISATION');
}

async function initialiserDepuisContexte(): Promise<void> {
  selectedOrganisationId.value =
    (typeof route.query.idOrganisation === 'string' && route.query.idOrganisation)
    || (activeContextStore.state.governanceLevel === 'ORGANISATION' ? activeContextStore.state.organizationId : '')
    || selectedOrganisationId.value;

  await chargerOrganisations();

  if (selectedOrganisationId.value) {
    await chargerEcoles();
  }
}

void initialiserDepuisContexte();
</script>

<style scoped>
.gov-grid,.gov-actions{display:flex;flex-wrap:wrap;gap:.9rem}
.gov-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-bottom:1rem}
.gov-field{display:grid;gap:.45rem;min-width:220px}
.gov-field--wide{grid-column:1/-1}
.gov-field input,.gov-field select{border-radius:16px;border:1px solid rgba(17,40,63,.14);padding:.8rem .95rem;background:#fbfdff}
.gov-pill,.gov-link,.gov-inline-link{border:1px solid rgba(17,40,63,.14);border-radius:999px;padding:.75rem 1rem;background:#fff;color:#11283f;text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:.45rem}
.gov-pill--primary{background:linear-gradient(135deg,#0c5a6b,#167b91);border-color:transparent;color:#fff}
.gov-pill--disabled{pointer-events:none;opacity:.55}
.gov-banner{padding:1rem 1.1rem;border-radius:20px;background:#eef8fb;color:#103040;font-weight:600}
.gov-banner--muted{background:#f3f7f9;color:#425b67}
.gov-table-shell{overflow:auto}
.gov-table{width:100%;border-collapse:collapse}
.gov-table th,.gov-table td{padding:.85rem 1rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left}
.gov-inline-link{padding:.5rem .85rem;font-size:.92rem}
</style>
