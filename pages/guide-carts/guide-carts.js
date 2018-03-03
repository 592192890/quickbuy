// pages/unlogin/unlogin.js
var util=require('../../utils/util');
var appInstance = getApp();
Page({
    data: {
  
    },

    onLoad: function (options) {

    },

    directToGuidePage: function(){
        wx.redirectTo({
            url:'/pages/shop/shop'
        })
    }
})