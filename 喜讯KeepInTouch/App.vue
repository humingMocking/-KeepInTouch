<script>
	import {
		invitationConfig
	} from './src/config/invitation'

	const createOpeningAudio = () => {
		const openingVoiceUrl = invitationConfig.audio && invitationConfig.audio.opening
		if (
			!openingVoiceUrl ||
			typeof wx === 'undefined' ||
			typeof wx.createInnerAudioContext !== 'function'
		) {
			console.log('[opening-audio] global api unavailable', {
				hasUrl: Boolean(openingVoiceUrl),
				hasWx: typeof wx !== 'undefined',
				hasCreateInnerAudioContext: typeof wx !== 'undefined' &&
					typeof wx.createInnerAudioContext === 'function'
			})
			return null
		}

		try {
			const audio = wx.createInnerAudioContext()
			audio.autoplay = false
			audio.loop = true
			audio.src = openingVoiceUrl
			audio.onPlay(() => {
				console.log('[opening-audio] play success')
			})
			audio.onWaiting(() => {
				console.log('[opening-audio] waiting')
			})
			audio.onError((error) => {
				console.error('[opening-audio] play failed', {
					url: openingVoiceUrl,
					error
				})
				if (typeof uni !== 'undefined' && typeof uni.showToast === 'function') {
					uni.showToast({
						title: '音频播放失败，请重试',
						icon: 'none'
					})
				}
			})
			audio.onEnded(() => {
				console.log('[opening-audio] ended; loop enabled')
			})
			return audio
		} catch (error) {
			console.error('[opening-audio] global create failed', error)
			return null
		}
	}

	export default {
		onLaunch: function() {
			console.log('App Launch')
			const openingAudio = createOpeningAudio()
			this.globalAudio = openingAudio
			this.globalData = this.globalData || {}
			this.globalData.openingAudio = openingAudio
			if (typeof wx !== 'undefined' && wx.cloud && typeof wx.cloud.init === 'function') {
				wx.cloud.init({ env: 'cloud1-d9gdvstwydd9ec9b9', traceUser: true })
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	@import url('./src/styles/fonts.css');
	@import url('./src/styles/iconfont.css');
</style>
