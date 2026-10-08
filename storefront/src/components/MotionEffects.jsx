import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Elements that fade/slide in the first time they scroll into view.
const REVEAL_SELECTOR = [
  '.category-header', '.bestsellers-header', '.category-card', '.product-card',
  '.promo-banner', '.why-eyebrow', '.why-title', '.why-card', '.newsletter',
  '.services-hero', '.service-card', '.how-title', '.step-card', '.services-cta',
  '.about-hero', '.about-story', '.stat-card', '.values-title', '.value-card',
  '.team-title', '.team-card', '.about-cta',
  '.contact-hero', '.find-us-card', '.hours-card', '.faq-item', '.faq-cta',
  '.detail-card', '.review-section', '.related-block', '.related-card',
  '.review-item', '.footer-col',
].join(',')

// Mounted once inside <BrowserRouter>. Does two things:
//  1) scrolls to the top on every page change
//  2) adds scroll-reveal animations to the elements above – automatically,
//     including ones that appear later (products loaded from the API, filters…)
export default function MotionEffects() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    if (!('IntersectionObserver' in window)) return undefined

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target
          io.unobserve(el)
          el.classList.add('is-visible')

          // Once the reveal is done, drop the helper classes so the element's
          // normal hover transitions work again.
          let timer = 0
          const cleanup = () => {
            clearTimeout(timer)
            el.removeEventListener('transitionend', onEnd)
            el.classList.remove('reveal', 'is-visible')
            el.style.removeProperty('--reveal-i')
          }
          const onEnd = (e) => {
            if (e.target === el && e.propertyName === 'opacity') cleanup()
          }
          el.addEventListener('transitionend', onEnd)
          timer = setTimeout(cleanup, 1800)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )

    // Tracked per effect run (not on the DOM) so React StrictMode's double
    // mount can't leave elements hidden but un-observed.
    const seen = new WeakSet()

    const scan = () => {
      document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        const siblings = Array.prototype.filter.call(
          el.parentElement ? el.parentElement.children : [],
          (c) => c.matches(REVEAL_SELECTOR),
        )
        el.style.setProperty('--reveal-i', String(siblings.indexOf(el) % 4)) // stagger per row
        el.classList.add('reveal')
        io.observe(el)
      })
    }

    // MutationObserver callbacks run before the browser paints,
    // so new elements are hidden before they are ever shown (no flash).
    const mo = new MutationObserver(scan)
    mo.observe(document.getElementById('root'), { childList: true, subtree: true })
    scan()

    return () => {
      mo.disconnect()
      io.disconnect()
    }
  }, [])

  return null
}
