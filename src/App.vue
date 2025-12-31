<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { launchConfetti } from './lib/confetti'
import ClickSpark from './components/ui/ClickSpark/ClickSpark.vue'

const step = ref('start') // 'start' | 'countdown' | 'done'
const counter = ref(10)
const showReveal = ref(false)

let intervalId = null
let stopConfetti = null

const isStart = computed(() => step.value === 'start')
const isCountdown = computed(() => step.value === 'countdown')
const isDone = computed(() => step.value === 'done')

// Generate floating particles
const particles = ref([])
const generateParticles = () => {
  particles.value = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * -20
  }))
}

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

      setTimeout(() => {
        step.value = 'done'
        showReveal.value = true
        stopConfetti = launchConfetti({ durationMs: 8000, particleCount: 350, spread: 100 })
      }, 500)
    }
  }, 1000)
}

onMounted(() => {
  generateParticles()
})

onBeforeUnmount(() => cleanupTimers())
</script>

<template>
  <main class="page">
    <!-- Animated background particles -->
    <div class="particles-container">
      <div 
        v-for="particle in particles" 
        :key="particle.id"
        class="particle"
        :style="{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          animationDuration: `${particle.duration}s`,
          animationDelay: `${particle.delay}s`
        }"
      />
    </div>

    <!-- Start screen -->
    <Transition name="fade-scale" mode="out-in">
      <section v-if="isStart" class="section section--start">
        <div class="start-content">
          <div class="decorative-line decorative-line--top" />
          
          <p class="pre-title">Une surprise t'attend</p>
          
          <ClickSpark spark-color="#ffffff" :spark-count="16" :spark-radius="35" :extra-scale="1.5">
            <button 
              class="cta" 
              type="button" 
              @click="startFlow"
            >
              <span class="cta-text">Découvrir</span>
              <span class="cta-arrow">→</span>
              <span class="cta-bg" />
            </button>
          </ClickSpark>
          
          <p class="hint">
            <span class="hint-icon">✦</span>
            Clique pour commencer
            <span class="hint-icon">✦</span>
          </p>
          
          <div class="decorative-line decorative-line--bottom" />
        </div>
        
        <!-- Corner decorations -->
        <div class="corner corner--tl" />
        <div class="corner corner--tr" />
        <div class="corner corner--bl" />
        <div class="corner corner--br" />
      </section>
    </Transition>

    <!-- Countdown screen -->
    <Transition name="fade-scale" mode="out-in">
      <section v-if="isCountdown" class="section section--countdown">
        <div class="countdown-content">
          <p class="countdown-label">Dans</p>
          
          <div class="count-container">
            <Transition name="count-flip" mode="out-in">
              <div :key="counter" class="count" :class="{ 'count--urgent': counter <= 3 }">
                {{ counter }}
              </div>
            </Transition>
            
            <!-- Animated rings -->
            <div class="ring ring--1" :class="{ 'ring--pulse': counter <= 3 }" />
            <div class="ring ring--2" :class="{ 'ring--pulse': counter <= 3 }" />
            <div class="ring ring--3" :class="{ 'ring--pulse': counter <= 3 }" />
          </div>
          
          <p class="countdown-hint">Prépare-toi...</p>
          
          <!-- Progress bar -->
          <div class="progress-container">
            <div 
              class="progress-bar" 
              :style="{ width: `${(10 - counter) * 10}%` }"
            />
          </div>
        </div>
      </section>
    </Transition>

    <!-- Final reveal -->
    <Transition name="reveal" mode="out-in">
      <section v-if="isDone" class="section section--reveal">
        <div class="reveal-content" :class="{ 'reveal-content--visible': showReveal }">
          <!-- Animated lines -->
          <div class="reveal-lines">
            <div class="reveal-line reveal-line--1" />
            <div class="reveal-line reveal-line--2" />
          </div>
          
          <h1 class="title">
            <span class="title-word title-word--1">JOYEUX</span>
            <span class="title-word title-word--2">ANNIVERSAIRE</span>
          </h1>
          
          <div class="name-container">
            <span class="name-decoration">✦</span>
            <span class="name">PAPA</span>
            <span class="name-decoration">✦</span>
          </div>
          
          <p class="message">
            Avec tout mon amour
          </p>
          
          <!-- Animated decorative elements -->
          <div class="floating-elements">
            <span class="float-el float-el--1">✦</span>
            <span class="float-el float-el--2">◆</span>
            <span class="float-el float-el--3">✦</span>
            <span class="float-el float-el--4">◆</span>
          </div>
        </div>
      </section>
    </Transition>
  </main>
