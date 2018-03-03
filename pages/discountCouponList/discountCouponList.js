// pages/my/discountCouponList.js
var util = require('../../utils/util');
var appInstance = getApp();
var PAGE_INDEX = 1; //current page index
var discountId = ['1', '2', '3'];
var discountStatus = ['canuse', 'used', 'expired'];
var noMoreData = false;
var onLoadMore = false;
var canUseDiscountList = [];
var usedDiscountList = [];
var expiredDiscountList = [];
Page({
  // 券码暂时4位  使用规则返回多少就折行显示多少，不用前面的小点点
  /**
   * 页面的初始数据
   */
  data: {
    /** 
          * 页面配置 
          */
   
    // tab切换  
    currentTab: 0,
    selected: '1',
    isShow: false,
    canUseDiscountList:[],
    usedDiscountList: [],
    expiredDiscountList: [],
    currentTab: 0,  //swiper index
    noMoreData: false,// no more data
    noData: false,//no data
    loading: false,//loading
    toTop: 0  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    canUseDiscountList = [];
    usedDiscountList = [];
    expiredDiscountList = [];
    PAGE_INDEX = 1;
    this.data.selected = options.type || '1';
    var that = this;

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var index = discountId.indexOf(this.data.selected);
    var status = discountStatus[index];
    this.queryDiscountList(status, this.data.selected, PAGE_INDEX)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // wx.stopPullDownRefresh();
    // PAGE_INDEX =1;
    // var index = discountId.indexOf(this.data.selected);
    // var status = discountStatus[index];
    // this.queryDiscountList(status, this.data.selected, PAGE_INDEX);
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
  
  },
  refresh:function(){
    // bindscrolltoupper = 'refresh'
    canUseDiscountList = [];
    usedDiscountList = [];
    expiredDiscountList = [];
    PAGE_INDEX = 1;
    var index = discountId.indexOf(this.data.selected);
    var status = discountStatus[index];
    this.queryDiscountList(status, this.data.selected, PAGE_INDEX);
  },
  loadMore: function (e) {
    console.log("loadMore")
    if (onLoadMore||noMoreData){
      return;
    }else{
      PAGE_INDEX++;
      var index = discountId.indexOf(this.data.selected);
      var status = discountStatus[index];
      this.queryDiscountList(status, this.data.selected, PAGE_INDEX);
    }
   
  },
  //query order list by pageIndexx
  queryDiscountList: function (status, selected, pageIndex) {    
    onLoadMore = true;
    if (wx.showLoading) {
      wx.showLoading({
        title: '加载中',
        mask: true
      });
    }
    var obj = {
      url: appInstance.globalData.apiUrl.myDiscountCouponListUrl,
      data: {
        page: pageIndex,
        pageSize: appInstance.globalData.PAGE_SIZE,
        'type': selected,
        couponType:1
      },
      success: function (result) {
        onLoadMore = false;      
        var noData = false;
        noMoreData = false;
        if (pageIndex == 1 && !result.data.data.length){
          noData = true;
        }
        if (result.data.data.length < appInstance.globalData.PAGE_SIZE){
          noMoreData = true;          
        }           
        if (status == 'canuse') {
          canUseDiscountList.push.apply(canUseDiscountList, result.data.data);
          var currentTab = 0;
        } else if (status == 'used') {
          canUseDiscountList.push.apply(usedDiscountList, result.data.data);
          var currentTab = 1;
        } else if (status == 'expired') {
          canUseDiscountList.push.apply(expiredDiscountList, result.data.data);
          var currentTab = 2;
        }
        //recovery PAGE_INDEX=1
        // PAGE_INDEX = 1;
        this.setData({
          canUseDiscountList: canUseDiscountList,
          usedDiscountList: usedDiscountList,
          expiredDiscountList: expiredDiscountList,
          selected: selected,
          currentTab: currentTab,
          noMoreData: noMoreData,
          noData: noData,
        })

      }.bind(this),
      fail: function (err) {
        onLoadMore = false;      
        console.log(err)
      }
    }


    util.wxRequest(obj)
  },
  swiperChange: function (e) {
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
    this.refresh()
  },
  toggleDiscount: function (e) {
    PAGE_INDEX = 1;
    var id = e.target.dataset.id;
    this.setData({
      selected: id,
      currentTab: parseInt(id) - 1,
      toTop: 0
    })
  }, 
  useCodePressed: function (event) {
    console.log('show')
    var row = event.currentTarget.id;
    var index = discountId.indexOf(this.data.selected);
    var status = discountStatus[index];
    var coupon;
    if (status == 'canuse') {
      coupon = this.data.canUseDiscountList;
    } else if (status == 'used') {
      coupon = this.data.usedDiscountList;
    } else if (status == 'expired') {
      coupon = this.data.expiredDiscountList;
    }
    var item = coupon[row];
    console.log('item:', item)
    this.setData({
      isShow: true,
      currentTagCoupon: item
    });
  },
  closePressed: function () {
    console.log('close')
    this.setData({
      isShow: false
    });
  },
  //折叠 展开
  foldPressed: function (event) {
    var row = event.currentTarget.id;
    var index = discountId.indexOf(this.data.selected);
    var status = discountStatus[index];
    var coupon;
    if (status == 'canuse'){
      coupon = this.data.canUseDiscountList;
    }else if (status == 'used'){
      coupon = this.data.usedDiscountList;
    } else if (status == 'expired'){
      coupon = this.data.expiredDiscountList;
    }
    var item = coupon[row];
    if (coupon[row].fold) {
      coupon[row].fold =false;

    } else {
      coupon[row].fold = true;
    }
    this.setData({
        canUseDiscountList : this.data.canUseDiscountList,
        usedDiscountList : this.data.usedDiscountList,
        expiredDiscountList : this.data.expiredDiscountList
      
    })
  }

})