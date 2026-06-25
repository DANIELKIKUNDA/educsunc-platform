<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module pedagogique"
      title="Centre pedagogique"
      description="Les analyses, resultats, bulletins et proclamations se brancheront sur cette racine."
    />
    <SectionBlock title="Etat du domaine" description="Point d'entree officiel du module pedagogique.">
      <div class="module-home-grid">
        <StatChip label="Priorite" value="Haute" />
        <StatChip label="Lot suivant" value="SCR-PED-001" />
        <StatChip label="Exports" value="PDF reels" />
      </div>
    </SectionBlock>
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import StatChip from '../../../shared/ui/StatChip.vue';
</script>
