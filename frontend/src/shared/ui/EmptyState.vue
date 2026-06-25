<template>
  <div class="ui-state ui-state--empty">
    <div class="ui-state__icon">
      <Inbox />
    </div>
    <div class="ui-state__content">
      <strong>{{ title }}</strong>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Inbox } from 'lucide-vue-next';

defineProps<{
  title: string;
  message: string;
}>();
</script>
