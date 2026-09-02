<template>
	<view class="album-page">
		<image class="album-background" src="/static/invitation/paper-invitation-background.jpg" mode="aspectFill" />
			<view class="album-content">
				<view class="album-heading">
					<text class="album-eyebrow">Love Gallery</text>

					
				</view>

			<view class="album-grid">
				<view class="album-column">
					<view v-for="photo in leftPhotos" :key="photo.id" class="photo-card"
						:class="'photo-card-' + ((photo.index % 3) + 1)" :style="getRevealStyle(photo)"
						hover-class="photo-card-pressed" hover-stay-time="80" @tap="previewPhoto(photo)">
						<view class="photo-skeleton" :class="{ hidden: isImageLoaded(photo.id) }"></view>
						<image v-if="photo.src" class="album-photo" :class="{ loaded: isImageLoaded(photo.id) }" :src="photo.src"
							mode="aspectFill" lazy-load @load="markImageLoaded(photo.id)" />
					</view>
				</view>
				<view class="album-column album-column-right">
					<view v-for="photo in rightPhotos" :key="photo.id" class="photo-card"
						:class="'photo-card-' + ((photo.index % 3) + 1)" :style="getRevealStyle(photo)"
						hover-class="photo-card-pressed" hover-stay-time="80" @tap="previewPhoto(photo)">
						<view class="photo-skeleton" :class="{ hidden: isImageLoaded(photo.id) }"></view>
						<image v-if="photo.src" class="album-photo" :class="{ loaded: isImageLoaded(photo.id) }" :src="photo.src"
							mode="aspectFill" lazy-load @load="markImageLoaded(photo.id)" />
					</view>
				</view>
			</view>

			<view class="album-loading">
				<view v-if="isAppending" class="loading-dots">
					<text></text>
					<text></text>
					<text></text>
				</view>
				<text v-else-if="hasMore" class="loading-copy">继续下滑</text>
				<text v-else class="loading-copy">已呈上全部照片</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		computed,
		getCurrentInstance,
		ref
	} from 'vue'
	import {
		onLoad,
		onReachBottom,
		onUnload
	} from '@dcloudio/uni-app'
	import {
		invitationConfig
	} from '../../src/config/invitation'
	import {
		getCachedPreviewImageSrc,
		preloadPreviewImageSrc,
		preloadPreviewImageUrlsInOrder
	} from '../../src/utils/previewImage'
	import {
		cacheVisitorProfile,
		getCachedVisitorProfile,
		recordInvitationShow
	} from '../../src/services/visitor'

	const INITIAL_BATCH_SIZE = 10
	const BATCH_SIZE = 8

	export default {
		setup() {
			const instance = getCurrentInstance()
			const loadedImageIds = ref({})
			const isAppending = ref(false)
			const albumVisitTracked = ref(false)
			const sourcePhotos = invitationConfig.album.items || []
			const previewUrls = sourcePhotos.map((photo) => photo.src)
			const resolvedPreviewUrls = ref(previewUrls.map((src) => getCachedPreviewImageSrc(src) || src))
			const resolvedPhotos = computed(() => sourcePhotos.map((photo, index) => ({
				...photo,
				src: resolvedPreviewUrls.value[index] || photo.src
			})))
			const visibleCount = ref(Math.min(INITIAL_BATCH_SIZE, sourcePhotos.length))
			let loadingTimer = null
			let albumPreloadStarted = false

			const formatPhotoNumber = (index) => index < 10 ? `0${index}` : String(index)
			const visiblePhotos = computed(() => resolvedPhotos.value.slice(0, visibleCount.value))
			const leftPhotos = computed(() => visiblePhotos.value.filter((_, index) => index % 2 === 0))
			const rightPhotos = computed(() => visiblePhotos.value.filter((_, index) => index % 2 === 1))
			const hasMore = computed(() => visibleCount.value < sourcePhotos.length)
			const visibleCountText = computed(() => formatPhotoNumber(visibleCount.value))
			const totalCountText = computed(() => formatPhotoNumber(sourcePhotos.length))

			const showToast = (title) => {
				if (typeof uni === 'undefined' || typeof uni.showToast !== 'function') return
				uni.showToast({
					title,
					icon: 'none'
				})
			}

			const compressAvatarFile = (filePath) => new Promise((resolve) => {
				if (typeof wx === 'undefined' || typeof wx.compressImage !== 'function') {
					resolve(filePath)
					return
				}

				wx.compressImage({
					src: filePath,
					quality: 72,
					success: ({
						tempFilePath
					}) => resolve(tempFilePath || filePath),
					fail: () => resolve(filePath)
				})
			})

			const readAvatarAsDataUrl = async (source) => {
				const filePath = String(source || '').trim()
				if (!filePath) throw new Error('Missing avatar file.')
				if (filePath.startsWith('data:image/')) return filePath

				const compressedPath = await compressAvatarFile(filePath)
				if (typeof wx === 'undefined' || typeof wx.getFileSystemManager !== 'function') {
					return compressedPath
				}

				return new Promise((resolve, reject) => {
					wx.getFileSystemManager().readFile({
						filePath: compressedPath,
						encoding: 'base64',
						success: ({
							data
						}) => resolve(`data:image/jpeg;base64,${data}`),
						fail: reject
					})
				})
			}

			const persistAuthorizedProfile = async (profile) => {
				try {
					const avatarDataUrl = await readAvatarAsDataUrl(profile.avatarUrl)
					return await cacheVisitorProfile({
						nickname: profile.nickname,
						avatarUrl: avatarDataUrl
					})
				} catch (error) {
					console.warn('[album] avatar persistence failed, falling back to raw path', error)
					try {
						return await cacheVisitorProfile(profile)
					} catch (fallbackError) {
						console.warn('[album] raw profile persistence failed', fallbackError)
						return profile
					}
				}
			}

			const trackAlbumVisit = (profile) => {
				if (albumVisitTracked.value) return
				albumVisitTracked.value = true
				void recordInvitationShow({
					page: 'album',
					scene: 'album-button',
					profile
				}).catch(() => {})
			}

			const trackCachedAlbumVisit = () => {
				if (albumVisitTracked.value) return
				const cachedProfile = getCachedVisitorProfile()
				if (!cachedProfile) return
				trackAlbumVisit(cachedProfile)
			}

			const handleAuthorizedProfile = async (profile) => {
				if (albumVisitTracked.value || !profile) return
				const cachedProfile = await persistAuthorizedProfile(profile)
				if (albumVisitTracked.value) return
				trackAlbumVisit(cachedProfile)
			}

			const updateResolvedPreviewUrl = (src, index) => {
				const resolvedSrc = String(src || '').trim()
				if (!resolvedSrc || resolvedPreviewUrls.value[index] === resolvedSrc) return

				const urls = resolvedPreviewUrls.value.slice()
				urls[index] = resolvedSrc
				resolvedPreviewUrls.value = urls
			}

			const syncCachedPreviewUrls = (start = 0, end = previewUrls.length) => {
				const fromIndex = Math.max(0, Math.min(Number(start) || 0, previewUrls.length))
				const toIndex = Math.max(fromIndex, Math.min(Number(end) || previewUrls.length, previewUrls.length))
				const urls = resolvedPreviewUrls.value.slice()
				let hasUpdate = false

				for (let index = fromIndex; index < toIndex; index += 1) {
					const cachedSrc = getCachedPreviewImageSrc(previewUrls[index])
					if (cachedSrc && urls[index] !== cachedSrc) {
						urls[index] = cachedSrc
						hasUpdate = true
					}
				}

				if (hasUpdate) resolvedPreviewUrls.value = urls
				return urls
					.map((src, index) => src || previewUrls[index])
					.filter(Boolean)
			}

			const primeAlbumPhotos = () => {
				if (albumPreloadStarted || !previewUrls.length) return
				albumPreloadStarted = true
				syncCachedPreviewUrls(0, previewUrls.length)
				void preloadPreviewImageUrlsInOrder(previewUrls, {
					onResolved: updateResolvedPreviewUrl
				}).catch(() => {})
			}

			const getPreviewUrlsSnapshot = () => {
				const urls = resolvedPreviewUrls.value.slice()
				let hasUpdate = false

				previewUrls.forEach((src, index) => {
					const cachedSrc = getCachedPreviewImageSrc(src)
					const resolvedSrc = cachedSrc || urls[index] || src
					if (urls[index] !== resolvedSrc) {
						urls[index] = resolvedSrc
						hasUpdate = true
					}
				})

				if (hasUpdate) resolvedPreviewUrls.value = urls
				return urls.filter(Boolean)
			}

			const loadMorePhotos = () => {
				if (!hasMore.value || isAppending.value) return
				const previousCount = visibleCount.value
				const nextCount = Math.min(previousCount + BATCH_SIZE, sourcePhotos.length)
				isAppending.value = true
				visibleCount.value = nextCount
				syncCachedPreviewUrls(previousCount, nextCount)

				if (loadingTimer) clearTimeout(loadingTimer)
				loadingTimer = setTimeout(() => {
					isAppending.value = false
					loadingTimer = null
				}, 120)
			}

			const previewPhoto = (photo) => {
				if (typeof uni === 'undefined' || typeof uni.previewImage !== 'function') {
					showToast('当前环境无法预览图片')
					return
				}

				const photoIndex = Number(photo && photo.index) > 0 ? Number(photo.index) - 1 : 0
				const sourceSrc = (sourcePhotos[photoIndex] && sourcePhotos[photoIndex].src) || photo.src
				const cachedCurrent = getCachedPreviewImageSrc(sourceSrc)
				if (cachedCurrent) updateResolvedPreviewUrl(cachedCurrent, photoIndex)

				const urls = getPreviewUrlsSnapshot()
				const current = cachedCurrent || urls[photoIndex] || sourceSrc || photo.src
				if (current && urls[photoIndex] !== current) urls[photoIndex] = current
				uni.previewImage({
					current,
					urls: urls.length ? urls : previewUrls,
					fail: () => showToast('图片预览失败，请重试')
				})

				void preloadPreviewImageSrc(sourceSrc)
					.then((src) => updateResolvedPreviewUrl(src, photoIndex))
					.catch(() => {})
			}

			const markImageLoaded = (id) => {
				loadedImageIds.value[id] = true
			}

			const isImageLoaded = (id) => Boolean(loadedImageIds.value[id])
			const getRevealStyle = (photo) => `animation-delay: ${Math.min((photo.index - 1) % BATCH_SIZE, 7) * 45}ms;`

			onLoad(() => {
				const eventChannel = instance && instance.proxy && typeof instance.proxy.getOpenerEventChannel === 'function'
					? instance.proxy.getOpenerEventChannel()
					: null

				if (eventChannel) {
					const handleProfileReady = (profile) => {
						void handleAuthorizedProfile(profile)
					}

					if (typeof eventChannel.once === 'function') {
						eventChannel.once('album-profile-ready', handleProfileReady)
					} else if (typeof eventChannel.on === 'function') {
						eventChannel.on('album-profile-ready', handleProfileReady)
					}
				}

				trackCachedAlbumVisit()
				primeAlbumPhotos()
			})
			onReachBottom(loadMorePhotos)
			onUnload(() => {
				if (!loadingTimer) return
				clearTimeout(loadingTimer)
				loadingTimer = null
			})

			return {
				config: invitationConfig,
				leftPhotos,
				rightPhotos,
				hasMore,
				isAppending,
				visibleCountText,
				totalCountText,
				previewPhoto,
				markImageLoaded,
				isImageLoaded,
				formatPhotoNumber,
				getRevealStyle
			}
		}
	}
