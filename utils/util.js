var appInstance = getApp();
function getHourMinute(dateStr){
  //iphone不支持yyyy-mm-dd
  dateStr=dateStr.replace(/-/g,'/');
  var date=new Date(dateStr);
  var hour=date.getHours();
  if(hour<10){
    hour="0"+hour.toString();
  }
  var minute=date.getMinutes();
  if(minute<10){
    minute="0"+minute.toString();
  }

  return hour+":"+minute;
}
function calculatePriceBySelectedOrder(selectedOrderList){
  //calculate all selected products' price
    var sumPrice=0;
    selectedOrderList.forEach(function(value,index){
      if(value.isCheck){
        sumPrice=sumPrice+parseFloat(value.sum)
      }
    });
    return sumPrice;
}
// package wx.request for simplifying request
function wxRequest(obj){
  wx.request({
    url:obj.url,
    method:obj.method||'POST',
    header:{
      'content-type': 'application/x-www-form-urlencoded',
      'tokenId':wx.getStorageSync('tokenId')
    },
    data:obj.data,
    success:function(result){
      // console.log(result)
      if(result.statusCode==200){
          if(result.data.error==0){
            obj.success(result);
          }else{
            //if don't login; go to login page;
            if(result.data.error==-100){
              wx.reLaunch({
                url: '/pages/index/index'
              })
              return;
            }
            if(wx.hideLoading){
              wx.hideLoading();
            }
            wx.showModal({
              title:'提示',
              showCancel:false,
              content:result.data.msg,
              confirmColor:'#f95d5b',
              success:function(){
                if(obj.isSumObj){
                  obj.isSumObj.isSum=false;
                }
                var currentPage=getCurrentPages()[getCurrentPages().length -1].route||getCurrentPages()[getCurrentPages().length -1].__route__;
                if(currentPage=="pages/index/index"){
                  setTimeout(function(){
                      wx.redirectTo({
                        url:'/pages/unlogin/unlogin'
                      })
                  }.bind(this),1000)
                }
                obj.fail(result)
              }.bind(this)
            });

          }
      }else{
        wx.showModal({
          title:'错误',
          showCancel:false,
          content:'服务器错误！',
          confirmColor:'#f95d5b',
          success:function(){
            if(obj.isSumObj){
              obj.isSumObj.isSum=false;
            }
            var currentPage=getCurrentPages()[getCurrentPages().length -1].route||getCurrentPages()[getCurrentPages().length -1].__route__;
            if(currentPage=="pages/index/index"){
              setTimeout(function(){
                  wx.redirectTo({
                    url:'/pages/unlogin/unlogin'
                  })
              }.bind(this),1000)
            }
          }.bind(this)
        })
      }
      if(obj.url!=appInstance.globalData.apiUrl.getShopLBSUrl&&obj.url!=appInstance.globalData.apiUrl.balanceOrderUrl&&obj.url!=appInstance.globalData.apiUrl.receiveOrderUrl){
        if(wx.hideLoading){
          wx.hideLoading();
        }
      }
      // if(wx.hideLoading){
      //   wx.hideLoading();
      // }

      if(obj.loginStatus){
        obj.loginStatus.status=true;
      }
    },
    fail:function(err){
      if(wx.hideLoading){
        wx.hideLoading();
      }
      obj.fail&&obj.fail(err);
      if(obj.loginStatus){
        obj.loginStatus.status=true;
      };
      if(obj.locationStatus){
        obj.locationStatus.status=true;
      };
      wx.showModal({
        title:'错误',
        content:'网络异常，请稍后再试!',
        showCancel:false,
        confirmColor:'#f95d5b',
        success:function(){
          var currentPage=getCurrentPages()[getCurrentPages().length -1].route||getCurrentPages()[getCurrentPages().length -1].__route__;
          if(currentPage=="pages/index/index"){
             setTimeout(function(){
                wx.redirectTo({
                  url:'/pages/unlogin/unlogin'
                })
              }.bind(this),1000)
          }
        }
      })
    }
  })
}

