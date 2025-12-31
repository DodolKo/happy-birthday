<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { launchConfetti } from './lib/confetti'
import ClickSpark from './components/ui/ClickSpark/ClickSpark.vue'
import LightRays from './components/LightRays.vue'
import CurvedLoop from './components/CurvedLoop.vue'

const step = ref('start') // 'start' | 'countdown' | 'done'
const counter = ref(10)
const showReveal = ref(false)

let intervalId = null
let stopConfetti = null

const isStart = computed(() => step.value === 'start')
const isCountdown = computed(() => step.value === 'countdown')
const isDone = computed(() => step.value === 'done')

function cleanupTimers() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  if (stopConfetti) {
    stopConfetti()
    stopConfetti = null
  }
}

function startFlow() {
  cleanupTimers()
  counter.value = 10
  step.value = 'countdown'

  intervalId = setInterval(() => {
    counter.value -= 1
    if (counter.value <= 0) {
      counter.value = 0
      clearInterval(intervalId)
      intervalId = null

      // Delay the reveal for dramatic effect
      setTimeout(() => {
        step.value = 'done'
        showReveal.value = true
        stopConfetti = launchConfetti({ durationMs: 5000, particleCount: 280, spread: 85 })
      }, 300)
    }
  }, 1000)
}

onBeforeUnmount(() => cleanupTimers())
</script>

<template>
  <main class="page">
    <!-- Light Rays effect -->
    <div class="light-rays-wrapper" v-if="isStart || isCountdown">
      <LightRays
        rays-origin="top-center"
        rays-color="#ffffff"
        :rays-speed="1.5"
        :light-spread="0.8"
        :ray-length="1.2"
        :follow-mouse="true"
        :mouse-influence="0.1"
        :noise-amount="0.1"
        :distortion="0.05"
      />
    </div>
    
    <!-- Start screen -->
    <section class="card start-card" v-if="isStart" :class="{ 'card-visible': isStart }">
      <ClickSpark spark-color="#ffffff" :spark-count="12" :spark-radius="20" :extra-scale="1.2">
        <button class="cta" type="button" @click="startFlow">
          <span class="cta-text">Clique sur moi</span>
          <span class="cta-shine"></span>
        </button>
      </ClickSpark>
      <p class="hint">Un site mystérieux…</p>
    </section>

    <!-- Countdown screen -->
    <section class="card countdown-card" v-else-if="isCountdown" :class="{ 'card-visible': isCountdown }">
      <div class="count-wrapper">
        <div class="count" :class="{ 'count-pulse': counter <= 3 }">{{ counter }}</div>
        <div class="count-ring" :class="{ 'ring-pulse': counter <= 3 }"></div>
      </div>
      <p class="hint">Prépare-toi…</p>
    </section>

    <!-- Final reveal -->
    <section class="card reveal-card" v-else-if="isDone" :class="{ 'reveal-visible': showReveal }">
      <div class="reveal-content">
        <h1 class="title">
          <span class="title-line" :class="{ 'reveal-line-1': showReveal }">JOYEUX</span>
          <span class="title-line" :class="{ 'reveal-line-2': showReveal }">ANNIVERSAIRE</span>
        </h1>
        <div class="subtitle" :class="{ 'reveal-subtitle': showReveal }">PAPA</div>
      </div>
      <div class="curved-loop-wrapper" v-if="showReveal">
        <CurvedLoop
          marquee-text="Be ✦ Creative ✦ With ✦ Vue ✦ Bits ✦"
          :speed="2"
          :curve-amount="400"
          direction="left"
          :interactive="true"
        />
      </div>
    </section>
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  display: grid;
  place-items: center;
  padding: clamp(16px, 4vw, 28px) clamp(12px, 3vw, 18px);
  position: relative;
  overflow-x: hidden;
}

.light-rays-wrapper {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.6;
}

/* Card base styles - Mobile First */
.card {
  width: 100%;
  max-width: min(760px, 92vw);
  padding: clamp(24px, 6vw, 42px) clamp(20px, 5vw, 32px);
  border-radius: clamp(16px, 4vw, 24px);
  background: color-mix(in srgb, rgba(255, 255, 255, 0.08) 100%, transparent);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 clamp(10px, 2.5vw, 20px) clamp(30px, 7.5vw, 60px) rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: scale(0.9) translateY(20px);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 2;
}

.card-visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Start card */
.start-card {
  text-align: center;
}

.cta {
  position: relative;
  padding: clamp(14px, 3.5vw, 18px) clamp(28px, 7vw, 36px);
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  font-weight: 600;
  font-variation-settings: 'wght' 600;
  font-family: 'Doto', sans-serif;
  border-radius: clamp(12px, 3vw, 16px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.15), 
    rgba(255, 255, 255, 0.05));
  color: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  width: 100%;
  max-width: 280px;
  display: inline-block;
}

.cta-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.cta:hover .cta-shine {
  transform: translateX(100%);
}

.cta:hover {
  transform: translateY(-3px) scale(1.05);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 
    0 clamp(8px, 2vw, 10px) clamp(20px, 5vw, 30px) rgba(0, 0, 0, 0.3),
    0 0 clamp(20px, 5vw, 30px) rgba(255, 255, 255, 0.2);
}

