<template>
  <view class="page-shell">
    <view v-if="!opened" class="cover" :class="{ opening }">
      <image class="cover-background" src="/static/invitation/cover-background.png" mode="aspectFill" />
      <view class="envelope-trigger" hover-class="envelope-pressed" hover-stay-time="80" @tap="requestOpen">
        <image class="cover-envelope" src="/static/invitation/cover-envelope.png" mode="widthFix" />
      </view>
    </view>
    <view v-else class="invitation">
      <view class="paper-page">
        <view class="section intro">
          <text class="english-heading">Wedding Invitation</text>
          <text class="section-heading">婚礼邀请函</text>
          <view class="photo-placeholder"><text>照片区域</text><text>待替换婚礼照片</text></view>
          <text class="script-heading">Welcome to our wedding</text>
          <view class="intro-copy">
            <text>嗨～</text>
            <text>当你看到这篇文章时</text>
            <text>我们的婚礼筹备已经接近尾声了</text>
            <text class="copy-gap">这是一封也许询问平安</text>
            <text>但承载着我们满腔诚挚的婚礼邀请</text>
            <text>想把“我们”说与你听</text>
          </view>
          <view class="names"><text>陈飞宇</text><text class="name-heart">♡</text><text>胡可欣</text></view>
          <view class="ribbon-doodle">⌁⌁</view>
        </view>

        <view class="section details">
          <text class="script-heading align-left">Wedding Time</text>
          <view class="week"><text>Mon</text><text>Tue</text><text>Wed</text><text>Thu</text><text class="marked">Fri</text><text>Sat</text><text>Sun</text></view>
          <view class="days"><text>22</text><text>23</text><text>24</text><text>25</text><text class="marked">26</text><text>27</text><text>28</text></view>
          <view class="rule-row"><text>Date: 2026年08月23日 星期日 12时08分</text></view>
          <view class="rule-row"><text>Add: 平湖白金汉爵大酒店·宴会厅</text></view>

          <text class="script-heading align-left process-title">Wedding Process</text>
          <view class="timeline">
            <view class="timeline-row"><text class="timeline-label">迎宾签到</text><text class="timeline-icon">▣</text><text>10:28 见面是快乐的偏方</text></view>
            <view class="timeline-row"><text class="timeline-label">婚礼仪式</text><text class="timeline-icon">♜</text><text>11:30 关于恋爱的研究成果展示</text></view>
            <view class="timeline-row"><text class="timeline-label">婚礼午宴</text><text class="timeline-icon">♢</text><text>12:08 摆起袖子加油接席</text></view>
          </view>

          <text class="script-heading align-left tips-title">Tips</text>
          <view class="tips">
            <text>1. 如果你身在不同的城市或因繁忙的工作无法到达现场没有关系，我们已经收到祝福～</text>
            <text>2. 如果你有时间，请准备好你的好心情和好胃口，开开心心地来赴约吧～</text>
            <text>3. 婚礼有专业的摄影，欢迎大家积极与我们合影哦～</text>
          </view>
          <view class="table-placeholder"><text>餐桌插画区域</text></view>
          <text class="closing">愿你恰好这趟慢慢和快乐已满<br/>好久不见 我们婚礼见</text>
          <button class="album-button" @tap="openAlbum">打开相册</button>
        </view>
      </view>
    </view>
    <view v-if="showProfilePrompt" class="mask" @tap="closeProfilePrompt">
      <view class="sheet" @tap.stop><text class="heart">♥</text><text class="sheet-title">留下你的名字</text><text class="sheet-text">方便我们知道这份请柬已送达</text>
        <button class="avatar" open-type="chooseAvatar" @chooseavatar="onChooseAvatar"><image v-if="avatarUrl" :src="avatarUrl" mode="aspectFill" /><text v-else>选择头像</text></button>
        <input class="nickname" type="nickname" placeholder="请输入昵称" @input="onNicknameInput" />
        <text v-if="profileError" class="profile-error">请选择头像并填写昵称后继续</text><button class="confirm" @tap="confirmProfile">继续打开</button>
      </view>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'
