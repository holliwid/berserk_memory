import { useEffect, type RefObject } from 'react'

export function useMobileDockHeight(
  dockRef: RefObject<HTMLDivElement | null>,
  active: boolean,
) {
  useEffect(() => {
    const node = dockRef.current
    if (!active || !node) return

    const media = window.matchMedia('(max-width: 979px)')
    const root = document.documentElement

    const sync = () => {
      if (!media.matches) {
        root.style.removeProperty('--mobile-dock-h')
        return
      }

      root.style.setProperty(
        '--mobile-dock-h',
        `${Math.ceil(node.getBoundingClientRect().height)}px`,
      )
    }

    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(node)
    media.addEventListener('change', sync)
    window.addEventListener('orientationchange', sync)

    return () => {
      observer.disconnect()
      media.removeEventListener('change', sync)
      window.removeEventListener('orientationchange', sync)
      root.style.removeProperty('--mobile-dock-h')
    }
  }, [dockRef, active])
}