function getPackageArr(){
  // small package's id:1; middle:2; big:3
  var packageObj=wx.getStorageSync('configData').Shopbag;
  var smallPackage=Object.assign({},packageObj.min,{
    id:1,
    isCheck:true,
    quantity:1,
    isTouchMove:false
  });
  var middlePackage=Object.assign({},packageObj.mid,{
    id:2,
    quantity:1,
    isCheck:true,
    isTouchMove:false,
  });
  var bigPackage=Object.assign({},packageObj.max,{
    id:3,
    quantity:1,
    isCheck:true,
    isTouchMove:false
  });

  var packageArr=[smallPackage,middlePackage,bigPackage];
  return packageArr;
};
// generate random string
function randomString(len) {
　　len = len || 32;
　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
　　var maxPos = $chars.length;
　　var pwd = '';
　　for (var i = 0; i < len; i++) {
　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
　　}
　　return pwd;
};
function wxRequestPromise(obj) {
    return new Promise((resolve,reject)=>{
      wx.request({
        url:obj.url,
        method:obj.method||'POST',
        header:{
          'content-type': 'application/x-www-form-urlencoded',
          'tokenId':wx.getStorageSync('tokenId')
        },
        data:obj.data,
        success:function(result){
          // obj.success(result);
          resolve(result)
        },
        fail:function(err){
          // obj.fail(err);
          reject(err);
        }
      })
    });

};

/**
 * 防重复点击
 * 在data里定义btcheck:false
 */
function btcheck(self) {
    if (self.data.btcheck){
        //正在点击中
        return false;
    }else{
        //没在点击中
        self.data.btcheck = true;
        setTimeout(function () {
            self.data.btcheck = false;
        }, 800)
        return true;
    }

}

//字典转url参数
function dictToParam(args) {
    var keys = Object.keys(args);
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key] = args[key];
    });
    if (keys.length >= 1) {
        var str = '';
        for (var k in newArgs) {
            str += '&' + k + '=' + newArgs[k];
        }
        str = str.substr(1);
        return str;
    } else {
        return '';
    }
}

//版本比较
//-1系统当前版本小
//0相等
//1系统当前版本大
function compareCurrentVersion(v1) {
    var systemInfo = wx.getSystemInfoSync()
    var v2 = systemInfo.SDKVersion
    if (v1 === v2) {
        return 0
    }
    var arr1 = v1.split('.');
    var arr2 = v2.split('.');

    var minL = Math.min(arr1.length, arr2.length)
    var r = 3
    for (let i = 0; i < minL; i++) {
        if (parseInt(arr1[i]) < parseInt(arr2[i])) {
            r = 1
            break
        } else if (parseInt(arr1[i]) > parseInt(arr2[i])) {
            r = -1
            break
        }
    }
    if (r == 3) {
        var arr1Sum = this.sumArray(arr1);
        var arr2Sum = this.sumArray(arr2);
        if (arr1Sum == arr2Sum) {
            r = 0
        } else {
            if (arr1.length > arr2.length) {
                r = -1
            } else {
                r = 1
            }
        }
    }

    return r
}

//取url参数对应的值
function GetQueryString(url, name) {
    var urlArray = url.split("?")
    if (urlArray.length > 1) {
        var parm = urlArray[1]
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = parm.match(reg);
        if (r != null) return (r[2]); return null;
    } else {
        return null;
    }

}

//字典转url参数
function dictToParam(args) {
    var keys = Object.keys(args);
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key] = args[key];
    });
    if (keys.length >= 1) {
        var str = '';
        for (var k in newArgs) {
            str += '&' + k + '=' + newArgs[k];
        }
        str = str.substr(1);
        return str;
    } else {
        return '';
    }
}

module.exports = {
  calculatePriceBySelectedOrder:calculatePriceBySelectedOrder,
  wxRequest:wxRequest,
  getPackageArr:getPackageArr,
  randomString:randomString,
  wxRequestPromise:wxRequestPromise,
  getHourMinute:getHourMinute,
  btcheck:btcheck,
  dictToParam: dictToParam,
  compareCurrentVersion: compareCurrentVersion,
  GetQueryString: GetQueryString,
  dictToParam: dictToParam
}
