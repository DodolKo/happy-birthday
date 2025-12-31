const rand = (min, max) => Math.random() * (max - min) + min

function createCanvas() {
  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.inset = '0'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '9999'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.appendChild(canvas)
  return canvas
}

function resizeCanvas(canvas, ctx) {
  const dpr = Math.max(1, window.devicePixelRatio || 1)
  const { innerWidth: w, innerHeight: h } = window
  canvas.width = Math.floor(w * dpr)
  canvas.height = Math.floor(h * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

/**
 * Lightweight, dependency-free confetti.
 * (Recommended npm alternative: `canvas-confetti`.)
 */
export function launchConfetti({
  durationMs = 3500,
  particleCount = 180,
  spread = 65,
} = {}) {
  const canvas = createCanvas()
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  const onResize = () => resizeCanvas(canvas, ctx)
  onResize()
  window.addEventListener('resize', onResize, { passive: true })

  const colors = ['#ffffff', '#e0e0e0', '#c0c0c0', '#a0a0a0', '#808080', '#606060']
  const gravity = 900
  const airDrag = 0.015
  const start = performance.now()

  const originX = window.innerWidth / 2
  const originY = window.innerHeight * 0.25

  const baseAngle = -Math.PI / 2
  const halfSpread = (spread * Math.PI) / 180

  const particles = Array.from({ length: particleCount }, () => {
    const angle = baseAngle + rand(-halfSpread, halfSpread)
    const speed = rand(520, 980)
    const size = rand(5, 10)
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: size,
      w: size * rand(0.6, 1.1),
      h: size * rand(0.9, 1.6),
      rot: rand(0, Math.PI),
      vr: rand(-10, 10),
      color: colors[Math.floor(rand(0, colors.length))],
      shape: Math.random() > 0.35 ? 'rect' : 'circle',
    }
  })

  let raf = 0
  let last = performance.now()

  const tick = (now) => {
    const dt = Math.min(0.033, (now - last) / 1000)
    last = now

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

    for (const p of particles) {
      p.vx *= 1 - airDrag
      p.vy += gravity * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.rot += p.vr * dt

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color

      if (p.shape === 'circle') {
        ctx.beginPath()
        ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      }
      ctx.restore()
    }

    if (now - start < durationMs) {
      raf = requestAnimationFrame(tick)
      return
    }

    cleanup()
  }

  const cleanup = () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', onResize)
    canvas.remove()
  }

  raf = requestAnimationFrame(tick)
  return cleanup
}


