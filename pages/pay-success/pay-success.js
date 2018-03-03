// pages/pay-success/pay-success.js
Page({
  data:{
    orderId:null,
    identifyCode:null
  },
  goOrderDetail:function(e){
    var orderId=e.target.dataset.id;
    wx.navigateTo({
      url: '/pages/order-detail/order-detail?orderId='+orderId
    })
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var orderId=options.orderId;
    this.setData({
      orderId:orderId
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})