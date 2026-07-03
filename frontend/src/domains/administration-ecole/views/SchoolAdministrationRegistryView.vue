<template>
  <PageContainer>
    <PageHeader
      eyebrow="ADM-01"
      title="Registre des ecoles"
      description="Creation et pilotage structurel des ecoles rattachees a une organisation valide."
    >
      <template #actions>
        <RouterLink class="adm-link" to="/app/administration-ecole">
          <ArrowLeft />
          <span>Retour administration ecole</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock title="Creation ecole" description="Le backend cree l ecole, impose l acteur et fixe son identite structurelle.">
      <div class="adm-grid">
        <label class="adm-field">
          <span>Organisation</span>
          <select v-model="form.idOrganisation">
            <option value="">Selectionner</option>
            <option v-for="organisation in store.state.organisations" :key="organisation.id" :value="organisation.id">
              {{ organisation.code }} - {{ organisation.nom }}
            </option>
          </select>
        </label>
        <label class="adm-field">
          <span>Code</span>
          <input v-model="form.code" type="text" placeholder="ECOLE-001" />
        </label>
        <label class="adm-field">
          <span>Nom</span>
          <input v-model="form.nom" type="text" placeholder="College Saint Raphael" />
        </label>
        <label class="adm-field">
          <span>Mode exploitation</span>
          <input v-model="form.modeExploitation" type="text" placeholder="MONO_ECOLE" />
        </label>
        <label class="adm-field">
          <span>Sigle</span>
          <input v-model="form.sigle" type="text" placeholder="CSR" />
        </label>
        <label class="adm-field">
          <span>Telephone</span>
          <input v-model="form.telephone" type="text" placeholder="+243..." />
        </label>
        <label class="adm-field">
          <span>Email</span>
          <input v-model="form.email" type="email" placeholder="contact@ecole.cd" />
        </label>
        <label class="adm-field">
          <span>Province educationnelle</span>
          <input v-model="form.provinceEducationnelle" type="text" placeholder="Haut-Katanga 1" />
        </label>
        <label class="adm-field">
          <span>Ville</span>
          <input v-model="form.ville" type="text" placeholder="Lubumbashi" />
        </label>
        <label class="adm-field">
          <span>Commune / territoire</span>
          <input v-model="form.communeOuTerritoire" type="text" placeholder="Kampemba" />
        </label>
        <label class="adm-field adm-field--wide">
          <span>Adresse</span>
          <input v-model="form.adresse" type="text" placeholder="Adresse ecole" />
        </label>
      </div>

      <div class="adm-actions">
        <button
          v-if="canMutateRegistry"
          class="adm-pill adm-pill--primary"
          type="button"
          @click="creerEcole"
        >
          Creer ecole
        </button>
        <button class="adm-pill" type="button" @click="chargerOrganisations">Relire organisations</button>
        <button class="adm-pill" type="button" :disabled="!selectedOrganisationId" @click="chargerEcoles">Relire ecoles de l organisation</button>
      </div>
    </SectionBlock>

    <SectionBlock title="Lecture organisationnelle" description="La liste des ecoles reste declenchee depuis une organisation explicite.">
      <div class="adm-actions">
        <label class="adm-field">
          <span>Organisation cible</span>
          <select v-model="selectedOrganisationId">
            <option value="">Selectionner</option>
            <option v-for="organisation in store.state.organisations" :key="organisation.id" :value="organisation.id">
              {{ organisation.code }} - {{ organisation.nom }}
            </option>
          </select>
        </label>
      </div>
    </SectionBlock>

    <LoadingState v-if="store.state.status === 'loading'" title="Administration ecole en cours" message="Lecture ou mutation structurelle en cours." />
    <ErrorState v-else-if="store.state.status === 'error'" title="Administration ecole indisponible" :message="store.state.errorMessage ?? 'Le registre des ecoles ne peut pas etre charge.'" />

    <template v-else>
      <SectionBlock v-if="store.state.lastMutationMessage" title="Derniere mutation" description="Retour immediat du backend apres la mutation structurelle.">
        <div class="adm-banner">{{ store.state.lastMutationMessage }}</div>
      </SectionBlock>

      <SectionBlock
        v-if="!canMutateRegistry"
        title="Lecture seule"
        description="Le workflow ADM-01 reste visible, mais les mutations structurelles ne sont pas ouvertes dans ce profil."
      >
        <div class="adm-banner adm-banner--muted">
          Cet acteur peut relire les ecoles, sans creer ni muter leur cycle de vie.
        </div>
      </SectionBlock>

      <SectionBlock title="Ecoles rattachees" description="Table de pilotage systeme des ecoles d une organisation.">
        <EmptyState
          v-if="store.state.ecoles.length === 0"
          title="Aucune ecole visible"
          message="Selectionnez une organisation puis chargez la liste des ecoles."
        />
        <div v-else class="adm-table-shell">
          <table class="adm-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Nom</th>
                <th>Mode</th>
                <th>Etat</th>
                <th>Contexte</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ecole in store.state.ecoles" :key="ecole.id">
                <td>{{ ecole.code }}</td>
                <td>{{ ecole.nom }}</td>
                <td>{{ ecole.modeExploitation }}</td>
                <td>{{ ecole.actif ? 'Active' : 'Inactive' }}</td>
                <td>
                  <button class="adm-inline-link adm-inline-link--button" type="button" @click="activerEcoleDansContexte(ecole.idOrganisation, ecole.id)">
                    Activer contexte
                  </button>
                </td>
                <td>
                  <RouterLink class="adm-inline-link" :to="`/app/administration-ecole/ecoles/${ecole.id}`">Ouvrir</RouterLink>
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
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { changerEcoleActiveFrontend, changerOrganisationActiveFrontend } from '../../../shared/auth/session.bootstrap';
import { activeContextStore } from '../../../shared/session/active-context.store';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import { useOrganizationGovernanceStore } from '../../organisation/stores/organization-governance.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';

