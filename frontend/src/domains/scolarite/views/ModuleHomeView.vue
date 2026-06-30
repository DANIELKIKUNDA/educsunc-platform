<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module scolarite"
      title="Centre scolarite"
      description="Le module rassemble les flux reels d inscription, de familles, d affectation et de cycle de vie."
    />
    <SectionBlock title="Etat du domaine" description="Chaque entree ci-dessous correspond a un workflow fige du backend scolarite.">
      <div class="module-home-grid">
        <StatChip label="MS-01" value="Inscription complete" />
        <StatChip label="MS-02" value="Gestion eleves" />
        <StatChip label="MS-03" value="Gestion familles" />
        <StatChip label="MS-04" value="Affectations" />
        <StatChip label="MS-05" value="Cycle de vie" />
        <StatChip label="MS-06" value="Suspension" />
      </div>
    </SectionBlock>

    <SectionBlock title="Vues ouvertes" description="Le frontend garde la doctrine permission + perimetre visible.">
      <div class="module-links-grid">
        <RouterLink class="module-link-card" to="/app/scolarite/inscriptions">
          <strong>Inscription scolaire complete</strong>
          <span>Flux caissier eleve -> famille -> inscription -> affectation.</span>
        </RouterLink>
        <RouterLink class="module-link-card" to="/app/scolarite/eleves">
          <strong>Gestion des eleves</strong>
          <span>Lecture liste / detail dans le bon perimetre d ecole ou de section.</span>
        </RouterLink>
        <RouterLink class="module-link-card" to="/app/scolarite/familles">
          <strong>Gestion des familles</strong>
          <span>Consultation et creation des familles liees a l inscription.</span>
        </RouterLink>
        <RouterLink class="module-link-card" to="/app/scolarite/affectations">
          <strong>Affectations de classe</strong>
          <span>Lecture et mutation des affectations annuelles.</span>
        </RouterLink>
        <RouterLink class="module-link-card" to="/app/scolarite/cycle-vie">
          <strong>Cycle de vie eleve</strong>
          <span>Abandon, transfert, reactivation, deces et suspension selon l acteur.</span>
        </RouterLink>
        <RouterLink class="module-link-card" to="/app/scolarite/suspensions">
          <strong>Suspension eleve</strong>
          <span>Vue ciblee pour la suspension disciplinaire ou pedagogique locale.</span>
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
import StatChip from '../../../shared/ui/StatChip.vue';
</script>

<style scoped>
.module-home-grid,.module-links-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.module-link-card{display:grid;gap:.5rem;padding:1rem 1.1rem;border-radius:24px;border:1px solid rgba(17,40,63,.08);background:linear-gradient(180deg,rgba(244,249,252,.96),rgba(255,255,255,.98));box-shadow:0 18px 45px rgba(17,40,63,.08);text-decoration:none;color:#11283f}
.module-link-card span{color:#486173}
</style>
