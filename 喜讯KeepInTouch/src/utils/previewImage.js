const resolvedSrcCache = new Map()
const resolvingSrcCache = new Map()
const preloadedSrcCache = new Map()
const preloadingSrcCache = new Map()
const persistedSrcCache = new Map()
const IMAGE_CACHE_STORAGE_KEY = 'keepintouch:preview-image-cache:v1'
let persistedSrcCacheReady = false

function normalizeSrc(src) {
  return String(src || '').trim()
}

function isAlreadyResolvableSrc(src) {
  return /^(https?:|file:|wxfile:|data:|blob:)/i.test(src)
}

function isLocalRuntimeSrc(src) {
  return /^(file:|wxfile:|data:|blob:)/i.test(src)
}

function isRemoteHttpSrc(src) {
  return /^https?:\/\//i.test(src)
}

function isCloudFileSrc(src) {
  return /^cloud:\/\//i.test(src)
}

function clampConcurrency(concurrency) {
  const normalizedConcurrency = Number(concurrency)
  if (!Number.isFinite(normalizedConcurrency)) return 3
  return Math.max(1, Math.min(Math.floor(normalizedConcurrency), 6))
}

function normalizeUrlList(urls) {
  return Array.isArray(urls)
    ? urls.map(normalizeSrc).filter(Boolean)
    : []
}

function getStorageApi() {
  if (typeof wx !== 'undefined' && typeof wx.getStorageSync === 'function') return wx
  if (typeof uni !== 'undefined' && typeof uni.getStorageSync === 'function') return uni
  return null
}

function getFileSystemManager() {
  if (typeof wx === 'undefined' || typeof wx.getFileSystemManager !== 'function') return null
  return wx.getFileSystemManager()
}

function canAccessLocalFile(filePath) {
  const normalizedFilePath = normalizeSrc(filePath)
  if (!normalizedFilePath) return false

  const fileSystemManager = getFileSystemManager()
  if (!fileSystemManager || typeof fileSystemManager.accessSync !== 'function') {
    return isLocalRuntimeSrc(normalizedFilePath)
  }

  try {
    fileSystemManager.accessSync(normalizedFilePath)
    return true
  } catch (error) {
    return false
  }
}

function loadPersistedSrcCache() {
  if (persistedSrcCacheReady) return
  persistedSrcCacheReady = true

  const storageApi = getStorageApi()
  if (!storageApi) return

  try {
    const cachedEntries = storageApi.getStorageSync(IMAGE_CACHE_STORAGE_KEY)
    if (!cachedEntries || typeof cachedEntries !== 'object') return

    Object.keys(cachedEntries).forEach((src) => {
      const cachedSrc = normalizeSrc(cachedEntries[src])
      if (cachedSrc) persistedSrcCache.set(src, cachedSrc)
    })
  } catch (error) {}
}

function persistSrcCache() {
  const storageApi = getStorageApi()
  if (!storageApi || typeof storageApi.setStorage !== 'function') return

  const cachedEntries = {}
  persistedSrcCache.forEach((cachedSrc, src) => {
    if (cachedSrc) cachedEntries[src] = cachedSrc
  })

  storageApi.setStorage({
    key: IMAGE_CACHE_STORAGE_KEY,
    data: cachedEntries,
    fail: () => {}
  })
}

function getPersistedPreviewImageSrc(src) {
  const normalizedSrc = normalizeSrc(src)
  if (!normalizedSrc) return ''

  loadPersistedSrcCache()
  const cachedSrc = normalizeSrc(persistedSrcCache.get(normalizedSrc))
  if (!cachedSrc) return ''
  if (canAccessLocalFile(cachedSrc)) return cachedSrc

  persistedSrcCache.delete(normalizedSrc)
  persistSrcCache()
  return ''
}

function setPersistedPreviewImageSrc(src, cachedSrc) {
  const normalizedSrc = normalizeSrc(src)
  const normalizedCachedSrc = normalizeSrc(cachedSrc)
  if (!normalizedSrc || !normalizedCachedSrc) return

  loadPersistedSrcCache()
  persistedSrcCache.set(normalizedSrc, normalizedCachedSrc)
  persistSrcCache()
}

function downloadAndSaveImageSrc(src, cacheKey) {
  const normalizedSrc = normalizeSrc(src)
  if (
    !normalizedSrc ||
    !isRemoteHttpSrc(normalizedSrc) ||
    typeof uni === 'undefined' ||
    typeof uni.downloadFile !== 'function' ||
    typeof uni.saveFile !== 'function'
  ) {
    return Promise.resolve('')
  }

  return new Promise((resolve) => {
    uni.downloadFile({
      url: normalizedSrc,
      success: (downloadResult) => {
        const tempFilePath = normalizeSrc(downloadResult && downloadResult.tempFilePath)
        const statusCode = Number(downloadResult && downloadResult.statusCode)
        if (!tempFilePath || (statusCode && statusCode < 200) || statusCode >= 400) {
          resolve('')
          return
        }

        uni.saveFile({
          tempFilePath,
          success: (saveResult) => {
            const savedFilePath = normalizeSrc(saveResult && saveResult.savedFilePath) || tempFilePath
            setPersistedPreviewImageSrc(cacheKey || normalizedSrc, savedFilePath)
            resolve(savedFilePath)
          },
          fail: () => resolve(tempFilePath)
        })
      },
      fail: () => resolve('')
    })
  })
}