import { onUnload } from '@dcloudio/uni-app'
import { invitationConfig } from '../../src/config/invitation'
import { useBackgroundAudio } from '../../src/composables/useBackgroundAudio'
import { useAutoScroll } from '../../src/composables/useAutoScroll'
import { trackVisit } from '../../src/services/visitor'

export default {
  setup() {
    const opened = ref(false); const opening = ref(false); const showProfilePrompt = ref(false); const profileError = ref(false); const avatarUrl = ref(''); const nickname = ref('')
    const { playing, toggle, destroy } = useBackgroundAudio(invitationConfig.audio); const scroll = useAutoScroll()
    const openAlbum = () => uni.navigateTo({ url: '/pages/album/album' })
    const finishOpen = () => { if (!avatarUrl.value || !nickname.value.trim()) { profileError.value = true; return }; profileError.value = false; showProfilePrompt.value = false; opening.value = true; trackVisit({ page: 'index', nickname: nickname.value.trim(), avatarUrl: avatarUrl.value }).catch(() => {}); setTimeout(() => { opened.value = true; opening.value = false }, 650) }
    const requestOpen = () => { if (opening.value) return; showProfilePrompt.value = true; profileError.value = false }; const closeProfilePrompt = () => { if (!opening.value) showProfilePrompt.value = false }
    const onChooseAvatar = (e) => { avatarUrl.value = e.detail.avatarUrl || '' }; const onNicknameInput = (e) => { nickname.value = e.detail.value || '' }
    onUnload(() => { scroll.stop(); destroy() })
    const enterInvitation = () => { scroll.start() }
    const originalFinishOpen = finishOpen
    const finishAndScroll = () => { originalFinishOpen(); setTimeout(() => { if (opened.value) enterInvitation() }, 700) }
    return { opened, opening, showProfilePrompt, profileError, avatarUrl, playing, requestOpen, closeProfilePrompt, onChooseAvatar, onNicknameInput, confirmProfile: finishAndScroll, toggleAudio: toggle, openAlbum }
  },
  onShareAppMessage() { return invitationConfig.share }, onShareTimeline() { return invitationConfig.share }
}
</script>