const store = useOrganizationGovernanceStore();
const { canUseAction } = useDoctrineAccess();
const route = useRoute();
const selectedOrganisationId = ref('');
const form = reactive({
  idOrganisation: '',
  code: '',
  nom: '',
  modeExploitation: 'MONO_ECOLE',
  sigle: '',
  telephone: '',
  email: '',
  provinceEducationnelle: '',
  ville: '',
  communeOuTerritoire: '',
  adresse: '',
});

const canMutateRegistry = computed(() => canUseAction('school-administration.write', 'ADM-001'));

async function chargerOrganisations(): Promise<void> {
  await store.chargerOrganisations();
}

async function chargerEcoles(): Promise<void> {
  if (!selectedOrganisationId.value) return;
  await store.chargerEcolesParOrganisation(selectedOrganisationId.value);
}

async function creerEcole(): Promise<void> {
  if (!form.idOrganisation || !form.code.trim() || !form.nom.trim() || !form.modeExploitation.trim()) {
    return;
  }

  await store.creerEcole({
    idOrganisation: form.idOrganisation,
    code: form.code.trim(),
    nom: form.nom.trim(),
    modeExploitation: form.modeExploitation.trim(),
    sigle: form.sigle.trim() || undefined,
    telephone: form.telephone.trim() || undefined,
    email: form.email.trim() || undefined,
    provinceEducationnelle: form.provinceEducationnelle.trim() || undefined,
    ville: form.ville.trim() || undefined,
    communeOuTerritoire: form.communeOuTerritoire.trim() || undefined,
    adresse: form.adresse.trim() || undefined,
  });

  selectedOrganisationId.value = form.idOrganisation;
  form.code = '';
  form.nom = '';
  form.sigle = '';
  form.telephone = '';
  form.email = '';
  form.provinceEducationnelle = '';
  form.ville = '';
  form.communeOuTerritoire = '';
  form.adresse = '';
}

async function activerEcoleDansContexte(idOrganisation: string, idEcole: string): Promise<void> {
  await changerOrganisationActiveFrontend(idOrganisation);
  await changerEcoleActiveFrontend(idEcole);
  activeContextStore.setGovernanceLevel('ECOLE');
}

onMounted(async () => {
  const organisationDepuisRoute = typeof route.query.idOrganisation === 'string' ? route.query.idOrganisation : '';
  if (organisationDepuisRoute) {
    selectedOrganisationId.value = organisationDepuisRoute;
    form.idOrganisation = organisationDepuisRoute;
  } else if (activeContextStore.state.governanceLevel === 'ORGANISATION') {
    selectedOrganisationId.value = activeContextStore.state.organizationId;
    form.idOrganisation = activeContextStore.state.organizationId;
  }

  await chargerOrganisations();

  if (selectedOrganisationId.value) {
    await chargerEcoles();
  }
});
</script>

<style scoped>
.adm-grid,.adm-actions{display:flex;flex-wrap:wrap;gap:.9rem}
.adm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-bottom:1rem}
.adm-field{display:grid;gap:.45rem;min-width:220px}
.adm-field--wide{grid-column:1/-1}
.adm-field input,.adm-field select{border-radius:16px;border:1px solid rgba(17,40,63,.14);padding:.8rem .95rem;background:#fbfdff}
.adm-pill,.adm-link,.adm-inline-link{border:1px solid rgba(17,40,63,.14);border-radius:999px;padding:.75rem 1rem;background:#fff;color:#11283f;text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:.45rem}
.adm-pill--primary{background:linear-gradient(135deg,#113f67,#1a6aa0);border-color:transparent;color:#fff}
.adm-banner{padding:1rem 1.1rem;border-radius:20px;background:#eef4ff;color:#102844;font-weight:600}
.adm-banner--muted{background:#f4f7fb;color:#445b70}
.adm-table-shell{overflow:auto}
.adm-table{width:100%;border-collapse:collapse}
.adm-table th,.adm-table td{padding:.85rem 1rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left}
.adm-inline-link{padding:.5rem .85rem;font-size:.92rem}
.adm-inline-link--button{cursor:pointer}
</style>
