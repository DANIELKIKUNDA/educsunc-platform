<template>
  <PageContainer>
    <PageHeader eyebrow="ADM-01" title="Detail administration ecole" description="Pilotage detaille du mode, du nom et de l identite institutionnelle d une ecole.">
      <template #actions>
        <RouterLink class="adm-link" to="/app/administration-ecole/ecoles">
          <ArrowLeft />
          <span>Retour registre</span>
        </RouterLink>
      </template>
    </PageHeader>

    <LoadingState v-if="store.state.status === 'loading'" title="Chargement ecole" message="Le backend relit l ecole cible." />
    <ErrorState v-else-if="store.state.status === 'error'" title="Ecole indisponible" :message="store.state.errorMessage ?? 'La fiche ecole ne peut pas etre ouverte.'" />

    <template v-else-if="store.state.selectedEcole">
      <SectionBlock title="Lecture courante" description="Le detail relit le backend avant toute mutation visible.">
        <div class="adm-kpi-grid">
          <div class="adm-kpi-card"><small>Code</small><strong>{{ store.state.selectedEcole.code }}</strong></div>
          <div class="adm-kpi-card"><small>Nom</small><strong>{{ store.state.selectedEcole.nom }}</strong></div>
          <div class="adm-kpi-card"><small>Mode</small><strong>{{ store.state.selectedEcole.modeExploitation }}</strong></div>
          <div class="adm-kpi-card"><small>Etat</small><strong>{{ store.state.selectedEcole.actif ? 'Active' : 'Inactive' }}</strong></div>
        </div>
      </SectionBlock>

      <SectionBlock title="Promotion du contexte" description="Permet de faire descendre cette ecole dans le Shell actif avant les workflows d exploitation.">
        <div class="adm-actions">
          <button class="adm-pill" type="button" @click="activerOrganisationDansContexte">Activer organisation</button>
          <button class="adm-pill" type="button" @click="activerEcoleDansContexte">Activer ecole</button>
        </div>
      </SectionBlock>

      <SectionBlock
        title="Operations locales prioritaires"
        description="Le detail structurel devient aussi un vrai point de lancement pour les workflows ecole apres bascule automatique du contexte."
      >
        <div class="adm-workflow-grid">
          <button class="adm-workflow-card" type="button" @click="ouvrirWorkflowEcole('/app/academique/annees-scolaires')">
            <strong>Annees scolaires</strong>
            <small>Verifier ou relire l annee active avant exploitation locale.</small>
          </button>
          <button class="adm-workflow-card" type="button" @click="ouvrirWorkflowEcole('/app/scolarite/inscriptions')">
            <strong>Inscription scolaire</strong>
            <small>Ouvrir le flux complet d entree eleve dans la meme ecole active.</small>
          </button>
          <button class="adm-workflow-card" type="button" @click="ouvrirWorkflowEcole('/app/finances/paiements/enregistrer')">
            <strong>Perception de paiement</strong>
            <small>Basculer directement sur la caisse autorisee de cette ecole.</small>
          </button>
          <button class="adm-workflow-card" type="button" @click="ouvrirWorkflowEcole('/app/finances/registre-classe')">
            <strong>Registre financier</strong>
            <small>Ouvrir les vues de suivi financier sans repasser par un autre module.</small>
          </button>
        </div>
      </SectionBlock>

      <SectionBlock
        v-if="canMutateDetail"
        title="Mutations structurelles"
        description="Les actions visibles restent limitees au workflow ADM-01 prouve."
      >
        <div class="adm-grid">
          <label class="adm-field">
            <span>Nouveau nom</span>
            <input v-model="renameTarget" type="text" placeholder="Nouveau nom" />
          </label>
          <label class="adm-field">
            <span>Nouveau mode</span>
            <input v-model="modeTarget" type="text" placeholder="MONO_ECOLE" />
          </label>
          <label class="adm-field">
            <span>Sigle</span>
            <input v-model="sigleTarget" type="text" placeholder="CSR" />
          </label>
          <label class="adm-field">
            <span>Telephone</span>
            <input v-model="telephoneTarget" type="text" placeholder="+243..." />
          </label>
          <label class="adm-field">
            <span>Email</span>
            <input v-model="emailTarget" type="email" placeholder="contact@ecole.cd" />
          </label>
          <label class="adm-field">
            <span>Province educationnelle</span>
            <input v-model="provinceEducationnelleTarget" type="text" placeholder="Haut-Katanga 1" />
          </label>
          <label class="adm-field">
            <span>Ville</span>
            <input v-model="villeTarget" type="text" placeholder="Lubumbashi" />
          </label>
          <label class="adm-field">
            <span>Commune / territoire</span>
            <input v-model="communeOuTerritoireTarget" type="text" placeholder="Kampemba" />
          </label>
          <label class="adm-field adm-field--wide">
            <span>Adresse</span>
            <input v-model="adresseTarget" type="text" placeholder="Adresse ecole" />
          </label>
        </div>

        <div class="adm-actions">
          <button class="adm-pill" type="button" :disabled="!renameTarget.trim()" @click="renommer">Renommer</button>
          <button class="adm-pill" type="button" :disabled="!modeTarget.trim()" @click="changerMode">Changer mode</button>
          <button class="adm-pill" type="button" @click="mettreAJourInformations">Mettre a jour les infos</button>
          <button class="adm-pill" type="button" @click="activer">Activer</button>
          <button class="adm-pill" type="button" @click="desactiver">Desactiver</button>
        </div>
      </SectionBlock>

      <SectionBlock
        v-else
        title="Lecture seule"
        description="Le detail d ecole reste visible, mais les mutations ne sont pas ouvertes dans ce profil."
      >
        <div class="adm-banner adm-banner--muted">
          Cet acteur peut consulter la fiche ecole sans renommer, activer, desactiver ni modifier son identite institutionnelle.
        </div>
      </SectionBlock>

      <SectionBlock v-if="store.state.lastMutationMessage" title="Derniere mutation" description="Confirmation de la derniere operation backend.">
        <div class="adm-banner">{{ store.state.lastMutationMessage }}</div>
      </SectionBlock>

      <SectionBlock title="Identite institutionnelle" description="Lecture complete des champs structurels exposes par le backend.">
        <div class="adm-kpi-grid">
          <div class="adm-kpi-card"><small>Sigle</small><strong>{{ store.state.selectedEcole.sigle || '-' }}</strong></div>
          <div class="adm-kpi-card"><small>Telephone</small><strong>{{ store.state.selectedEcole.telephone || '-' }}</strong></div>
          <div class="adm-kpi-card"><small>Email</small><strong>{{ store.state.selectedEcole.email || '-' }}</strong></div>
          <div class="adm-kpi-card"><small>Adresse</small><strong>{{ store.state.selectedEcole.adresse || '-' }}</strong></div>
          <div class="adm-kpi-card"><small>Province educationnelle</small><strong>{{ store.state.selectedEcole.provinceEducationnelle || '-' }}</strong></div>
          <div class="adm-kpi-card"><small>Ville</small><strong>{{ store.state.selectedEcole.ville || '-' }}</strong></div>
          <div class="adm-kpi-card"><small>Commune / territoire</small><strong>{{ store.state.selectedEcole.communeOuTerritoire || '-' }}</strong></div>
          <div class="adm-kpi-card"><small>Organisation</small><strong>{{ store.state.selectedEcole.idOrganisation }}</strong></div>
        </div>
      </SectionBlock>
    </template>

    <EmptyState v-else title="Aucune ecole chargee" message="Le detail n a pas encore pu relire l ecole cible." />
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { changerEcoleActiveFrontend, changerOrganisationActiveFrontend } from '../../../shared/auth/session.bootstrap';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import { useOrganizationGovernanceStore } from '../../organisation/stores/organization-governance.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { activeContextStore } from '../../../shared/session/active-context.store';

