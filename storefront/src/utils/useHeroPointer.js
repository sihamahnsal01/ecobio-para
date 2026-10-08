import { useEffect, useRef } from 'react'

// Tracks the cursor (or finger) over an element and exposes it as CSS variables:
//   --cx / --cy : smoothed pointer position in px (for the spotlight)
//   --dx / --dy : smoothed pointer offset from the centre, -1 .. 1 (for parallax)
// Also toggles the class "is-pointer" while the pointer is inside.
// Movement is eased with requestAnimationFrame so it never feels jumpy.
export default function useHeroPointer() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const EASE = 0.08 // lower = floatier, higher = snappier
    const target = { x: 0.5, y: 0.5 }
    const current = { x: 0.5, y: 0.5 }
    let raf = 0

    const clamp = (v) => Math.min(1, Math.max(0, v))

    const tick = () => {
      current.x += (target.x - current.x) * EASE
      current.y += (target.y - current.y) * EASE

      el.style.setProperty('--cx', `${(current.x * el.clientWidth).toFixed(1)}px`)
      el.style.setProperty('--cy', `${(current.y * el.clientHeight).toFixed(1)}px`)
      el.style.setProperty('--dx', ((current.x - 0.5) * 2).toFixed(3))
      el.style.setProperty('--dy', ((current.y - 0.5) * 2).toFixed(3))

      const moving =
        Math.abs(target.x - current.x) > 0.0005 || Math.abs(target.y - current.y) > 0.0005
      raf = moving ? requestAnimationFrame(tick) : 0
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick) }

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      target.x = clamp((e.clientX - rect.left) / rect.width)
      target.y = clamp((e.clientY - rect.top) / rect.height)
      el.classList.add('is-pointer')
      kick()
    }
    const onLeave = () => {
      target.x = 0.5
      target.y = 0.5
      el.classList.remove('is-pointer')
      kick()
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return ref
}
