// pages/user/follow/follow.js
//调用公共js对象以便调用其方法
var app = getApp();//获取应用实例
import { userApi } from '../../api/userApi.js';
Page({
    /**
     * 页面的初始数据
     */
    data: {
        showTab: true,
        followList: [],
        tagid: '',
        nodeindex: '',
        followindex: '',
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        wx.showLoading({
            title: '加载中',
        })
        that.data.showTab = true;
        that.userApi = new userApi(that);
        // 加载我的关注好友列表 
        that.userApi.myFollow('1', 'cb_myFollow');
        //加载我的关注话题列表
        that.userApi.myFavorite('tag', '1', 'cb_myFavorite');
        //  设置模板变量
        that.setGlobalData();
    },
    cb_myFavorite: function (res, opt) {
        var that = this;
        if (res.code == 0) {
            setTimeout(function () {
                wx.hideLoading()
            }, 200)
            if (res.data.length == 0) {
                that.data.istagsList = false;
            } else {
                that.data.tagsList = res.data;
                that.data.istagsList = true;
            }
        }
        that.setGlobalData();
    },
    cb_myFollow: function (res, opt) {
        var that = this;
        if (res.code == 0) {
            setTimeout(function () {
                wx.hideLoading()
            }, 100)
            if (res.data.length == 0) {
                that.data.isfollowList = false;
            } else {
                that.data.followList = res.data;
                that.data.isfollowList = true;
            }
        }
        console.log(that.data.followList);
        that.setGlobalData();
    },
    removefollow: function (e) {
        //取消关注人
        console.log("取消关注人")
        var that = this;
        wx.showModal({
            content: '确定不再关注此人？',
            success: function (res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                    that.userApi.removeFollow(e.currentTarget.dataset.followid, 'cb_removefollow');
                    that.data.followindex = e.currentTarget.dataset.followindex;
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    cb_removefollow: function (res, opt) {
        console.log(res)
        var that = this;
        if (res.code == 0) {
            var dataid = that.data.followindex;
            var arr = that.data.followList;
            var follownewArr = [];
            for (var i in arr) {
                var item = arr[i];
                if (i != dataid) {
                    follownewArr.push(item);
                }
            }
            that.data.followList = follownewArr;
            wx.showToast({
                title: '取消关注成功',
                icon: 'success',
                duration: 2000
            })
            if (that.data.followList.length == 0) {
                that.data.isfollowList = false;
            }
            that.setGlobalData();
        }
    },
    removetagfollow: function (e) {
        //取消关注标签话题
        var that = this;
        wx.showModal({
            content: '确定不再关注此标签？',
            success: function (res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                    that.userApi.removeFavorite('tag', e.currentTarget.dataset.tagid, '10', 'cb_removetagfollow');
                    that.data.nodeindex = e.currentTarget.dataset.nodeindex;
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    cb_removetagfollow: function (res, opt) {
        var that = this;
        if (res.code == 0) {
            var dataid = that.data.nodeindex;
            var arr = that.data.tagsList;
            var newArr = [];
            for (var i in arr) {
                var item = arr[i];
                if (i != dataid) {
                    newArr.push(item);
                }
            }
            wx.showToast({
                title: '取消关注成功',
                icon: 'success',
                duration: 2000
            })
            that.data.tagsList = newArr;
            if (that.data.tagsList.length == 0) {
                that.data.istagsList = false;
            }
            that.setGlobalData();
        }
    },
    /**
    * 统一设置模板全局变量
    */
    setGlobalData: function () {
        var that = this;
        // 获取全局数据变量
        var globalData = {};
        for (let k in that.data) {
            globalData[k] = that.data[k];
        }
        // 统一设置页面模板(直接使用that.data变量报错-待解决)
        that.setData({
            globalData: globalData
        });
    },
    onTab: function (e) {
        var that = this;
        if (e.currentTarget.dataset.current == 0) {
            that.data.showTab = true;
            //  设置模板变量
            that.setGlobalData();
        } else {
            that.data.showTab = false;
            that.setGlobalData();
        }
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})