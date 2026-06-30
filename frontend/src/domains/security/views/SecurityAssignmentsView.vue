<template>
  <PageContainer>
    <PageHeader eyebrow="SCR-SEC-002" title="Affectations, scopes et titulariats" description="Gouvernance transverse des affectations security au niveau plateforme.">
      <template #actions>
        <RouterLink class="sec-pill" to="/app/security">
          <ArrowLeft />
          <span>Retour security</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock title="Commandes d affectation" description="Les actions restent bornees au socle transverse shared/security.">
      <div class="sec-grid">
        <label class="sec-field">
          <span>Utilisateur</span>
          <input v-model="userId" type="text" placeholder="user-001" />
        </label>
        <label class="sec-field">
          <span>Role</span>
          <input v-model="roleId" type="text" placeholder="role-001" />
        </label>
        <label class="sec-field">
          <span>Niveau acces</span>
          <input v-model="accessLevel" type="text" placeholder="ECOLE" />
        </label>
        <label class="sec-field">
          <span>Id affectation</span>
          <input v-model="assignmentId" type="text" placeholder="affect-001" />
        </label>
        <label class="sec-field">
          <span>Type scope</span>
          <input v-model="scopeType" type="text" placeholder="ECOLE" />
        </label>
        <label class="sec-field">
          <span>Valeur scope</span>
          <input v-model="scopeValue" type="text" placeholder="ecole-001" />
        </label>
        <label class="sec-field">
          <span>Classe titulariat</span>
          <input v-model="classeId" type="text" placeholder="classe-001" />
        </label>
        <label class="sec-field">
          <span>Annee scolaire</span>
          <input v-model="anneeId" type="text" placeholder="annee-001" />
        </label>
      </div>

      <div class="sec-actions">
        <button class="sec-pill sec-pill--action" type="button" @click="createAssignment">Creer affectation</button>
        <button class="sec-pill" type="button" :disabled="!assignmentId" @click="activateAssignment">Activer affectation</button>
        <button class="sec-pill" type="button" :disabled="!assignmentId" @click="deactivateAssignment">Desactiver affectation</button>
        <button class="sec-pill" type="button" :disabled="!assignmentId || !scopeType || !scopeValue" @click="addScope">Ajouter scope</button>
        <button class="sec-pill" type="button" :disabled="!assignmentId || !scopeType || !scopeValue" @click="removeScope">Retirer scope</button>
        <button class="sec-pill" type="button" :disabled="!userId" @click="loadAssignments">Lister affectations</button>
        <button class="sec-pill" type="button" :disabled="!userId" @click="loadScopes">Lister scopes</button>
        <button class="sec-pill" type="button" :disabled="!userId || !classeId || !anneeId" @click="assignTitulariat">Creer titulariat</button>
        <button class="sec-pill" type="button" :disabled="!classeId || !anneeId" @click="removeTitulariat">Supprimer titulariat</button>
        <button class="sec-pill" type="button" :disabled="!classeId || !anneeId" @click="checkTitulariat">Consulter titulariat</button>
      </div>
    </SectionBlock>

    <LoadingState v-if="store.state.status === 'loading'" title="Security en cours" message="Le backend recharge les affectations security." />
    <ErrorState v-else-if="store.state.status === 'error'" title="Action affectation impossible" :message="store.state.errorMessage ?? 'Le workflow affectations security a echoue.'" />

    <template v-else>
      <SectionBlock title="Resume" description="Projection des affectations, scopes et titulariats.">
        <div class="sec-summary-grid">
          <div class="sec-card">
            <small>Affectations</small>
            <strong>{{ store.resumeAffectations(store.state.affectations) }}</strong>
          </div>
          <div class="sec-card">
            <small>Scopes</small>
            <strong>{{ store.state.scopes.length }} scope(s)</strong>
          </div>
          <div class="sec-card">
            <small>Titulariat</small>
            <strong>{{ store.state.titulariat === null ? 'Aucun' : 'Charge' }}</strong>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="Affectations utilisateur" description="Liste des affectations d un utilisateur security.">
        <pre class="sec-preview">{{ store.formatJson(store.state.affectations) }}</pre>
      </SectionBlock>

      <SectionBlock v-if="store.state.scopes.length > 0" title="Scopes utilisateur" description="Liste brute des scopes rattaches.">
        <pre class="sec-preview">{{ store.formatJson(store.state.scopes) }}</pre>
      </SectionBlock>

      <SectionBlock v-if="store.state.titulariat !== null" title="Titulariat" description="Verification ou mutation du titulariat security.">
        <pre class="sec-preview">{{ store.formatJson(store.state.titulariat) }}</pre>
      </SectionBlock>

      <SectionBlock v-if="store.state.lastMutation" title="Derniere mutation" description="Retour brut des operations security transverses.">
        <pre class="sec-preview">{{ store.formatJson(store.state.lastMutation) }}</pre>
      </SectionBlock>
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import { tenantContextStore } from '../../../shared/session/tenant-context.store';
import { useSecurityStore } from '../stores/security.store';

const store = useSecurityStore();
const tenantContext = tenantContextStore.state;
const userId = ref('');
const roleId = ref('');
const accessLevel = ref('ECOLE');
const assignmentId = ref('');
const scopeType = ref('');
const scopeValue = ref('');
const classeId = ref('');
const anneeId = ref('');

async function createAssignment(): Promise<void> {
  await store.creerAffectation({
    idUtilisateur: userId.value.trim(),
    idRole: roleId.value.trim(),
    niveauAcces: accessLevel.value.trim(),
    idOrganisation: tenantContext.organizationId,
    idEcole: tenantContext.schoolId,
  });
}

async function activateAssignment(): Promise<void> {
  await store.activerAffectation(assignmentId.value.trim());
}

async function deactivateAssignment(): Promise<void> {
  await store.desactiverAffectation(assignmentId.value.trim());
}

async function addScope(): Promise<void> {
  await store.ajouterScope(assignmentId.value.trim(), {
    typeScope: scopeType.value.trim(),
    valeurScope: scopeValue.value.trim(),
  });
}

async function removeScope(): Promise<void> {
  await store.retirerScope(assignmentId.value.trim(), scopeType.value.trim(), scopeValue.value.trim());
}

async function loadAssignments(): Promise<void> {
  await store.chargerAffectations(userId.value.trim());
}

async function loadScopes(): Promise<void> {
  await store.chargerScopes(userId.value.trim());
}

async function assignTitulariat(): Promise<void> {
  await store.attribuerTitulariat({
    idUtilisateur: userId.value.trim(),
    idOrganisation: tenantContext.organizationId,
    idEcole: tenantContext.schoolId,
    idClasse: classeId.value.trim(),
    idAnneeScolaire: anneeId.value.trim(),
  });
}

async function removeTitulariat(): Promise<void> {
  await store.retirerTitulariat(classeId.value.trim(), anneeId.value.trim());
}

async function checkTitulariat(): Promise<void> {
  await store.verifierTitulariat(classeId.value.trim(), anneeId.value.trim());
}
</script>

<style scoped>
.sec-grid,.sec-summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.sec-field{display:grid;gap:.45rem}
.sec-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.sec-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.sec-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600;text-decoration:none}
.sec-pill--action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.sec-summary-grid .sec-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
.sec-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
