// pages/unlogin/unlogin.js
var util=require('../../utils/util');
var appInstance = getApp();
Page({
  data: {
  
  },
  goIndex:function(){
    var authWX=function(){
      if(wx.openSetting){
        wx.openSetting({
          success: (res) => {
            if(!res.authSetting['scope.userInfo']){
              // authWX();
            }else{
              if(wx.showLoading){
                wx.showLoading({
                  title:'加载中',
                  mask:true
                });
              }
              
              wx.login({
                success:function(res){
                  if (!res.code) {
                    if(wx.hideLoading){
                      wx.hideLoading();
                    }
                    wx.showModal({
                      title:'错误',
                      content:'获取用户登录态失败！('+err.errMsg+')',
                      showCancel:false
                    })
                    return;
                  }
                  var code=res.code;
                  wx.getUserInfo({
                    withCredentials:true,
                    success: function(res){
                      var storeUserInfo={
                        nickName:res.userInfo.nickName,
                        avatarUrl:res.userInfo.avatarUrl
                      }
                      wx.setStorageSync('storeUserInfo', storeUserInfo);
                      
                      var deviceInfo = wx.getSystemInfoSync();
                      
                      var obj={
                        url:appInstance.globalData.apiUrl.wxLoginUrl,
                        data:{
                          code:code,
                          encryptedData:res.encryptedData,
                          iv:res.iv,
                          deviceInfo: JSON.stringify(deviceInfo) 
                        },
                        success:function(result){
                            var member=result.data.data.member;
                            var tokenId=result.data.data.sessionId;

                            // storage tokenId to identify whether login
                            wx.setStorageSync('tokenId', tokenId);
                            // if user has login,store user information
                            if(member){
                              wx.setStorageSync('member', member);
                              setTimeout(function(){
                                wx.redirectTo({
                                  url:'/pages/shop/shop'
                                })

                              },1000)

                            }else{
                              setTimeout(function(){
                                wx.redirectTo({
                                  url:'/pages/login/login'
                                })
                              }.bind(this),1000)
                            }
                        }
                      }
                      util.wxRequest(obj);
                      
                    },
                    fail:function(err){
                      if(wx.hideLoading){
                        wx.hideLoading();
                      }
                      if(err.errMsg!="getUserInfo:fail auth deny"){
                        wx.showModal({
                          title:'错误',
                          content:err.errMsg,
                          showCancel:false
                        })
                      }
                    }
                  })
                },
                fail:function(err){
                  if(wx.hideLoading){
                    wx.hideLoading();
                  }
                  wx.showModal({
                    title:'错误',
                    content:'网络异常，请稍后再试!('+err.errMsg+')',
                    showCancel:false
                  })
                }
              })
            }
          },
          fail:function(err){
            wx.showModal({
              title:'错误',
              content:'网络异常，请稍后再试!('+err.errMsg+')',
              showCancel:false
            })
          }
        })
      }else{
        wx.showModal({
          title:'提示',
          content:'请升级微信版本，谢谢!',
          showCancel:false
        })
      }
      
    }
    authWX();
  },
  goHelpCenter:function(){
    wx.navigateTo({
      url:'/pages/help/help'
    })
  },
  onLoad: function (options) {
  
  }
})