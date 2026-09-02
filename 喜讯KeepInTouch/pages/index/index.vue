<template>
	<view class="page-shell">
		<view v-if="!opened" class="cover" :class="{ opening }" @tap="requestOpen">
			<image class="cover-background" src="/static/invitation/cover-background.jpg" mode="aspectFill" />
			<view class="envelope-trigger" hover-class="envelope-pressed" hover-stay-time="80">
				<image class="cover-envelope" src="/static/invitation/cover-envelope.png" mode="scaleToFill" />
				<view class="cover-letter-card">
					<image class="cover-letter-photo" src="/static/invitation/cover-letter.jpg" mode="aspectFill" />
				</view>
				<image class="cover-envelope-front" src="/static/invitation/cover-envelope-front.png"
					mode="scaleToFill" />
			</view>
		</view>
		<view v-else class="invitation">
			<image class="invitation-background" src="/static/invitation/paper-invitation-background.jpg"
				mode="aspectFill" />
			<view class="paper-page">
				<view class="section intro">
					<view class="intro-title">
						<text class="english-heading">Wedding Invitation</text>
						<text class="section-heading">婚礼邀请函</text>
					</view>
					<view class="photo-frame" hover-class="photo-frame-pressed" hover-stay-time="80"
						@tap.stop="previewInvitationPhoto">
						<image class="wedding-photo" src="/static/invitation/wedding-photo.jpg" mode="aspectFill" />

						<text class="photo-hi">Hi</text>
					</view>
					<view class="intro-message">
						<text class="script-heading">Welcome to our wedding</text>
						<view class="intro-copy">
							<text>嗨～</text>
							<text>当你看到这封请柬时</text>
							<text>我们的婚礼筹备已经接近尾声了</text>
							<text class="copy-gap">这是一封也许词句平实</text>
							<text>但承载着我们满腔诚挚欢迎的婚礼邀请</text>
							<text>想把“我们”说与你听</text>
						</view>
						<view class="names"><text>胡 铭</text>
							<image class="heart-icon name-heart" src="/static/icon/heart.svg" mode="aspectFit" />
							<text>翁露婷</text>
						</view>
						<image class="ribbon-doodle" src="/static/icon/hudiejie.png" mode="widthFix" />
					</view>
				</view>

				<view class="section details">
					<text class="script-heading align-left">Wedding Time</text>
					<view class="week"><text>Mon</text><text
							class="marked">Tue</text><text>Wed</text><text>Thu</text><text>Fri</text><text>Sat</text><text>Sun</text>
					</view>
					<view class="days">
						<view class="day-cell"><text>5</text></view>
						<view class="day-cell marked">
							<image class="heart-icon day-heart" src="/static/icon/heart.svg" mode="aspectFit" />
							<text>6</text>
						</view>
						<view class="day-cell"><text>7</text></view>
						<view class="day-cell"><text>8</text></view>
						<view class="day-cell"><text>9</text></view>
						<view class="day-cell"><text>10</text></view>
						<view class="day-cell"><text>11</text></view>
					</view>
					<view class="rule-row venue-row">
						<image class="rule-angel" src="/static/icon/angel.png" mode="aspectFit" /><text
							class="venue-label">仪式: </text>
						<view class="venue-link venue-link-with-icon" @tap.stop="openVenueLocation('ceremony')"><text
								class="iconfont icon-ditu_dingwei venue-link-icon"></text><text>山行有约庄园</text></view>
						<text class="venue-time">2026年10月6日 14:28</text>
					</view>
					<view class="rule-row venue-row">
						<image class="rule-table" src="/static/icon/table.png" mode="scaleToFill" /><text
							class="venue-label">晚宴: </text>
						<view class="venue-link venue-link-with-icon" @tap.stop="openVenueLocation('dinner')"><text
								class="iconfont icon-ditu_dingwei venue-link-icon"></text><text>城投景澜酒店</text></view>
						<text class="venue-time">2026年10月6日 17:38</text>
					</view>

					<text class="script-heading align-left process-title">Wedding Process</text>
					<view class="timeline">
						<view class="timeline-path">
							<view v-for="dash in 15" :key="dash" class="timeline-dash" :class="'timeline-dash-' + dash">
							</view>
						</view>
						<view class="timeline-stop timeline-stop-arrival">
							<view class="timeline-time"><text class="timeline-en">Guest Arrival</text><text
									class="timeline-hour">13:38~14:28</text></view>
							<view class="timeline-event"><text>签到合影</text>
								<image class="timeline-event-icon" src="/static/icon/camera-fill.png"
									mode="aspectFit" />
							</view>
						</view>
						<view class="timeline-stop timeline-stop-ceremony">
							<view class="timeline-time"><text class="timeline-en">Ceremony</text><text
									class="timeline-hour">14:28~16:38</text></view>
							<view class="timeline-event"><text>草坪仪式</text>
								<image class="timeline-event-icon" src="/static/icon/rings.png" mode="aspectFit" />
							</view>
						</view>
						<view class="timeline-stop timeline-stop-dinner">
							<view class="timeline-time"><text class="timeline-en">Dinner</text><text
									class="timeline-hour">17:38~21:38</text></view>
							<view class="timeline-event"><text>晚宴用餐</text>
								<image class="timeline-event-icon" src="/static/icon/cup.png" mode="aspectFit" />
							</view>
						</view>
					</view>

					<text class="script-heading align-left tips-title">Tips</text>
					<view class="tips">
						<text>1. 如果你身在不同的城市或因繁忙的工作无法到达现场没有关系，我们已经收到祝福～</text>
						<text>2. 如果你有时间，请准备好你的好心情和好胃口，开开心心地来赴约吧～</text>
						<text>3. 婚礼架设PhotoBooth，欢迎大家积极与我们合影哦～</text>
					</view>
					<image class="party-illustration" src="/static/icon/party.png" mode="widthFix" />
					<view class="closing">
						<text>愿您永远被爱和快乐包围</text>
						<text>好久不见 我们婚礼见</text>
					</view>
					<view class="album-button" hover-class="album-button-pressed" @tap="openAlbum">
						<image class="album-button-icon" src="/static/icon/kissing.png" />
						<text class="album-button-text">查看相册</text>
						<text class="album-button-arrow">›</text>
					</view>
				</view>
			</view>
		</view>
		<view v-if="showProfilePrompt" class="profile-mask" @tap="closeProfilePrompt">
			<view class="profile-sheet" @tap.stop>
				<text class="profile-kicker">Wedding Guest</text>
				<button class="avatar-button" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
					<image v-if="avatarUrl" class="avatar-image" :src="avatarUrl" mode="aspectFill" />
					<text v-else class="avatar-placeholder">授权头像</text>
				</button>
				<input class="nickname-input" type="nickname" :value="nickname" placeholder="请授权昵称" confirm-type="done"
					@input="onNicknameInput" />
				<text v-if="profileError" class="profile-error">{{ profileError }}</text>
				<button class="profile-confirm" :loading="profileRequesting" :disabled="profileRequesting"
					@tap="confirmProfile">开启相册</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		ref
	} from 'vue'
	import {
		onShow,
		onUnload
	} from '@dcloudio/uni-app'
	import {
		invitationConfig
	} from '../../src/config/invitation'
	import {
		preloadPreviewImageSrc,
		preloadPreviewImageUrlsInOrder
	} from '../../src/utils/previewImage'
	import {
		getCachedVisitorProfile
	} from '../../src/services/visitor'


	const getInvitationShareQuery = () => {
		const [, query = ''] = invitationConfig.share.path.split('?')
		return query
	}

	const getInvitationTimelineShareMessage = () => {
		const shareMessage = {
			title: invitationConfig.share.title,
			query: getInvitationShareQuery(),
			imageUrl: invitationConfig.share.imageUrl
		}

		console.log('[share:timeline]', shareMessage)
		return shareMessage
	}

	const ALBUM_CACHE_DELAY = 800

	export default {
		setup() {
			const opened = ref(false)
			const opening = ref(false)
			const showProfilePrompt = ref(false)
			const profileError = ref('')
			const profileRequesting = ref(false)
			const avatarUrl = ref('')
			const nickname = ref('')
			const invitationPhotoUrl = invitationConfig.album.cover || '/static/invitation/wedding-photo.jpg'
			const albumPhotoUrls = (invitationConfig.album.items || [])
				.map((photo) => photo.src)
				.filter(Boolean)
			let albumCacheTimer = null
			let albumCacheStarted = false

			const warmAlbumImageCache = () => {
				if (albumCacheStarted || !albumPhotoUrls.length) return
				albumCacheStarted = true
				void preloadPreviewImageUrlsInOrder(albumPhotoUrls).catch(() => {})
			}

			const scheduleAlbumImageCache = () => {
				if (albumCacheStarted || albumCacheTimer) return
				albumCacheTimer = setTimeout(() => {
					albumCacheTimer = null
					warmAlbumImageCache()
				}, ALBUM_CACHE_DELAY)
			}

			const openAlbumPage = (profile) => {
				if (albumCacheTimer) {
					clearTimeout(albumCacheTimer)
					albumCacheTimer = null
				}
				warmAlbumImageCache()
				showProfilePrompt.value = false
				const navigationOptions = {
					url: '/pages/album/album',
					success: (navigationResult) => {
						if (
							!profile ||
							!navigationResult ||
							!navigationResult.eventChannel ||
							typeof navigationResult.eventChannel.emit !== 'function'
						) {
							return
						}

						navigationResult.eventChannel.emit('album-profile-ready', profile)
					},
					fail: () => {
						showProfilePrompt.value = true
						profileError.value = '打开相册失败，请重试'
					},
					complete: () => {
						profileRequesting.value = false
					}
				}

				uni.navigateTo(navigationOptions)
			}
			const openAlbum = () => {
				if (profileRequesting.value) return
				if (albumCacheTimer) {
					clearTimeout(albumCacheTimer)
					albumCacheTimer = null
				}
				warmAlbumImageCache()

				const cachedProfile = getCachedVisitorProfile()
				if (cachedProfile) {
					openAlbumPage()
					return
				}

				profileError.value = ''
				avatarUrl.value = ''
				nickname.value = ''
				showProfilePrompt.value = true
			}
			const showToast = (title) => {
				if (typeof uni === 'undefined' || typeof uni.showToast !== 'function') return
				uni.showToast({
					title,
					icon: 'none'
				})
			}

			const previewInvitationPhoto = async () => {
				if (typeof uni === 'undefined' || typeof uni.previewImage !== 'function') {
					showToast('当前环境无法预览图片')
					return
				}

				const resolvedInvitationPhotoUrl = await preloadPreviewImageSrc(invitationPhotoUrl)
				uni.previewImage({
					current: resolvedInvitationPhotoUrl,
					urls: [resolvedInvitationPhotoUrl],
					fail: () => showToast('图片预览失败，请重试')
				})
			}

			const closeProfilePrompt = () => {
				if (profileRequesting.value) return
				showProfilePrompt.value = false
				profileError.value = ''
			}

			const onChooseAvatar = (event) => {
				avatarUrl.value = (event.detail && event.detail.avatarUrl) || ''
				profileError.value = ''
			}

			const onNicknameInput = (event) => {
				nickname.value = (event.detail && event.detail.value) || ''
				profileError.value = ''
			}

			const confirmProfile = () => {
				if (profileRequesting.value) return

				const trimmedNickname = nickname.value.trim()
				const trimmedAvatarUrl = avatarUrl.value.trim()
				if (!trimmedAvatarUrl || !trimmedNickname || trimmedNickname === '微信用户') {
					profileError.value = '请选择头像并填写你的昵称'
					return
				}

				profileRequesting.value = true
				openAlbumPage({
					nickname: trimmedNickname,
					avatarUrl: trimmedAvatarUrl
				})
			}

			const enableWechatShareMenu = () => {
				if (typeof wx === 'undefined' || typeof wx.showShareMenu !== 'function') return
				wx.showShareMenu({
					withShareTicket: true,
					menus: ['shareAppMessage', 'shareTimeline'],
					fail: () => {}
				})
			}

			const openMapLocation = (venue) => {
				if (typeof uni === 'undefined' || typeof uni.openLocation !== 'function') {
					showToast('当前环境无法打开地图')
					return
				}

				uni.openLocation({
					latitude: Number(venue.latitude),
					longitude: Number(venue.longitude),
					name: venue.mapName || venue.name,
					address: venue.address,
					scale: 16,
					fail: () => showToast('地图打开失败，请重试')
				})
			}

			const openVenueLocation = (key) => {
				const venue = invitationConfig.venues[key]
				if (!venue) {
					showToast('地点信息不存在')
					return
				}

				openMapLocation(venue)
			}

			const openInvitation = () => {
				opening.value = true
				setTimeout(() => {
					opened.value = true
					opening.value = false
				}, 650)
			}

			const requestOpen = () => {
				if (opening.value) return
				openInvitation()
			}

			onShow(() => {
				enableWechatShareMenu()
				scheduleAlbumImageCache()
			})
			onUnload(() => {
				if (albumCacheTimer) {
					clearTimeout(albumCacheTimer)
					albumCacheTimer = null
				}
			})
			return {
				config: invitationConfig,
				opened,
				opening,
				invitationPhotoUrl,
				requestOpen,
				previewInvitationPhoto,
				showProfilePrompt,
				profileError,
				profileRequesting,
				avatarUrl,
				nickname,
				closeProfilePrompt,
				onChooseAvatar,
				onNicknameInput,
				confirmProfile,
				openVenueLocation,
				openAlbum
			}
		},
		onShareAppMessage(res) {
			const shareMessage = {
				title: '囍|我们结婚啦',
				path: '/pages/index/index?share=wechat&v=20260828',
				imageUrl: '/static/invitation/share-card.jpg'
			}

			console.log('[share:app-message]', res && res.from, shareMessage)
			return shareMessage
		},
		onShareTimeline() {
			return getInvitationTimelineShareMessage()
		}
	}
