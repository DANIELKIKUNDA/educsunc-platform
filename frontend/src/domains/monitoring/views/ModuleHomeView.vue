<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module transverse"
      title="Monitoring"
      description="Supervision, observabilite et sante applicative seront centralisees ici."
    />
    <SectionBlock title="Etat du domaine" description="Racine monitoring prete pour les contrats transverses.">
      <LoadingState title="Preparation du module" message="Le shell est pret a accueillir les vues monitoring." />
    </SectionBlock>
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
</script>
