<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
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
</style>
