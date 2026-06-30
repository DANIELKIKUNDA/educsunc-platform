<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module transverse"
      title="Configuration"
      description="Centre de gouvernance par niveau: plateforme, organisation, ecole et preferences utilisateur."
    />

    <SectionBlock title="Parcours reels" description="Chaque entree reste bornee au niveau proprietaire deja fige dans la doctrine configuration.">
      <div class="cfg-home-grid">
        <RouterLink class="cfg-home-card" to="/app/configuration/plateforme/runtime">
          <strong>Runtime plateforme</strong>
          <span>CFG-PLAT-01</span>
          <p>Configurations `SYSTEM` et cycle technique complet.</p>
        </RouterLink>
        <RouterLink class="cfg-home-card" to="/app/configuration/organisation">
          <strong>Politiques organisationnelles</strong>
          <span>CFG-ORG-01</span>
          <p>Politiques communes, gouvernance et lecture effective organisation.</p>
        </RouterLink>
        <RouterLink class="cfg-home-card" to="/app/configuration/organisation/modules">
          <strong>Modules autorises organisation</strong>
          <span>CFG-03</span>
          <p>Liste des modules autorises pour les ecoles de l organisation.</p>
        </RouterLink>
        <RouterLink class="cfg-home-card" to="/app/configuration/ecole/modules">
          <strong>Modules ecole</strong>
          <span>CFG-04 / CFG-05</span>
          <p>Activation locale et resolution effective des modules d ecole.</p>
        </RouterLink>
        <RouterLink class="cfg-home-card" to="/app/configuration/ecole/branding">
          <strong>Branding ecole</strong>
          <span>CFG-ECOLE-METIER-01</span>
          <p>Identite documentaire locale et lecture effective `branding.*`.</p>
        </RouterLink>
        <RouterLink class="cfg-home-card" to="/app/configuration/ecole/notifications">
          <strong>Notifications ecole</strong>
          <span>CFG-ECOLE-METIER-02</span>
          <p>Templates, quotas et options locales `notifications.*`.</p>
        </RouterLink>
        <RouterLink class="cfg-home-card" to="/app/configuration/utilisateur/preferences">
          <strong>Preferences utilisateur</strong>
          <span>CFG-USER-01</span>
          <p>Preferences personnelles sans gouvernance modules ou runtime.</p>
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
.cfg-home-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem}
.cfg-home-card{display:grid;gap:.45rem;padding:1rem 1.05rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.cfg-home-card span{display:inline-flex;width:max-content;border-radius:999px;padding:.2rem .6rem;background:#edf4f8;color:#365066;font-size:.82rem;font-weight:600}
.cfg-home-card p{margin:0;color:#5d7385}
</style>
