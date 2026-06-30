<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module transverse"
      title="Monitoring"
      description="Centre plateforme pour l etat systeme, incidents, alertes, diagnostics, capacite et traces."
    />
    <SectionBlock title="Parcours reels" description="Chaque entree suit un workflow monitoring deja fige au niveau plateforme.">
      <div class="mon-home-grid">
        <RouterLink class="mon-home-card" to="/app/monitoring/etat-systeme">
          <strong>Etat systeme</strong>
          <span>SCR-MON-001</span>
          <p>Lecture synthetique de l etat general de la plateforme.</p>
        </RouterLink>
        <RouterLink class="mon-home-card" to="/app/monitoring/dashboard">
          <strong>Dashboard monitoring</strong>
          <span>SCR-MON-002</span>
          <p>Vue consolidee des signaux monitoring utiles au pilotage.</p>
        </RouterLink>
        <RouterLink class="mon-home-card" to="/app/monitoring/observabilite">
          <strong>Observabilite</strong>
          <span>SCR-MON-003</span>
          <p>Lecture des regroupements et signaux d observabilite plateforme.</p>
        </RouterLink>
        <RouterLink class="mon-home-card" to="/app/monitoring/sante">
          <strong>Sante systeme</strong>
          <span>SCR-MON-004</span>
          <p>Etat de sante courant et snapshot technique prioritaire.</p>
        </RouterLink>
        <RouterLink class="mon-home-card" to="/app/monitoring/incidents">
          <strong>Incidents</strong>
          <span>SCR-MON-005</span>
          <p>Lecture, ouverture et escalation des incidents plateforme.</p>
        </RouterLink>
        <RouterLink class="mon-home-card" to="/app/monitoring/alertes">
          <strong>Alertes</strong>
          <span>SCR-MON-006</span>
          <p>Lecture, creation et resolution des alertes monitoring.</p>
        </RouterLink>
        <RouterLink class="mon-home-card" to="/app/monitoring/diagnostics">
          <strong>Diagnostics</strong>
          <span>SCR-MON-007</span>
          <p>Lecture et generation de diagnostics monitoring.</p>
        </RouterLink>
        <RouterLink class="mon-home-card" to="/app/monitoring/capacite">
          <strong>Capacite</strong>
          <span>SCR-MON-008</span>
          <p>Lecture capacite et calculs de saturation plateforme.</p>
        </RouterLink>
        <RouterLink class="mon-home-card" to="/app/monitoring/traces">
          <strong>Traces</strong>
          <span>SCR-MON-009</span>
          <p>Lecture et capture de traces dans le perimetre monitoring.</p>
        </RouterLink>
      </div>
    </SectionBlock>
  </PageContainer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
</script>

<style scoped>
.mon-home-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem}
.mon-home-card{display:grid;gap:.45rem;padding:1rem 1.05rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.mon-home-card span{display:inline-flex;width:max-content;border-radius:999px;padding:.2rem .6rem;background:#edf4f8;color:#365066;font-size:.82rem;font-weight:600}
.mon-home-card p{margin:0;color:#5d7385}
</style>