const route = useRoute();
const router = useRouter();
const store = useOrganizationGovernanceStore();
const { canUseAction } = useDoctrineAccess();
const renameTarget = ref('');
const modeTarget = ref('MONO_ECOLE');
const sigleTarget = ref('');
const telephoneTarget = ref('');
const emailTarget = ref('');
const provinceEducationnelleTarget = ref('');
const villeTarget = ref('');
const communeOuTerritoireTarget = ref('');
const adresseTarget = ref('');
const canMutateDetail = computed(() => canUseAction('school-administration.detail.write', 'ADM-002'));

async function charger(): Promise<void> {
  const idEcole = typeof route.params.idEcole === 'string' ? route.params.idEcole : '';
  if (!idEcole) return;
  await store.chargerEcole(idEcole);

  const ecole = store.state.selectedEcole;
  if (!ecole) return;
  modeTarget.value = ecole.modeExploitation || 'MONO_ECOLE';
  sigleTarget.value = ecole.sigle || '';
  telephoneTarget.value = ecole.telephone || '';
  emailTarget.value = ecole.email || '';
  provinceEducationnelleTarget.value = ecole.provinceEducationnelle || '';
  villeTarget.value = ecole.ville || '';
  communeOuTerritoireTarget.value = ecole.communeOuTerritoire || '';
  adresseTarget.value = ecole.adresse || '';
}

