<template>
  <div ref="gameContainer" class="game-container"></div>
</template>

<script lang="ts" setup>
import { setupGame } from '../game/main'
import { onMounted, ref } from 'vue'

const gameContainer = ref<HTMLDivElement>()

onMounted(async () => {
  if (gameContainer.value) {
    await setupGame(gameContainer.value)
  }
})
</script>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
