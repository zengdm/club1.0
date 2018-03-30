// tabBar/tabtab/tabtab.js
var app = getApp();
import { userApi } from '../../pages/api/userApi'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading:0,
    // 登录弾层（默认隐藏）
    loginShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.version);
      }
    })
    var that = this;

    that.userApi = new userApi(that);

    // var that = this;
    // that.userApi = new userApi(that);

    // 登录信息检测
    // var loginStatus = that.userApi.checkLogin();
    // console.log(loginStatus);
    // if (!loginStatus.status) {
    //   // 已授权显示登录弹窗
    //   if (loginStatus.promission) {
    //     that.loginTips(1);
    //   }
    //   return false;
    // }
 
  },

  // 显示登录弾层
  loginTips: function (isshow) {
    var that = this;
    that.data.loginShow = isshow;
    that.setData({ loginShow: that.data.loginShow });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  onShow:function(){

    var that = this;

    


    that.data.loading++;
    wx.showLoading({
      title: '加载中...',
    })

    if (that.data.loading==1) {
      wx.navigateToMiniProgram({
        appId: 'wx951b10503e17e2fa',
        path: 'pages/prize/detail/detail',
        extraData: {
          foo: 'bar'
        },
        envVersion: 'develop',
        success(res) {
          // 打开成功
          console.log('成功执行');
          console.log(res);
        },
        complete(resall) {
          wx.switchTab({
            url: '/tabBar/forum/forum',
            complete(res) {
              that.data.loading = 0;
              console.log('tabBar comlll');
            }
          })
          wx.hideLoading();
        },
        fail(result) {
          console.log('失败执行');
          console.log(result);
        }
      })
    }

  },

  /**
   * 生命周期函数--监听页面显示
   */
  // onShow: function () {
  //   var that = this;

  //   that.data.loading++;
  //   wx.showLoading({
  //     title: '加载中...',
  //   })

  //   if (that.data.loading==1) {
  //     wx.navigateToMiniProgram({
  //       appId: 'wx951b10503e17e2fa',
  //       path: 'pages/prize/detail/detail',
  //       extraData: {
  //         foo: 'bar'
  //       },
  //       envVersion: 'develop',
  //       success(res) {
  //         // 打开成功
  //         console.log('成功执行');
  //         console.log(res);
  //       },
  //       complete(resall) {
  //         wx.switchTab({
  //           url: '/tabBar/forum/forum',
  //           complete(res) {
  //             that.data.loading = 0;
  //             console.log('tabBar comlll');
  //           }
  //         })
  //         wx.hideLoading();
  //       },
  //       fail(result) {
  //         console.log('失败执行');
  //         console.log(result);
  //       }
  //     })
  //   }
    
    
  // },

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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})