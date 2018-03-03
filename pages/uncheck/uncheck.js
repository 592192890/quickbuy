// pages/uncheck/uncheck.js
var util = require('../../utils/util.js');
var appInstance = getApp();
var orderId = '';
var polling;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    identifyCode: null,
    orderId: ''
  },
  goCart: function () {
    wx.switchTab({
      url: '/pages/cart/cart'
    })
  },
  goScan: function () {
    wx.switchTab({
      url: '/pages/scan/scan'
    })
  },
  goMy: function () {
    wx.switchTab({
      url: '/pages/my/my'
    })
  },
  goOrderDetail: function (e) {
    var orderId = e.target.dataset.id;
    wx.redirectTo({
      url: '/pages/order-detail/order-detail?orderId=' + orderId
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    orderId = options.orderId;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var identifyCode = wx.getStorageSync('member').cardNo;
    this.setData({
      identifyCode: identifyCode,
      orderId: orderId
    })
    //polling
    var pollingObj = {
      url: appInstance.globalData.apiUrl.isUnoperatedOrderUrl,
      data: {

      },
      success: function (result) {
        var uncheckOrderNumber = result.data.data.uncheckOrder.number;
        var unpaidOrderNumber = result.data.data.unpaidOrder.number;

        var orderId = result.data.data.uncheckOrder.orderIds[0];
        var identifyCode = wx.getStorageSync('member').cardNo;
        if (uncheckOrderNumber == 0) {

          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '核检成功',
            confirmColor: '#f95d5b',
            success: function () {
              wx.switchTab({
                url: '/pages/cart/cart'
              })
            }
          })
          clearInterval(polling);
        }

      }.bind(this)
    }
    polling = setInterval(function () {
      util.wxRequest(pollingObj)
    }.bind(this), 3000)
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('configData').shopName
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(polling);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(polling);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})