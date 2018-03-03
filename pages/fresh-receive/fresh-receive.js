// pages/fresh-receive/fresh-receive.js
var util=require('../../utils/util');
var appInstance = getApp();
var orderId;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderItem:{

    }
  },
  goCart:function(){
    wx.switchTab({
      url:'/pages/cart/cart'
    })
  },
  goScan:function(){
    wx.switchTab({
      url:'/pages/scan/scan'
    })
  },
  goMy:function(){
    wx.switchTab({
      url:'/pages/my/my'
    })
  },
  comfirmReceive:function(e){
    var orderId=e.target.dataset.orderid;
    var barcode=e.target.dataset.barcode;
    if(wx.showLoading){
      wx.showLoading({
        title: '加载中',
        mask:true
      })
    }
    var receiveObj={
      url:appInstance.globalData.apiUrl.receiveOrderUrl,
      data:{
        orderId:orderId,
        barcode:barcode
      },
      success:function(result){
        var obj={
          url:appInstance.globalData.apiUrl.getOrderDetailUrl,
          data:{
            orderId:orderId
          },
          success:function(result){
            var entity=result.data.data;
            var orderItem={};
            orderItem.orderId=entity.orderId;
            orderItem.createTime=entity.createTime;
            orderItem.year=orderItem.createTime.split(' ')[0];
            orderItem.hour=orderItem.createTime.split(' ')[1];
            orderItem.shopName=entity.shopName;
            orderItem.orderList=entity.items;
            //format receipt_time,only hour:minute:second
            orderItem.orderList.forEach(function(value){
              if(value.receipt_time){
                value.receipt_time=util.getHourMinute(value.receipt_time);
              }
            })
            var realProductPrice=parseFloat(entity.totalAmount)-parseFloat(entity.discountAmount);
            orderItem.realProductPrice=realProductPrice;
            this.setData({
              orderItem:orderItem
            })

          }.bind(this),
          fail:function(err){
            
          }
        };
        util.wxRequest(obj)
        // wx.redirectTo({
        //   url:'/pages/fresh-receive/fresh-receive?orderId='+orderId
        // })
      }.bind(this)
    }

    util.wxRequest(receiveObj);
   
  },
  goNewOrderDetail:function(e){
    if(wx.showLoading){
      wx.showLoading({
        title: '加载中',
        mask:true
      })
    }
    var orderId=e.currentTarget.dataset.orderid
    wx.redirectTo({
      url:'/pages/order-detail/order-detail?orderId='+orderId
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    orderId=options.orderId;
    
  },
  onReady:function(){
    if(wx.showLoading){
      wx.showLoading({
        title:'加载中',
        mask:true
      });
    }
    
    var obj={
      url:appInstance.globalData.apiUrl.getOrderDetailUrl,
      data:{
        orderId:orderId
      },
      success:function(result){
        var entity=result.data.data;
        var orderItem={};
        orderItem.orderId=entity.orderId;
        orderItem.createTime=entity.createTime;
        orderItem.year=orderItem.createTime.split(' ')[0];
        orderItem.hour=orderItem.createTime.split(' ')[1];
        orderItem.shopName=entity.shopName;
        orderItem.orderList=entity.items;
        //format receipt_time,only hour:minute:second
        orderItem.orderList.forEach(function(value){
          if(value.receipt_time){
            value.receipt_time=util.getHourMinute(value.receipt_time);
          }
        })
        var realProductPrice=parseFloat(entity.totalAmount)-parseFloat(entity.discountAmount);
        orderItem.realProductPrice=realProductPrice;
        this.setData({
          orderItem:orderItem
        })

      }.bind(this),
      fail:function(err){
        
      }
    };
    util.wxRequest(obj)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    wx.setNavigationBarTitle({
      title: wx.getStorageSync('configData').shopName
    });
  },

})