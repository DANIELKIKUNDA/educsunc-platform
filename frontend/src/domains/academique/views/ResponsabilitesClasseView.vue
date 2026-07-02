<template>
  <PageContainer>
    <PageHeader eyebrow="ACA-05" title="Responsables de classe" description="Attribution, consultation et retrait du responsable officiel d une classe pedagogique." />
    <AccessBoundary page-code="ACA-LOC-003">
      <ErrorState v-if="!isAuthorized" title="Acces non autorise" message="Cette responsabilite locale reste reservee a l administrateur systeme ecole." />
      <template v-else>
        <SectionBlock title="Gestion du titulaire" description="Le backend attend la classe pedagogique, l annee scolaire et l enseignant cible.">
          <div class="academique-form-grid">
            <label class="academique-field"><span>Id classe pedagogique</span><input v-model="idClassePedagogiqueInput" type="text" /></label>
            <label class="academique-field"><span>Id annee scolaire</span><input v-model="idAnneeScolaireInput" type="text" /></label>
            <label class="academique-field"><span>Id utilisateur enseignant</span><input v-model="idUtilisateurEnseignantInput" type="text" /></label>
            <label class="academique-field"><span>Utilisateur trace</span><input v-model="traceUtilisateur" type="text" /></label>
          </div>
          <div class="academique-actions-row">
            <button class="academique-primary-action" type="button" :disabled="store.state.status === 'loading' || !canAssign" @click="attribuer">Attribuer</button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !canConsult" @click="consulter">Consulter</button>
            <button class="academique-secondary-action" type="button" :disabled="store.state.status === 'loading' || !canConsult" @click="retirer">Retirer</button>
          </div>
        </SectionBlock>

        <LoadingState v-if="store.state.status === 'loading'" title="Responsabilite de classe" message="Lecture ou mutation de la responsabilite officielle en cours." />
        <ErrorState v-else-if="store.state.status === 'error'" title="Operation impossible" :message="store.state.errorMessage ?? 'Operation impossible.'" />
        <SectionBlock v-else-if="store.state.responsabilite" title="Responsabilite active" description="Projection backend de la responsabilite de classe pedagogique.">
          <pre class="academique-json-preview">{{ JSON.stringify(store.state.responsabilite, null, 2) }}</pre>
        </SectionBlock>
        <EmptyState v-else title="Aucune responsabilite chargee" message="Consultez une classe pour voir ou produire sa responsabilite officielle." />
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { tenantContextStore } from '../../../shared/session/tenant-context.store';
import { useResponsabilitesClasseStore } from '../stores/responsabilites-classe.store';

const store = useResponsabilitesClasseStore();
const tenantContext = tenantContextStore.state;
const doctrineAccess = useDoctrineAccess();
const isAuthorized = doctrineAccess.canAccessPage('ACA-LOC-003');
const idClassePedagogiqueInput = ref('');
const idAnneeScolaireInput = ref('');
const idUtilisateurEnseignantInput = ref('');
const traceUtilisateur = ref(tenantContext.userId);

const canConsult = computed(() => idClassePedagogiqueInput.value.trim() && idAnneeScolaireInput.value.trim());
const canAssign = computed(() => canConsult.value && idUtilisateurEnseignantInput.value.trim() && traceUtilisateur.value.trim());

async function attribuer(): Promise<void> {
  await store.attribuer(idClassePedagogiqueInput.value.trim(), {
    idUtilisateurEnseignant: idUtilisateurEnseignantInput.value.trim(),
    creePar: traceUtilisateur.value.trim(),
  });
}

async function consulter(): Promise<void> {
  await store.consulter(idClassePedagogiqueInput.value.trim(), idAnneeScolaireInput.value.trim());
}

async function retirer(): Promise<void> {
  await store.retirer(idClassePedagogiqueInput.value.trim(), idAnneeScolaireInput.value.trim());
}
</script>

<style scoped>
.academique-form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.academique-field{display:grid;gap:.45rem}
.academique-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.academique-actions-row{display:flex;flex-wrap:wrap;gap:.75rem}
.academique-primary-action,.academique-secondary-action{border:1px solid rgba(17,40,63,.14);border-radius:999px;padding:.75rem 1rem;font-weight:600}
.academique-primary-action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff}
.academique-secondary-action{background:#fff;color:#11283f}
.academique-primary-action:disabled,.academique-secondary-action:disabled{opacity:.55;cursor:not-allowed}
.academique-json-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
