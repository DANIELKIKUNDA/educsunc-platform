<template>
  <PageContainer>
    <LoadingState
      v-if="vm.destination.value"
      title="Ouverture du journal d'audit"
      message="Le centre adapte la lecture à votre niveau et à vos autorisations."
    />
    <ErrorState
      v-else
      title="Aucun journal accessible"
      message="Votre profil ne dispose d'aucune lecture d'audit dans le niveau actuellement sélectionné."
    />
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from '../../../shared/layout/PageContainer.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import { useAuditEntryViewModel } from '../viewmodels/useAuditEntryViewModel';

const vm = useAuditEntryViewModel();
</script>
