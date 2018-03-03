// pages/my/my.js
var util = require('../../utils/util.js');
var appInstance = getApp();
var startWith=appInstance.globalData.START_WITH; //鲜食演义开头的数字
Page({
  data:{
    userInfo:{},
    uncheckNumber:0,
    unpayNumber:0,
    memberLevel:'',
    mobile:'',
    isDefaultUserLevel:true,
    defaultLevel:wx.getStorageSync('configData').card_level_default
  },
  goOrder:function(e){
    // type:1-->all order; 2--->unpay order;3--->uncheck  order
    var type=e.currentTarget.dataset.id;
    wx.navigateTo({
      url:'/pages/order/order?type='+type
    })
  },
  goIdentifyCode:function(e){
    
    wx.navigateTo({
      url: '/pages/identify-code/identify-code'
    })
  }, goDiscountCouponList: function () {
    wx.navigateTo({
      url: '/pages/discountCouponList/discountCouponList'
    })
  },
  goToggleShop:function(){
    if(wx.showLoading){
      wx.showLoading({
        title: '加载中',
        mask:true
      })
    }
    //judge whether has unchecked order
    var obj={
      url:appInstance.globalData.apiUrl.isUnoperatedOrderUrl,
      data:{
        
      },
      success:function(result){
        var uncheckOrderNumber=result.data.data.uncheckOrder.number;
        // var unpaidOrderNumber=result.data.data.unpaidOrder.number;

        if(uncheckOrderNumber==0){
           wx.navigateTo({
            url:"/pages/shop/shop?type='toggle'"
          })
        }else{
          wx.showModal({
            title: '提示',
            showCancel:false,
            content: '存在待核检订单，不能切换门店！',
            confirmColor:'#f95d5b'
          })
        }
        
      }.bind(this),
      fail:function(err){
        
      }
    };
    util.wxRequest(obj);
   
  },

  goInvoice:function() {
    console.log('go invoice');
    var url = 'https://wx.yunhou.com/super/member/tickets';
    var encodeUrl = encodeURIComponent(url)
    wx.navigateTo({
      url: '../web/web?url=' + encodeUrl,
    })
  },

  goHelpCenter:function(){
    wx.navigateTo({
      url:'/pages/help/help'
    })
  },
  onLoad:function(){
      //get user information from cache
      var userInfo=wx.getStorageSync('storeUserInfo');
      var memberLevel=wx.getStorageSync('member').tier;
      var mobile=wx.getStorageSync('member').mobile;
      var tempArr=mobile.split('');
      tempArr.splice(3,4,'*','*','*','*')
      mobile=tempArr.join('');

      //judge whether is default user level
      var defaultLevel=wx.getStorageSync('configData').card_level_default||startWith;
      var isDefaultUserLevel=true;
      if(defaultLevel.indexOf(memberLevel)!=-1||!memberLevel){
        isDefaultUserLevel=true
      }else{
        isDefaultUserLevel=false;
      }
      this.setData({
        userInfo:userInfo,
        memberLevel:memberLevel,
        mobile:mobile,
        isDefaultUserLevel:isDefaultUserLevel
      })
      
  },
  onShow:function(){
    var obj={
      url:appInstance.globalData.apiUrl.isUnoperatedOrderUrl,
      data:{
        
      },
      success:function(result){
        var uncheckNumber=result.data.data.uncheckOrder.number;

        var unpayNumber=result.data.data.unpaidOrder.number;
        
        this.setData({
          uncheckNumber:uncheckNumber,
          unpayNumber:unpayNumber,
        })
        
      }.bind(this),
      fail:function(err){
      }
    };
    util.wxRequest(obj);
  }
})