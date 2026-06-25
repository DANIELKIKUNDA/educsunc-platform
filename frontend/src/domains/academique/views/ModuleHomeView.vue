<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module academique"
      title="Centre academique"
      description="Les referentiels, programmes et structures académiques seront raccordes a cette vue racine."
    />
    <SectionBlock title="Etat du domaine" description="Point d'entree officiel du module academique.">
      <div class="module-home-grid">
        <StatChip label="Base existante" value="Referentiel present" />
        <StatChip label="Reprise" value="Progressive" />
        <StatChip label="Statut" value="Pret" />
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
