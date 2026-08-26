<template>
	<view class="album-page">
		<text class="title">{{ config.album.title }}</text>
		<text class="empty">相册素材将在设计稿确认后接入</text>
	</view>
</template>

<script>
	import { invitationConfig } from '../../src/config/invitation'

	export default { setup() { return { config: invitationConfig } } }
</script>

<style>
	.album-page { min-height: 100vh; padding: 48rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #666; }
	.title { font-size: 42rpx; }
	.empty { margin-top: 24rpx; font-size: 28rpx; }
</style>
