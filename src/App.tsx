import { PointerEvent, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'

const slides = [
  { id: '01', mark: '2', model: 'Polestar 2', eyebrow: 'Fastback', copy: 'A controlled, progressive motion study.' },
  { id: '02', mark: '1', model: 'Polestar 1', eyebrow: 'Electric performance hybrid', copy: 'The central state carries visual authority.' },
  { id: '03', mark: 'P', model: 'Precept', eyebrow: 'Concept', copy: 'A reusable product presentation engine.' },
]

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export default function App() {
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [parallax, setParallax] = useState(true)
  const [inertia, setInertia] = useState(true)
  const startX = useRef(0)
  const startProgress = useRef(0)
  const lastX = useRef(0)
  const lastTime = useRef(0)
  const velocity = useRef(0)
  const proxy = useRef({ value: 0 })

  const activeIndex = clamp(Math.round(progress), 0, slides.length - 1)
  const active = slides[activeIndex]

  const goTo = (index: number) => {
    const target = clamp(index, 0, slides.length - 1)
    proxy.current.value = progress
    gsap.killTweensOf(proxy.current)
    gsap.to(proxy.current, {
      value: target,
      duration: 0.85,
      ease: 'power4.out',
      onUpdate: () => setProgress(proxy.current.value),
    })
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    gsap.killTweensOf(proxy.current)
    setDragging(true)
    startX.current = event.clientX
    lastX.current = event.clientX
    lastTime.current = performance.now()
    startProgress.current = progress
    velocity.current = 0
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    const width = Math.max(window.innerWidth * 0.55, 420)
    const delta = event.clientX - startX.current
    const next = clamp(startProgress.current - delta / width, 0, slides.length - 1)
    const now = performance.now()
    const dt = Math.max(now - lastTime.current, 1)
    velocity.current = (event.clientX - lastX.current) / dt
    lastX.current = event.clientX
    lastTime.current = now
    setProgress(next)
  }

  const onPointerUp = () => {
    if (!dragging) return
    setDragging(false)
    const throwAmount = inertia ? -velocity.current * 0.42 : 0
    const destination = clamp(Math.round(progress + throwAmount), 0, slides.length - 1)
    goTo(destination)
  }

  const cards = useMemo(() => slides.map((slide, index) => {
    const distance = index - progress
    const abs = Math.abs(distance)
    const x = distance * 58
    const scale = 1 - Math.min(abs * 0.08, 0.16)
    const opacity = 1 - Math.min(abs * 0.42, 0.72)
    const y = parallax ? abs * 14 : 0
    const rotate = parallax ? distance * -1.4 : 0

    return (
      <article
        className="vehicle"
        key={slide.id}
        style={{
          transform: `translate3d(${x}vw, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`,
          opacity,
          zIndex: 20 - Math.round(abs * 4),
        }}
        aria-hidden={abs > 0.65}
      >
        <div className="car-shell">
          <div className="car-roof" />
          <div className="car-body" />
          <div className="wheel wheel-a" />
          <div className="wheel wheel-b" />
        </div>
        <span className="vehicle-tag">{slide.model}</span>
      </article>
    )
  }), [progress, parallax])

  return (
    <main className="app-shell">
      <section
        className={`stage ${dragging ? 'is-dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="brand">MOTION / LAB</div>

        <div className="giant-mark" style={{ transform: `translate3d(${(progress - activeIndex) * -5}vw,0,0)` }}>
          {active.mark}
        </div>

        <div className="copy-block" key={active.id}>
          <span>{active.eyebrow}</span>
          <h1>{active.model}</h1>
          <p>{active.copy}</p>
          <button onPointerDown={(e) => e.stopPropagation()}>Discover</button>
        </div>

        <div className="vehicle-stage">{cards}</div>

        <div className="drag-cursor" aria-hidden="true">Drag</div>

        <nav className="pagination" aria-label="Carousel pages">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              className={index === activeIndex ? 'active' : ''}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => goTo(index)}
              aria-label={`Go to ${slide.model}`}
            />
          ))}
        </nav>
      </section>

      <aside className="lab-panel">
        <div>
          <span className="lab-kicker">Motion Lab 01</span>
          <strong>{progress.toFixed(3)}</strong>
        </div>
        <div className="lab-actions">
          <button onClick={() => goTo(activeIndex - 1)}>Previous</button>
          <button onClick={() => goTo(activeIndex + 1)}>Next</button>
          <button className={inertia ? 'enabled' : ''} onClick={() => setInertia(v => !v)}>Inertia</button>
          <button className={parallax ? 'enabled' : ''} onClick={() => setParallax(v => !v)}>Parallax</button>
          <button onClick={() => goTo(0)}>Reset</button>
        </div>
      </aside>
    </main>
  )
}
