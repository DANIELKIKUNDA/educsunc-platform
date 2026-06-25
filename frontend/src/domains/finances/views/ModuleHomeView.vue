<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module financier"
      title="Centre financier"
      description="Le shell Lot 1 est maintenant en place. Les ecrans pilotes PF viendront se brancher ici."
    />
    <SectionBlock title="Etat du domaine" description="Point d'entree officiel du module finances.">
      <div class="module-home-grid">
        <StatChip label="Priorite" value="Haute" />
        <StatChip label="Lot suivant" value="SCR-PF-001" />
        <StatChip label="Perimetre" value="Ecole active" />
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
