<template><div class="security-toolbar"><label><Search :size="17" /><span class="sr-only">Rechercher</span><input :value="search" type="search" :placeholder="placeholder" @input="$emit('update:search', ($event.target as HTMLInputElement).value)" /></label><label v-if="statuses?.length" class="security-toolbar__select"><span class="sr-only">Filtrer par état</span><select :value="status" @change="$emit('update:status', ($event.target as HTMLSelectElement).value)"><option v-for="item in statuses" :key="item.value" :value="item.value">{{ item.label }}</option></select><ChevronDown :size="16" aria-hidden="true" /></label></div></template>
<script setup lang="ts">
import { ChevronDown, Search } from 'lucide-vue-next';
withDefaults(defineProps<{ search: string; status?: string; placeholder: string; statuses?: readonly {value:string;label:string}[] }>(),{status:'ALL',statuses:undefined});
defineEmits<{ 'update:search':[value:string]; 'update:status':[value:string] }>();
</script>
