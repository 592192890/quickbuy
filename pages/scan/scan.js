// pages/scan/scan.js
var util=require('../../utils/util');
var appInstance = getApp();
var startWith=appInstance.globalData.START_WITH; //鲜食演义开头的数字
var hasUncheckOrder=false;
var hasUnpaidOrder=false;
var hasUnpaidCommonOrder=false;
Page({
  data:{
    hasUncheck:false,
    animationData:{},
    dialogData:{
      quantity:1,
      isCheck:true,
      isTouchMove:false,
      isShow:false,
    },
    isShowIcon:false,
    code:'',
    btcheck:false
  },
  cancelCart:function(){
    // 页面隐藏
    this.data.dialogData.isShow=false;
    this.data.dialogData.quantity=1;
    this.setData({
      dialogData:this.data.dialogData,
      code:''
    })
  },
  addToCart:function(){
    var dialogData=this.data.dialogData;

    if (!dialogData.quantity){
      dialogData.quantity='1'
    }
    if(dialogData.modqty=='N'){
      dialogData.sum=parseFloat(dialogData.amount).toFixed(2);
    }else{
      dialogData.sum=(parseFloat(dialogData.price)*parseFloat(dialogData.quantity)).toFixed(2);
    }
    dialogData.price=parseFloat(dialogData.price).toFixed(2);

    //判断是否是鲜食演义
    var fresh_food_class=wx.getStorageSync('configData').fresh_food_class||startWith;
    if(fresh_food_class.indexOf(dialogData.dept)!=-1){
      dialogData.isNew=true;
    }else{
      dialogData.isNew=false;
    }
    //add product to cart
    var shopId=wx.getStorageSync('configData').shopId;
    var cartCache=wx.getStorageSync('cart')||{};
    var currentCartCache=cartCache[shopId]||[];
    //1.如果是称重商品,在购物车新增一条商品记录
    //2.如果是非称重商品，如果之前存在于购物车，在原有基础上增加数量，否则新增一条商品记录
    //称重商品
    if(dialogData.modqty=='N'){
      //判断称重商品是否已经存在于购物车，如果存在序列号serialNumber加一。否则序列号为1
      var isExist=false;
      for(var k=0;k<currentCartCache.length;k++){
        var item=currentCartCache[k];
        if(item.barcode==dialogData.barcode){
          isExist=true;
          break
        }
      }
      if(!isExist){
        dialogData.serialNumber=1;
      }else{
        //判断目前购物车中最大的serialNummber
        var serialNumber=1;
        for(var k=0;k<currentCartCache.length;k++){
          var item=currentCartCache[k];
          if(item.barcode==dialogData.barcode){
            if(item.serialNumber>=serialNumber){
              serialNumber=item.serialNumber;
            }
          }
        }
        dialogData.serialNumber=serialNumber+1;
      }
      currentCartCache.push(dialogData);
      cartCache[shopId]=currentCartCache;
      wx.setStorageSync('cart',cartCache)
    }else{
      //非称重商品
      var isExist=false;
      for(var i=0;i<currentCartCache.length;i++){
        var item=currentCartCache[i];
        //if exist
        if(item.barcode==dialogData.barcode){
          isExist=true;
          var newQuanlity=parseInt(item.quantity)+parseInt(dialogData.quantity);
          if(newQuanlity>100){
            //商品数量超过100
            wx.showModal({
              title: '提示',
              showCancel:false,
              content: '商品数量超过100',
              confirmColor:'#f95d5b',
              success:function(){

              }.bind(this)
            })
            return;
          }else{
            item.quantity=newQuanlity;
            item.sum=(parseFloat(item.sum)+parseFloat(dialogData.sum)).toFixed(2);

            cartCache[shopId]=currentCartCache;
            wx.setStorageSync('cart',cartCache)
          }
          break;
        }
      }
      //如果不存在
      if(!isExist){
        currentCartCache.push(dialogData);
        cartCache[shopId]=currentCartCache;
        wx.setStorageSync('cart',cartCache)
      }

    }
    // 页面隐藏
    this.data.dialogData.isShow=false;
    this.data.dialogData.quantity=1;
    this.setData({
      dialogData:this.data.dialogData,
      code:'',
      isShowIcon:true
    })
    //动画
    var animation = wx.createAnimation({
        duration: 800,
        timingFunction: 'ease',
    })

    // this.animation = animation

    this.setData({
      animationData:animation.top('110%').left('1%').scale(0.5,0.5).step().export()
    })

    setTimeout(function(){
      this.setData({
        isShowIcon:false,
        animationData:animation.top('50%').left('50%').scale(2,2).step().export()
      })
      //recurisve scan
      wx.scanCode({
        success: (res) => {
          var type=res.scanType;
          var obj={
            url:appInstance.globalData.apiUrl.getProductInfoUrl,
            data:{
              barcode:res.result,
              shopId:wx.getStorageSync('configData').shopId
            },
            success:function(result){
              //让serialNumber为undefined
              console.log("扫码结果：：："+JSON(result));
              this.data.dialogData.serialNumber=undefined;

              var dialogData=Object.assign({},this.data.dialogData,result.data.data);
              dialogData.isShow=true;
              dialogData.amount=parseFloat(dialogData.amount).toFixed(2);

              var fresh_food_class=wx.getStorageSync('configData').fresh_food_class||startWith;
              if(fresh_food_class.indexOf(result.data.data.dept)!=-1){
                this.setData({
                  dialogData:dialogData
                })
              }else{
                if(hasUncheckOrder){
                  wx.showModal({
                    title:'提示',
                    showCancel:false,
                    content:"有待核检订单，您不能扫描！（只有鲜食演义商品可以继续扫描）",
                    confirmColor:'#f95d5b'
                  })
                  return;
                }
                if(hasUnpaidCommonOrder){
                  wx.showModal({
                    title:'提示',
                    showCancel:false,
                    content:"有待付款订单，您不能扫描！（只有鲜食演义商品可以继续扫描）",
                    confirmColor:'#f95d5b'
                  })
                  return;
                }

                var isExist=this.isExistScansucceePage();
                wx.setStorageSync('scansucceeproductModel', dialogData);
                if (!isExist) {
                  wx.navigateTo({
                    url:"/pages/scan/scansuccee",
                  })
                }
              }



            }.bind(this),
            fail:function(err){

            }
          }
          util.wxRequest(obj);
        }
      })
      }.bind(this),800)



  },
  minus:function(e){
    //judge whether can weight
    if(e.target.dataset.isweight=='N'||!e.target.dataset.isweight){
      return;
    }
    if(this.data.dialogData.quantity>1){
      this.data.dialogData.quantity--;
      this.setData({
        dialogData:this.data.dialogData
      })
    }

  },
  add:function(e){
    //judge whether can weight
    if(e.target.dataset.isweight=='N'||!e.target.dataset.isweight){
      return;
    }
    if(this.data.dialogData.quantity<100){
      this.data.dialogData.quantity++;
      this.setData({
        dialogData:this.data.dialogData
      })
    }

  },
  changeNumber:function(e){
    //judge whether can weight
    if(e.target.dataset.isweight=='N'||!e.target.dataset.isweight){
      this.setData({
        dialogData:this.data.dialogData
      })
      return;
    }

    var changeNumber=e.detail.value;
    if(/^\d*$/.test(changeNumber)&&changeNumber>=1&&changeNumber<=100){
      this.data.dialogData.quantity=changeNumber;
      this.setData({
        dialogData:this.data.dialogData
      })
    }else{
      wx.showModal({
        title:'提示',
        content:'商品数量必须是1到100的正整数',
        showCancel:false,
        confirmColor:'#f95d5b',
        success:function(){
          this.setData({
            dialogData:this.data.dialogData
          })
        }.bind(this)
      })
    }
  },
  searchCode:function(e){

    if(!util.btcheck(this)){
      return;
    }

    var barcode=this.data.code;
    if(!barcode.trim()){
      wx.showModal({
      title:'提示',
      showCancel:false,
      confirmColor:'#f95d5b',
      content:"请输入商品条形码！",
    })
      return;
    }

    if(wx.showLoading){
      wx.showLoading({
        title: '加载中',
        mask:true
      })
    }
    var checkObj={
      url:appInstance.globalData.apiUrl.isUnoperatedOrderUrl,
      data:{

      },
      success:function(result){
        // var hasUncheckOrder=false;
        // var hasUnpaidOrder=false;
        // var hasUnpaidCommonOrder=false;
        if(result.data.data.uncheckOrder.number>0){
          hasUncheckOrder=true;
        }else{
          hasUncheckOrder=false;
        }
        if(result.data.data.unpaidOrder.number>0){
          hasUnpaidOrder=true
        }else{
          hasUnpaidOrder=false;
        }
        //普通商品的待付款订单数
        if(result.data.data.unpaidOrder.unpaidCommonOrder>0){
          hasUnpaidCommonOrder=true
        }else{
          hasUnpaidCommonOrder=false;
        }
        var obj={
          url:appInstance.globalData.apiUrl.getProductInfoUrl,
          data:{
            barcode:this.data.code,
            shopId:wx.getStorageSync('configData').shopId
          },
          success:function(result){
              if(!result.data.data.quantity){
                result.data.data.quantity='1'
              }
              //让serialNumber为undefined
              this.data.dialogData.serialNumber=undefined;

              var dialogData=Object.assign({},this.data.dialogData,result.data.data);
              dialogData.isShow=true;
              dialogData.amount=parseFloat(dialogData.amount).toFixed(2);

              var fresh_food_class=wx.getStorageSync('configData').fresh_food_class||startWith;
              if(fresh_food_class.indexOf(result.data.data.dept)!=-1){

                var isExist=this.isExistScansucceePage();
                wx.setStorageSync('scansucceeproductModel', dialogData);
                if (!isExist) {
                  wx.navigateTo({
                    url:"/pages/scan/scansuccee",
                  })
                }

              }else{
                if(hasUncheckOrder){
                  wx.showModal({
                    title:'提示',
                    showCancel:false,
                    content:"有待核检订单，您不能扫描！（只有鲜食演义商品可以继续扫描）",
                    confirmColor:'#f95d5b'
                  })
                  return;
                }
                if(hasUnpaidCommonOrder){
                  wx.showModal({
                    title:'提示',
                    showCancel:false,
                    content:"有待付款订单，您不能扫描！（只有鲜食演义商品可以继续扫描）",
                    confirmColor:'#f95d5b'
                  })
                  return;
                }


                var isExist=this.isExistScansucceePage();
                wx.setStorageSync('scansucceeproductModel', dialogData);
                if (!isExist) {
                  wx.navigateTo({
                    url:"/pages/scan/scansuccee",
                  })
                }
              }

          }.bind(this),
          fail:function(err){

          }
        }
        util.wxRequest(obj);
      }.bind(this),
      fail:function(err){

      }
    };
    util.wxRequest(checkObj);




  },
  codeChange:function(e){
    if(e.detail.value){
      this.setData({
        code:e.detail.value
      })
    }else{
      this.setData({
        code:e.detail.value
      })
    }

  },
  scanCode:function(){
    if(wx.showLoading){
      wx.showLoading({
        title: '加载中',
        mask:true
      })
    }
    var checkObj={
      url:appInstance.globalData.apiUrl.isUnoperatedOrderUrl,
      data:{

      },
      success:function(result){

        if(result.data.data.uncheckOrder.number>0){
          hasUncheckOrder=true;
        }else{
          hasUncheckOrder=false;
        }
        //所有的待付款订单数
        if(result.data.data.unpaidOrder.number>0){
          hasUnpaidOrder=true
        }else{
          hasUnpaidOrder=false;
        }
        //普通商品的待付款订单数
        if(result.data.data.unpaidOrder.unpaidCommonOrder>0){
          hasUnpaidCommonOrder=true
        }else{
          hasUnpaidCommonOrder=false;
        }
        wx.scanCode({
          success: (res) => {
            var type=res.scanType;
            var obj={
              url:appInstance.globalData.apiUrl.getProductInfoUrl,
              data:{
                barcode:res.result,
                shopId:wx.getStorageSync('configData').shopId
              },
              success:function(result){
                //让serialNumber为undefined
                this.data.dialogData.serialNumber=undefined;

                var dialogData=Object.assign({},this.data.dialogData,result.data.data);
                dialogData.isShow=true;
                dialogData.amount=parseFloat(dialogData.amount).toFixed(2);

                var fresh_food_class=wx.getStorageSync('configData').fresh_food_class||startWith;
                if(fresh_food_class.indexOf(result.data.data.dept)!=-1){



                    var isExist=this.isExistScansucceePage();
                    wx.setStorageSync('scansucceeproductModel', dialogData);
                    if (!isExist) {
                      wx.navigateTo({
                        url:"/pages/scan/scansuccee",
                      })
                    }





                }else{
                  if(hasUncheckOrder){
                    wx.showModal({
                      title:'提示',
                      showCancel:false,
                      content:"有待核检订单，您不能扫描！（只有鲜食演义商品可以继续扫描）",
                      confirmColor:'#f95d5b'
                    })
                    return;
                  }
                  if(hasUnpaidCommonOrder){
                    wx.showModal({
                      title:'提示',
                      showCancel:false,
                      content:"有待付款订单，您不能扫描！（只有鲜食演义商品可以继续扫描）",
                      confirmColor:'#f95d5b'
                    })
                    return;
                  }
                 // 此处扫描成功后的数据返回
                 var isExist=this.isExistScansucceePage();
                 wx.setStorageSync('scansucceeproductModel', dialogData);
                 if (!isExist) {
                   wx.navigateTo({
                     url:"/pages/scan/scansuccee",
                   })
                 }
                }


              }.bind(this),
              fail:function(err){

              }
            }
            util.wxRequest(obj);
          }
        })
      }.bind(this),
      fail:function(err){

      }
    };
    util.wxRequest(checkObj);


  },
  onShow:function(){



  },
  onHide:function(){
    // 页面隐藏
    this.data.dialogData.isShow=false;
    this.data.dialogData.quantity=1;
    this.setData({
      dialogData:this.data.dialogData
    })
  },
  onUnload:function(){
    // 页面关闭
  },
  isExistScansucceePage:function(){
    var isExist=false;
    var pages = getCurrentPages();
    for (var i = 0; i < pages.length; i++) {
      var pageItem = pages[i];
      if (pageItem.route =="/pages/scan/scansuccee") {
        isExist =true;
      }
    }
    return isExist;
  }
})
