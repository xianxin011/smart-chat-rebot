<template>
  <div class="coze-studio">
    <ChatInterface />
  </div>
</template>

<script setup>
import ChatInterface from './views/ChatInterface.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #f5f5f5;
  height: 100vh;
  overflow: hidden;
}

#app {
  height: 100vh;
  width: 100vw;
}

.coze-studio {
  width: 100%;
  height: 100%;
  background: #fff;
}
</style>