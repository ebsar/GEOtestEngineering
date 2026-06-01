<template>
  <div>
    <div v-if="isLoading" class="page-loader" aria-hidden="true">
      <span class="page-loader-content">
        <span class="page-loader-spinner"></span>
        <span class="page-loader-text">Duke u ngarkuar...</span>
      </span>
    </div>
    <RouterView @page-loading="setLoading" />
  </div>
</template>

<script setup>
import { ref } from "vue";

const isLoading = ref(false);

const setLoading = (value) => {
  isLoading.value = value;
};
</script>
