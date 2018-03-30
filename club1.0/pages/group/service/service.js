// pages/service/service.js
import { share } from '../../../plugins/share';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    infoService:'',
    //分享
    shareclientYstart: '',
    shareclientYmove: '',
    winWidth:''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    //初始化分享
    that.shareObj = new share(that);

    // 设置分享内容
    that.shareObj.setShare('电动邦微信客服', '/pages/group/service/service');

    wx.getSystemInfo({
      success: function (res) {
        that.data.winWidth = res.windowWidth;
      }
    });
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    wx.request({
      url: app.apiHost + '/app/wechat/service',
      method: "GET",
      header: {
        'content-type': 'application/json'
      },
      complete: function (res) {
        // console.log(res.data)
      },
      success: function (res) {
        // console.log(res.data.data.service_qr)
        that.data.service_qr = res.data.data.service_qr;

        var rData = res.data.data;
        that.data.infoService = rData;
       

        that.setData({//逻辑层到视图层
          infoService:that.data.infoService
        });

      }
    })
  },

  preview: function () {
    var that = this;
    wx.previewImage({
      current: 'that.data.service_qr', // 当前显示图片的http链接
      urls: [that.data.service_qr] // 需要预览的图片http链接列表
    })
  },

  handletouchstart: function (event) {
    var that = this;
    that.data.shareclientYstart = event.touches[0].clientY;

  },
  handletouchmove: function (event) {
    var that = this;

    that.data.shareclientYmove = event.touches[0].clientY;


    if (that.data.shareclientYstart > that.data.shareclientYmove) {
      //向上滑动
      console.log("向上")
      that.shareObj.showShare();

    } else {
      //向下滑动
      console.log("向下")
      that.shareObj.hideShare();
    }
  },

  // 页面停止，静止3秒
  handletouchend: function () {
    var that = this;
    that.shareObj.handletouchend();
  },


  /**
   * 用户点击右上角分享
   */

  onShareAppMessage: function (options) {
    var that = this;
    if (options.from === 'button') {
      console.log('按钮转发');
    } else {
      console.log('右上角转发');
    }
    return that.shareObj.getShare();
  },
})