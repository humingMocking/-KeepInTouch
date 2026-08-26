import { ref } from 'vue'

export function useBackgroundAudio(options = {}) {
  const playing = ref(false)
  let context = null
  const ensureContext = () => {
    if (!context && typeof uni !== 'undefined' && typeof uni.createInnerAudioContext === 'function') {
      context = uni.createInnerAudioContext()
      context.loop = options.loop !== false
      context.src = options.src || ''
      context.onPlay(() => { playing.value = true })
      context.onPause(() => { playing.value = false })
      context.onStop(() => { playing.value = false })
      context.onError(() => { playing.value = false })
    }
    return context
  }
  const toggle = () => {
    const audio = ensureContext()
    if (!audio || !audio.src) return false
    if (playing.value) audio.pause()
    else audio.play()
    return true
  }
  const destroy = () => { if (context) context.destroy(); context = null; playing.value = false }
  return { playing, toggle, destroy }
}
