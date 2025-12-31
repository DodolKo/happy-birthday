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
 * Elegant black & white confetti effect
 * Minimalist and sophisticated
 */
export function launchConfetti({
  durationMs = 5000,
  particleCount = 250,
  spread = 80,
} = {}) {
  const canvas = createCanvas()
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  const onResize = () => resizeCanvas(canvas, ctx)
  onResize()
  window.addEventListener('resize', onResize, { passive: true })

  // Elegant grayscale palette
  const colors = [
    '#ffffff',
    '#f5f5f5',
    '#e5e5e5',
    '#d4d4d4',
    '#a3a3a3',
    '#737373',
    '#525252',
    '#404040',
    '#262626',
    '#171717',
    '#000000'
  ]
  
  const gravity = 600
  const airDrag = 0.012
  const start = performance.now()

  // Multiple origin points for more dramatic effect
  const origins = [
    { x: window.innerWidth * 0.2, y: window.innerHeight * 0.3 },
    { x: window.innerWidth * 0.5, y: window.innerHeight * 0.2 },
    { x: window.innerWidth * 0.8, y: window.innerHeight * 0.3 }
  ]

  const baseAngle = -Math.PI / 2
  const halfSpread = (spread * Math.PI) / 180

  const particles = Array.from({ length: particleCount }, (_, i) => {
    const origin = origins[i % origins.length]
    const angle = baseAngle + rand(-halfSpread, halfSpread)
    const speed = rand(400, 900)
    const size = rand(4, 12)
    const shape = Math.random()
    
    return {
      x: origin.x + rand(-50, 50),
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: size,
      w: size * rand(0.4, 1.2),
      h: size * rand(0.8, 2),
      rot: rand(0, Math.PI * 2),
      vr: rand(-12, 12),
      color: colors[Math.floor(rand(0, colors.length))],
      shape: shape > 0.6 ? 'rect' : shape > 0.3 ? 'line' : 'circle',
      opacity: 1,
      fadeStart: rand(0.6, 0.85) // When to start fading
    }
  })

  // Add some special "star" particles
  const stars = Array.from({ length: Math.floor(particleCount * 0.15) }, () => {
    const origin = origins[Math.floor(rand(0, origins.length))]
    const angle = baseAngle + rand(-halfSpread * 0.5, halfSpread * 0.5)
    const speed = rand(500, 800)
    
    return {
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: rand(6, 10),
      rot: rand(0, Math.PI),
      vr: rand(-8, 8),
      opacity: 1,
      type: 'star'
    }
  })

  let raf = 0
  let last = performance.now()

  const drawStar = (ctx, x, y, size, rotation) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    
    ctx.beginPath()
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size)
    }
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()
    
    ctx.restore()
  }

  const tick = (now) => {
    const dt = Math.min(0.033, (now - last) / 1000)
    const elapsed = now - start
    const progress = elapsed / durationMs
    last = now

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

    // Draw regular particles
    for (const p of particles) {
      p.vx *= 1 - airDrag
      p.vy += gravity * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.rot += p.vr * dt

      // Fade out
      if (progress > p.fadeStart) {
        p.opacity = Math.max(0, 1 - ((progress - p.fadeStart) / (1 - p.fadeStart)))
      }

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = p.opacity
      ctx.fillStyle = p.color
      ctx.strokeStyle = p.color

      if (p.shape === 'circle') {
        ctx.beginPath()
        ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2)
        ctx.fill()
      } else if (p.shape === 'line') {
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(-p.h / 2, 0)
        ctx.lineTo(p.h / 2, 0)
        ctx.stroke()
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      }
      ctx.restore()
    }

    // Draw stars
    for (const s of stars) {
      s.vx *= 1 - airDrag
      s.vy += gravity * dt * 0.8
      s.x += s.vx * dt
      s.y += s.vy * dt
      s.rot += s.vr * dt

      if (progress > 0.5) {
        s.opacity = Math.max(0, 1 - ((progress - 0.5) / 0.5))
      }

      ctx.globalAlpha = s.opacity
      drawStar(ctx, s.x, s.y, s.size, s.rot)
    }

    ctx.globalAlpha = 1

    if (now - start < durationMs) {
      raf = requestAnimationFrame(tick)
      return
    }

    cleanup()
  }

  const cleanup = () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', onResize)
    
    // Fade out canvas
    canvas.style.transition = 'opacity 0.5s ease-out'
    canvas.style.opacity = '0'
    setTimeout(() => canvas.remove(), 500)
  }

  raf = requestAnimationFrame(tick)
  return cleanup
}
