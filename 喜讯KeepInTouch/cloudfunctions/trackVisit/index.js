const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event = {}) => {
  const { OPENID } = cloud.getWXContext()

  return db.collection('keep_in_touch').add({
    data: {
      openid: OPENID,
      nickname: event.nickname || '',
      avatarUrl: event.avatarUrl || '',
      visitedAt: db.serverDate(),
      page: event.page || '',
      scene: event.scene || '',
      referrer: event.referrer || ''
    }
  })
}
