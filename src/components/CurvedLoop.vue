<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';

interface CurvedLoopProps {
  marqueeText?: string;
  speed?: number;
  className?: string;
  curveAmount?: number;
  direction?: 'left' | 'right';
  interactive?: boolean;
}

const props = withDefaults(defineProps<CurvedLoopProps>(), {
  marqueeText: '',
  speed: 2,
  className: '',
  curveAmount: 400,
  direction: 'left',
  interactive: true
});

const text = computed(() => {
  const hasTrailing = /\s|\u00A0$/.test(props.marqueeText);
  return (hasTrailing ? props.marqueeText.replace(/\s+$/, '') : props.marqueeText) + '\u00A0';
});

const measureRef = ref<SVGTextElement | null>(null);
const textPathRef = ref<SVGTextPathElement | null>(null);
const pathRef = ref<SVGPathElement | null>(null);
const spacing = ref(0);
const offset = ref(0);
const uid = Math.random().toString(36).substr(2, 9);
const pathId = `curve-${uid}`;

const pathD = computed(() => `M-100,40 Q500,${40 + props.curveAmount} 1540,40`);

const dragRef = ref(false);
const lastXRef = ref(0);
const dirRef = ref<'left' | 'right'>(props.direction);
const velRef = ref(0);

let animationFrame: number | null = null;

const textLength = computed(() => spacing.value);
const totalText = computed(() => {
  return textLength.value
    ? Array(Math.ceil(1800 / textLength.value) + 2)
        .fill(text.value)
        .join('')
    : text.value;
});
const ready = computed(() => spacing.value > 0);

const updateSpacing = () => {
  if (measureRef.value) {
    spacing.value = measureRef.value.getComputedTextLength();
  }
};

const animate = () => {
  if (!spacing.value || !ready.value) return;

  const step = () => {
    if (!dragRef.value && textPathRef.value) {
      const delta = dirRef.value === 'right' ? props.speed : -props.speed;
      const currentOffset = parseFloat(textPathRef.value.getAttribute('startOffset') || '0');
      let newOffset = currentOffset + delta;

      const wrapPoint = spacing.value;
      if (newOffset <= -wrapPoint) newOffset += wrapPoint;
      if (newOffset >= wrapPoint) newOffset -= wrapPoint;

      textPathRef.value.setAttribute('startOffset', newOffset + 'px');
      offset.value = newOffset;
    }
    animationFrame = requestAnimationFrame(step);
  };
  step();
};

const stopAnimation = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
};

const onPointerDown = (e: PointerEvent) => {
  if (!props.interactive) return;
  dragRef.value = true;
  lastXRef.value = e.clientX;
  velRef.value = 0;
  (e.target as HTMLElement).setPointerCapture(e.pointerId);
};

const onPointerMove = (e: PointerEvent) => {
  if (!props.interactive || !dragRef.value || !textPathRef.value) return;
  const dx = e.clientX - lastXRef.value;
  lastXRef.value = e.clientX;
  velRef.value = dx;

  const currentOffset = parseFloat(textPathRef.value.getAttribute('startOffset') || '0');
  let newOffset = currentOffset + dx;

  const wrapPoint = spacing.value;
  if (newOffset <= -wrapPoint) newOffset += wrapPoint;
  if (newOffset >= wrapPoint) newOffset -= wrapPoint;

  textPathRef.value.setAttribute('startOffset', newOffset + 'px');
  offset.value = newOffset;
};

const endDrag = () => {
  if (!props.interactive) return;
  dragRef.value = false;
  dirRef.value = velRef.value > 0 ? 'right' : 'left';
};

const cursorStyle = computed(() => {
  return props.interactive ? (dragRef.value ? 'grabbing' : 'grab') : 'auto';
});

onMounted(() => {
  nextTick(() => {
    updateSpacing();
    animate();
  });
});

onUnmounted(() => {
  stopAnimation();
});

watch([text, () => props.className], () => {
  nextTick(() => {
    updateSpacing();
  });
});

watch([spacing, () => props.speed], () => {
  stopAnimation();
  if (spacing.value) {
    animate();
  }
});
</script>

<template>
  <div
    class="curved-loop-container"
    :style="{
      visibility: ready ? 'visible' : 'hidden',
      cursor: cursorStyle
    }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="endDrag"
    @pointerleave="endDrag"
  >
    <svg
      class="curved-loop-svg"
      viewBox="0 0 1440 120"
      preserveAspectRatio="xMidYMid meet"
    >
      <text ref="measureRef" xml:space="preserve" style="visibility: hidden; opacity: 0; pointer-events: none">
        {{ text }}
      </text>

      <defs>
        <path ref="pathRef" :id="pathId" :d="pathD" fill="none" stroke="transparent" />
      </defs>

      <text v-if="ready" xml:space="preserve" :class="`curved-loop-text ${className}`">
        <textPath ref="textPathRef" :href="`#${pathId}`" :startOffset="offset + 'px'" xml:space="preserve">
          {{ totalText }}
        </textPath>
      </text>
    </svg>
  </div>
</template>

<style scoped>
.curved-loop-container {
  height: 100%;
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
}

.curved-loop-svg {
  user-select: none;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  display: block;
  font-size: 4rem;
  font-weight: bold;
  text-transform: uppercase;
  line-height: 1;
  box-sizing: border-box;
  flex-shrink: 0;
}

.curved-loop-text {
  fill: white;
}

/* Responsive minimal */
@media (max-width: 768px) {
  .curved-loop-container {
    height: 100px;
  }
  
  .curved-loop-svg {
    height: 100px;
    max-height: 100px;
    font-size: 3rem;
  }
}

@media (max-width: 480px) {
  .curved-loop-container {
    height: 80px;
  }
  
  .curved-loop-svg {
    height: 80px;
    max-height: 80px;
    font-size: 2rem;
  }
}
</style>

