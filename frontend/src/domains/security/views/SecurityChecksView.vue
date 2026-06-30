<template>
  <PageContainer>
    <PageHeader eyebrow="SCR-SEC-003" title="Diagnostic permissions, scopes et acces" description="Verification transverse du socle security sans mutation de roles ou d affectations.">
      <template #actions>
        <RouterLink class="sec-pill" to="/app/security">
          <ArrowLeft />
          <span>Retour security</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock title="Charge utile de verification" description="Les formulaires envoient directement les verifications backend security.">
      <div class="sec-grid">
        <label class="sec-field">
          <span>Utilisateur</span>
          <input v-model="payload.idUtilisateur" type="text" placeholder="user-001" />
        </label>
        <label class="sec-field">
          <span>Permission</span>
          <input v-model="payload.permission" type="text" placeholder="bulletins.read" />
        </label>
        <label class="sec-field">
          <span>Type scope</span>
          <input v-model="payload.typeScope" type="text" placeholder="ECOLE" />
        </label>
        <label class="sec-field">
          <span>Valeur scope</span>
          <input v-model="payload.valeurScope" type="text" placeholder="ecole-001" />
        </label>
        <label class="sec-field">
          <span>Restriction</span>
          <input v-model="payload.restriction" type="text" placeholder="SECTION_SECONDAIRE_ONLY" />
        </label>
        <label class="sec-field">
          <span>Action</span>
          <input v-model="payload.action" type="text" placeholder="GENERER_BULLETIN" />
        </label>
        <label class="sec-field">
          <span>Ressource</span>
          <input v-model="payload.ressource" type="text" placeholder="bulletin-eleve" />
        </label>
      </div>

      <div class="sec-actions">
        <button class="sec-pill sec-pill--action" type="button" @click="checkPermission">Verifier permission</button>
        <button class="sec-pill" type="button" @click="checkScope">Verifier scope</button>
        <button class="sec-pill" type="button" @click="checkRestriction">Verifier restriction</button>
        <button class="sec-pill" type="button" @click="checkAccess">Verifier acces</button>
      </div>
    </SectionBlock>

    <LoadingState v-if="store.state.status === 'loading'" title="Diagnostic en cours" message="Le backend verifie la demande security." />
    <ErrorState v-else-if="store.state.status === 'error'" title="Diagnostic impossible" :message="store.state.errorMessage ?? 'Le diagnostic security a echoue.'" />

    <template v-else>
      <SectionBlock title="Permission" description="Resultat de la verification de permission.">
        <pre class="sec-preview">{{ store.formatJson(store.state.permissionCheck) }}</pre>
      </SectionBlock>
      <SectionBlock title="Scope" description="Resultat de la verification de scope.">
        <pre class="sec-preview">{{ store.formatJson(store.state.scopeCheck) }}</pre>
      </SectionBlock>
      <SectionBlock title="Restriction" description="Resultat de la verification de restriction.">
        <pre class="sec-preview">{{ store.formatJson(store.state.restrictionCheck) }}</pre>
      </SectionBlock>
      <SectionBlock title="Acces" description="Decision d acces finale relue depuis le backend.">
        <pre class="sec-preview">{{ store.formatJson(store.state.accessCheck) }}</pre>
      </SectionBlock>
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import { useSecurityStore } from '../stores/security.store';

const store = useSecurityStore();
const payload = reactive({
  idUtilisateur: '',
  permission: '',
  typeScope: '',
  valeurScope: '',
  restriction: '',
  action: '',
  ressource: '',
});

async function checkPermission(): Promise<void> {
  await store.verifierPermission({ ...payload });
}

async function checkScope(): Promise<void> {
  await store.verifierScope({ ...payload });
}

async function checkRestriction(): Promise<void> {
  await store.verifierRestriction({ ...payload });
}

async function checkAccess(): Promise<void> {
  await store.verifierAcces({ ...payload });
}
</script>

<style scoped>
.sec-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.sec-field{display:grid;gap:.45rem}
.sec-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.sec-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.sec-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600;text-decoration:none}
.sec-pill--action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.sec-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
