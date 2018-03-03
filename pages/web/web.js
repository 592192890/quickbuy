// pages/web/web.js
var util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        url: '',
        isNeedRefresh: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var url = options.url
        this.data.url = decodeURIComponent(url);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        if (util.compareCurrentVersion('1.6.4') == -1) {
            //当前版本小于1.6.4
            wx.showModal({
                title: '提示',
                showCancel: false,
                content: '请下载最新版本的微信才能打开页面。',
                confirmColor: '#f95d5b',
                success: function () {
                    wx.navigateBack({

                    })
                }.bind(this)
            });
        } else {
            var token = wx.getStorageSync('tokenId')
            var configData = wx.getStorageSync('configData');
            var member = wx.getStorageSync('member')
            if (!token || !member) {
                this.data.isNeedRefresh = true;
                wx.redirectTo({
                    url: '/pages/index/index',
                })
            } else {
                if (this.data.isNeedRefresh) {
                    //正常有登录数据刷新一次web就行
                    //重新刷新web有个bug 刷新一次 就多一次返回2017.11.23
                    this.data.isNeedRefresh = false;
                    var newUrl = ''
                    var url_arr = [];
                    var tempTokenId = util.GetQueryString(this.data.url, 'tokenId')
                    if (!tempTokenId) {
                        url_arr.push('tokenId' + '=' + token);
                    }
                    if (configData) {
                        var tempShopId = util.GetQueryString(this.data.url, 'shopId')
                        console.log('tempShopId:' + tempShopId)
                        if (!tempShopId) {
                            url_arr.push('shopId' + '=' + configData.shopId)
                        }
                    }
                    if (this.data.url.indexOf('?') != -1) {
                        newUrl = this.data.url + '&' + url_arr.join('&');
                    } else {
                        newUrl = this.data.url + '?' + url_arr.join('&');
                    }
                    console.log('encodeURIComponent:' + newUrl);
                    this.setData({
                        url: newUrl
                    })
                }
            }
        }
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

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    }
})