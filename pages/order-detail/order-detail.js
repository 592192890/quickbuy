// pages/order-detail/order-detail.js
var util = require('../../utils/util');
var appInstance = getApp();
var orderId;
var orderType;
var showModalFlag = false;
var orderItem
Page({
  data: {
    orderItem: {},
    carNo: '',
    canDelete: true
  },
  cancelOrder: function (e) {
    orderId = e.target.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确认取消订单吗？',
      confirmColor: '#f95d5b',
      success: function (res) {
        if (res.confirm) {
          var obj = {
            url: appInstance.globalData.apiUrl.cancelOrderUrl,
            data: {
              orderId: orderId
            },
            success: function (result) {
              //return
              //  wx.navigateBack();
              if (wx.showLoading) {
                wx.showLoading({
                  title: '加载中',
                  mask: true
                });
              }
              var newObj = {
                url: appInstance.globalData.apiUrl.getOrderDetailUrl,
                data: {
                  orderId: orderId
                },
                success: function (result) {
                  var realProductPrice = parseFloat(result.data.data.totalAmount) - parseFloat(result.data.data.discountAmount);
                  //判断已支付鲜食演义是否有未收货商品
                  var canDelete = true;
                  if (result.data.data.orderType == 1 && result.data.data.payStatus == 1) {
                    result.data.data.items.forEach(function (value) {
                      if (value.receipted == 0) {
                        canDelete = false;
                      }
                    })
                  }
                  //format receipt_time,only hour-minute-second
                  result.data.data.items.forEach(function (value) {
                    if (value.receipt_time) {
                      value.receipt_time = util.getHourMinute(value.receipt_time);
                    }
                  })
                  this.setData({
                    orderItem: result.data.data,
                    realProductPrice: realProductPrice.toFixed(2),
                    carNo: wx.getStorageSync('member').cardNo,
                    canDelete: canDelete
                  })
                }.bind(this),
                fail: function (err) {

                }
              };
              util.wxRequest(newObj)
            }.bind(this),
            fail: function (err) {

            }
          }
          util.wxRequest(obj)
        }
      }.bind(this)
    })
  },
  applyRefund: function (e) {
    orderId = e.target.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确认申请退款吗？',
      confirmColor: '#f95d5b',
      success: function (res) {
        if (res.confirm) {
          var obj = {
            url: appInstance.globalData.apiUrl.cancelOrderUrl,
            data: {
              orderId: orderId
            },
            success: function (result) {
              wx.showModal({
                title: '提示',
                content: result.data.data.msg,
                showCancel: false,
                confirmColor: '#f95d5b',
                success: function () {
                  wx.navigateBack();
                }
              })

            }.bind(this),
            fail: function (err) {

            }
          }
          util.wxRequest(obj)
        }
      }.bind(this)
    })
  },

  payOrder: function (e) {
    orderId = e.target.dataset.id;
    orderType = e.target.dataset.ordertype;
    if (wx.showLoading) {
      wx.showLoading({
        title: '提交中',
        mask: true
      });
    }
    //get pay parameter
    var obj = {
      url: appInstance.globalData.apiUrl.payOrderUrl,
      data: {
        orderId: orderId
      },
      success: function (result) {
        var payObj = result.data.data;

        // 云猴钱包支付
        wx.navigateToMiniProgram({
          appId: 'wx6945554d276c01a7',
          path: 'pages/index/index',
          extraData: {
            appSource: 'bbgPlus',
            source: 'quickBuyPayment',
            siebelId: wx.getStorageSync("member").siebelId,
            mobile: wx.getStorageSync("member").mobile,
            merOrderNo: payObj.merOrderNo,
            payOrderNo: payObj.payOrderNo,
            orderAmt: payObj.orderAmt,
            title: "扫码购"
          },
          envVersion: 'develop',
          success(res) {
            console.log('成功');
            showModalFlag = true
          }
        })
      }.bind(this),
      fail: function (err) {

      }
    }
    util.wxRequest(obj);
  },
  deleteOrder: function (e) {
    orderId = e.target.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确认删除订单吗？',
      confirmColor: '#f95d5b',
      success: function (res) {
        if (res.confirm) {
          var obj = {
            url: appInstance.globalData.apiUrl.deleteOrderUrl,
            data: {
              orderId: orderId
            },
            success: function (result) {
              wx.redirectTo({
                url: '/pages/order/order'
              })
            }.bind(this),
            fail: function (err) {

            }
          }
          util.wxRequest(obj)
        }
      }.bind(this)
    })
  },
  receiveOrder: function (e) {
    wx.showModal({
      title: '提示',
      content: '确定收货吗？',
      confirmColor: '#f95d5b',
      success: function (res) {
        if (res.confirm) {
          var orderId = e.target.dataset.id;
          var barcode = e.target.dataset.barcode;

          var obj = {
            url: appInstance.globalData.apiUrl.receiveOrderUrl,
            data: {
              orderId: orderId,
              barcode: barcode
            },
            success: function (result) {
              // wx.redirectTo({
              //   url:'/pages/order-detail/order-detail?orderId='+orderId
              // })
              var obj = {
                url: appInstance.globalData.apiUrl.getOrderDetailUrl,
                data: {
                  orderId: orderId
                },
                success: function (result) {
                  var realProductPrice = parseFloat(result.data.data.totalAmount) - parseFloat(result.data.data.discountAmount);
                  //判断已支付鲜食演义是否有未收货商品
                  var canDelete = true;
                  if (result.data.data.orderType == 1 && result.data.data.payStatus == 1) {
                    result.data.data.items.forEach(function (value) {
                      if (value.receipted == 0) {
                        canDelete = false;
                      }
                    })
                  }
                  //format receipt_time,only hour-minute-second
                  result.data.data.items.forEach(function (value) {
                    if (value.receipt_time) {
                      value.receipt_time = util.getHourMinute(value.receipt_time);
                    }
                  })
                  this.setData({
                    orderItem: result.data.data,
                    realProductPrice: realProductPrice.toFixed(2),
                    carNo: wx.getStorageSync('member').cardNo,
                    canDelete: canDelete
                  })
                }.bind(this),
                fail: function (err) {

                }
              };
              util.wxRequest(obj)
            }.bind(this)
          }
          util.wxRequest(obj);
        }

      }.bind(this)
    });

  },
  onLoad: function (options) {
    orderId = options.orderId;
  },
  onReady: function () {
    if (wx.showLoading) {
      wx.showLoading({
        title: '加载中',
        mask: true
      });
    }
    var obj = {
      url: appInstance.globalData.apiUrl.getOrderDetailUrl,
      data: {
        orderId: orderId
      },
      success: function (result) {
        orderItem = result.data.data
        var realProductPrice = parseFloat(result.data.data.totalAmount) - parseFloat(result.data.data.discountAmount);
        //判断已支付鲜食演义是否有未收货商品
        var canDelete = true;
        if (result.data.data.orderType == 1 && result.data.data.payStatus == 1) {
          result.data.data.items.forEach(function (value) {
            if (value.receipted == 0) {
              canDelete = false;
            }
          })
        }
        //format receipt_time,only hour-minute-second
        result.data.data.items.forEach(function (value) {
          if (value.receipt_time) {
            value.receipt_time = util.getHourMinute(value.receipt_time);
          }
        })
        this.setData({
          orderItem: result.data.data,
          realProductPrice: realProductPrice.toFixed(2),
          carNo: wx.getStorageSync('member').cardNo,
          canDelete: canDelete
        })
      }.bind(this),
      fail: function (err) {

      }
    };
    util.wxRequest(obj)
  },
  onShow: function () {
    var payResultMsg = ""
    var that = this
    if (wx.getStorageSync('extraData')['res']) {
      payResultMsg = wx.getStorageSync('extraData')['res'].errMsg
    }
    // console.log("order-detail onShow payResultMsg == " + wx.getStorageSync('extraData')['res'].errMsg)
    if (payResultMsg && showModalFlag) {
      showModalFlag = false
      if (payResultMsg == 'requestPayment:ok') {
        var resultObj = {
          url: appInstance.globalData.apiUrl.queryPayResultUrl,
          data: {
            orderId: orderId
          },
          success: function (result) {
            if (orderType == 1) {
              wx.redirectTo({
                url: '/pages/fresh-receive/fresh-receive?orderId=' + orderId
              })

            } else {
              // wx.navigateBack();
              wx.redirectTo({
                url: '/pages/uncheck/uncheck?orderId=' + orderId
              })
            }

          }.bind(this),
          fail: function (err) {
            orderItem.orderStatus = 'paying'
            that.setData({
              orderItem: orderItem,
            })
            wx.removeStorageSync('extraData')
            payResultMsg = null
          }
        }
        util.wxRequest(resultObj);
      } else if (payResultMsg == 'requestPayment:fail') {
        //do nothing
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: "支付失败",
          confirmColor: '#f95d5b'
        })
      } else {//pay failure        
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: "支付取消",
          confirmColor: '#f95d5b'
        })
      }
      wx.removeStorageSync('extraData')
      payResultMsg = null
    }
  }
})