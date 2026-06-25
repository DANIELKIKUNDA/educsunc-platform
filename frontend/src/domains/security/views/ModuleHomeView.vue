<template>
  <PageContainer>
    <PageHeader
      eyebrow="Module transverse"
      title="Security"
      description="Permissions visibles, matrices de capacites et lectures de perimetre vivront ici."
    />
    <SectionBlock title="Etat du domaine" description="Racine security prete pour la lecture frontend des droits.">
      <LoadingState title="Security prete" message="Le shell applique deja une premiere couche de capacites visibles." />
    </SectionBlock>
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
</script>