function getImageInfoSrc(src) {
  const normalizedSrc = normalizeSrc(src)
  if (
    !normalizedSrc ||
    isLocalRuntimeSrc(normalizedSrc) ||
    typeof uni === 'undefined' ||
    typeof uni.getImageInfo !== 'function'
  ) {
    return Promise.resolve(normalizedSrc)
  }

  return new Promise((resolve) => {
    uni.getImageInfo({
      src: normalizedSrc,
      success: (result) => {
        const readySrc = normalizeSrc(result && result.path) || normalizedSrc
        resolve(readySrc)
      },
      fail: () => resolve(normalizedSrc)
    })
  })
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

export function getCachedPreviewImageSrc(src) {
  const normalizedSrc = normalizeSrc(src)
  if (!normalizedSrc) return ''
  const preloadedSrc = preloadedSrcCache.get(normalizedSrc)
  if (preloadedSrc) return preloadedSrc

  const persistedSrc = getPersistedPreviewImageSrc(normalizedSrc)
  if (persistedSrc) {
    preloadedSrcCache.set(normalizedSrc, persistedSrc)
    return persistedSrc
  }

  return resolvedSrcCache.get(normalizedSrc) || ''
}

export function resolvePreviewImageSrc(src) {
  const normalizedSrc = normalizeSrc(src)
  if (!normalizedSrc) return Promise.resolve('')
  const cachedSrc = getCachedPreviewImageSrc(normalizedSrc)
  if (cachedSrc) return Promise.resolve(cachedSrc)
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

export function preloadPreviewImageSrc(src) {
  const normalizedSrc = normalizeSrc(src)
  if (!normalizedSrc) return Promise.resolve('')
  if (preloadedSrcCache.has(normalizedSrc)) return Promise.resolve(preloadedSrcCache.get(normalizedSrc))

  const persistedSrc = getPersistedPreviewImageSrc(normalizedSrc)
  if (persistedSrc) {
    preloadedSrcCache.set(normalizedSrc, persistedSrc)
    return Promise.resolve(persistedSrc)
  }

  const pending = preloadingSrcCache.get(normalizedSrc)
  if (pending) return pending

  const task = resolvePreviewImageSrc(normalizedSrc)
    .then((resolvedSrc) => {
      const loadableSrc = normalizeSrc(resolvedSrc) || normalizedSrc
      if (isLocalRuntimeSrc(loadableSrc)) {
        preloadedSrcCache.set(normalizedSrc, loadableSrc)
        return loadableSrc
      }

      return downloadAndSaveImageSrc(loadableSrc, normalizedSrc)
        .then((savedSrc) => savedSrc || getImageInfoSrc(loadableSrc))
        .then((readySrc) => {
          const cachedSrc = normalizeSrc(readySrc) || loadableSrc
          preloadedSrcCache.set(normalizedSrc, cachedSrc)
          return cachedSrc
        })
    })
    .finally(() => {
      preloadingSrcCache.delete(normalizedSrc)
    })

  preloadingSrcCache.set(normalizedSrc, task)
  return task
}

export function resolvePreviewImageUrlsLimited(urls = [], options = {}) {
  const normalizedUrls = normalizeUrlList(urls)
  if (!normalizedUrls.length) return Promise.resolve([])

  const concurrency = clampConcurrency(options.concurrency)
  const resolver = options.preload ? preloadPreviewImageSrc : resolvePreviewImageSrc
  const onResolved = typeof options.onResolved === 'function' ? options.onResolved : null

  return new Promise((resolve) => {
    const results = new Array(normalizedUrls.length)
    let cursor = 0
    let activeCount = 0
    let completedCount = 0

    const resolveNext = () => {
      if (completedCount >= normalizedUrls.length) {
        resolve(results)
        return
      }

      while (activeCount < concurrency && cursor < normalizedUrls.length) {
        const currentIndex = cursor
        const currentSrc = normalizedUrls[currentIndex]
        cursor += 1
        activeCount += 1

        resolver(currentSrc)
          .catch(() => currentSrc)
          .then((resolvedSrc) => {
            const readySrc = normalizeSrc(resolvedSrc) || currentSrc
            results[currentIndex] = readySrc
            if (onResolved) onResolved(readySrc, currentIndex, currentSrc)
          })
          .finally(() => {
            activeCount -= 1
            completedCount += 1
            resolveNext()
          })
      }
    }

    resolveNext()
  })
}

export function preloadPreviewImageUrls(urls = [], options = {}) {
  return resolvePreviewImageUrlsLimited(urls, {
    ...options,
    preload: true
  })
}

export function preloadPreviewImageUrlsInOrder(urls = [], options = {}) {
  return preloadPreviewImageUrls(urls, {
    ...options,
    concurrency: 1
  })
}

export function resolvePreviewImageUrls(urls = []) {
  return resolvePreviewImageUrlsLimited(urls, { concurrency: 4 })
}
