//app.js
App({
    appGlobalData: {
    },
    gotoPage: '', //页面路由
    gotoPageParam: '', //页面路由参数
  globalData: {
    // all api url
    apiUrl: {
      wxLoginUrl: 'https://ssl.yunhou.com/easygo/users/wx_user_login',
      //获取用户微信中绑定手机号登录
      wxMobilLoginUrl: 'https://ssl.yunhou.com/easygo/users/wx_auth_phone_login',
      getCaptchaUrl: 'https://ssl.yunhou.com/easygo/users/send_sms_captcha',
      smsLoginUrl: 'https://ssl.yunhou.com/easygo/users/sms_login',
      getProductInfoUrl: 'https://ssl.yunhou.com/easygo/products/get',
      balanceOrderUrl: 'https://ssl.yunhou.com/easygo/orders/confirm_order',
      submitOrderUrl: 'https://ssl.yunhou.com/easygo/orders/add',
      getOrderListUrl: 'https://ssl.yunhou.com/easygo/orders/lists',
      getOrderDetailUrl: 'https://ssl.yunhou.com/easygo/orders',
      cancelOrderUrl: 'https://ssl.yunhou.com/easygo/orders/cancel',
      payOrderUrl: 'https://ssl.yunhou.com/easygo/orders/pay',
      // 扫描成功
      isUnoperatedOrderUrl: 'https://ssl.yunhou.com/easygo/users/unorders',
      // 个人中心优惠券列表
      myDiscountCouponListUrl: 'https://ssl.yunhou.com/beacons/coupon/my', //https://ssl.yunhou.com/easygo/coupons/my

      deleteOrderUrl: 'https://ssl.yunhou.com/easygo/orders/delete',

      queryPayResultUrl: 'https://ssl.yunhou.com/easygo/orders/payed',

      getConfigUrl: 'https://ssl.yunhou.com/easygo/sys/config',

      getShopListUrl: 'https://ssl.yunhou.com/easygo/sys/shoplist',

      getShopLBSUrl: 'https://ssl.yunhou.com/easygo/sys/lbstoshop',

      receiveOrderUrl: 'https://ssl.yunhou.com/easygo/orders/receipt',

      check_coupon: "https://ssl.yunhou.com/easygo/orders/check_coupon"//核验优惠券
    },
    PAGE_SIZE: 10, //every page contain data count
    START_WITH: ['48', '49'], //鲜食演义开头的数字
  },
  onLaunch: function (options) {

  },
  onShow: function (res) {
    this.appGlobalData = res
    if (res && ((res.scene == 1038) || (res.scene == 1037))) {
      wx.setStorageSync('extraData', res.referrerInfo['extraData'])
      console.log(res.referrerInfo.extraData)
    }
  }
})
