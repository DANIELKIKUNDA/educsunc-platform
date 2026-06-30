<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module transverse"
      title="Notifications"
      description="Centre de diffusion, lecture locale, exploitation technique et supervision organisationnelle."
    />
    <SectionBlock title="Parcours reels" description="Les ecrans reprennent strictement les workflows notifications deja figes.">
      <div class="notif-home-grid">
        <RouterLink class="notif-home-card" to="/app/notifications/ecole/envoyer">
          <strong>Diffusion locale</strong>
          <span>SCR-NOTIF-001</span>
          <p>Emission locale ecole, canaux actifs et contexte de diffusion.</p>
        </RouterLink>
        <RouterLink class="notif-home-card" to="/app/notifications/ecole">
          <strong>Lecture locale</strong>
          <span>SCR-NOTIF-002</span>
          <p>Liste, detail, timeline, monitoring et escalade locale des notifications.</p>
        </RouterLink>
        <RouterLink class="notif-home-card" to="/app/notifications/ecole/operations">
          <strong>Operations techniques</strong>
          <span>SCR-NOTIF-003</span>
          <p>Dead-letter, retry, replay et diagnostic local d exploitation.</p>
        </RouterLink>
        <RouterLink class="notif-home-card" to="/app/notifications/organisation">
          <strong>Supervision organisation</strong>
          <span>SCR-NOTIF-004</span>
          <p>Archives, vues tenant, escalades et capacites consolidees.</p>
        </RouterLink>
        <RouterLink class="notif-home-card" to="/app/notifications/organisation/realtime">
          <strong>Temps reel futur</strong>
          <span>SCR-NOTIF-005</span>
          <p>Lecture des capacites et test de publication organisationnelle controlee.</p>
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
.notif-home-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem}
.notif-home-card{display:grid;gap:.45rem;padding:1rem 1.05rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.notif-home-card span{display:inline-flex;width:max-content;border-radius:999px;padding:.2rem .6rem;background:#edf4f8;color:#365066;font-size:.82rem;font-weight:600}
.notif-home-card p{margin:0;color:#5d7385}
</style>
