<script setup lang="ts">
function handleClick() {
  alert('Hello from Button Demo!')
}
</script>

<template>
  <div class="demo-button-container">
    <button class="demo-btn" @click="handleClick">Click Me</button>
  </div>
</template>

<style scoped>
.demo-button-container {
  padding: 1rem;
  display: flex;
  justify-content: center;
}

.demo-btn {
  padding: 0.5rem 1rem;
  background-color: var(--theme-color, #3eaf7c);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.demo-btn:hover {
  opacity: 0.8;
}
</style>
