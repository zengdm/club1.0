import xapi from "../../../../utils/xapi"
import { share } from '../../../../plugins/share';
var app = getApp();

Page({
  data: {
    winHeight: '',
    winWidth: '',
    winWidth: 0,
    winHeight: 0,
    // tab切换 
    currentTab: 0,
    // currentTabtype: 0,
    order_type: 5,
    city_id: '',
    pageSize: 10,
    pageOffset: 0,
    //纯
    purePageOffset: 0,
    pureListData: [],
    pureHasMoreData: true,
    //混
    mixPageOffset: 0,
    mixListData: [],
    mixHasMoreData: true, 
    loading: false,
  },
  onLoad: function () {
    var that = this;


    //初始化分享
    that.shareObj = new share(that);

    // 设置分享内容
    that.shareObj.setShare('新能源车补贴排行-电动邦', '/pages/model/rank/subsidy/subsidy'); 
    wx.getSystemInfo({
      success: function (res) {

        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },

  onReady: function () {
    var that = this;
    that.data.city_id = app.city.cityId;
    that.getEndurance(that);
  },


  scroll: function (e) {
    var that = this;
    if (e.detail.deltaY < 0) {
      //向上滑动
      console.log("向上")
      that.shareObj.showShare();

    } else {
      //向下滑动
      console.log("向下")
      that.shareObj.hideShare();
    }
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


  getEndurance: function (that) {
    wx.showLoading({
      title: '加载中',
    })

    if (!that.data.loading) {

      that.data.loading = true;

    if (that.data.order_type == 5) {
      that.data.pageOffset = that.data.purePageOffset;
    } else {
      that.data.pageOffset = that.data.mixPageOffset;
    }

    console.log(that.data.mixHasMoreData);
    var requestUrl = app.apiHost + "/app/xcx/order-car?city_id=" + that.data.city_id + "&pageOffset=" + that.data.pageOffset + "&pageSize=" + that.data.pageSize + "&order_type=" + that.data.order_type;
    console.log(requestUrl)
    xapi.request({
      url: requestUrl,
      data: {},
      method: 'GET' // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    }).then(function (res) {
      // var rList = [];

      if (that.data.order_type == 5) {
        var rList = that.data.pureListData;
      } else {
        var rList = that.data.mixListData;
      }

      var rdata = res.data.data;

      for (var i = 0; i < rdata.length; i++) {
        rList.push(rdata[i]);
      }

      console.log(rList);

      if (that.data.order_type == 5) {
        if (rdata.length < that.data.pageSize) {
          that.data.pureHasMoreData = false
        } else {
          that.data.pureHasMoreData = true;
          that.data.purePageOffset = that.data.purePageOffset + that.data.pageSize;
        }
        that.setData({//逻辑层到视图层
          pureListData: rList
        });
      } else {
        if (rdata.length < that.data.pageSize) {
          that.data.mixHasMoreData = false
        } else {
          that.data.mixHasMoreData = true;
          that.data.mixPageOffset = that.data.mixPageOffset + that.data.pageSize;
        }
        that.setData({//逻辑层到视图层
          mixListData: rList
        });
      }

      that.data.loading = false;

    })

    }
    // 设置过期重置
    setTimeout(function () { that.data.loading = false; }, 5000);

    setTimeout(function () {
      wx.hideLoading()
    },500)
  },
  bindChange: function (e) {
    var that = this;

    that.setData({
      currentTab: e.detail.current
    });
  },
  swichNav: function (e) {
    var that = this;

    if (that.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
      if (e.target.dataset.current == 0) {
        that.data.order_type = 5
        that.setData({
          scrollTop: 0,
        });
        if (that.data.purePageOffset == 0) {
          that.getEndurance(that);
        }
      }
      if (e.target.dataset.current == 1) {
        that.data.order_type = 6
        that.setData({
          scrollTop: 0,
        });
        if (that.data.mixPageOffset == 0) {
          that.getEndurance(that);
        }
      }
    }

  }, 
  scrolltolower: function () {
    // lower
    var that = this;

    if (that.data.order_type == 5) {
      if (that.data.pureHasMoreData == true) {
        that.getEndurance(that);
      }else{
        wx.showToast({
          title: '好厉害，全都看完了',
        })
      }
    } else {
      if (that.data.mixHasMoreData == true) {
        that.getEndurance(that);
      } else{
        wx.showToast({
          title: '好厉害，全都看完了',
        })
      }
    }

//     wx.showToast({
//       title: '',
//     })

    console.log('onReachBottom上拉加载---------------' + that.data.pageOffset)

  },
  gotoSeries: function (e) {
    var data = {
      pinyin: e.currentTarget.dataset.pinyin,
    }
    //跳转到新页面，可返回
    wx.navigateTo({
      url: '../../serie/serie?pinyin=' + data.pinyin
    })
  }
});
