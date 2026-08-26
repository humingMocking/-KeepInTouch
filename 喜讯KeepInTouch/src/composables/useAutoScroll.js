export function useAutoScroll(interval = 5000, offset = 360) {
  let timer = null
  const start = () => {
    if (timer || typeof uni === 'undefined' || typeof uni.pageScrollTo !== 'function') return
    timer = setInterval(() => uni.pageScrollTo({ scrollTop: offset, duration: 500 }), interval)
  }
  const stop = () => { if (timer) clearInterval(timer); timer = null }
  return { start, stop }
}
