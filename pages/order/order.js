// pages/order/order.js
var util = require('../../utils/util');
var appInstance = getApp();

var PAGE_INDEX = 1; //current page index
var TOTAL_PAGE = 0;  //all order list's count
var tabId = ['1', '2', '3'];
var tabStatus = [null, 'paid', 'check'];
var currentOrderId;
var currentOrderType;
var showModalFlag = true;

Page({
  data: {
    selected: '1',
    allOrderList: [],
    unpayOrderList: [],
    uncheckOrderList: [],
    currentTab: 0,  //swiper index
    noMoreData: false,// no more data
    noData: false,//no data
    loading: false,//loading
    toTop: 0      //if toggle order tab,scrollTop=0
  },
  swiperChange: function (e) {
    PAGE_INDEX = 1;

    var selected = 1;
    if (e.detail.current == 0) {
      selected = '1';
    } else if (e.detail.current == 1) {
      selected = '2';
    } else if (e.detail.current == 2) {
      selected = '3';
    }

    this.setData({
      selected: selected,
      toTop: 0,
      noMoreData: false
    })
    var index = tabId.indexOf(selected);
    var status = tabStatus[index];
    this.queryOrderList(status, selected);
  },
  toggleOrder: function (e) {
    PAGE_INDEX = 1;

    var id = e.target.dataset.id;

    this.setData({
      selected: id,
      currentTab: parseInt(id) - 1,
      toTop: 0
    })
  },
  goOrderDetail: function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/order-detail/order-detail?orderId=' + orderId
    })
  },
  deleteOrder: function (e) {
    var selectedTab = e.target.dataset.selected;//which tab
    var orderId = e.target.dataset.id;
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
              //get maping between tabId and tabStatus
              var index = tabId.indexOf(selectedTab);
              var status = tabStatus[index];

              this.queryOrderList(status, selectedTab)

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
    var orderId = e.target.dataset.id;
    var orderType = e.target.dataset.type;
    if (wx.showLoading) {
      wx.showLoading({
        title: '提交中',
        mask: true
      });
    }
    currentOrderId = orderId;
    currentOrderType = orderType;
    //get pay parameter
    var obj = {
      url: appInstance.globalData.apiUrl.payOrderUrl,
      data: {
        orderId: orderId
      },
      success: function (result) {
        var payObj = result.data.data;
        if (payObj.payStatus == 1){          
          wx.navigateTo({
            url: '/pages/order-detail/order-detail?orderId=' + orderId
          })
        }else{
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
        }        
      }.bind(this),
      fail: function (err) {
      }
    }
    util.wxRequest(obj);
  },
  applyRefund: function (e) {
    var orderId = e.target.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定申请退款？',
      confirmColor: '#f95d5b',
      success: function (res) {
        if (res.confirm) {
          if (wx.showLoading) {
            wx.showLoading({
              title: '提交中',
              mask: true
            });
          }
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
                  wx.redirectTo({
                    url: '/pages/order/order?type=3'
                  })
                }

              })

            },
            fail: function (err) {

            }
          }
          util.wxRequest(obj);
        }
      }.bind(this)
    })

  },
  receiveOrder: function (e) {
    var orderId = e.target.dataset.id;
    wx.navigateTo({
      url: '/pages/order-detail/order-detail?orderId=' + orderId
    })
  },
  cancelOrder: function (e) {
    var selectedTab = e.target.dataset.selected;//which tab
    var orderId = e.target.dataset.id;
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
              //get maping between tabId and tabStatus
              var index = tabId.indexOf(selectedTab);
              var status = tabStatus[index];

              this.queryOrderList(status, selectedTab)

            }.bind(this),
            fail: function (err) {

            }
          }
          util.wxRequest(obj)
        }
      }.bind(this)
    })
  },
  loadMore: function (e) {
    if (PAGE_INDEX >= TOTAL_PAGE) {
      this.setData({
        noMoreData: true
      })
      return;
    }
    this.setData({
      loading: true
    })
    var id = e.target.dataset.id;
    if (id == 1) {
      var status = null;
    } else if (id == 2) {
      var status = 'paid';
    } else if (id == 3) {
      var status = 'check';
    }
    PAGE_INDEX++;
    var obj = {
      url: appInstance.globalData.apiUrl.getOrderListUrl,
      data: {
        page: PAGE_INDEX,
        size: appInstance.globalData.PAGE_SIZE,
        status: status
      },
      success: function (result) {
        TOTAL_PAGE = result.data.data.totalPages;
        if (status == null) {
          var newOrderList = this.data.allOrderList.concat(result.data.data.lists);
          this.setData({
            allOrderList: newOrderList,
            selected: id,
            loading: false
          })
        } else if (status == 'paid') {
          var newOrderList = this.data.unpayOrderList.concat(result.data.data.lists);
          this.setData({
            unpayOrderList: newOrderList,
            selected: id,
            loading: false
          })
        } else if (status == 'check') {
          var newOrderList = this.data.uncheckOrderList.concat(result.data.data.lists);
          this.setData({
            uncheckOrderList: newOrderList,
            selected: id,
            loading: false
          })
        }

      }.bind(this),
      fail: function (err) {

      }
    };
    util.wxRequest(obj)
  },
  //query order list by pageIndexx
  queryOrderList: function (status, selected, pageIndex) {
    if (wx.showLoading) {
      wx.showLoading({
        title: '加载中',
        mask: true
      });
    }
    var obj = {
      url: appInstance.globalData.apiUrl.getOrderListUrl,
      data: {
        page: pageIndex || 1,
        size: appInstance.globalData.PAGE_SIZE,
        status: status
      },
      success: function (result) {

        TOTAL_PAGE = result.data.data.totalPages;

        var noData = false;
        var noMoreData = false;
        if (TOTAL_PAGE == 0) {
          var noData = true;
        }
        if ((!pageIndex || pageIndex == 1) && TOTAL_PAGE == 1) {
          noMoreData = true;
        }
        if (status == null) {
          this.data.allOrderList = result.data.data.lists;
          var currentTab = 0;
        } else if (status == 'paid') {
          this.data.unpayOrderList = result.data.data.lists;
          var currentTab = 1;
        } else if (status == 'check') {
          this.data.uncheckOrderList = result.data.data.lists;
          var currentTab = 2;
        }
        //recovery PAGE_INDEX=1
        PAGE_INDEX = 1;
        this.setData({
          allOrderList: this.data.allOrderList,
          unpayOrderList: this.data.unpayOrderList,
          uncheckOrderList: this.data.uncheckOrderList,
          selected: selected,
          currentTab: currentTab,
          noMoreData: noMoreData,
          noData: noData,
          toTop: 0
        })

      }.bind(this),
      fail: function (err) {
      }
    }


    util.wxRequest(obj)
  },
  onLoad: function (options) {
    this.data.selected = options.type || '1';


  },
  onShow: function () {
    //get maping between tabId and tabStatus
    var index = tabId.indexOf(this.data.selected);
    var status = tabStatus[index];

    this.queryOrderList(status, this.data.selected)
    var payResultMsg
    if (wx.getStorageSync('extraData')['res']) {
      payResultMsg = wx.getStorageSync('extraData')['res'].errMsg
    }

    // console.log("order-detail onShow payResultMsg == " + wx.getStorageSync('extraData')['res'].errMsg)
    if (payResultMsg) {
      if (payResultMsg == 'requestPayment:ok') {
        var resultObj = {
          url: appInstance.globalData.apiUrl.queryPayResultUrl,
          data: {
            orderId: currentOrderId
          },
          success: function (result) {
            if (currentOrderType == 1) {
              wx.redirectTo({
                url: '/pages/fresh-receive/fresh-receive?orderId=' + currentOrderId
              })

            } else {
              // wx.navigateBack();
              wx.redirectTo({
                url: '/pages/uncheck/uncheck?orderId=' + currentOrderId
              })
            }

          }.bind(this),
          fail: function (err) {

          }
        }
        util.wxRequest(resultObj);
      } else if (payResultMsg == 'requestPayment:fail') {
        //do nothing
        if (showModalFlag){
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: "支付失败",
          confirmColor: '#f95d5b'
        })
        showModalFlag = false
        }
      } else {//pay failure
        if (showModalFlag){
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: "支付取消",
          confirmColor: '#f95d5b'
        })
        showModalFlag = false
        }
      }
      wx.removeStorageSync('extraData')
      payResultMsg = null
    }
  }


}) 