// pages/weChat_group/weChat_group.js
import { share } from '../../../plugins/share';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    that.shareObj.setShare('新能源车车主微信群组-电动邦', '/pages/group/list/list');

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
      url: app.apiHost + '/app/wechat/group-list',
      method: "GET",
      header: {
        'content-type': 'application/json'
      },
      complete: function (res) {
        // console.log(res.data)
      },
      success: function (res) {
        console.log(res.data.data)

        var rData = res.data.data;
        // that.data.hotGroup = rData.hot

        that.data.hotGroup = rData.hot.slice(0, 3);
        that.data.carGroup = rData.car.slice(0, 3);
        that.data.cityGroup = rData.city.slice(0, 3);
        // that.data.infoService = rData;
        console.log(rData.hot.length);
        console.log(rData.car.length);


        that.setData({//逻辑层到视图层
          hotGroup:that.data.hotGroup,
          carGroup: that.data.carGroup,
          cityGroup:that.data.cityGroup,
          hotLen: rData.hot.length,
          carLen: rData.car.length,
        });

      }
    })
  },

  cityGroup: function (e) {

    var that = this;

    //跳转到新页面，可返回
    wx.navigateTo({
      url: '../area/area'
    })
  },

  carDetail: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../detail/detail?id='+id
    });

    // var dataName = e.currentTarget.dataset.name;
    // var dataSummary = e.currentTarget.dataset.summary;
    // var dataMasterName = e.currentTarget.dataset.mastername;
    // var dataMasterNumber = e.currentTarget.dataset.masternumber;
    // var dataMasterQr = e.currentTarget.dataset.masterqr;
    // var dataCover = e.currentTarget.dataset.cover;
    // // console.log(dataName, dataSummary, dataMasterName, dataMasterNumber, dataMasterQr, dataCover);

    // //跳转到新页面，可返回
    // wx.navigateTo({
    //   url: '../wx_detail/wx_detail?name=' + dataName + '&summary=' + dataSummary + '&master_name=' + dataMasterName + '&master_number=' + dataMasterNumber + '&master_qr=' + dataMasterQr + '&cover=' + dataCover
    // })
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


  onShareAppMessage: function (options) {
    var that = this;
    if (options.from === 'button') {
      console.log('按钮转发');
    } else {
      console.log('右上角转发');
    }
    return that.shareObj.getShare();
  },

  hotGroup: function (e) {

    var that = this;

    //跳转到新页面，可返回
    wx.navigateTo({
      url: '../hot/hot'
    })
  },

  carGroup: function (e) {

    var that = this;
    

    //跳转到新页面，可返回
    wx.navigateTo({
      url: '../car/car'
    })
  },

 

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
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
  
  },


})