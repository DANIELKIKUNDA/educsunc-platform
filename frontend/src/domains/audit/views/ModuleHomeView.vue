<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module transverse"
      title="Audit"
      description="Les pistes d'audit et les lectures de gouvernance se brancheront sur cette racine."
    />
    <SectionBlock title="Etat du domaine" description="Racine audit prete pour les vues de controle.">
      <LoadingState title="Lot transverse" message="Le shell et les gardes sont maintenant disponibles pour audit." />
    </SectionBlock>
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
</script>
