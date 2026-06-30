<template>
  <PageContainer>
    <PageHeader eyebrow="SCR-SEC-004" title="Audit security transverse" description="Lecture plateforme des logs, refus et acces controles du socle security.">
      <template #actions>
        <RouterLink class="sec-pill" to="/app/security">
          <ArrowLeft />
          <span>Retour security</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock title="Lectures disponibles" description="L ecran relit les trois familles exposees par l audit security brut.">
      <div class="sec-actions">
        <button class="sec-pill sec-pill--action" type="button" @click="loadLogs">Logs</button>
        <button class="sec-pill" type="button" @click="loadRefus">Refus</button>
        <button class="sec-pill" type="button" @click="loadAccess">Acces</button>
      </div>
    </SectionBlock>

    <LoadingState v-if="store.state.status === 'loading'" title="Audit security en cours" message="Le backend recharge les journaux security." />
    <ErrorState v-else-if="store.state.status === 'error'" title="Lecture audit impossible" :message="store.state.errorMessage ?? 'La lecture audit security a echoue.'" />

    <template v-else>
      <SectionBlock title="Logs security" description="Journal brut des evenements security.">
        <pre class="sec-preview">{{ store.formatJson(store.state.auditLogs) }}</pre>
      </SectionBlock>
      <SectionBlock title="Refus security" description="Traces de refus et denials du socle security.">
        <pre class="sec-preview">{{ store.formatJson(store.state.auditRefus) }}</pre>
      </SectionBlock>
      <SectionBlock title="Acces security" description="Liste des acces controles relus depuis le backend.">
        <pre class="sec-preview">{{ store.formatJson(store.state.auditAccess) }}</pre>
      </SectionBlock>
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import { useSecurityStore } from '../stores/security.store';

const store = useSecurityStore();

async function loadLogs(): Promise<void> {
  await store.chargerAuditLogs();
}

async function loadRefus(): Promise<void> {
  await store.chargerAuditRefus();
}

async function loadAccess(): Promise<void> {
  await store.chargerAuditAcces();
}
</script>

<style scoped>
.sec-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.sec-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600;text-decoration:none}
.sec-pill--action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.sec-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
