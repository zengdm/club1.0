import { wxapi } from '../../../plugins/wxapi';

Page({
  groupid: 0,
  /**
   * 页面的初始数据
   */
  data: {
    masterNumber:'',
    
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.wxapi = new wxapi(that);
    // 接收参数
    that.groupid = options.id;


    //获取群组详情
    that.wxapi.groupDetail(that.groupid, 'cb_detail');
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
  },

  // 处理微信群信息回调方法
  cb_detail: function(res, opt) {
    var that = this;
    
    if (res.code==0) {
      that.data = res.data;
      that.setData({
        wxDetail: res.data,
        groupid: that.groupid
      })
    } else {
      // 返回
    }
  },
  copy:function(e){
    var that = this;
    wx.setClipboardData({
      data: that.data.master_number,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
             wx.showToast({
              title: '复制成功',
            })
          }
        })
      }
    })
  },
  preview:function(){
      var that = this;
      wx.previewImage({
        current: 'that.data.master_qr', // 当前显示图片的http链接
        urls: [that.data.master_qr] // 需要预览的图片http链接列表
      })
  },

  onShareAppMessage: function (options) {
    var that = this;
    if (options.from === 'button') {
      console.log('按钮转发');
    } else {
      console.log('右上角转发');
    }
    return {
      title: that.data.name+'-电动邦新能源车主微信群',
      path: '/pages/group/detail/detail?id=' + that.groupid,
    
      success: function (res) {
        console.log('分享成功');
      },
      fail: function (res) {
        console.log('分享失败');
      }
    }
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