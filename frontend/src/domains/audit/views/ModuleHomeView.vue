<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module transverse"
      title="Audit"
      description="Centre de lecture des traces, historiques et contrôles, strictement borné par rôle, permission et périmètre réels."
    >
      <template #actions>
        <div class="audit-module-links">
          <RouterLink class="audit-pill" to="/app/audit/plateforme">Audit plateforme</RouterLink>
          <RouterLink class="audit-pill" to="/app/audit/organisation">Audit organisation</RouterLink>
          <RouterLink class="audit-pill" to="/app/audit/ecole/administratif-financier">Audit administratif et financier</RouterLink>
          <RouterLink class="audit-pill" to="/app/audit/ecole/technique">Audit technique école</RouterLink>
          <RouterLink class="audit-pill audit-pill--action" to="/app/audit/pedagogique/cotes">Audit pédagogique</RouterLink>
        </div>
      </template>
    </PageHeader>

    <SectionBlock
      title="Familles réelles"
      description="Le module ne propose pas un audit universel. Chaque écran respecte une famille backend déjà figée."
    >
      <div class="audit-module-grid">
        <RouterLink class="audit-home-card" to="/app/audit/plateforme">
          <strong>SCR-AUD-001</strong>
          <span>Audit plateforme</span>
          <small>Manager système, opérateur, support selon permissions audit.read, audit.timeline.read, audit.history.read.</small>
        </RouterLink>
        <RouterLink class="audit-home-card" to="/app/audit/organisation">
          <strong>SCR-AUD-002</strong>
          <span>Audit organisationnel</span>
          <small>Promoteur et gestionnaire organisation dans le périmètre organisationnel uniquement.</small>
        </RouterLink>
        <RouterLink class="audit-home-card" to="/app/audit/ecole/administratif-financier">
          <strong>SCR-AUD-003</strong>
          <span>Audit administratif et financier</span>
          <small>Administrateur école et caissier sur la famille d audit financier de l école active.</small>
        </RouterLink>
        <RouterLink class="audit-home-card" to="/app/audit/ecole/technique">
          <strong>SCR-AUD-004</strong>
          <span>Audit technique école</span>
          <small>Administrateur système école uniquement, sans ouvrir le monitoring global plateforme.</small>
        </RouterLink>
        <RouterLink class="audit-home-card" to="/app/audit/pedagogique/cotes">
          <strong>SCR-AUD-005</strong>
          <span>Audit pédagogique</span>
          <small>Lecture toujours ouverte depuis un objet pédagogique réel : cotes, conduite, bulletins ou classements.</small>
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

<style scoped src="../../../styles/shell-audit.css"></style>
