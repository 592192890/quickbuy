// pages/submit-order/submit-order.js
var util = require('../../utils/util.js');

var displayUtils = require('../../utils/displayUtils.js');

var that = this

var appInstance = getApp();
Page({
  data: {

    backupOrder: {},
    hasCoupon: false,
    userCount: 0,
    discount: 0,
    storeName: '',
    submitOrder: {
      showTopLine: false,
      discountAmount: "0.00",
      items: [
        // {
        //   seq: "1",
        //   item_rspCod: "SUCCESS",
        //   item_rspMsg: "成功",
        //   amount: "17.80",
        //   barcode: "4891338016223",
        //   bn: "800243251",
        //   dept: "29",
        //   price: "8.90",
        //   productName: "黑人140g超白矿物盐七折装",
        //   promotionalLabel: "正常",
        //   weight: "0",
        //   quantity: "2",
        //   productImg: "http://img2.bbgstatic.com/15f280c0fb7_bc_c1841804ddb9652e2836fd1748d03033_225x225.png"
        // }
      ],
      coupons: [
        // {
        //   "code": 1,
        //   "couponName": "测试内容6ben",
        //   "couponid": 72170,
        //   "price": '9',
        //   "selected": 1,
        //   "fontsize": 46,
        //   "beginTime": "2018-2-3",
        //   "endTime": "2018-2-3",
        // },
        // {
        //   "code": 2,
        //   "couponName": "测试内容6ben",
        //   "couponid": 72170,
        //   "price": '99.90',
        //   "selected": 0,
        //   "fontsize": 46,
        //   "beginTime": "2018-2-3",
        //   "endTime": "2018-2-3",
        // },
        // {
        //   "code": 3,
        //   "couponName": "测试内容6ben",
        //   "couponid": 72170,
        //   "price": '8.5',
        //   "selected": 0,
        //   "fontsize": 46,
        //   "beginTime": "2018-2-3",
        //   "endTime": "2018-2-3",
        // }
      ],
      payAmount: "156.40",
      totalAmount: "156.40",
      orderType: "0"
      ,
      isShow: false,
      phoneAnim: {}

    },
    productNumber: 0,
    isNew: false //是否是鲜食演义的商品
  },
  submitOrder: function (e) {
    if (wx.showLoading) {
      wx.showLoading({
        title: '提交中',
        mask: true
      });
    }
    //get pay parameter
    var obj = {
      url: appInstance.globalData.apiUrl.submitOrderUrl,
      data: {
        shopId: wx.getStorageSync('configData').shopId,
        order: JSON.stringify(this.data.submitOrder),
        formId: e.detail.formId == 'the formId is a mock one' ? '' : e.detail.formId,
        openId: wx.getStorageSync('openId'),
      },
      success: function (result) {
        var orderId = result.data.data.orderId;
        wx.setStorageSync('isClearCart', true);

        var cartArr = wx.getStorageSync('unSelectedCart');
        wx.setStorageSync('unSelectedCart', null);

        var storageCart = wx.getStorageSync('cart');
        var shopId = wx.getStorageSync('configData').shopId;
        storageCart[shopId] = cartArr[shopId];
        wx.setStorageSync('cart', storageCart);//clear cart

        wx.hideLoading()

        wx.redirectTo({
          url: '/pages/order-detail/order-detail?orderId=' + orderId
        })

      },
      fail: function (err) {
        wx.showToast({
          title: err.msg,
        })
        wx.hideLoading()
      }
    }
    util.wxRequest(obj);

  },
  onCartItemScroll: function (e) {
    console.log(e.detail.scrollTop)
  },
  onScroll: function (e) {



    if (this.data.submitOrder.showTopLine) {

      if (e.detail.scrollTop <= 20) {
        this.data.submitOrder.showTopLine = false
        this.setData({
          submitOrder: this.data.submitOrder
        })
      }

    } else {

      if (e.detail.scrollTop > 20) {
        this.data.submitOrder.showTopLine = true
        this.setData({
          submitOrder: this.data.submitOrder
        })
      }

    }




  },
  onScollTop: function (e) {
    // console.log(e)
  },
  selectCoupon: function (e) {


    if (!this.data.submitOrder.coupons || this.data.submitOrder.coupons.length <= 0) {
      return
    }



    this.data.submitOrder.isShow = true
    this.setData({
      submitOrder: this.data.submitOrder
    })



    setTimeout(function () {
      var animationPhone = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease',
      })
      animationPhone.translate(0, displayUtils.rpx2px(-800)).step()
      this.data.submitOrder.phoneAnim = animationPhone.export()
      this.setData({
        submitOrder: this.data.submitOrder
      })
    }.bind(this), 100)



  },

  userCoupon: function () {



    this.data.hasCoupon = false
    this.data.userCount = 0
    this.data.discount = 0


    if (this.data.submitOrder.coupons && this.data.submitOrder.coupons.length > 0) {
      this.data.hasCoupon = true
    } else {
      this.data.hasCoupon = false
    }

    if (this.data.submitOrder.coupons && this.data.submitOrder.coupons.length > 0) {
      for (var i = 0; i < this.data.submitOrder.coupons.length; i++) {

        if (this.data.submitOrder.coupons[i].selected == 1) {
          this.data.userCount += 1
          this.data.discount += parseFloat(this.data.submitOrder.coupons[i].price)
          // this.data.discount = this.data.discount.toFixed(1)

        }
      }
    }

    console.log(this.data.submitOrder)

    this.setData({
      hasCoupon: this.data.hasCoupon,
      userCount: this.data.userCount,
      discount: this.data.discount
    })

  },

  onLoad: function () {

    var submitOrder = wx.getStorageSync('submitOrder');

    this.data.backupOrder = submitOrder

    wx.setStorageSync('submitOrder', null);

    // var submitOrder = this.data.submitOrder

    this.data.submitOrder = submitOrder

    if (this.data.submitOrder.coupons) {

      this.data.submitOrder.coupons.forEach(function (value) {




        if (value.price.toString().length < 4) {
          value.fontsize = displayUtils.rpx2px(100)
        } else if (value.price.toString().length >= 4) {
          value.fontsize = displayUtils.rpx2px(70)
        }


        if (value.price.substring(value.price.length - 2, value.price.length) == ".0") {
          value.priceShow = value.price.substring(0,value.price.length - 2)
        } else {
          value.priceShow = value.price
        }






        return value;
      });

    }




    var productNumber = 0;
    submitOrder.items.forEach(function (value) {
      if (!value.quantity || value.quantity == '0') {
        value.quantity = 1;
      }
      productNumber = parseInt(productNumber) + parseInt(value.quantity);
      value.price = parseFloat(value.price).toFixed(2);




      // value.totalPrice=parseFloat(value.quantity*value.price).toFixed(2);
      return value;
    });







    var isNew = false;
    if (submitOrder.orderType == 1) {
      isNew = true;
    }
    this.setData({
      submitOrder: submitOrder,
      storeName: wx.getStorageSync('configData').shopName,
      productNumber: productNumber,
      isNew: isNew
    })


    this.userCoupon()

  },
  cancelDialog: function (e) {
    var animationPhone = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    })
    animationPhone.translate(0, displayUtils.rpx2px(800)).step()
    this.data.submitOrder.phoneAnim = animationPhone.export()
    this.setData({
      submitOrder: this.data.submitOrder
    })


    setTimeout(function () {
      this.data.submitOrder.isShow = false
      this.setData({
        submitOrder: this.data.submitOrder
      })
    }.bind(this), 150)



  },
  noUserCoupon: function (e) {

    this.data.submitOrder.coupons.forEach(function (value) {
      value.selected = 0
    })
    this.data.submitOrder.discountAmount = 0
    this.data.submitOrder.payAmount = this.data.submitOrder.totalAmount

    this.data.backupOrder.coupons = this.data.submitOrder.coupons
    this.data.backupOrder.discountAmount = this.data.submitOrder.discountAmount
    this.data.backupOrder.payAmount = this.data.submitOrder.payAmount
    this.data.backupOrder.totalAmount = this.data.submitOrder.totalAmount




    this.setData({
      submitOrder: this.data.submitOrder
    })

    this.userCoupon()

    this.cancelDialog()
  },
  couponDefine: function (e) {


    if (wx.showLoading) {
      wx.showLoading({
        title: '请稍候',
        mask: true
      });
    }

    var instance = this

    var obj = {
      url: appInstance.globalData.apiUrl.check_coupon,
      data: {
        order: JSON.stringify(this.data.submitOrder)
      },
      success: function (result) {

        wx.hideLoading()
        instance.cancelDialog()

        // if (result.data.checkStatus) {
        //   instance.cancelDialog()
        // }

        instance.data.submitOrder.discountAmount = result.data.data.discountAmount
        instance.data.submitOrder.payAmount = result.data.data.payAmount
        instance.data.submitOrder.totalAmount = result.data.data.totalAmount

        instance.data.backupOrder.coupons = instance.data.submitOrder.coupons
        instance.data.backupOrder.discountAmount = result.discountAmount
        instance.data.backupOrder.payAmount = result.data.data.payAmount
        instance.data.backupOrder.totalAmount = result.data.data.totalAmount

        instance.setData({
          submitOrder: instance.data.submitOrder
        })
      },
      fail: function (err) {

        instance.data.submitOrder.coupons = instance.data.backupOrder.coupons
        instance.data.submitOrder.discountAmount = instance.data.backupOrder.discountAmount
        instance.data.submitOrder.payAmount = instance.data.backupOrder.payAmount
        instance.data.submitOrder.totalAmount = instance.data.backupOrder.totalAmount

        instance.setData({
          submitOrder: instance.data.submitOrder
        })

        wx.showToast({
          title: err.msg,
        })
        wx.hideLoading()
      }
    }
    util.wxRequest(obj);




  },
  clickCoupone: function (e) {

    var code = e.currentTarget.dataset.code

    this.data.submitOrder.coupons.forEach(function (value) {

      if (value.code == code) {

        if (value.selected == 1) {
          value.selected = 0
        } else {
          value.selected = 1
        }

      } else {
        value.selected = 0
      }

    })

    this.setData({
      submitOrder: this.data.submitOrder
    })

    this.userCoupon()

  }
})