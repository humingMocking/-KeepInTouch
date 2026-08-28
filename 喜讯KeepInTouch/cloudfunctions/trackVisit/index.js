const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()
  const openId = OPENID || ''

  if (!openId) {
    throw new Error('Missing openId.')
  }

  const collection = db.collection('keep_in_touch')
  const visitedAt = db.serverDate()
  const visitor = {
    openId,
    nickname: event.nickname || '',
    avatarUrl: event.avatarUrl || '',
    page: event.page || '',
    scene: event.scene || '',
    referrer: event.referrer || '',
    time: visitedAt,
    lastVisitedAt: visitedAt
  }

  let updateResult = null
  try {
    updateResult = await collection.doc(openId).update({
      data: {
        ...visitor,
        count: _.inc(1)
      }
    })
  } catch (error) {
    const message = String((error && (error.errMsg || error.message)) || '')
    if (!message.includes('not exist') && !message.includes('not found') && !message.includes('不存在')) {
      throw error
    }
  }

  if (updateResult && updateResult.stats && updateResult.stats.updated > 0) {
    return { openId, action: 'updated', countDelta: 1, stats: updateResult.stats }
  }

  const createResult = await collection.doc(openId).set({
    data: {
      ...visitor,
      firstVisitedAt: visitedAt,
      count: 1
    }
  })

  return { openId, action: 'created', countDelta: 1, stats: createResult.stats || createResult }
}
