// pages/identify-code/identify-code.js
Page({
  data:{
    identifyCode:null
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var identifyCode=wx.getStorageSync('member').cardNo;
    this.setData({
      identifyCode:identifyCode
    })
  }
})