<template>
  <div class="audit-modal-header">
    <div>
      <small>{{ eyebrow }}</small>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
    <button class="audit-icon-button" type="button" aria-label="Fermer" @click="emit('close')">
      <X :size="20" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';

defineProps<{ eyebrow: string; title: string; description: string }>();
const emit = defineEmits<{ close: [] }>();
</script>
