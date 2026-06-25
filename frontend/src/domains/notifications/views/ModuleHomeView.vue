<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module transverse"
      title="Notifications"
      description="Les canaux, templates et diffusions visibles s'implanteront ici."
    />
    <SectionBlock title="Etat du domaine" description="Racine notifications prete pour la phase contrats d'ecran.">
      <LoadingState title="Notifications pretes" message="Le shell a deja la place pour les usages multi-canal." />
    </SectionBlock>
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
</script>