<style>
.page-shell { min-height: 100vh; color: #4f4033; background: #99966d; }
.cover { position: relative; min-height: 100vh; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #99966d; }
.cover-background { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
.envelope-trigger { position: relative; z-index: 1; width: 58vw; line-height: 0; filter: drop-shadow(0 24rpx 22rpx rgba(45, 39, 28, .22)); transition: opacity .55s ease, transform .65s ease; }
.cover-envelope { display: block; width: 100%; height: auto; }
.envelope-pressed { transform: scale(.985); }
.opening .envelope-trigger { opacity: 0; transform: translateY(16rpx) scale(.96); pointer-events: none; }
.placeholder { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #806b58; background: #f8f1df; }
.placeholder text + text { margin-top: 20rpx; font-size: 28rpx; }
.mask { position: fixed; z-index: 10; inset: 0; display: flex; align-items: flex-end; background: rgba(55,39,24,.42); }
.sheet { width: 100%; padding: 48rpx 56rpx 54rpx; box-sizing: border-box; border-radius: 32rpx 32rpx 0 0; text-align: center; background: #fffaf0; }
.heart { color: #bd7167; font-size: 46rpx; }
.sheet-title { display: block; margin-top: 12rpx; color: #5f4736; font-size: 38rpx; }
.sheet-text { display: block; margin: 16rpx 0 28rpx; color: #a17c5e; font-size: 25rpx; }
.avatar { width: 116rpx; height: 116rpx; padding: 0; border-radius: 50%; color: #a17c5e; font-size: 22rpx; line-height: 116rpx; background: #f2dfb7; overflow: hidden; }
.avatar image { width: 100%; height: 100%; }
.nickname { height: 82rpx; margin: 28rpx 0; border-bottom: 2rpx solid #e5ceb0; text-align: center; }
.profile-error { display: block; margin-bottom: 18rpx; color: #b65f58; font-size: 23rpx; }
.confirm { height: 82rpx; border-radius: 44rpx; color: #fff8ec; line-height: 82rpx; background: #bd655d; }
.invitation { min-height: 100vh; background: #ede9df; padding: 16rpx 18rpx 80rpx; box-sizing: border-box; }
.paper-page { min-height: 100vh; overflow: hidden; background: #f8f6ee; box-shadow: 0 0 22rpx rgba(76, 67, 53, .12); }
.section { position: relative; padding: 70rpx 44rpx 90rpx; box-sizing: border-box; background: repeating-linear-gradient(0deg, rgba(111, 96, 72, .025) 0 2rpx, transparent 2rpx 9rpx), #f8f6ee; }
.intro { min-height: 1420rpx; text-align: center; }.english-heading { display: block; color: #8f334a; font-family: Georgia, serif; font-size: 34rpx; letter-spacing: 2rpx; }.section-heading { display: block; margin-top: 22rpx; color: #25221f; font-family: Georgia, serif; font-size: 33rpx; letter-spacing: 10rpx; }.photo-placeholder { height: 760rpx; margin: 90rpx 0 54rpx; border: 2rpx dashed #c6b9a6; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #aa9a84; background: rgba(255, 255, 255, .28); }.photo-placeholder text:last-child { margin-top: 16rpx; font-size: 22rpx; }.script-heading { display: block; color: #9f3f53; font-family: cursive; font-size: 41rpx; }.intro-copy { margin-top: 56rpx; color: #292722; font-family: Georgia, serif; font-size: 29rpx; line-height: 2.2; }.intro-copy text { display: block; }.intro-copy .copy-gap { margin-top: 32rpx; }.names { display: flex; justify-content: center; align-items: center; gap: 28rpx; margin-top: 52rpx; color: #292722; font-size: 34rpx; letter-spacing: 4rpx; }.name-heart { color: #9f3f53; font-size: 54rpx; }.ribbon-doodle { margin-top: 60rpx; color: #9f3f53; font-size: 72rpx; transform: rotate(-8deg); }
.details { padding-top: 82rpx; }.align-left { text-align: left; }.week, .days { display: grid; grid-template-columns: repeat(7, 1fr); margin-top: 54rpx; color: #292722; text-align: center; font-family: Georgia, serif; font-size: 27rpx; }.days { margin-top: 20rpx; font-size: 28rpx; }.marked { position: relative; color: #9f3f53; }.days .marked::after { position: absolute; content: '♡'; top: -18rpx; left: 50%; transform: translateX(-50%); color: #9f3f53; font-size: 62rpx; }.rule-row { margin-top: 38rpx; padding: 0 0 16rpx; border-bottom: 1rpx solid #9f9485; color: #393630; font-family: Georgia, serif; font-size: 26rpx; }.process-title, .tips-title { margin-top: 90rpx; }.timeline { margin-top: 48rpx; color: #292722; font-family: Georgia, serif; font-size: 25rpx; }.timeline-row { display: grid; grid-template-columns: 150rpx 68rpx 1fr; align-items: center; min-height: 76rpx; }.timeline-icon { color: #9f3f53; font-size: 34rpx; text-align: center; }.tips { margin-top: 44rpx; color: #292722; font-family: Georgia, serif; font-size: 27rpx; line-height: 2.15; }.tips text { display: block; margin-bottom: 28rpx; }.table-placeholder { width: 420rpx; height: 210rpx; margin: 80rpx auto 54rpx; border: 2rpx dashed #c6b9a6; display: flex; align-items: center; justify-content: center; color: #aa9a84; font-size: 24rpx; }.closing { display: block; color: #292722; font-family: cursive; font-size: 27rpx; line-height: 2.2; text-align: center; }.album-button { width: 250rpx; height: 76rpx; margin: 64rpx auto 0; border: 1rpx solid #9f3f53; border-radius: 0; color: #9f3f53; font-size: 27rpx; line-height: 72rpx; background: transparent; }
</style>
