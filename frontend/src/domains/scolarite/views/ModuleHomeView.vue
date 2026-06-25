<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module scolarite"
      title="Centre scolarite"
      description="Les workflows d'inscription et de suivi eleve se brancheront ici apres le shell."
    />
    <SectionBlock title="Etat du domaine" description="Point d'entree officiel du module scolarite.">
      <div class="module-home-grid">
        <StatChip label="Priorite" value="Haute" />
        <StatChip label="Lot suivant" value="SCR-SCO-001" />
        <StatChip label="Contexte" value="Permission + perimetre" />
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
