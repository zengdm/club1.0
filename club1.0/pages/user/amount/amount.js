import xapi from "../../../utils/xapi"
import { favorite } from "../../../plugins/favorite";
import { wxapi } from "../../../plugins/wxapi";



var app = getApp();
Page({
    data: {
        amount:'',
        authorid:'',
        KeyInput:'',
      btnColor:true,
      setmoney:true

  },
  onLoad: function (options) {
    var that = this;
    // 接口类
    that.wxapi = new wxapi(that);
    that.data.amount = options.amount;
    that.data.authorid = options.authorid;
    // that.data.amount = 140;
    console.log(that.data.amount)
    that.setData({
        amount: that.data.amount,
    });
  },

  onReady: function () {
    var that = this;
    // 设置屏幕
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);

        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },
  bindKeyInput:function(e){
      var that = this;
      that.data.KeyInput = e.detail.value.trim();
      if (that.data.KeyInput == '') {
          that.setData({
              btnColor: true
          });
      } else {
          that.setData({
              btnColor: false
          });
      }
  },
  setsubmit: function () {
      var that = this;
      if (that.data.btnColor == false) {
          wx.request({
              url: app.apiHost + "/user/withdraw/apply",
              data: {
                  uid: that.data.authorid,
                  amount: that.data.amount,
                  wechat_num: that.data.KeyInput
              },
              header: {
                  'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                  console.log(res.data.code)
                  if (res.data.code == 0){
                      that.setData({
                          setmoney: false,
                      });
                  }
              }
          })
      } else{
          wx.showToast({
              title: '填写的微信号哦~',
              duration: 2000,
              image: '/pages/images/warning.png'
          });
      }
  },
  getknow:function(){
      var that = this;
      wx.switchTab({
          url: '../../user/self/self'
      })

  }


});
