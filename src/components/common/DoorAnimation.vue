<script setup lang="ts">
import { onMounted, ref } from 'vue'

const emit = defineEmits<{
  (e: 'animation-end'): void
}>()

const isOpen = ref(false)

// Dynamic sticker loading
const stickersGlob = import.meta.glob('@/assets/home-icons/*.svg', {
  eager: true,
  import: 'default'
})
const stickerImages = Object.values(stickersGlob) as string[]

interface Sticker {
  id: number
  src: string
  style: any
}

const stickers = ref<Sticker[]>([])

const generateStickers = () => {
  // Use all available images uniquely
  const availableImages = [...stickerImages].sort(() => Math.random() - 0.5)
  const count = availableImages.length

  const newStickers: Sticker[] = []
  const placedCircles: { x: number; y: number; r: number }[] = []

  let attempts = 0
  const maxAttempts = 1000

  while (newStickers.length < count && attempts < maxAttempts) {
    attempts++

    // Random position in polar coordinates
    const angleDeg = Math.random() * 360
    const distance = 100 + Math.random() * 300 // 100px to 400px from center
    const size = 30 + Math.random() * 30 // 30px to 60px base size

    // Convert to Cartesian for collision detection
    const angleRad = (angleDeg * Math.PI) / 180
    const x = distance * Math.cos(angleRad)
    const y = distance * Math.sin(angleRad)
    const radius = size / 2

    // Check collision
    let overlap = false
    const padding = 20 // Minimum margin between stickers

    for (const circle of placedCircles) {
      const dx = x - circle.x
      const dy = y - circle.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < radius + circle.r + padding) {
        overlap = true
        break
      }
    }

    if (!overlap) {
      const src = availableImages[newStickers.length] || ''
      const rotation = Math.random() * 360

      newStickers.push({
        id: newStickers.length,
        src: src,
        style: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${size}px`,
          height: `${size}px`,
          transform: `translate(-50%, -50%) rotate(${angleDeg}deg) translate(${distance}px) rotate(${rotation}deg)`
        }
      })
      placedCircles.push({ x, y, r: radius })
    }
  }

  stickers.value = newStickers
}

onMounted(() => {
  generateStickers()

  // Delay slightly to ensure render, then open
  setTimeout(() => {
    isOpen.value = true
    // Cleanup after animation
    setTimeout(() => {
      emit('animation-end')
    }, 3500) // 3s animation + 0.5s buffer
  }, 100)
})
</script>

<template>
  <div class="door-container" :class="{ 'pointer-events-none': isOpen }">
    <div class="spotlight-wrapper">
      <div class="spotlight-hole" :class="{ open: isOpen }">
        <!-- Stickers attached to the "door" (shadow area) -->
        <!-- They are children, so they scale with the hole -->
        <img
          v-for="sticker in stickers"
          :key="sticker.id"
          :src="sticker.src"
          class="sticker"
          :style="sticker.style"
          alt="sticker"
        />
      </div>
      <div class="avatar-center" :class="{ fade: isOpen }">
        <img src="/img/avatar.png" alt="Avatar" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.door-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.pointer-events-none {
  pointer-events: none;
}

.spotlight-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spotlight-hole {
  position: absolute;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  box-shadow: 0 0 0 200vmax var(--vp-c-bg);
  z-index: 1;
  /* TODO: Adjust transition duration in production */
  transition: transform 1s cubic-bezier(0.7, 0, 0.3, 1);
  will-change: transform;
  /* Allow stickers to be visible outside the box */
  overflow: visible;
  /* Ensure 3D transform for smoother scaling if needed, though 2D is fine */
}

.spotlight-hole.open {
  transform: scale(30);
  /* Increased scale to ensure everything flies off */
}

.sticker {
  pointer-events: none;
  /* Ensure images render nicely when scaled */
  image-rendering: high-quality;
}

.avatar-center {
  position: absolute;
  z-index: 2;
  width: 192px;
  height: 192px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.5s ease-out 0.5s;
}

.avatar-center img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.avatar-center.fade {
  opacity: 0;
}
</style>