async function renommer(): Promise<void> {
  const idEcole = store.state.selectedEcole?.id;
  if (!idEcole || !renameTarget.value.trim()) return;
  await store.renommerEcole(idEcole, renameTarget.value.trim());
  renameTarget.value = '';
}

async function changerMode(): Promise<void> {
  const idEcole = store.state.selectedEcole?.id;
  if (!idEcole || !modeTarget.value.trim()) return;
  await store.changerModeEcole(idEcole, modeTarget.value.trim());
}

async function mettreAJourInformations(): Promise<void> {
  const idEcole = store.state.selectedEcole?.id;
  if (!idEcole) return;
  await store.mettreAJourInformationsEcole(idEcole, {
    sigle: sigleTarget.value.trim() || undefined,
    telephone: telephoneTarget.value.trim() || undefined,
    email: emailTarget.value.trim() || undefined,
    provinceEducationnelle: provinceEducationnelleTarget.value.trim() || undefined,
    ville: villeTarget.value.trim() || undefined,
    communeOuTerritoire: communeOuTerritoireTarget.value.trim() || undefined,
    adresse: adresseTarget.value.trim() || undefined,
  });
}

async function activer(): Promise<void> {
  const idEcole = store.state.selectedEcole?.id;
  if (!idEcole) return;
  await store.activerEcole(idEcole);
}

async function desactiver(): Promise<void> {
  const idEcole = store.state.selectedEcole?.id;
  if (!idEcole) return;
  await store.desactiverEcole(idEcole);
}

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

async function ouvrirWorkflowEcole(cible: string): Promise<void> {
  await activerEcoleDansContexte();
  await router.push(cible);
}

onMounted(async () => {
  await charger();
});
</script>

<style scoped>
.adm-link,.adm-pill{border:1px solid rgba(17,40,63,.14);border-radius:999px;padding:.75rem 1rem;background:#fff;color:#11283f;text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:.45rem}
.adm-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem}
.adm-kpi-card{border-radius:22px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
.adm-grid,.adm-actions{display:flex;flex-wrap:wrap;gap:.9rem}
.adm-grid,.adm-workflow-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.adm-field{display:grid;gap:.45rem;min-width:220px}
.adm-field--wide{grid-column:1/-1}
.adm-field input{border-radius:16px;border:1px solid rgba(17,40,63,.14);padding:.8rem .95rem;background:#fbfdff}
.adm-banner{padding:1rem 1.1rem;border-radius:20px;background:#eef4ff;color:#102844;font-weight:600}
.adm-banner--muted{background:#f4f7fb;color:#445b70}
.adm-workflow-card{display:grid;gap:.55rem;text-align:left;padding:1rem 1.05rem;border-radius:22px;border:1px solid rgba(17,40,63,.08);background:linear-gradient(180deg,#f7fbfd,#ffffff);box-shadow:0 18px 45px rgba(17,40,63,.08);color:#11283f}
.adm-workflow-card small{color:#587083;line-height:1.5}
</style>