</template>

<style scoped>
/* Page layout */
.page {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Particles */
.particles-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.particle {
  position: absolute;
  background: white;
  border-radius: 50%;
  opacity: 0.15;
  animation: float linear infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.15;
  }
  90% {
    opacity: 0.15;
  }
  50% {
    transform: translateY(-100vh) translateX(20px) scale(0.5);
  }
}

/* Section base */
.section {
  position: relative;
  width: 100%;
  max-width: 800px;
  padding: 60px 40px;
  z-index: 10;
}

/* Start section */
.section--start {
  text-align: center;
}

.start-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.decorative-line {
  width: 1px;
  height: 60px;
  background: linear-gradient(to bottom, transparent, white, transparent);
  opacity: 0.3;
}

.pre-title {
  font-family: 'Space Mono', monospace;
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: rgba(255, 255, 255, 0.5);
}

/* CTA Button */
.cta {
  position: relative;
  padding: 20px 48px;
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: white;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.cta-bg {
  position: absolute;
  inset: 0;
  background: white;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.cta-text,
.cta-arrow {
  position: relative;
  z-index: 1;
  transition: color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.cta-arrow {
  transform: translateX(0);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.cta:hover {
  border-color: white;
}

.cta:hover .cta-bg {
  transform: translateY(0);
}

.cta:hover .cta-text,
.cta:hover .cta-arrow {
  color: black;
}

.cta:hover .cta-arrow {
  transform: translateX(8px);
}

.cta:active {
  transform: scale(0.98);
}

.hint {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Space Mono', monospace;
  font-size: clamp(0.7rem, 1.5vw, 0.75rem);
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.1em;
}

.hint-icon {
  animation: twinkle 2s ease-in-out infinite;
}

.hint-icon:last-child {
  animation-delay: 1s;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* Corner decorations */
.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border-color: rgba(255, 255, 255, 0.15);
  border-style: solid;
  border-width: 0;
}

.corner--tl { top: 0; left: 0; border-top-width: 1px; border-left-width: 1px; }
.corner--tr { top: 0; right: 0; border-top-width: 1px; border-right-width: 1px; }
.corner--bl { bottom: 0; left: 0; border-bottom-width: 1px; border-left-width: 1px; }
.corner--br { bottom: 0; right: 0; border-bottom-width: 1px; border-right-width: 1px; }

/* Countdown section */
.section--countdown {
  text-align: center;
}

.countdown-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.countdown-label {
  font-family: 'Space Mono', monospace;
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: rgba(255, 255, 255, 0.5);
}

.count-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
}

.count {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(100px, 25vw, 160px);
  font-weight: 400;
  color: white;
  line-height: 1;
  text-shadow: 0 0 60px rgba(255, 255, 255, 0.3);
}

.count--urgent {
  animation: urgentPulse 0.5s ease-in-out infinite;
}

@keyframes urgentPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Animated rings */
.ring {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: ringExpand 3s ease-out infinite;
}

.ring--1 {
  width: 100%;
  height: 100%;
  animation-delay: 0s;
}

.ring--2 {
  width: 130%;
  height: 130%;
  animation-delay: 1s;
}

.ring--3 {
  width: 160%;
  height: 160%;
  animation-delay: 2s;
}

.ring--pulse {
  animation: ringPulse 0.5s ease-in-out infinite;
  border-color: rgba(255, 255, 255, 0.3);
}

@keyframes ringExpand {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.6; }
}

.countdown-hint {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  color: rgba(255, 255, 255, 0.6);
}

/* Progress bar */
.progress-container {
  width: 200px;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: white;
  transition: width 1s linear;
}

/* Reveal section */
.section--reveal {
  text-align: center;
}

.reveal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal-content--visible {
  opacity: 1;
  transform: translateY(0);
}

/* Reveal lines */
.reveal-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.reveal-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
}

.reveal-line--1 {
  width: 1px;
  height: 0;
  left: 20%;
  top: 0;
  animation: lineGrow 1.5s ease-out 0.5s forwards;
}

.reveal-line--2 {
  width: 1px;
  height: 0;
  right: 20%;
  bottom: 0;
  animation: lineGrowUp 1.5s ease-out 0.7s forwards;
}

@keyframes lineGrow {
  to { height: 100%; }
}

@keyframes lineGrowUp {
  to { height: 100%; transform: translateY(0); }
}

/* Title */
.title {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
}

.title-word {
  font-family: 'Bebas Neue', sans-serif;
  font-weight: 400;
  letter-spacing: 0.1em;
  color: white;
  opacity: 0;
  transform: translateY(40px);
  filter: blur(10px);
}

.reveal-content--visible .title-word--1 {
  font-size: clamp(48px, 12vw, 100px);
  animation: titleReveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
}

.reveal-content--visible .title-word--2 {
  font-size: clamp(36px, 9vw, 72px);
  animation: titleReveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards;
}

@keyframes titleReveal {
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

/* Name */
.name-container {
  display: flex;
  align-items: center;
  gap: 24px;
  opacity: 0;
  transform: scale(0.8);
}

.reveal-content--visible .name-container {
  animation: nameReveal 1s cubic-bezier(0.4, 0, 0.2, 1) 0.8s forwards;
}

@keyframes nameReveal {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.name {
  font-family: 'Playfair Display', serif;
  font-size: clamp(56px, 15vw, 140px);
  font-weight: 900;
  font-style: italic;
  color: white;
  text-shadow: 
    0 0 40px rgba(255, 255, 255, 0.4),
    0 0 80px rgba(255, 255, 255, 0.2);
}

.name-decoration {
  font-size: clamp(20px, 5vw, 32px);
  color: rgba(255, 255, 255, 0.5);
  animation: decorSpin 4s linear infinite;
}

@keyframes decorSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.message {
  font-family: 'Space Mono', monospace;
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: rgba(255, 255, 255, 0.5);
  opacity: 0;
}

.reveal-content--visible .message {
  animation: fadeIn 1s ease-out 1.2s forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

/* Floating elements */
.floating-elements {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.float-el {
  position: absolute;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.2);
  animation: floatEl 6s ease-in-out infinite;
}

.float-el--1 { top: 10%; left: 10%; animation-delay: 0s; }
.float-el--2 { top: 20%; right: 15%; animation-delay: 1.5s; }
.float-el--3 { bottom: 20%; left: 20%; animation-delay: 3s; }
.float-el--4 { bottom: 10%; right: 10%; animation-delay: 4.5s; }

@keyframes floatEl {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.2; }
  50% { transform: translateY(-20px) rotate(180deg); opacity: 0.5; }
}

/* Transitions */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(20px);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.05) translateY(-20px);
}

/* Count flip transition */
.count-flip-enter-active,
.count-flip-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.count-flip-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(1.2);
}

.count-flip-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.8);
}

/* Reveal transition */
.reveal-enter-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal-enter-from {
  opacity: 0;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .section {
    padding: 40px 24px;
  }
  
  .count-container {
    width: 150px;
    height: 150px;
  }
  
  .cta {
    padding: 16px 36px;
  }
  
  .decorative-line {
    height: 40px;
  }
  
  .corner {
    width: 20px;
    height: 20px;
  }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
