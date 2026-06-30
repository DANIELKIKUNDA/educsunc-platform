<template>
  <PageContainer>
    <PageHeader eyebrow="SCR-MON-006" title="Alertes monitoring" description="Lecture, creation et resolution des alertes plateforme.">
      <template #actions>
        <RouterLink class="mon-pill" to="/app/monitoring">
          <ArrowLeft />
          <span>Retour monitoring</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock title="Pilotage alertes" description="La vue reprend uniquement les routes alertes du backend monitoring.">
      <div class="mon-grid">
        <label class="mon-field">
          <span>Id alerte</span>
          <input v-model="alertId" type="text" placeholder="alert-001" />
        </label>
        <label class="mon-field">
          <span>Titre</span>
          <input v-model="title" type="text" placeholder="Queue saturation" />
        </label>
        <label class="mon-field">
          <span>Severite</span>
          <input v-model="severity" type="text" placeholder="HIGH" />
        </label>
        <label class="mon-field mon-field--full">
          <span>Commentaire resolution</span>
          <textarea v-model="resolutionComment" rows="4" placeholder="Cause traitee"></textarea>
        </label>
      </div>
      <div class="mon-actions">
        <button class="mon-pill mon-pill--action" type="button" @click="loadAlerts">Lister</button>
        <button class="mon-pill" type="button" @click="createAlert">Creer alerte</button>
        <button class="mon-pill" type="button" :disabled="!alertId" @click="resolveAlert">Resoudre alerte</button>
      </div>
    </SectionBlock>

    <LoadingState v-if="store.state.status === 'loading'" title="Alertes en cours" message="Le backend recharge ou mute les alertes monitoring." />
    <ErrorState v-else-if="store.state.status === 'error'" title="Action alertes impossible" :message="store.state.errorMessage ?? 'Le workflow alertes a echoue.'" />

    <template v-else>
      <SectionBlock title="Alertes" description="Liste des alertes monitoring relue depuis le backend.">
        <pre class="mon-preview">{{ store.formatJson(store.state.alerts) }}</pre>
      </SectionBlock>
      <SectionBlock v-if="store.state.lastMutation" title="Derniere mutation" description="Retour brut de creation ou resolution d alerte.">
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
const alertId = ref('');
const title = ref('');
const severity = ref('HIGH');
const resolutionComment = ref('');

async function loadAlerts(): Promise<void> {
  await store.chargerAlertes();
}

async function createAlert(): Promise<void> {
  await store.creerAlerte({
    titre: title.value.trim(),
    severite: severity.value.trim(),
  });
}

async function resolveAlert(): Promise<void> {
  await store.resoudreAlerte(alertId.value.trim(), {
    commentaire: resolutionComment.value.trim() || undefined,
  });
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
