<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module transverse"
      title="Security"
      description="Gouvernance plateforme des roles, affectations, diagnostics et audit security."
    />
    <SectionBlock title="Parcours reels" description="Chaque entree reprend un workflow security deja fige au niveau plateforme.">
      <div class="sec-home-grid">
        <RouterLink class="sec-home-card" to="/app/security/roles">
          <strong>Roles et permissions</strong>
          <span>SCR-SEC-001</span>
          <p>Liste, activation, permissions et restrictions des roles security.</p>
        </RouterLink>
        <RouterLink class="sec-home-card" to="/app/security/affectations">
          <strong>Affectations et scopes</strong>
          <span>SCR-SEC-002</span>
          <p>Gouvernance transverse des affectations, scopes et titulariats.</p>
        </RouterLink>
        <RouterLink class="sec-home-card" to="/app/security/verifications">
          <strong>Diagnostic security</strong>
          <span>SCR-SEC-003</span>
          <p>Verification des permissions, scopes, restrictions et acces.</p>
        </RouterLink>
        <RouterLink class="sec-home-card" to="/app/security/audit">
          <strong>Audit security</strong>
          <span>SCR-SEC-004</span>
          <p>Lecture des logs, refus et acces controles du socle security.</p>
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
.sec-home-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem}
.sec-home-card{display:grid;gap:.45rem;padding:1rem 1.05rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.sec-home-card span{display:inline-flex;width:max-content;border-radius:999px;padding:.2rem .6rem;background:#edf4f8;color:#365066;font-size:.82rem;font-weight:600}
.sec-home-card p{margin:0;color:#5d7385}
</style>
