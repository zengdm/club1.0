// pages/forum/inc/component/publish-btn/publish-btn.js
import { userApi } from '../../../../api/userApi';
/**
 * 发布帖子公共模板
 * 
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    //发帖弹窗的显示隐藏 true为隐藏 false为显示
    publishCurrent: '',
    nodeIndex: 0,
    phoneArr: [],
    // 登录弾层（默认隐藏）
    loginShow: false
  },

  created: function () {
    var that = this;
    that.userApi = new userApi(that);
  },

  /**
   * 组件的方法列表
   */
  methods: {
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
      // console.log(globalData)
      // 统一设置页面模板(直接使用that.data变量报错-待解决)
      that.setData({
        globalData: globalData
      });
    },


    // 显示登录弾层
    loginTips: function (isshow) {
      var that = this;
      that.data.loginShow = isshow;
      that.setData({ loginShow: that.data.loginShow });
    },

    //发帖弹窗显示
    publishBtn: function (e) {
      var that = this;
      that.data.publishCurrent = e.currentTarget.dataset.current;
      //  设置模板变量
      that.setGlobalData();
    },
    //发帖弹窗隐藏
    backBtn: function (e) {
      var that = this;
      that.data.publishCurrent = e.currentTarget.dataset.current;
      //  设置模板变量
      that.setGlobalData();
    },

    //跳转到发动态页
    goDynamic: function () {
      var that = this;

      // 登录信息检测
      var loginStatus = that.userApi.checkLogin();
      if (!loginStatus.status) {
        // 已授权显示登录弹窗
        if (loginStatus.promission) {
          that.loginTips(1);
        }
        return false;
      }

      wx.navigateTo({
        url: '/pages/forum/publish/dynamic/dynamic'
      });

      that.data.publishCurrent = 1;

      setTimeout(function () { that.setGlobalData(); }, 1000);
    },

    //跳转到发长文页
    goLong: function () {
      var that = this;
      // 登录信息检测
      var loginStatus = that.userApi.checkLogin();
      if (!loginStatus.status) {
        // 已授权显示登录弹窗
        if (loginStatus.promission) {
          that.loginTips(1);
        }
        return false;
      }

      wx.navigateTo({
        url: '/pages/forum/publish/long/long'
      });
      that.data.publishCurrent = 1;

      setTimeout(function () { that.setGlobalData(); }, 1000);
    },

    //点击进入相册
    goShowPhoto: function () {
      var that = this;

      // 登录信息检测
      var loginStatus = that.userApi.checkLogin();
      if (!loginStatus.status) {
        // 已授权显示登录弹窗
        if (loginStatus.promission) {
          that.loginTips(1);
        }
        return false;
      }

      var sourceType = "['album']";
      wx.navigateTo({
        url: '/pages/forum/publish/dynamic/dynamic?sourceType=' + sourceType
      });

      that.data.publishCurrent = 1;

      setTimeout(function () { that.setGlobalData(); }, 5000);


    },
    //点击启动相机
    goTakePhoto: function () {
      var that = this;

      // 登录信息检测
      var loginStatus = that.userApi.checkLogin();
      if (!loginStatus.status) {
        // 已授权显示登录弹窗
        if (loginStatus.promission) {
          that.loginTips(1);
        }
        return false;
      }

      var sourceType = "['camera']";
      wx.navigateTo({
        url: '/pages/forum/publish/dynamic/dynamic?sourceType=' + sourceType
      });

      that.data.publishCurrent = 1;

      setTimeout(function () { that.setGlobalData(); }, 5000);


    },
  }
})
