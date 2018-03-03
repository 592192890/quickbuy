// pages/shop/shop.js
var util = require('../../utils/util');
var appInstance = getApp();
var canLocation = {
  'status': true
};//user can't click frequently
var canSelectShop = true;//是否可以手工选择店铺
Page({

  data: {
    toView: '',
    showIndex: null,//show select which index word
    cityArr: [],
    toTop: '',
    tips: '定位中...',
    isLBS: true
  },
  goIndex: function (e) {
    var index = e.target.dataset.index;
    var toTop = e.touches[0].pageY + "px";
    this.setData({
      toView: index,
      showIndex: index,
      toTop: toTop
    })
    setTimeout(function () {
      this.setData({
        showIndex: null
      })
    }.bind(this), 500)

  },
  selectShop: function (e) {
    if (!canSelectShop) {
      return;
    }
    var shopId = e.target.dataset.id;
    // var outerIndex=e.target.dataset.outerindex;
    // var innerIndex=e.target.dataset.innerindex;
    // var shopIndex=e.target.dataset.shopindex;

    // var cityList=this.data.cityArr[outerIndex].cityList;
    // cityList[innerIndex].shopNameArr[shopIndex].selected=true;
    // this.setData({
    //   cityArr:this.data.cityArr
    // });
    if (wx.showLoading) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    //get config
    var obj = {
      url: appInstance.globalData.apiUrl.getConfigUrl,
      data: {
        shopId: shopId
      },
      success: function (result) {
        var currentPage = getCurrentPages()[getCurrentPages().length - 1].route || getCurrentPages()[getCurrentPages().length - 1].__route__;
        if (currentPage != 'pages/shop/shop') {
          return;
        }
        wx.setStorageSync('configData', result.data.data);
        wx.switchTab({
          url: '/pages/cart/cart'
        })
      }
    };
    util.wxRequest(obj);
  },
  getDefaultShop: function () {
    if (!canSelectShop) {
      return;
    }    
    if (wx.showLoading) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    //get config
    var obj = {
      url: appInstance.globalData.apiUrl.getConfigUrl,
      data: {
        shopId: wx.getStorageSync('shopId')
      },
      success: function (result) {
        var currentPage = getCurrentPages()[getCurrentPages().length - 1].route || getCurrentPages()[getCurrentPages().length - 1].__route__;
        if (currentPage != 'pages/shop/shop') {
          return;
        }
        wx.setStorageSync('configData', result.data.data);
        wx.switchTab({
          url: '/pages/cart/cart'
        })
      }
    };
    util.wxRequest(obj);
  },
  expandShop: function (e) {
    var outerIndex = e.target.dataset.outerindex;
    var innerIndex = e.target.dataset.innerindex;

    var cityList = this.data.cityArr[outerIndex].cityList;
    if (cityList[innerIndex].active) {
      cityList[innerIndex].active = false
    } else {
      cityList[innerIndex].active = true;
    }
    this.setData({
      cityArr: this.data.cityArr
    })
  },
  reLocation: function (e) {
    if (!canLocation.status) {
      return;
    } else {
      canLocation.status = false;
    }
    this.setData({
      tips: '定位中...'
    })
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        canSelectShop = false;

        var latitude = res.latitude;
        var longitude = res.longitude;
        var accuracy = res.accuracy;

        var lbsObj = {
          locationStatus: canLocation,
          url: appInstance.globalData.apiUrl.getShopLBSUrl,
          data: {
            latitude: latitude,
            longitude: longitude,
            accuracy: accuracy
          },

          success: function (result) {

            var shopId = result.data.data.shopId;
            if (shopId == 0) {
              var tips = '定位失败，请手动选择门店。';
              this.setData({
                tips: tips
              })

              canSelectShop = true;
              canLocation.status = true;
            } else {
              //success
              //get config
              var obj = {
                url: appInstance.globalData.apiUrl.getConfigUrl,
                data: {
                  shopId: shopId
                },
                success: function (result) {
                  var currentPage = getCurrentPages()[getCurrentPages().length - 1].route || getCurrentPages()[getCurrentPages().length - 1].__route__;
                  if (currentPage != 'pages/shop/shop') {
                    if (wx.hideLoading) {
                      wx.hideLoading();
                    }
                    canSelectShop = true;
                    return;
                  }
                  if (wx.showLoading) {
                    wx.showLoading({
                      title: '加载中',
                      mask: true
                    })
                  }
                  wx.setStorageSync('configData', result.data.data);
                  wx.switchTab({
                    url: '/pages/cart/cart'
                  })
                  canSelectShop = true;
                  canLocation.status = true;
                }
              };
              util.wxRequest(obj);
            }
          }.bind(this)
        }
        util.wxRequest(lbsObj);
      }.bind(this),
      fail: function (err) {
        canSelectShop = true;
        canLocation.status = true;
        if (err.errMsg == "getLocation:fail auth deny") {
          this.setData({
            tips: '您已拒绝定位授权。'
          })
        } else {
          this.setData({
            tips: '未开启定位功能，请手动选择门店'
          })

        }
      }.bind(this)
    })
  },

  onLoad: function (options){
      if (options.type) {
          this.setData({
              isLBS: false
          })
      }
      if (wx.showLoading) {
          wx.showLoading({
              title: '加载中...',
              mask: true
          })
      }
      var obj = {
          url: appInstance.globalData.apiUrl.getShopListUrl,
          data: {

          },
          success: function (result) {
              var cityArr = result.data.data;

              //expand first city
              cityArr[0].cityList[0].active = true;

              var toView = cityArr.filter(function (value) {
                  return value.word;
              })
              this.setData({
                  cityArr: cityArr,
                  toView: toView[0]
              })
          }.bind(this)
      }
      util.wxRequest(obj);

      //切换门店不执行定位
      if (!options.type) {
          //lbs location
          wx.getLocation({
              type: 'wgs84',
              success: function (res) {
                  canSelectShop = false;
                  var currentPage = getCurrentPages()[getCurrentPages().length - 1].route || getCurrentPages()[getCurrentPages().length - 1].__route__;
                  if (currentPage != 'pages/shop/shop') {
                      canSelectShop = true;
                      return;
                  }
                  var latitude = res.latitude;
                  var longitude = res.longitude;
                  var accuracy = res.accuracy;


                  var lbsObj = {
                      url: appInstance.globalData.apiUrl.getShopLBSUrl,
                      data: {
                          latitude: latitude,
                          longitude: longitude,
                          accuracy: accuracy
                      },
                      success: function (result) {
                          var shopId = result.data.data.shopId;
                          if (shopId == 0) {
                              var tips = '定位失败，请手动选择门店。';
                              this.setData({
                                  tips: tips
                              })
                              canSelectShop = true;
                          } else {
                              //success
                              //get config
                              var obj = {
                                  url: appInstance.globalData.apiUrl.getConfigUrl,
                                  data: {
                                      shopId: shopId
                                  },
                                  success: function (result) {
                                      var currentPage = getCurrentPages()[getCurrentPages().length - 1].route || getCurrentPages()[getCurrentPages().length - 1].__route__;
                                      if (currentPage != 'pages/shop/shop') {
                                          canSelectShop = true;
                                          return;
                                      }

                                      wx.setStorageSync('configData', result.data.data);
                                      wx.switchTab({
                                          url: '/pages/cart/cart'
                                      })
                                      canSelectShop = true;
                                  }
                              };
                              util.wxRequest(obj);
                          }
                      }.bind(this)
                  }
                  util.wxRequest(lbsObj);

              }.bind(this),
              fail: function (err) {
                  canSelectShop = true;
                  if (err.errMsg == "getLocation:fail auth deny") {
                      this.setData({
                          tips: '您已拒绝定位授权。'
                      })
                  } else {
                      this.setData({
                          tips: '未开启定位功能，请手动选择门店'
                      })

                  }
              }.bind(this)
          })
      } else if (options.type == "fromBBGPlus") {
          this.getDefaultShop()
      }
  },
 
   
})