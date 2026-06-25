<template>
  <div class="ui-state ui-state--error">
    <div class="ui-state__icon">
      <TriangleAlert />
    </div>
    <div class="ui-state__content">
      <strong>{{ title }}</strong>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TriangleAlert } from 'lucide-vue-next';

defineProps<{
  title: string;
  message: string;
}>();
</script>
