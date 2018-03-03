

//获得本周的停止日期 
function rpx2px(rpx) {
  var px = 0;
  var screenWidth = wx.getSystemInfoSync().windowWidth
  return (screenWidth / 750) * rpx;
}


module.exports = {
  rpx2px: rpx2px
}
