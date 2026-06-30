<template>
  <PageContainer>
    <PageHeader :eyebrow="screenCode" :title="title" :description="description">
      <template #actions>
        <RouterLink class="mon-pill" to="/app/monitoring">
          <ArrowLeft />
          <span>Retour monitoring</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock :title="sectionTitle" :description="sectionDescription">
      <div class="mon-actions">
        <button class="mon-pill mon-pill--action" type="button" @click="load">Rafraichir</button>
      </div>
    </SectionBlock>

    <LoadingState v-if="store.state.status === 'loading'" title="Monitoring en cours" :message="loadingMessage" />
    <ErrorState v-else-if="store.state.status === 'error'" title="Lecture monitoring impossible" :message="store.state.errorMessage ?? 'La lecture monitoring a echoue.'" />

    <template v-else>
      <SectionBlock title="Projection principale" description="Le frontend expose la lecture backend brute sans moteur parallele.">
        <pre class="mon-preview">{{ store.formatJson(mainData) }}</pre>
      </SectionBlock>

      <SectionBlock v-if="mode === 'health'" title="Snapshot health" description="Snapshot technique complementaire de la sante systeme.">
        <pre class="mon-preview">{{ store.formatJson(store.state.healthSnapshotData) }}</pre>
      </SectionBlock>
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import type { MonitoringOverviewMode } from '../models/monitoring.model';
import { useMonitoringStore } from '../stores/monitoring.store';

const props = defineProps<{
  screenCode: string;
  title: string;
  description: string;
  sectionTitle: string;
  sectionDescription: string;
  loadingMessage: string;
  mode: MonitoringOverviewMode;
}>();

const store = useMonitoringStore();

const mainData = computed(() => {
  if (props.mode === 'state') {
    return store.state.stateData;
  }
  if (props.mode === 'dashboard') {
    return store.state.dashboardData;
  }
  if (props.mode === 'observability') {
    return store.state.observabilityData;
  }
  return store.state.healthData;
});

async function load(): Promise<void> {
  if (props.mode === 'state') {
    await store.chargerEtat();
    return;
  }
  if (props.mode === 'dashboard') {
    await store.chargerDashboard();
    return;
  }
  if (props.mode === 'observability') {
    await store.chargerObservabilite();
    return;
  }
  await store.chargerHealth();
}
</script>

<style scoped>
.mon-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.mon-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600;text-decoration:none}
.mon-pill--action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.mon-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
