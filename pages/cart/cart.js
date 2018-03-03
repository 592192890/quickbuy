// pages/cart/cart.js
var util = require('../../utils/util.js');
var packageArr=[];
var appInstance = getApp();

var isSumObj={isSum:false};//in case click sum button
var startWith=appInstance.globalData.START_WITH; //鲜食演义开头的数字

Page({
  data:{
    packages:{
      small:{
        price:'',
        name:'',
        barcode:null
      },
      mid:{
        price:'',
        name:'',
        barcode:null
      },
      max:{
        price:'',
        name:'',
        barcode:null
      }
    },
    hasUnpaid:false,//whether has unpaid order
    hasUncheck:false,//whether has uncheck order
    orderId:'',//uncheck order id
    selectedPakageIndex:0,   //pakage index (1:small package;2:middle package;3:big pakacge)
    productList:[],
    totalPrice:0,   //total price
    allSelected:false,    //allSelect radio

    noMoreData:false,

    selectedProductCount:0, //selected product count
    identifyCode:null,
    maxSku:4,
    startX: 0, //开始坐标
    startY: 0
  },
  selectPackage:function(e){
    var index=e.currentTarget.dataset.id;
    var isExist=this.isExistPackageByIndex(index);
    if(!isExist){
      //push package object to productList
      var packageObj=packageArr[index-1];
      packageObj.price=parseFloat(packageObj.price).toFixed(2);
      packageObj.amount=packageObj.price;
      packageObj.sum=parseFloat(packageObj.price).toFixed(2);
      packageObj.isCartBag = true;
      this.data.productList.push(packageObj);

      var previousIndex=this.data.selectedPakageIndex;
      //calculate total price
      var totalPrice=parseFloat(this.data.totalPrice);
      var currentPackagePrice=this.calculatePackagePriceByIndex(index);
      var previousPackagePrice=this.calculatePackagePriceByIndex(previousIndex);
      // expand number to add and minus
      var newSumPrice=parseFloat(totalPrice)+parseFloat(currentPackagePrice);

      var allSelected=true;
      for(var i=0;i<this.data.productList.length;i++){
        var item=this.data.productList[i];
        if(!item.isCheck){
          allSelected=false;
          break;
        }
      }
      this.setData({
        selectedPakageIndex:index,
        totalPrice:newSumPrice.toFixed(2),
        productList:this.data.productList,
        selectedProductCount:this.data.selectedProductCount+1,
        allSelected:allSelected
      })
    }else{
      this.setData({
        selectedPakageIndex:index
      })
    }
    //store cart
    var shopId=wx.getStorageSync('configData').shopId;
    var cart=wx.getStorageSync('cart')||{};

    cart[shopId]=this.data.productList;
    wx.setStorageSync('cart',cart);

  },
  toggleAllSelect:function(){
    var value=this.data.allSelected?false:true;

    //calculate selected product count
    var selectedProductCount=0;
    if(value){
      selectedProductCount=this.data.productList.length;
    }
    this.data.productList.forEach(function(itemValue,index){
      itemValue.isCheck=value;
    });
    var sumPrice=util.calculatePriceBySelectedOrder(this.data.productList);
    // sumPrice+=this.calculatePackagePriceByIndex(this.data.selectedPakageIndex);
    this.setData({
      allSelected:value,
      productList:this.data.productList,
      totalPrice:parseFloat(sumPrice).toFixed(2),
      selectedProductCount:selectedProductCount
    })
    //store cart
    var shopId=wx.getStorageSync('configData').shopId;
    var cart=wx.getStorageSync('cart')||{};
    cart[shopId]=this.data.productList;
    wx.setStorageSync('cart',cart);
  },
  toggleItemSelect:function(e){
    var index=e.target.dataset.index;
    var item=this.data.productList[index];

    var allSelected=false;

    //calculate selected product count
    var selectedProductCount=this.data.selectedProductCount;

    if(item.isCheck){
      item.isCheck=false;
      selectedProductCount--;
      var sumPrice=util.calculatePriceBySelectedOrder(this.data.productList);
      if(selectedProductCount==this.data.productList.length){
        allSelected=true;
      }
      this.setData({
        productList:this.data.productList,
        totalPrice:parseFloat(sumPrice).toFixed(2),
        selectedProductCount:selectedProductCount,
        allSelected:allSelected
      })
    }else{
      item.isCheck=true;
      selectedProductCount++;

      var sumPrice=util.calculatePriceBySelectedOrder(this.data.productList);

      if(selectedProductCount==this.data.productList.length){
        allSelected=true;
      }

      this.setData({
        productList:this.data.productList,
        totalPrice:parseFloat(sumPrice).toFixed(2),
        allSelected:allSelected,
        selectedProductCount:selectedProductCount
      })
    }
    //store cart
    var shopId=wx.getStorageSync('configData').shopId;
    var cart=wx.getStorageSync('cart')||{};

    cart[shopId]=this.data.productList;
    wx.setStorageSync('cart',cart);

  },
  minus:function(e){
    var index=e.target.dataset.index;
    var item=this.data.productList[index];

    //judge whether can weight
    if(e.target.dataset.isweight=='N'||!e.target.dataset.isweight){
      if(item.quantity==1){
        item.isTouchMove=true;
      }
      this.setData({
        productList:this.data.productList
      })
      return;
    }

    if(item.quantity>1){
      item.quantity--;
      item.sum=(parseFloat(item.quantity)*parseFloat(item.amount)).toFixed(2);

       //if product is selected,calculate all selected products list' sumprice;or don't
      if(item.isCheck){
        var totalPrice=util.calculatePriceBySelectedOrder(this.data.productList);
        this.setData({
          productList:this.data.productList,
          totalPrice:parseFloat(totalPrice).toFixed(2)
        })
      }else{
        this.setData({
          productList:this.data.productList
        })
      }

      //store cart
      var shopId=wx.getStorageSync('configData').shopId;
      var cart=wx.getStorageSync('cart')||{};

      cart[shopId]=this.data.productList;
      wx.setStorageSync('cart',cart);
    }else{
      item.isTouchMove=true;
      this.setData({
          productList:this.data.productList
        })
    }
  },
  add:function(e){
    //judge whether can weight
    if(e.target.dataset.isweight=='N'||!e.target.dataset.isweight){
      return;
    }
    var index=e.target.dataset.index;
    var item=this.data.productList[index];
    if(item.quantity<100){
      item.quantity++;
      item.sum=(parseFloat(item.quantity)*parseFloat(item.amount)).toFixed(2);

      //if product is selected,calculate all selected products list' sumprice;or don't
      if(item.isCheck){
        var totalPrice=util.calculatePriceBySelectedOrder(this.data.productList);
        this.setData({
          productList:this.data.productList,
          totalPrice:parseFloat(totalPrice).toFixed(2)
        })
      }else{
        this.setData({
          productList:this.data.productList
        })
      }
      //store cart
      var shopId=wx.getStorageSync('configData').shopId;
      var cart=wx.getStorageSync('cart')||{};

      cart[shopId]=this.data.productList;
      wx.setStorageSync('cart',cart);
    }
  },
  changeNumber:function(e){
    //judge whether can weight
    if(e.target.dataset.isweight=='N'||!e.target.dataset.isweight){
      this.setData({
        productList:this.data.productList
      })
      return;
    }
    var changeNumber=e.detail.value;
    var totalPrice=0;
    var index=e.target.dataset.index;
    var item=this.data.productList[index];
    if(/^\d*$/.test(changeNumber)&&changeNumber>=1&&changeNumber<=100){
      item.quantity=changeNumber;
      item.sum=(parseFloat(item.quantity)*parseFloat(item.amount)).toFixed(2);

      var productList=this.data.productList;
      for(var i in productList){
        var item = productList[i];
        if(item.isCheck){
          totalPrice=parseFloat(totalPrice)+parseFloat(item.amount)*parseFloat(item.quantity);
        }
      }
      this.setData({
        productList:this.data.productList,
        totalPrice:parseFloat(totalPrice).toFixed(2)
      })

      //store cart
      var shopId=wx.getStorageSync('configData').shopId;
      var cart=wx.getStorageSync('cart')||{};

      cart[shopId]=this.data.productList;
      wx.setStorageSync('cart',cart);

    }else{
      wx.showModal({
        title: '错误',
        showCancel:false,
        content: '商品数量只能输入1到100的正整数',
        confirmColor:'#f95d5b',
        success:function(){
          this.setData({
            productList:this.data.productList
          })
        }.bind(this)
      })
    }
  },
  calculatePackagePriceByIndex(index){
    var packagePrice=0;
    if(index==1){
      packagePrice=this.data.packages.small.price;
    }
    if(index==2){
      packagePrice=this.data.packages.mid.price
    }
    if(index==3){
      packagePrice=this.data.packages.max.price;
    }
    return packagePrice
  },
  goSubmitOrder:function(){
    if(!isSumObj.isSum){

      if (!this.data.selectedProductCount) {
        wx.showModal({
          title: '提示',
          content: '必须选择商品才能结算',
          showCancel: false,
          confirmColor: '#f95d5b',
          success: function () {
            isSumObj.isSum = false;
            if (wx.hideLoading) {
              wx.hideLoading();
            }
          }.bind(this)
        })
        return false;
      }
     
    }else{
        isSumObj.isSum=true
    }

    if(wx.showLoading){
      wx.showLoading({
        title: '结算中',
        mask:true
      })
    }
    //判断是否既有鲜食演义商品也有其他商品
    var hasNewPro=false;
    var hasOtherPro=false;
    var fresh_food_class=wx.getStorageSync('configData').fresh_food_class||startWith;

    for(var i=0;i<this.data.productList.length;i++){
      var item=this.data.productList[i];
      if(item.isCheck){
        if(fresh_food_class.indexOf(item.dept)!=-1){
          hasNewPro=true
        }else{
          hasOtherPro=true
        }
      }
    }
    if(hasNewPro&&hasOtherPro){
      wx.showModal({
        title: '提示',
        content: '鲜食演义的商品请单独下单（暂不支持鲜食演义与超市其他商品一起下单）。',
        showCancel:false,
        confirmColor:'#f95d5b',
        success:function(){
          isSumObj.isSum=false
        }.bind(this)
      })
      if(wx.hideLoading){
        wx.hideLoading();
      }
      return false;
    }else if(hasNewPro&&!hasOtherPro){
      //鲜食演义任何时候都可以下单
    }else if(!hasNewPro&&hasOtherPro){
      if(this.data.hasUnpaid){
        wx.showModal({
          title: '提示',
          content: '你有待付款订单，不能结算！（只有鲜食演义商品可以继续结算）',
          showCancel:false,
          confirmColor:'#f95d5b',
          success:function(){
            isSumObj.isSum=false
          }.bind(this)
        })
        if(wx.hideLoading){
          wx.hideLoading();
        }
        return false;
      }
      if(this.data.hasUncheck){
        wx.showModal({
          title: '提示',
          content: '你有待核检订单，不能结算！（只有鲜食演义商品可以继续结算）',
          showCancel:false,
          confirmColor:'#f95d5b',
          success:function(){
            isSumObj.isSum=false
          }.bind(this)
        })
        if(wx.hideLoading){
          wx.hideLoading();
        }
        return false;
      }
    }
    if(!this.data.selectedProductCount){
      wx.showModal({
        title: '提示',
        content: '必须选择商品才能结算',
        showCancel:false,
        confirmColor:'#f95d5b',
        success:function(){
          isSumObj.isSum=false;
          if(wx.hideLoading){
            wx.hideLoading();
          }
        }.bind(this)
      })

      return false;
    }

    //judge member level,if user isn't vip,only select 4 products
    var packageObj=wx.getStorageSync('configData').Shopbag;
    var fourProduct=this.data.productList.filter(function(value,index){
      if(value.isCheck&&value.barcode!=packageObj.min.barcode&&value.barcode!=packageObj.mid.barcode&&value.barcode!=packageObj.max.barcode){
        value.quantity=value.quantity.toString();
        return value;
      }
    });
    var userLevel=wx.getStorageSync('member').tier;
    var defaultLevel=wx.getStorageSync('configData').card_level_default;
    //鲜食演义商品不做限制
    if(hasOtherPro&&!hasNewPro){
      if(defaultLevel.indexOf(userLevel)!=-1||!userLevel){
        if(fourProduct.length>wx.getStorageSync('configData').Common.maxSku){
          if(wx.hideLoading){
            wx.hideLoading();
          }
          wx.showModal({
            title:'提示',
            showCancel:false,
            content:'目前仅支持购买'+wx.getStorageSync('configData').Common.maxSku+'件及以下商品。（鲜食演义商品不限件数）',
            success:function(){
              isSumObj.isSum=false
            }.bind(this)
          })
          return;
        }
      }else{
        if(fourProduct.length>50){
          if(wx.hideLoading){
            wx.hideLoading();
          }
          wx.showModal({
            title:'提示',
            showCancel:false,
            content:'目前仅支持金卡会员购买50件及以下的非购物袋商品。（鲜食演义商品不限件数）',
            success:function(){
              isSumObj.isSum=false
            }.bind(this)
          })
          return;
        }
      }
    }

    //get seleced product list's object
    var selectedproductList=this.data.productList.filter(function(value,index){
      if(value.isCheck){
        value.quantity=value.quantity.toString();
        return value;
      }
    });
    //get unSeleced product list's object
    var unSelectedproductList=this.data.productList.filter(function(value,index){
      if(!value.isCheck){
        value.quantity=value.quantity.toString();
        return value;
      }
    });

    var shopId=wx.getStorageSync('configData').shopId;

    var storedUnSelectedCart=wx.getStorageSync('unSelectedCart')||{};

    storedUnSelectedCart[shopId]=unSelectedproductList

    wx.setStorageSync('unSelectedCart',storedUnSelectedCart);

    //判断是鲜食演义还是其他
    var orderType='0';
    if(fresh_food_class.indexOf(selectedproductList[0].dept)!=-1){
      orderType='1';
    }
    var obj={
      url:appInstance.globalData.apiUrl.balanceOrderUrl,
      data:{
        items:JSON.stringify(selectedproductList),
        shopId:wx.getStorageSync('configData').shopId,
        orderType:orderType
      },
      isSumObj:isSumObj,
      success:function(result){
        //store submitData
        var submitOrderArr=result.data.data;
        wx.setStorageSync('submitOrder',submitOrderArr);
        wx.navigateTo({
          url:'/pages/submit-order/submit-order'
        })

      }.bind(this),
      fail:function(err){
        isSumObj.isSum=false
      }.bind(this)
    }
    util.wxRequest(obj);



  },
  goScan:function(e){
    wx.switchTab({
      url:'/pages/scan/scan'
    })

  },
  isExistPackageByIndex:function(index){
    var isExist=false;

    var packageIndex=index;
    var productName='';
    if(packageIndex==1){
      productName="大号购物袋";
    }
    if(packageIndex==2){
      productName="特大号购物袋";
    }
    if(packageIndex==3){
      productName="最大号购物袋";
    }
    var productList=this.data.productList;
    for(var i=0;i<productList.length;i++){
      var item=productList[i];
      if(item.productName==productName){
        item.isCartBag = true;
        isExist=true;
        break;
      }
    }

    return isExist;
  },
  // left slide to delete
  drawStart : function(e){
    this.data.productList.forEach(function (v, i) {
    if (v.isTouchMove)
      v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      productList: this.data.productList
    })
  },
  drawMove : function(e){
    var index = e.currentTarget.dataset.index,//当前索引
    startX = this.data.startX,//开始X坐标
    startY = this.data.startY,//开始Y坐标
    touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
    touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
    //获取滑动角度
    angle = this.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    this.data.productList.forEach(function (v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) {
        return;
      };
      if (i == index) {
        if (touchMoveX > startX){//右滑
          v.isTouchMove = false
        }else{//左滑
          v.isTouchMove = true
        }

      }
    })

    this.setData({
      productList: this.data.productList
    })
  },
  /**
  * 计算滑动角度
  * @param {Object} start 起点坐标
  * @param {Object} end 终点坐标
  */
  angle: function (start, end) {
    var _X = end.X - start.X,
    _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  //delete item
  delItem: function(e){

    var dataBarCode=e.currentTarget.dataset.barcode;
    var serialNumber=e.currentTarget.dataset.serialnumber;

    //if delete current package,must to judge the value of this.data.selectedPakageIndex
    var newSelectedPakageIndex=0;

    var packageBarCodeArr=this.getPackageBarCodeArr();

    var index=packageBarCodeArr.indexOf(dataBarCode);
    if(index!=-1){//if delete package
      var currentPackageIndex=this.data.selectedPakageIndex;
      if((index+1)==currentPackageIndex){
        newSelectedPakageIndex=0;
      }else{
        newSelectedPakageIndex=currentPackageIndex
      }

    }
    var totalPrice=0;
    var selectedProductCount=0;
    var productList = this.data.productList;
    var newProductList = [];

    for(var i in productList){
        var item = productList[i];
        if(item.barcode != dataBarCode){
          newProductList.push(item);

          if(item.isCheck){
            if(item.modqty=='Y'){
              totalPrice=parseFloat(totalPrice)+parseFloat(item.amount)*parseFloat(item.quantity);
            }else{
              totalPrice=parseFloat(totalPrice)+parseFloat(item.amount);
            }

            selectedProductCount++;
          }

        }else{
          if(serialNumber){
            if(serialNumber!=item.serialNumber){
              newProductList.push(item);

              if(item.isCheck){
                if(item.modqty=='Y'){
                  totalPrice=parseFloat(totalPrice)+parseFloat(item.amount)*parseFloat(item.quantity);
                }else{
                  totalPrice=parseFloat(totalPrice)+parseFloat(item.amount);
                }

                selectedProductCount++;
              }
            }
          }
        }
    }


    var allSelected=false;
    if(selectedProductCount==newProductList.length){
      allSelected=true;
    }
    this.setData({
        productList:newProductList,
        noMoreData:newProductList.length>0?this.data.noMoreData:false,
        totalPrice:parseFloat(totalPrice).toFixed(2),
        selectedProductCount:selectedProductCount,
        selectedPakageIndex:newSelectedPakageIndex,
        allSelected:allSelected

     });
    //store cart
    var shopId=wx.getStorageSync('configData').shopId;
    var cart=wx.getStorageSync('cart')||{};

    cart[shopId]=this.data.productList;
    wx.setStorageSync('cart',cart);
  },
  getPackageBarCodeArr:function(){
    var result=[]
    var cache=wx.getStorageSync('configData').Shopbag;
    result.push(cache.min.barcode);
    result.push(cache.mid.barcode);
    result.push(cache.max.barcode);


    return result;
  },
  goToggleShop:function(){
    wx.navigateTo({
      url:"/pages/shop/shop?type='toggle'"
    })
  },
  onLoad:function(){
      this.gotoPage()
  },
  gotoPage: function () {
      if (appInstance.gotoPage) {
          if (appInstance.gotoPage == 'scanCode') {
              wx.navigateTo({
                  url: '/pages/web/web?' + appInstance.gotoPageParam,
              })
          } else if (appInstance.gotoPage == 'parking') {
              var url = 'https://wx.yunhou.com/super/park';
              if (appInstance.gotoPageParam) {
                  url = url + "?" + appInstance.gotoPageParam
              }
              var encodeUrl = encodeURIComponent(url)
              wx.navigateTo({
                  url: '/pages/web/web?url=' + encodeUrl,
              })
          } else if (appInstance.gotoPage == 'invoice') {
              var url = 'https://wx.yunhou.com/super/member/tickets';
              if (appInstance.gotoPageParam) {
                  url = url + "?" + appInstance.gotoPageParam
              }
              var encodeUrl = encodeURIComponent(url)
              wx.navigateTo({
                  url: '/pages/web/web?url=' + encodeUrl,
              })
          }
      }
      appInstance.gotoPage = '';
      appInstance.gotoPageParam = '';
      appInstance.scanShopId = '';
      appInstance.appGlobalData = {}
  },

  onShow:function(){
    isSumObj.isSum=false;
    packageArr=util.getPackageArr();
    var maxSku=maxSku=wx.getStorageSync('configData').Common.maxSku;

    var shopId=wx.getStorageSync('configData').shopId;

    if(wx.showLoading){
      wx.showLoading({
        title:'加载中',
        mask:true
      })
    }
    //copy from onLoad
    var selectedCount=0;
    var totalPrice=0;
    var productList=[];
    var cartCache=wx.getStorageSync('cart')[shopId];
     //此处为购物车数据  在这里面取商品图片地址
     if(cartCache){
      /* productList=cartCache;*/
       for(var i=0;i<cartCache.length;i++){
         var item=cartCache[i];
        var indexCarBag = item.productName.indexOf("购物袋");
        if (indexCarBag > 0) {
          item.isCartBag = true;
        } else {
          item.isCartBag = false;
        }
       productList.push(item);
         if(item.isCheck){
            selectedCount++;
            //判断是否是称重 商品
            if(item.modqty=='Y'){
              totalPrice=parseFloat(totalPrice)+parseFloat(item.amount)*parseFloat(item.quantity);
            }else{
              totalPrice=parseFloat(totalPrice)+parseFloat(item.amount);
            }

         }
       }
     }
     var allSelected=false;
     if(selectedCount==productList.length){
        allSelected=true;
     }
     this.data.packages.small.barcode=wx.getStorageSync('configData').Shopbag.min.barcode;
     this.data.packages.mid.barcode=wx.getStorageSync('configData').Shopbag.mid.barcode;
     this.data.packages.max.barcode=wx.getStorageSync('configData').Shopbag.max.barcode;
     this.setData({
        packages:this.data.packages,
        totalPrice:parseFloat(totalPrice).toFixed(2),
        selectedProductCount:selectedCount,
        productList:productList,
        allSelected:allSelected
     })

    var packages={
      small:{
        price:packageArr[0].price,
        name:packageArr[0].productName
      },
      mid:{
        price:packageArr[1].price,
        name:packageArr[1].productName
      },
      max:{
        price:packageArr[2].price,
        name:packageArr[2].productName
      }
    }
    //judge whether clear cart
    if(wx.getStorageSync('isClearCart')){
      wx.setStorageSync('isClearCart',false);


      this.setData({
        packages:packages,
        maxSku:maxSku,
        selectedPakageIndex:0,
        productList:wx.getStorageSync('cart')[shopId]||[],
        totalPrice:0,
        allSelected:false,
        selectedProductCount:0,
        noMoreData:(wx.getStorageSync('cart')[shopId]||[]).length>0?this.data.noMoreData:false
      })
    }else{
      this.setData({
        packages:packages,
        maxSku:maxSku,
        productList:wx.getStorageSync('cart')[shopId]||[]
      })
    }

    //judge whether has uncheck order:if yes,show identify code
    var obj={
      url:appInstance.globalData.apiUrl.isUnoperatedOrderUrl,
      data:{

      },
      success:function(result){
        var uncheckOrderNumber=result.data.data.uncheckOrder.number;
        var unpaidOrderNumber=result.data.data.unpaidOrder.unpaidCommonOrder;

        // var orderId=result.data.data.uncheckOrder.orderIds[0];
        // var identifyCode=wx.getStorageSync('member').cardNo;

        var newHasUncheck=false;
        var newHasUnpaid=false;
        if(uncheckOrderNumber==0){
          if(unpaidOrderNumber>0){
            newHasUncheck=false;
            newHasUnpaid=true;

          }else{
            newHasUncheck=false;
            newHasUnpaid=false;
          }
        }else{
          if(unpaidOrderNumber>0){
            newHasUncheck=true;
            newHasUnpaid=true;
          }else{
            newHasUncheck=true;
            newHasUnpaid=false;
          }
        }

        this.setData({
          hasUnpaid:newHasUnpaid,
          hasUncheck:newHasUncheck,
          productList:productList,
          selectedProductCount:this.data.selectedProductCount,
          totalPrice:parseFloat(this.data.totalPrice).toFixed(2)
          // orderId:orderId,
          // identifyCode:identifyCode
        })
      }.bind(this),
      fail:function(err){

      }
    };
    util.wxRequest(obj);

    wx.setNavigationBarTitle({
      title: wx.getStorageSync('configData').shopName
    });
  },
  onHide:function(){



  },
  onReachBottom:function(){
    if(this.data.productList.length>=4){
      this.setData({
        noMoreData:true
      })
    }
  }
})
