// pages/login/login.js
var Base64 = require('../../lib/base64.js');
var util=require('../../utils/util');
var appInstance = getApp();
var canLogin={
  'status':true
};//user can't click frequently
Page({
  data:{
    errorCode:true,
    errorPhone:true,
    phone:'',
    code:'',
    storeUserInfo:{},
    countDownTime:60,
    isClickCode:false,
    isAgree:true //agree protocol by default
  },
  login:function(){ 
    if(!canLogin.status){
      return;
    }else{
      canLogin.status=false;
    }
    
    if(this.data.errorCode||!this.data.isAgree){
      canLogin.status=true;
      return;
    }else{
      if(wx.showLoading){
        wx.showLoading({
          title:'加载中',
          mask:true
        });
      }
      
      var tokenId=wx.getStorageSync('tokenId');
      var deviceInfo = wx.getSystemInfoSync();
       
      var obj={
        loginStatus:canLogin,
        url:appInstance.globalData.apiUrl.smsLoginUrl,
        data:{
          mobile:this.data.phone,
          sms_captcha:this.data.code,
          deviceInfo:JSON.stringify(deviceInfo)
        },
        success:function(result){

          var member=result.data.data.member;
          wx.setStorageSync('member', member);
          wx.redirectTo({
            url: '/pages/shop/shop'
          })
          
          canLogin.status=true;
          
          
        }.bind(this),
        fail:function(err){
          wx.hideLoading();
        }
      }
      util.wxRequest(obj);
      
    }
    
    
  },
  phoneChange:function(e){
    var reg=/^[1][0-9]{10,10}$/;
    var phone=e.detail.value;
    if(reg.test(phone)){
      //enable code button
      this.setData({
        errorPhone:false,
        phone:phone
      })
    }else{
      this.setData({
        errorPhone:true
      })
    }
  },
  codeChange:function(e){
    var code=e.detail.value;

    var regPhone=/^[1][0-9]{10,10}$/;
    var reg=/^[0-9]{5,5}$/;
    if(reg.test(code)&&regPhone.test(this.data.phone)){
      this.setData({
        errorCode:false,
        code:code
      })
    }else{
      this.setData({
        errorCode:true
      })
    }
  },
  getCode:function(){
    if(this.data.errorPhone){
      return;
    }else{
      var tokenId=wx.getStorageSync('tokenId');

      // var baseAuth="Basic "+Base64.encode('1111:'+tokenId);
      //request
      var obj={
        url:appInstance.globalData.apiUrl.getCaptchaUrl,
        data:{
          mobile:this.data.phone
        },
        success:function(result){
          var countDownTime=result.data.data.smsSurplusSecond;
  
          var time=setInterval(function(){
            if(countDownTime==0){
              clearInterval(time);
              this.setData({
                isClickCode:false,
              })
              return;
            }
            countDownTime--; 
            this.setData({
              isClickCode:true,
              countDownTime:countDownTime
            })
          }.bind(this),1000)
        }.bind(this),
        fail:function(err){
          
        }
      }
      util.wxRequest(obj);

    }
  },
  registerProtocol:function(){
    var isAgree=!this.data.isAgree;
    this.setData({
      isAgree:isAgree
    })
  },
  goRegisterProtocol:function(){
    wx.navigateTo({
      url:'/pages/protocol/protocol'
    })
  },
  getPhoneNumber: function (res) {
    console.log(res.detail.errMsg)
    console.log(res.detail.iv)
    console.log(res.detail.encryptedData)

    if (res.detail.errMsg == "getPhoneNumber:ok") {
      var iv = res.detail.iv;
      var encryptedData = res.detail.encryptedData

      var deviceInfo = wx.getSystemInfoSync();
      var storeUserInfo = wx.getStorageSync('storeUserInfo');
      var code = storeUserInfo['code'];

      var obj = {
        url: appInstance.globalData.apiUrl.wxMobilLoginUrl,
        data: {
          code: code,
          encryptedData: encryptedData,
          iv: iv,
          deviceInfo: JSON.stringify(deviceInfo)
        },
        success: function (result) {
          var member = result.member;
          var tokenId = result.sessionId;
          var mobile = result.mobile;
          wx.setStorageSync('tokenId', tokenId);
          // if user has login,store user information
          if (member != '') {
            wx.setStorageSync('member', member);
            wx.setStorageSync('openId', result.openid);
            console.log('openId:' + result.openid)

            if (this.data.isType) {
              wx.navigateBack({
              })
            } else {
              wx.reLaunch({
                url: '/pages/guide-shop/guide-shop'
              })
            }
          } else {
            wx.hideLoading();
          }

        },
        fail: function (result) {
          wx.hideLoading();
        }
      }
      util.wxRequest(obj);
    }
    
  },
})