</script>

<style>
	.album-page {
		position: relative;
		min-height: 100vh;
		color: #292722;
		background: #f3ead7;
	}

	.album-background {
		position: fixed;
		z-index: 0;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		pointer-events: none;
	}

	.album-content {
		position: relative;
		z-index: 1;
		min-height: 100vh;
		padding: 76rpx 32rpx calc(76rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}

	.album-heading {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.album-eyebrow {
		color: #8f334a;
		font-family: 'KeepInTouch Mrs Saint Delafield', cursive;
		font-size: 74rpx;
		line-height: 1;
	}

	.album-title {
		margin-top: 22rpx;
		color: #25221f;
		font-family: ZhiMangXing, 'PingFang SC', 'Microsoft YaHei', sans-serif;
		font-size: 54rpx;
		font-weight: 400;
		letter-spacing: 4rpx;
		line-height: 1.2;
	}

	.album-count {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		width: 156rpx;
		height: 48rpx;
		margin-top: 24rpx;
		border: 1rpx solid rgba(159, 63, 83, .34);
		border-radius: 999rpx;
		color: #8f334a;
		background: rgba(255, 253, 250, .58);
		font-family: 'KeepInTouch IBM Plex Serif', serif;
		font-size: 23rpx;
		font-weight: 700;
		line-height: 1;
	}

	.album-count-divider {
		opacity: .46;
	}

	.album-grid {
		display: flex;
		align-items: flex-start;
		gap: 24rpx;
		margin-top: 58rpx;
	}

	.album-column {
		flex: 1;
		min-width: 0;
	}

	.album-column-right {
		padding-top: 64rpx;
	}

	.photo-card {
		position: relative;
		height: 396rpx;
		margin-bottom: 28rpx;
		padding: 10rpx 10rpx 34rpx;
		box-sizing: border-box;
		overflow: hidden;
		background: #fffdfa;
		box-shadow: 0 14rpx 26rpx rgba(76, 67, 53, .13);
		animation: photoReveal .46s ease backwards;
		transition: transform .18s ease, box-shadow .18s ease;
	}

	.photo-card-1 {
		height: 430rpx;
	}

	.photo-card-2 {
		height: 368rpx;
	}

	.photo-card-3 {
		height: 408rpx;
	}

	.photo-card-pressed {
		transform: translateY(3rpx) scale(.985);
		box-shadow: 0 9rpx 18rpx rgba(76, 67, 53, .16);
	}

	.album-photo {
		position: relative;
		z-index: 2;
		display: block;
		width: 100%;
		height: 100%;
		opacity: 0;
		transition: opacity .38s ease;
	}

	.album-photo.loaded {
		opacity: 1;
	}

	.photo-skeleton {
		position: absolute;
		z-index: 1;
		top: 10rpx;
		right: 10rpx;
		bottom: 34rpx;
		left: 10rpx;
		overflow: hidden;
		background: linear-gradient(110deg, #efe2cf 8%, #fff8ec 18%, #efe2cf 33%);
		background-size: 240% 100%;
		opacity: 1;
		animation: photoShimmer 1.08s linear infinite;
		transition: opacity .28s ease;
		pointer-events: none;
	}

	.photo-skeleton.hidden {
		opacity: 0;
	}

	.photo-number {
		position: absolute;
		z-index: 3;
		right: 16rpx;
		bottom: 9rpx;
		color: rgba(143, 51, 74, .76);
		font-family: 'KeepInTouch IBM Plex Serif', serif;
		font-size: 19rpx;
		font-weight: 700;
		line-height: 1;
	}

	.album-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 88rpx;
		margin-top: 18rpx;
		color: rgba(41, 39, 34, .52);
		font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
		font-size: 24rpx;
		font-weight: 300;
		letter-spacing: 3rpx;
	}

	.loading-copy {
		line-height: 1;
	}

	.loading-dots {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;
	}

	.loading-dots text {
		display: block;
		width: 10rpx;
		height: 10rpx;
		border-radius: 50%;
		background: rgba(159, 63, 83, .58);
		animation: loadingPulse .78s ease-in-out infinite;
	}

	.loading-dots text:nth-child(2) {
		animation-delay: .12s;
	}

	.loading-dots text:nth-child(3) {
		animation-delay: .24s;
	}

	@keyframes photoReveal {
		from {
			opacity: 0;
			transform: translateY(26rpx) scale(.985);
		}

		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes photoShimmer {
		to {
			background-position-x: -240%;
		}
	}

	@keyframes loadingPulse {
		0%,
		100% {
			opacity: .35;
			transform: scale(.72);
		}

		50% {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
