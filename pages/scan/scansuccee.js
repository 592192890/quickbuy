var util = require('../../utils/util');
var appInstance = getApp();
var startWith = appInstance.globalData.START_WITH; //鲜食演义开头的数字
var hasUncheckOrder = false;
var hasUnpaidOrder = false;
var hasUnpaidCommonOrder = false;
Page({
  data: {
    recommendation: [],
    hasUncheck: false,
    animationData: {},
    productModel: {
      quantity: 1,
      isCheck: true,
      isTouchMove: false,
      isShow: false,
    },
    isShowIcon: false,
    productModel: {
      quantity: 1,
      isCheck: true,
      isTouchMove: false,
      isShow: false,
    },
    code: ''
  },
  onLoad: function (options) {

    var productModelA = wx.getStorageSync('scansucceeproductModel');
    productModelA.price = parseFloat(productModelA.price).toFixed(2);

    var recommendationA = new Array();
    for (var i in productModelA.recommendation) {
      var item = productModelA.recommendation[i];
      item.price = parseFloat(item.price).toFixed(2);
      var num = parseFloat(item.buyRatio).toFixed(2);
      item.buyRatio = parseFloat(num * 100).toFixed(0);
      recommendationA.push(item);
    }

    this.setData({
      productModel: productModelA,
      recommendation: recommendationA
    });
  },
  cancelCart: function () {
    // 页面隐藏
    wx.switchTab({
      url: '/pages/cart/cart'
    });
  },
  addToCart: function () {
    var productModel = this.data.productModel;

    if (!productModel.quantity) {
      productModel.quantity = '1'
    }
    if (productModel.modqty == 'N') {
      productModel.sum = parseFloat(productModel.amount).toFixed(2);
    } else {
      productModel.sum = (parseFloat(productModel.price) * parseFloat(productModel.quantity)).toFixed(2);
    }
    productModel.price = parseFloat(productModel.price).toFixed(2);

    //判断是否是鲜食演义
    var fresh_food_class = wx.getStorageSync('configData').fresh_food_class || startWith;
    if (fresh_food_class.indexOf(productModel.dept) != -1) {
      productModel.isNew = true;
    } else {
      productModel.isNew = false;
    }
    //add product to cart
    var shopId = wx.getStorageSync('configData').shopId;
    var cartCache = wx.getStorageSync('cart') || {};
    var currentCartCache = cartCache[shopId] || [];
    //1.如果是称重商品,在购物车新增一条商品记录
    //2.如果是非称重商品，如果之前存在于购物车，在原有基础上增加数量，否则新增一条商品记录
    //称重商品
    if (productModel.modqty == 'N') {
      //判断称重商品是否已经存在于购物车，如果存在序列号serialNumber加一。否则序列号为1
      var isExist = false;
      for (var k = 0; k < currentCartCache.length; k++) {
        var item = currentCartCache[k];
        if (item.barcode == productModel.barcode) {
          isExist = true;
          break
        }
      }
      if (!isExist) {
        productModel.serialNumber = 1;
      } else {
        //判断目前购物车中最大的serialNummber
        var serialNumber = 1;
        for (var k = 0; k < currentCartCache.length; k++) {
          var item = currentCartCache[k];
          if (item.barcode == productModel.barcode) {
            if (item.serialNumber >= serialNumber) {
              serialNumber = item.serialNumber;
            }
          }
        }
        productModel.serialNumber = serialNumber + 1;
      }
      currentCartCache.push(productModel);
      cartCache[shopId] = currentCartCache;
      wx.setStorageSync('cart', cartCache)
    } else {
      //非称重商品
      var isExist = false;
      for (var i = 0; i < currentCartCache.length; i++) {
        var item = currentCartCache[i];
        //if exist
        if (item.barcode == productModel.barcode) {
          isExist = true;
          var newQuanlity = parseInt(item.quantity) + parseInt(productModel.quantity);
          if (newQuanlity > 100) {
            //商品数量超过100
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '商品数量超过100',
              confirmColor: '#f95d5b',
              success: function () {

              }.bind(this)
            })
            return;
          } else {
            item.quantity = newQuanlity;
            item.sum = (parseFloat(item.sum) + parseFloat(productModel.sum)).toFixed(2);

            cartCache[shopId] = currentCartCache;
            wx.setStorageSync('cart', cartCache)
          }
          break;
        }
      }
      //如果不存在
      if (!isExist) {
        currentCartCache.push(productModel);
        cartCache[shopId] = currentCartCache;
        wx.setStorageSync('cart', cartCache)
      }

    }

    // 页面隐藏
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    if (prevPage) {
      prevPage.setData({
        code: ''
      })
    }

    wx.switchTab({
      url: '/pages/scan/scan'
    });

    //动画
    var animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease',
    })

    // this.animation = animation



    setTimeout(function () {


      wx.scanCode({
        success: (res) => {
          var type = res.scanType;
          var obj = {
            url: appInstance.globalData.apiUrl.getProductInfoUrl,
            data: {
              barcode: res.result,
              shopId: wx.getStorageSync('configData').shopId
            },
            success: function (result) {
              //让serialNumber为undefined
              this.data.productModel.serialNumber = undefined;

              var productModel = Object.assign({}, this.data.productModel, result.data.data);
              productModel.isShow = true;
              productModel.amount = parseFloat(productModel.amount).toFixed(2);

              var fresh_food_class = wx.getStorageSync('configData').fresh_food_class || startWith;
              if (fresh_food_class.indexOf(result.data.data.dept) != -1) {

                wx.setStorageSync('scansucceeproductModel', productModel)
                wx.navigateTo({
                  url: "/pages/scan/scansuccee",
                })
              } else {
                if (hasUncheckOrder) {
                  wx.showModal({
                    title: '提示',
                    showCancel: false,
                    content: "有待核检订单，您不能扫描！（只有鲜食演义商品可以继续扫描）",
                    confirmColor: '#f95d5b'
                  })
                  return;
                }
                if (hasUnpaidCommonOrder) {
                  wx.showModal({
                    title: '提示',
                    showCancel: false,
                    content: "有待付款订单，您不能扫描！（只有鲜食演义商品可以继续扫描）",
                    confirmColor: '#f95d5b'
                  })
                  return;
                }

                wx.setStorageSync('scansucceeproductModel', productModel)
                wx.navigateTo({
                  url: "/pages/scan/scansuccee",
                })

              }



            }.bind(this),
            fail: function (err) {

            }
          }
          util.wxRequest(obj);
        }
      })
    }.bind(this), 800)

  },
  minus: function (e) {
    //judge whether can weight
    if (e.target.dataset.isweight == 'N' || !e.target.dataset.isweight) {
      return;
    }
    if (this.data.productModel.quantity > 1) {
      this.data.productModel.quantity--;
      this.setData({
        productModel: this.data.productModel
      })
    }

  },
  add: function (e) {
    //judge whether can weight
    if (e.target.dataset.isweight == 'N' || !e.target.dataset.isweight) {
      return;
    }
    if (this.data.productModel.quantity < 100) {
      this.data.productModel.quantity++;
      this.setData({
        productModel: this.data.productModel
      })
    }

  },
  changeNumber: function (e) {
    //judge whether can weight
    if (e.target.dataset.isweight == 'N' || !e.target.dataset.isweight) {
      this.setData({
        productModel: this.data.productModel
      })
      return;
    }

    var changeNumber = e.detail.value;
    if (/^\d*$/.test(changeNumber) && changeNumber >= 1 && changeNumber <= 100) {
      this.data.productModel.quantity = changeNumber;
      this.setData({
        productModel: this.data.productModel
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '商品数量必须是1到100的正整数',
        showCancel: false,
        confirmColor: '#f95d5b',
        success: function () {
          this.setData({
            productModel: this.data.productModel
          })
        }.bind(this)
      })
    }
  },


})
