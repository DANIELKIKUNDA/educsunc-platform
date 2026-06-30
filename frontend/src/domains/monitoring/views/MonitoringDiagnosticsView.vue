<template>
  <PageContainer>
    <PageHeader eyebrow="SCR-MON-007" title="Diagnostics monitoring" description="Lecture et generation de diagnostics monitoring.">
      <template #actions>
        <RouterLink class="mon-pill" to="/app/monitoring">
          <ArrowLeft />
          <span>Retour monitoring</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock title="Pilotage diagnostics" description="Le frontend relit la liste et declenche la generation sur incident cible.">
      <div class="mon-grid">
        <label class="mon-field">
          <span>Id incident</span>
          <input v-model="incidentId" type="text" placeholder="incident-001" />
        </label>
        <label class="mon-field mon-field--full">
          <span>Options generation</span>
          <textarea v-model="optionsJson" rows="4" placeholder='{"niveau":"STANDARD"}'></textarea>
        </label>
      </div>
      <div class="mon-actions">
        <button class="mon-pill mon-pill--action" type="button" @click="loadDiagnostics">Lister diagnostics</button>
        <button class="mon-pill" type="button" :disabled="!incidentId" @click="generateDiagnostic">Generer diagnostic</button>
      </div>
    </SectionBlock>

    <LoadingState v-if="store.state.status === 'loading'" title="Diagnostics en cours" message="Le backend recharge ou genere un diagnostic monitoring." />
    <ErrorState v-else-if="store.state.status === 'error'" title="Action diagnostics impossible" :message="store.state.errorMessage ?? 'Le workflow diagnostics a echoue.'" />

    <template v-else>
      <SectionBlock title="Diagnostics" description="Liste des diagnostics monitoring relue depuis le backend.">
        <pre class="mon-preview">{{ store.formatJson(store.state.diagnostics) }}</pre>
      </SectionBlock>
      <SectionBlock v-if="store.state.lastMutation" title="Derniere mutation" description="Retour brut de generation de diagnostic.">
        <pre class="mon-preview">{{ store.formatJson(store.state.lastMutation) }}</pre>
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
import { useMonitoringStore } from '../stores/monitoring.store';

const store = useMonitoringStore();
const incidentId = ref('');
const optionsJson = ref('{"niveau":"STANDARD"}');

async function loadDiagnostics(): Promise<void> {
  await store.chargerDiagnostics();
}

async function generateDiagnostic(): Promise<void> {
  let payload: Record<string, unknown> = {};

  try {
    payload = JSON.parse(optionsJson.value) as Record<string, unknown>;
  } catch {
    payload = { niveau: 'STANDARD' };
  }

  await store.genererDiagnostic(incidentId.value.trim(), payload);
}
</script>

<style scoped>
.mon-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.mon-field{display:grid;gap:.45rem}
.mon-field--full{grid-column:1/-1}
.mon-field input,.mon-field textarea{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.mon-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.mon-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600;text-decoration:none}
.mon-pill--action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.mon-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
