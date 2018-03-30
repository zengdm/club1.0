// pages/wx_city/wx_city.js
var app = getApp();
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
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    wx.request({
      url: app.apiHost + '/app/wechat/group-list?type=city&pageSize=999',
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

        that.data.cityGroup = rData.city;
        // that.data.infoService = rData;


        that.setData({//逻辑层到视图层
          cityGroup: that.data.cityGroup
        });

      }
    })
  },


  carDetail: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../detail/detail?id=' + id
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})