<template>
  <PageContainer>
    <PageHeader eyebrow="SCR-MON-008" title="Capacite et saturation" description="Lecture capacite et calculs de saturation de la plateforme.">
      <template #actions>
        <RouterLink class="mon-pill" to="/app/monitoring">
          <ArrowLeft />
          <span>Retour monitoring</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock title="Capacite plateforme" description="Le frontend relit la capacite puis declenche les calculs exposes par le backend.">
      <div class="mon-grid">
        <label class="mon-field mon-field--full">
          <span>Charge utile</span>
          <textarea v-model="payloadJson" rows="5" placeholder='{"periode":"24h"}'></textarea>
        </label>
      </div>
      <div class="mon-actions">
        <button class="mon-pill mon-pill--action" type="button" @click="loadCapacity">Lire capacite</button>
        <button class="mon-pill" type="button" @click="calculateCapacity">Calculer capacite</button>
        <button class="mon-pill" type="button" @click="calculateSaturation">Calculer saturation</button>
      </div>
    </SectionBlock>

    <LoadingState v-if="store.state.status === 'loading'" title="Capacite en cours" message="Le backend relit ou calcule la capacite monitoring." />
    <ErrorState v-else-if="store.state.status === 'error'" title="Action capacite impossible" :message="store.state.errorMessage ?? 'Le workflow capacite a echoue.'" />

    <template v-else>
      <SectionBlock title="Capacite" description="Projection de la capacite monitoring relue depuis le backend.">
        <pre class="mon-preview">{{ store.formatJson(store.state.capacityData) }}</pre>
      </SectionBlock>
      <SectionBlock v-if="store.state.lastMutation" title="Dernier calcul" description="Retour brut du calcul de capacite ou de saturation.">
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
const payloadJson = ref('{"periode":"24h"}');

function lirePayload(): Record<string, unknown> {
  try {
    return JSON.parse(payloadJson.value) as Record<string, unknown>;
  } catch {
    return { periode: '24h' };
  }
}

async function loadCapacity(): Promise<void> {
  await store.chargerCapacite();
}

async function calculateCapacity(): Promise<void> {
  await store.calculerCapacite(lirePayload());
}

async function calculateSaturation(): Promise<void> {
  await store.calculerSaturation(lirePayload());
}
</script>

<style scoped>
.mon-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.mon-field{display:grid;gap:.45rem}
.mon-field--full{grid-column:1/-1}
.mon-field textarea{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.mon-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.mon-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600;text-decoration:none}
.mon-pill--action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.mon-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
