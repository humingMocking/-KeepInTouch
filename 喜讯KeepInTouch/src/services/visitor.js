const EVENT_STORAGE_KEY = 'keep-in-touch:visitor-events'
const PROFILE_STORAGE_KEY = 'keep-in-touch:visitor-profile'
const DEFAULT_WECHAT_NICKNAMES = new Set(['微信用户'])

function getStorageValue(key, fallback = null) {
  if (typeof uni === 'undefined' || typeof uni.getStorageSync !== 'function') return fallback
  try {
    return uni.getStorageSync(key) || fallback
  } catch (error) {
    return fallback
  }
}

function setStorageValue(key, value) {
  if (typeof uni === 'undefined' || typeof uni.setStorageSync !== 'function') return
  try {
    uni.setStorageSync(key, value)
  } catch (error) {
    return undefined
  }
}

function removeStorageValue(key) {
  if (typeof uni === 'undefined' || typeof uni.removeStorageSync !== 'function') return
  try {
    uni.removeStorageSync(key)
  } catch (error) {
    return undefined
  }
}

function normalizeVisitorProfile(payload = {}) {
  const nickname = String(payload.nickname || '').trim()
  const avatarUrl = String(payload.avatarUrl || '').trim()
  if (!nickname || DEFAULT_WECHAT_NICKNAMES.has(nickname) || !avatarUrl) return null
  return { nickname, avatarUrl }
}

export function getCachedVisitorProfile() {
  const profile = getStorageValue(PROFILE_STORAGE_KEY)
  const normalizedProfile = normalizeVisitorProfile(profile || {})
  if (profile && !normalizedProfile) removeStorageValue(PROFILE_STORAGE_KEY)
  if (!normalizedProfile) return null
  return { ...profile, ...normalizedProfile }
}

export async function cacheVisitorProfile(payload = {}) {
  const normalizedProfile = normalizeVisitorProfile(payload)
  if (!normalizedProfile) throw new Error('Visitor profile is incomplete.')

  const profile = {
    ...normalizedProfile,
    cachedAt: new Date().toISOString()
  }
  setStorageValue(PROFILE_STORAGE_KEY, profile)
  return profile
}

export async function trackVisit(payload = {}) {
  const visitedAt = new Date().toISOString()
  const event = {
    nickname: payload.nickname || '',
    avatarUrl: String(payload.avatarUrl || '').trim(),
    scene: payload.scene || '',
    page: payload.page || '',
    referrer: payload.referrer || '',
    visitedAt
  }
  const storedEvents = getStorageValue(EVENT_STORAGE_KEY, [])
  const events = Array.isArray(storedEvents) ? storedEvents : []
  setStorageValue(EVENT_STORAGE_KEY, [...events, event].slice(-100))

  if (payload.useCloud !== false && typeof wx !== 'undefined' && wx.cloud && typeof wx.cloud.callFunction === 'function') {
    try {
      const request = wx.cloud.callFunction({ name: 'trackVisit', data: event })
      if (request && typeof request.catch === 'function') {
        request.catch((error) => {
          console.warn('[trackVisit] cloud function failed, falling back to local record', error)
        })
      }
      return { queued: true, event }
    } catch (error) {
      console.warn('[trackVisit] cloud function failed, falling back to local record', error)
    }
  }

  return { local: true, event }
}

export async function recordInvitationShow(payload = {}) {
  const profile = payload.profile || getCachedVisitorProfile()
  const normalizedProfile = normalizeVisitorProfile(profile || {})
  if (!normalizedProfile) return { skipped: true, reason: 'missing-profile' }

  return trackVisit({
    ...payload,
    page: payload.page || 'invitation',
    ...normalizedProfile
  })
}
