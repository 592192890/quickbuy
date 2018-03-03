// pages/index/index.js
var util = require('../../utils/util');
var appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.pageRoute(options)
      this.login()
  },

  //页面路由
  pageRoute: function (options) {
      appInstance.gotoPage = ''
      console.log("index option")
      console.log(options)
      var q = options['q'] //微信扫码结果
      if (typeof (q) != "undefined") {
          //扫码
          var decodeQ = decodeURIComponent(q)
          appInstance.gotoPage = 'scanCode'
          appInstance.gotoPageParam = 'url=' + q
          if (decodeQ.indexOf("wx.yunhou.com/super/park") > 0) {
              var shopId = util.GetQueryString(decodeQ, 'channel')
              if (shopId) {
                  appInstance.scanShopId = shopId
              }
          }
          console.log('appInstance.gotoPage：' + appInstance.gotoPage)
      }

      //小程序跳小程序
      if (appInstance.appGlobalData['referrerInfo']) {
          var extraData = appInstance.appGlobalData['referrerInfo']['extraData'];
          if (extraData) {
              var extraDataJSON
              if ((typeof extraData) == "string") {
                  extraDataJSON = JSON.parse(extraData)
              } else {
                  extraDataJSON = extraData
              }
              if (extraDataJSON['openPage']) {
                  appInstance.gotoPage = extraDataJSON.openPage;
                  var tempOption = extraDataJSON;
                  delete tempOption["openPage"];
                  var param = util.dictToParam(tempOption)
                  appInstance.gotoPageParam = param;

              }
          }
      }

      var openPage = options['openPage']
      if (openPage){
          appInstance.gotoPage = openPage;
          var tempOption = options;
          delete tempOption["openPage"];
          var param = util.dictToParam(tempOption)
          appInstance.gotoPageParam = param;
      }
  },

 
  login: function () {
    if (wx.showLoading) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    var appSource = wx.getStorageSync('extraData').appSource
    var member = wx.getStorageSync('extraData').member
    var tokenId = wx.getStorageSync('extraData').tokenId
    var shopId = wx.getStorageSync('extraData').shopId
    if (appSource == 'bbgPlus') {
      // console.log("appSource == bbgPlus")
      wx.setStorageSync('tokenId', tokenId)
      wx.setStorageSync('shopId', shopId)
      wx.removeStorageSync('extraData')
      console.log("shopId == "+shopId)
      this.wxLogin(true)
    } else {
      // console.log("appSource != bbgPlus")
      this.wxLogin(false)
    }
  },

  wxLogin: function (fromBBGPlus) {
    wx.login({
      success: function (res) {
        if (!res.code) {
          if (wx.hideLoading) {
            wx.hideLoading();
          }
          wx.showModal({
            title: '错误',
            content: '获取用户登录态失败！(' + err.errMsg + ')',
            showCancel: false,
            success: function () {
              setTimeout(function () {
                wx.redirectTo({
                  url: '/pages/unlogin/unlogin'
                })
              }.bind(this), 1000)

            }
          })
          return;
        }
        var code = res.code;
        wx.getUserInfo({
          withCredentials: true,
          success: function (res) {
            var storeUserInfo = {
              nickName: res.userInfo.nickName,
              avatarUrl: res.userInfo.avatarUrl,
              code: code
            }
            wx.setStorageSync('storeUserInfo', storeUserInfo);

            var deviceInfo = wx.getSystemInfoSync();

            var obj = {
              url: appInstance.globalData.apiUrl.wxLoginUrl,
              data: {
                code: code,
                encryptedData: res.encryptedData,
                iv: res.iv,
                deviceInfo: JSON.stringify(deviceInfo)
              },
              success: function (result) {
                var member = result.data.data.member;
                var tokenId = result.data.data.sessionId;
                var openId = result.data.data.openid;

                // storage tokenId to identify whether login
                wx.setStorageSync('tokenId', tokenId);
                wx.setStorageSync('openId', openId);
                // if user has login,store user information
                if (member) {
                  wx.setStorageSync('member', member);
                  setTimeout(function () {
                    if (fromBBGPlus) {                  
                      wx.redirectTo({
                        url: "/pages/shop/shop?type=fromBBGPlus"
                      })
                    } else {
                      wx.redirectTo({
                        url: '/pages/shop/shop'
                      })
                    }
                  }.bind(this), 1000)

                } else {
                  setTimeout(function () {
                    wx.redirectTo({
                      url: '/pages/login/login'
                    })
                  }.bind(this), 1000)

                }
              },
              fail: function (err) {
                setTimeout(function () {
                  wx.redirectTo({
                    url: '/pages/login/login'
                  })
                }.bind(this), 1000)
              }
            }
            util.wxRequest(obj);

          },
          fail: function (err) {
            if (wx.hideLoading) {
              wx.hideLoading();
            }

            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '扫码购必须微信授权才可登录！',
              success: function () {
                setTimeout(function () {
                  wx.redirectTo({
                    url: '/pages/unlogin/unlogin'
                  })
                }.bind(this), 1000)


              }

            })
          }
        })

      },
      fail: function (err) {
        if (wx.hideLoading) {
          wx.hideLoading();
        }
        wx.showModal({
          title: '错误',
          content: '网络异常，请稍后再试！(' + err.errMsg + ')',
          showCancel: false,
          success: function () {
            setTimeout(function () {
              wx.redirectTo({
                url: '/pages/unlogin/unlogin'
              })
            }.bind(this), 1000)

          }
        })
      }
    });
  }

})