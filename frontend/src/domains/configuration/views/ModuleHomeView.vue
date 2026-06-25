<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module transverse"
      title="Configuration"
      description="La gouvernance par niveau et les reglages visibles se brancheront sur ce module."
    />
    <SectionBlock title="Etat du domaine" description="Racine configuration prete pour les parametrages par niveau.">
      <LoadingState title="Configuration en attente" message="Le shell supporte deja le contexte et la navigation par module." />
    </SectionBlock>
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
</script>