.cta:active {
  transform: translateY(-1px) scale(1.02);
}

.cta-text {
  position: relative;
  z-index: 1;
}

.hint {
  margin: clamp(16px, 4vw, 24px) 0 0;
  opacity: 0.6;
  font-size: clamp(0.85rem, 2vw, 0.95rem);
  font-weight: 300;
  font-variation-settings: 'wght' 300;
  font-family: 'Doto', sans-serif;
  letter-spacing: 0.1em;
  animation: hint-fade 3s ease-in-out infinite;
}

@keyframes hint-fade {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.9; }
}

/* Countdown card */
.countdown-card {
  text-align: center;
}

.count-wrapper {
  position: relative;
  display: inline-block;
  margin: clamp(20px, 5vw, 40px) 0;
}

.count {
  font-size: clamp(64px, 20vw, 180px);
  font-weight: 900;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.05em;
  color: rgba(255, 255, 255, 1);
  position: relative;
  z-index: 1;
  animation: count-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-shadow: 
    0 0 clamp(10px, 2.5vw, 20px) rgba(255, 255, 255, 0.5),
    0 0 clamp(20px, 5vw, 40px) rgba(255, 255, 255, 0.3);
}

.count-pulse {
  animation: count-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), count-pulse 0.6s ease-in-out infinite;
}

@keyframes count-appear {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes count-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.count-ring {
  position: absolute;
  inset: -30px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
}

.ring-pulse {
  animation: ring-pulse 0.6s ease-in-out infinite;
}

@keyframes ring-pulse {
  0%, 100% { 
    opacity: 0.3; 
    transform: scale(0.8);
  }
  50% { 
    opacity: 0.6; 
    transform: scale(1.1);
  }
}

/* Reveal card */
.reveal-card {
  text-align: center;
  padding: clamp(40px, 10vw, 60px) clamp(24px, 6vw, 40px);
  max-width: min(900px, 95vw);
  overflow: hidden;
}

.reveal-content {
  position: relative;
  z-index: 1;
}

.title {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 1.5vw, 8px);
}

.title-line {
  display: block;
  font-size: clamp(32px, 10vw, 88px);
  font-weight: 900;
  font-variation-settings: 'wght' 900;
  font-family: 'Doto', sans-serif;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 1);
  opacity: 0;
  transform: translateY(30px) scale(0.8);
  filter: blur(10px);
  text-shadow: 
    0 0 clamp(10px, 2.5vw, 20px) rgba(255, 255, 255, 0.5),
    0 0 clamp(20px, 5vw, 40px) rgba(255, 255, 255, 0.3);
}

.reveal-line-1 {
  animation: reveal-text 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
}

.reveal-line-2 {
  animation: reveal-text 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s forwards;
}

@keyframes reveal-text {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.8);
    filter: blur(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

.subtitle {
  margin-top: clamp(16px, 4vw, 20px);
  font-size: clamp(40px, 12vw, 120px);
  font-weight: 900;
  font-variation-settings: 'wght' 900;
  font-family: 'Doto', sans-serif;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 1);
  opacity: 0;
  transform: scale(0.5) rotate(-5deg);
  filter: blur(15px);
  text-shadow: 
    0 0 clamp(15px, 3.5vw, 30px) rgba(255, 255, 255, 0.6),
    0 0 clamp(30px, 7vw, 60px) rgba(255, 255, 255, 0.4);
}

.reveal-subtitle {
  animation: reveal-subtitle 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s forwards;
}

@keyframes reveal-subtitle {
  0% {
    opacity: 0;
    transform: scale(0.5) rotate(-5deg);
    filter: blur(15px);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
    filter: blur(0);
  }
}

.reveal-visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.curved-loop-wrapper {
  margin-top: 40px;
  width: 100%;
  max-width: 100%;
  height: auto;
  position: relative;
  z-index: 1;
  overflow: hidden;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .curved-loop-wrapper {
    margin-top: 32px;
  }
}

@media (max-width: 480px) {
  .curved-loop-wrapper {
    margin-top: 24px;
  }
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .card {
    padding: clamp(20px, 5vw, 24px) clamp(16px, 4vw, 20px);
  }
  
  .cta {
    padding: clamp(12px, 3vw, 14px) clamp(24px, 6vw, 28px);
    font-size: 0.95rem;
  }
  
  .count {
    font-size: clamp(56px, 18vw, 64px);
  }
  
  .title-line {
    font-size: clamp(28px, 9vw, 32px);
  }
  
  .subtitle {
    font-size: clamp(36px, 11vw, 40px);
  }
}

/* Tablet and up */
@media (min-width: 768px) {
  .page {
    padding: clamp(24px, 3vw, 28px) clamp(18px, 2.5vw, 18px);
  }
  
  .card {
    padding: clamp(36px, 5vw, 42px) clamp(28px, 4vw, 32px);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .cta:hover {
    transform: translateY(-4px) scale(1.08);
  }
}
</style>
