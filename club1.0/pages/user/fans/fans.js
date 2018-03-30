// pages/user/fans/fans.js

//调用公共js对象以便调用其方法
var app = getApp();//获取应用实例
import { userApi } from '../../api/userApi.js';
Page({
    /**
     * 页面的初始数据
     */
    data: {

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        wx.showLoading({
            title: '加载中',
        })
        that.userApi = new userApi(that);

        // 加载我的粉丝列表 
        that.userApi.myFans('1', 'cb_myFans');
        //  设置模板变量
        that.setGlobalData();
    },
    cb_myFans: function (res, opt) {
        var that = this;
        setTimeout(function () {
            wx.hideLoading()
        }, 100)
        if (res.code == 0) {
            console.log(res.data)
            if (res.data.length == 0) {
                console.log("非空")
                that.setData({
                    iskong: 1
                })
            } else {
                that.data.fansList = res.data;
            }
        }
        that.setGlobalData();
    },
    addfollow: function (e) {
        //添加关注
        var that = this;
        that.userApi.addFollow(e.currentTarget.dataset.followid, 'cb_addfollow');
    },
    cb_addfollow: function (res, opt) {
        if (res.code == 0) {
            wx.showToast({
                title: '互相关注成功',
                icon: 'success',
                duration: 2000
            })
            var that = this;
            that.userApi.myFans('1', 'cb_myFans');
        }
    },
    removefollow: function (e) {
        //取消关注
        var that = this;
        wx.showModal({
            content: '确定不再关注此人？',
            success: function (res) {
                if (res.confirm) {
                    that.userApi.removeFollow(e.currentTarget.dataset.followid, 'cb_removefollow');
                    that.data.followindex = e.currentTarget.dataset.followindex;
                } else if (res.cancel) {
                }
            }
        })
    },
    cb_removefollow: function (res, opt) {
        if (res.code == 0) {
            wx.showToast({
                title: '取消关注成功',
                icon: 'success',
                duration: 2000
            })
            var that = this;
            that.userApi.myFans('1', 'cb_myFans');
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
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})