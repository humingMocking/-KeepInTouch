const resolvedSrcCache = new Map()
const resolvingSrcCache = new Map()

function normalizeSrc(src) {
  return String(src || '').trim()
}

function isAlreadyResolvableSrc(src) {
  return /^(https?:|file:|wxfile:|data:|blob:)/i.test(src)
}

function isCloudFileSrc(src) {
  return /^cloud:\/\//i.test(src)
}

function resolveCloudFileSrc(src) {
  const normalizedSrc = normalizeSrc(src)
  if (!normalizedSrc) return Promise.resolve('')
  if (resolvedSrcCache.has(normalizedSrc)) return Promise.resolve(resolvedSrcCache.get(normalizedSrc))
  if (typeof wx === 'undefined' || !wx.cloud || typeof wx.cloud.getTempFileURL !== 'function') {
    return Promise.resolve(normalizedSrc)
  }

  const pending = resolvingSrcCache.get(normalizedSrc)
  if (pending) return pending

  const task = new Promise((resolve) => {
    wx.cloud.getTempFileURL({
      fileList: [normalizedSrc],
      success: (result) => {
        const fileItem = result && Array.isArray(result.fileList) ? result.fileList[0] : null
        const resolvedSrc = normalizeSrc(fileItem && fileItem.tempFileURL) || normalizedSrc
        resolvedSrcCache.set(normalizedSrc, resolvedSrc)
        resolvingSrcCache.delete(normalizedSrc)
        resolve(resolvedSrc)
      },
      fail: () => {
        resolvedSrcCache.set(normalizedSrc, normalizedSrc)
        resolvingSrcCache.delete(normalizedSrc)
        resolve(normalizedSrc)
      }
    })
  })

  resolvingSrcCache.set(normalizedSrc, task)
  return task
}

export function resolvePreviewImageSrc(src) {
  const normalizedSrc = normalizeSrc(src)
  if (!normalizedSrc) return Promise.resolve('')
  if (isCloudFileSrc(normalizedSrc)) return resolveCloudFileSrc(normalizedSrc)
  if (isAlreadyResolvableSrc(normalizedSrc)) return Promise.resolve(normalizedSrc)
  if (resolvedSrcCache.has(normalizedSrc)) return Promise.resolve(resolvedSrcCache.get(normalizedSrc))
  if (typeof uni === 'undefined' || typeof uni.getImageInfo !== 'function') {
    return Promise.resolve(normalizedSrc)
  }

  const pending = resolvingSrcCache.get(normalizedSrc)
  if (pending) return pending

  const task = new Promise((resolve) => {
    uni.getImageInfo({
      src: normalizedSrc,
      success: (result) => {
        const resolvedSrc = normalizeSrc(result && result.path) || normalizedSrc
        resolvedSrcCache.set(normalizedSrc, resolvedSrc)
        resolvingSrcCache.delete(normalizedSrc)
        resolve(resolvedSrc)
      },
      fail: () => {
        resolvedSrcCache.set(normalizedSrc, normalizedSrc)
        resolvingSrcCache.delete(normalizedSrc)
        resolve(normalizedSrc)
      }
    })
  })

  resolvingSrcCache.set(normalizedSrc, task)
  return task
}

export function resolvePreviewImageUrls(urls = []) {
  const normalizedUrls = Array.isArray(urls)
    ? urls.map(normalizeSrc).filter(Boolean)
    : []

  if (!normalizedUrls.length) return Promise.resolve([])
  return Promise.all(normalizedUrls.map((src) => resolvePreviewImageSrc(src)))
}
