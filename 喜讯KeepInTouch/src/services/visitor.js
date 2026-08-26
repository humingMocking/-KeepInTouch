const STORAGE_KEY = 'keep-in-touch:visitor-events'

export async function trackVisit(payload = {}) {
  const event = { visitorId: payload.visitorId || '', nickname: payload.nickname || '', avatarUrl: payload.avatarUrl || '', scene: payload.scene || '', page: payload.page || '', referrer: payload.referrer || '', visitedAt: new Date().toISOString() }
  if (typeof uni !== 'undefined' && typeof uni.getStorageSync === 'function') {
    const events = uni.getStorageSync(STORAGE_KEY) || []
    uni.setStorageSync(STORAGE_KEY, [...events, event].slice(-100))
  }
  if (payload.useCloud !== false && typeof wx !== 'undefined' && wx.cloud && typeof wx.cloud.callFunction === 'function') {
    return wx.cloud.callFunction({ name: 'trackVisit', data: event })
  }
  return { local: true, event }
}
