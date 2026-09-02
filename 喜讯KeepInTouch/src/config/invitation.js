const mainWeddingPhoto = 'https://gitee.com/hu-minglt/image-storage/raw/master/album/38.jpg'
// Replace this root if the album image host changes.
const albumCloudFileRoot = 'https://gitee.com/hu-minglt/image-storage/raw/master/album/'

const buildAlbumCloudFileId = (fileName) => `${albumCloudFileRoot}${fileName}`

const albumPhotoOrder = [
  '10.jpg',
  '1.jpg',
  '7.jpg',
  '4.jpg',
  '5.jpg',
  '6.jpg',
  '8.jpg',
  '11.jpg',
  '3.jpg',
  '13.jpg',
  '9.jpg',
  '15.jpg',
  '16.jpg',
  '12.jpg',
  '14.jpg',
  '20.jpg',
  '22.jpg',
  '21.jpg',
  '23.jpg',
  '24.jpg',
  '30.jpg',
  '26.jpg',
  '25.jpg',
  '27.jpg',
  '28.jpg',
  '29.jpg',
  '31.jpg',
  '17.jpg',
  '19.jpg',
  '32.jpg',
  '33.jpg',
  '35.jpg',
  '34.jpg',
  '38.jpg',
  '37.jpg',
  '36.jpg'
]

const albumItems = albumPhotoOrder.map((fileName, index) => ({
  id: `album-photo-${index + 1}`,
  index: index + 1,
  src: buildAlbumCloudFileId(fileName),
  alt: `相册照片 ${index + 1}`
}))

export const invitationConfig = {
  share: { title: '囍|我们结婚啦', path: '/pages/index/index?share=wechat&v=20260828', imageUrl: '/static/invitation/share-card.jpg' },
  album: { title: '我们的相册', cover: mainWeddingPhoto, items: albumItems },
  venues: {
    ceremony: {
      name: '山行有约·独栋民宿',
      mapName: '山行有约·独栋民宿',
      address: '杭州市临安区板桥镇如龙村临安天井山生态农业园东南20米',
      latitude: 30.205091,
      longitude: 119.788346
    },
    dinner: {
      name: '城投景澜酒店',
      mapName: '临安城投景澜酒店',
      address: '杭州市临安区玲珑街道九州街600号',
      latitude: 30.202397,
      longitude: 119.694637
    }
  }
}
