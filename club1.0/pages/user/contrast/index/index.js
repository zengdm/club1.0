/***
 * 车型对比页面
 */

import { wxapi } from '../../../../plugins/wxapi';
import { favorite } from '../../../../plugins/favorite';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    fav: {
      // 车型列表
      carList: {},
      // 车型数量
      carNum: 0,
      // 选中的车型数量 
      selCarNum: 0,
      // 复选框选中的车型id列表,可通过selCars.length判断选中车型数量
      selCars: [],
      // 车型ID选中状态
      selIds: {},
      // 默认选中数量
      defaultSelNum:5,
      intervalObj:'',
      intervalNum:0,
      },
    // 选择对比的车型ID
    selCars:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that  = this;
    that.wxapi = new wxapi(that);
    that.fav = new favorite(that);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    // 收藏对象
    that.fav = new favorite(that);
    
    // 获取列表数据
    var favCars = that.fav.getFav('car');
    var carLen = favCars.length;
    // 截取车型id
    var carIds = new Array();
    for (var i=0;i<carLen;i++) {
      var ids = favCars[i].split('_');
      if (ids[0]) {
        carIds.push(ids[0]);
      }
    }

    
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    // 处理过程提示

    wx.showLoading({
      title: '更新中...',
    });
    
    // 请求数据
    that.fav.favList('car', 1, 50, 'cb_car');

    // 过期自动隐藏
    setTimeout(function(){
      // 隐藏loading弹窗
      wx.hideLoading();
    }, 5000);
  },

  /**
   * 车系列表异步回调方法
   */
  cb_car: function(res) {
    var that = this;
    
    // 隐藏loading弹窗
    wx.hideLoading();
    that.data.cb_car = res.data;
    if (res.code==0) {
      // 收藏的车型列表
      that.data.fav.carList = res.data;
      // 对比车型数量
      that.data.fav.carNum = 0;
      
      // 统一设置模板变量
      that.setTipsData();
    } else {
      that.data.fav.carList = [];
      that.data.fav.carNum = 0;
      that.setTipsData();
      // 接口返回错误提示
    }
    // console.log(res);
  },

  // 统一设置车型对比弹窗模板变量
  setTipsData: function() {
    var that = this;
    that.data.fav.selIds = {};

    // 默认选中
    if (that.data.fav.defaultSelNum>0) {
      for (let i in that.data.fav.carList) {
        var pzid = that.data.fav.carList[i]['pzid'];
        if (that.data.fav.selCars.length < that.data.fav.defaultSelNum) {
          that.data.fav.selCars.push(pzid);
        }
      }
      // 取消默认选中(只有页面刷新时默认选中)
      that.data.fav.defaultSelNum = 0;
    }
    

    if (that.data.fav.selCars.length) {
      var len = that.data.fav.selCars.length;
      for(var i=0;i<len;i++) {
        that.data.fav.selIds[that.data.fav.selCars[i]] = 1;
      }
    } else if(that.data.fav.defaultSelNum>0) {
      
    }

    that.setData({
      tipsData: that.data.fav
    });
  },

  /**
   * 监听车型列表复选框选中时间
   */
  bindSelCars: function(e) {
    var that = this;
    that.data.fav.selCars = e.detail.value;
    // 设置模板变量
    that.setTipsData();
  },
  
  /**
   * 删除对比车型
   */
  remCars: function(e) {
    var that = this;
    var selLen = that.data.fav.selCars.length;
    if (selLen > 0) {
      console.log(that.data.fav.selCars.length);
      var carIds = that.data.fav.selCars.join(',');
      wx.showModal({
        title: '友情提示',
        content: '是否删除所选对比车型',
        success: function (res) {
          // 确认删除
          if (res.confirm) {
            // 处理过程提示
            wx.showLoading({
              title: '处理中...',
            })

            // 删除计数
            that.data.fav.intervalNum = 0;
            for (var i = 0; i < selLen; i++) {
              that.fav.remFav('car', that.data.fav.selCars[i], 0, 'cb_remCars');
            }
            
            // 重新加载列表
            that.data.fav.intervalObj = setInterval(function(){
              if (that.data.fav.intervalNum>=selLen) {
                clearInterval(that.data.fav.intervalObj);
                // 清空任务数据
                that.data.fav.intervalNum = 0;
                that.data.fav.intervalObj = '';

                that.data.fav.selCars = [];
                // 隐藏loading弹窗
                wx.hideLoading();
                // 删除成功提示
                wx.showToast({
                  title: '删除成功',
                });
                that.fav.favList('car', 1, 50, 'cb_car');
              }
            }, 100);
          }
          
        }
      });
    }
    
  },

  // 删除回调方法
  cb_remCars: function(res) {
    var that = this;
    that.data.fav.intervalNum++;
    // 收藏的车型数量变更
    if (that.data.fav.carNum > 0) {
      that.data.fav.carNum--;
    }
  },

  goParam: function(e) {
    var that = this;
    var selLen = that.data.fav.selCars.length;
    if (!selLen || selLen>5) {
      var msg = !selLen ? '请选择对比车型' :'最多选择5辆车';
      wx.showToast({
        title: msg,
        image: '../../../images/warning.png'
      });
      return false;
    }

    // 页面跳转
    wx.navigateTo({
      url: '../../../model/parameter/parameter?pzid=' + that.data.fav.selCars.join(','),
    })
  },

  addCar: function (e) {
    var that = this;

    //跳转到新页面，可返回
    wx.navigateTo({
      url: '../add/add'
    })
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

  // 关闭车型对比
  onClose: function() {
    wx.navigateBack({
      delta: 1
    })
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