</script>

<style>
	.page-shell {
		min-height: 100vh;
		color: #4f4033;
		background: #99966d;
	}

	.cover {
		position: relative;
		min-height: 100vh;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #99966d;
	}

	.cover-background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.envelope-trigger {
		position: relative;
		z-index: 1;
		width: 58vw;
		height: 68.7vw;
		line-height: 0;
		filter: drop-shadow(0 24rpx 22rpx rgba(45, 39, 28, .22));
		transition: opacity .55s ease, transform .65s ease;
	}

	.cover-letter-card {
		position: absolute;
		z-index: 2;
		top: 25%;
		left: 50%;
		width: 78%;
		height: 44%;
		padding: 10rpx 10rpx 32rpx;
		box-sizing: border-box;
		overflow: hidden;
		background: #fffaf2;
		border: 1rpx solid rgba(171, 154, 126, .5);
		box-shadow: 0 18rpx 28rpx rgba(54, 47, 36, .24);
		transform: translateX(-50%) rotate(-3deg);
		transform-origin: center bottom;
	}

	.cover-letter-photo {
		display: block;
		width: 100%;
		height: 100%;
	}

	.cover-envelope {
		position: absolute;
		z-index: 1;
		left: 0;
		bottom: 0;
		display: block;
		width: 100%;
		height: 100%;
	}

	.cover-envelope-front {
		position: absolute;
		z-index: 3;
		left: 0;
		bottom: 0;
		display: block;
		width: 100%;
		height: 54.61%;
	}

	.envelope-pressed {
		transform: scale(.985);
	}

	.opening .envelope-trigger {
		opacity: 0;
		transform: translateY(16rpx) scale(.96);
		pointer-events: none;
	}

	.placeholder {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #806b58;
		background: #f8f1df;
	}

	.placeholder text+text {
		margin-top: 20rpx;
		font-size: 28rpx;
	}

	.profile-mask {
		position: fixed;
		z-index: 20;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		display: flex;
		align-items: flex-end;
		background: rgba(39, 32, 25, .46);
	}

	.profile-sheet {
		width: 100%;
		padding: 48rpx 56rpx 58rpx;
		box-sizing: border-box;
		border-radius: 16rpx 16rpx 0 0;
		background: #fffaf2;
		box-shadow: 0 -18rpx 44rpx rgba(54, 47, 36, .22);
		text-align: center;
	}

	.profile-kicker {
		display: block;
		color: #9f3f53;
		font-family: 'KeepInTouch IBM Plex Serif', serif;
		font-size: 24rpx;
		font-weight: 700;
		letter-spacing: 1rpx;
	}

	.profile-title {
		display: block;
		margin-top: 12rpx;
		color: #292722;
		font-size: 38rpx;
		font-weight: 400;
		letter-spacing: 4rpx;
	}

	.avatar-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 132rpx;
		height: 132rpx;
		margin: 34rpx auto 24rpx;
		padding: 0;
		overflow: hidden;
		border-radius: 50%;
		border: 1rpx solid rgba(159, 63, 83, .28);
		color: #9f3f53;
		background: #f4ead7;
		line-height: 1;
	}

	.avatar-button::after,
	.profile-confirm::after {
		border: 0;
	}

	.avatar-image {
		display: block;
		width: 100%;
		height: 100%;
	}

	.avatar-placeholder {
		color: #9f3f53;
		font-size: 25rpx;
		font-weight: 300;
		letter-spacing: 2rpx;
	}

	.nickname-input {
		width: 100%;
		height: 84rpx;
		margin: 0 auto;
		border-bottom: 1rpx solid rgba(159, 63, 83, .32);
		color: #292722;
		font-size: 31rpx;
		font-weight: 300;
		line-height: 84rpx;
		text-align: center;
	}

	.profile-error {
		display: block;
		min-height: 34rpx;
		margin-top: 18rpx;
		color: #9f3f53;
		font-size: 24rpx;
		line-height: 34rpx;
	}

	.profile-confirm {
		width: 100%;
		height: 82rpx;
		margin-top: 26rpx;
		border-radius: 8rpx;
		color: #fffaf2;
		font-size: 29rpx;
		font-weight: 400;
		line-height: 82rpx;
		letter-spacing: 4rpx;
		background: #9f3f53;
	}

	.heart-icon {
		display: block;
		width: 1em;
		height: 1em;
	}

	.invitation {
		position: relative;
		min-height: 100vh;
		background: #f3ead7;
		padding: 0;
		box-sizing: border-box;
	}

	.invitation-background {
		position: fixed;
		z-index: 0;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		pointer-events: none;
	}

	.paper-page {
		position: relative;
		z-index: 1;
		min-height: 100vh;
		overflow: hidden;
		background: transparent;
		box-shadow: 0 0 22rpx rgba(76, 67, 53, .12);
	}

	.section {
		position: relative;
		padding: 70rpx 44rpx 90rpx;
		box-sizing: border-box;
		background: transparent;
	}

	.intro {
		min-height: 1420rpx;
		text-align: center;
	}

	.intro-title {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
		text-align: left;
	}

	.english-heading {
		display: block;
		color: #8f334a;
		font-family: 'KeepInTouch IBM Plex Serif', serif;
		font-size: 32rpx;
		font-weight: 700;
		letter-spacing: 1rpx;
	}

	.section-heading {
		display: block;
		margin-top: 22rpx;
		color: #25221f;
		font-weight: 300;
		font-size: 28rpx;
		letter-spacing: 10rpx;
	}

	.intro-title .english-heading,
	.intro-title .section-heading {
		width: 100%;
		text-align: left;
	}

	.photo-frame {
		position: relative;
		width: 80%;
		height: 608rpx;
		margin: 90rpx auto 80rpx;
		padding: 14rpx 14rpx 22rpx;
		box-sizing: border-box;
		background: #fffdfa;
		box-shadow: 0 10rpx 18rpx rgba(76, 67, 53, .12);
		transition: transform .18s ease, box-shadow .18s ease;
	}

	.photo-frame-pressed {
		transform: scale(.988);
		box-shadow: 0 6rpx 14rpx rgba(76, 67, 53, .16);
	}

	.wedding-photo {
		display: block;
		width: 100%;
		height: 100%;
	}

	.photo-preview-badge {
		position: absolute;
		z-index: 2;
		right: 28rpx;
		bottom: 36rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 54rpx;
		height: 54rpx;
		border: 1rpx solid rgba(255, 253, 250, .88);
		border-radius: 50%;
		background: rgba(159, 63, 83, .72);
		box-shadow: 0 8rpx 18rpx rgba(52, 42, 34, .18);
	}

	.photo-preview-lens {
		position: relative;
		width: 22rpx;
		height: 22rpx;
		border: 3rpx solid #fffdfa;
		border-radius: 50%;
		box-sizing: border-box;
	}

	.photo-preview-lens::after {
		content: '';
		position: absolute;
		right: -9rpx;
		bottom: -7rpx;
		width: 13rpx;
		height: 3rpx;
		border-radius: 999rpx;
		background: #fffdfa;
		transform: rotate(45deg);
		transform-origin: left center;
	}

	.photo-hi {
		position: absolute;
		z-index: 1;
		top: -90rpx;
		right: -32rpx;
		color: #9f3f53;
		font-weight: 400;
		font-family: 'KeepInTouch Hurricane Hi', cursive;
		font-size: 184rpx;
		line-height: 1;
	}

	.intro-message {
		text-align: right;
	}

	.script-heading {
		display: block;
		color: #9f3f53;
		font-family: 'KeepInTouch Mrs Saint Delafield', cursive;
		font-size: 78rpx;
	}

	.intro-copy {
		margin-top: 56rpx;
		color: #292722;
		font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
		font-size: 28rpx;
		line-height: 2;
		font-weight: 300;
	}

	.intro-copy text {
		display: block;
	}

	.intro-copy .copy-gap {
		margin-top: 32rpx;
	}

	.names {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 28rpx;
		margin-top: 52rpx;
		color: #292722;
		font-size: 28rpx;
		letter-spacing: 4rpx;
		font-weight: 300;
	}

	.name-heart {
		flex: 0 0 54rpx;
		width: 54rpx;
		height: 54rpx;
	}

	.ribbon-doodle {
		display: block;
		width: 150rpx;
		margin: 46rpx 0 0 auto;
		transform: rotate(-8deg);
	}

	.details {
		padding-top: 82rpx;
	}

	.align-left {
		text-align: left;
	}

	.week,
	.days {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		margin-top: 54rpx;
		color: #292722;
		text-align: center;
		font-family: 'KeepInTouch IBM Plex Serif', serif;
		font-size: 34rpx;
	}

	.days {
		margin-top: 20rpx;
		font-size: 36rpx;
	}

	.marked {
		position: relative;
		color: #9f3f53;
	}

	.day-cell {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
		line-height: 1.2;
	}

	.day-heart {
		position: absolute;
		top: -12rpx;
		left: 50%;
		width: 62rpx;
		height: 62rpx;
		transform: translateX(-50%);
		pointer-events: none;
	}

	.rule-row {
		margin-top: 38rpx;
		padding: 0 0 16rpx;
		color: #393630;
		font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
		font-size: 28rpx;
		font-weight: 300;
	}

	.venue-row {
		display: grid;
		grid-template-columns: 78rpx 76rpx 205rpx 1fr;
		align-items: center;
		column-gap: 8rpx;
	}

	.rule-angel {
		justify-self: center;
		width: 72rpx;
		height: 72rpx;
	}

	.rule-table {
		justify-self: center;
		width: 78rpx;
		height: 62rpx;
	}

	.venue-label {
		display: block;
		width: 76rpx;
	}

	.venue-link {
		width: 205rpx;
		margin-right: 20rpx;
		box-sizing: border-box;
		color: #9f3f53;
		font-weight: 500;
		line-height: 1.35;
		white-space: nowrap;
		border-bottom: 1rpx solid rgba(159, 63, 83, .55);
	}

	.venue-link-with-icon {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 3rpx;
	}

	.venue-link-icon {
		flex: 0 0 auto;
		font-size: 30rpx;
		color: #9f3f53;
	}

	.venue-time {
		font-size: 28rpx;
		font-weight: 300;
		line-height: 1.35;
		white-space: nowrap;
	}

	.process-title,
	.tips-title {
		margin-top: 90rpx;
	}

	.timeline {
		position: relative;
		height: 382rpx;
		margin-top: 52rpx;
		color: #292722;
		font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
	}

	.timeline-path {
		position: absolute;
		z-index: 1;
		top: 28rpx;
		left: 0;
		width: 100%;
		height: 326rpx;
		pointer-events: none;
	}

	.timeline-dash {
		position: absolute;
		width: 24rpx;
		height: 5rpx;
		border-radius: 999rpx;
		background: #292722;
		transform-origin: center;
	}

	.timeline-dash-1 {
		top: 6rpx;
		left: 240rpx;
		transform: rotate(15deg);
	}

	.timeline-dash-2 {
		top: 18rpx;
		left: 276rpx;
		transform: rotate(20deg);
	}

	.timeline-dash-3 {
		top: 36rpx;
		left: 312rpx;
		transform: rotate(25deg);
	}

	.timeline-dash-4 {
		top: 60rpx;
		left: 346rpx;
		transform: rotate(32deg);
	}

	.timeline-dash-5 {
		top: 88rpx;
		left: 372rpx;
		transform: rotate(48deg);
	}

	.timeline-dash-6 {
		top: 122rpx;
		left: 388rpx;
		transform: rotate(76deg);
	}

	.timeline-dash-7 {
		top: 154rpx;
		left: 376rpx;
		transform: rotate(126deg);
	}

	.timeline-dash-8 {
		top: 180rpx;
		left: 342rpx;
		transform: rotate(148deg);
	}

	.timeline-dash-9 {
		top: 200rpx;
		left: 306rpx;
		transform: rotate(150deg);
	}

	.timeline-dash-10 {
		top: 224rpx;
		left: 276rpx;
		transform: rotate(128deg);
	}

	.timeline-dash-11 {
		top: 256rpx;
		left: 266rpx;
		transform: rotate(72deg);
	}

	.timeline-dash-12 {
		top: 286rpx;
		left: 286rpx;
		transform: rotate(42deg);
	}

	.timeline-dash-13 {
		top: 307rpx;
		left: 318rpx;
		transform: rotate(28deg);
	}

	.timeline-dash-14 {
		top: 322rpx;
		left: 352rpx;
		transform: rotate(25deg);
	}

	.timeline-dash-15 {
		top: 338rpx;
		left: 384rpx;
		transform: rotate(24deg);
	}

	.timeline-stop {
		position: absolute;
		z-index: 2;
		left: 0;
		width: 100%;
		min-height: 94rpx;
	}

	.timeline-stop-arrival {
		top: 4rpx;
	}

	.timeline-stop-ceremony {
		top: 148rpx;
	}

	.timeline-stop-dinner {
		top: 292rpx;
	}

	.timeline-time {
		position: absolute;
		width: 222rpx;
		color: #1f1e1b;
		font-family: 'KeepInTouch IBM Plex Serif', serif;
		font-weight: 700;
		line-height: 1.08;
		white-space: nowrap;
	}

	.timeline-en,
	.timeline-hour {
		display: block;
	}

	.timeline-en {
		font-size: 30rpx;
	}

	.timeline-hour {
		margin-top: 6rpx;
		font-size: 34rpx;
	}

	.timeline-event {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 14rpx;
		color: #1f1e1b;
		font-size: 30rpx;
		font-weight: 400;
		letter-spacing: 1rpx;
		white-space: nowrap;
	}

	.timeline-event-icon {
		flex: 0 0 62rpx;
		width: 62rpx;
		height: 62rpx;
		opacity: .88;
	}

	.timeline-stop-arrival .timeline-time {
		top: 0;
		left: 0;
	}

	.timeline-stop-arrival .timeline-event {
		top: 2rpx;
		left: 354rpx;
	}

	.timeline-stop-ceremony .timeline-time {
		top: 0;
		left: 75rpx;
		text-align: center;
	}

	.timeline-stop-ceremony .timeline-event {
		top: 26rpx;
		left: 483rpx;
	}

	.timeline-stop-dinner .timeline-time {
		top: 0;
		left: 12rpx;
	}

	.timeline-stop-dinner .timeline-event {
		top: 28rpx;
		left: 438rpx;
	}

	.tips {
		margin-top: 44rpx;
		color: #292722;
		font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
		font-size: 28rpx;
		font-weight: 300;
		line-height: 2.15;
	}

	.tips text {
		display: block;
		margin-bottom: 28rpx;
	}

	.party-illustration {
		display: block;
		width: 560rpx;
		max-width: 100%;
		margin: 72rpx auto 50rpx;
		opacity: .94;
	}

	.closing {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
		margin: 4rpx auto 0;
		color: #292722;
		font-family: ZhiMangXing, 'PingFang SC', 'Microsoft YaHei', sans-serif;
		font-size: 44rpx;
		font-weight: 400;
		line-height: 1.25;
		text-align: center;
		letter-spacing: 2rpx;
	}

	.closing text {
		display: block;
		font-family: ZhiMangXing, 'PingFang SC', 'Microsoft YaHei', sans-serif;
	}

	.album-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 14rpx;
		width: 306rpx;
		height: 88rpx;
		margin: 72rpx auto 0;
		box-sizing: border-box;
	}

	

	.album-button-icon {
		flex: 0 0 62rpx;
		width: 62rpx;
		height: 62rpx;

	}

	.album-button-text {
		color: #8f334a;
		font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
		font-size: 28rpx;
		font-weight: 400;
		letter-spacing: 3rpx;
		line-height: 1;
		margin-left: -14rpx;
	}

	.album-button-arrow {
		color: #8f334a;
		font-family: 'KeepInTouch IBM Plex Serif', serif;
		font-size: 34rpx;
		font-weight: 700;
		line-height: 1;
		transform: translateY(-1rpx);
	}
</style>
